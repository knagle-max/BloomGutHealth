import type {PracticalChoiceDiagnostics} from '@shared/practical-planner';
import {nutrientDefinitions} from '@shared/meal-intelligence';

export default function MealChoiceConstraints({diagnostics}:{diagnostics?:PracticalChoiceDiagnostics}){
  if(!diagnostics)return null;
  return <details className="bloom-panel space-y-3">
    <summary>How your planning constraints affect choices</summary>
    <p>{diagnostics.testedPortions} recipe portions checked after food preferences and allergy exclusions.</p>
    {!diagnostics.testedPortions?<p>No recipes for this meal slot remained after those exclusions.</p>:<>
      <ul className="list-disc pl-5">
        {diagnostics.excludedForTime>0&&<li>{diagnostics.excludedForTime} did not fit your preparation time.</li>}
        {diagnostics.excludedForEquipment>0&&<li>{diagnostics.excludedForEquipment} did not fit your available equipment.</li>}
        {diagnostics.nutrientLimits.map(check=><li key={check.key}>{nutrientDefinitions.find(([key])=>key===check.key)?.[1]||'Selected nutrient'}: {check.exceeded} exceeded the planning allowance using known logged amounts; {check.unavailable} lacked the recipe composition needed to check it.</li>)}
      </ul>
      <p className="panel-note">Checks can overlap. Protein preferences rank only options that pass these checks; they never override a selected maximum. Missing logged nutrition leaves daily compliance unverified. Bloom has not relaxed your limits or changed your targets.</p>
    </>}
  </details>;
}
