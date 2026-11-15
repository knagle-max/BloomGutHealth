import {useQuery} from '@tanstack/react-query';
import {labManagedSourceSchema} from '@shared/lab-report-metadata';
import {apiRequest} from './queryClient';
import {useAuth} from './auth';
export const labSourcesKey=(owner:string|undefined)=>['/api/precision/labs/sources',owner];
export function useLabSources(){const {user}=useAuth();return useQuery({queryKey:labSourcesKey(user?.id),enabled:!!user,queryFn:async({signal})=>labManagedSourceSchema.array().parse(await(await apiRequest('GET','/api/precision/labs/sources',undefined,undefined,signal)).json())});}
