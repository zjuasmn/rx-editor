import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import * as serviceWorker from './serviceWorker'

if (window.location.pathname === '/todo') {
  import('./Todo').then(m => {
    const TodoList = m.default
    ReactDOM.render(<TodoList $key="todoList" initialTodos={JSON.parse(localStorage.getItem('todos')) || []} />, document.getElementById('root'))
  })
} else {
  import('./App').then(m => {
    const App = m.default
    ReactDOM.render(<App />, document.getElementById('root'))
  })
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
