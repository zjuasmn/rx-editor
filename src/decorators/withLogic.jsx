import { mapValues } from 'lodash'
import React from 'react'
import * as createOperators from 'rxjs'
import { BehaviorSubject, Observable, Subject } from 'rxjs'
import * as operators from 'rxjs/operators'

export function withLogic(options) {
  return InnerComponent => class Logic extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = { watches$: {} }

      let initializing = true
      const set = (key) => (value) => initializing
        ? this.state[key] = value
        : this.setState({ [key]: value })

      const nodes = mapValues(
        (typeof options.nodes === 'function'
            ? options.nodes(props)
            : options.nodes
        ),
        (config, name) => {
          if (config instanceof Observable) {
            return config
          }
          if (!config.type) {
            this.state[name] = config
            return config
          }
          if (config.ref) {
            switch (config.type) {
              case 'Subject':
              case 's':
                return props[config.ref]
              case 'BehaviourSubject':
              case 'var':
              case 'v': {
                if (config.watch) {
                  const ret = new BehaviorSubject(props[config.ref])
                  this.state.watches$[config.ref] = ret
                  return ret
                }
                return props[config.ref]
              }
              default:
                throw new Error(`invalid config: ${JSON.stringify(config)}`)
            }
          }
          switch (config.type) {
            case 'Subject':
            case 's':
              return new Subject()
            case 'BehaviourSubject':
            case 'var':
            case 'v':
              return new BehaviorSubject(config.initial)
            case 'Const':
            case 'c': {
              this.state[name] = config.initial
              return config.initial
            }
            default:
              throw new Error(`invalid config: ${JSON.stringify(config)}`)
          }
        },
      )
      this.nodes = nodes
      const parseSource = (s => typeof s === 'string'
          ? nodes[s]
          : createOperators[s.type](s.nodes.map(n => nodes[n]))
      )
      this.edges = (
        typeof options.edges === 'function'
          ? options.edges(props, { nodes, set })
          : options.edges
      ).map(value => {
          if (value instanceof Observable) {
            return value
          }
          return parseSource(value.source).pipe(
            ...(value.pipes || []).map(
              ({ type, args }) => operators[type](
                ...(args.map((arg) => {
                  switch (arg.type) {
                    case 'expression':
                      return new Function(...(arg.refs || []), `return (${arg.value})`)(
                        ...(arg.refs || []).map(ref => nodes[ref])
                      )
                    case 'const':
                    default:
                      return arg.value
                  }
                })))
            ),
            operators.tap(
              nodes[value.sink] instanceof Subject
                ? nodes[value.sink]
                : set(value.sink)
            ),
          )
        }
      ).map($ => $.subscribe())
      initializing = false
    }

    componentWillUnmount() {
      this.edges.forEach($ => $.unsubscribe())
    }

    static getDerivedStateFromProps(props, state) {
      mapValues(state.watches$, (s, key) => props[key] !== s.value && s.next(props[key]))
      return state
    }

    render() {
      return <InnerComponent nodes={this.nodes} {...this.props} {...this.state} />
    }
  }
}
