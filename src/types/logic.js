export const NodeType = {
  VARIABLE: {
    name: 'VARIABLE',
    code: 'v',
    icon: 'variable',
    color: '#007aff',
    fields: ['id', 'label', 'initial', 'ref', 'watch'],
  },
  SIGNAL: {
    name: 'SIGNAL',
    code: 's',
    icon: 'signal',
    color: '#9013fe',
    fields: ['id', 'label', 'ref'],
  },
  STATE: {
    name: 'STATE',
    code: 'c',
    icon: 'state',
    color: '#999',
    fields: ['id', 'label'],
  },
  MERGE: {
    name: 'MERGE',
    code: 'm',
    icon: 'merge',
    color: '#8B572A',
  },
  OPERATOR: {
    name: 'OPERATOR',
    code: 'o',
    icon: 'operator',
    color: '#7ed321',
  },
}
