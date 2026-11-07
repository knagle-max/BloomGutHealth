/** Deliberately small, fail-closed SVG subset for first-party neutral symbols.
 * Scientific asset approval is separate; passing this is never morphology,
 * chemistry, licence or distribution approval. No XML entity/resource loading. */
export function assertPassiveScientificSvg(source){
 const fail=()=>{throw Error('Scientific SVG is outside the passive symbol subset');};
 if(typeof source!=='string'||source.length>100000||/[&]|<!|<\?/.test(source))fail();
 const tags=new Set(['svg','title','desc','g','rect','circle','ellipse','path','line','polyline','polygon']);
 const attrs=new Set(['xmlns','viewBox','width','height','x','y','x1','y1','x2','y2','cx','cy','r','rx','ry','fill','stroke','stroke-width','d','points','stroke-linecap','stroke-linejoin']);
 const stack=[];let cursor=0,roots=0;
 for(const match of source.matchAll(/<([^<>]+)>/g)){
  const text=source.slice(cursor,match.index);if(/[<>]/.test(text)||text.trim()&&!['title','desc'].includes(stack.at(-1)))fail();cursor=match.index+match[0].length;
  const token=match[1],closing=token.startsWith('/');
  if(closing){if(!/^\/[a-z]+$/.test(token)||stack.pop()!==token.slice(1))fail();continue;}
  const node=/^([a-z]+)([\s\S]*?)(\/?)$/.exec(token);if(!node||!tags.has(node[1]))fail();
  const tag=node[1];if(!stack.length){if(tag!=='svg'||++roots!==1)fail();}else if(tag==='svg')fail();
  const seen=new Set();let offset=0;for(const attribute of node[2].matchAll(/\s+([A-Za-z][A-Za-z0-9-]*)="([^"]*)"/g)){
   if(node[2].slice(offset,attribute.index).trim())fail();offset=attribute.index+attribute[0].length;const[,name,value]=attribute;
   if(!attrs.has(name)||seen.has(name))fail();seen.add(name);
   if(name==='xmlns'){if(tag!=='svg'||value!=='http://www.w3.org/2000/svg')fail();}
   else if(name==='fill'||name==='stroke'){if(!/^(?:none|currentColor|#[a-fA-F0-9]{6})$/.test(value))fail();}
   else if(name==='stroke-linecap'){if(!/^(?:butt|round|square)$/.test(value))fail();}
   else if(name==='stroke-linejoin'){if(!/^(?:miter|round|bevel)$/.test(value))fail();}
   else if(name==='d'){if(!/^[MmZzLlHhVvCcSsQqTtAa0-9eE+.,\s-]+$/.test(value))fail();}
   else if(!/^[0-9eE+.,\s-]+$/.test(value))fail();
  }
  if(node[2].slice(offset).trim()||tag==='svg'&&!seen.has('xmlns'))fail();
  if(!node[3])stack.push(tag);
 }
 if(stack.length||roots!==1||source.slice(cursor).trim())fail();return true;
}
