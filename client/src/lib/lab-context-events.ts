export const LAB_CONTEXT_CHANGED='bloom-lab-context-changed';
/** In-tab invalidation only; no answer, source ID or health value is broadcast. */
export function notifyLabContextChanged(origin:string,scopeHash:string){window.dispatchEvent(new CustomEvent(LAB_CONTEXT_CHANGED,{detail:{origin,scopeHash}}));}
