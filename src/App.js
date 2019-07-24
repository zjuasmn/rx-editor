import React from 'react'
import cytoscape from 'cytoscape'
import dagre from 'cytoscape-dagre'
import todoListLogic from './TodoList.logic'
import { toPairs, flatten } from 'lodash'

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
                      id: `${edgeIndex}._${i}`,
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
          'background-color': '#666',
          'label': 'data(label)',
        },
      }, {
        selector: 'edge',
        style: {
          'width': 3,
          'line-color': '#ccc',
          'target-arrow-color': '#ccc',
          'target-arrow-shape': 'triangle',
        },
      }],
      layout: {
        name: 'dagre',
      },
    })
  }

  render() {
    // <TodoList initialTodos={JSON.parse(localStorage.getItem('todos')) || []} />
    return (
      <div id="cy" style={{ width: '100%', height: 600 }} />
    )
  }
}
