import { Store } from './state';
import { Observable } from 'rxjs';
import { first, skip, map } from 'rxjs/operators';
import { Effect, Effects } from './effects';

describe('Store', () => {

    it("should create a store without options", done => {
        const store = new Store();
        expect(store.actions$).toBeInstanceOf(Observable);
        expect(store.state$).toBeInstanceOf(Observable);
        done();
    });

    it("should create a store with a specified initial state", done => {
        const state = { prop: 'a prop' };
        const store = new Store(state);
        store.state$.subscribe(s => {
            expect(s).toHaveProperty('prop');
            expect((<any>s).prop).toEqual(state.prop);
            done();
        });
    });

    it("should dispatch actions", done => {
        const store = new Store();
        const action = { type: 'An Action Type' };
        store.actions$.subscribe(a => {
            expect(a).toEqual(action);
            done();
        });
        store.dispatch(action);
    });

    it("should alter state according to one reducer", done => {
        const store = new Store({ reduced: false }, [ state => ({ ...state, reduced: true }) ]);
        store.state$.pipe(first()).subscribe(s => {
            expect((<any>s).reduced).toEqual(false);

            store.state$.pipe(skip(1)).subscribe(s => {
                expect((<any>s).reduced).toEqual(true);
                done();
            });

            store.dispatch({ type: 'An Action Type' });
        });
    });

    it("should dispatch action from effect", done => {
        const action1 = { type: 'An First Action Type'  };
        const action2 = { type: 'An Second Action Type' };
        class TestEffect extends Effects {
            @Effect()
            onTestEffect$ = this.actions$.ofType(action1.type).pipe(map(_ => action2))
        }

        const store = new Store({}, [], [TestEffect]);

        store.actions$.subscribe(a => console.log('ACTION', a));

        const sub1 = store.actions$.subscribe(a => {
            expect(a).toEqual(action1);
            sub1.unsubscribe();
        });

        /* * /
        const sub2 = store.actions$.pipe(skip(1)).subscribe(a => {
            expect(a).toEqual(action2);
            sub2.unsubscribe();
            done();
        });
        /* */

        store.dispatch(action1);
    });


});
