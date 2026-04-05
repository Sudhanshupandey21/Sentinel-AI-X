import { Shield, Wifi, Activity, Clock } from "lucide-react";
import { SystemStatus } from "@/types/sentinel";

interface TopNavbarProps {
  status: SystemStatus;
}

const statusConfig = {
  SAFE: {
    label: "SYSTEM SAFE",
    className: "bg-safe/10 text-safe border-safe/30 glow-safe",
    dotClass: "bg-safe",
  },
  WARNING: {
    label: "WARNING",
    className: "bg-warning/10 text-warning border-warning/30 glow-warning",
    dotClass: "bg-warning",
  },
  DANGER: {
    label: "DANGER",
    className: "bg-danger/10 text-danger border-danger/30 glow-danger animate-pulse-glow",
    dotClass: "bg-danger animate-pulse-glow",
  },
};

const TopNavbar = ({ status }: TopNavbarProps) => {
  const config = statusConfig[status];
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", { hour12: false });

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 z-50 relative">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Shield className="w-7 h-7 text-primary" />
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
        </div>
        <div>
          <h1 className="text-sm font-display font-bold tracking-[0.2em] text-foreground leading-none">
            SENTINEL AI-X
          </h1>
          <p className="text-[10px] font-mono text-muted-foreground tracking-widest">
            DEFENSE OPERATIONS SYSTEM
          </p>
        </div>
      </div>

      {/* Center: Status */}
      <div className={`flex items-center gap-2 px-4 py-1.5 rounded border text-xs font-display font-semibold tracking-wider ${config.className}`}>
        <span className={`w-2 h-2 rounded-full ${config.dotClass}`} />
        {config.label}
      </div>

      {/* Right: System info */}
      <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Wifi className="w-3.5 h-3.5 text-safe" />
          <span>CONNECTED</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-primary" />
          <span>98.7%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>{timeStr}</span>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
