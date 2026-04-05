import { useState, useRef } from "react";
import { Upload, Image as ImageIcon, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DetectionResult, SystemStatus } from "@/types/sentinel";

interface LeftPanelProps {
  onDetection: (result: DetectionResult) => void;
  isProcessing: boolean;
  setIsProcessing: (v: boolean) => void;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const LeftPanel = ({ onDetection, isProcessing, setIsProcessing }: LeftPanelProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detection, setDetection] = useState<DetectionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);
    setDetection(null);

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Invalid format. Only JPG and PNG images are accepted.");
      return;
    }

    if (file.size > MAX_SIZE) {
      setError("File too large. Maximum allowed size is 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = () => {
    if (!preview) {
      setError("Please upload an image or simulate an attack first.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    // Simulate AI detection
    setTimeout(() => {
      const result: DetectionResult = {
        label: "Hostile Unit Detected",
        confidence: 94.7,
        threatLevel: "DANGER",
      };
      setDetection(result);
      onDetection(result);
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col gap-3 p-3">
      <h2 className="text-xs font-display font-semibold tracking-[0.15em] text-muted-foreground">
        IMAGE ANALYSIS
      </h2>

      {/* Upload area */}
      <div
        className="relative border border-dashed border-border rounded flex flex-col items-center justify-center gap-2 p-4 cursor-pointer hover:border-primary/50 transition-colors min-h-[140px]"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png"
          className="hidden"
          onChange={handleFileChange}
        />
        {preview ? (
          <img src={preview} alt="Upload preview" className="max-h-[120px] rounded object-contain" />
        ) : (
          <>
            <Upload className="w-6 h-6 text-muted-foreground" />
            <p className="text-xs font-mono text-muted-foreground text-center">
              Drop image or click to upload<br />
              <span className="text-[10px]">JPG, PNG — Max 5MB</span>
            </p>
          </>
        )}
      </div>

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
        disabled={isProcessing}
        className="w-full bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 font-display text-xs tracking-wider"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ANALYZING...
          </>
        ) : (
          <>
            <ImageIcon className="w-3.5 h-3.5" />
            RUN DETECTION
          </>
        )}
      </Button>

      {/* Detection result */}
      {detection && (
        <div className="border border-danger/30 bg-danger/5 rounded p-3 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-danger" />
            <span className="text-xs font-display font-semibold text-danger tracking-wider">
              THREAT IDENTIFIED
            </span>
          </div>
          <div className="space-y-1 font-mono text-[11px] text-foreground/80">
            <p>Target: {detection.label}</p>
            <p>Confidence: {detection.confidence}%</p>
            <p>Level: <span className="text-danger font-semibold">{detection.threatLevel}</span></p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeftPanel;
