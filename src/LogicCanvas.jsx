import cytoscape from 'cytoscape'
import dagre from 'cytoscape-dagre'
import { flatten, toPairs } from 'lodash'
import * as React from 'react'
import { Subject } from 'rxjs'
import { tap, filter } from 'rxjs/operators'
import { selectedInstanceKey$, selectedLogicName$ } from 'services/state'
import { NodeType } from 'types/logic'
import { withLogic } from './decorators/withLogic'
import edgehandles from 'cytoscape-edgehandles'
import { trigger$ } from 'connector'

cytoscape.use(edgehandles)
cytoscape.use(dagre)

const style = [
  {
    selector: 'node',
    style: {
      'transition-property': 'background-color',
      'transition-duration': '0.5s',
      'background-color': '#555',
      'text-outline-color': '#555',
      'text-outline-width': '2px',
      'color': '#fff',
      'text-valign': 'center',
      'text-halign': 'center',
      'content': 'data(label)',
    },
  }, {
    selector: 'node[type = "pipe"]',
    style: {
      'background-color': NodeType.OPERATOR.color,
      height: 24,
      width: 80,
      shape: 'round-rectangle',
      'label': 'data(label)',
    },
  }, {
    selector: 'node[type = "s"]',
    style: {
      'background-color': NodeType.SIGNAL.color,
      shape: 'diamond',
      'label': 'data(label)',
    },
  }, {
    selector: 'node[type = "v"]',
    style: {
      'background-color': NodeType.VARIABLE.color,
      height: 48,
      width: 48,
      shape: 'octagon',
      'label': 'data(label)',
    },
  }, {
    selector: 'node[type = "m"]',
    style: {
      'background-color': NodeType.MERGE.color,
      shape: 'ellipse',
      width: 80,
      height: 32,
      'label': 'data(label)',
    },
  }, {
    selector: 'node[type = "c"]',
    style: {
      'background-color': NodeType.STATE.color,
      shape: 'rectangle',
      width: 60,
      height: 40,
      'label': 'data(label)',
    },
  }, {
    selector: 'edge',
    style: {
      'width': 3,
      'line-color': '#ccc',
      'curve-style': 'bezier',
      'target-arrow-color': 'ref',
      'target-arrow-shape': 'triangle',
    },
  }, {
    selector: '.activate',
    style: {
      'background-color': 'red',
      'transition-duration': '0s',
    },
  }, {
    selector: ':selected',
    style: {
      'border-color': 'blue',
      'border-width': 2,
    },
  }]

const elementsFromLogic = ({ nodes, edges }) => ([
  ...toPairs(nodes).map(([key, value]) => ({
    data: { id: key, label: key, type: value.type, config: value },
  })),
  ...flatten(
    edges.map(({ source, pipes = [], target }, edgeIndex) => {
      const sourceId = typeof source === 'string' ? source : edgeIndex

      // if (typeof source !== 'string') {
      //   source.nodes.map((name) => ({})))
      // }
      return [
        ...(typeof source === 'string'
            ? []
            : [
              { data: { id: edgeIndex, label: source.type, type: 'm' } },
              ...source.nodes.map((n, i) => ({
                data: {
                  id: `${edgeIndex}._${i}`,
                  source: n,
                  target: edgeIndex,
                },
              })),
            ]
        ),
        ...flatten(pipes.map((pipe, index) => ([
            { data: { id: `${edgeIndex}.${index}`, type: 'pipe', label: pipe.type, config: pipe } },
            {
              data: {
                id: `${edgeIndex}.${index}_l`,
                source: index ? `${edgeIndex}.${index - 1}` : sourceId, target: `${edgeIndex}.${index}`,
              },
            },
          ]),
        )),
        ...(pipes.length === 0
            ? [{ data: { id: `${edgeIndex}.0_l`, source: sourceId, target: target } }]
            : [{
              data: {
                id: `${edgeIndex}.${pipes.length}_l`,
                source: `${edgeIndex}.${pipes.length - 1}`,
                target: target,
              },
            }]
        )]
    }),
  ),
])

class LogicCanvas extends React.PureComponent {
  divRef = React.createRef()

  mountCy = () => {
    const { cy } = this.props
    console.log('mount')
    cy.mount(this.divRef.current)
    cy.resize()
    cy.reset()
    cy.center()
    cy.layout({
      name: 'dagre',
      nodeDimensionsIncludeLabels: true,
    }).run()
    // cy.edgehandles({
    //   handleNodes: '[type="v"]',
    //   handlePosition: () => 'middle bottom',
    // })
  }

  componentDidMount() {
    this.mountCy()
  }

  componentDidUpdate(prevProps) {
    if (!this.props.cy.container()) {
      this.mountCy()
    }
  }

  componentWillUnmount() {
    this.props.cy.unmount()
    this.props.cy.destroy()
  }

  render() {
    window.cy = this.props.cy
    return (
      <div ref={this.divRef} style={{ width: '100%', height: '100%' }} id="cy" />
    )
  }
}


export default withLogic({
  nodes: {
    data$: { type: 'v', watch: 'logic' },
    onSelect$: new Subject(), // { type: 's', ref: 'onSelect$' },
    cy$: { type: 'v' },
    cy: { type: 'c' },
  },
  edges: (props, { nodes: { cy$, onSelect$ } }) => ([
    {
      source: 'data$',
      pipes: [
        {
          type: 'map',
          args: [{
            type: 'const',
            value: (data) => cytoscape({
              elements: elementsFromLogic(data),
              style,
            }),
          }],
        }, {
          type: 'tap',
          ref: 'cy$',
          args: [{
            type: 'const',
            value: '() => {' +
              'if (cy$.value) {' +
              '  cy$.value.unmount()' +
              '  cy$.value.destroy()' +
              '}',
          }],
        },
      ],
      target: 'cy$',
    },
    { source: 'cy$', target: 'cy' },

    cy$.pipe(
      tap(console.log),
      filter(cy => cy),
      tap(cy => {
        cy.on('tap', 'node', e => {
          e.target.select()
          onSelect$.next(e.target.data())
        })
      }),
    ),
    trigger$.pipe(
      tap(({ name, key }) => console.log('flash', name, selectedLogicName$.value, key, selectedInstanceKey$.value)),
      filter(({ name, key }) => (name === selectedLogicName$.value && key.toString() === selectedInstanceKey$.value)),
      tap(({ id }) => console.log('flash', id)),
      tap(({ id }) => cy$.value.$id(id).flashClass('activate')),
    ),
  ]),
})(LogicCanvas)
