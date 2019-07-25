import { mapValues, toPairs } from 'lodash'
import React from 'react'
import * as createOperators from 'rxjs'
import { BehaviorSubject, Observable, Subject } from 'rxjs'
import { filter } from 'rxjs/operators'
import * as operators from 'rxjs/operators'

const NAME = 'PAT$$'
window[NAME] = {
  trigger$: new Subject(),                 // { name, key, id, e }
  hotUpdate$: new Subject(),               // logicConfig
  ref$: new BehaviorSubject({}),    // { name: { key: component } }
  logic$: new BehaviorSubject({}),  // { name: logicConfig }
}

const buildNodes = (nodesConfig, props, set, watch) => mapValues(
  (typeof nodesConfig === 'function'
      ? buildNodes(nodesConfig(props), props, set, watch)
      : nodesConfig
  ),
  (config, name) => {
    if (config instanceof Observable) {
      return config
    }
    if (!config.type) {
      set(name)(config)
      return config
    }

    switch (config.type) {
      case 's':
        return config.ref ? props[config.ref] : new Subject()
      case 'v': {
        if (config.ref) {
          if (config.watch) {
            const ret = new BehaviorSubject(props[config.ref])
            watch(config.ref, ret)
            return ret
          }
          return props[config.ref]
        }
        return new BehaviorSubject(config.initial)
      }
      case 'c': {
        set(name)(config.initial)
        return config.initial
      }
      default:
        throw new Error(`invalid config: ${JSON.stringify(config)}`)
    }
  },
)

const buildEdges = (edgesConfig, nodes, props, set) => {
  const parseSource = (
    s => typeof s === 'string'
      ? nodes[s]
      : createOperators[s.type](s.nodes.map(n => nodes[n]))
  )
  return (
    typeof edgesConfig === 'function'
      ? buildEdges(edgesConfig(props, { nodes, set }), nodes, props, set)
      : edgesConfig
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
          nodes[value.target] instanceof Subject
            ? nodes[value.target]
            : set(value.target)
        ),
      )
    }
  )
}

export function withLogic(logic) {
  let instanceCount = 0

  return InnerComponent => class Logic extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = { watches$: {} }

      let initializing = true
      const set = (key) => (value) => initializing
        ? this.state[key] = value
        : this.setState({ [key]: value })
      const watch = (id, v) => {
        this.state.watches$[id] = v
      }
      this.nodes = buildNodes(logic.nodes, props, set, watch)
      const gao = () => {
        this.edgesSubscriptions = buildEdges(logic.edges, this.nodes, props, set).map($ => $.subscribe())
        this.triggerSubscriptions = toPairs(this.nodes)
          .filter(([, node]) => node instanceof Observable)
          .map(([id, node]) => node
            .subscribe(e => {
              if (props.$key) {
                window[NAME].trigger$.next({ name: logic.name, key: props.$key, id, e })
              }
            }))
      }

      gao()
      this.hotUpdateSubscription = window[NAME].hotUpdate$.pipe(
        filter(({ name, key }) => name === logic.name && key === props.$key)
      ).subscribe((logic) => {
        this.triggerSubscriptions.forEach($ => $.unsubscribe())
        this.edgesSubscriptions.forEach($ => $.unsubscribe())

        this.nodes = mapValues(
          buildNodes(logic.nodes, props, set),
          (value, key) => {
            if (this.nodes[key] instanceof BehaviorSubject
              && value instanceof BehaviorSubject) {
              value.next(this.nodes[key].value)
            }
          })
        gao()
      })
      initializing = false
    }

    componentDidMount() {
      // update logic$
      instanceCount += 1
      if (instanceCount === 1) {
        window[NAME].logic$.next({ ...window[NAME].logic$.value, [logic.name]: logic })
      }
      // update ref$
      if (this.props.$key) {
        const { ref$ } = window[NAME]
        ref$.next({
          ...ref$.value,
          [logic.name]: {
            ...ref$.value[logic.name],
            [this.props.$key]: this,
          }
        })
      }
    }

    componentWillUnmount() {
      this.triggerSubscriptions.forEach($ => $.unsubscribe())
      this.edgesSubscriptions.forEach($ => $.unsubscribe())
      this.hotUpdateSubscription.unsubscribe()
      // update logic$
      instanceCount -= 1
      if (instanceCount === 0) {
        delete window[NAME].logic$.value[logic.name]
        window[NAME].logic$.next(window[NAME].logic$.value)
      }
      // update ref$
      if (this.props.$key) {
        const { ref$ } = window[NAME]
        delete ref$.value[logic.name][this.props.$key]
        ref$.next(ref$.value)
      }
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
