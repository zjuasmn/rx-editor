import Icon from 'components/UI/Icon'
import { fromPairs, values } from 'lodash'
import * as React from 'react'
import { NodeType } from 'types/logic'

const code2Type = fromPairs(
  values(NodeType).map((nodeType) => ([nodeType.code, nodeType])),
)

const NodeIcon = ({ code }) => {
  console.log(code)
  return <Icon name={code2Type[code].icon} color={code2Type[code].color} />
}

export default NodeIcon