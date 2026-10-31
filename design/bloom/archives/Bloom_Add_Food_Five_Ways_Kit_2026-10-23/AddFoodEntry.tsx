import React from 'react';
import './add-food-entry.css';
export type AddFoodMethod = 'barcode' | 'foods' | 'restaurants' | 'photo' | 'describe';
export type MethodAvailability = { available: boolean; reason?: string; alternative?: AddFoodMethod };
export type AddFoodEntryProps = {
  availability: Partial<Record<AddFoodMethod, MethodAvailability>>;
  onChoose: (method: AddFoodMethod) => void;
  /** Capability and consent states are provided by the host application, never inferred from this presentational component. */
};
const methods: {id:AddFoodMethod; title:string; desc:string}[] = [
 {id:'barcode',title:'Scan barcode',desc:'Scan a packaged product'},
 {id:'foods',title:'Search foods',desc:'Find generic or branded grocery foods'},
 {id:'restaurants',title:'Search restaurants',desc:"Find menu items from restaurants like McDonald’s"},
 {id:'photo',title:'Take a photo',desc:'Photograph your meal or food label'},
 {id:'describe',title:'Describe what I ate',desc:'Type a meal in your own words'},
];
export function AddFoodEntry({availability,onChoose}:AddFoodEntryProps) {
  return <main className="bloom-add-food" aria-labelledby="bloom-addfood-title">
    <h1 id="bloom-addfood-title">Add Food</h1>
    <p className="bloom-add-food__intro">How would you like to add your food?</p>
    <div className="bloom-add-food__methods">
      {methods.map(({id,title,desc}) => {
        const state=availability[id] ?? {available:false,reason:'Availability not yet confirmed'};
        return <div className="bloom-add-food__item" key={id}>
          <button type="button" className="bloom-add-food__method" onClick={()=>onChoose(id)} disabled={!state.available}
             aria-describedby={`${id}-desc ${!state.available?`${id}-status`:''}`}>
            <img src={`/brand/add-food/icon-${id}.svg`} alt="" aria-hidden="true" />
            <span><strong>{title}</strong><small id={`${id}-desc`}>{desc}</small></span><span aria-hidden="true">›</span>
          </button>
          {!state.available && <p className="bloom-add-food__status" id={`${id}-status`}>
            {state.reason || 'Not currently available'}.
            {state.alternative && <button type="button" onClick={()=>onChoose(state.alternative!)}>Use {methods.find(x=>x.id===state.alternative)?.title.toLowerCase()} instead</button>}
          </p>}
        </div>;
      })}
    </div>
    <p className="bloom-add-food__foot">Choose a different method each time. All entries use the same food review and save process.</p>
  </main>;
}
