import { mapValues } from 'lodash'
import React from 'react'


export const If = ({ condition, children }) => !!condition && children


export const DOM = ({ tag, ...props }) => React.createElement(
  tag,
  mapValues(props, (value, key) => (/^on[A-Z]/.test(key) ? (e) => value && value.next(e) : value)),
)

export const Repeat = (
  {
    collection,
    component: Component,
    map,
    keyfn = (_, index) => index,
    ...props
  }) => collection.map((item, index) => (
  <Component key={keyfn(item, index)} $key={keyfn(item, index)} {...{ [map]: item }} {...props} />
))
