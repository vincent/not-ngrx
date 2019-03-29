import { Store } from "../lib/state";
import { Action } from "../lib/models";

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

// Listen to state changes on a specific slice as a path
store.select('feature.prop').subscribe(slice => {
    console.log(slice);
});

// Listen to state changes on a specific slice as a selector
const selectFeatureProp = (state: State) => state.feature.prop;
store.select(selectFeatureProp).subscribe(slice => {
    console.log(slice);
});
