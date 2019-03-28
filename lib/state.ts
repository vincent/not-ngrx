import { Subject, Observable, combineLatest, ObservableInput, empty, Observer } from 'rxjs';
import { scan, startWith, shareReplay, filter, map, withLatestFrom, mergeAll, catchError } from 'rxjs/operators';

export class Actions extends Subject<Action> {
    ofType<A extends Action>(type: string): Observable<A> {
        return this.asObservable().pipe(filter(action => action.type === type), map(action => action as A));
    }
}

interface Type<T> extends Function { new (...args: any[]): T; }

export interface Action {
    type: string;
}

export type Reducer<State, Actions> = (state: State, action: Actions) => State;

export interface State { }

export const defaultInitialState: State = { }

export interface Action {
    type: string;
}

export class Store<T> extends Observable<T> implements Observer<Action> {
    private stateSubject = new Subject<State>();

    public actions$: Actions = new Actions();
    public errorHandler(error: string) {
        /* istanbul ignore next */
        throw new Error(error);
    }

    constructor(
        initialState: State = defaultInitialState,
        reducers: Reducer<State, Action>[] = [],
        effectsClasses: Type<any>[] = [],
        errorHandler?: (error: string) => void
    ) {
        super();

        if (errorHandler) this.errorHandler = errorHandler;
        this.stateSubject = new Subject<State>();
        this.source = this.stateSubject.asObservable().pipe(
            scan((acc: State, newVal: State) => ({ ...acc, ...newVal }), initialState),
            startWith(initialState),
            shareReplay(1)
        );

        this.actions$.pipe(
            withLatestFrom(this.source),
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

    next(partialState: State): void {
        this.stateSubject.next(partialState);
    };

    update(partialState: State): void {
        this.stateSubject.next(partialState);
    };

    dispatch<V extends Action = Action>(action: V): void {
        if (action instanceof Array) {
            action.forEach(action => setTimeout(_ => this.actions$.next(action), 0));
        } else {
            setTimeout(_ => this.actions$.next(action), 0);
        }
    }

    error(err: any) {
        this.actions$.error(err);
      }

    complete() {
        this.actions$.complete();
    }
}
