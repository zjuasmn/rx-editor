import { withLogic } from 'decorators/withLogic'
import { keys } from 'lodash'
import React from 'react'

const InstanceSelectorView = ({ selectedInstanceKey, selectedInstanceKey$, selectedLogicName, refs }) => (
  !!selectedLogicName && (
    <select
      value={selectedInstanceKey}
      onChange={e => selectedInstanceKey$.next(e.target.value)}
      style={{ borderColor: '#e5e5e5', height: 32, minWidth: 150, fontSize: 14, marginLeft: 4 }}
    >
      <option value="">---</option>
      {keys(refs[selectedLogicName]).map(instanceKey => (
        <option key={instanceKey} value={instanceKey}>
          {instanceKey}
        </option>
      ))}
    </select>
  )
)

export default withLogic({
  name: 'LogicSelector',
  nodes: {
    ref$: { type: 'v', ref: 'ref$' },
    refs: { type: 'c' },
    selectedLogicName$: { type: 'v', ref: 'selectedLogicName$' },
    selectedLogicName: { type: 'c' },
    selectedInstanceKey$: { type: 'v', ref: 'selectedInstanceKey$' },
    selectedInstanceKey: { type: 'c' },
  },
  edges: [
    {
      source: 'ref$',
      target: 'refs'
    },
    {
      source: 'selectedLogicName$',
      target: 'selectedLogicName'
    },
    {
      source: 'selectedInstanceKey$',
      target: 'selectedInstanceKey'
    },
    {
      source: {
        type: 'combineLatest',
        nodes: ['ref$', 'selectedLogicName$'],
      },
      pipes: [
        {
          type: 'filter',
          args: [{
            type: 'expression',
            refs: ['selectedInstanceKey'],
            value: `([refs, selectedLogicName]) => (selectedLogicName && refs[selectedLogicName] && !refs[selectedLogicName][selectedInstanceKey])`,
          }]
        },
        {
          type: 'map',
          refs: ['selectedInstanceKey'],
          args: [{
            type: 'const',
            value: ([refs, selectedLogicName]) => (keys(refs[selectedLogicName])[0]),
          }],
        }
      ],
      target: 'selectedInstanceKey$',
    }
  ]
})(InstanceSelectorView)
