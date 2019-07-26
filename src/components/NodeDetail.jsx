import NodeIcon from 'components/NodeIcon'
import Icon from 'components/UI/Icon'
import Text from 'components/UI/Text'
import * as React from 'react'

const Field = ({ config, value, onChange,defaultValue }) => (
  <div className="px-2">
    <div className="d-flex py-1 align-items-center">
      <div className="flex-grow-1">
        <Text size="sm" color="primary">{config.name}</Text>
      </div>
      {config.nullable && <input type="checkbox" style={{ width: 12, height: 12 }} />}
    </div>
    {config.type === 'text' && (
      <input
        type="text"
        style={{
          fontSize: 12,
          lineHeight: '16px',
          padding: `2px 8px`,
          border: '1px solid #e5e5e5',
          borderRadius: 4,
          width: '100%',
          boxSizing: 'border-box',
        }}
        value={defaultValue}
        placeholder={config.placeholder}
        onChange={onChange}
      />
    )}
  </div>
)

export default class NodeDetail extends React.PureComponent {

  render() {
    const { className, id, node } = this.props
    console.log(node)
    return (
      <div className={className}>
        <div className="border-bottom">
          <div className="d-flex align-items-center px-2" style={{ height: 32 }}>
            <Icon
              name="chevron-left"
              className="color-secondary mr-1"
            />
            <NodeIcon code={node.type} />
            <Text className="ml-2" size="md">{id}</Text>
          </div>
        </div>
        <div className="border-bottom pb-2 pt-2">
          <Field config={{ name: 'id', type: 'text', defaultValue: node.id }} />
          <Field config={{ name: 'ref', type: 'text', nullable: true, defaultValue: node.ref }} />
          <Field config={{ name: 'watch', type: 'text', nullable: true, defaultValue: node.watch }} />
          <Field config={{ name: 'initial', type: 'json', defaultValue: JSON.stringify(node.initial) }} />
        </div>
        <div className="border-bottom">
          <div className="px-2 py-2">
            <Text color="secondary" size="md">Value</Text>
          </div>
        </div>
        <div className="border-bottom">
          <div className="px-2 py-2">
            <Text color="secondary" size="md">History</Text>
          </div>
        </div>
      </div>
    )
  }
}
