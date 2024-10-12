import { doOnlyAfterResolve } from "./InstructionType.ts";
import SharedChannel from "./SharedChannel.ts";

//
//import * as cbor from "cbor-x";

//
if (typeof SharedChannel != 'undefined') {
    SharedChannel.prototype.waitAsync = function (timeout = 1000): unknown {
        const result = this.$promised(timeout);
        return doOnlyAfterResolve(result, (bin: unknown|Uint8Array)=>{
            return bin ? this.$binCoder?.decode?.(bin as Uint8Array) : null;
        });
    }
}