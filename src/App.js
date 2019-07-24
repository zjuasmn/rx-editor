import React from 'react'
import cytoscape from 'cytoscape'
import dagre from 'cytoscape-dagre'
import todoListLogic from './TodoList.logic'
import { toPairs, flatten } from 'lodash'
import TodoList from './Todo'

cytoscape.use(dagre)

export default class App extends React.PureComponent {
  componentDidMount() {
    const elements = [ // list of graph elements to start with
      ...toPairs(todoListLogic.nodes).map(([key, value]) => ({
        data: { id: key, label: key, type: value.type },
      })),
      ...flatten(
        todoListLogic.edges.map(({ source, pipes = [], sink }, edgeIndex) => {
          const sourceId = typeof source === 'string' ? source : edgeIndex

          // if (typeof source !== 'string') {
          //   source.nodes.map((name) => ({})))
          // }
          return [
            ...(typeof source === 'string'
                ? []
                : [
                  { data: { id: edgeIndex, label: source.type } },
                  ...source.nodes.map((n, i) => ({
                    data: {
                      id: `${edgeIndex}.m${i}`,
                      source: n,
                      target: edgeIndex,
                    },
                  })),
                ]
            ),
            ...flatten(pipes.map((pipe, index) => ([
                { data: { id: `${edgeIndex}.${index}`, type: 'pipe', label: pipe.type } },
                {
                  data: {
                    id: `${edgeIndex}.${index}_l`,
                    source: index ? `${edgeIndex}.${index - 1}` : sourceId, target: `${edgeIndex}.${index}`,
                  },
                },
              ]),
            )),
            ...(pipes.length === 0
                ? [{ data: { id: `${edgeIndex}.0_l`, source: sourceId, target: sink } }]
                : [{
                  data: {
                    id: `${edgeIndex}.${pipes.length}_l`,
                    source: `${edgeIndex}.${pipes.length - 1}`,
                    target: sink,
                  },
                }]
            )]
        }),
      ),
    ]
    const cy = cytoscape({
      container: document.getElementById('cy'),
      elements,
      style: [{
        selector: 'node',
        style: {
          'transition-property': 'background-color',
          'transition-duration': '0.5s',
          "background-color": "#555",
          "text-outline-color": "#555",
          "text-outline-width": "2px",
          "color": "#fff",
          "text-valign": "center",
          "text-halign": "center",
          'content': 'data(label)',
        },
      }, {
        selector: 'edge',
        style: {
          'width': 2,
          'line-color': '#ccc',
          'target-arrow-color': '#ccc',
          'target-arrow-shape': 'triangle-tee',
        },
      }, {
        selector: '[type= "pipe"]',
        style: {
          width: 16,
          height: 16,
        }
      }, {
        selector: '.activate',
        style: {
          'background-color': 'red',
          'transition-duration': '0s',
        }
      }, {
        selector: ':selected',
        style: {
          'border-color': 'blue',
          'border-width': 2,
        }
      }],
      layout: {
        name: 'dagre',
      },
    })

    window.cy = cy

    cy.on('tap', 'node', (e) => e.target.select())
    window.triggerConnect$.subscribe(({ name, e }) => {
      cy.$id(name).flashClass('activate')
    })
  }

  render() {

    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
        <div style={{ flex: 1 }}>
          <TodoList initialTodos={JSON.parse(localStorage.getItem('todos')) || []} />
        </div>
        <div id="cy" style={{ flex: 1, height: 600 }} />
        <div style={{ flex: 'none', background: '#f7f7f7', width: 240 }}>sidebar</div>
      </div>
    )
  }
}
