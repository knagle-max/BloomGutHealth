import {readFile,writeFile,access} from 'node:fs/promises';
import {visualAssetRegistrySchema,editorialVisualProjection} from '../shared/visual-asset-registry';
const mode=process.argv[2];if(!['--write','--check'].includes(mode))throw Error('Use --write or --check');
const registry=visualAssetRegistrySchema.parse(JSON.parse(await readFile(new URL('../docs/visual-assets/visual-asset-registry.json',import.meta.url),'utf8')));
for(const asset of registry.assets)for(const path of asset.filePaths)await access(new URL('../client/public'+path,import.meta.url));
const projection=editorialVisualProjection(registry),text=`// Generated from docs/visual-assets/visual-asset-registry.json. Do not edit.\nimport type {EditorialMediaSlot} from './editorial-media';\nexport type BloomVisualAssetId=${projection.ids.map(id=>JSON.stringify(id)).join('|')};\nexport const editorialVisualAssetIds=${JSON.stringify(projection.bindings,null,2)} as const satisfies Record<EditorialMediaSlot,BloomVisualAssetId>;\n`;
const target=new URL('../client/src/content/visual-asset-ids.ts',import.meta.url);
if(mode==='--write')await writeFile(target,text);else if(await readFile(target,'utf8')!==text)throw Error('Visual ID delivery projection changed; review the master registry and regenerate');
console.log(`Visual registry: ${registry.assets.length} permanent IDs; ${Object.keys(projection.bindings).length} existing editorial bindings; all declared local files exist. External/generated/approved source status does not claim app integration or independent review.`);
