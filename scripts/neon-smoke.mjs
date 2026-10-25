import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import bcrypt from 'bcrypt';
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { Pool } from "pg";

// Intentionally mutating: run only on the schema-only PR database, never production.
assert.equal(
  process.env.BLOOM_SMOKE_ISOLATED,
  "true",
  "Live tests require an explicitly isolated test database.",
);
assert.ok(
  process.env.DATABASE_URL && process.env.DATABASE_URL_UNPOOLED,
  "Neon pooled and direct URLs must be injected.",
);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL_UNPOOLED,
  max: 1,
});
const port = 4173;
const base = `http://127.0.0.1:${port}`;
const password = randomBytes(24).toString("base64url");
const users = [];
const adminId=randomUUID(),adminUsername=`neon-admin-${randomBytes(8).toString('hex')}`;
const syntheticAdminGrant={userId:adminId,grantId:'isolated-admin-read-test',role:'feature-admin',scopes:['features:read'],serviceId:'srv-syntheticreview',environment:'isolated-synthetic',purpose:'feature-metadata-review',reviewReference:'isolated-ci-only',expiresAt:new Date(Date.now()+3600000).toISOString()};
const syntheticPreviewGrant={serviceId:syntheticAdminGrant.serviceId,userId:adminId,grantId:'isolated-ui-preview-test',expiresAt:syntheticAdminGrant.expiresAt,territories:['CA'],reviewReference:'isolated-ci-only',allowedCapabilities:['bloom.dev.preview','bloom.food.photo_ai'],uiPreview:{purpose:'synthetic-ui-review',dataset:'synthetic-only',features:['bloom.food.photo_ai']}};
let processOutput = "";
const app = spawn(process.execPath, ["dist/index.js"], {
  env: {
    ...process.env,
    NODE_ENV: "production",
    PORT: String(port),
    RENDER: "true",
    SESSION_SECRET: randomBytes(48).toString("base64url"),
    PRECISION_DATA_KEY: randomBytes(32).toString("base64"),
    OPENAI_API_KEY: "",
    USDA_FDC_API_KEY: "",
    API_NINJAS_KEY: "",
    ML_SERVICE_URL: "",
    ML_SERVICE_TOKEN: "",
    RENDER_SERVICE_ID: syntheticAdminGrant.serviceId,
    BLOOM_FEATURE_ADMIN_ENVIRONMENT: 'isolated-synthetic',
    BLOOM_FEATURE_ADMIN_KILL_SWITCH: 'false',
    BLOOM_FEATURE_ADMINS: JSON.stringify([syntheticAdminGrant]),
    BLOOM_EXPERIMENTAL_ENVIRONMENT: 'isolated-synthetic',
    BLOOM_EXPERIMENTAL_KILL_SWITCH: 'false',
    BLOOM_PREVIEW_TERRITORY: 'CA',
    BLOOM_INTERNAL_TESTERS: JSON.stringify([syntheticPreviewGrant]),
  },
  stdio: ["ignore", "pipe", "pipe"],
});
for (const stream of [app.stdout, app.stderr])
  stream.on("data", (chunk) => {
    processOutput = (processOutput + chunk).slice(-20000);
  });
