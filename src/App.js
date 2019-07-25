import React from 'react'
import { tap } from 'rxjs/operators'
import * as operators from 'rxjs/operators'
import { withLogic } from './decorators/withLogic'
import LogicEditor from './LogicEditor'
import TodoList from './Todo'
import todoListLogic from './TodoList.logic'
import { keys } from 'lodash'

class PipeEditor extends React.PureComponent {
  render() {
    const { config } = this.props

    return (
      <div>
        <div>
          <select value={config.type}>
            {keys(operators).map(opName => (
              <option key={opName} value={opName}>{opName}</option>
            ))
            }
          </select>
        </div>
        {
          config.args.map(({ value }, index) => <textarea
            key={index} value={value} style={{ width: '100%' }} rows={5}
          />)
        }
      </div>
    )
  }
}

class VarEditor extends React.PureComponent {
  render() {
    const { data } = this.props
    console.log(data)
    // const node = window.scope.TodoList.todoList.nodes[data.id]
    return (
      <div style={{ width: '100%' }}>
        {/*<textarea defaultValue={JSON.stringify(node.value)} id="textarea" />*/}
        {/*<div>*/}
        {/*  <button onClick={() => node.next(JSON.parse(document.getElementById('textarea').value))}>save</button>*/}
        {/*</div>*/}
      </div>
    )
  }
}

const LogicSelectorView = ({ value, onChange, logics }) => (
  <select value={value} onChange={onChange}>
    <option value="">---</option>
    {keys(logics).map(name => (
      <option key={name} value={name}>
        {name}
      </option>
    ))}
  </select>
)
const LogicSelector = withLogic({
  name: 'LogicSelector',
  nodes: {
    logic$: { type: 'v', ref: 'logic$' },
    logics: { type: 'c' },
  },
  edges: [
    {
      source: 'logic$',
      target: 'logics'
    }
  ]
})(LogicSelectorView)

const InstanceSelector = withLogic({
  name: 'InstanceSelector',
  nodes: {
    ref$: { type: 'v', ref: 'ref$' },
    refs: { type: 'c' },
  },
  edges: [
    {
      source: 'ref$',
      pipes: [{
        type: 'tap',
        args: [{
          type: 'const',
          value: console.log,
        }]
      }],
      target: 'refs'
    }
  ]
})(
  ({ name, value, onChange, refs }) => (
    <select value={value} onChange={onChange}>
      <option value="">---</option>
      {keys(refs[name]).map(key => (
        <option key={key} value={key}>
          {key}
        </option>
      ))}
    </select>
  )
)
const NAME = 'PAT$$'

class App extends React.PureComponent {
  state = { data: null, selectedLogicName: '', selectedInstanceKey: '' }
  change = (e) => this.setState({
    data: window[NAME].logic$.value[e.target.value],
    selectedLogicName: e.target.value,
    selectedInstanceKey: '',
  })

  changeInstanceKey = (e) => this.setState({
    selectedInstanceKey: e.target.value,
  })

  render() {
    const { type, config } = this.props.selectedData || {}
    const { onSelect$ } = this.props.nodes
    const { data, selectedLogicName, selectedInstanceKey } = this.state
    return (
      <div style={{ display: 'flex', height: '100vh' }}>
        <div style={{ flex: 1 }}>
          <TodoList initialTodos={JSON.parse(localStorage.getItem('todos')) || []} $key="todoList" />
        </div>
        <div style={{ flex: 1 }}>
          <div>
            <LogicSelector logic$={window[NAME].logic$} onChange={this.change} value={selectedLogicName} $key="0" />
            {selectedLogicName && (
              <InstanceSelector
                ref$={window[NAME].ref$}
                name={selectedLogicName}
                value={selectedInstanceKey}
                onChange={this.changeInstanceKey}
              />
            )}
            <button>导出</button>
            <button>导入</button>
          </div>
          {data && <LogicEditor key={selectedLogicName} data={data} onSelect$={onSelect$} />}
        </div>
        <div style={{ width: 240, background: '#f7f7f7', height: '100%', flex: 'none' }}>
          {type === 'pipe' && <PipeEditor config={config} />}
          {type === 'v' && <VarEditor data={this.props.selectedData || {}} />}
        </div>
      </div>
    )
  }
}

export default withLogic({
  nodes: {
    onSelect$: { type: 's' },
  },
  edges: (props, { nodes: { onSelect$ }, set }) => ([
    onSelect$.pipe(
      tap(set('selectedData')),
      // flatMap(() => getData({ problemId: '123' }))
    ),
  ]),
})(App)


