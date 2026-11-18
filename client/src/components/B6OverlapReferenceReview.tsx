import {useAuth} from '@/lib/auth';
import {useDietaryReferenceContext} from '@/hooks/use-dietary-reference-context';
import {recordedB6ReferenceReview} from '@shared/recorded-b6-reference-review';
import type {recordedIntakeViewSchema} from '@shared/recorded-intake-sources';
import type {z} from 'zod';
/** Relevant context loads with confirmed overlap, without another form. */
export default function B6OverlapReferenceReview({sources}:{sources:z.infer<typeof recordedIntakeViewSchema>}){
 const {user}=useAuth(),matching=useDietaryReferenceContext('vitamin_b6_mg',sources.date,sources.timeZone,'nonpregnant-nonlactating-adult',!!user);
 const context=!matching.isFetching&&!matching.isError&&!matching.isStale?matching.data:undefined;
 const review=user&&sources.userId===user.id&&context?recordedB6ReferenceReview(sources,user.id,context):null;
 if(!review)return null;
 return <section aria-label="Recorded B6 overlap reference review" className="space-y-2 min-w-0 [overflow-wrap:anywhere]">
  <p className="font-semibold">{review.finding}</p><p>{review.reference.amount} {review.reference.unit} · published total-intake limit</p>
  <p>{review.biologicalMeaning}</p><p>{review.discussion}</p>
  <details><summary className="min-h-11 cursor-pointer">Reference source and limits</summary><p>{review.materialUnknowns.join(' ')}</p><p>Health Canada retains the older100 mg/day adult UL; EFSA2023 uses12 mg/day. These distinct references are not interchangeable. Neither establishes a personal safe dose or a toxicity diagnosis.</p><a className="text-link inline-flex min-h-11 items-center" href={review.source.url} target="_blank" rel="noopener noreferrer">{review.source.title}</a></details>
 </section>;
}
