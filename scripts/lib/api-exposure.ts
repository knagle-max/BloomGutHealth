import ts from 'typescript';
export interface ApiDeclaration {file:string;line:number;method:string;path:string;declaredMiddleware:string[];review:'REVIEW_REQUIRED';}
export interface UnresolvedDeclaration {file:string;line:number;method:string;pathExpression:string;reason:'DYNAMIC_PATH_REQUIRES_REVIEW'|'DYNAMIC_PATH_OR_UNSCOPED_MIDDLEWARE';review:'REVIEW_REQUIRED';}
/** Parse source only. Never import/evaluate application code, templates or bindings. */
export function extractApiDeclarations(file:string,content:string){
 const entries:ApiDeclaration[]=[],unresolved:UnresolvedDeclaration[]=[];
 const source=ts.createSourceFile(file,content,ts.ScriptTarget.Latest,true);
 function literalPaths(node:ts.Node):{paths:string[];dynamic:boolean}{
  if(ts.isStringLiteral(node)||ts.isNoSubstitutionTemplateLiteral(node))return {paths:[node.text],dynamic:false};
  if(ts.isParenthesizedExpression(node)||ts.isAsExpression(node)||ts.isSatisfiesExpression(node))return literalPaths(node.expression);
  if(ts.isArrayLiteralExpression(node)){const values=node.elements.map(literalPaths);return {paths:values.flatMap(value=>value.paths),dynamic:values.some(value=>value.dynamic)};}
  return {paths:[],dynamic:true};
 }
 function visit(node:ts.Node){
  if(ts.isCallExpression(node)&&ts.isPropertyAccessExpression(node.expression)&&['get','post','put','patch','delete','use'].includes(node.expression.name.text)){
   const receiver=node.expression.expression;
   // These are the declared Express receiver names in the current server. This
   // is not inferred runtime reachability, alias resolution or middleware proof.
   if(ts.isIdentifier(receiver)&&['app','router'].includes(receiver.text)){
    const path=node.arguments[0];
    if(path){const result=literalPaths(path),line=source.getLineAndCharacterOfPosition(node.getStart()).line+1,method=node.expression.name.text.toUpperCase();
     const declaredMiddleware=node.arguments.slice(1,-1).filter(arg=>!ts.isArrowFunction(arg)&&!ts.isFunctionExpression(arg)).map(arg=>arg.getText(source));
     for(const value of result.paths)if(value==='/api'||value.startsWith('/api/'))entries.push({file,line,method,path:value,declaredMiddleware,review:'REVIEW_REQUIRED'});
     // A known non-API template can be excluded; an identifier/spread/call is
     // genuinely unresolved and must remain visible, even without an API prefix.
     const knownOtherTemplate=ts.isTemplateExpression(path)&&!path.head.text.startsWith('/api')&&!'/api'.startsWith(path.head.text);
     const expression=ts.isArrowFunction(path)||ts.isFunctionExpression(path)?'[inline middleware]':ts.isCallExpression(path)?`${path.expression.getText(source)}(arguments omitted)`:path.getText(source).slice(0,240);
     if(result.dynamic&&!knownOtherTemplate)unresolved.push({file,line,method,pathExpression:expression,reason:method==='USE'?'DYNAMIC_PATH_OR_UNSCOPED_MIDDLEWARE':'DYNAMIC_PATH_REQUIRES_REVIEW',review:'REVIEW_REQUIRED'});
    }
   }
  }
  ts.forEachChild(node,visit);
 }
 visit(source);return {entries,unresolved};
}
