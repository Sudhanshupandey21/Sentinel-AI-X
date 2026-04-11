import { useState, useEffect, useRef } from "react";
import { Crosshair, Radar, Loader2, Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import { SystemStatus, ThreatAnalysis, RiskLevel } from "@/types/sentinel";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  CircleMarker,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const statusColor = {
  SAFE: "text-safe",
  WARNING: "text-warning",
  DANGER: "text-danger",
};

// Marker color mapping for risk levels
const riskColorMap = {
  Low: "#10b981", // green
  Medium: "#f59e0b", // yellow/amber
  High: "#ef4444", // red
};

// ✅ Fix marker issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// ✅ Map auto move component
function ChangeMapView({ position }) {
  const map = useMap();
  map.flyTo(position, 16);
  return null;
}
interface MapSectionProps {
  dangerZoneRadius: number;
  status: SystemStatus;
  apiRiskLevel?: "LOW" | "MEDIUM" | "HIGH";
  threatPosition?: { x: number; y: number };
}


const MapSection = ({ dangerZoneRadius = 0, status, apiRiskLevel = "LOW", threatPosition }: MapSectionProps) => {  const [position, setPosition] = useState<[number, number]>([22.7196, 75.8577]); // Indore
  const [mapType, setMapType] = useState("satellite");
  const [threatCenter, setThreatCenter] = useState<[number, number]>([22.7196, 75.8577]);
  const mapRef = useRef<L.Map | null>(null);
  const movementIntervalRef = useRef<number | null>(null);

  // Danger zone color based on API risk level
  const getDangerZoneColor = () => {
    switch (apiRiskLevel) {
      case "HIGH":
        return "#ef4444"; // red
      case "MEDIUM":
        return "#f59e0b"; // yellow/amber
      case "LOW":
        return "#10b981"; // green
      default:
        return "#10b981";
    }
  };

  // Waypoints for threat movement: A → B → C → D
  const waypoints: [number, number][] = [
    [22.7196, 75.8577], // A: Indore
    [22.7200, 75.8580], // B: Slightly north-east
    [22.7180, 75.8590], // C: South-east
    [22.7170, 75.8560], // D: South-west
  ];

  const moveThreatSmoothly = (target: [number, number]) => {
    if (movementIntervalRef.current) return; // Already moving

    const steps = 50; // 40-60 steps
    const intervalMs = 50; // 40-60ms
    const startPos = [...threatCenter] as [number, number];
    const deltaLat = (target[0] - startPos[0]) / steps;
    const deltaLng = (target[1] - startPos[1]) / steps;

    let step = 0;
    movementIntervalRef.current = window.setInterval(() => {
      step++;
      const newLat = startPos[0] + deltaLat * step;
      const newLng = startPos[1] + deltaLng * step;
      setThreatCenter([newLat, newLng]);

      if (step >= steps) {
        clearInterval(movementIntervalRef.current!);
        movementIntervalRef.current = null;
        setThreatCenter(target); // Ensure exact target position
      }
    }, intervalMs);
  };

  const simulateThreatMovement = () => {
    let phase = 0;
    const moveToNext = () => {
      if (phase < waypoints.length - 1) {
        phase++;
        moveThreatSmoothly(waypoints[phase]);
        // Schedule next movement after a delay
        setTimeout(moveToNext, 3000); // 3 seconds between phases
      }
    };
    // Start with first movement
    moveThreatSmoothly(waypoints[1]);
    setTimeout(moveToNext, 3000);
  };

  // Map auto follow
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo(threatCenter, 16);
    }
  }, [threatCenter]);

  // Start movement when HIGH risk is detected
  useEffect(() => {
    if (apiRiskLevel === "HIGH") {
      simulateThreatMovement();
    } else {
      if (movementIntervalRef.current) {
        clearInterval(movementIntervalRef.current);
        movementIntervalRef.current = null;
      }
    }
    return () => {
      if (movementIntervalRef.current) {
        clearInterval(movementIntervalRef.current);
      }
    };
  }, [apiRiskLevel]);

  // Analysis flow states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ThreatAnalysis | null>(null);

  // Simulate AI analysis
  const handleAnalyzeThreat = async () => {
    setIsAnalyzing(true);

    // Simulate 1.5-2s processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate random risk analysis
    const riskScores = [25, 55, 82];
    const riskScore = riskScores[Math.floor(Math.random() * riskScores.length)];
    const riskLevel: RiskLevel =
      riskScore < 40 ? "Low" : riskScore < 70 ? "Medium" : "High";
    const systemStatus: SystemStatus =
      riskLevel === "Low" ? "SAFE" : riskLevel === "Medium" ? "WARNING" : "DANGER";

    const recommendations =
      riskLevel === "Low"
        ? ["Continue monitoring", "Maintain alert status"]
        : riskLevel === "Medium"
          ? [
              "Deploy security units to sector",
              "Send alert to authority",
              "Monitor situation closely",
            ]
          : [
              "IMMEDIATE: Deploy all units",
              "Lockdown perimeter access",
              "Enable surveillance systems",
              "Contact emergency services",
            ];

    const analysisResult: ThreatAnalysis = {
      riskLevel,
      riskScore,
      location: position,
      recommendations,
      timestamp: new Date(),
    };

    setAnalysis(analysisResult);
    setIsAnalyzing(false);
  };

  const resetAnalysis = () => {
    setAnalysis(null);
    setStatus("SAFE");
  };

  const riskBgColor = {
    Low: "bg-safe/10",
    Medium: "bg-warning/10",
    High: "bg-danger/10",
  };

  const riskBorderColor = {
    Low: "border-safe/30",
    Medium: "border-warning/30",
    High: "border-danger/30",
  };

  const riskTextColor = {
    Low: "text-safe",
    Medium: "text-warning",
    High: "text-danger",
  };

  return (
    <div className="relative w-full h-full bg-secondary/30 rounded border border-border overflow-hidden">
      {/* 🗺️ MAP */}
      <MapContainer
        center={position}
        zoom={16}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        ref={mapRef}
      >
        <ChangeMapView position={position} />

        <TileLayer
          url={
            mapType === "satellite"
              ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          }
        />

        {/* Current position marker */}
        <Marker position={position}>
          {/* 🔴 Threat Movement Marker */}
{threatPosition && (
  <>
    <CircleMarker
      center={threatCenter}
      radius={10}
      pathOptions={{
        color: "#ff0000",
        fillColor: "#ff0000",
        fillOpacity: 0.9,
        weight: 2,
      }}
      className="glow-danger"
    >
      <Popup>🚨 Moving Threat</Popup>
    </CircleMarker>
    {/* 🔄 Rotating Scan Ring */}
    <Marker
      position={threatCenter}
      icon={L.divIcon({
        html: '<div class="radar-scan glow-danger threat-pulse" style="width: 50px; height: 50px; border: 1px dashed #ff0000; border-radius: 50%; position: absolute; top: -25px; left: -25px;"></div>',
        className: 'custom-div-icon',
        iconSize: [50, 50],
        iconAnchor: [25, 25],
      })}
    />
  </>
)}
          <Popup>📍 Analysis Location</Popup>
        </Marker>

        {/* Risk zone circle if analysis exists */}
        {analysis && (
          <CircleMarker
            center={analysis.location}
            radius={40}
            pathOptions={{
              color: riskColorMap[analysis.riskLevel],
              fillColor: riskColorMap[analysis.riskLevel],
              fillOpacity: 0.15,
              weight: 2,
            }}
          >
            <Popup>
              🎯 Risk Zone: {analysis.riskLevel} ({analysis.riskScore}%)
            </Popup>
          </CircleMarker>
        )}

        {/* Animated danger zone during simulation */}
        {dangerZoneRadius > 0 && (
          <CircleMarker
            center={position}
            radius={dangerZoneRadius}
            pathOptions={{
              color: getDangerZoneColor(),
              fillColor: getDangerZoneColor(),
              fillOpacity: Math.max(0.05, (120 - dangerZoneRadius) / 120),
              weight: 2,
              dashArray: "5, 5",
            }}
          >
            <Popup>💥 DANGER ZONE - EXPANDING</Popup>
          </CircleMarker>
        )}
      </MapContainer>

      {/* Risk-based Pulse Effect Overlay */}
      {dangerZoneRadius > 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 15 }}>
          {apiRiskLevel === "HIGH" && (
            <>
              {/* Primary pulsing circle */}
              <div className="absolute w-32 h-32 rounded-full border-2 border-danger/60 pulse-high-indicator" />
              {/* Secondary outer pulse */}
              <div className="absolute w-48 h-48 rounded-full border border-danger/30 pulse-high-indicator" style={{ animationDelay: '0.3s' }} />
              {/* Inner bright pulse */}
              <div className="absolute w-20 h-20 rounded-full bg-danger/20 pulse-high-indicator" />
            </>
          )}

          {apiRiskLevel === "MEDIUM" && (
            <>
              {/* Primary pulsing circle */}
              <div className="absolute w-32 h-32 rounded-full border-2 border-warning/50 pulse-medium-indicator" />
              {/* Secondary outer pulse */}
              <div className="absolute w-40 h-40 rounded-full border border-warning/30 pulse-medium-indicator" style={{ animationDelay: '0.3s' }} />
              {/* Inner soft pulse */}
              <div className="absolute w-20 h-20 rounded-full bg-warning/15 pulse-medium-indicator" />
            </>
          )}

          {apiRiskLevel === "LOW" && (
            <>
              {/* Static green circle with gentle glow */}
              <div className="absolute w-32 h-32 rounded-full border-2 border-safe/60 pulse-low-indicator" />
              {/* Outer static ring */}
              <div className="absolute w-40 h-40 rounded-full border border-safe/30 pulse-low-indicator" />
              {/* Inner gentle indicator */}
              <div className="absolute w-20 h-20 rounded-full bg-safe/15 pulse-low-indicator" />
            </>
          )}
        </div>
      )}

      {/* Overlay effects */}
      <div className={`absolute inset-0 scanline z-10 pointer-events-none ${
        status === 'DANGER' ? 'scanline-danger' : status === 'WARNING' ? 'scanline-warning' : 'scanline-safe'
      }`} />

      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
        <div className="relative">
          <Radar className={`w-24 h-24 ${statusColor[status]} opacity-20 animate-spin`} />
          <Crosshair className={`w-10 h-10 ${statusColor[status]} absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`} />
          {status === 'DANGER' && (
            <div className="absolute inset-0 rounded-full border-2 border-danger/40 shadow-lg shadow-danger/20"></div>
          )}
        </div>
      </div>

      {/* ⚙️ SIMPLIFIED CONTROL PANEL */}
      <div className="absolute top-2 left-2 z-30 flex flex-col gap-2 w-56">
        {/* Main Analyze Button */}
        {!analysis ? (
          <button
            onClick={handleAnalyzeThreat}
            disabled={isAnalyzing}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-semibold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing threat using AI...
              </>
            ) : (
              "🔍 Analyze Threat"
            )}
          </button>
        ) : (
          <button
            onClick={resetAnalysis}
            className="bg-secondary/50 hover:bg-secondary text-foreground px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2"
          >
            ↻ New Analysis
          </button>
        )}

        {/* Quick info during analysis */}
        {isAnalyzing && (
          <div className="bg-black/70 border border-primary/30 rounded-lg p-3 text-xs text-foreground/80 animate-fade-in">
            <p className="font-mono">🛰️ Scanning threat signatures...</p>
            <p className="font-mono">🤖 Processing with AI models...</p>
            <p className="font-mono">📊 Analyzing risk patterns...</p>
          </div>
        )}
      </div>

      {/* 📊 RESULT PANEL - Top Right */}
      {analysis && (
        <div className="absolute top-2 right-2 z-30 w-80 bg-black/85 border border-primary/30 rounded-lg p-4 shadow-2xl animate-fade-in backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold text-sm tracking-wider">
              THREAT ANALYSIS
            </h3>
          </div>

          {/* Risk Score & Badge */}
          <div className="mb-4 p-3 rounded-lg bg-secondary/30 border border-border">
            <div className="flex items-end justify-between mb-2">
              <span className="text-xs text-muted-foreground font-mono">RISK LEVEL</span>
              <div
                className={`px-2.5 py-1 rounded text-xs font-bold ${
                  analysis.riskLevel === "Low"
                    ? "bg-safe/20 text-safe"
                    : analysis.riskLevel === "Medium"
                      ? "bg-warning/20 text-warning"
                      : "bg-danger/20 text-danger"
                }`}
              >
                {analysis.riskLevel.toUpperCase()}
              </div>
            </div>

            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden mb-2">
              <div
                className={`h-full transition-all duration-500 ${
                  analysis.riskLevel === "Low"
                    ? "bg-safe"
                    : analysis.riskLevel === "Medium"
                      ? "bg-warning"
                      : "bg-danger"
                }`}
                style={{ width: `${analysis.riskScore}%` }}
              />
            </div>

            <p className="text-right text-lg font-bold">
              <span className={riskTextColor[analysis.riskLevel]}>
                {analysis.riskScore}%
              </span>
            </p>
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="text-xs font-display font-semibold mb-2 tracking-wider text-muted-foreground">
              RECOMMENDATIONS
            </h4>
            <ul className="space-y-1.5">
              {analysis.recommendations.map((rec, idx) => (
                <li key={idx} className="flex gap-2 text-xs">
                  <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${riskTextColor[analysis.riskLevel]}`} />
                  <span className="text-foreground/80">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Location Info */}
          <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground font-mono">
            <p>
              📍 LAT {analysis.location[0].toFixed(4)} LON{" "}
              {analysis.location[1].toFixed(4)}
            </p>
          </div>
        </div>
      )}

      {/* Coordinates display */}
      <div className="absolute bottom-3 right-3 z-20 text-[10px] text-muted-foreground font-mono">
        LAT {position[0].toFixed(4)} — LON {position[1].toFixed(4)}
      </div>
    </div>
  );
};

export default MapSection;