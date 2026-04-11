import { Shield, Wifi, Activity, Clock, AlertTriangle, CheckCircle, Zap, Brain } from "lucide-react";
import { SystemStatus } from "@/types/sentinel";

interface TopNavbarProps {
  status: SystemStatus;
  isAIDriven?: boolean;
  isUsingAI?: boolean;
}

const statusConfig = {
  SAFE: {
    label: "SYSTEM SECURE",
    className: "bg-gradient-to-r from-safe/20 to-safe/10 border-safe/40 text-safe shadow-safe-glow",
    dotClass: "bg-safe shadow-safe-pulse",
    icon: CheckCircle,
    bgGlow: "shadow-safe-glow",
  },
  WARNING: {
    label: "WARNING ACTIVE",
    className: "bg-gradient-to-r from-warning/15 to-warning/8 border-warning/40 text-warning shadow-warning-glow",
    dotClass: "bg-warning shadow-warning-pulse",
    icon: AlertTriangle,
    bgGlow: "shadow-warning-glow",
  },
  DANGER: {
    label: "THREAT DETECTED",
    className: "bg-gradient-to-r from-danger/15 to-danger/8 border-danger/50 text-danger shadow-danger-glow",
    dotClass: "bg-danger shadow-danger-pulse",
    icon: AlertTriangle,
    bgGlow: "shadow-danger-glow",
  },
};

const TopNavbar = ({ status, isAIDriven = false, isUsingAI = false }: TopNavbarProps) => {
  const config = statusConfig[status];
  const StatusIcon = config.icon;
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", { hour12: false });

  return (
    <header className={`h-16 border-b border-border/50 bg-card/95 backdrop-blur-md flex items-center justify-between px-6 z-50 relative ${config.bgGlow} transition-all duration-500`}>
      {/* Left: Logo */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Shield className={`w-8 h-8 text-primary transition-all duration-300`} />
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary shadow-primary-glow" />
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary opacity-60" />
        </div>
        <div>
          <h1 className="text-lg font-display font-bold tracking-[0.25em] text-foreground leading-none">
            SENTINEL AI-X
          </h1>
          <p className="text-[10px] font-mono text-muted-foreground tracking-[0.2em] uppercase">
            Advanced Defense Operations
          </p>
        </div>
      </div>

      {/* Center: Global Status Display */}
      <div className={`flex items-center gap-3 px-6 py-2.5 rounded-lg border-2 backdrop-blur-sm transition-all duration-500 ${config.className}`}>
        <div className="relative">
          <StatusIcon className={`w-5 h-5`} />
          <div className={`absolute inset-0 rounded-full ${config.dotClass} opacity-40`} />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-display font-bold tracking-[0.15em] leading-none">
            {config.label}
          </span>
          <span className="text-[10px] font-mono opacity-80 tracking-wider">
            STATUS: {status}
          </span>
        </div>
        <div className={`w-3 h-3 rounded-full ${config.dotClass}`} />
      </div>

      {/* Right: System Metrics */}
      <div className="flex items-center gap-6 text-xs font-mono">
        {isAIDriven && (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded border backdrop-blur-sm transition-all ${
            isUsingAI 
              ? 'border-safe/50 bg-safe/5 text-safe' 
              : 'border-warning/50 bg-warning/5 text-warning'
          }`}>
            <Brain className="w-3.5 h-3.5" />
            <span className="tracking-wider font-bold">
              {isUsingAI ? 'AI ACTIVE' : 'FALLBACK MODE'}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-border/50 bg-card/50 backdrop-blur-sm">
          <Wifi className={`w-3.5 h-3.5 ${status === 'SAFE' ? 'text-safe' : status === 'WARNING' ? 'text-warning' : 'text-danger'}`} />
          <span className="tracking-wider">SECURE</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-border/50 bg-card/50 backdrop-blur-sm">
          <Activity className={`w-3.5 h-3.5 ${status === 'SAFE' ? 'text-safe' : status === 'WARNING' ? 'text-warning' : 'text-danger'}`} />
          <span className="tracking-wider">98.7%</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-border/50 bg-card/50 backdrop-blur-sm">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="tracking-wider font-bold">{timeStr}</span>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
