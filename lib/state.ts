import { Subject, Observable, combineLatest, empty, Observer } from 'rxjs';
import { scan, startWith, shareReplay, filter, map, withLatestFrom, mergeAll, catchError, pluck, distinctUntilChanged } from 'rxjs/operators';
import { Action, ActionReducer, Type } from './models';

export class ActionsSubject extends Subject<Action> {
    ofType<A extends Action>(type: string): Observable<A> {
        return this.asObservable().pipe(filter(action => action.type === type), map(action => action as A));
    }
}

export class Store<T> extends Observable<T> implements Observer<Action> {
    private rootState = new Subject<T>();
    private reducers: any[] = [];

    public actions$: ActionsSubject = new ActionsSubject();

    constructor(
        initialState: T = <T>{},
        reducers: any[] = [],
        effectsClasses: Type<any>[] = []
    ) {
        super();

        this.rootState = new Subject<T>();
        this.reducers = this.reducers.concat(reducers);
        this.source = this.rootState.asObservable().pipe(
            scan((acc: T, newVal: T) => ({ ...acc, ...newVal }), initialState),
            startWith(initialState),
            shareReplay(1)
        );

        this.actions$.pipe(
            withLatestFrom(this.source),
            map(([action, state]) =>
                this.rootState.next(
                    this.reducers.reduce((newState: T, reducer) => {
                        return { ...newState, ...reducer(newState, action) };
                    }, state)
                )
            ),
            catchError(error => {
                this.error(error);
                return empty();
            })
        ).subscribe();

        const effects: Observable<any>[] = effectsClasses.reduce((effects, klass) => {
            const effectsClassInstance = new klass(this);
            return effects.concat(effectsClassInstance.effects);
        }, []);

        combineLatest.apply(null, effects).pipe(
            // @ts-ignore: Strict
            mergeAll(),
            filter(action => !!action),
            catchError(error => {
                this.error(error);
                return empty();
            })
        ).subscribe(
            (action: Action) => setTimeout(_ => this.dispatch(action), 0)
        );
    }

    dispatch<V extends Action = Action>(action: V | V[]) {
        if (action instanceof Array) {
            action.map(a => this.actions$.next(a));

        } else {
            this.actions$.next(action);
        }
    }

    next(action: Action) {
        this.actions$.next(action);
    }

    error(err: any) {
        this.actions$.error(err);
    }

    complete() {
        this.actions$.complete();
    }

    addReducer<T, Actions extends Action = Action>(reducer: ActionReducer<T, Actions>) {
        this.reducers.push(reducer);
    }

    removeReducer<T, Actions extends Action = Action>(reducer: ActionReducer<T, Actions>) {
        this.reducers = this.reducers.filter(r => r !== reducer);
    }

    select<Props, K>(
        pathOrMapFn: ((state: T, props?: Props) => any) | string
    ): Observable<K> {
        let mapped$: Observable<any>;

        if (typeof pathOrMapFn === 'string') {
            mapped$ = this.source.pipe(pluck(...pathOrMapFn.split('.')));

        } else if (typeof pathOrMapFn === 'function') {
            mapped$ = this.pipe(
                map(source => pathOrMapFn(source))
            );

        } else {
            throw new TypeError(
                `Unexpected type '${typeof pathOrMapFn}' in select operator,` +
                ` expected 'string' or 'function'`
            );
        }

        return mapped$.pipe(distinctUntilChanged());
    }
}
