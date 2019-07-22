# rx-editor

editor for rx, POC stage. WIP


The target of this project is to provide a online web editor for
developer to do flow-programming on rxjs, and connect it to react/angular code.


## example

1. rx chart

![image](https://user-images.githubusercontent.com/4462778/61600463-4de36a00-ac63-11e9-9876-9506fa96e4fc.png)


2. rx code (logic)

```js
  [
      onChange$.pipe(
        map(e => e.target.value),
        tap(text$),
      ),
      onKeyPress$.pipe(
        filter(e => e.key === 'Enter'),
        tap(done$),
      ),
      done$.pipe(
        map(() => ({ id: Date.now(), title: text$.value, completed: false })),
        map(todo => ([todo, ...todos$.value])),
        tap(todos$),
      ),
      done$.pipe(
        mapTo(''),
        tap(text$),
      ),
      text$.pipe(
        tap(set('text')),
      ),
      ...,
  ].forEach(o => o.subscribe())
```

3. jsx code (view)

```jsx
      <>
        <section className="todoapp">
          <header className="header">
            <h1>todos</h1>
            <input
              className="new-todo"
              placeholder="What needs to be done?"
              autoFocus
              onChange={this.onChange}
              onKeyPress={this.onKeyPress}
              value={text}
            />
          </header>
          ...
      </>
```

4. result
![image](https://user-images.githubusercontent.com/4462778/61600417-0eb51900-ac63-11e9-8687-bafa07e16dd0.png)
