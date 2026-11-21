import { accountFetch } from "./request-actor";
import { QueryClient, QueryFunction } from "@tanstack/react-query";

export class ApiRequestError extends Error {constructor(readonly status:number,message:string,readonly code?:string){super(message);}}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    let message = text;
    let code:string|undefined;
    try {
      const body = JSON.parse(text);
      message = body.error || body.message || text;
      if(typeof body.code==='string'&&/^[A-Z][A-Z0-9_]{0,63}$/.test(body.code))code=body.code;
    } catch { /* Non-JSON responses retain their original message. */ }
    throw new ApiRequestError(res.status,message,code);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  headers?: Record<string, string>,
  signal?: AbortSignal,
): Promise<Response> {
  const res = await accountFetch(url, {
    method,
    headers: { ...(data ? { "Content-Type": "application/json" } : {}), ...headers },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
    signal,
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey, signal }) => {
    const res = await accountFetch(queryKey.join("/") as string, {
      credentials: "include",
      signal,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
