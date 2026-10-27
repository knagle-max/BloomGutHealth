import {useStructuredReportSave} from "@/lib/useStructuredReportSave";
import {invalidatePlanningInputs} from "@/lib/planning-cache";
import { useState, useRef, useEffect } from "react";
import { parseReportDocument, STRUCTURED_REPORT_MAX_BYTES } from "@shared/structured-report";
import { queryClient } from "@/lib/queryClient";
import FileUploadZone from "@/components/FileUploadZone";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [testDate, setTestDate] = useState<Date>();
  const [testingCompany, setTestingCompany] = useState("");
  const [testId, setTestId] = useState("");
  const [notes, setNotes] = useState("");
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualData, setManualData] = useState("");
  const [reading, setReading] = useState(false);
  const save=useStructuredReportSave(),isUploading=reading||save.pending,frozen=isUploading||save.uncertain||!!save.saved;
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const active=useRef(true),actor=useRef(user?.id);actor.current=user?.id;
  useEffect(()=>{active.current=true;return()=>{active.current=false;};},[]);

  const handleSubmit = async () => {
    const owner=user?.id;if(!owner||isUploading||save.saved)return;
    let acknowledged=false;
    try {
      let result;
      if(save.uncertain)result=await save.retry();
      else {
        const pasted=showManualEntry?manualData.trim():"",selected=showManualEntry?null:file;
        if(!selected&&!pasted)throw Error("Choose a file or paste report data.");
        if(selected&&selected.size>STRUCTURED_REPORT_MAX_BYTES)throw Error("JSON/CSV reports must be 2 MB or smaller.");
        if(selected&&!/\.(json|csv)$/i.test(selected.name))throw Error("Choose a JSON or CSV report. Raw sequence processing is not available.");
        setReading(true);
        const text=pasted||await selected!.text(),parsed=parseReportDocument(text,pasted||selected!.name.toLowerCase().endsWith(".json")?"json":"csv");
        if(!active.current||actor.current!==owner)return;
        result=await save.submit({report:parsed.source,originalFilename:pasted?undefined:selected?.name,testDate:testDate?format(testDate,"yyyy-MM-dd"):undefined,testingCompany,testId,notes},{kind:parsed.parsed.kind,scores:parsed.parsed.scores.length,reportedOrganisms:parsed.parsed.organisms.length,quantifiedTaxa:Object.keys(parsed.parsed.bacteria_percentages||{}).length});
      }
      if(!result||!active.current||actor.current!==owner)return;
      acknowledged=true;
      await invalidatePlanningInputs();
      await queryClient.invalidateQueries({queryKey:["/api/microbiome/samples"]});
      if(!active.current||actor.current!==owner)return;
      toast({title:"Report saved",description:`${result.preview.scores} scores, ${result.preview.reportedOrganisms} reported organisms and ${result.preview.quantifiedTaxa} quantified taxa saved. Missing measurements remain unavailable.`});
      setLocation("/microbiome?sample="+encodeURIComponent(result.sampleId));
    } catch(error) {
      if(!active.current||actor.current!==owner)return;
      toast({title:acknowledged?"Report saved":"Import needs review",description:acknowledged?"Open the saved report using the link below.":error instanceof Error?error.message:"Check your report and try again.",variant:acknowledged?"default":"destructive"});
    } finally {
      if(active.current&&actor.current===owner)setReading(false);
    }
  };

  return (
    <main className="science-page upload-page space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold mb-2">
          Add a gut report
        </h1>
        <p className="text-sm text-muted-foreground">
          Choose a file or paste your report data. We’ll keep the original source and explain what’s available.
        </p>
      </div>

      <fieldset disabled={frozen} className="min-w-0 space-y-6 border-0 p-0 m-0"><legend className="sr-only">Gut report input</legend>
      <div className="method-switch" role="group" aria-label="Report entry method">
        <Button variant={!showManualEntry ? "default" : "outline"} aria-pressed={!showManualEntry} onClick={() => setShowManualEntry(false)}>Upload a file</Button>
        <Button variant={showManualEntry ? "default" : "outline"} aria-pressed={showManualEntry} onClick={() => setShowManualEntry(true)} data-testid="button-toggle-manual">Paste JSON data</Button>
      </div>
      {!showManualEntry && <FileUploadZone
        disabled={frozen}
        onFileSelect={next=>{if(!frozen)setFile(next);}}
        acceptedFormats={["JSON", "CSV"]}
        maxSizeMB={2}
      />}
      <div className="report-paste-section">
        {showManualEntry && (
          <div className="mt-4 space-y-2">
            <Label htmlFor="manual-data">Paste Your Data</Label>
            <Textarea
              id="manual-data"
              placeholder='{"bacteria_percentages": {"Akkermansia": 2.5, ...}}'
              value={manualData}
              onChange={(e) => setManualData(e.target.value)}
              className="min-h-32 font-mono text-xs resize-none"
              data-testid="input-manual-data"
            />
            <p className="text-xs text-muted-foreground">
              Paste the full JSON object, including scores/organisms or bacteria_percentages. Numeric scores are not treated as bacterial percentages.
            </p>
          </div>
        )}
      </div>



      <details className="bloom-panel workspace-disclosure">
      <summary>Report details (optional)</summary>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Test Date (Optional)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal h-10"
                data-testid="button-date-picker"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {testDate ? format(testDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={testDate}
                onSelect={next=>{if(!frozen)setTestDate(next);}}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <p className="text-xs text-muted-foreground">If no date is chosen, an exact date in the report is used when available. Otherwise the report is labelled with its import date; a reported month/year is kept separately.</p>
        <div className="space-y-2">
          <Label htmlFor="company">Testing Company</Label>
          <Select value={testingCompany} onValueChange={setTestingCompany}>
            <SelectTrigger id="company" data-testid="select-company">
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="viome">Viome</SelectItem>
              <SelectItem value="thryve">Thryve</SelectItem>
              <SelectItem value="ubiome">uBiome</SelectItem>
              <SelectItem value="biomesight">Biomesight</SelectItem>
              <SelectItem value="custom">Custom Lab</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="test-id">Test ID (Optional)</Label>
          <Input
            id="test-id"
            placeholder="e.g., TEST-12345"
            value={testId}
            onChange={(e) => setTestId(e.target.value)}
            data-testid="input-test-id"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Any relevant context about your test..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-20 resize-none"
            data-testid="input-notes"
          />
        </div>
      </div>


      </details>
      </fieldset>
      {save.error&&<p role="alert">{save.error.message}</p>}
      {save.uncertain&&<p role="status">Keep this page open to retry the same import. Your original details are locked until the save is confirmed. <Link className="text-link" href={save.checkHref} target="_blank" rel="noopener">Check saved reports</Link></p>}
      {save.saved&&<p role="status">Report saved. <Link className="text-link" href={save.checkHref}>Open saved report</Link></p>}
      <Button
        onClick={handleSubmit}
        className="w-full h-12"
        disabled={(!save.uncertain&&(showManualEntry ? !manualData.trim() : !file)) || isUploading || !!save.saved}
        data-testid="button-submit-upload"
      >
        {reading&&!save.pending?"Reading report…":isUploading?"Saving your report…":save.saved?"Report saved":save.uncertain?"Retry saving report":"Save report"}
      </Button>
      <details className="workspace-disclosure"><summary>Supported report formats</summary><p className="panel-note">JSON and CSV reports support up to 2 MB. JSON can contain Viome-style scores and organisms, a reconstructed report, or bacteria_percentages. CSV uses bacteria and abundance percentage columns. Scores and organism listings stay separate from measured abundance. Raw sequence classification is not implemented.</p></details>
    </main>
  );
}
