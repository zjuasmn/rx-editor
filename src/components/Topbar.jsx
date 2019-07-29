import InstanceSelector from 'components/InstanceSelector'
import LogicSelector from 'components/LogicSelector'
import Text from 'components/UI/Text'
import { logic$, ref$ } from 'connector'
import * as React from 'react'
import classnames from 'classnames'
import { selectedLogicName$, selectedInstanceKey$ } from 'services/state'
import styles from './Topbar.module.scss'

selectedInstanceKey$.subscribe(console.log)
export default class Topbar extends React.PureComponent {
  render() {
    const { className } = this.props
    return (
      <div className={classnames(styles.Topbar, className)}>
        {/*<Text size="lg" style={{ fontWeight: 700 }} color="secondary">*/}
        {/*  RxEditor*/}
        {/*</Text>*/}
        <LogicSelector logic$={logic$} selectedLogicName$={selectedLogicName$}/>
        <InstanceSelector ref$={ref$} selectedLogicName$={selectedLogicName$} selectedInstanceKey$={selectedInstanceKey$} />
      </div>
    )
  }
}
