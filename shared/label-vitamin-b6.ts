import type {Product} from './products';
import {hasVitaminB6Declaration} from './supplement-reference-context';
import {isVitaminB6NutrientDeclaration} from './nutrient-definitions';
/** Existing original declarations only; a bare salt/compound name is not a
 * Vitamin B6 nutrient amount. No unit or chemical-equivalent conversion. */
export function readLabelVitaminB6(label:Product){
 if(!hasVitaminB6Declaration(label))return null;
 const unknown={amount:null,sourceReportsZero:null,state:'unknown' as const};
 if(!['manual','dsld'].includes(label.source)||!label.servingDescription.trim())return unknown;
 const other=(label.otherNutrients??[]).filter(row=>isVitaminB6NutrientDeclaration(row.name));
 const declared=(label.labelDeclarations??[]).filter(row=>isVitaminB6NutrientDeclaration(row.name));
 const conflict={...unknown,state:'conflicting' as const};
 if(other.length>1||declared.length>1)return conflict;
 if(!other.length&&!declared.length)return unknown;
 if(declared.some(row=>row.operator!=='='))return unknown;
 const rows=[...other,...declared];
 if(rows.some(row=>row.unit.trim().toLowerCase()!=='mg'))return unknown;
 // The NIH adapter mirrors one exact original declaration into otherNutrients.
 // Collapse that pair; never sum two raw fields or choose a favourable value.
 const first=rows[0];
 if(rows.some(row=>row.amount!==first.amount||row.name.trim().toLowerCase()!==first.name.trim().toLowerCase()))return conflict;
 if(Object.hasOwn(label.perServing,'vitamin_b6_mg')&&label.perServing.vitamin_b6_mg!==first.amount)return conflict;
 return{amount:first.amount,sourceReportsZero:first.amount===0,state:'label-reported' as const};
}
