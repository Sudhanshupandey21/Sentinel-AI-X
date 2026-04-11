import { useState, useEffect } from "react";
import { Brain, TrendingUp, AlertTriangle, Zap } from "lucide-react";

interface AIPredictionPanelProps {
  isVisible: boolean;
  predictionMessage: string;
  confidence: number;
  onClose?: () => void;
}

const AIPredictionPanel = ({ isVisible, predictionMessage, confidence, onClose }: AIPredictionPanelProps) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Delay content appearance for dramatic effect
      const timer = setTimeout(() => setShowContent(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card border border-border rounded-lg shadow-2xl max-w-md w-full animate-scale-in">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-sm tracking-wider text-foreground">
              AI PREDICTION ENGINE
            </h3>
            <p className="text-xs text-muted-foreground">Advanced threat analysis</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {showContent && (
            <>
              {/* Prediction Message */}
              <div className="space-y-2 animate-slide-up">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-warning" />
                  <span className="text-sm font-semibold text-foreground">Future Risk Assessment</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {predictionMessage}
                </p>
              </div>

              {/* Confidence Score */}
              <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Confidence Level</span>
                  <span className="text-sm font-mono font-bold text-primary">{confidence}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-warning to-danger transition-all duration-1000 ease-out rounded-full"
                    style={{ width: `${confidence}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>

              {/* Analysis Details */}
              <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Analysis Complete</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-secondary/50 rounded p-2">
                    <div className="font-semibold text-foreground">Pattern Recognition</div>
                    <div className="text-muted-foreground">✓ Threat signatures detected</div>
                  </div>
                  <div className="bg-secondary/50 rounded p-2">
                    <div className="font-semibold text-foreground">Risk Modeling</div>
                    <div className="text-muted-foreground">✓ Escalation probability calculated</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-primary-foreground rounded font-medium text-sm hover:bg-primary/90 transition-colors"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIPredictionPanel;