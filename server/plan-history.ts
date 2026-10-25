/** Stored plan checks describe a past computation, never current safety clearance.
 * Preserve the owner's snapshot and request; only a fresh planning operation can
 * check current context/catalogue. Same version strings do not establish that. */
export function historicalPlanRecord<T extends {kind:string;payload:unknown}>(record:T) {
 const payload=record.payload;
 if(record.kind!=='plan'||!payload||typeof payload!=='object'||Array.isArray(payload)||(payload as {type?:unknown}).type!=='weekly-plan')return record;
 return {...record,interpretationStatus:'historical_plan_not_revalidated' as const,currentUse:'rebuild_required' as const,limitation:'Saved estimates and checks describe the recorded plan only. Rebuild against current health context, preferences and sources before using it as a current plan.'};
}
