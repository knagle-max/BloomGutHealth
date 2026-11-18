import type {Express,Request,RequestHandler} from 'express';
import {z} from 'zod';
import {LAB_RESPONSE_CONTEXT_PROTOCOL,labResponseQuestions,labResponseContextSelectionSchema,labResponseContextPrepareSchema,labResponseContextSaveSchema,labResponseContextDeleteSchema,type LabResponseContextView} from '../shared/lab-response-context';
import {LabResponseContextError,type LabResponseContextStorage} from './lab-response-context-storage';

/** Signed-account controls use the same canonical source proofs and transaction
 * service as app/HTTP QA; no alternate fixture writer or clinical activation. */
export function registerLabResponseContextRoutes(app:Express,auth:RequestHandler,limit:RequestHandler,store:Pick<LabResponseContextStorage,'history'|'view'|'prepare'|'save'|'deleteHistory'>){
 app.use('/api/experience/lab-response-context',(_req,res,next)=>{res.setHeader('Cache-Control','no-store');res.vary('Cookie');res.vary('X-Bloom-Lab-Question-Protocol');next();},auth,(req,res,next)=>{if(!req.session?.userId)return void res.sendStatus(401);next();});
 // A stale browser must not display a new answer beneath its old question.
 // This is a semantic compatibility check; account/source permissions are
 // still enforced by the existing authenticated storage boundary.
 const checkQuestions=(req:Request,family:keyof typeof labResponseQuestions,questions:Array<string|undefined>)=>{
  const protocol=req.get('X-Bloom-Lab-Question-Protocol'),legacy=labResponseQuestions[family].id;
  const requiresVersion2=family==='glycemic'&&questions.includes('medication-change'),knownReader=protocol==='1'||protocol===LAB_RESPONSE_CONTEXT_PROTOCOL;
  if((requiresVersion2&&protocol!==LAB_RESPONSE_CONTEXT_PROTOCOL)||(!knownReader&&questions.some(question=>question&&question!==legacy)))throw new LabResponseContextError(409,'These questions were updated. Reload Bloom to review the current question before answering.');
 };
 const checkReader=(req:Request,family:keyof typeof labResponseQuestions,view:LabResponseContextView)=>checkQuestions(req,family,[view.questionId,view.latest?.record.payload.question]);
 const fail=(res:any,error:unknown)=>error instanceof LabResponseContextError?res.status(error.status).json({error:error.message}):res.status(503).json({error:'Lab context is unavailable. Your source results and ordinary logging are unchanged.'});
 app.post('/api/experience/lab-response-context/history',limit,async(req,res)=>{
  if(!z.object({}).strict().safeParse(req.body).success||Object.keys(req.query).length)return void res.status(400).json({error:'Open remembered context from the signed-in account.'});
  try{const rows=await store.history(req.session.userId!);for(const entry of rows)checkReader(req,entry.selection.family,entry.view);res.json(rows);}catch(error){fail(res,error);}
 });
 app.post('/api/experience/lab-response-context/view',limit,async(req,res)=>{
  const input=labResponseContextSelectionSchema.safeParse(req.body);if(!input.success||Object.keys(req.query).length)return void res.status(400).json({error:'Choose the exact source records for this context.'});
  try{const view=await store.view(req.session.userId!,input.data);checkReader(req,input.data.family,view);res.json(view);}catch(error){fail(res,error);}
 });
 app.post('/api/experience/lab-response-context/prepare',limit,async(req,res)=>{
  const input=labResponseContextPrepareSchema.safeParse(req.body);if(!input.success||Object.keys(req.query).length)return void res.status(400).json({error:'Review the current source records before adding context.'});
  try{const view=await store.prepare(req.session.userId!,input.data);checkReader(req,input.data.family,view);res.json(view);}catch(error){fail(res,error);}
 });
 app.post('/api/experience/lab-response-context/save',limit,async(req,res)=>{
  const input=labResponseContextSaveSchema.safeParse(req.body);if(!input.success||Object.keys(req.query).length)return void res.status(400).json({error:'Review the answer, remembered dates and current source records.'});
  try{checkQuestions(req,input.data.family,[input.data.expectedQuestion??labResponseQuestions[input.data.family].id]);const saved=await store.save(req.session.userId!,input.data);res.status(saved.replayed?200:201).json(saved);}catch(error){fail(res,error);}
 });
 app.delete('/api/experience/lab-response-context',limit,async(req,res)=>{
  const input=labResponseContextDeleteSchema.safeParse(req.body);if(!input.success||Object.keys(req.query).length||req.get('X-Bloom-Confirm')!=='delete-lab-response-context-history')return void res.status(400).json({error:'Confirm the exact remembered context history before deleting.'});
  try{await store.deleteHistory(req.session.userId!,input.data);res.status(204).end();}catch(error){fail(res,error);}
 });
}
