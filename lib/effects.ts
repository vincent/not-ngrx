import { Store, Action } from './state';
import { Observable } from 'rxjs';

export const METADATA_KEY = '__@nnrx/effects__';

export function Effect() {
    return function (target: Effects, propertyKey: string) {
        const ctor: any = target.constructor;
        const meta = ctor[METADATA_KEY] ? ctor[METADATA_KEY] : (ctor[METADATA_KEY] = []);
        meta.push(propertyKey);
    } as (target: {}, propertyName: string | symbol) => void;
}

export class Effects {
    get actions$() { return this.store$.actions$; };
    get effects(): Observable<Action>[] {
        // @ts-ignore: Strict
        return ((this.constructor[METADATA_KEY] as string[]) || []).map((e: string) => this[e]);
    };
    constructor(protected store$: Store) {}
}
