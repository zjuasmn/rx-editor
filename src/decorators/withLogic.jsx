import { fromPairs, isPlainObject, mapValues, toPairs } from 'lodash'
import React from 'react'
import * as createOperators from 'rxjs'
import { BehaviorSubject, Observable, Subject } from 'rxjs'
import * as operators from 'rxjs/operators'
import { filter } from 'rxjs/operators'
import { DEBUG, logic$, ref$, hotUpdate$, trigger$ } from '../connector'

const buildNode = ({ nodeId, nodeConfig, props, set, watch }) => {
  if (nodeConfig instanceof Observable) {
    return nodeConfig
  }
  if (!isPlainObject(nodeConfig) || !nodeConfig.type) {
    set(nodeId)(nodeConfig)
    return nodeConfig
  }
  const name = nodeConfig.name || nodeId

  switch (nodeConfig.type) {
    case 's':
      return nodeConfig.ref ? props[nodeConfig.ref] : new Subject()
    case 'v': {
      if (nodeConfig.watch) {
        const ret = new BehaviorSubject(props[nodeConfig.watch])
        watch(nodeConfig.watch, ret)
        return ret
      }
      if (nodeConfig.ref) {
        return props[nodeConfig.ref]
      }
      return new BehaviorSubject(nodeConfig.initial)
    }
    case 'c': {
      set(name)(nodeConfig.initial)
      return nodeConfig.initial
    }
    default:
      throw new Error(`invalid config: ${JSON.stringify(nodeConfig)}`)
  }
}

const buildNodes = ({ nodesConfig, props, set, watch }) => mapValues(
  (typeof nodesConfig === 'function'
      ? buildNodes({ nodesConfig: nodesConfig(props, { set, watch }), props, set, watch })
      : nodesConfig
  ),
  (nodeConfig, nodeId) => buildNode({ nodeId, nodeConfig, props, set, watch }),
)

const buildSource = ({ edgeId, config, nodes, disabledNode, disabledEdge }) => {
  if (DEBUG) {
    if (typeof config === 'string') {
      return nodes[config].pipe(
        filter(() => !disabledNode[config] && !disabledEdge[edgeId])
      )
    }
    return createOperators[config.type](
      config.nodes.map(nodeId => nodes[nodeId].pipe(
        filter(() => !disabledNode[nodeId] && !disabledEdge[edgeId]))
      )
    )
  }
  return typeof config === 'string'
    ? nodes[config]
    : createOperators[config.type](
      config.nodes.map(nodeId => nodes[nodeId])
    )
}

const buildEdge = ({ index, edgeConfig, nodes, set, disabledNode, disabledEdge }) => {
  if (edgeConfig instanceof Observable) {
    return edgeConfig
  }

  const source = buildSource({
    config: edgeConfig.source,
    nodes,
    edgeId: edgeConfig.id || index.toString(),
    disabledNode,
    disabledEdge
  })

  const { pipes = [], target } = edgeConfig
  return source.pipe(
    ...pipes.map(
      ({ type, args }) => operators[type](
        ...(args.map((arg) => {
          switch (arg.type) {
            case 'expression':
              if (DEBUG) {
                return new Function(...(arg.refs || []), `try { return (${arg.value}) } catch(e) { console.log(e, arguments, arg.value) }`)(
                  ...(arg.refs || []).map(ref => nodes[ref])
                )
              }
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
      nodes[target] instanceof Subject
        ? nodes[target]
        : set(target)
    ),
  )
}

const buildEdges = ({ edgesConfig, nodes, props, set, disabledNode, disabledEdge }) => (
  typeof edgesConfig === 'function'
    ? buildEdges({ edgesConfig: edgesConfig(props, { nodes, set }), nodes, props, set, disabledNode, disabledEdge })
    : edgesConfig
).map((edgeConfig, index) => buildEdge({ index, edgeConfig, nodes, set, disabledNode, disabledEdge }))


export function withLogic(logic) {
  let instanceCount = 0
  if (DEBUG) {
    // update logic$
    logic$.next({ ...logic$.value, [logic.name]: logic })
  }

  return InnerComponent => class Logic extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = { $watches: {} }
      this.disabledNode = {}
      this.disabledEdge = {}
      let initializing = true
      const set = key => value => (
        initializing
          ? this.state[key] = value
          : this.setState({ [key]: value })
      )
      const watch = (id, v) => {
        this.state.$watches[id] = v
      }
      this.nodes = buildNodes({ nodesConfig: logic.nodes, props, set, watch })
      this.edges = buildEdges({
        edgesConfig: logic.edges,
        props,
        set,
        nodes: this.nodes,
        disabledNode: this.disabledNode,
        disabledEdge: this.disabledEdge
      })
      if (DEBUG) {
        if (props.$key) {
          this.triggerSubscriptions = toPairs(this.nodes)
            .filter(([, node]) => node instanceof Observable)
            .map(([id, node]) => node
              .subscribe(e => {
                trigger$.next({ name: logic.name, key: props.$key, id, e })
              }))
        }
        this.hotUpdateSubscription = hotUpdate$.pipe(
          filter(({ name, key }) => name === logic.name && key === props.$key)
        ).subscribe(({ updateType, args, logic }) => {
          switch (updateType) {
            case 'node.disable':
              this.disabledNode[args.id] = true
              break
            case 'node.enable':
              delete this.disabledNode[args.id]
              break
            case 'node.create':
              this.nodes[args.id] = buildNode(args.config)
              break
            case 'node.remove':
              delete this.nodes[args.id]
              break
            case 'node.update':
            case 'edge.disable':
              this.disabledEdge[args.id] = true
              break
            case 'edge.enable':
              delete this.disabledEdge[args.id]
              break
            case 'edge.create':
            case 'edge.remove':
            case 'edge.update':
            case 'logic.restore':
            default:
              console.log(updateType, args)
          }
        })
      }

      this.edgeSubscriptions = this.edges.map($ => $.subscribe())
      initializing = false
    }

    componentDidMount() {
      if (!DEBUG) {
        return
      }
      instanceCount += 1
      // update ref$
      if (this.props.$key) {
        ref$.next({
          ...ref$.value,
          [logic.name]: {
            ...ref$.value[logic.name],
            [this.props.$key]: true,
          }
        })
      }
    }

    componentWillUnmount() {

      this.edgeSubscriptions.forEach($ => $.unsubscribe())
      if (DEBUG) {
        if (this.props.$key) {
          this.triggerSubscriptions.forEach($ => $.unsubscribe())
        }
        this.hotUpdateSubscription.unsubscribe()
        // update logic$
        instanceCount -= 1
        // update ref$
        if (this.props.$key) {
          ref$.next(fromPairs(
            toPairs(ref$.value)
              .map(([name, refs]) => (name === logic.name
                  ? [name, fromPairs(toPairs(refs).filter(([key]) => key !== this.props.$key))]
                  : [name, refs]
              ))))
        }
      }
    }

    static getDerivedStateFromProps(props, state) {
      mapValues(state.$watches, (s, key) => props[key] !== s.value && s.next(props[key]))
      return state
    }

    render() {
      const { $watches, ...state } = this.state
      return <InnerComponent {...this.props} {...state} $nodes={this.nodes} />
    }
  }
}
