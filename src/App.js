import React from 'react'
import './App.css'
import { Subject, BehaviorSubject, combineLatest } from 'rxjs'
import { tap, mapTo, filter, map } from 'rxjs/operators'
import classnames from 'classnames'

class If extends React.Component {
  render() {
    const { condition, children } = this.props
    return !!condition && children
  }
}

class TodoListItem extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
    const title$ = new BehaviorSubject(this.props.todoListItem.title)
    const onDoubleClick$ = new Subject()
    const onBlur$ = new Subject()
    const onCheck$ = new Subject()
    const onChange$ = new Subject()
    const onClick$ = new Subject()
    this.onDoubleClick = () => onDoubleClick$.next()
    this.onBlur = () => onBlur$.next()
    this.onCheck = (e) => onCheck$.next(e)
    this.onChange = (e) => onChange$.next(e)
    this.onClick = (e) => onClick$.next(e)
    let initializing = true
    const set = (key) => (value) => initializing
      ? this.state[key] = value
      : this.setState({ [key]: value })
    this.subscription = [
      onDoubleClick$.pipe(
        mapTo(true),
        tap(set('editing')),
        tap(() => title$.next(this.props.todoListItem.title)),
      ),
      onBlur$.pipe(
        mapTo(false),
        tap(set('editing')),
        tap(() => this.props.onChangeTitle$.next({ todoListItem: this.props.todoListItem, title: title$.value }))
      ),
      onCheck$.pipe(
        tap((e) => this.props.onCheck$.next({ todoListItem: this.props.todoListItem, completed: e.target.checked }))
      ),
      onChange$.pipe(
        tap(e => title$.next(e.target.value))
      ),
      title$.pipe(
        tap(set('title'))
      ),
      onClick$.pipe(
        tap(() => this.props.onRemove$.next({ todoListItem: this.props.todoListItem }))
      )
    ].map($ => $.subscribe())
    initializing = false
  }

  componentWillUnmount() {
    this.subscription.forEach($ => $.unsubscribe())
  }

  render() {
    const { todoListItem: { title, completed } } = this.props
    const { title: editTitle, editing } = this.state
    return (
      <li className={classnames({ completed, editing })}>
        <div className="view">
          <input className="toggle" type="checkbox" checked={completed} onChange={this.onCheck} />
          <label onDoubleClick={this.onDoubleClick}>{title}</label>
          <button className="destroy" onClick={this.onClick} />
        </div>
        <If condition={editing}>
          <input className="edit" value={editTitle} autoFocus onBlur={this.onBlur} onChange={this.onChange} />
        </If>
      </li>
    )
  }
}

class Repeat extends React.Component {
  render() {
    const { collection, component: Component, map, ...props } = this.props
    return collection.map(item => (
      <Component key={item.id} {...{ [map]: item }} {...props} />
    ))
  }
}

