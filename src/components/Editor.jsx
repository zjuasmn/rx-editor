import React from 'react'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/dracula.css'
import CodeMirror from 'codemirror'
import 'codemirror/mode/javascript/javascript'

export class Editor extends React.Component {
  ref = React.createRef()

  componentDidMount() {
    CodeMirror.fromTextArea(this.ref.current, {
      lineNumbers: true,
      styleActiveLine: true,
      matchBrackets: true,
      theme: 'dracula'
    })
  }

  render() {
    return (
      <div>
        <textarea ref={this.ref} />
      </div>
    )
  }
}