let cookie = "";
async function request(path, method = "GET", body, expected = 200) {
  const response = await fetch(base + path, {
    method,
    headers: {
      "content-type": "application/json",
      "x-forwarded-proto": "https",
      "origin": base.replace("http:", "https:"),
      ...(cookie ? { cookie } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(30000),
  });
  assert.equal(response.headers.get("cache-control"),"no-store","API responses must not be cached");
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    assert.match(
      setCookie,
      /; Secure/i,
      "Production session cookie must remain secure behind the proxy.",
    );
    cookie = setCookie.split(";")[0];
  }
  // Never include bodies, credentials or URLs in failures/log output.
  assert.equal(
    response.status,
    expected,
    `${method} ${path} returned HTTP ${response.status}`,
  );
  return response.status === 204 ? null : response.json();
}
async function addUser() {
  cookie = "";
  const username = `neon-smoke-${randomBytes(8).toString("hex")}`;
  const { user } = await request("/api/auth/signup", "POST", {
    username,
    password,
  });
  users.push(user.id);
  assert.ok(cookie, "Production signup must set a session cookie.");
  assert.equal((await request("/api/auth/me")).user.id, user.id);
  return { ...user, cookie };
}
try {
  for (let attempt = 0; attempt < 60; attempt++) {
    if (app.exitCode !== null)
      throw Error("Built app exited before becoming ready.");
    try {
      await fetch(base + "/api/auth/me", { signal: AbortSignal.timeout(1000) });
      break;
    } catch {
      if (attempt === 59)
        throw Error("Built app did not become ready within 30 seconds.");
      await delay(500);
    }
  }
  assert.equal(
    (await pool.query("SELECT 1 AS connected")).rows[0].connected,
    1,
  );
  console.log(
    "PASS: live Neon direct database connection and production app startup",
  );
  const auditLine=processOutput.split('\n').find(line=>line.includes('\"event\":\"internal-review-readiness\"'));
  assert.ok(auditLine);const audit=JSON.parse(auditLine.slice(auditLine.indexOf('{')));assert.equal(audit.serviceId,'srv-syntheticreview');assert.equal(audit.preferenceStorage,'columns-present');assert.deepEqual(audit.preferenceAccess,{read:true,write:true});
  console.log('PASS: production startup observes expected preference columns without account or credential diagnostics');
  await request('/api/admin/features','GET',undefined,401);
  users.push(adminId);
  await pool.query('INSERT INTO users(id,username,password) VALUES($1,$2,$3)',[adminId,adminUsername,await bcrypt.hash(password,10)]);
  await request('/api/auth/login','POST',{username:adminUsername,password});
  const adminCookie=cookie,adminReview=await request('/api/admin/features');
  assert.equal(adminReview.mode,'READ_ONLY');assert.equal(adminReview.entries.length,52);
  assert.ok(adminReview.entries.every(entry=>entry.activation.state==='UNCONFIGURED'&&entry.implementationReadiness===null));
  assert.equal((await request('/api/capabilities')).featureAdministration.canRead,true);
  await request('/api/admin/features/bloom.metabolite.scores/control','POST',{enabled:true,approved:true},403);
  const initialPreview=await request('/api/capabilities');assert.equal(initialPreview.eligible,true);assert.equal(initialPreview.experimentalEnabled,false);
  await request('/api/capabilities/experimental','PATCH',{enabled:true});
  const enabledPreview=await request('/api/capabilities');assert.equal(enabledPreview.experimentalEnabled,true);assert.equal(enabledPreview.developmentFeatures.length,1);assert.equal(enabledPreview.developmentFeatures[0].outputClass,'synthetic-ui-only');assert.deepEqual(enabledPreview.capabilities,[]);
  await request('/api/experience/scan','POST',{approved:true,experimental:true,consent:true},403);
  await request('/api/capabilities/experimental','PATCH',{enabled:false});assert.deepEqual((await request('/api/capabilities')).developmentFeatures,[]);
  console.log('PASS: isolated production-session deployment-bound preview ON/OFF and no execution grant');

  await request('/api/account','DELETE',{password,confirmation:'DELETE ACCOUNT'});
  cookie=adminCookie;await request('/api/admin/features','GET',undefined,401);await request('/api/capabilities','GET',undefined,401);await request('/api/capabilities/experimental','PATCH',{enabled:true},401);
  console.log('PASS: isolated PostgreSQL-backed admin metadata review, no feature promotion and deleted-session denial');
  const first = await addUser();
  const capabilities=await request("/api/capabilities");
  assert.equal(capabilities.eligible,false);assert.equal(capabilities.experimentalEnabled,false);
  assert.equal(capabilities.featureAdministration.canRead,false);
  await request('/api/admin/features','GET',undefined,403);
  await request("/api/capabilities/experimental","PATCH",{enabled:true},403);

  console.log(
    "PASS: signup, secure proxy cookie and PostgreSQL-backed session persistence",
  );
  const exampleReference=await request(`/api/nutrition/targets/${first.id}`);
  assert.equal(exampleReference.basis.kind,'example-reference');assert.equal(exampleReference.basis.usesProfile,false);assert.equal(exampleReference.calories,2000);
  await request('/api/nutrition/targets/not-this-account','GET',undefined,403);
  await request(`/api/user/${first.id}/profile`,'PATCH',{age:30,sex:'male',heightCm:175,weightKg:75,activityLevel:'moderate'});
  const profileReference=await request(`/api/nutrition/targets/${first.id}`);
  assert.equal(profileReference.basis.kind,'profile-estimate');assert.equal(profileReference.calories,2633);assert.equal(profileReference.protein,120);
  assert.equal(Object.hasOwn(profileReference,'password'),false);
  await request(`/api/user/${first.id}/profile`,'PATCH',{age:null,sex:null,heightCm:null,weightKg:null});
  assert.equal((await request(`/api/nutrition/targets/${first.id}`)).basis.kind,'example-reference');
  console.log('PASS: production target references distinguish incomplete profiles from actual adult formula inputs, preserve ownership and retract stale estimates');
  const preferences = {
    dietaryPattern: "vegan",
    exclusions: ["seafood", "nuts"],
    dislikes: ["tofu"],
    goals: ["butyrate", "diversity"],
  };
  await request("/api/preferences", "PUT", preferences);
  assert.deepEqual((await request("/api/preferences")).dislikes, ["tofu"]);
  const meal = await request("/api/meals", "POST", {
    mealText: "45 g oats and 80 g blueberries",
    mealType: "breakfast",
    aiConsent: false,
    mealContext: {
      eatenAt: "2026-10-17T15:00:00Z",
      symptoms: { bloating: 0, energy: null, comfort: null, clarity: null },
    },
  });
  assert.ok(meal.totalCalories > 0);
  assert.equal(
    (await request(`/api/meals/${first.id}`)).some((m) => m.id === meal.id),
    true,
  );
  const updatedMeal = await request(`/api/meals/${meal.id}`, "PUT", {
    mealText: "50 g oats and 80 g blueberries",
    mealType: "breakfast",
    aiConsent: false,
  });
  const burger = await request("/api/meals", "POST", {
    mealText:
      "Two frozen hamburger patties that were bbqd, no buns. With American cheese, ketchup and relish",
    mealType: "dinner",
    aiConsent: false,
    mealContext: { eatenAt: "2026-10-18T02:59:00Z" },
  });
  assert.ok(burger.totalCalories > 0);
  assert.equal(burger.intelligence.ingredients.length, 4);
  const unknown = await request("/api/meals", "POST", {
    mealText: "mystery xyz sauce",
    mealContext: { eatenAt: "2026-10-18T03:00:00Z" },
  });
  assert.equal(unknown.totalCalories, null);
  const daily = await request(
    `/api/nutrition/daily/${first.id}?date=2026-10-17&timezoneOffset=360`,
  );
  assert.equal(daily.meals.length, 3);
  assert.ok(
    Math.abs(
      daily.totals.calories -
        (updatedMeal.totalCalories + burger.totalCalories),
    ) < 0.02,
  );
  assert.deepEqual(daily.nutritionCoverage.calories, {
    knownMeals: 2,
    completeMeals: 2,
    totalMeals: 3,
    partial: true,
  });
  await request(
    `/api/nutrition/daily/${first.id}?date=2026-02-30&timezoneOffset=360`,
    "GET",
    undefined,
    400,
  );
  for(const period of ['monthly','yearly']){
    const history=await request(`/api/nutrition/${period}/${first.id}?year=2026${period==='monthly'?'&month=9':''}`);
    assert.equal(history.calendar,'UTC');assert.equal(history.totalMeals,3);assert.equal(history.daysWithMeals,2);
    assert.ok(Math.abs(history.totals.calories-daily.totals.calories)<0.02);
    assert.ok(Math.abs(history.dailyAverages.calories-daily.totals.calories/2)<0.02);
    assert.equal(history.nutritionCoverage.calories.partial,true);assert.ok(history.totals.fiber>0);
    if(period==='yearly'){assert.equal(history.monthlyBreakdown.length,1);assert.equal(history.monthlyBreakdown[0].month,9);}
  }
  console.log('PASS: production history retains known/partial nutrient contributions and explicit UTC logged-day denominators');
  await request(`/api/meals/${burger.id}`, "DELETE", {});
  await request(`/api/meals/${unknown.id}`, "DELETE", {});
  console.log(
    "PASS: broad sourced meal parsing, exclusions, preserved known daily totals and local calendar boundaries",
  );
  const personalProduct = await request(
    "/api/products",
    "POST",
    {
      name: "Michelina's synthetic CI label",
      brand: "CI fixture",
      servingDescription: "1 scoop (12 g)",
      servingGrams: 12,
      barcode: "012345678905",
      perServing: {
        calories: 40,
        carbohydrates_total_g: 12,
        fiber_g: 3,
        protein_g: 0,
        fat_total_g: 0,
      },
    },
    201,
  );
  const barcodeMatch=await request("/api/products/search?q=0012345678905&kind=all");
  assert.ok(barcodeMatch.products.some(p=>p.id===personalProduct.id));
  const spellingMatch=await request("/api/products/search?q=Michelinas&kind=food");assert.ok(spellingMatch.products.some(p=>p.id===personalProduct.id));
  const productMeal = await request("/api/meals", "POST", {
    mealText: "",
    mealType: "snack",
    products: [
      {
        name: personalProduct.name,
        grams: 24,
        preparation: "Selected label",
        assumption: "Synthetic fixture",
        product: { source: "manual", id: personalProduct.id, servings: 2, query:"Michelinas" },
      },
    ],
  });
  assert.equal(productMeal.totalCalories, 80);
  assert.equal(productMeal.intelligence.ingredients.find(i=>i.product).product.query,"Michelinas");
  const persistedProductMeal=(await request(`/api/meals/${first.id}`)).find(m=>m.id===productMeal.id);assert.equal(persistedProductMeal.totalCalories,80);assert.equal(persistedProductMeal.intelligence.ingredients.find(i=>i.product).product.query,"Michelinas");
  assert.equal(productMeal.totalCarbs, 24);
  assert.equal(
    productMeal.intelligence.nutrients.find((n) => n.key === "fiber_g").amount,
    6,
  );
  const encryptedLabel = (
    await pool.query(
      "SELECT encrypted_payload FROM nutrition_products WHERE id=$1",
      [personalProduct.id],
    )
  ).rows[0].encrypted_payload;
  assert.equal(encryptedLabel.version, 1);
  assert.equal(Object.hasOwn(encryptedLabel, "name"), false);
  await request(`/api/meals/${productMeal.id}`, "DELETE", {});
  const functional = await request("/api/microbiome/import", "POST", {
    report: {
      data_origin: "Synthetic reconstruction; not an official export",
      test_period: "Example period, exact date unknown",
      scores: [
        {
          category: "functional_pathway",
          name: "Synthetic pathway",
          score: 42,
          scale: "0-100 reported score",
          viome_category: "",
          notes: "Not a measured concentration",
        },
      ],
      organisms: [
        {
          organism: "Example organism",
          reported_status: "listed",
          quantitative_abundance: "",
          notes: "Unverified synthetic reconstruction",
        },
      ],
      food_recommendations: null,
      raw_sequence_data: null,
    },
  });
  const functionalResults = await request(
    `/api/microbiome/results/${functional.sampleId}`,
  );
  assert.equal(functionalResults.sample.processingStatus, "completed");
  assert.equal(functionalResults.sample.structuredData.scores.length, 1);
  assert.equal(
    functionalResults.sample.structuredData.importInfo.dateSource,
    "import-date",
  );
  assert.equal(functionalResults.bacterial_composition.length, 0);
  assert.equal(functionalResults.metabolites.length, 0);
  await request(
    `/api/microbiome/analyze/${functional.sampleId}`,
    "POST",
    {},
    422,
  );
  assert.equal(
    (await request(`/api/microbiome/results/${functional.sampleId}`)).sample
      .processingStatus,
    "completed",
  );
  console.log(
    "PASS: reusable encrypted product label, per-serving meal nutrition and pasted functional-report persistence",
  );
  const imported = await request("/api/microbiome/import", "POST", {
    bacteria_percentages: { "Ruminococcus bromii": 2, Bifidobacterium: 5, Roseburia: 0 },
    testingCompany: "Synthetic CI lab",
    testDate: new Date().toISOString(),
  });
  assert.ok(imported.sampleId);
  const cohortAvailability=await request('/api/microbiome/cohorts');
  assert.deepEqual(cohortAvailability.cohorts,[]);
  assert.equal(cohortAvailability.interpretationStatus,'no_validated_reference_dataset');
  const localComposition=await request(`/api/microbiome/analyze/${imported.sampleId}`,'POST',{cohortsToCompare:['elite_athletes']});
  assert.equal(localComposition.results.model_version,'reported-abundance-v3');
  assert.equal(localComposition.results.bacterial_composition.find(row=>row.bacterial_name==='Roseburia').abundance,0);
  assert.deepEqual(localComposition.results.metabolites,[]);
  assert.deepEqual(localComposition.results.cohort_comparisons,{});
  const compositionReceipt=(await pool.query('SELECT analysis_type,confidence,compared_cohorts FROM ml_analyses WHERE id=$1',[localComposition.analysisId])).rows[0];
  assert.equal(compositionReceipt.analysis_type,'reported-composition');
  assert.equal(compositionReceipt.confidence,null);
  assert.deepEqual(compositionReceipt.compared_cohorts,[]);
  console.log('PASS: isolated live local reported composition without ML credentials, original zero and no fictitious cohort comparison');
  await request("/api/precision/context", "PUT", {
    ageGroup: "adult",
    pregnancy: "no",
    safetyReviewed: true,
    goals: ["Lower ApoB"],
  });
  const now = new Date().toISOString();
  const genetic = await request(
    "/api/precision/records",
    "POST",
    {
      kind: "genetics",
      payload: {
        consent: true,
        provider: "23andMe",
        build: "GRCh37",
        strand: "+",
        collectedAt: now,
        calls: [
          {
            rsid: "rs1801133",
            chromosome: "1",
            position: 11856378,
            genotype: "AG",
          },
        ],
        scannedVariants: 1,
      },
    },
    201,
  );
  const lab = await request(
    "/api/precision/records",
    "POST",
    {
      kind: "lab",
      payload: {
        marker: "apob",
        value: 1.2,
        unit: "g/L",
        measuredAt: now,
        laboratory: "Synthetic CI lab",
        method: "CI assay",
        fasting: "yes",
        referenceLow: 0.3,
        referenceHigh: 1,
        notes: "Synthetic test only",
      },
    },
    201,
  );
  const measured = await request(
    "/api/precision/records",
    "POST",
    {
      kind: "metabolite",
      payload: {
        name: "butyrate",
        value: 5,
        unit: "mmol/kg",
        specimen: "stool",
        measuredAt: now,
        laboratory: "Synthetic CI lab",
        method: "CI assay",
      },
    },
    201,
  );
  const report = await request("/api/precision");
  assert.equal(
    report.genetics.findings.find((f) => f.rsid === "rs1801133").genotype,
    "AG",
  );
  assert.equal(report.labs[0].flag, "above reported range");
  assert.equal(report.microbiome.report.id, imported.sampleId);
  assert.equal(report.microbiome.measuredMetabolites[0].id, measured.id);
  assert.ok(report.recommendations.length && report.foods.length);
  assert.ok(
    report.recommendations.every((m) =>
      m.ingredients.every(
        (i) =>
          !i.tags.some((t) =>
            ["meat", "dairy", "eggs", "seafood", "nuts"].includes(t),
          ),
      ),
    ),
  );
  const encrypted = (
    await pool.query(
      "SELECT encrypted_payload FROM precision_records WHERE id = $1",
      [genetic.id],
    )
  ).rows[0].encrypted_payload;
  assert.equal(encrypted.version, 1);
  assert.equal(Object.hasOwn(encrypted, "calls"), false);
  assert.equal(JSON.stringify(encrypted).includes("rs1801133"), false);
  console.log(
    "PASS: live report import, encrypted genetics/labs/metabolites and personalized eligible foods/meals",
  );
  const plan = await request(
    "/api/precision/plans",
    "POST",
    { name: "Synthetic CI plan" },
    201,
  );
  await request(
    "/api/precision/records",
    "POST",
    {
      kind: "checkin",
      payload: {
        measuredAt: now,
        weightKg: 90,
        bodyFatPercent: null,
        waistCm: null,
        bloating: 0,
        energy: null,
        adherencePercent: 80,
        planId: plan.id,
        notes: "Synthetic CI check-in",
      },
    },
    201,
  );
  assert.equal((await request("/api/precision")).checkins[0].bloating, 0);
  const legacyExportRecord=await pool.query("INSERT INTO ml_analyses(sample_id,analysis_type,model_version,results,confidence) VALUES($1,'synthetic-legacy','unreviewed-synthetic',$2::jsonb,0.99) RETURNING id",[functional.sampleId,JSON.stringify({unsupportedScore:0.987654,advice:'UNSUPPORTED_EXPORT_SENTINEL'})]);
  const accountExport = await request("/api/account/export");
  assert.equal(accountExport.format,"bloom-account-records-v2");
  const exportedLegacy=accountExport.gutReports.analyses.find(row=>row.id===legacyExportRecord.rows[0].id);assert.ok(exportedLegacy);assert.equal(exportedLegacy.results,null);assert.equal(exportedLegacy.confidence,null);assert.equal(exportedLegacy.interpretationStatus,"historical_model_outputs_withheld");assert.equal(JSON.stringify(accountExport).includes('UNSUPPORTED_EXPORT_SENTINEL'),false);
  assert.equal(accountExport.profile.id,first.id);
  assert.ok(accountExport.journal.some(m=>m.id===meal.id));
  assert.ok(accountExport.savedLabels.some(p=>p.id===personalProduct.id));
  assert.ok(accountExport.biology.records.some(r=>r.id===lab.id));
  assert.ok(accountExport.gutReports.samples.some(s=>s.id===functional.sampleId));
  assert.equal(Object.hasOwn(accountExport.profile,"password"),false);
  assert.equal(JSON.stringify(accountExport).includes("encryptedPayload"),false);
  console.log("PASS: combined account export preserves original records, withholds unsupported generated outputs and excludes auth material");
  const today = await request("/api/precision/today-plan", "POST", {
    date: new Date().toISOString().slice(0, 10),
    timezoneOffset: 0,
    hour: 18,
    plan: {
      days: 1,
      targets: {
        calories: 2200,
        protein: 100,
        fiber: 30,
        fiberMaximum: 45,
        sodium: 2300,
        saturatedFat: 20,
      },
    },
  });
  assert.ok(today.slots.every((s) => s === "dinner" || s === "snack"));
  assert.ok(
    today.meals.every((m) => m.slot === "dinner" || m.slot === "snack"),
  );
  assert.equal(today.targetSource, "Targets confirmed in this form");
  assert.equal((await request("/api/experience/settings")).mode,"everyday");
  await request("/api/experience/settings","PATCH",{mode:"athlete",athlete:{weightKg:70,adult:true,pregnancyNo:true,healthReviewed:true,targetsConfirmed:true}});
  const training=await request("/api/experience/records","POST",{kind:"session",payload:{title:"Synthetic deployment ride",startsAt:"2026-10-18T18:00:00Z",minutes:180,intensity:"hard",discipline:"endurance"}},201);
  const athleteDay=await request("/api/experience/athlete-day","POST",{date:"2026-10-18",timezoneOffset:360,hour:18});
  assert.equal(athleteDay.minutes,180);assert.equal(athleteDay.blocked,false);assert.deepEqual(athleteDay.fueling[0].carbsGHour,[30,60]);
  const savedMeal=await request("/api/experience/templates/from-meal","POST",{mealId:meal.id,name:"Synthetic saved breakfast"},201);
  assert.equal((await request("/api/experience/export")).records.length,2);
  const encryptedExperience=await pool.query("SELECT encrypted_payload::text AS payload FROM experience_records WHERE user_id=$1",[first.id]);
  assert.equal(encryptedExperience.rows.length,2);assert.ok(encryptedExperience.rows.every(r=>!r.payload.includes("Synthetic")));
  console.log("PASS: encrypted athlete settings, session fueling and saved-meal persistence on live Neon");
  const biologicalRegistry=await request("/api/biology/registry");
  assert.equal(biologicalRegistry.version,"biology-2026-10-18.1");
  assert.ok(biologicalRegistry.relationships.some(r=>r.id==="viscosity:ldl"));
  const foodExplanation=await request("/api/biology/foods/food:oats");
  assert.equal(foodExplanation.version,biologicalRegistry.version);
  assert.ok(foodExplanation.relationshipEffects.every(r=>r.id!=="viscosity:ldl"||r.affectsRecommendation===false));
  console.log("PASS: normalized reference registry, reviewed food explanations and private barcode-label lookup on live Neon");
  const second = await addUser();
  assert.equal((await request("/api/experience/settings")).mode,"everyday");
  assert.equal((await request("/api/experience/export")).records.length,0);
  await request(`/api/experience/records/${training.id}`,"DELETE",undefined,404);
  await request(`/api/experience/templates/${savedMeal.id}/log`,"POST",{servings:1,mealType:"breakfast",eatenAt:"2026-10-18T18:00:00Z"},404);

  const secondExport = await request("/api/account/export");
  assert.equal(secondExport.format,"bloom-account-records-v2");
  assert.equal(secondExport.profile.id,second.id);
  assert.equal(secondExport.savedLabels.length,0);
  assert.equal(secondExport.gutReports.samples.length,0);
  assert.equal(JSON.stringify(secondExport).includes(personalProduct.id),false);
  assert.equal((await request("/api/precision")).labs.length, 0);
  assert.equal((await request("/api/biology/foods/food:oats")).observations.labs.length,0);
  assert.equal((await request("/api/products/saved")).length, 0);
  await request(
    `/api/products/manual/${personalProduct.id}`,
    "GET",
    undefined,
    404,
  );
  await request(
    `/api/microbiome/results/${functional.sampleId}`,
    "GET",
    undefined,
    403,
  );
  await request(`/api/precision/records/${lab.id}`, "DELETE", undefined, 404);
  const catalogue = await request("/api/biology/catalogue?q=salmon");
  const selectedFood = catalogue.foods[0];
  const composition = await request(`/api/biology/catalogue/${selectedFood.fdcId}?grams=150`);
  const pinnedMeal = await request("/api/meals", "POST", {mealText:"Selected catalogue food",mealType:"lunch",mealContext:{restaurantContext:{restaurant:"Synthetic Bistro",market:"Canada",source:"user-entered-context"}},ingredients:[{name:"Client description is not authoritative",grams:150,preparation:"",assumption:"Reviewed choice",catalogue:{source:"usda-fndds",fdcId:selectedFood.fdcId}}]});
  assert.equal(pinnedMeal.intelligence.foodMatches[0].fdcId, selectedFood.fdcId);
  assert.equal(pinnedMeal.intelligence.foodMatches[0].grams, 150);
  const persistedPinned = (await request(`/api/meals/${second.id}`)).find(m=>m.id===pinnedMeal.id);
  assert.equal(persistedPinned.intelligence.ingredients[0].catalogue.fdcId,selectedFood.fdcId);
  assert.deepEqual(persistedPinned.mealContext.restaurantContext,{restaurant:"Synthetic Bistro",market:"Canada",source:"user-entered-context"});
  assert.equal(persistedPinned.intelligence.nutrients.find(n=>n.key==="protein_g").amount,Math.round(composition.contributions.find(n=>n.key==="protein_g").amount*100)/100);
  const retired = await request(`/api/health/analysis/${second.id}`,"GET",undefined,410);
  assert.equal(retired.code,"UNVALIDATED_MODEL_RETIRED");
  assert.equal(retired.molecules,undefined);
  await request(`/api/health/analysis/${first.id}`,"GET",undefined,403);
  console.log("PASS: exact catalogue source/portion persists on Neon and retired models preserve authorization");
  cookie = first.cookie;
  await request(
    `/api/products/${personalProduct.id}`,
    "DELETE",
    undefined,
    204,
  );
  await request(`/api/precision/records/${lab.id}`, "DELETE", undefined, 204);
  assert.equal((await request("/api/precision")).plans.length, 0);
  await request(`/api/meals/${meal.id}`, "DELETE", {});
  await request("/api/auth/logout", "POST", {});
  cookie = "";
  await request("/api/precision", "GET", undefined, 401);
  await request("/api/auth/login", "POST", {
    username: first.username,
    password,
  });
  assert.equal((await request("/api/auth/me")).user.id, first.id);
  assert.notEqual(first.id, second.id);
  console.log(
    "PASS: plan/check-in persistence, account isolation, transactional source deletion and logout/login",
  );
  await request("/api/preferences", "PUT", {
    ...preferences,
    dietaryPattern: "omnivore",
  });
  const weeklyInput = {
    name: "Synthetic weekly deployment check",
    days: 1,
    householdServings: 2,
    targets: {
      calories: 2200,
      protein: 100,
      fiber: 30,
      fiberMaximum: 45,
      sodium: 2300,
      saturatedFat: 20,
    },
  };
  const weekly = await request(
    "/api/precision/weekly-plans/preview",
    "POST",
    weeklyInput,
  );
  assert.equal(weekly.status, "feasible");
  assert.equal(weekly.days.length, 1);
  assert.ok(weekly.days.every((d) => d.checks.every((c) => c.passed)));
  assert.ok(weekly.shoppingList.length > 0);
  const weeklySaved = await request(
    "/api/precision/weekly-plans/save",
    "POST",
    weeklyInput,
    201,
  );
  assert.equal(
    (await request("/api/precision/weekly-plans"))[0].id,
    weeklySaved.id,
  );
  const status = await request("/api/analysis/status");
  assert.equal(status.nutrition.offlinePlanningCatalogue, true);
  console.log(
    "PASS: production planning worker, nutrient constraints, encrypted weekly-plan persistence and shopping list",
  );
  const firstSession=cookie;
  await request("/api/auth/login","POST",{username:first.username,password});
  const alternateSession=cookie;
  await request("/api/account","DELETE",{password:"wrong-synthetic-password",confirmation:"DELETE ACCOUNT"},401);
  assert.equal((await request("/api/auth/me")).user.id,first.id);
  const erased=await request("/api/account","DELETE",{password,confirmation:"DELETE ACCOUNT"});
  assert.equal(erased.scope,"active-application-records");
  assert.equal((await pool.query("SELECT count(*)::int AS n FROM users WHERE id=$1",[first.id])).rows[0].n,0);
  assert.equal((await pool.query("SELECT count(*)::int AS n FROM session WHERE sess->>'userId'=$1",[first.id])).rows[0].n,0);
  for(const oldSession of [firstSession,alternateSession]){cookie=oldSession;await request("/api/account/export","GET",undefined,401);}
  cookie="";await request("/api/auth/login","POST",{username:first.username,password},401);
  cookie=second.cookie;assert.equal((await request("/api/auth/me")).user.id,second.id);
  assert.ok((await request("/api/account/export")).journal.some(m=>m.id===pinnedMeal.id));
  console.log("PASS: active account erasure, password confirmation, all stored sessions revoked and other account preserved");
} catch (error) {
  // Keep captured application output private: it can contain signed cookies or URLs.
  console.error("FAIL:", error.message);
  for(const diagnostic of processOutput.match(/Account export unavailable: stage=[a-z-]+; code=[A-Za-z0-9_]+/g)||[])console.error(diagnostic);
  process.exitCode = 1;
} finally {
  app.kill("SIGTERM");
  await new Promise((resolve) => {
    if (app.exitCode !== null) resolve();
    else {
      app.once("exit", resolve);
      setTimeout(() => {
        app.kill("SIGKILL");
        resolve();
      }, 3000).unref();
    }
  });
  try {
    for (const id of users) {
      await pool.query("BEGIN");
      try {
        await pool.query("DELETE FROM session WHERE sess->>'userId' = $1", [
          id,
        ]);
        await pool.query(
          "DELETE FROM recommendations WHERE sample_id IN (SELECT id FROM microbiome_samples WHERE user_id=$1)",
          [id],
        );
        await pool.query(
          "DELETE FROM health_impacts WHERE metabolite_id IN (SELECT id FROM metabolites WHERE sample_id IN (SELECT id FROM microbiome_samples WHERE user_id=$1))",
          [id],
        );
        for (const table of [
          "metabolites",
          "bacterial_composition",
          "ml_analyses",
        ])
          await pool.query(
            `DELETE FROM ${table} WHERE sample_id IN (SELECT id FROM microbiome_samples WHERE user_id=$1)`,
            [id],
          );
        for (const table of [
          "precision_records",
          "precision_profiles",
          "meals",
          "microbiome_samples",
        ])
          await pool.query(`DELETE FROM ${table} WHERE user_id=$1`, [id]);
        await pool.query("DELETE FROM users WHERE id=$1", [id]);
        await pool.query("COMMIT");
      } catch {
        await pool.query("ROLLBACK");
        throw Error("Synthetic test-data cleanup failed.");
      }
    }
    if (users.length)
      console.log("PASS: synthetic test accounts and records cleaned up");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
  await pool.end();
}