export default class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {}
    const text$ = new BehaviorSubject('')
    const todos$ = new BehaviorSubject(JSON.parse(localStorage.getItem('todos')) || [])
    const filter$ = new BehaviorSubject('all')
    const checkedAll$ = new BehaviorSubject(false)
    const onChange$ = new Subject()
    const onKeyPress$ = new Subject()
    const done$ = new Subject()
    const onCheck$ = new Subject()
    const onChangeTitle$ = new Subject()
    const onRemove$ = new Subject()
    const onClickClearCompleted$ = new Subject()
    const onAllFilterClick$ = new Subject()
    const onActiveFilterClick$ = new Subject()
    const onCompletedFilterClick$ = new Subject()
    const onToggleAll$ = new Subject()
    this.onCheck$ = onCheck$
    this.onChangeTitle$ = onChangeTitle$
    this.onRemove$ = onRemove$
    this.onChange = (e) => onChange$.next(e)
    this.onKeyPress = (e) => onKeyPress$.next(e)
    this.onClickClearCompleted = (e) => onClickClearCompleted$.next(e)
    this.onAllFilterClick = (e) => onAllFilterClick$.next(e)
    this.onActiveFilterClick = (e) => onActiveFilterClick$.next(e)
    this.onCompletedFilterClick = (e) => onCompletedFilterClick$.next(e)
    this.onToggleAll = e => onToggleAll$.next(e)
    let initializing = true
    const set = (key) => (value) => initializing
      ? this.state[key] = value
      : this.setState({ [key]: value })
    this.subscription = [
      onChange$.pipe(
        map(e => e.target.value),
        tap(text$),
      ),
      onKeyPress$.pipe(
        filter(e => e.key === 'Enter'),
        tap(done$),
      ),
      done$.pipe(
        map(() => ({ id: Date.now(), title: text$.value, completed: false })),
        map(todo => ([todo, ...todos$.value])),
        tap(todos$),
      ),
      done$.pipe(
        mapTo(''),
        tap(text$),
      ),
      text$.pipe(
        tap(set('text')),
      ),
      todos$.pipe(
        tap(set('todos')),
        tap((todos) => localStorage.setItem('todos', JSON.stringify(todos))),
      ),
      onCheck$.pipe(
        map(({ completed, todoListItem }) => todos$.value.map(todo => (
          todo.id === todoListItem.id
            ? {
              ...todo,
              completed
            }
            : todo))),
        tap(todos$),
      ),
      onChangeTitle$.pipe(
        map(({ title, todoListItem }) => todos$.value.map(todo => todo.id === todoListItem.id ? {
          ...todo,
          title: title || todo.title,
        } : todo)),
        tap(todos$),
      ),
      onRemove$.pipe(
        map(({ todoListItem }) => todos$.value.filter(todo => todo.id !== todoListItem.id)),
        tap(todos$),
      ),
      onClickClearCompleted$.pipe(
        map(() => todos$.value.filter(todo => !todo.completed)),
        tap(todos$),
      ),
      onAllFilterClick$.pipe(
        mapTo('all'),
        tap(filter$),
      ),
      onActiveFilterClick$.pipe(
        mapTo('active'),
        tap(filter$),
      ),
      onCompletedFilterClick$.pipe(
        mapTo('completed'),
        tap(filter$),
      ),
      filter$.pipe(
        tap(set('filter')),
      ),
      combineLatest([todos$, filter$]).pipe(
        tap(([todos, filter]) => set('filteredTodos')(todos.filter(({ completed }) =>
          filter === 'all'
          || (filter === 'active' && !completed)
          || (filter === 'completed' && completed)
          )
        )),
      ),
      onToggleAll$.pipe(
        map(() => checkedAll$.value
          ? todos$.value.map((todo) => ({ ...todo, completed: false }))
          : todos$.value.map((todo) => ({ ...todo, completed: true }))
        ),
        tap(todos$)
      ),
      todos$.pipe(
        map(todos => todos.every(({ completed }) => completed)),
        tap(checkedAll$),
      ),
      checkedAll$.pipe(
        tap(set('checkedAll')),
      )
    ].map($ => $.subscribe())
    initializing = false
  }

  componentWillUnmount() {
    this.subscription.forEach($ => $.unsubscribe())
  }


  render() {
    const { text, todos, filter, filteredTodos, checkedAll, foo } = this.state
    return (
      <>
        <section className="todoapp">
          <header className="header">
            <h1>todos</h1>
            <input
              className="new-todo"
              placeholder="What needs to be done?"
              autoFocus
              onChange={this.onChange}
              onKeyPress={this.onKeyPress}
              value={text}
            />
          </header>
          <If condition={todos.length}>
            <section className="main">
              <input
                id="toggle-all"
                className="toggle-all"
                type="checkbox"
                checked={checkedAll}
                onChange={this.onToggleAll}
              />
              <label htmlFor="toggle-all">Mark all as complete</label>
              <ul className="todo-list">
                <Repeat
                  collection={filteredTodos}
                  keyfn={({ id }) => id}
                  map="todoListItem"
                  component={TodoListItem}
                  onCheck$={this.onCheck$}
                  onChangeTitle$={this.onChangeTitle$}
                  onRemove$={this.onRemove$}
                />
              </ul>
            </section>
            <footer className="footer">
              <span className="todo-count">
                {`${todos.filter(({ completed }) => !completed).length} items left`}
              </span>
              <ul className="filters">
                <li>
                  <a
                    href="#/"
                    className={classnames({ selected: filter === 'all' })}
                    onClick={this.onAllFilterClick}>All</a>
                </li>
                <li>
                  <a
                    href="#/active"
                    className={classnames({ selected: filter === 'active' })}
                    onClick={this.onActiveFilterClick}>Active</a>
                </li>
                <li>
                  <a
                    href="#/completed"
                    className={classnames({ selected: filter === 'completed' })}
                    onClick={this.onCompletedFilterClick}>Completed</a>
                </li>
              </ul>
              <button className="clear-completed" onClick={this.onClickClearCompleted}>Clear completed</button>
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
