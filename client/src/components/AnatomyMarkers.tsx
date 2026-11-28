import type {MarkerLayout} from '@/lib/anatomy-marker-layout';
/** Passive SVG paint. All semantic text remains on the equivalent region list. */
export default function AnatomyMarkers({layout}:{layout:MarkerLayout}){
 if(!layout.ok)return null;
 return <g className="anatomy-marker-layer" aria-hidden="true" pointerEvents="none">
  {layout.markers.map(marker=><g key={marker.visualKey} className="anatomy-marker" data-region={marker.visualKey} data-level={marker.severity===null?'unrated':marker.severity===0?'zero':marker.severity<=3?'1':marker.severity<=6?'2':'3'}>
   {/* The original ring grammar starts at1. Preserve explicit zero as text,
       not an unrated hollow locus, mild ring or inferred absence. */}
   {marker.severity===0?<text className="anatomy-marker-zero" x={marker.anchor.x} y={marker.anchor.y} textAnchor="middle" dominantBaseline="central">0/10</text>:marker.severity===null?<circle className="anatomy-marker-unrated" cx={marker.anchor.x} cy={marker.anchor.y} r="5.5"/>:<>{marker.radii.map(radius=><circle key={radius} className="anatomy-marker-tier" cx={marker.anchor.x} cy={marker.anchor.y} r={radius}/>)}<circle className="anatomy-marker-dot" cx={marker.anchor.x} cy={marker.anchor.y} r="3.2"/></>}
   {marker.selected&&<circle className="anatomy-marker-selected" cx={marker.anchor.x} cy={marker.anchor.y} r="27.5"/>}
   {marker.focused&&<circle className="anatomy-marker-focused" cx={marker.anchor.x} cy={marker.anchor.y} r="31"/>}
  </g>)}
  {layout.badges.map(badge=><g key={badge.visualKey} className="anatomy-marker-badge" data-region={badge.visualKey}><rect x={badge.x} y={badge.y} width={badge.w} height={badge.h} rx="8"/><text x={badge.x+14.5} y={badge.y+11.5} textAnchor="middle">×{badge.count}</text></g>)}
 </g>;
}
