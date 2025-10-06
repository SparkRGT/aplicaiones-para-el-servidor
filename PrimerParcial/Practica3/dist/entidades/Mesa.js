var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
let Mesa = (() => {
    let _classDecorators = [Entity()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _id_mesa_decorators;
    let _id_mesa_initializers = [];
    let _id_mesa_extraInitializers = [];
    let _numero_decorators;
    let _numero_initializers = [];
    let _numero_extraInitializers = [];
    let _capacidad_decorators;
    let _capacidad_initializers = [];
    let _capacidad_extraInitializers = [];
    let _estado_decorators;
    let _estado_initializers = [];
    let _estado_extraInitializers = [];
    let _restaurante_decorators;
    let _restaurante_initializers = [];
    let _restaurante_extraInitializers = [];
    var Mesa = _classThis = class {
        constructor() {
            this.id_mesa = __runInitializers(this, _id_mesa_initializers, void 0);
            this.numero = (__runInitializers(this, _id_mesa_extraInitializers), __runInitializers(this, _numero_initializers, void 0));
            this.capacidad = (__runInitializers(this, _numero_extraInitializers), __runInitializers(this, _capacidad_initializers, void 0));
            this.estado = (__runInitializers(this, _capacidad_extraInitializers), __runInitializers(this, _estado_initializers, void 0));
            // Relación: muchas mesas pertenecen a un restaurante
            this.restaurante = (__runInitializers(this, _estado_extraInitializers), __runInitializers(this, _restaurante_initializers, void 0));
            __runInitializers(this, _restaurante_extraInitializers);
        }
    };
    __setFunctionName(_classThis, "Mesa");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_mesa_decorators = [PrimaryGeneratedColumn()];
        _numero_decorators = [Column()];
        _capacidad_decorators = [Column()];
        _estado_decorators = [Column()];
        _restaurante_decorators = [ManyToOne(() => Restaurante, (restaurante) => restaurante.mesas)];
        __esDecorate(null, null, _id_mesa_decorators, { kind: "field", name: "id_mesa", static: false, private: false, access: { has: obj => "id_mesa" in obj, get: obj => obj.id_mesa, set: (obj, value) => { obj.id_mesa = value; } }, metadata: _metadata }, _id_mesa_initializers, _id_mesa_extraInitializers);
        __esDecorate(null, null, _numero_decorators, { kind: "field", name: "numero", static: false, private: false, access: { has: obj => "numero" in obj, get: obj => obj.numero, set: (obj, value) => { obj.numero = value; } }, metadata: _metadata }, _numero_initializers, _numero_extraInitializers);
        __esDecorate(null, null, _capacidad_decorators, { kind: "field", name: "capacidad", static: false, private: false, access: { has: obj => "capacidad" in obj, get: obj => obj.capacidad, set: (obj, value) => { obj.capacidad = value; } }, metadata: _metadata }, _capacidad_initializers, _capacidad_extraInitializers);
        __esDecorate(null, null, _estado_decorators, { kind: "field", name: "estado", static: false, private: false, access: { has: obj => "estado" in obj, get: obj => obj.estado, set: (obj, value) => { obj.estado = value; } }, metadata: _metadata }, _estado_initializers, _estado_extraInitializers);
        __esDecorate(null, null, _restaurante_decorators, { kind: "field", name: "restaurante", static: false, private: false, access: { has: obj => "restaurante" in obj, get: obj => obj.restaurante, set: (obj, value) => { obj.restaurante = value; } }, metadata: _metadata }, _restaurante_initializers, _restaurante_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Mesa = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Mesa = _classThis;
})();
export { Mesa };
