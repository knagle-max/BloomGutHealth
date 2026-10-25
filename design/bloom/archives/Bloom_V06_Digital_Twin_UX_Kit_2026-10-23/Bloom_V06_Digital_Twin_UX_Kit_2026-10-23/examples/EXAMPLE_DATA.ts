import type {ScenarioComparisonProps} from '../components/ScenarioComparison';
/** Synthetic UX fixtures only; NO expected health outcomes or clinical advice. */
export const noForecastExample:ScenarioComparisonProps = {
 mode:'everyday',
 explanation:{kind:'unavailable',sourceText:'These are general evidence-informed options, not simulated individual outcomes.',actualInputs:['User-selected goals: strength and lipid health','User preference: short weekday sessions'],limitations:['No repeated comparable results for a personal forecast','The difference in outcomes between these options has not been established for this individual']},
 options:[
  {id:'a',title:'Option A',action:'Follow a feasible food-and-activity routine using general guidance.',effort:'Short sessions across the week',tradeoffs:['Prioritizes consistency','Review personal constraints before beginning'],nextMeasure:'Dated adherence and agreed goal-specific outcome'},
  {id:'b',title:'Option B',action:'Discuss a different activity schedule while keeping nutrition guidance consistent.',effort:'Different distribution of weekly activity',tradeoffs:['May suit a different schedule','Requires reviewing recovery needs'],nextMeasure:'Comparable activity and goal-specific observation'}
 ]
};
