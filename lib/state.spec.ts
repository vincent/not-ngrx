import { Store } from './state';
import { Observable, empty } from 'rxjs';
import { first, skip, catchError } from 'rxjs/operators';
import { Action } from './models';

describe('Store', () => {

    it("should create a store without options", done => {
        const store = new Store();
        expect(store).toBeInstanceOf(Observable);
        done();
    });

    it("should create a store with a specified initial state", done => {
        const initial = { prop: 'a prop' };
        const store = new Store(initial);

        store.subscribe(s => {
            expect(s).toHaveProperty('prop');
            expect((<any>s).prop).toEqual(initial.prop);
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

    it("should dispatch actions with next", done => {
        const store = new Store();
        const action = { type: 'An Action Type' };

        store.actions$.subscribe(a => {
            expect(a).toEqual(action);
            done();
        });
        store.next(action);
    });

    it("should trigger complete", done => {
        const store = new Store();
        let completed = false;

        store.actions$.subscribe(
            _ => null,
            error => null,
            () => {
                completed = true;
            });

        store.complete();
        expect(completed).toBeTruthy();
        done();
    });

    it("should alter state according to one reducer", done => {
        interface State { reduced: boolean }
        const store = new Store({ reduced: false }, [ (state: State) => ({ ...state, reduced: true }) ]);
        store.pipe(first()).subscribe(s => {
            expect((<any>s).reduced).toEqual(false);

            store.pipe(skip(1)).subscribe(s => {
                expect((<any>s).reduced).toEqual(true);
                done();
            });

            store.dispatch({ type: 'An Action Type' });
        });
    });

    it("should accept new reducers", done => {
        const store = new Store({ reduced: false });
        store.addReducer(_ => ({ reduced: true }));

        store.pipe(first()).subscribe(s => {
            expect((<any>s).reduced).toEqual(false);

            store.pipe(skip(1)).subscribe(s => {
                expect((<any>s).reduced).toEqual(true);
                done();
            });

            store.dispatch({ type: 'An Action Type' });
        });
    });

    it("should remove reducers", done => {
        const reducer = () => ({ reduced: true });
        const store = new Store({ reduced: false }, [ reducer ]);
        store.removeReducer(reducer);

        store.pipe(first()).subscribe(s => {
            expect((<any>s).reduced).toEqual(false);

            store.pipe(skip(1)).subscribe(s => {
                expect((<any>s).reduced).toEqual(false);
                done();
            });

            store.dispatch({ type: 'An Action Type' });
        });
    });

    it("should trigger error", done => {
        const store = new Store();
        let error = false;

        store.actions$.subscribe(
            _ => null,
            _ => {
                error = true;
            });

        store.error(new Error('An error'));
        expect(error).toBeTruthy();
        done();
    });

});
