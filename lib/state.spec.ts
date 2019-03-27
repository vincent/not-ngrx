import { Store } from './state';
import { Observable } from 'rxjs';
import { first, skip } from 'rxjs/operators';

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

    it("should trigger the default errorHandler on reducer error", done => {
        const store = new Store({}, [ state => { throw new Error('An error that should be catched') } ], []);
        const spy = jest.spyOn(store, 'errorHandler').mockImplementation(() => null);
        try {
            store.dispatch({ type: 'An Action Type' });
        } catch (e) { }

        setTimeout(_ => {
            expect(spy).toHaveBeenCalled();
            done();
        }, 0);
    });

    it("should trigger the custom errorHandler on reducer error", done => {
        const errorHandler = jest.fn(() => null);
        const store = new Store({}, [ state => { throw new Error('An error that should be catched') } ], [], errorHandler);
        store.dispatch({ type: 'An Action Type' });

        setTimeout(_ => {
            expect(errorHandler).toHaveBeenCalled();
            done();
        }, 0);
    });

});
