import test from 'node:test';
import assert from 'node:assert/strict';
import {reportDateText,reportDateContext} from '../shared/report-dates';
import {parseStructuredReport,resolveReportDate} from '../shared/structured-report';
test('an undated report uses import-date provenance rather than inventing a test date',()=>{
 const report=parseStructuredReport({bacteria_percentages:{'Synthetic organism':100}}),date=resolveReportDate(undefined,report,new Date('2026-10-27T00:00:00Z'));
 assert.equal(date.dateSource,'import-date');const label=reportDateText({testDate:date.date,structuredData:{...report,importInfo:{dateSource:date.dateSource}}});assert.match(label,/^Imported .*test date not provided$/);assert.doesNotMatch(label,/Test date \(/);
});
test('entered and embedded date-only calendars survive a western time zone without becoming the previous day',()=>{
 const prior=process.env.TZ;process.env.TZ='America/Regina';try{
  assert.equal(reportDateText({testDate:'2026-10-26T00:00:00Z',structuredData:{importInfo:{dateSource:'user-provided',testDateInput:'2026-10-26'}}}),'Test date (entered): 2026-10-26');
  const projected=reportDateContext({testDate:'2026-10-26T00:00:00Z',structuredData:{privateTaxa:'PRIVATE_ORGANISMS',importInfo:{dateSource:'user-provided',testDateInput:'2026-10-26'}}});assert.deepEqual(projected,{source:'user-provided',input:'2026-10-26'});assert.equal(reportDateText({testDate:'2026-10-26T00:00:00Z',dateContext:projected}),'Test date (entered): 2026-10-26');
  const report=parseStructuredReport({report:{metadata:{test_date:'2026-10-26'},bacteria_percentages:{'Synthetic organism':100}}});assert.equal(resolveReportDate(undefined,report).dateSource,'report-provided');assert.equal(reportDateText({testDate:'2026-10-26T00:00:00Z',structuredData:{...report,importInfo:{dateSource:'report-provided'}}}),'Test date (report): 2026-10-26');
 }finally{if(prior===undefined)delete process.env.TZ;else process.env.TZ=prior;}
});
test('legacy absent date precision and source metadata stay explicitly unknown',()=>{
 assert.match(reportDateText({testDate:'2026-10-26T00:00:00Z'}),/test-date source not recorded/);
 assert.match(reportDateText({testDate:'2026-10-26T00:00:00Z',structuredData:{importInfo:{dateSource:'user-provided'}}}),/original entered calendar not recorded/);
 assert.equal(reportDateText({testDate:null}),'Recorded date: Date not recorded · test-date source not recorded');
});
test('an invalid legacy date input cannot be promoted to a confirmed source calendar',()=>{
 assert.match(reportDateText({testDate:'2026-10-26T00:00:00Z',structuredData:{importInfo:{dateSource:'user-provided',testDateInput:'2026-02-30'}}}),/original entered calendar not recorded/);
});
