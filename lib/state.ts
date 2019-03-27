import { Subject, Observable, combineLatest, ObservableInput, empty } from 'rxjs';
import { scan, startWith, shareReplay, filter, map, withLatestFrom, mergeAll, catchError } from 'rxjs/operators';

export class Actions extends Subject<Action> {
    ofType<T extends Action>(type: string): Observable<T> {
        return this.asObservable().pipe(filter(action => action.type === type), map(action => action as T));
    }
}

interface Type<T> extends Function { new (...args: any[]): T; }

export type Reducer = (state: State, action: Action) => State;

export interface Store {
    state$: Observable<State>;
    actions$: Actions;
    update(partialState: State): void;
    dispatch(action: Action): void;
}

export interface State { }

export const defaultInitialState: State = { }

export interface Action {
    type: string;
}

export class Store implements Store {
    private stateSubject = new Subject<State>();

    public actions$: Actions = new Actions();
    public state$: Observable<State>;
    public errorHandler(error: string) {
        /* istanbul ignore next */
        throw new Error(error);
    }

    constructor(
        initialState: State = defaultInitialState,
        reducers: Reducer[] = [],
        effectsClasses: Type<any>[] = [],
        errorHandler?: (error: string) => void
    ) {
        if (errorHandler) this.errorHandler = errorHandler;
        this.stateSubject = new Subject<State>();
        this.state$ = this.stateSubject.asObservable().pipe(
            scan((acc: State, newVal: State) => ({ ...acc, ...newVal }), initialState),
            startWith(initialState),
            shareReplay(1)
        );

        this.actions$.pipe(
            withLatestFrom(this.state$),
            map(([action, state]) =>
            this.update(
                reducers.reduce((newState: State, reducer) => {
                    return { ...newState, ...reducer(newState, action) };
                }, state as State)
            )),
            catchError(error => {
                this.errorHandler(error);
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
                this.errorHandler(error);
                return empty();
            })
        ).subscribe(
            (action: Action) => this.dispatch(action)
        );
    }

    update(partialState: State): void {
        this.stateSubject.next(partialState);
    };

    dispatch(action: Action | Action[]): void {
        if (action instanceof Array) {
            action.forEach(action => setTimeout(_ => this.actions$.next(action), 0));
        } else {
            setTimeout(_ => this.actions$.next(action), 0);
        }
    }
}
