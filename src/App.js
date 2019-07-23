import React from 'react'
import TodoList from './Todo'

export default class App extends React.PureComponent {
  render() {
    return (
      <TodoList initialTodos={JSON.parse(localStorage.getItem('todos')) || []} />
    )
  }
}
