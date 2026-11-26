"""Extract exact owner-source paths; never infer canonical anatomy or exercise roles."""
import base64,hashlib,json,sys,xml.etree.ElementTree as ET
from pathlib import Path
root=Path(__file__).resolve().parents[1]
source=root/'design/bloom/anatomy/stages-1-3'
expected={'front':'fe4d47b17aa2270979e3c4ff222b5cefe96030c6baf7b0777c7722d31954e106','back':'f0757da834da5db5d9636603ad202c81f75cda8e60d9d2f7d130c45ef43a6e9e'}
result={}
for view,sha in expected.items():
 data=(source/f'assets/bloom-neutral-{view}.svg').read_bytes();assert hashlib.sha256(data).hexdigest()==sha
 svg=ET.fromstring(data);assert svg.attrib['viewBox']=='0 0 320 820'
 nodes=list(svg.iter());assert not any(n.tag.rsplit('}',1)[-1] in ['script','foreignObject'] or any(k.lower().startswith('on') for k in n.attrib) for n in nodes)
 image=next(n for n in nodes if n.tag.endswith('image'));assert image.attrib['href'].startswith('data:image/png;base64,')
 assert base64.b64decode(image.attrib['href'].split(',',1)[1])==(source/f'assets/body-{view}.png').read_bytes()
 paths=[{'id':n.attrib['id'],'group':n.attrib['data-display-group'],'d':n.attrib['d'],'label':n.attrib.get('aria-label','').replace('Select ','').replace(f' — {view} view','')} for n in nodes if n.tag.endswith('path')]
 assert len(paths)==(24 if view=='front' else 20)
 result[view]=paths
output=root/'client/src/content/anatomy-source-geometry.json';text=json.dumps({'status':'PROVISIONAL_VISUAL_KEYS_NOT_CANONICAL_ANATOMY','sourceSha256':expected,'views':result},indent=2)+'\n'
if sys.argv[1:] == ['--check']:assert output.read_text()==text,'Geometry drift: re-extract only from approved source'
elif sys.argv[1:] == ['--write']:output.write_text(text)
else:raise SystemExit('Use --write or --check')
print('44 exact source paths and both embedded PNGs verified; no scientific mapping inferred.')
