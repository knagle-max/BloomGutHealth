import {capabilityRecord,capabilityApproval} from './capability-policy';
import {experimentalEntrySchema,type ExperimentalPresentationEntry,type DevelopmentFeature} from '../shared/development-features';
// Display text only, never entitlements or model execution instructions.
const display={
 'bloom.food.photo_ai':{group:'AI_FOOD',title:'Food photo preview',description:'Review a synthetic photo locally alongside a manual food description.'},
 'bloom.exercise.advanced':{group:'ATHLETE',title:'Advanced training',description:'Development status for advanced training tools.'},
 'bloom.microbiome.flux':{group:'BIOLOGY',title:'Microbial simulation',description:'Research simulations remain separate from measured biology and clinical conclusions.'},
 'bloom.genetics.diet_rank':{group:'GENETICS',title:'Genetics research',description:'Development status for genetics research.'},
 'bloom.coach.athlete':{group:'COACH',title:'Athlete coaching',description:'Development status for athlete coaching tools.'},
 'bloom.healthkit':{group:'INTEGRATIONS',title:'Health data integration',description:'Development status for optional device integrations.'},
 'bloom.research.evidence_bridge':{group:'RESEARCH',title:'Evidence research',description:'Development status for source-linked evidence tools.'},
} as const;
export function experimentalWorkspace(metadataIds:readonly string[]=[],features:readonly DevelopmentFeature[]=[]):ExperimentalPresentationEntry[]{
 const ids=new Set([...metadataIds,...features.map(feature=>feature.id)]),rows:ExperimentalPresentationEntry[]=[];
 for(const [id,text] of Object.entries(display)){
  if(!ids.has(id))continue;
  const record=capabilityRecord(id);
  if(!record||!['GENERAL_RELEASE','HIDDEN_PENDING_APPROVAL','INTERNAL_RESEARCH_ONLY'].includes(record.release_category)||['REJECTED','SUSPENDED'].includes(capabilityApproval(record.approval_status)))continue;
  const preview=id==='bloom.food.photo_ai'&&features.some(feature=>feature.id===id&&feature.outputClass==='synthetic-ui-only');
  const restricted=record.release_category==='INTERNAL_RESEARCH_ONLY';
  const row=experimentalEntrySchema.safeParse({id,...text,readiness:'IN_DEVELOPMENT',metadataVisible:true,actionAllowed:preview,
   visibilityStatus:preview?'DEVELOPMENT_PREVIEW':restricted?'RESTRICTED':'IN_DEVELOPMENT',interaction:preview?'OPEN_SYNTHETIC_PREVIEW':'INFO_ONLY',
   ...(preview?{route:'/log-meal?method=photo',sourceClass:'SYNTHETIC_ONLY',limitations:['Synthetic local file preview only. No image AI or personal health analysis.']}:{limitations:['Status information only; this entry does not enable the feature.']}),
  });if(row.success)rows.push(row.data);
 }
 return rows;
}
