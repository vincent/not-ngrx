import { Store, State, Action } from "../lib/state";

// A reducer
const reducer = (state: State, action: Action) => {
  switch (action.type) {
      case 'MY_ACTION_TYPE':
        return { ...state, sideEffect: true };
    default:
        return state;
  }
};

// The store
const store = new Store({}, [ reducer ]);

// Dispatch an action
store.dispatch({ type: 'MY_ACTION_TYPE' });

// Listen to state changes
store.state$.subscribe(state => {
    console.log(state);
})