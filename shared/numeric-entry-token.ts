import {z} from "zod";
/** Preserve source lexemes while refusing nonfinite or underflowed nonzero input. */
export const numericEntryToken=z.string().min(1).max(128).regex(/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/).refine(value=>!/[\r\n]/.test(value)&&Number.isFinite(Number(value))&&(Number(value)!==0||!/[1-9]/.test(value.split(/[eE]/)[0])));
