"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.METADATA_KEY = '__@nnrx/effects__';
function Effect() {
    return function (target, propertyKey) {
        var ctor = target.constructor;
        var meta;
        if (!ctor.hasOwnProperty(exports.METADATA_KEY)) {
            ctor[exports.METADATA_KEY] = [];
        }
        meta = ctor[exports.METADATA_KEY];
        meta.push(propertyKey);
    };
}
exports.Effect = Effect;
var Effects = /** @class */ (function () {
    function Effects(store$) {
        this.store$ = store$;
    }
    Object.defineProperty(Effects.prototype, "actions$", {
        get: function () { return this.store$.actions$; },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(Effects.prototype, "effects", {
        get: function () {
            var _this = this;
            if (this.constructor.hasOwnProperty(exports.METADATA_KEY)) {
                // @ts-ignore: Strict
                return this.constructor[exports.METADATA_KEY].map(function (e) { return _this[e]; });
            }
            return [];
        },
        enumerable: true,
        configurable: true
    });
    ;
    return Effects;
}());
exports.Effects = Effects;
//# sourceMappingURL=effects.js.map