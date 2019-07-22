export const Logic = {
  nodes: [
    {
      name: 'onChange',
      type: 'Subject',
    },
    {
      name: 'onKeyPress',
      type: 'Subject',
    },
    {
      name: 'onDone',
      type: 'Subject',
    },
  ],
  edges: [
    {
      path: [
        {
          type: 'Subject',
          name: 'onChange'
        },
        {
          type: 'pipe',
          name: 'map',
          fn: `e => e.target.value`,
        },
        {
          type: 'Variable',
          name: 'text',
        },
      ],
    },
    {
      path: [
        {
          from: 'onKeyPress',
          type: 'Subject',
        },
        {
          type: 'pipe',
          name: 'filter',
          fn: `e => e.key === 'Enter'`
        },
        {
          type: 'Subject',
          name: 'onDone',
        },
      ]
    }, {
      path: [
        {
          from: 'onDone',
          type: 'Subject',
        },
        {
          type: 'pipe',
          name: 'map',
          fn: `() => ({ id: Date.now(), title: text$.value, completed: false })`
        },
        {
          type: 'Subject',
          name: 'todos',
          fn: `e => e.key === 'Enter'`
        },
      ]
    }, {
      path: [
        {
          from: 'onDone',
          type: 'Subject',
        },
        {
          type: 'pipe',
          name: 'mapTo',
          fn: '',
        },
        {
          type: 'Variable',
          name: 'text',
        },
      ]
    }, {
      path: [
        {
          from: 'text',
          type: 'Variable',
        },
        {
          type: 'State',
          name: 'text',
        },
      ]
    }
  ]
}

const connect = {
  id:
}
