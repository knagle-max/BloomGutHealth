import {z} from 'zod';
export const exerciseCatalogueReferenceSchema=z.object({id:z.string().regex(/^(exercise\.[a-f0-9]{24}|custom\.[a-f0-9-]{36})$/),version:z.string().min(1).max(100),match:z.enum(['selected','description-suggestion']),confirmed:z.boolean()}).strict();
