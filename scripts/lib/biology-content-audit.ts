import ts from 'typescript';
export type BiologyFixtureMention={kind:'taxon'|'source-only-analyte';spelling:string;rank:string|null;file:string;line:number;method:string};
export type UnexpandedBiologyExpression={file:string;line:number;field:string;reason:string};
const propertyName=(node:ts.PropertyName|undefined)=>node&&(ts.isIdentifier(node)||ts.isStringLiteralLike(node))?node.text:undefined;
const scalar=(node:ts.Node|undefined):string|undefined=>node&&ts.isStringLiteralLike(node)?node.text:undefined;
/** Static, read-only fixture discovery. Does not execute application/test modules,
 * infer species from prose or treat dynamic expressions as researched entities. */
export function inventoryBiologyFixture(file:string,text:string){
 const source=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
 const mentions:BiologyFixtureMention[]=[],unexpanded:UnexpandedBiologyExpression[]=[];
 const line=(node:ts.Node)=>source.getLineAndCharacterOfPosition(node.getStart(source)).line+1;
 const add=(kind:BiologyFixtureMention['kind'],spelling:string|undefined,node:ts.Node,rank:string|null=null,method='static source literal')=>{if(spelling!==undefined&&spelling.trim())mentions.push({kind,spelling,rank,file,line:line(node),method});};
 const siblingRank=(node:ts.PropertyAssignment)=>{if(!ts.isObjectLiteralExpression(node.parent))return undefined;const property=node.parent.properties.find((p):p is ts.PropertyAssignment=>ts.isPropertyAssignment(p)&&propertyName(p.name)==='taxonomyLevel');return scalar(property?.initializer);};
 const withinOrganisms=(node:ts.Node)=>{for(let parent=node.parent;parent;parent=parent.parent){if(ts.isPropertyAssignment(parent)&&['organisms','bacteria','taxa','bacterial_composition'].includes(propertyName(parent.name)||''))return true;if(ts.isCallExpression(parent))break;}return false;};
 const literalArray=(array:ts.ArrayLiteralExpression,kind:BiologyFixtureMention['kind'],method:string)=>array.elements.forEach(item=>add(kind,scalar(item),item,null,method));
 function visit(node:ts.Node){
  if(ts.isPropertyAssignment(node)){
   const field=propertyName(node.name);
   if(field==='bacterialName'||field==='reportedName'||field==='reportedAnalyte'){
    const value=scalar(node.initializer),kind=field==='reportedAnalyte'?'source-only-analyte':'taxon';
    if(value!==undefined)add(kind,value,node,siblingRank(node)||null);
    else unexpanded.push({file,line:line(node),field:field!,reason:'Dynamic source expression; names are inventoried separately when present in a literal pool or generated fixture.'});
   }
   if(field==='organisms'&&!file.endsWith('/science-coach.ts')&&ts.isArrayLiteralExpression(node.initializer))literalArray(node.initializer,'taxon','literal organism array');
   if(field==='name'&&withinOrganisms(node))add('taxon',scalar(node.initializer),node);
   if(['bacteria_percentages','bacteriaPercentages'].includes(field||'')&&ts.isObjectLiteralExpression(node.initializer))for(const item of node.initializer.properties)if(ts.isPropertyAssignment(item))add('taxon',propertyName(item.name),item,null,'literal composition dictionary key');
  }
  if(ts.isCallExpression(node)&&ts.isIdentifier(node.expression)&&['organismBiography','explainOrganism'].includes(node.expression.text))add('taxon',scalar(node.arguments[0]),node,scalar(node.arguments[1])||null,'explicit profile lookup fixture');
  if(ts.isVariableDeclaration(node)&&ts.isIdentifier(node.name)&&/^(names|organismNames|taxonNames|taxa)$/.test(node.name.text)&&node.initializer&&ts.isArrayLiteralExpression(node.initializer)&&/bacterialName|reportedTaxa|explainOrganism|organismBiography/.test(text))literalArray(node.initializer,'taxon','named public organism fixture pool');
  if(ts.isCallExpression(node)&&ts.isPropertyAccessExpression(node.expression)&&node.expression.name.text==='map'&&node.arguments.some(arg=>/bacterialName/.test(arg.getText(source)))){
   const pools=(value:ts.Node)=>{if(ts.isArrayLiteralExpression(value))literalArray(value,'taxon','literal pool projected into organism records');else if(ts.isConditionalExpression(value)){pools(value.whenTrue);pools(value.whenFalse);}else if(ts.isParenthesizedExpression(value))pools(value.expression);};pools(node.expression.expression);
  }
  if(ts.isForOfStatement(node)&&ts.isVariableDeclarationList(node.initializer)&&node.initializer.declarations.some(d=>ts.isIdentifier(d.name)&&d.name.text==='bacterialName')&&ts.isArrayLiteralExpression(node.expression))literalArray(node.expression,'taxon','explicit positive/negative lookup fixture');
  ts.forEachChild(node,visit);
 }
 visit(source);return{mentions,unexpanded};
}
