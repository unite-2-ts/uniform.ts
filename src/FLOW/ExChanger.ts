// deno-lint-ignore-file no-explicit-any
import UniversalHandler from "../Handlers/UniversalHandler.ts";
import FLOW, { type WorkerContext } from "./FLOW.ts";
import RemoteReferenceHandler from "../Handlers/RemotePool.ts";
import ObjectPoolMemberHandler from "../Handlers/ObjectPool.ts";
import DataHandler from "../Handlers/DataHandler.ts";
import UUIDMap from "../Utils/UUIDMap.ts";
import PreCoding from "../PreCoding/PreCoding.ts";
import { doOnlyAfterResolve, isPromise } from "../Instruction/Defer.ts";
import { MakeReference} from "../Instruction/InstructionType.ts"
import PromiseHandler from "../Handlers/PromiseHandler.ts";
import ObjectProxy, { IWrap } from "../Instruction/ObjectProxy.ts";
import ORG from "../Instruction/InstructionType.ts";

//
export default class ExChanger {
    #flow: FLOW | null = null;
    #handler: UniversalHandler | null = null;
    #memoryPool: UUIDMap | null = null;
    #coder: PreCoding | null = null;

    //
    constructor(context: WorkerContext) {
        this.#flow = new FLOW(context);
    }

    //
    async initialize() {
        await this.#flow?.importToUnit("./MessageChannel.ts");
        await this.#flow?.importToSelf(import("./MessageChannel.ts"));

        //
        this.#coder      = this.#flow?.$imports?.$coders      ?? this.#coder;
        this.#memoryPool = this.#flow?.$imports?.$memoryPool  ?? this.#memoryPool;
        this.#handler    = this.#flow?.$imports?.$dataHandler ?? this.#handler;

        //
        if (this.#handler) {
            this.#handler?.$addHandler("local", new ObjectPoolMemberHandler(this.#memoryPool));
            this.#handler?.$addHandler("remote", new RemoteReferenceHandler(this));
            this.#handler?.$addHandler("promise", new PromiseHandler());
            this.#handler?.$addHandler("direct", new DataHandler());
        } else {
            throw Error("Invalid Native Module!");
        }

        //
        return this.sync();
    }

    //
    get $imports() {
        return this.#flow?.$imports || {};
    }

    //
    $sync() { return this.#flow?.sync?.(); }

    //
    $request<T extends unknown>(cmd: string, meta: unknown, args : unknown[]): IWrap<T>|null {
        const transfer: unknown[] = [];
        const encoded = this.#coder?.encode([cmd, meta, ...args], transfer) as any[];
        const result = this.#flow?.callTask?.(encoded, transfer);

        //
        try {
            const coded = doOnlyAfterResolve(result, (res)=>this.#coder?.decode?.(res, transfer));
            if (isPromise(coded)) { return ((new Proxy(MakeReference(coded), new ObjectProxy(this.#handler?.$getHandler?.("promise")))) as IWrap<T>); }
            return coded as IWrap<T>;;
        } catch (e) {
            console.error(e)
        }
        return null;
    }

    //
    //unwrap(obj) { return obj?.[$data] ?? obj; }
    //local(name) { return wrapMeta({ORG.uuid: name, ORG.type: "reference"}, this.#handler); }

    //
    $importToUnit(source: string) { return this.#flow?.importToUnit(source); }
    $importToSelf(module: unknown) { return this.#flow?.importToSelf(module); }

    //
    async sync() { await this.$sync(); return this; }

    //
    register(object: any, name = ""): string | null {
        const uuid = this.#memoryPool?.add?.(object, name);
        //this.#flow?.sync?.();
        return uuid||"";
    }

    //
    access<T extends unknown>(name = ""): IWrap<T>|null {
        const com = this.$request("access", {[ORG.uuid]: name, [ORG.type]: "reference"}, []) as IWrap<T>|null;
        //this.#flow?.sync?.();
        return com;
    }

    //
    transfer<T extends unknown>(name = "", node: T | null = null): IWrap<T> {
        let result = null;
        if (node != null) {
            result = this.$request("access", {[ORG.uuid]: name, [ORG.type]: "transfer", [ORG.node]: node}, []);
        } else {
            result = this.$request("transfer", {[ORG.uuid]: name, [ORG.type]: "reference"}, []);
        }
        //this.#flow?.sync?.();
        return result as IWrap<T>;
    }
}
