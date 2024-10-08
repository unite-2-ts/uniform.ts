// deno-lint-ignore-file no-explicit-any
import { extract } from "../Instruction/Defer.ts";

//
export default class DataHandler {
    constructor() {
    }

    //
    $data(target: unknown|string|null) { return target; };
    $handle(cmd: string, meta: unknown, ...args: unknown[]) {
        const ref = this.$data(meta);

        // any illegal is illegal (after 'then' or defer operation)...
        if (ref == null || (typeof ref != "object" && typeof ref != "function")) { return ref; }

        // needs to return itself
        if (cmd == "access") { return ref; }
        if (cmd == "transfer") {
            // sometimes, `@uuid` may already is known from memory pool
            const wrap = extract(meta);
            return {"@type": "transfer", "@node": ref, "@uuid": wrap?.["@uuid"] ?? ""}
        };

        //
        try {
            //return bindCtx(Reflect?.[cmd]?.(ref, ...args), ref);

            // @ts-ignore "no-idea"
            return Reflect?.[cmd]?.(ref, ...args);
        } catch(e) {
            const err = e as Error;
            console.error("Wrong op: " + err.message);
            console.trace(err);
        }

        //
        return ref;
    }

    //
    $get(_uuid: unknown|string|null): any { return null; };
}
