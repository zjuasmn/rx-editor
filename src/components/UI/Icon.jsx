import classnames from 'classnames'
import * as React from 'react'
import '!!../../assets/iconfont' // eslint-disable-line
import styles from './Icon.module.scss'

export default class Icon extends React.PureComponent {
  render() {
    const { name, title, className, size, block, color, onClick, ...props } = this.props
    return (
      <span
        className={classnames(
          styles.icon,
          { [styles.block]: block },
          onClick && styles.clickable,
          className)
        }
        onClick={onClick}
        title={title}
        {...props}
      >
        <svg aria-hidden="true" style={{ width: size, height: size, color}}>
          <use xlinkHref={`#iconre-${name}`} />
        </svg>
      </span>
    )
  }
}
