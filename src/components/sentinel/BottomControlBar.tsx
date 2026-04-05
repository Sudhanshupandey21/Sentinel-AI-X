import { Bomb, Brain, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BottomControlBarProps {
  threatDetected: boolean;
  isProcessing: boolean;
  onSimulate: () => void;
  onPredict: () => void;
  onAutoResponse: () => void;
}

const BottomControlBar = ({
  threatDetected,
  isProcessing,
  onSimulate,
  onPredict,
  onAutoResponse,
}: BottomControlBarProps) => {
  return (
    <div className="h-14 border-t border-border bg-card/80 backdrop-blur-sm flex items-center justify-center gap-3 px-4">
      <Button
        onClick={onSimulate}
        disabled={isProcessing}
        className="bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 font-display text-xs tracking-wider h-9"
      >
        {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bomb className="w-3.5 h-3.5" />}
        SIMULATE ATTACK
      </Button>

      <Button
        onClick={onPredict}
        disabled={!threatDetected || isProcessing}
        className="bg-warning/10 text-warning border border-warning/30 hover:bg-warning/20 font-display text-xs tracking-wider h-9 disabled:opacity-30"
      >
        <Brain className="w-3.5 h-3.5" />
        PREDICT NEXT MOVE
      </Button>

      <Button
        onClick={onAutoResponse}
        disabled={!threatDetected || isProcessing}
        className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 font-display text-xs tracking-wider h-9 disabled:opacity-30"
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        AUTO RESPONSE
      </Button>
    </div>
  );
};

export default BottomControlBar;
