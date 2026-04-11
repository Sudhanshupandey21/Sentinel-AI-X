import { useState, useRef, type ChangeEvent, type DragEvent } from "react";
import { Upload, Image as ImageIcon, AlertTriangle, Loader2, X, CheckCircle2, Zap, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SystemStatus } from "@/types/sentinel";

interface LeftPanelProps {
  onAIAnalysis?: (result: { situation: string; risk: "LOW" | "MEDIUM" | "HIGH"; urgency: "NORMAL" | "ALERT" | "CRITICAL"; alertMessage: string; prediction: string; actions: string[]; source: 'api' | 'fallback' }) => void;
  isProcessing: boolean;
  status: SystemStatus;
}



const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const LeftPanel = ({ onAIAnalysis, isProcessing, status }: LeftPanelProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{ risk: "LOW" | "MEDIUM" | "HIGH"; prediction: string; actions: string[]; } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mapFileNameToScenario = (fileName: string) => {
    const lower = fileName.toLowerCase();

    if (lower.includes("drone")) {
      return "Drone detected near border area";
    }

    if (lower.includes("water") || lower.includes("flood")) {
      return "Flood risk detected";
    }

    if (lower.includes("crowd")) {
      return "Large crowd gathering detected";
    }

    return "Suspicious activity detected";
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const processFile = (file: File | undefined) => {
    setError(null);

    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Invalid format. Only JPG and PNG images are accepted.");
      setUploadedFile(null);
      setPreview(null);
      return;
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setError(`File too large (${sizeMB}MB). Maximum allowed size is 5MB.`);
      setUploadedFile(null);
      setPreview(null);
      return;
    }

    // Store file in state
    setUploadedFile(file);

    // Create object URL for preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string);
    };
    reader.onerror = () => {
      setError("Failed to read file. Please try again.");
      setUploadedFile(null);
      setPreview(null);
    };
    reader.readAsDataURL(file);
  };

  const handleClearUpload = () => {
    setPreview(null);
    setUploadedFile(null);
    setError(null);
    setIsAnalyzing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAnalyze = async () => {
    if (!preview || !uploadedFile) {
      setError("Please upload an image first.");
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);

    const scenario = mapFileNameToScenario(uploadedFile.name);
    const aiPromise = fetch("/ai-analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ scenario }),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("AI service returned an error");
        }
        return response.json();
      })
      .then((data) => {
        if (!data || typeof data.risk !== "string" || typeof data.urgency !== "string" || typeof data.situation !== "string" || typeof data.alertMessage !== "string" || typeof data.prediction !== "string" || !Array.isArray(data.actions)) {
          throw new Error("Invalid AI response");
        }
        return {
          situation: data.situation as string,
          risk: data.risk as "LOW" | "MEDIUM" | "HIGH",
          urgency: data.urgency as "NORMAL" | "ALERT" | "CRITICAL",
          alertMessage: data.alertMessage as string,
          prediction: data.prediction,
          actions: data.actions.filter((action: unknown) => typeof action === "string") as string[],
          source: (data.source === 'api' ? 'api' : 'fallback') as 'api' | 'fallback',
        };
      });

    try {
      const result = await aiPromise;
      setAiResult(result);
      onAIAnalysis?.(result);
    } catch (err) {
      console.error("AI API error:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setAiError(`AI analysis failed: ${errorMessage}. Using fallback output.`);
      const fallbackResult = {
        situation: "Unable to complete AI analysis — fallback monitoring active",
        risk: "MEDIUM" as const,
        urgency: "ALERT" as const,
        alertMessage: "⚠️ ALERT: AI service unavailable — fallback analysis deployed",
        prediction: "The scenario could not be evaluated by the AI service, but ongoing monitoring is recommended.",
        actions: [
          "Continue monitoring the situation",
          "Notify response teams for standby status",
          "Review system logs for any anomalous behavior"
        ],
        source: 'fallback' as const,
      };
      setAiResult(fallbackResult);
      onAIAnalysis?.(fallbackResult);
    } finally {
      setIsAnalyzing(false);
      setAiLoading(false);
    }
  };

  const panelGlow = {
    SAFE: "shadow-safe-glow/20",
    WARNING: "shadow-warning-glow/20",
    DANGER: "shadow-danger-glow/30",
  };

  const headerColor = {
    SAFE: "text-safe",
    WARNING: "text-warning",
    DANGER: "text-danger",
  };

  return (
    <div className={`min-h-0 flex flex-col gap-4 p-4 overflow-y-auto bg-card/60 backdrop-blur-sm border-r border-border/50 ${panelGlow[status]} transition-all duration-500`}>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Activity className={`w-4 h-4 ${headerColor[status]}`} />
          {status === 'DANGER' && (
            <div className="absolute inset-0 rounded-full bg-danger/20" />
          )}
        </div>
        <h2 className="text-sm font-display font-bold tracking-[0.2em] text-foreground">
          IMAGE ANALYSIS
        </h2>
      </div>

      {/* Upload area with drag-drop and analysis overlay */}
      <div
        className={`relative border-2 border-dashed rounded flex flex-col items-center justify-center gap-2 p-4 cursor-pointer transition-all min-h-[200px] ${
          isDragging
            ? "border-primary/80 bg-primary/10"
            : preview
            ? "border-safe/40"
            : "border-border hover:border-primary/50"
        }`}
        onClick={() => !preview ? fileInputRef.current?.click() : undefined}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png"
          className="hidden"
          onChange={handleFileChange}
          disabled={isProcessing || isAnalyzing}
        />

        {preview && uploadedFile ? (
          <div className="relative w-full flex flex-col items-center gap-2">
            {/* Image with detection overlay */}
            <div className="relative">
              <img
                src={preview}
                alt="Analysis preview"
                className="max-h-[120px] rounded object-contain border border-border/50"
              />

              {/* Analysis overlay */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-white">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <p className="text-sm font-mono font-semibold">Analyzing image...</p>
                    <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary/60 to-primary/100\" style={{ width: "60%" }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {(aiLoading || aiError || aiResult) && (
              <div className="w-full p-3 rounded border border-primary/30 bg-primary/5 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold uppercase tracking-wider text-foreground">AI Scenario Analysis</span>
                  {aiLoading && <span className="text-[10px] text-muted-foreground">AI analyzing...</span>}
                </div>

                {aiError && (
                  <div className="rounded bg-danger/10 border border-danger/20 p-2 text-danger text-[10px]">
                    {aiError}
                  </div>
                )}

                {aiResult && (
                  <div className="space-y-2 break-words text-sm leading-relaxed">
                    <div className="text-[10px] text-muted-foreground">Risk Level</div>
                    <div className="font-semibold text-sm uppercase">{aiResult.risk}</div>
                    <div className="text-[10px] text-muted-foreground">Prediction</div>
                    <div className="text-sm leading-relaxed break-words">{aiResult.prediction}</div>
                    <div className="text-[10px] text-muted-foreground">Recommended Actions</div>
                    <ul className="list-disc list-inside space-y-1 text-sm break-words">
                      {aiResult.actions.map((action, index) => (
                        <li key={index}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="text-[10px] font-mono text-muted-foreground space-y-1">
              <p>✓ {uploadedFile.name}</p>
              <p>{(uploadedFile.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
        ) : (
          <>
            <Upload className={`w-6 h-6 transition-colors ${
              isDragging ? "text-primary" : "text-muted-foreground"
            }`} />
            <p className="text-xs font-mono text-muted-foreground text-center">
              {isDragging ? "Drop image here" : "Drop image or click to upload"}
              <br />
              <span className="text-[10px]">JPG, PNG — Max 5MB</span>
            </p>
          </>
        )}
      </div>

      {/* File uploaded success indicator */}
      {preview && uploadedFile && !error && (
        <div className="flex items-center gap-2 text-xs text-safe bg-safe/10 border border-safe/20 rounded p-2 animate-fade-in">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          Image ready for analysis
        </div>
      )}

      {/* Clear upload button */}
      {preview && uploadedFile && (
        <Button
          onClick={handleClearUpload}
          variant="outline"
          size="sm"
          className="w-full text-xs h-auto py-1"
        >
          <X className="w-3 h-3" />
          Clear Upload
        </Button>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 text-xs text-danger bg-danger/10 border border-danger/20 rounded p-2 animate-fade-in">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Analyze button */}
      <Button
        onClick={handleAnalyze}
        disabled={isProcessing || isAnalyzing || aiLoading || !uploadedFile}
        className={`w-full backdrop-blur-sm border-2 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-display text-sm tracking-wider min-h-[40px] py-2 ${
          status === 'DANGER'
            ? 'bg-danger/10 text-danger border-danger/30 hover:bg-danger/20 shadow-danger-glow/30'
            : status === 'WARNING'
            ? 'bg-warning/10 text-warning border-warning/30 hover:bg-warning/20 shadow-warning-glow/30'
            : 'bg-safe/10 text-safe border-safe/30 hover:bg-safe/20 shadow-safe-glow/30'
        }`}
      >
        {aiLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            AI ANALYZING...
          </>
        ) : isAnalyzing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ANALYZING IMAGE...
          </>
        ) : isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            PROCESSING RESULTS...
          </>
        ) : (
          <>
            <ImageIcon className="w-4 h-4 mr-2" />
            RUN DETECTION
          </>
        )}
      </Button>
    </div>
  );
};

export default LeftPanel;
