import type {Express,RequestHandler} from 'express';
import {labResponseContextSelectionSchema,labResponseContextPrepareSchema,labResponseContextSaveSchema,labResponseContextDeleteSchema} from '../shared/lab-response-context';
import {LabResponseContextError,type LabResponseContextStorage} from './lab-response-context-storage';

/** Mount only after reader compatibility is available. Isolated HTTP QA uses
 * this same controller; there is no alternate fixture writer in the app. */
export function registerLabResponseContextRoutes(app:Express,auth:RequestHandler,limit:RequestHandler,store:Pick<LabResponseContextStorage,'view'|'prepare'|'save'|'deleteHistory'>){
 const path='/api/experience/lab-response-context';
 app.use(path,(_req,res,next)=>{res.setHeader('Cache-Control','no-store');res.vary('Cookie');next();},auth,(req,res,next)=>{if(!req.session?.userId)return void res.sendStatus(401);next();});
 const fail=(res:any,error:unknown)=>error instanceof LabResponseContextError?res.status(error.status).json({error:error.message}):res.status(503).json({error:'Lab context is unavailable. Your source results and ordinary logging are unchanged.'});
 app.post(path+'/view',limit,async(req,res)=>{
  const input=labResponseContextSelectionSchema.safeParse(req.body);if(!input.success||Object.keys(req.query).length)return void res.status(400).json({error:'Choose the exact source records for this context.'});
  try{res.json(await store.view(req.session.userId!,input.data));}catch(error){fail(res,error);}
 });
 app.post(path+'/prepare',limit,async(req,res)=>{
  const input=labResponseContextPrepareSchema.safeParse(req.body);if(!input.success||Object.keys(req.query).length)return void res.status(400).json({error:'Review the current source records before adding context.'});
  try{res.json(await store.prepare(req.session.userId!,input.data));}catch(error){fail(res,error);}
 });
 app.post(path+'/save',limit,async(req,res)=>{
  const input=labResponseContextSaveSchema.safeParse(req.body);if(!input.success||Object.keys(req.query).length)return void res.status(400).json({error:'Review the answer, remembered dates and current source records.'});
  try{const saved=await store.save(req.session.userId!,input.data);res.status(saved.replayed?200:201).json(saved);}catch(error){fail(res,error);}
 });
 app.delete(path,limit,async(req,res)=>{
  const input=labResponseContextDeleteSchema.safeParse(req.body);if(!input.success||Object.keys(req.query).length||req.get('X-Bloom-Confirm')!=='delete-lab-response-context-history')return void res.status(400).json({error:'Confirm the exact remembered context history before deleting.'});
  try{await store.deleteHistory(req.session.userId!,input.data);res.status(204).end();}catch(error){fail(res,error);}
 });
}
