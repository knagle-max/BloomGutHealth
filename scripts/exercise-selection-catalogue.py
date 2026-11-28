"""Generate a factual selection index from exact owner source; never promote roles."""
import json,hashlib,pathlib,unicodedata,re
root=pathlib.Path(__file__).resolve().parents[1]
source=root/'design/bloom/anatomy/canonical-baseline44-20261126/bloom_exercise_db_staging_canonical_mapped.json'
raw=source.read_bytes();rows=json.loads(raw);normalize=lambda s:re.sub(r'\s+',' ',unicodedata.normalize('NFKC',s).strip().lower())
result=[]
for row in rows:
 name=row['exercise_name'];identity='exercise.'+hashlib.sha256(normalize(name).encode()).hexdigest()[:24]
 result.append(dict(id=identity,name=name,aliases=row['alternative_names'],category=row['exercise_category'],equipment=row['equipment'],muscleDescriptors=sorted(set(row['primary_muscles']+row['secondary_muscles']+row['stabilizing_muscles'])),associationReview=row['review_status']))
assert len(result)==553 and len({r['id']for r in result})==553
out=dict(version='owner-553-20261126',sourceSha256=hashlib.sha256(raw).hexdigest(),rightsScope='Owner-supplied factual identity index; no source-book text or media included. No independent source-book licence claimed.',records=result)
target=root/'shared/data/exercise-selection.json';expected=(json.dumps(out,ensure_ascii=False,indent=2)+'\n').encode()
import sys
if '--check'in sys.argv:assert target.read_bytes()==expected,'Regenerate catalogue from unchanged owner source'
else:target.write_bytes(expected)
print('Selection index:553identities; role acceptance unchanged')
