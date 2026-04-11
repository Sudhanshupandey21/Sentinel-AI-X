import { Zap, Brain, ShieldAlert, Loader2, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SystemStatus } from "@/types/sentinel";

interface BottomControlBarProps {
  analysisComplete: boolean;
  isProcessing: boolean;
  riskPercentage: number;
  status: SystemStatus;
  onSimulate: () => void;
  onPredict: () => void;
  onAutoResponse: () => void;
}

const statusColors = {
  SAFE: {
    bg: "bg-safe/10 hover:bg-safe/20 border-safe/30 text-safe",
    glow: "shadow-safe-glow/30",
  },
  WARNING: {
    bg: "bg-warning/10 hover:bg-warning/20 border-warning/30 text-warning",
    glow: "shadow-warning-glow/30",
  },
  DANGER: {
    bg: "bg-danger/10 hover:bg-danger/20 border-danger/30 text-danger",
    glow: "shadow-danger-glow/30",
  },
};

const BottomControlBar = ({
  analysisComplete,
  isProcessing,
  riskPercentage,
  status,
  onSimulate,
  onPredict,
  onAutoResponse,
}: BottomControlBarProps) => {
  const colors = statusColors[status];

  return (
    <div className="h-16 border-t border-border/50 bg-card/95 backdrop-blur-md flex items-center justify-center gap-4 px-6">
      {/* System Status Indicator */}
      <div className="flex items-center gap-3 px-4 py-2 rounded-lg border border-border/50 bg-card/60 backdrop-blur-sm">
        <Activity className={`w-4 h-4 ${status === 'SAFE' ? 'text-safe' : status === 'WARNING' ? 'text-warning' : 'text-danger'}`} />
        <span className="text-xs font-display font-bold tracking-[0.15em] text-foreground">
          STATUS: {status}
        </span>
      </div>

      {/* Risk Percentage Display */}
      {riskPercentage > 0 && (
        <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border-2 backdrop-blur-sm transition-all duration-500 ${
          riskPercentage >= 90
            ? "bg-danger/8 border-danger/50 text-danger shadow-danger-glow"
            : riskPercentage >= 80
            ? "bg-danger/8 border-danger/30 text-danger/90 shadow-danger-glow/50"
            : riskPercentage >= 60
            ? "bg-warning/8 border-warning/30 text-warning shadow-warning-glow/50"
            : "bg-safe/8 border-safe/30 text-safe shadow-safe-glow/50"
        }`}>
          <div className="relative">
            <Zap className={`w-4 h-4`} />
            {riskPercentage >= 90 && (
              <div className="absolute inset-0 rounded-full bg-danger/20" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-display font-bold tracking-wider">RISK LEVEL</span>
            <span className="text-xs font-mono">{riskPercentage}%</span>
          </div>
        </div>
      )}

      <div className="w-px h-8 bg-border/50" />

      <Button
        onClick={onSimulate}
        disabled={isProcessing}
        className={`backdrop-blur-sm border-2 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${colors.bg} ${colors.glow} font-display text-sm tracking-wider h-10 px-4`}
        title="Simulate threat scenario for testing"
      >
        {isProcessing ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <Zap className="w-4 h-4 mr-2" />
        )}
        SIMULATE THREAT
      </Button>

      <Button
        onClick={onPredict}
        disabled={!analysisComplete || isProcessing}
        className={`backdrop-blur-sm border-2 transition-all duration-300 hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 ${colors.bg} ${colors.glow} font-display text-sm tracking-wider h-10 px-4`}
        title="Use AI to predict next threat movement"
      >
        <Brain className="w-4 h-4 mr-2" />
        AI PREDICTION
      </Button>

      <Button
        onClick={onAutoResponse}
        disabled={!analysisComplete || isProcessing}
        className={`backdrop-blur-sm border-2 transition-all duration-300 hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 ${colors.bg} ${colors.glow} font-display text-sm tracking-wider h-10 px-4`}
        title="Auto-deploy recommended response actions"
      >
        <ShieldAlert className="w-4 h-4 mr-2" />
        AUTO RESPONSE
      </Button>
    </div>
  );
};

export default BottomControlBar;
