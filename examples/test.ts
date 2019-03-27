import { Effect, Effects } from "../lib/effects";
import { Store } from "../lib/state";
import { map } from "rxjs/operators";

const action1 = { type: 'An First Action Type'  };
const action2 = { type: 'An Second Action Type' };

class TestEffect extends Effects {
    @Effect()
    onTestEffect$ = this.actions$.ofType(action1.type).pipe(map(_ => action2))
}

const store = new Store({}, [], [TestEffect]);

store.actions$.subscribe(a => {
    console.log('ACTION', a);
});

store.dispatch(action1);
