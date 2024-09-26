//
import UniversalHandler from "../Handlers/UniversalHandler.ts";
import PreCoding from "../PreCoding/PreCoding";

//
export const $coders      = new PreCoding();
export const $memoryPool  = $coders.memoryPool;
export const $dataHandler = $coders.handler;

//
export const $handler = (command) => {
    //console.log(command);
    const {cmd: nac, uuid, dir, args: [cmd, target, ...args]} = command;

    //
    let transfer: any[] = [];
    if (cmd == "apply" && args.length >= 3) {
        transfer.push(...args.splice(2));
    }

    // before you needs decode its
    const result = $dataHandler?.$getHandler?.("promise")?.$handle?.(cmd, target, ...args);
    return [$coders.encode(result, transfer), transfer] // also, needs to recode back
}

//
export const $resolver = (command) => {
    const transfer = [];
    const {cmd, uuid, dir, result} = command;
    return $coders.decode(result, transfer); // also, needs to decode
}