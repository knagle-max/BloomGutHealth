import { apiRequest } from "./queryClient";
import { accountContextGuard } from "./request-actor";
/** Check identity again after the private response body finishes loading. */
export async function downloadAccountFile(path: string, filename: string): Promise<void> {
  const assertCurrent = accountContextGuard();
  const response = await apiRequest("GET", path);
  const blob = await response.blob();
  assertCurrent();
  const url = URL.createObjectURL(blob), anchor = document.createElement("a");
  try { anchor.href=url; anchor.download=filename; document.body.appendChild(anchor); anchor.click(); }
  finally { anchor.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000); }
}
