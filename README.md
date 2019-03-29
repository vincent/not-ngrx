# not-ngrx
A small state management library inspired from ngrx api

# install

# usage

```
import { Store, Action } from "not-ngrx";

// A state interface
interface State {
    feature: {
        prop: string;
    }
}

// An initial state
const initialState = {
    feature: {
        prop: 'initial'
    }
};

// A reducer
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
      case 'MY_ACTION_TYPE':
        return {
            ...state,
            feature: { ...state.feature, prop: 'modified' }
        };
    default:
        return state;
  }
};

// The store
const store = new Store<State>(initialState, [ reducer ]);

// Dispatch an action
store.dispatch({ type: 'MY_ACTION_TYPE' });

// Listen to root state changes
store.subscribe(root => {
    console.log(root);
});

// Listen to state changes on a specific slice
store.select('feature.prop').subscribe(slice => {
    console.log(slice);
});
```

