export const restaurantRegions=['Canada','United States','Other / unspecified'] as const;
/** Brand-name shortcuts only: never places, current menus or verified nutrients. */
const common:Record<string,readonly string[]>={
 Canada:["McDonald's","Tim Hortons","A&W","Subway","Starbucks","Wendy's","Burger King","Harvey's"],
 'United States':["McDonald's","Subway","Starbucks","Wendy's","Burger King","Taco Bell","Panera Bread","Chipotle"],
};
export function commonRestaurantNames(query:string,region:string){const key=(text:string)=>text.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');const q=key(query);return (common[region]||[]).filter(name=>key(name).includes(q));}
export function restaurantSuggestions(query:string,region:string,recent:readonly {restaurant:string;market:string}[]=[]){
 const norm=(value:string)=>value.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]/g,'');const q=norm(query),seen=new Set<string>();
 return [...recent.filter(r=>r.market===region&&r.restaurant.trim()&&r.restaurant.length<=150&&norm(r.restaurant).includes(q)).slice(0,8).map(r=>({name:r.restaurant,kind:'Recent restaurant'})),...commonRestaurantNames(query,region).map(name=>({name,kind:'Common brand'}))].filter(row=>{const key=norm(row.name);if(seen.has(key))return false;seen.add(key);return true;}).slice(0,12);
}
