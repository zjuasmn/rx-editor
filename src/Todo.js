import classnames from 'classnames'
import React from 'react'
import { DOM, If, Repeat } from './components/utils'
import { withLogic } from './decorators/withLogic'
import './Todo.css'

class TodoListItemView extends React.PureComponent {
  render() {
    const { todoListItem: { completed }, title, nodes, editing } = this.props
    const { onChange$, onBlur$, onCheckboxClick$, onClick$, onDoubleClick$ } = nodes

    return (
      <li className={classnames({ completed, editing })}>
        <div className="view">
          <DOM tag="input" className="toggle" type="checkbox" checked={completed} onChange={onCheckboxClick$} />
          <DOM tag="label" onDoubleClick={onDoubleClick$}>{title}</DOM>
          <DOM tag="button" className="destroy" onClick={onClick$} />
        </div>
        <If condition={editing}>
          <DOM tag="input" className="edit" value={title} autoFocus onBlur={onBlur$} onChange={onChange$} />
        </If>
      </li>
    )
  }
}

const TodoListItem = withLogic(require('./TodoListItem.logic'))(TodoListItemView)

class TodoList extends React.PureComponent {
  render() {
    const { text, todos, filter, filteredTodos, checkedAll, nodes } = this.props
    const { onChange$, onKeyPress$, onCheck$, onChangeTitle$, onRemove$, onToggleAll$, onAllFilterClick$, onClickClearCompleted$, onActiveFilterClick$, onCompletedFilterClick$ } = nodes
    return (
      <>
        <section className="todoapp">
          <header className="header">
            <h1>todos</h1>
            <DOM
              tag="input"
              className="new-todo"
              placeholder="What needs to be done?"
              autoFocus
              onChange={onChange$}
              onKeyPress={onKeyPress$}
              value={text}
            />
          </header>
          <If condition={todos.length}>
            <section className="main">
              <DOM
                tag="input"
                id="toggle-all"
                className="toggle-all"
                type="checkbox"
                checked={checkedAll}
                onChange={onToggleAll$}
              />
              <label htmlFor="toggle-all">Mark all as complete</label>
              <ul className="todo-list">
                <Repeat
                  collection={filteredTodos}
                  keyfn={({ id }) => id}
                  map="todoListItem"
                  component={TodoListItem}
                  onCheck$={onCheck$}
                  onChangeTitle$={onChangeTitle$}
                  onRemove$={onRemove$}
                />
              </ul>
            </section>
            <footer className="footer">
              <span className="todo-count">
                {`${todos.filter(({ completed }) => !completed).length} items left`}
              </span>
              <ul className="filters">
                <li>
                  <DOM
                    tag="a"
                    href="#/"
                    className={classnames({ selected: filter === 'all' })}
                    onClick={onAllFilterClick$}
                  >
                    All
                  </DOM>
                </li>
                <li>
                  <DOM
                    tag="a"
                    href="#/active"
                    className={classnames({ selected: filter === 'active' })}
                    onClick={onActiveFilterClick$}>
                    Active
                  </DOM>
                </li>
                <li>
                  <DOM
                    tag="a"
                    href="#/completed"
                    className={classnames({ selected: filter === 'completed' })}
                    onClick={onCompletedFilterClick$}
                  >
                    Completed
                  </DOM>
                </li>
              </ul>
              <DOM tag="button" className="clear-completed" onClick={onClickClearCompleted$}>
                Clear completed
              </DOM>
            </footer>
          </If>
        </section>
        <footer className="info">
          <p>Double-click to edit a todo</p>
          <p>Created by <a href="http://twitter.com/oscargodson">Oscar Godson</a></p>
          <p>Refactored by <a href="https://github.com/cburgmer">Christoph Burgmer</a></p>
          <p>Part of <a href="http://todomvc.com">TodoMVC</a></p>
        </footer>
      </>
    )
  }
}

export default withLogic(require('./TodoList.logic.json'))
(TodoList)
