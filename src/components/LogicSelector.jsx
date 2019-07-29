import { withLogic } from 'decorators/withLogic'
import { keys } from 'lodash'
import React from 'react'


const LogicSelectorView = ({ selectedLogicName, selectedLogicName$, logics }) => (
  <select
    value={selectedLogicName}
    onChange={e => selectedLogicName$.next(e.target.value)}
    className="color-secondary"
    style={{ borderColor: '#e5e5e5', height: 32, minWidth: 180, fontSize: 16 }}
  >
    <option value="">---</option>
    {keys(logics).map(name => (
      <option key={name} value={name}>
        {name}
      </option>
    ))}
  </select>
)

export default withLogic({
  name: 'LogicSelector',
  nodes: {
    logic$: { type: 'v', ref: 'logic$' },
    logics: { type: 'c' },
    selectedLogicName$: { type: 'v', ref: 'selectedLogicName$' },
    selectedLogicName: { type: 'c' },
  },
  edges: [
    {
      source: 'logic$',
      target: 'logics'
    },
    {
      source: 'selectedLogicName$',
      target: 'selectedLogicName'
    },

  ]
})(LogicSelectorView)
