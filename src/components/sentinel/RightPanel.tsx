import { AlertTriangle, Bell, Shield, Lightbulb, Zap, Activity } from "lucide-react";
import { AlertItem, SystemStatus } from "@/types/sentinel";
import { useState } from "react";

interface RightPanelProps {
  alerts: AlertItem[];
  status: SystemStatus;
  isProcessing: boolean;
  processingMessage: string;
  onSuggestionClick: (action: string) => void;
  suggestions: { icon: React.FC; label: string; desc: string }[];
  showCriticalIndicator?: boolean;
}

// Helper
const getRelativeTime = (timestamp: Date): string => {
  const now = new Date();
  const diff = Math.floor((now.getTime() - timestamp.getTime()) / 1000);

  if (diff < 60) return `${diff}s ago`;
  return `${Math.floor(diff / 60)}m ago`;
};

// Severity styles
const severityStyle = {
  SAFE: "border-green-500/30 bg-green-500/10 text-green-400",
  WARNING: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  DANGER: "border-red-500/40 bg-red-500/8 text-red-400",
};

const panelGlow = {
  SAFE: "",
  WARNING: "",
  DANGER: "",
};

const RightPanel = ({
  alerts,
  status,
  isProcessing,
  processingMessage,
  onSuggestionClick,
  suggestions,
  showCriticalIndicator = false,
}: RightPanelProps) => {

  return (
    <div className={`flex flex-col gap-4 p-4 bg-card/60 border-r ${panelGlow[status]}`}>

      {/* CRITICAL */}
      {showCriticalIndicator && (
        <div className="border border-red-500/60 bg-red-500/8 p-3 rounded-lg shadow-lg shadow-red-500/20">
          <p className="text-red-400 font-bold text-sm">CRITICAL SITUATION</p>
          <p className="text-xs text-red-300">Immediate escalation required</p>
        </div>
      )}

      {/* PROCESSING */}
      {isProcessing && (
        <div className="border border-blue-500 bg-blue-500/10 p-3 rounded-lg">
          <p className="text-blue-400 text-sm">{processingMessage}</p>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <Bell className="w-4 h-4" />
          <h2 className="text-sm font-bold">ALERT LOG</h2>
        </div>

        {alerts.length > 0 && (
          <span className="text-xs">{alerts.length}/5</span>
        )}
      </div>

      {/* ALERT LIST */}
      <div className="space-y-2">

        {alerts.length === 0 ? (
          <p className="text-sm text-gray-400">No alerts yet</p>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border ${severityStyle[alert.severity]}`}
            >
              <div className="flex justify-between text-xs mb-1">
                <span>{getRelativeTime(alert.timestamp)}</span>
                {alert.severity === "DANGER" && (
                  <Zap className="w-3 h-3 text-red-400" />
                )}
              </div>

              <p className="text-sm">{alert.message}</p>
            </div>
          ))
        )}
      </div>

      {/* AI RECOMMENDATIONS */}
      {status !== "SAFE" && suggestions.length > 0 && (
        <div className="border-t border-border pt-4 mt-4">
          <div className="flex gap-2 items-center mb-3">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold">AI RECOMMENDATIONS</h3>
          </div>
          
          <div className="overflow-y-auto pr-2 space-y-2">
            {suggestions.map((s) => {
              const IconComponent = s.icon;
              return (
                <button
                  key={s.label}
                  onClick={() => onSuggestionClick(s.label)}
                  className="w-full text-left p-3 border border-border rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors duration-200 group"
                >
                  <div className="flex gap-2">
                    <IconComponent className="w-4 h-4 text-primary flex-shrink-0 mt-0.5 group-hover:text-blue-400 transition-colors" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground group-hover:text-white transition-colors">{s.label}</p>
                      <p className="text-xs text-gray-400 leading-relaxed break-words mt-1">{s.desc}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RightPanel;