import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { FlaskConical, Upload, ArrowRight, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { MicrobiomeSample } from "@shared/schema";

export default function Microbiome() {
  const { user } = useAuth();
  const samples = useQuery<MicrobiomeSample[]>({
    queryKey: ["/api/microbiome/samples", user?.id],
    enabled: !!user,
  });
  return (
    <main className="science-page">
      <div className="science-heading">
        <p className="eyebrow">YOUR RESEARCH CONTEXT</p>
        <h1>Your microbiome reports.</h1>
        <p>
          Keep a record of your tests. Food logs describe diet; they do not
          measure microbial composition.
        </p>
      </div>
      <section className="bloom-panel">
        <div className="panel-heading">
          <h2>Test history</h2>
          <Link href="/upload" className="text-link">
            <Upload size={16} /> Add report
          </Link>
        </div>
        {samples.isLoading ? (
          <Skeleton className="h-32 w-full mt-5" />
        ) : samples.isError ? (
          <div className="bloom-error mt-5" role="alert">
            Reports couldn't load.
            <Button variant="outline" onClick={() => samples.refetch()}>
              <RefreshCw size={15} className="mr-2" />
              Retry
            </Button>
          </div>
        ) : samples.data?.length ? (
          <div className="meal-list">
            {[...samples.data]
              .sort((a, b) => +new Date(b.testDate) - +new Date(a.testDate))
              .map((sample) => (
                <article className="meal-row" key={sample.id}>
                  <span className="meal-icon">
                    <FlaskConical size={20} />
                  </span>
                  <div>
                    <p className="meal-type">
                      {new Date(sample.testDate).toLocaleDateString()} ·{" "}
                      {sample.processingStatus}
                    </p>
                    <h3>{sample.testingCompany || "Microbiome report"}</h3>
                    {sample.testId && (
                      <p className="panel-note">Test ID: {sample.testId}</p>
                    )}
                  </div>
                </article>
              ))}
          </div>
        ) : (
          <div className="journal-empty">
            <span className="meal-icon">
              <FlaskConical size={24} />
            </span>
            <div>
              <h3>No reports yet.</h3>
              <p>
                You can explore dietary mechanisms in the coach before adding a
                test.
              </p>
            </div>
          </div>
        )}
        <p className="panel-note">
          Uploaded sequencing analysis is not implemented yet. Older stored
          analysis may have used demonstration logic; this screen does not treat
          it as verified laboratory measurements. Report interpretation and
          validated function measurements are the next integration step.
        </p>
      </section>
      <section className="bloom-panel mt-5">
        <p className="eyebrow">START WITH A FUNCTION</p>
        <h2>What would you like to support?</h2>
        <p className="science-boundary">
          The coach connects goals to microbial functions and dietary
          substrates, with study links. It does not infer your bacteria from
          your meals or calculate a similarity score to athletes or
          centenarians.
        </p>
        <Link href="/insights" className="text-link">
          Explore the Diet coach <ArrowRight size={17} />
        </Link>
      </section>
    </main>
  );
}
