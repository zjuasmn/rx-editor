import { BehaviorSubject, Subject } from 'rxjs'
import * as ops from 'rxjs/operators'
import { fromPairs } from 'lodash'
const nodeTypeMapping = {
  'Subject': Subject,
  'Variable': BehaviorSubject,
}
export const parse = (logic) => {
  const nodes = fromPairs(
    logic.nodes
    .map(({ name, type, props }) => ([name, new nodeTypeMapping[type](props)]))
  )
  const subscriptions = logic.edges.map((edge) =>
    gao(edge.source)
      .pipe(gaoPipes(edge.pipes))
      .subscribe()
  )


}
