import {invalidatePlanningInputs} from "@/lib/planning-cache";
import { useState } from "react";
import { parseReportDocument, STRUCTURED_REPORT_MAX_BYTES } from "@shared/structured-report";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [testDate, setTestDate] = useState<Date>();
  const [testingCompany, setTestingCompany] = useState("");
  const [testId, setTestId] = useState("");
  const [notes, setNotes] = useState("");
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualData, setManualData] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const handleSubmit = async () => {
    const pasted = showManualEntry ? manualData.trim() : "";
    const selectedFile = showManualEntry ? null : file;
    if (!selectedFile && !pasted) {
      toast({ title: "Choose a file or enter data", variant: "destructive" });
      return;
    }
    setIsUploading(true);

    try {
      if (
        pasted ||
        selectedFile?.name.toLowerCase().endsWith(".json") ||
        selectedFile?.name.toLowerCase().endsWith(".csv")
      ) {
        const text = pasted || (await selectedFile!.text());
        if (selectedFile && !pasted && selectedFile.size > STRUCTURED_REPORT_MAX_BYTES) throw Error("JSON/CSV reports must be 2 MB or smaller.");
        const parsed = parseReportDocument(
          text,
          pasted || selectedFile!.name.toLowerCase().endsWith(".json")
            ? "json"
            : "csv",
        );
        await apiRequest("POST", "/api/microbiome/import", {
          report: parsed.source,
          originalFilename: pasted ? undefined : selectedFile?.name,
          testDate: testDate?.toISOString(),
          testingCompany,
          testId,
          notes,
        });
        await invalidatePlanningInputs();
        queryClient.invalidateQueries({
          queryKey: ["/api/microbiome/samples"],
        });
        toast({
          title: "Report saved",
          description:
            `${parsed.parsed.scores.length} scores, ${parsed.parsed.organisms.length} reported organisms and ${Object.keys(parsed.parsed.bacteria_percentages || {}).length} quantified taxa saved. Missing measurements remain unavailable.`,
        });
        setLocation("/microbiome");
        return;
      }
      const formData = new FormData();
      formData.append("file", selectedFile!);
      if (testDate) formData.append("testDate", testDate.toISOString());
      if (testingCompany) formData.append("testingCompany", testingCompany);
      if (testId) formData.append("testId", testId);
      if (notes) formData.append("notes", notes);

      const response = await fetch("/api/microbiome/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      toast({
        title: "Microbiome file uploaded",
        description:
          "File recorded. Raw-sequence taxonomic analysis requires a separate validated pipeline.",
      });

      setTimeout(() => {
        setLocation("/microbiome");
      }, 1500);
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description:
          error.message || "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
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

      <div className="method-switch" role="group" aria-label="Report entry method">
        <Button variant={!showManualEntry ? "default" : "outline"} aria-pressed={!showManualEntry} onClick={() => setShowManualEntry(false)}>Upload a file</Button>
        <Button variant={showManualEntry ? "default" : "outline"} aria-pressed={showManualEntry} onClick={() => setShowManualEntry(true)} data-testid="button-toggle-manual">Paste JSON data</Button>
      </div>
      {!showManualEntry && <FileUploadZone
        onFileSelect={setFile}
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


      {file && !showManualEntry && !/\.(json|csv)$/i.test(file.name) && <p className="report-context" role="status">This file can be stored. Automatic bacterial analysis of raw sequencing files is not available.</p>}
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
                onSelect={setTestDate}
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
      <Button
        onClick={handleSubmit}
        className="w-full h-12"
        disabled={(showManualEntry ? !manualData.trim() : !file) || isUploading}
        data-testid="button-submit-upload"
      >
        {isUploading ? "Saving your report…" : "Save report"}
      </Button>
      <details className="workspace-disclosure"><summary>Supported report formats</summary><p className="panel-note">JSON and CSV reports support up to 2 MB. JSON can contain Viome-style scores and organisms, a reconstructed report, or bacteria_percentages. CSV uses bacteria and abundance percentage columns. Scores and organism listings stay separate from measured abundance. Raw sequence classification is not implemented.</p></details>
    </main>
  );
}
