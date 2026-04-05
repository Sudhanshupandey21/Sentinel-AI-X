import { AlertTriangle, Bell, Shield, Lightbulb, Users, Lock, Zap } from "lucide-react";
import { AlertItem, SystemStatus } from "@/types/sentinel";

interface RightPanelProps {
  alerts: AlertItem[];
  status: SystemStatus;
  onSuggestionClick: (action: string) => void;
}

const suggestions = [
  { icon: Users, label: "Send Unit", desc: "Deploy response team to sector" },
  { icon: Lock, label: "Lock Gate", desc: "Secure perimeter access points" },
  { icon: Zap, label: "Activate Lights", desc: "Enable flood lights in zone" },
];

const severityStyle = {
  SAFE: "border-safe/20 text-safe",
  WARNING: "border-warning/20 text-warning",
  DANGER: "border-danger/20 text-danger",
};

const RightPanel = ({ alerts, status, onSuggestionClick }: RightPanelProps) => {
  return (
    <div className="h-full flex flex-col gap-3 p-3 overflow-hidden">
      {/* Alerts section */}
      <div className="flex items-center gap-2">
        <Bell className="w-3.5 h-3.5 text-muted-foreground" />
        <h2 className="text-xs font-display font-semibold tracking-[0.15em] text-muted-foreground">
          ALERT LOG
        </h2>
        {alerts.length > 0 && (
          <span className="ml-auto text-[10px] font-mono bg-danger/10 text-danger px-1.5 py-0.5 rounded">
            {alerts.length}
          </span>
        )}
      </div>

      {/* Alert list */}
      <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0 scrollbar-thin">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Shield className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-xs font-mono">No alerts</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`border rounded p-2 bg-card/50 animate-fade-in ${severityStyle[alert.severity]}`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                <span className="text-[10px] font-mono opacity-60">
                  {alert.timestamp.toLocaleTimeString("en-US", { hour12: false })}
                </span>
              </div>
              <p className="text-[11px] font-body text-foreground/80">{alert.message}</p>
            </div>
          ))
        )}
      </div>

      {/* AI Suggestions */}
      {status !== "SAFE" && (
        <div className="border-t border-border pt-3 space-y-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-3.5 h-3.5 text-warning" />
            <h3 className="text-xs font-display font-semibold tracking-[0.15em] text-muted-foreground">
              AI SUGGESTIONS
            </h3>
          </div>
          {suggestions.map((s) => (
            <button
              key={s.label}
              onClick={() => onSuggestionClick(s.label)}
              className="w-full flex items-center gap-3 p-2 rounded border border-border bg-secondary/30 hover:bg-primary/10 hover:border-primary/30 transition-all text-left group"
            >
              <s.icon className="w-4 h-4 text-primary group-hover:text-primary shrink-0" />
              <div>
                <p className="text-xs font-display font-semibold text-foreground tracking-wide">{s.label}</p>
                <p className="text-[10px] font-mono text-muted-foreground">{s.desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RightPanel;
