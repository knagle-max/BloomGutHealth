"""Inspect actual screenshot pixels; no image rewriting or fabricated captures."""
import json, re, sys
from PIL import Image
image=Image.open(sys.argv[1]).convert('RGB')
spec=json.loads(sys.argv[2])
results=[]
for line in spec['lines']:
    rgb=[float(n) for n in re.findall(r'[\d.]+',line['color'])][:3]
    x0=max(0,int(line['left']+2)); x1=min(image.width,int(line['right']-2)); y=round(line['y'])
    columns=0
    for x in range(x0,x1):
        visible=False
        for yy in range(max(0,y-2),min(image.height,y+3)):
            pixel=image.getpixel((x,yy))
            if max(abs(pixel[i]-rgb[i]) for i in range(3))<70:
                visible=True
                break
        if visible: columns+=1
    width=max(0,x1-x0)
    results.append({'width':width,'matchedColumns':columns,'coverage':columns/max(1,width),'color':line['color']})
bands=[]
for band in spec.get('bands',[]):
    inside_y=round(band['top']+band['height']*.25)
    outside_y=round(spec['outsideY'])
    contrast=[]
    for fraction in [.1,.5,.9]:
        x=round(band['left']+band['width']*fraction)
        if 0<=x<image.width and 0<=inside_y<image.height and 0<=outside_y<image.height:
            inside=image.getpixel((x,inside_y)); outside=image.getpixel((x,outside_y))
            contrast.append(sum(abs(inside[i]-outside[i]) for i in range(3)))
    bands.append({'contrast':contrast})
print(json.dumps({'lines':results,'bands':bands}))
