import { useState, useCallback, useRef } from "react";
import TopNavbar from "@/components/sentinel/TopNavbar";
import MapSection from "@/components/sentinel/MapSection";
import LeftPanel from "@/components/sentinel/LeftPanel";
import RightPanel from "@/components/sentinel/RightPanel";
import BottomControlBar from "@/components/sentinel/BottomControlBar";
import { SystemStatus, AlertItem, DetectionResult } from "@/types/sentinel";

const Index = () => {
  const [status, setStatus] = useState<SystemStatus>("SAFE");
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [threatDetected, setThreatDetected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const alertLock = useRef(false);

  const addAlert = useCallback((message: string, severity: SystemStatus) => {
    if (alertLock.current) return;
    alertLock.current = true;

    const alert: AlertItem = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      message,
      severity,
    };
    setAlerts((prev) => [alert, ...prev]);

    // Play alert sound for danger
    if (severity === "DANGER") {
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        osc.type = "square";
        gain.gain.value = 0.1;
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
        setTimeout(() => {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.frequency.value = 660;
          osc2.type = "square";
          gain2.gain.value = 0.1;
          osc2.start();
          osc2.stop(ctx.currentTime + 0.15);
        }, 200);
      } catch {}
    }

    setTimeout(() => {
      alertLock.current = false;
    }, 500);
  }, []);

  const handleDetection = useCallback(
    (result: DetectionResult) => {
      setStatus(result.threatLevel);
      setThreatDetected(true);
      addAlert(
        `${result.label} — Confidence: ${result.confidence}% — Threat Level: ${result.threatLevel}`,
        result.threatLevel
      );
    },
    [addAlert]
  );

  const handleSimulate = useCallback(() => {
    setIsProcessing(true);
    setStatus("WARNING");
    addAlert("Attack simulation initiated — scanning all sectors...", "WARNING");

    setTimeout(() => {
      setStatus("DANGER");
      setThreatDetected(true);
      addAlert("BREACH DETECTED in Sector 7G — Hostile units inbound", "DANGER");
      setIsProcessing(false);
    }, 2500);
  }, [addAlert]);

  const handlePredict = useCallback(() => {
    addAlert("AI Prediction: High probability of flanking maneuver from NW quadrant within 4 minutes", "WARNING");
  }, [addAlert]);

  const handleAutoResponse = useCallback(() => {
    addAlert("Auto Response engaged — Deploying countermeasures and alerting command", "SAFE");
    setTimeout(() => {
      setStatus("SAFE");
      setThreatDetected(false);
      addAlert("All threats neutralized. System returning to SAFE status.", "SAFE");
    }, 3000);
  }, [addAlert]);

  const handleSuggestion = useCallback(
    (action: string) => {
      addAlert(`AI Suggestion executed: ${action}`, status === "DANGER" ? "WARNING" : "SAFE");
    },
    [addAlert, status]
  );

  const borderClass =
    status === "DANGER"
      ? "border-2 animate-flash-border"
      : status === "WARNING"
      ? "border border-warning/30"
      : "border border-border";

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden bg-background transition-colors duration-500 ${borderClass}`}>
      <TopNavbar status={status} />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <aside className="w-72 border-r border-border bg-card/40 overflow-y-auto">
          <LeftPanel
            onDetection={handleDetection}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
          />
        </aside>

        {/* Center Map */}
        <main className="flex-1 p-3">
          <MapSection status={status} />
        </main>

        {/* Right Panel */}
        <aside className="w-72 border-l border-border bg-card/40 overflow-y-auto">
          <RightPanel alerts={alerts} status={status} onSuggestionClick={handleSuggestion} />
        </aside>
      </div>

      <BottomControlBar
        threatDetected={threatDetected}
        isProcessing={isProcessing}
        onSimulate={handleSimulate}
        onPredict={handlePredict}
        onAutoResponse={handleAutoResponse}
      />
    </div>
  );
};

export default Index;
