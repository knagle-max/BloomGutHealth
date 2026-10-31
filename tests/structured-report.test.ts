import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import {
  parseStructuredReport,
  parseReportDocument,
  resolveReportDate,
} from "../shared/structured-report";
import { registerReportRoutes } from "../server/report-routes";
import { insertMicrobiomeSampleSchema } from "../shared/schema";
test('cohort API cannot promote an older unvalidated processing dataset or caller flags to reference/personal comparison outputs',async()=>{
 let legacyCalls=0;
 const legacy=express();legacy.get('/api/ml/cohorts',(_req,res)=>{legacyCalls++;res.json({cohorts:[{id:'elite_athletes',sample_size:250,diversity_index:3.4,privateUnsupportedSentinel:'unvalidated-reference-profile'}]});});
 const oldServer=legacy.listen(0,'127.0.0.1');await new Promise<void>(resolve=>oldServer.on('listening',resolve));
 const oldUrl=`http://127.0.0.1:${(oldServer.address() as any).port}`;
 const fixture=await (await fetch(oldUrl+'/api/ml/cohorts')).json();assert.equal(fixture.cohorts[0].sample_size,250);legacyCalls=0;
 const app=express();
 registerReportRoutes(app,(req,res,next)=>req.header('x-user')?next():void res.status(401).json({error:'Auth required'}),new Proxy({},{get(){throw Error('No account storage needed for cohort availability');}}) as any,oldUrl);
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.on('listening',resolve));
 const base=`http://127.0.0.1:${(server.address() as any).port}`;
 try{
  assert.equal((await fetch(base+'/api/microbiome/cohorts')).status,401);
  for(const path of ['/api/microbiome/cohorts','/api/microbiome/cohorts?developer=true&researchConsent=true&sampleId=other']){
   const response=await fetch(base+path,{headers:{'x-user':'synthetic-reviewer','x-bloom-development':'true'}});
   assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');
   const result=await response.json();assert.deepEqual(result.cohorts,[]);assert.equal(result.status,'unavailable');assert.equal(result.interpretationStatus,'no_validated_reference_dataset');
   assert.doesNotMatch(JSON.stringify(result),/sample_size|diversity_index|elite_athletes|unvalidated-reference-profile/);
  }
  assert.equal(legacyCalls,0);
 }finally{
  server.closeAllConnections();oldServer.closeAllConnections();
  await Promise.all([new Promise<void>(resolve=>server.close(()=>resolve())),new Promise<void>(resolve=>oldServer.close(()=>resolve()))]);
 }
});
export const syntheticReport = {
  schema_version: "1.0",
  data_origin: "Synthetic reconstruction; not an official export",
  test_period: "Example month/year",
  score_interpretation_warning: "Each score has its own direction.",
  scores: [
    {
      category: "Pathway",
      name: "Example pathway",
      score: 42,
      scale: "0–100",
      viome_category: "Reported category",
      notes: "Synthetic only",
    },
  ],
  organisms: [
    {
      organism: "Example species",
      reported_status: "Reported detected",
      quantitative_abundance: "Not provided",
      notes: "No percentage",
    },
  ],
  food_recommendations: null,
  raw_sequence_data: null,
  missing_data: ["No numeric abundance"],
  privacy: "Synthetic fixture",
};
test("pasted reconstructed JSON preserves scores/organisms without manufacturing abundance", () => {
  const { parsed } = parseReportDocument(
    JSON.stringify(syntheticReport),
    "json",
  );
  assert.equal(parsed.kind, "functional-report");
  assert.equal(parsed.scores[0].score, 42);
  assert.equal(parsed.organisms[0].reportedAbundance, "Not provided");
  assert.equal(parsed.bacteria_percentages, undefined);
  assert.equal(parsed.capabilities.quantitativeAbundance, false);
  assert.equal(parsed.capabilities.measuredMetabolites, false);
  assert.equal(parsed.sourceReport.data_origin, syntheticReport.data_origin);
  assert.ok(parsed.missingData.some((s) => s.includes("Diversity")));
  assert.equal(
    resolveReportDate(undefined, parsed, new Date("2026-10-01T00:00:00Z"))
      .dateSource,
    "import-date",
  );
  assert.throws(() => resolveReportDate("2026-02-30", parsed));
  assert.throws(() => resolveReportDate("yesterday", parsed));
  const dated = parseStructuredReport({
    ...syntheticReport,
    metadata: { test_date: "2026-09-10" },
  });
  assert.equal(
    resolveReportDate(undefined, dated).dateSource,
    "report-provided",
  );
  assert.equal(
    resolveReportDate("2026-09-11", dated).dateSource,
    "user-provided",
  );
});
test("recognized export envelopes and explicit percentages remain distinct", () => {
  const report = parseStructuredReport({
    metadata: { provider: "Reported vendor" },
    data: {
      healthScores: { Example: { value: 12, scale: "0-100" } },
      microorganisms: [
        { name: "Species", abundance: { value: 8, unit: "reads" } },
      ],
    },
  });
  assert.equal(report.scores[0].score, 12);
  assert.equal(report.organisms[0].reportedAbundance, "8 reads");
  assert.equal(report.bacteria_percentages, undefined);
  assert.deepEqual(
    parseReportDocument("bacteria,abundance\nRoseburia,3.2", "csv").parsed
      .bacteria_percentages,
    { Roseburia: 3.2 },
  );
  assert.deepEqual(
    parseStructuredReport({ bacteria_percentages: { Roseburia: 0 } })
      .bacteria_percentages,
    { Roseburia: 0 },
  );
  for (const invalid of [
    "{oops",
    "[]",
    "{}",
    '{"bacteria_percentages":{"a":"detected"}}',
    '{"scores":[{"name":"x","score":101,"scale":"0–100"}]}',
  ])
    assert.throws(() => parseReportDocument(invalid, "json"));
  assert.throws(
    () => parseStructuredReport({ scores: [{ score: 5 }] }),
    /needs a name/,
  );
});
test("manual and file imports use the same account-scoped path without a Python service", async () => {
  const samples: any[] = [],
    bacteria: any[] = [],
    analyses: any[] = [];
  const store: any = {
    insertMicrobiomeSample: async (data: any) => {
      assert.equal(insertMicrobiomeSampleSchema.safeParse(data).success, true);
      const row = { id: "s" + samples.length, ...data };
      samples.push(row);
      return row;
    },
    updateMicrobiomeSample: async (id: string, updates: any) =>
      Object.assign(
        samples.find((s) => s.id === id),
        updates,
      ),
    insertBacterialComposition: async (row: any) => {
      bacteria.push(row);
    },
    insertMlAnalysis: async (row: any) => {
      analyses.push(row);
    },
  };
  const app = express();
  app.use(express.json({ limit: "2mb" }));
  app.use((req, _res, next) => {
    req.session = { userId: req.header("x-user") } as any;
    next();
  });
  registerReportRoutes(
    app,
    (req, res, next) =>
      req.session.userId
        ? next()
        : void res.status(401).json({ error: "Auth required" }),
    store,
  );
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((r) => server.on("listening", r));
  const base = `http://127.0.0.1:${(server.address() as any).port}`;
  const post = (path: string, body: any, user = "u") =>
    fetch(base + path, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(user ? { "x-user": user } : {}),
      },
      body: JSON.stringify(body),
    });
  try {
    assert.equal(
      (await post("/api/microbiome/import", { report: syntheticReport }, ""))
        .status,
      401,
    );
    const result = await post("/api/microbiome/import", {
      report: syntheticReport,
    });
    assert.equal(result.status, 200);
    assert.equal((await result.json()).preview.quantifiedTaxa, 0);
    assert.equal(bacteria.length, 0);
    assert.equal(samples[0].userId, "u");
    assert.equal(samples[0].processingStatus, "completed");
    assert.equal(samples[0].diversityIndex, null);
    assert.equal(analyses[0].results.measuredMetabolites, false);
    const file = new FormData();
    file.append(
      "file",
      new Blob([JSON.stringify(syntheticReport)], { type: "application/json" }),
      "viome.json",
    );
    const uploaded = await fetch(base + "/api/microbiome/upload", {
      method: "POST",
      headers: { "x-user": "other" },
      body: file,
    });
    assert.equal(uploaded.status, 200);
    assert.equal(samples[1].userId, "other");
    assert.equal(
      samples[1].structuredData.importInfo.originalFilename,
      "viome.json",
    );
    assert.deepEqual(
      samples[0].structuredData.scores,
      samples[1].structuredData.scores,
    );
    assert.equal(
      (
        await post("/api/microbiome/import", {
          report: syntheticReport,
          testDate: "2026-02-30",
        })
      ).status,
      400,
    );
    assert.equal(samples.length, 2);
    assert.equal(
      (await post("/api/microbiome/import", { report: {}, userId: "other" }))
        .status,
      400,
    );
    const old = await post("/api/microbiome/import", {
      bacteria_percentages: { Roseburia: 3.2 },
    });
    assert.equal(old.status, 200);
    assert.equal(bacteria.length, 1);
    assert.equal(bacteria[0].abundance, 3.2);
    assert.equal((await post("/api/microbiome/import",{report:syntheticReport,testDate:"2026-10-26"})).status,200);
    assert.equal(samples.at(-1).structuredData.importInfo.testDateInput,"2026-10-26");
    assert.equal(samples.at(-1).structuredData.importInfo.dateSource,"user-provided");
    assert.equal(samples.at(-1).testDate.toISOString(),"2026-10-26T00:00:00.000Z");
  } finally {
    server.closeAllConnections();
    await new Promise<void>((r) => server.close(() => r()));
  }
});
