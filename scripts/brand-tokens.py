"""Regenerate the shared CSS contract from the byte-preserved v1 package tokens."""
import colorsys,json,pathlib
root=pathlib.Path(__file__).resolve().parents[1]
t=json.loads((root/'client/public/brand/design-tokens.json').read_text());c=t['colors']
def hsl(h):
 r,g,b=(int(h[i:i+2],16)/255 for i in (1,3,5));h,l,s=colorsys.rgb_to_hls(r,g,b);return f'{h*360:.6f} {s*100:.6f}% {l*100:.6f}%'
def mapping(p):
 return {'background':p['background'],'foreground':p['text'],'card':p['surface'],'card-foreground':p['text'],'popover':p['surface'],'popover-foreground':p['text'],'primary':p['brand'],'brand-hover':p['brandHover'],'primary-foreground':p.get('onBrand','#FFFFFF'),'muted':p['brandTint'],'muted-foreground':p['mutedText'],'border':p['border'],'card-border':p['border'],'input':p['border'],'ring':p['focus'],'accent':p['brandTint'],'accent-foreground':p['text'],'secondary':p['brandTint'],'secondary-foreground':p['text']}
# The source has no Everyday dark token set. Reassign only supplied Everyday colours;
# this role mapping is an implementation proposal awaiting exact-build Design review.
dark={**c['everyday'],'background':c['everyday']['text'],'surface':c['everyday']['brandHover'],'text':c['everyday']['background'],'mutedText':c['everyday']['brandTint'],'brand':c['everyday']['brandTint'],'brandTint':c['everyday']['brand'],'focus':c['everyday']['brandTint'],'border':c['everyday']['mutedText'],'onBrand':c['everyday']['text'],'brandHover':c['everyday']['background']}
css=['/* Generated from client/public/brand/design-tokens.json by scripts/brand-tokens.py. */']
for selector,p in [(':root',c['everyday']),(':root.dark',dark),(':root[data-experience=athlete], :root.dark[data-experience=athlete]',{**c['athlete'],'onBrand':c['athlete']['background']})]:
 css.append(selector+' {\n'+''.join(f'  --{k}: {hsl(v)};\n' for k,v in mapping(p).items())+'}')
css.append(':root { '+''.join(f'--brand-type-{k}: {v}px; ' for k,v in t['typography']['sizesPx'].items())+''.join(f'--brand-space-{i}: {v}px; ' for i,v in enumerate(t['spacePx'])) + f'--brand-radius-modal: {t["radiusPx"]["modal"]}px; --brand-line-height: {t["typography"]["lineHeightBody"]}; '+''.join(f'--brand-{k}: {v}; ' for k,v in c['semantics'].items())+'}')
css.append(':root { --font-sans: Inter, system-ui, sans-serif; --font-display: var(--font-sans); --radius: 10px; --surface-radius: 16px; --control-size: 44px; --body-size: 16px; --note-size: 14px; --brand-motion-fast:120ms; --brand-motion-normal:200ms; }')
(root/'client/src/brand-tokens.css').write_text('\n'.join(css)+'\n')
