import test from 'node:test';
import assert from 'node:assert/strict';
import {primaryNavigation,navigationGroups,athletePrimaryNavigation,athleteNavigationGroups,navigationCurrent} from '../client/src/content/navigation';

test('five primary destinations are shared across the shell and preserve every previous Everyday/Athlete tool route',()=>{
 assert.deepEqual(primaryNavigation.map(item=>[item.label,item.path]),[['Today','/'],['Food','/nutrition'],['Biology','/precision'],['Explore','/explore'],['Progress','/progress']]);
 assert.equal(navigationGroups[0].items,primaryNavigation);
 const paths=navigationGroups.flatMap(group=>group.items.map(item=>item.path));assert.equal(new Set(paths).size,paths.length,'Moving Food and Explore never duplicates competing primary entries');
 assert.deepEqual([...paths].sort(),['/','/precision','/progress','/nutrition','/activity','/plan-day','/meal-planner','/saved-meals','/explore','/microbiome','/insights','/upload','/profile'].sort(),'Every legacy Everyday destination remains reachable');
 assert.deepEqual(athletePrimaryNavigation.map(item=>item.path),['/athlete','/athlete/fueling','/nutrition','/athlete/recovery','/athlete/competition']);
 assert.deepEqual(athleteNavigationGroups.flatMap(group=>group.items.map(item=>item.path)).sort(),['/athlete','/athlete/fueling','/athlete/recovery','/athlete/competition','/explore','/progress','/nutrition','/saved-meals','/precision','/microbiome','/upload','/profile'].sort());
});
test('deep source/food/review views retain section context without claiming a different destination is the current page',()=>{
 for(const [route,parent]of[['/log-meal','/nutrition'],['/saved-meals','/nutrition'],['/meal-planner','/nutrition'],['/plan-day','/nutrition'],['/biology/reports','/precision'],['/microbiome','/precision'],['/upload','/precision'],['/weekly-review','/progress']]){
  assert.equal(navigationCurrent(parent,route,'everyday'),'location');assert.equal(navigationCurrent(route,route,'everyday'),'page');
 }
 assert.equal(navigationCurrent('/nutrition','/activity','everyday'),undefined);assert.equal(navigationCurrent('/','/explore','everyday'),undefined);
 assert.equal(navigationCurrent('/athlete','/athlete/fueling','athlete'),undefined);assert.equal(navigationCurrent('/athlete/fueling','/athlete/fueling','athlete'),'page');
});
