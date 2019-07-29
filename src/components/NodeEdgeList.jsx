import NodeIcon from 'components/NodeIcon'
import Icon from 'components/UI/Icon'
import Text from 'components/UI/Text'
import { DOM } from 'components/utils'
import * as React from 'react'
import classnames from 'classnames'
import { NodeType } from 'types/logic'
import styles from './NodeEdgeList.scss'
import { fromPairs, toPairs, values } from 'lodash'

export default class NodeEdgeList extends React.PureComponent {
  state = {
    nodeListExpanded: true,
    edgeListExpanded: true,
  }
  toggleNodeList = () => this.setState(({ nodeListExpanded }) => ({ nodeListExpanded: !nodeListExpanded }))
  toggleEdgeList = () => this.setState(({ edgeListExpanded }) => ({ edgeListExpanded: !edgeListExpanded }))

  render() {
    const { className, logic: { nodes = {}, edges = [] } = {}, nodes: { onAddNode$, onAddEdge$, onSelectEdge$ } = {} } = this.props
    const { nodeListExpanded, edgeListExpanded } = this.state
    const nodePairs = toPairs(nodes)
    return (
      <div className={classnames(styles.NodeEdgeList, className)}>
        <div className="border-bottom">
          <div className="d-flex p-2">
            <div className="flex-grow-1">nodes</div>
            <DOM tag={Icon} onClick={onAddNode$} name="plus" className="color-secondary" />
            {nodePairs.length > 0 && (
              <Icon
                name={`chevron-${nodeListExpanded ? 'down' : 'right'}`}
                onClick={this.toggleNodeList}
                className="color-secondary ml-2"
              />
            )}
          </div>
          {nodeListExpanded && nodePairs.length > 0 && (
            <div className="pb-2">
              {nodePairs.map(([id, { type: code, label }]) => (
                <a
                  className="pl-3 pr-2 d-block d-flex align-items-center hover-background-secondary"
                  key={id}
                  style={{ height: 24 }}
                >
                  <NodeIcon code={code} />
                  <Text size="md" color="primary" className="ml-2">{label || id}</Text>
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="border-bottom">
          <div className="d-flex p-2">
            <div className="flex-grow-1">edges</div>
            <DOM tag={Icon} onClick={onAddEdge$} name="plus" className="color-secondary" />
            {edges.length > 0 && (
              <Icon
                name={`chevron-${edgeListExpanded ? 'down' : 'right'}`}
                onClick={this.toggleEdgeList}
                className="color-secondary ml-2"
              />
            )}
          </div>
          {edgeListExpanded && edges.length > 0 && (
            <div className="py-2">
              {edges.map(({ label, source, pipes, target }, index) => (
                <a
                  className="pl-3 pr-2 d-block d-flex align-items-center hover-background-secondary"
                  key={index}
                  style={{ height: 24 }}
                  onClick={() => onSelectEdge$.next(index)}
                >
                  <div style={{ width: 48, position: 'relative' }}>
                    <div style={{ position: 'absolute', height: 2, width: 32, background: '#aaa', left: 8, top: 7 }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      {typeof source === 'string' ? <NodeIcon code={nodes[source].type} /> : <NodeIcon code="m" />}
                      {pipes && pipes.length > 0 ? <NodeIcon code="o" /> :
                        <div style={{ width: 16, display: 'inline-block' }} />}
                      {target ? <NodeIcon code={nodes[target].type} /> :
                        <div style={{ width: 16, display: 'inline-block' }} />}
                    </div>
                  </div>
                  <Text size="md" color="primary" className="ml-2">{label || `edge_${index}`}</Text>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }
}
