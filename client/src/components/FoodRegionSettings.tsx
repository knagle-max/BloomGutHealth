import {Button} from "./ui/button";
import {restaurantRegions} from '@shared/restaurant-entry';
import {useExperience} from '@/lib/experience';

export default function FoodRegionSettings(){
 const{settings,patch,ready,saving,loading,error,retry}=useExperience();
 return <section className="bloom-panel space-y-3" aria-labelledby="food-region-heading">
  <h2 id="food-region-heading">Food browsing region</h2>
  <label className="block">Starting region for restaurant browsing
   <select className="bloom-input w-full" aria-label="Food browsing region" value={settings.practical.region??''} disabled={!ready||saving} onChange={event=>{const region=restaurantRegions.find(value=>value===event.target.value)||null;patch({practical:{...settings.practical,region}});}}>
    <option value="">No saved region (Canada default)</option>{restaurantRegions.map(region=><option key={region} value={region}>{region}</option>)}
   </select>
  </label>
  <p className="panel-note">Changes save automatically. The shown value is the last checked saved choice. You can choose a different region for each meal. Your measurement units stay as chosen.</p>
  <p className="panel-note">Browsing region does not establish residence or confirm a product’s country, formulation or availability. Check the menu or package you use.</p>
  {saving&&<p role="status">Saving preferences…</p>}
  {loading&&<p role="status">Checking saved browsing region…</p>}
  {error&&<div className="space-y-2"><p>The browsing-region save or source could not be confirmed. Check the latest saved settings before changing it again.</p><Button variant="outline" disabled={loading||saving} onClick={retry}>Retry saved preferences</Button></div>}
 </section>;
}
