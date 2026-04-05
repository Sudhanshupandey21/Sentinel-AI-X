import { Crosshair, Radar } from "lucide-react";
import { SystemStatus } from "@/types/sentinel";

interface MapSectionProps {
  status: SystemStatus;
}

const statusColor = {
  SAFE: "text-safe",
  WARNING: "text-warning",
  DANGER: "text-danger",
};

const MapSection = ({ status }: MapSectionProps) => {
  return (
    <div className="relative w-full h-full bg-secondary/30 rounded border border-border overflow-hidden">
      {/* Scanline overlay */}
      <div className="absolute inset-0 scanline z-10" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Center crosshair */}
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <div className="relative">
          <Radar className={`w-24 h-24 ${statusColor[status]} opacity-20 animate-spin`} style={{ animationDuration: "8s" }} />
          <Crosshair className={`w-10 h-10 ${statusColor[status]} absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`} />
        </div>
      </div>

      {/* Corner markers */}
      {["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"].map((pos) => (
        <div key={pos} className={`absolute ${pos} w-4 h-4 border-primary/40 z-20 ${
          pos.includes("top") && pos.includes("left") ? "border-t border-l" :
          pos.includes("top") && pos.includes("right") ? "border-t border-r" :
          pos.includes("bottom") && pos.includes("left") ? "border-b border-l" :
          "border-b border-r"
        }`} />
      ))}

      {/* Map label */}
      <div className="absolute top-3 left-8 z-20 font-mono text-[10px] text-muted-foreground tracking-widest">
        TACTICAL MAP — SECTOR 7G
      </div>

      {/* Threat markers when in danger */}
      {status === "DANGER" && (
        <>
          <div className="absolute top-1/3 left-1/4 z-20 w-3 h-3 rounded-full bg-danger animate-pulse-glow" />
          <div className="absolute top-2/3 right-1/3 z-20 w-2 h-2 rounded-full bg-warning animate-pulse-glow" />
        </>
      )}

      {/* Coordinates */}
      <div className="absolute bottom-3 right-3 z-20 font-mono text-[10px] text-muted-foreground">
        LAT 34.0522° N — LON 118.2437° W
      </div>
    </div>
  );
};

export default MapSection;
