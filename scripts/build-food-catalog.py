"""Rebuild the server-only USDA journal catalogue from the public source archive."""
import argparse, gzip, hashlib, json, pathlib, urllib.request, zipfile
URL = 'https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_survey_food_json_2024-10-31.zip'
NUTRIENTS = {1008,1003,1005,1004,1079,2000,1093,1092,1087,1089,1090,1095,1162,1114,1178,1177,1106,1109,1185,1253,1258}
p = argparse.ArgumentParser(); p.add_argument('--input', type=pathlib.Path, required=True, help='Public USDA FNDDS 2021-2023 JSON ZIP downloaded from '+URL)
args=p.parse_args(); archive=args.input.read_bytes()
with zipfile.ZipFile(args.input) as z:
    source=json.loads(z.read('surveyDownload.json'))['SurveyFoods']
foods=[]
for f in source:
    nutrients={str(n['nutrient']['id']):n['amount'] for n in f['foodNutrients'] if n['nutrient']['id'] in NUTRIENTS and isinstance(n.get('amount'),(int,float))}
    if not all(str(n) in nutrients for n in [1008,1003,1005,1004]): continue
    foods.append({'fdcId':f['fdcId'],'description':f['description'],'per100g':nutrients,'portions':[[p['portionDescription'],p['gramWeight']] for p in f.get('foodPortions',[]) if 0<p.get('gramWeight',0)<=3000]})
root=pathlib.Path(__file__).resolve().parents[1]/'server'/'data';root.mkdir(exist_ok=True)
path=root/'fndds-2021-2023.json.gz'
with path.open('wb') as out:
    with gzip.GzipFile(filename='',mode='wb',fileobj=out,mtime=0) as zipped:
        zipped.write(json.dumps(foods,separators=(',',':')).encode())
manifest={'source':'USDA FoodData Central, FNDDS 2021–2023','url':URL,'retrievedAt':'2026-10-18','sourceZipSHA256':hashlib.sha256(archive).hexdigest(),'catalogueSHA256':hashlib.sha256(path.read_bytes()).hexdigest(),'foodCount':len(foods),'nutrientIds':sorted(NUTRIENTS),'excluded':'Records without all four core macronutrients, including human milk with no provided composition. Missing micronutrients are not filled.'}
(root/'fndds-manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n')
print(f'Built {len(foods)} sourced records ({path.stat().st_size} bytes compressed)')
