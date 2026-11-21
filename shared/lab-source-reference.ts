/** Parse only explicit source intervals, never clinical targets or population defaults. */
export function parseSourceReference(raw:string):{low:number|null;high:number|null;lowInclusive?:boolean;highInclusive?:boolean}|null{
 const text=raw.trim().replace(/[–—−]/g,'-');
 if(!text)return{low:null,high:null};
 const n='(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:[eE][+-]?\\d+)?';
 const pair=new RegExp(`^(${n})\\s*(?:-|to)\\s*(${n})$`,'i').exec(text);
 if(pair){const low=Number(pair[1]),high=Number(pair[2]);return Number.isFinite(low)&&Number.isFinite(high)&&low<high?{low,high}:null;}
 const single=new RegExp(`^(<=?|>=?|≤|≥)\\s*(${n})$`).exec(text);
 if(single){const value=Number(single[2]);if(!Number.isFinite(value))return null;return /^(?:<|≤)/.test(single[1])?{low:null,high:value,highInclusive:['<=','≤'].includes(single[1])}:{low:value,high:null,lowInclusive:['>=','≥'].includes(single[1])};}
 return null;
}
