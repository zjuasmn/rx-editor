import Frame from 'components/Frame'
import NodeEdgeList from 'components/NodeEdgeList'
import Topbar from 'components/Topbar'
import LogicCanvas from 'LogicCanvas'
import TodoListLogic from 'logics/TodoList'
import React from 'react'
import { BehaviorSubject } from 'rxjs'
import { tap, map } from 'rxjs/operators'
import * as operators from 'rxjs/operators'
import { selectedInstanceKey$, selectedLogicName$ } from 'services/state'
import { withLogic } from './decorators/withLogic'
import { keys } from 'lodash'
import './App.scss'
import { logic$ } from 'connector'

class App extends React.PureComponent {
  render() {
    const { selectedLogic, selectedLogicName, selectedInstanceKey } = this.props

    return (
      <div style={{ display: 'flex', height: '100vh' }}>
        <div style={{ flex: 2 }}>
          <Frame />
        </div>
        <div style={{ flex: 3, borderLeft: '1px solid #e5e5e5' }}>
          <Topbar />
          <div className="d-flex" style={{ height: 'calc(100% - 48px)' }}>
            <div style={{ flex: 1, height: '100%' }} >
              {selectedLogic && <LogicCanvas key={`${selectedLogicName}.${selectedInstanceKey}`} logic={selectedLogic} />}
            </div>
            <div style={{ width: 240, height: '100%', boxShadow: '-2px 0 4px rgba(0, 0, 0, 0.1)', overflow: 'auto'}}>
              <NodeEdgeList logic={selectedLogic} />
            </div>
          </div>

          {/*<div>*/}
          {/*  <LogicSelector logic$={window[NAME].logic$} onChange={this.change} value={selectedLogicName} $key="0" />*/}
          {/*  {selectedLogicName && (*/}
          {/*    <InstanceSelector*/}
          {/*      ref$={window[NAME].ref$}*/}
          {/*      name={selectedLogicName}*/}
          {/*      value={selectedInstanceKey}*/}
          {/*      onChange={this.changeInstanceKey}*/}
          {/*    />*/}
          {/*  )}*/}
          {/*  <button>导出</button>*/}
          {/*  <button>导入</button>*/}
          {/*</div>*/}
          {/*{data && <LogicEditor key={selectedLogicName} data={data} onSelect$={onSelect$} />}*/}
        </div>
        {/*<div style={{ width: 240, background: '#f7f7f7', height: '100%', flex: 'none' }}>*/}
        {/*  {type === 'pipe' && <PipeEditor config={config} />}*/}
        {/*  {type === 'v' && <VarEditor data={this.props.selectedData || {}} />}*/}
        {/*</div>*/}
      </div>
    )
  }
}

export default withLogic({
  nodes: {},
  edges: (props, { set }) => ([
    selectedLogicName$
      .pipe(
        tap(console.log),
        map(selectedLogicName => logic$.value[selectedLogicName]),
        tap(set('selectedLogic'))
      ),
    selectedLogicName$
      .pipe(
        tap(set('selectedLogicName'))
      ),
    selectedInstanceKey$
      .pipe(
        tap(set('selectedInstanceKey'))
      ),
  ]),
})(App)


