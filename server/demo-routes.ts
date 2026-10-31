import type {Express} from 'express';
/** Legacy public demo compatibility: fixtures only, never a database account lookup. */
export function registerSyntheticDemoRoutes(app:Express) {
 app.get('/api/demo/user',(_req,res)=>{
  res.setHeader('Cache-Control','no-store');
  res.json({id:'demo-user-123',username:'Synthetic Bloom example'});
 });
 app.get('/api/demo/samples',(_req,res)=>{
  res.setHeader('Cache-Control','no-store');
  res.json([{id:'demo-sample-123',userId:'demo-user-123',testDate:'2025-09-15T00:00:00.000Z',testingCompany:'Synthetic example — not a laboratory report',testId:'SYNTHETIC-EXAMPLE',processingStatus:'completed',diversityIndex:null,notes:'Fixed synthetic demonstration. Not account data, measured results or a health assessment.'}]);
 });
}
