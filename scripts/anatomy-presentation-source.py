"""Verify reviewed passive art and export separate provisional interaction data."""
from pathlib import Path
import base64,csv,hashlib,json,re,sys,xml.etree.ElementTree as E
root=Path(__file__).resolve().parents[1];art=root/'design/bloom/anatomy/presentation-20261126';refs=root/'design/bloom/anatomy/interaction-v433';manifest=json.loads((art/'SOURCE_MANIFEST.json').read_text());sha=lambda d:hashlib.sha256(d).hexdigest()
for name,entry in manifest['files'].items():assert sha((art/name).read_bytes())==entry['sha256'],name
for name,digest in manifest['interactionFiles'].items():assert sha((refs/name).read_bytes())==digest,name
number=r'[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?'
def bounds(d):
 assert set(re.findall('[A-Za-z]',re.sub(number,'',d)))<=set('MCLZ')
 vals=list(map(float,re.findall(number,d)));assert vals and len(vals)%2==0
 return[min(vals[::2]),min(vals[1::2]),max(vals[::2]),max(vals[1::2])]
def safe(path):
 svg=E.parse(path).getroot();assert svg.get('viewBox')=='0 0 320 820'
 assert not any(n.tag.split('}')[-1]in ['script','foreignObject','use','a','style']or n.get('transform')or any(k.lower().startswith('on')for k in n.attrib)or n.get('tabindex')is not None for n in svg.iter())
 for n in svg.iter():
  for k,value in n.attrib.items():
   if k.endswith('href'):assert n.tag.endswith('image')and value.startswith('data:image/png;base64,')
 ids=[n.get('id')for n in svg.iter()if n.get('id')];assert len(ids)==len(set(ids))
 return svg
rows=list(csv.DictReader((refs/'PATH_CROSSWALK_V433_PROVISIONAL.csv').open()));residuals=json.loads((refs/'LIST_ONLY_RESIDUALS.json').read_text());out={'version':'reviewed-passive-art-separate-v433-footprints-v1','status':'DESCRIPTIVE_NONPERSISTING_NOT_CANONICAL','defaultCounts':{'front':24,'back':20},'views':{}}
for view in ['front','back']:
 baseline=E.parse(root/f'design/bloom/anatomy/stages-1-3/assets/bloom-neutral-{view}.svg').getroot();originals={n.get('id'):n.get('d')for n in baseline.iter()if n.tag.endswith('path')};assert len(originals)==(24 if view=='front'else 20)
 for theme in ['everyday','athlete']:
  svg=safe(art/f'{view}-{theme}.svg');blue=next(n for n in svg if n.get('id')=='presentation-only-baseline-blue-grey');yellow=next(n for n in svg if n.get('id')=='presentation-only-yellow-overlay');assert list(svg).index(yellow)>list(svg).index(blue);assert blue.get('pointer-events')==yellow.get('pointer-events')=='none';assert not any(n.tag.endswith(('clipPath','mask'))for n in svg.iter())
  assert{n.get('id').removeprefix('visual-only-'):n.get('d')for n in blue}==originals
  imgs=[n for n in svg.iter()if n.tag.endswith('image')];assert len(imgs)==1;assert base64.b64decode(imgs[0].get('href').split(',',1)[1])==(root/f'design/bloom/anatomy/stages-1-3/assets/body-{view}.png').read_bytes()
 everyday=safe(refs/f'{view}-everyday.svg');athlete=safe(refs/f'{view}-athlete.svg');hits={n.get('id'):n for n in everyday.iter()if n.get('data-layer')=='provisional-hit'};other={n.get('id'):n for n in athlete.iter()if n.get('data-layer')=='provisional-hit'};assert hits.keys()==other.keys();assert all(n.get('d')==other[id].get('d')for id,n in hits.items());assert len(hits)==(34 if view=='front'else 28)
 targets=[]
 for id,n in hits.items():
  row=next(r for r in rows if r['detail_target_id']==id and r['v42_selectability']=='selectable_svg');expanded='back-trapezius-upper-'in id;parent=row['parent_source_id_review'];parent=None if parent=='NULL_INDEPENDENT'or expanded else parent
  targets.append({'id':id,'d':n.get('d'),'bounds':bounds(n.get('d')),'fillRule':n.get('fill-rule','nonzero'),'parentSourceId':parent,'declaredSourceParent':row['parent_source_id_review'],'parentageUnresolved':expanded,'sourceKind':row['source_kind'],'subjectSide':row['subject_side'],'muscle':row['muscle'],'independent':row['parent_source_id_review']=='NULL_INDEPENDENT','listOnly':False,'canonicalId':None})
 for row in residuals:
  if row['view']==view:targets.append({'id':row['proposed_id'],'d':row['previewPathD'],'parentClipD':row['parentClipD'],'bounds':bounds(row['previewPathD']),'fillRule':'evenodd','parentSourceId':row['parent_source_id'],'declaredSourceParent':row['parent_source_id'],'parentageUnresolved':False,'sourceKind':'list-only-residual','subjectSide':row['subject_side'],'muscle':row['context'],'independent':False,'listOnly':True,'label':row['label'],'ariaLabel':row['screen_reader_label'],'canonicalId':None})
 out['views'][view]=targets
assert sum(not t['listOnly']for ts in out['views'].values()for t in ts)==62;assert sum(t['listOnly']for ts in out['views'].values()for t in ts)==6
output=root/'client/src/content/anatomy-presentation-source.json';text=json.dumps(out,indent=2)+'\n'
if '--write'in sys.argv:output.write_text(text)
else:assert output.read_text()==text,'Generated anatomy projection stale; run --write'
print('PASS:4reviewed passive SVGs preserve44original parents/PNGbytes;62separate provisional hits+6list-only; no canonical identities')
