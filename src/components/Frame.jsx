import * as React from 'react'
import classnames from 'classnames'
import { hotUpdate$, logic$, NAME, ref$, trigger$ } from 'connector'

export default class Frame extends React.PureComponent {
  ref = React.createRef()

  componentDidMount() {
    hotUpdate$.subscribe(e => this.ref.current.postMessage(JSON.stringify({ type: 'hotUpdate$', e }), '*'))
    window.addEventListener('message', (event) => {
      try {
        const { type, e } = JSON.parse(event.data)
        if (type === 'logic$') {
          logic$.next(e)
        }
        if (type === 'ref$') {
          ref$.next(e)
        }
        if (type === 'trigger$') {
          trigger$.next(e)
        }
      } catch (error) {
      }
    })
    trigger$.subscribe(console.log)
  }

  render() {
    const { className } = this.props
    return (
      <iframe
        src="/todo"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          margin: 0,
          padding: 0,
          outline: 'none',
          display: 'block'
        }}
        name={NAME}
        ref={this.ref}
      />
    )
  }
}
