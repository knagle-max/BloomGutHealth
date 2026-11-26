/** BVA-0089 display geometry only. No clinical aggregation or canonical mapping.
 * The immutable supplied region order controls placement, never report order. */
export type MarkerRegion={id:string;anchor:{x:number;y:number}};
/** Ratings use the caller-supplied compatible 0–10 display scale; no scale conversion or source aggregation is performed. */
export type MarkerReport={visualKey:string;count:number;severity:number|null};
export type MarkerBox={x:number;y:number;w:number;h:number};
export type PositionedMarker=MarkerReport&{anchor:{x:number;y:number};radii:readonly number[];selected:boolean;focused:boolean};
export type MarkerLayout={ok:true;markers:PositionedMarker[];badges:(MarkerBox&{visualKey:string;count:number})[];hiddenCounts:string[]}|{ok:false;reason:'invalid-regions'|'invalid-reports'};
function severityRadii(severity:number|null):readonly number[]{return severity===null||severity===0?[]:severity<=3?[14]:severity<=6?[10,17]:[8,15,22];}
export function markerCountLabel(report:MarkerReport|undefined){return report&&report.count>0?`${report.count} supplied observation${report.count===1?'':'s'}; ${report.severity===null?'severity not supplied':`reported severity ${report.severity} of 10`}`:'No observations supplied for this location; symptoms are unknown.';}
const gap=4,margin=3;
function boxOverlap(a:MarkerBox,b:MarkerBox){return a.x<b.x+b.w+gap&&a.x+a.w+gap>b.x&&a.y<b.y+b.h+gap&&a.y+a.h+gap>b.y;}
function circleOverlap(b:MarkerBox,point:{x:number;y:number},radius:number){const x=Math.max(b.x,Math.min(point.x,b.x+b.w)),y=Math.max(b.y,Math.min(point.y,b.y+b.h));return Math.hypot(x-point.x,y-point.y)<radius+gap;}
function candidates(anchor:{x:number;y:number}){const corners=[[25,-39],[-54,-39],[25,23],[-54,23]],out:MarkerBox[]=[];for(const step of [0,7,14,21])for(const[dx,dy]of corners)out.push({x:anchor.x+dx+(dx>0?1:-1)*step,y:anchor.y+dy+(dy>0?1:-1)*step,w:29,h:16});return out;}
export function layoutAnatomyMarkers(regions:readonly MarkerRegion[],reports:readonly MarkerReport[],selected:string|null=null,focused:string|null=null):MarkerLayout{
 if(regions.length>100||new Set(regions.map(row=>row.id)).size!==regions.length||regions.some(row=>!row.id||!Number.isFinite(row.anchor.x)||!Number.isFinite(row.anchor.y)||row.anchor.x<0||row.anchor.x>320||row.anchor.y<0||row.anchor.y>820))return{ok:false,reason:'invalid-regions'};
 const keys=new Set(regions.map(row=>row.id));
 if(reports.length>regions.length||new Set(reports.map(row=>row.visualKey)).size!==reports.length||reports.some(row=>!keys.has(row.visualKey)||!Number.isSafeInteger(row.count)||row.count<0||!(row.severity===null||(Number.isInteger(row.severity)&&row.severity>=0&&row.severity<=10))||(row.count===0&&row.severity!==null)))return{ok:false,reason:'invalid-reports'};
 const byKey=new Map(reports.map(row=>[row.visualKey,row]));
 const markers:PositionedMarker[]=regions.flatMap(region=>{const report=byKey.get(region.id);return report&&report.count>0?[{...report,anchor:region.anchor,radii:severityRadii(report.severity),selected:selected===region.id,focused:focused===region.id}]:[];});
 const badges:(MarkerBox&{visualKey:string;count:number})[]=[],hiddenCounts:string[]=[];
 for(const marker of markers){if(marker.count<=1)continue;
  // The approved pill is fixed 29x16. Longer exact counts remain in the list,
  // rather than shrinking type, truncating the value or inventing a capped count.
  const valid=marker.count<=99?candidates(marker.anchor).find(box=>box.x>=margin&&box.y>=margin&&box.x+box.w<=320-margin&&box.y+box.h<=820-margin&&!markers.some(other=>circleOverlap(box,other.anchor,other.focused?31:other.selected?27.5:22))&&!badges.some(other=>boxOverlap(box,other))):undefined;
  if(valid)badges.push({...valid,visualKey:marker.visualKey,count:marker.count});else hiddenCounts.push(marker.visualKey);
 }
 return{ok:true,markers,badges,hiddenCounts};
}
