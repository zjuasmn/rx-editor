import Icon from 'components/UI/Icon'
import * as React from 'react'
import classnames from 'classnames'
import styles from './Text.module.scss'

export default class Text extends React.PureComponent {
  render() {
    const {
      className,
      icon,
      iconColor = 'default',
      iconClassName,
      iconStyle,
      color = 'primary',
      size = 'md',
      children,
      nowrap,
      onClick,
      flex,
      inverse,
      ...props
    } = this.props
    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <span
        className={classnames(
          styles.Text,
          className,
          styles[`color-${color}${inverse ? '-inverse' : ''}`],
          styles[`fontsize-${size}`],
          nowrap && 'whitespace-nowrap',
          onClick && styles.clickable,
          flex && 'flex-grow-1',
        )}
        onClick={onClick}
        {...props}
      >
        {icon && (
          <Icon
            name={icon}
            className={classnames(
              styles.icon,
              styles[`color-${iconColor}${inverse ? '-inverse' : ''}`],
              iconClassName,
            )}
            style={iconStyle}
          />
        )}
        {children}
      </span>
    )
  }
}
