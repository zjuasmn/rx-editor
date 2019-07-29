import { BehaviorSubject, Subject } from 'rxjs'

const NAME = 'PAT$$'
const DEBUG = window.name === NAME

const logic$ = new BehaviorSubject({})  // { name: logicConfig }
const ref$ = new BehaviorSubject({})    // { name: { key: component } }
const trigger$ = new Subject()                 // { name, key, id, e }
const hotUpdate$ = new Subject()               // logicConfig

window[NAME] = { DEBUG, trigger$, hotUpdate$, ref$, logic$ }

if (DEBUG) {
  /* eslint-disable-nextline */
  const source = window.parent
  logic$.subscribe(e => source.postMessage(JSON.stringify({ type: 'logic$', e }), '*'))
  ref$.subscribe(e => source.postMessage(JSON.stringify({ type: 'ref$', e }), '*'))
  trigger$.subscribe(({ name, key, id, e }) => {

    try {
      source.postMessage(JSON.stringify({ type: 'trigger$', e: { name, key, id, e } }), '*')
    } catch (error) {
      source.postMessage(JSON.stringify({ type: 'trigger$', e: { name, key, id, e: e.toString(), flag: true } }), '*')
    }
  })
  window.addEventListener('message', (event) => {
    try {
      const { type, e } = JSON.parse(event.data)
      if (type === 'hotUpdate$') {
        hotUpdate$.next(e)
      }
    } catch (error) {
    }
  })
}

export { NAME, DEBUG, trigger$, hotUpdate$, ref$, logic$ }
