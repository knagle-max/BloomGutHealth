import {Home,UtensilsCrossed,CalendarDays,Dna,Activity,BookOpen,TrendingUp,Network,Upload,UserRound} from 'lucide-react';

/** One primary shell across mobile, desktop and the mobile drawer. Secondary
 * tools retain their existing routes; Athlete's approved workspace stays intact. */
export const primaryNavigation=[
 {id:'dashboard',path:'/',label:'Today',icon:Home},
 {id:'nutrition',path:'/nutrition',label:'Food',icon:UtensilsCrossed},
 {id:'precision',path:'/precision',label:'Biology',icon:Dna},
 {id:'explore',path:'/explore',label:'Explore',icon:Network},
 {id:'progress',path:'/progress',label:'Progress',icon:TrendingUp},
];
export const navigationGroups=[
 {label:'Your pages',items:primaryNavigation},
 {label:'More tools',items:[
  {path:'/activity',label:'Activity log',icon:Activity},
  {path:'/plan-day',label:'Plan my day',icon:CalendarDays},
  {path:'/meal-planner',label:'Meal plans',icon:CalendarDays},
  {path:'/saved-meals',label:'Saved meals',icon:UtensilsCrossed},
  {path:'/microbiome',label:'Gut reports',icon:Activity},
  {path:'/insights',label:'Diet coach',icon:BookOpen},
 ]},
 {label:'Manage',items:[{path:'/upload',label:'Add a gut report',icon:Upload},{path:'/profile',label:'Profile, privacy & export',icon:UserRound}]},
];
export const athletePrimaryNavigation=[
 {id:'athlete',path:'/athlete',label:'Training',icon:Activity},
 {id:'fueling',path:'/athlete/fueling',label:'Fueling',icon:CalendarDays},
 {id:'nutrition',path:'/nutrition',label:'Journal',icon:UtensilsCrossed},
 {id:'recovery',path:'/athlete/recovery',label:'Recovery',icon:Home},
 {id:'competition',path:'/athlete/competition',label:'Compete',icon:Dna},
];
export const athleteNavigationGroups=[
 {label:'Performance',items:[{path:'/athlete',label:'Training day',icon:Activity},{path:'/athlete/fueling',label:'Fueling & hydration',icon:CalendarDays},{path:'/athlete/recovery',label:'Recovery & response',icon:TrendingUp},{path:'/athlete/competition',label:'Competition & clean sport',icon:BookOpen}]},
 {label:'Shared tools',items:[{path:'/explore',label:'Explore biology',icon:Network},{path:'/progress',label:'Progress',icon:TrendingUp},{path:'/nutrition',label:'Food journal',icon:UtensilsCrossed},{path:'/saved-meals',label:'Saved meals',icon:UtensilsCrossed},{path:'/precision',label:'My biology',icon:Dna},{path:'/microbiome',label:'Gut reports',icon:Activity}]},navigationGroups[2],
];
const sectionRoutes:Record<string,readonly string[]>={
 '/nutrition':['/log-meal','/saved-meals','/meal-planner','/plan-day'],
 '/precision':['/biology/reports','/microbiome','/upload'],
 '/progress':['/weekly-review'],
};
export function navigationCurrent(path:string,location:string,mode:'everyday'|'athlete'):'page'|'location'|undefined{
 if(location===path||mode==='athlete'&&path==='/precision'&&location==='/biology/reports')return'page';
 if(mode==='everyday'&&sectionRoutes[path]?.includes(location))return'location';
 return undefined;
}
