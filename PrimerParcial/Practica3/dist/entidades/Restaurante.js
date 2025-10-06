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
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Mesa } from "./Mesa";
let Restaurante = (() => {
    let _classDecorators = [Entity()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _id_restaurante_decorators;
    let _id_restaurante_initializers = [];
    let _id_restaurante_extraInitializers = [];
    let _nombre_decorators;
    let _nombre_initializers = [];
    let _nombre_extraInitializers = [];
    let _direccion_decorators;
    let _direccion_initializers = [];
    let _direccion_extraInitializers = [];
    let _telefono_decorators;
    let _telefono_initializers = [];
    let _telefono_extraInitializers = [];
    let _mesas_decorators;
    let _mesas_initializers = [];
    let _mesas_extraInitializers = [];
    var Restaurante = _classThis = class {
        constructor() {
            this.id_restaurante = __runInitializers(this, _id_restaurante_initializers, void 0);
            this.nombre = (__runInitializers(this, _id_restaurante_extraInitializers), __runInitializers(this, _nombre_initializers, void 0));
            this.direccion = (__runInitializers(this, _nombre_extraInitializers), __runInitializers(this, _direccion_initializers, void 0));
            this.telefono = (__runInitializers(this, _direccion_extraInitializers), __runInitializers(this, _telefono_initializers, void 0));
            // Relación: un restaurante tiene muchas mesas
            this.mesas = (__runInitializers(this, _telefono_extraInitializers), __runInitializers(this, _mesas_initializers, void 0));
            __runInitializers(this, _mesas_extraInitializers);
        }
    };
    __setFunctionName(_classThis, "Restaurante");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_restaurante_decorators = [PrimaryGeneratedColumn()];
        _nombre_decorators = [Column()];
        _direccion_decorators = [Column()];
        _telefono_decorators = [Column()];
        _mesas_decorators = [OneToMany(() => Mesa, (mesa) => mesa.restaurante)];
        __esDecorate(null, null, _id_restaurante_decorators, { kind: "field", name: "id_restaurante", static: false, private: false, access: { has: obj => "id_restaurante" in obj, get: obj => obj.id_restaurante, set: (obj, value) => { obj.id_restaurante = value; } }, metadata: _metadata }, _id_restaurante_initializers, _id_restaurante_extraInitializers);
        __esDecorate(null, null, _nombre_decorators, { kind: "field", name: "nombre", static: false, private: false, access: { has: obj => "nombre" in obj, get: obj => obj.nombre, set: (obj, value) => { obj.nombre = value; } }, metadata: _metadata }, _nombre_initializers, _nombre_extraInitializers);
        __esDecorate(null, null, _direccion_decorators, { kind: "field", name: "direccion", static: false, private: false, access: { has: obj => "direccion" in obj, get: obj => obj.direccion, set: (obj, value) => { obj.direccion = value; } }, metadata: _metadata }, _direccion_initializers, _direccion_extraInitializers);
        __esDecorate(null, null, _telefono_decorators, { kind: "field", name: "telefono", static: false, private: false, access: { has: obj => "telefono" in obj, get: obj => obj.telefono, set: (obj, value) => { obj.telefono = value; } }, metadata: _metadata }, _telefono_initializers, _telefono_extraInitializers);
        __esDecorate(null, null, _mesas_decorators, { kind: "field", name: "mesas", static: false, private: false, access: { has: obj => "mesas" in obj, get: obj => obj.mesas, set: (obj, value) => { obj.mesas = value; } }, metadata: _metadata }, _mesas_initializers, _mesas_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Restaurante = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Restaurante = _classThis;
})();
export { Restaurante };
