import React, { useState } from 'react';
import './ScenarioComparison.css';

export type EvidenceKind = 'guideline_comparison' | 'validated_forecast' | 'research_simulation' | 'unavailable';
export type ScenarioOption = { id: string; title: string; action: string; effort: string; tradeoffs: string[]; nextMeasure: string; };
export type ScenarioExplanation = { kind: EvidenceKind; sourceText: string; actualInputs: string[]; limitations: string[]; endpoint?: string; horizon?: string; population?: string; modelVersion?: string; };
export type ScenarioComparisonProps = { options: ScenarioOption[]; explanation: ScenarioExplanation; onReviewOption?: (id: string) => void; mode?: 'everyday'|'athlete'|'coach'; };
const labels: Record<EvidenceKind,string> = {
  guideline_comparison:'Evidence-based comparison — not a personal forecast',
  validated_forecast:'Validated conditional forecast — not a measurement',
  research_simulation:'Experimental research simulation — not clinical guidance',
  unavailable:'Personalized forecast unavailable'
};
/** Presentation only. Developer must verify model eligibility, permissions and evidence server-side. */
export function ScenarioComparison({options,explanation,onReviewOption,mode='everyday'}:ScenarioComparisonProps){
 const [expanded,setExpanded]=useState(false);
 return <section className={`btwin btwin--${mode}`} aria-label="Compare approaches">
   <header><p className="btwin__eyebrow">BLOOM · COMPARE APPROACHES</p><h2>Choose a practical next step</h2><p>Review options against your goals, time and preferences.</p></header>
   <p className="btwin__status">{labels[explanation.kind]}</p>
   {explanation.kind==='unavailable' && <p role="status" className="btwin__notice">There is not enough reliable information for an individualized forecast. You can still compare options using general evidence.</p>}
   <div className="btwin__grid">{options.slice(0,3).map(o=><article className="btwin__card" key={o.id}><h3>{o.title}</h3><p>{o.action}</p><p><strong>Practical effort:</strong> {o.effort}</p><div><strong>Considerations</strong><ul>{o.tradeoffs.map((t,i)=><li key={i}>{t}</li>)}</ul></div><p><strong>Measure next:</strong> {o.nextMeasure}</p>{onReviewOption&&<button onClick={()=>onReviewOption(o.id)}>Review this option</button>}</article>)}</div>
   <div className="btwin__detail"><button type="button" aria-expanded={expanded} onClick={()=>setExpanded(!expanded)}>{expanded?'Hide':'Show'} information used and limitations</button>{expanded&&<div><h3>What this means</h3><p>{explanation.sourceText}</p>{explanation.endpoint&&<p><strong>Outcome:</strong> {explanation.endpoint}</p>}{explanation.horizon&&<p><strong>Time horizon:</strong> {explanation.horizon}</p>}{explanation.population&&<p><strong>Validated population:</strong> {explanation.population}</p>}{explanation.modelVersion&&<p><strong>Model version:</strong> {explanation.modelVersion}</p>}<strong>Actual inputs considered</strong><ul>{explanation.actualInputs.map((i,k)=><li key={k}>{i}</li>)}</ul><strong>Limits</strong><ul>{explanation.limitations.map((i,k)=><li key={k}>{i}</li>)}</ul></div>}</div>
 </section>
}
