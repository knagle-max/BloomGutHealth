import { useState } from "react";
import { parseReportText } from "@shared/report-import";
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
    if (!file && !manualData.trim()) {
      toast({ title: "Choose a file or enter data", variant: "destructive" });
      return;
    }
    setIsUploading(true);

    try {
      if (
        manualData.trim() ||
        file?.name.toLowerCase().endsWith(".json") ||
        file?.name.toLowerCase().endsWith(".csv")
      ) {
        const text = manualData.trim() || (await file!.text());
        const percentages = parseReportText(
          text,
          manualData.trim() || file!.name.toLowerCase().endsWith(".json")
            ? "json"
            : "csv",
        );
        await apiRequest("POST", "/api/microbiome/import", {
          bacteria_percentages: percentages,
          testDate: testDate?.toISOString(),
          testingCompany,
          testId,
          notes,
        });
        queryClient.invalidateQueries({
          queryKey: ["/api/microbiome/samples"],
        });
        toast({
          title: "Reported abundances imported",
          description:
            "Composition saved. No genes or metabolite concentrations were invented.",
        });
        setLocation("/microbiome");
        return;
      }
      const formData = new FormData();
      formData.append("file", file!);
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
    <div className="pb-20 pt-4 px-4 max-w-md mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold mb-2">
          Upload Microbiome Test
        </h1>
        <p className="text-sm text-muted-foreground">
          Get personalized insights from your results
        </p>
      </div>

      <FileUploadZone
        onFileSelect={setFile}
        acceptedFormats={["JSON", "CSV", "FASTQ", "FASTA", "FA", "FQ"]}
        maxSizeMB={100}
      />
      <p className="text-sm text-muted-foreground">
        JSON: bacteria_percentages object. CSV: bacteria,abundance columns in
        percent units, with distinct taxa at one taxonomic level. FASTQ/FASTA
        can be recorded; sequencing classification is not implemented.
      </p>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Test Date</Label>
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

      <div className="border-t pt-6">
        <button
          onClick={() => setShowManualEntry(!showManualEntry)}
          className="flex items-center gap-2 text-sm font-medium text-primary hover-elevate px-3 py-2 rounded-lg"
          data-testid="button-toggle-manual"
        >
          <span>Manual Data Entry</span>
          {showManualEntry ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

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
              Paste your microbiome data in JSON format
            </p>
          </div>
        )}
      </div>

      <Button
        onClick={handleSubmit}
        className="w-full h-12"
        disabled={(!file && !manualData.trim()) || isUploading}
        data-testid="button-submit-upload"
      >
        {isUploading ? "Uploading..." : "Save report"}
      </Button>
    </div>
  );
}
