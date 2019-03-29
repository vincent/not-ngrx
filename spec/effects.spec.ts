import { map, skip } from "rxjs/operators";
import { Effects, Effect } from "../lib/effects";
import { Store } from "../lib/state";

describe('Effects', () => {

    it("should dispatch action from effect", done => {
        const action1 = { type: 'An First Action Type'  };
        const action2 = { type: 'An Second Action Type' };
        class TestEffect extends Effects {
            @Effect()
            onTestEffect$ = this.actions$.ofType(action1.type).pipe(map(_ => action2))
        }
        const store = new Store({}, [], [TestEffect]);

        const sub1 = store.actions$.subscribe(a => {
            expect(a).toEqual(action1);
            sub1.unsubscribe();
        });
        const sub2 = store.actions$.pipe(skip(1)).subscribe(a => {
            expect(a).toEqual(action2);
            sub2.unsubscribe();
            done();
        });

        store.dispatch(action1);
    });

    it("should dispatch multiple actions from effect", done => {
        const action1 = { type: 'An First Action Type'  };
        const action2 = { type: 'An Second Action Type' };
        const action3 = { type: 'An Third Action Type' };
        class TestEffect extends Effects {
            @Effect()
            onTestEffect$ = this.actions$.ofType(action1.type).pipe(map(_ => [action2, action3]))
        }
        const store = new Store({}, [], [TestEffect]);

        const sub1 = store.actions$.subscribe(a => {
            expect(a).toEqual(action1);
            sub1.unsubscribe();
        });
        const sub2 = store.actions$.pipe(skip(1)).subscribe(a => {
            expect(a).toEqual(action2);
            sub2.unsubscribe();
        });
        const sub3 = store.actions$.pipe(skip(2)).subscribe(a => {
            expect(a).toEqual(action3);
            sub3.unsubscribe();
            done();
        });

        store.dispatch(action1);
    });

    it("should accept an empty effects class", done => {
        const action1 = { type: 'An First Action Type'  };
        class TestEffect extends Effects {
        }
        const store = new Store({}, [], [TestEffect]);

        const sub1 = store.actions$.subscribe(a => {
            expect(a).toEqual(action1);
            sub1.unsubscribe();
            done();
        });
        store.dispatch(action1);
    });

    it("should trigger the default errorHandler on effect error", done => {
        class TestEffect extends Effects {
            @Effect()
            onTestEffect$ = this.actions$.pipe(map(_ => { throw new Error('An error that should be catched') }))
        }
        const store = new Store({}, [], [TestEffect]);
        const spy = jest.spyOn(store, 'error').mockImplementation(() => null);;
        store.dispatch({ type: 'An Action Type' });

        setTimeout(_ => {
            expect(spy).toHaveBeenCalled();
            done();
        }, 0);
    });

});
