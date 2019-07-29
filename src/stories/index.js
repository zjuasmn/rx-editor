import { action } from '@storybook/addon-actions'
import { linkTo } from '@storybook/addon-links'
import { storiesOf } from '@storybook/react'
import { Button, Welcome } from '@storybook/react/demo'
import 'App.scss'
import React from 'react'
import { Editor } from 'components/Editor'
import NodeDetail from 'components/NodeDetail'
import NodeEdgeList from 'components/NodeEdgeList'
import Icon from 'components/UI/Icon'
import { values } from 'lodash'
import TodoListLogic from 'logics/TodoList'
import { NodeType } from 'types/logic'

storiesOf('Welcome', module).add('to Storybook', () => <Welcome showApp={linkTo('Button')} />)

storiesOf('Button', module)
  .add('with text', () => <Button onClick={action('clicked')}>Hello Button</Button>)
  .add('with some emoji', () => (
    <Button onClick={action('clicked')}>
      <span role="img" aria-label="so cool">
        😀 😎 👍 💯
      </span>
    </Button>
  ))

storiesOf('Icons', module)
  .add('icons', () => (
    <div>
      <Icon name="variable" />
    </div>
  ))
  .add('nodeIcons', () => (
    <div>
      {values(NodeType).map(({ name, icon, color }) => (
        <Icon name={icon} color={color} key={name} />
      ))}
    </div>
  ))

storiesOf('Node Types', module)
  .add('1', () => (
    <div>
      {values(NodeType).map(({ name, icon, color, code }) => (
        <div key={name} style={{ position: 'relative', width: 24 }}>
          <Icon name={icon} color={color} size={24} />
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            textAlign: 'center',
            width: '100%',
            fontSize: 12,
            color: '#fff',
            lineHeight: '24px',
          }}>
            {code}
          </div>
        </div>
      ))}
    </div>
  ))

storiesOf('Sidebar', module)
  .add('NodeEdgeList', () => (
    <div style={{ width: 240, margin: '60px auto', boxShadow: ' 0 4px 4px rgba(0, 0, 0, 0.1)' }}>
      <NodeEdgeList logic={TodoListLogic} />
    </div>
  ))
  .add('NodeDetail', () => (
    <div style={{ width: 240, margin: '60px auto', boxShadow: ' 0 4px 4px rgba(0, 0, 0, 0.1)' }}>
      <NodeDetail id="filter$" node={TodoListLogic.nodes['filter$']} />
    </div>
  ))
  .add('Editor', () => (
    <div style={{ width: 600, height: 300 }}>
      <Editor />
    </div>
  ))
