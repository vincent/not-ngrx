import { Store } from '../lib/state';

describe('Selectors', () => {

    it("should select props from a selected path state slice", done => {
        interface State { feature: { prop: string } }
        const initial: State = { feature: { prop: 'a prop' } };
        const store = new Store(initial);

        store.select('feature').subscribe(slice => {
            expect(slice).toHaveProperty('prop');
            expect((<any>slice).prop).toEqual(initial.feature.prop);
            done();
        });
    });

    it("should select props from a selected function state slice", done => {
        interface State { feature: { prop: string } }
        const initial: State = { feature: { prop: 'a prop' } };
        const store = new Store(initial);
        const selectFeatureProp = (state: State) => state.feature.prop;

        store.select(selectFeatureProp).subscribe(slice => {
            expect(slice).toBe(initial.feature.prop);
            done();
        });
    });

    it("should throw when given an invalid selector", done => {
        const store = new Store();
        try {
            store.select(<string><unknown>{ a: 'random object' }).subscribe();
        } catch (e) {
            expect(e.message).toBe("Unexpected type 'object' in select operator, expected 'string' or 'function'");
            done();
        }
    });

});
