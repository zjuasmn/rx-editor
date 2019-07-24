import * as React from 'react'

export default class extends React.PureComponent {

  render() {
    const { $, component: Component, ...props } = this.props
    return (
      <Component nodes={this.nodes} {...props} {...this.state}/>
    )
  }
}
