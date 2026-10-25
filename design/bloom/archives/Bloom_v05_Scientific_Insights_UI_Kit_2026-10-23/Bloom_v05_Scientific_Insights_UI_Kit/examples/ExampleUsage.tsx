import React from 'react';
import {ScientificInsight,ObservationTrend,InsightState} from '../components/ScientificInsight';
export default function Examples(){return <div className="si-kit" data-workspace="everyday" style={{display:'grid',gap:16,maxWidth:900}}>
<ScientificInsight area="lab" title="ALT — Alanine aminotransferase" state="unconfirmed" value="73" date="2026-02-10" source="Imported report" meaning="Original source did not provide a unit." nextAction="Confirm the unit printed on your source report before interpretation." details={<p>Illustrative only. No reference flag is applied to this unconfirmed measurement.</p>}/>
<ScientificInsight area="nutrition" title="Oats and beta-glucan" state="general-research" meaning="Research supports some cholesterol-lowering interventions with adequate beta-glucan intake; your individual response has not been measured." nextAction="Compare portions, tolerability and your broader goals."/>
<ScientificInsight area="microbiome" title="Organism reported by your provider" state="provider-reported" subtitle="Report method and sampling date required" meaning="A reported organism does not establish individual enzyme activity or metabolite production."/>
<ScientificInsight area="athlete" title="Completed strength session" state="user-entered" value="7/10" unit="session RPE" meaning="Reported workout effort is not a measure of readiness for your next workout."/>
<ObservationTrend title="Illustrative LDL-C history" unit="mmol/L" allowConnect observations={[{id:'a',date:'2026-01-10',value:2.9,unit:'mmol/L',source:'Example lab',comparable:true},{id:'b',date:'2026-10-10',value:3.4,unit:'mmol/L',source:'Example lab',comparable:true}]}/>
{(['missing','unit-review','incompatible','insufficient-evidence','loading','error'] as const).map(k=><InsightState key={k} kind={k}/>)}
</div>}
