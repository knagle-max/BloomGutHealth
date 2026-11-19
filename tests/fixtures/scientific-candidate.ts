import {publicResearchTaskDigest,type ReviewedPublicResearchTask} from '../../server/scientific-question-boundary';
import {geminiScienceSourceSetDigest} from '../../server/gemini-science-research';
import {prepareScientificCandidateProvenance,type CandidateRetentionAuthority} from '../../server/scientific-candidate-provenance';
export function scientificCandidateFixture(){
 const request={taskId:'synthetic-public-task',question:'What are general limitations of in vitro culture models?',
  declaredDataClass:'nonpersonal-published-science' as const,approvedForUnpaidGoogleProcessing:true as const,
  sources:[{sourceId:'synthetic-public-source',title:'Synthetic reviewed reference',excerpt:'Synthetic source excerpt for structure tests only.',
   evidenceClass:'curated-reference' as const,status:'source-reviewed-for-research' as const,rights:'approved-for-provider-research' as const}]};
 const task:ReviewedPublicResearchTask={request,review:{id:'synthetic-task-review',scope:'broad-nonpersonal-question-and-public-excerpts',
  approvedDigest:publicResearchTaskDigest(request),validUntil:'2030-01-01T00:00:00Z',withdrawn:false}};
 const result={status:'candidate_unreviewed',provider:'google-gemini',model:'gemini-3.5-flash-lite',taskId:request.taskId,
  sourceSetSha256:geminiScienceSourceSetDigest(request.sources),claims:{question:request.question,
   hypotheses:[{claim:'Synthetic generated prose must never be retained here.',evidenceSourceIds:['synthetic-public-source'],uncertainty:'This is a synthetic contract fixture.',hypothesis:true}],
   contradictingFindings:[],unansweredQuestions:[]},usage:{inputTokens:12,outputTokens:null},noKnowledgePromotion:true};
 const authority:CandidateRetentionAuthority={revision:'synthetic-authority-v1',now:Date.parse('2026-11-19T00:00:00Z'),publicTasks:[task],
  approvedCandidateReceiptDigests:new Set(),
  withdrawals:{relationshipIds:new Set(),sourceIds:new Set(),reviewIds:new Set(),rightsIds:new Set()}};
 (authority.approvedCandidateReceiptDigests as Set<string>).add(prepareScientificCandidateProvenance(result,authority).id);
 return {request,task,result,authority};
}
