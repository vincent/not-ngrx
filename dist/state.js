"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var ActionsSubject = /** @class */ (function (_super) {
    __extends(ActionsSubject, _super);
    function ActionsSubject() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ActionsSubject.prototype.ofType = function (type) {
        return this.asObservable().pipe(operators_1.filter(function (action) { return action.type === type; }), operators_1.map(function (action) { return action; }));
    };
    return ActionsSubject;
}(rxjs_1.Subject));
exports.ActionsSubject = ActionsSubject;
var Store = /** @class */ (function (_super) {
    __extends(Store, _super);
    function Store(initialState, reducers, effectsClasses) {
        if (initialState === void 0) { initialState = {}; }
        if (reducers === void 0) { reducers = []; }
        if (effectsClasses === void 0) { effectsClasses = []; }
        var _this = _super.call(this) || this;
        _this.rootState = new rxjs_1.Subject();
        _this.reducers = [];
        _this.actions$ = new ActionsSubject();
        _this.rootState = new rxjs_1.Subject();
        _this.reducers = _this.reducers.concat(reducers);
        _this.source = _this.rootState.asObservable().pipe(operators_1.scan(function (acc, newVal) { return (__assign({}, acc, newVal)); }, initialState), operators_1.startWith(initialState), operators_1.shareReplay(1));
        _this.actions$.pipe(operators_1.withLatestFrom(_this.source), operators_1.map(function (_a) {
            var action = _a[0], state = _a[1];
            return _this.rootState.next(_this.reducers.reduce(function (newState, reducer) {
                return __assign({}, newState, reducer(newState, action));
            }, state));
        }), operators_1.catchError(function (error) {
            _this.error(error);
            return rxjs_1.empty();
        })).subscribe();
        var effects = effectsClasses.reduce(function (effects, klass) {
            var effectsClassInstance = new klass(_this);
            return effects.concat(effectsClassInstance.effects);
        }, []);
        rxjs_1.combineLatest.apply(null, effects).pipe(
        // @ts-ignore: Strict
        operators_1.mergeAll(), operators_1.filter(function (action) { return !!action; }), operators_1.catchError(function (error) {
            _this.error(error);
            return rxjs_1.empty();
        })).subscribe(function (action) { return setTimeout(function (_) { return _this.dispatch(action); }, 0); });
        return _this;
    }
    Store.prototype.dispatch = function (action) {
        var _this = this;
        if (action instanceof Array) {
            action.map(function (a) { return _this.actions$.next(a); });
        }
        else {
            this.actions$.next(action);
        }
    };
    Store.prototype.next = function (action) {
        this.actions$.next(action);
    };
    Store.prototype.error = function (err) {
        this.actions$.error(err);
    };
    Store.prototype.complete = function () {
        this.actions$.complete();
    };
    Store.prototype.addReducer = function (reducer) {
        this.reducers.push(reducer);
    };
    Store.prototype.removeReducer = function (reducer) {
        this.reducers = this.reducers.filter(function (r) { return r !== reducer; });
    };
    Store.prototype.select = function (pathOrMapFn) {
        var mapped$;
        if (typeof pathOrMapFn === 'string') {
            mapped$ = this.source.pipe(operators_1.pluck.apply(void 0, pathOrMapFn.split('.')));
        }
        else if (typeof pathOrMapFn === 'function') {
            mapped$ = this.pipe(operators_1.map(function (source) { return pathOrMapFn(source); }));
        }
        else {
            throw new TypeError("Unexpected type '" + typeof pathOrMapFn + "' in select operator," +
                " expected 'string' or 'function'");
        }
        return mapped$.pipe(operators_1.distinctUntilChanged());
    };
    return Store;
}(rxjs_1.Observable));
exports.Store = Store;
//# sourceMappingURL=state.js.map