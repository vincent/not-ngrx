import { Store, State, Action } from "../lib/state";

// Your actions
const ActionTypes = {
    MY_ACTION_TYPE: "My Custom Action Type"
}

class MyAction implements Action {
    type = ActionTypes.MY_ACTION_TYPE;
    constructor(public payload: string) {}
}

type MyActions =
    | MyAction
    ;

// A reducer
const reducer = (state: State, action: MyActions): State => {
  switch (action.type) {
      case ActionTypes.MY_ACTION_TYPE:
        return {
            ...state,
            sideEffect: action.payload
        };

    default:
        return state;
  }
};

// The store
const store = new Store({}, [ reducer ]);

// Dispatch an action
store.dispatch(new MyAction('some payload'));

// Listen to state changes
store.state$.subscribe((state: State) => {
    console.log(state);
})