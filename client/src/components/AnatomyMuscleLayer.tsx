import{type MuscleTarget}from'@/lib/anatomy-muscle-presentation';
/** Reviewed art is a passive image below this layer. These paths are only the
 * separately reviewed interaction footprints, not measured or canonical tissue. */
export default function AnatomyMuscleLayer({targets,prefix,selected,preview,onChoose,onPreview}:{targets:readonly MuscleTarget[];prefix:string;selected:string|null;preview:string|null;onChoose:(id:string)=>void;onPreview:(id:string|null)=>void}){
 return <g className="anatomy-muscle-layer">
  <defs>{targets.filter(row=>row.listOnly&&row.parentClipD).map((row,i)=><clipPath key={row.id} id={`${prefix}-list-${i}`} clipPathUnits="userSpaceOnUse"><path d={row.parentClipD}/></clipPath>)}</defs>
  {targets.filter(row=>!row.listOnly&&(row.id===selected||row.id===preview)).map(row=><path key={row.id} data-hit-outline={row.id} d={row.d} fill="none" fillRule={row.fillRule} stroke="hsl(var(--ring))" strokeWidth="2.5" vectorEffect="non-scaling-stroke" className="anatomy-muscle-paint" aria-hidden="true" pointerEvents="none"/>)}
  {targets.filter(row=>row.listOnly&&row.parentClipD).map((row,i)=>(row.id===preview||row.id===selected)&&<g key={row.id} clipPath={`url(#${prefix}-list-${i})`} aria-hidden="true" pointerEvents="none"><path data-list-preview={row.id} d={row.d} fill="hsl(var(--primary) / .3)" stroke="hsl(var(--ring))" strokeWidth="2" fillRule={row.fillRule} aria-hidden="true" pointerEvents="none"/></g>)}
  {targets.filter(row=>!row.listOnly).map(row=><path key={row.id} data-hit-target={row.id} d={row.d} fillRule={row.fillRule} className="anatomy-muscle-hit" fill="transparent" stroke="none" pointerEvents="fill" aria-hidden="true" onPointerEnter={()=>onPreview(row.id)} onPointerLeave={()=>onPreview(null)} onClick={()=>onChoose(row.id)}/>)}
 </g>;
}
