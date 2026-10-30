import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { HealthSourceControls } from "./ExperienceDataControls";
import { Button } from "./ui/button";

type SourceStatus = { provider: string; state: string; consentRecorded: boolean };
type SourceResponse = { connections: SourceStatus[] };
const providers = [["apple_health", "Apple Health"], ["health_connect", "Health Connect"]] as const;

export default function ConnectionsOverview() {
  const { user } = useAuth();
  const status = useQuery<SourceResponse>({
    queryKey: ["/api/health-sources", user?.id],
    enabled: !!user,
    refetchOnMount: "always",
    queryFn: async ({ signal }) => {
      const data = await (await apiRequest("GET", "/api/health-sources", undefined, undefined, signal)).json();
      if (!Array.isArray(data?.connections) || data.connections.some((s: SourceStatus) => !s || typeof s.provider !== "string" || typeof s.state !== "string" || typeof s.consentRecorded !== "boolean")) {
        throw new Error("Source status unavailable");
      }
      return data;
    },
  });
  const current = status.fetchStatus === "idle" && !status.isError && !status.isStale ? status.data : undefined;
  return <section className="space-y-4" aria-label="Health source availability">
    <p>Bloom works without a device. Native device connections are not available in this browser.</p>
    {!current && !status.isError && <p role="status">{status.fetchStatus === "paused" ? "Source status check paused. Reconnect to check availability." : "Checking source status…"}</p>}
    {status.isError && <p role="alert">Source status could not be checked. Stored records have not been changed.</p>}
    {(status.isError || status.fetchStatus === "paused") && <Button variant="outline" disabled={status.isFetching} onClick={() => status.refetch()}>Retry source status</Button>}
    {current && <div className="grid gap-3 sm:grid-cols-2">{providers.map(([provider, label]) => {
      const source = current.connections.find(s => s.provider === provider);
      return <article key={provider} className="rounded-xl border p-4 space-y-2">
        <h3>{label}</h3>
        <p>{source?.state === "not_connected" ? "Not connected" : "Connection status not verified"}</p>
        <dl className="space-y-2 text-sm">
          <div><dt className="text-muted-foreground">Stored consent record</dt><dd>{source ? source.consentRecorded ? "Recorded in Bloom" : "None recorded in Bloom" : "Not reported"}</dd></div>
          <div><dt className="text-muted-foreground">Device permission</dt><dd>Not verified by this browser</dd></div>
          <div><dt className="text-muted-foreground">Last sync</dt><dd>Not reported</dd></div>
        </dl>
      </article>;
    })}</div>}
    <p className="panel-note">A stored consent record does not grant device permission or prove a connection. Manage native permissions in device settings.</p>
    <p className="flex flex-wrap gap-4"><a href="/activity" className="text-link inline-flex min-h-11 items-center">Log activity manually</a><a href="/nutrition" className="text-link inline-flex min-h-11 items-center">Open food journal</a></p>
    <HealthSourceControls/>
  </section>;
}
