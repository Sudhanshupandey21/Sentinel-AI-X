import { useState, useCallback, useRef, useEffect, type FC } from "react";
import { Users, Lock, Zap, Bell, Shield, Search, Network, Cpu, Eye, Clock, AlertTriangle, ShieldCheck } from "lucide-react";
import TopNavbar from "@/components/sentinel/TopNavbar";
import MapSection from "@/components/sentinel/MapSection";
import LeftPanel from "@/components/sentinel/LeftPanel";
import RightPanel from "@/components/sentinel/RightPanel";
import BottomControlBar from "@/components/sentinel/BottomControlBar";
import AIPredictionPanel from "@/components/sentinel/AIPredictionPanel";
import AIThinkingEffect from "@/components/sentinel/AIThinkingEffect";
import { SystemStatus, AlertItem } from "@/types/sentinel";

type Suggestion = {
  icon: FC;
  label: string;
  desc: string;
};

const AI_PROCESSING_MESSAGES = [
  "🔍 Scanning patterns...",
  "🧠 Analyzing anomalies...",
  "⚡ Correlating data points...",
  "🔮 Predicting threat evolution...",
];

const ALERT_MESSAGES = [
  "🚨 Unusual movement detected near perimeter",
  "🔥 Thermal anomaly detected",
  "🚁 Drone interference detected",
  "🚫 Unauthorized access attempt",
  "⚠️ Suspicious activity in Sector 7G",
  "🛡️ Firewall anomaly detected",
  "📡 Encrypted communication intercepted",
  "⚡ System integrity check failed",
  "🔍 Pattern matching high-risk signature",
  "📍 Location tracking shows suspicious movement"
];

const HIGH_RISK_ALERTS = [
  "🔴 CRITICAL: Threat escalation detected — immediate response required",
  "💥 IMMINENT THREAT: Multiple attack vectors identified",
  "⚠️ EMERGENCY: System under active threat — deploying countermeasures",
  "🚨 CRITICAL ALERT: Perimeter breach confirmed — all units activate",
  "⛔ THREAT LEVEL MAXIMUM: Lockdown initiated — no entry/exit",
  "🔥 CRITICAL: Compromised asset detected — isolating systems",
  "💀 EXTREME THREAT: Coordinated multi-vector attack in progress"
];

const MEDIUM_RISK_ALERTS = [
  "⚠️ Risk escalation detected — preparing response protocols",
  "🔶 ALERT: Suspicious pattern identified — increase monitoring",
  "📢 WARNING: Potential threat emerging — stand by for update",
  "🛡️ CAUTION: Defense systems activated — monitoring situation",
  "📡 ALERT: Anomalous activity detected — investigating"
];

const LOW_RISK_ALERTS = [
  "✓ Routine monitoring active — system nominal",
  "📍 Activity logged — continuing standard surveillance",
  "✓ Area secure — maintaining baseline alert status"
];

const LOW_RISK_RECOMMENDATIONS = [
  { icon: Eye, label: "Routine monitoring", desc: "Continue standard surveillance protocols" },
  { icon: Clock, label: "No immediate action required", desc: "System operating within normal parameters" },
  { icon: Search, label: "Conduct routine system check", desc: "Perform scheduled maintenance verification" }
];

const MEDIUM_RISK_RECOMMENDATIONS = [
  { icon: Users, label: "Increase surveillance", desc: "Deploy additional monitoring resources" },
  { icon: Shield, label: "Prepare response team", desc: "Mobilize security personnel for potential escalation" },
  { icon: Network, label: "Monitor network traffic", desc: "Increase scrutiny of system communications" }
];

const HIGH_RISK_RECOMMENDATIONS = [
  { icon: AlertTriangle, label: "Deploy emergency units", desc: "Activate rapid response teams immediately" },
  { icon: Lock, label: "Lockdown area", desc: "Secure perimeter and restrict access" },
  { icon: Bell, label: "Alert authorities", desc: "Notify command center and external agencies" }
];

const PREDICTION_MESSAGES = [
  "High probability of flanking maneuver from NW quadrant within 4 minutes",
  "Potential cyber intrusion detected — escalate to Level 2 response",
  "Anomaly suggests coordinated attack pattern emerging",
  "Risk of data exfiltration increasing — recommend isolation",
  "Threat evolution indicates possible insider involvement",
  "Pattern analysis shows 85% chance of secondary attack vector",
  "AI detects deception tactics — maintain heightened vigilance",
  "Correlated events suggest organized threat actor presence",
];

const Index = () => {
  const [status, setStatus] = useState<SystemStatus>("SAFE");
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionConfidence, setPredictionConfidence] = useState<number | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [riskPercentage, setRiskPercentage] = useState(0);
  const [dangerZoneRadius, setDangerZoneRadius] = useState(0);
  const [apiRiskLevel, setApiRiskLevel] = useState<"LOW" | "MEDIUM" | "HIGH">("LOW");
  const [urgency, setUrgency] = useState<"NORMAL" | "ALERT" | "CRITICAL" | null>(null);
  const [situation, setSituation] = useState("");
  const [analysisSource, setAnalysisSource] = useState<"api" | "fallback" | null>(null);
  const [isUsingAI, setIsUsingAI] = useState(false);
  const [prediction, setPrediction] = useState("");
  const [actions, setActions] = useState<string[]>([]);
  const [showCriticalIndicator, setShowCriticalIndicator] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isPredictionPanelVisible, setIsPredictionPanelVisible] = useState(false);
  const [isThinkingEffectVisible, setIsThinkingEffectVisible] = useState(false);
  const [highAlertActive, setHighAlertActive] = useState(false);
  const alertLock = useRef(false);
  const nearbyResponseRef = useRef(false);
  const sirenLoopRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timeoutsRef = useRef<number[]>([]);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const predictionStatusRef = useRef<SystemStatus>("SAFE");
  const [threatPosition, setThreatPosition] = useState({ x: 120, y: 120 });

  // Animate threat position when in danger
  useEffect(() => {
    if (status !== "DANGER") return;

    const interval = setInterval(() => {
      setThreatPosition(prev => ({
        x: prev.x + (Math.random() - 0.5) * 10, // Small random movement
        y: prev.y + (Math.random() - 0.5) * 10,
      }));
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [status]);

  const addAlert = useCallback((message: string, severity: SystemStatus) => {
    if (alertLock.current) return;
    alertLock.current = true;

    const alert: AlertItem = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      message,
      severity,
    };
    setAlerts((prev) => [alert, ...prev.slice(0, 4)]); // Keep only latest 5 alerts

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
      } catch {
        // Ignore audio context errors
      }
    }

    setTimeout(() => {
      alertLock.current = false;
    }, 100);
  }, []);

  const clearPendingTimers = useCallback(() => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
    nearbyResponseRef.current = false;
    sirenLoopRef.current = false;
  }, []);

  const scheduleNearbyUnitResponse = useCallback(() => {
    if (nearbyResponseRef.current) return;
    nearbyResponseRef.current = true;

    const immediate = window.setTimeout(() => {
      addAlert("📡 Alert sent to nearby units", "WARNING");
    }, 0);

    const acknowledge = window.setTimeout(() => {
      addAlert("🚓 Nearby units acknowledged — moving to location", "WARNING");
    }, 1000);

    const sharedData = window.setTimeout(() => {
      addAlert("📍 Threat movement data shared with response units", "WARNING");
    }, 2000);

    const resetFlag = window.setTimeout(() => {
      nearbyResponseRef.current = false;
    }, 2200);

    timeoutsRef.current.push(immediate, acknowledge, sharedData, resetFlag);
  }, [addAlert]);

  const calculateRisk = useCallback((alerts: AlertItem[]) => {
    // Base risk between 30-80
    let risk = Math.floor(Math.random() * (80 - 30 + 1)) + 30;

    // Increase risk if suspicious activity detected
    const hasSuspiciousActivity = alerts.some(
      (alert) => alert.severity === "DANGER" || alert.message.toLowerCase().includes("suspicious")
    );
    if (hasSuspiciousActivity) {
      risk += Math.floor(Math.random() * 15) + 5; // +5-20
    }

    // Increase risk if multiple alerts exist
    if (alerts.length > 2) {
      risk += Math.floor(Math.random() * 10) + 5; // +5-15
    }

    // Cap risk at 95
    risk = Math.min(risk, 95);

    // Determine risk level
    let riskLabel: "LOW" | "MEDIUM" | "HIGH";
    if (risk < 50) {
      riskLabel = "LOW";
    } else if (risk <= 75) {
      riskLabel = "MEDIUM";
    } else {
      riskLabel = "HIGH";
    }

    return { risk, riskLabel };
  }, []);

  const pickSuggestionsByRisk = useCallback((risk: number) => {
    let recommendations: typeof LOW_RISK_RECOMMENDATIONS;

    if (risk < 50) {
      recommendations = LOW_RISK_RECOMMENDATIONS;
    } else if (risk < 75) {
      recommendations = MEDIUM_RISK_RECOMMENDATIONS;
    } else {
      recommendations = HIGH_RISK_RECOMMENDATIONS;
    }

    // Return 2-3 random recommendations
    const shuffled = [...recommendations].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.floor(Math.random() * 2) + 2); // Randomly return 2 or 3
  }, []);

const stopSirenPlayback = useCallback(() => {
  if (activeAudioRef.current) {
    activeAudioRef.current.pause();
    activeAudioRef.current.currentTime = 0;
    activeAudioRef.current = null;
  }

  if (audioContextRef.current) {
    try {
      audioContextRef.current.close();
    } catch {
      // ignore if already closed
    }
    audioContextRef.current = null;
  }

  sirenLoopRef.current = false;
}, []);

const playSirenSound = useCallback(() => {
  stopSirenPlayback();

  const repeatCount = 4;
  const delayMs = 2000;
  let playIndex = 0;

  const playSingleSiren = () => {
    try {
      const ctx = new AudioContext();
      audioContextRef.current = ctx;

      //  WARNING BEEP (layered pulse sequence)
      for (let i = 0; i < 3; i++) {
        const warningTimer = window.setTimeout(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = "square";
          osc.frequency.value = 700;
          gain.gain.value = 0.18;
          osc.start();
          osc.stop(ctx.currentTime + 0.2);
        }, i * 200);
        timeoutsRef.current.push(warningTimer);
      }

      const audio = new Audio("/sounds/alert.mp3");
      audio.volume = 0.9;
      activeAudioRef.current = audio;
      audio.play().catch(() => {
        // swallow promise rejection if audio playback is blocked
      });

      // 📳 Mobile vibration support
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 300]);
      }
    } catch (e) {
      console.error("Siren failed", e);
    }
  };

  sirenLoopRef.current = true;
  playSingleSiren();

  for (let loop = 1; loop < repeatCount; loop++) {
    const loopTimer = window.setTimeout(() => {
      if (!sirenLoopRef.current) return;
      stopSirenPlayback();
      playSingleSiren();
    }, loop * delayMs);
    timeoutsRef.current.push(loopTimer);
  }

  const stopLoopTimer = window.setTimeout(() => {
    stopSirenPlayback();
  }, repeatCount * delayMs + 1000);
  timeoutsRef.current.push(stopLoopTimer);
}, [stopSirenPlayback]);
const simulateThreatMovement = useCallback(() => {
  // A → B
  const t1 = window.setTimeout(() => {
    setThreatPosition({ x: 200, y: 150 });
    addAlert("➡️ Threat moving towards Sector B", "WARNING");
  }, 1000);

  // B → C
  const t2 = window.setTimeout(() => {
    setThreatPosition({ x: 300, y: 250 });
    addAlert("📍 Threat reached Sector B", "DANGER");
  }, 2000);

  // C → Final
  const t3 = window.setTimeout(() => {
    setThreatPosition({ x: 400, y: 300 });
    addAlert("🚨 High probability threat at Sector C", "DANGER");
  }, 3000);

  timeoutsRef.current.push(t1, t2, t3);
}, [addAlert]);
  const applyAnalysis = useCallback((result: { situation: string; risk: "LOW" | "MEDIUM" | "HIGH"; urgency: "NORMAL" | "ALERT" | "CRITICAL"; alertMessage: string; prediction: string; actions: string[]; source: 'api' | 'fallback' }) => {
    setSituation(result.situation);
    setApiRiskLevel(result.risk);
    setUrgency(result.urgency);
    setAnalysisSource(result.source);
    setIsUsingAI(result.source === 'api');
    setPrediction(result.prediction);
    setActions(result.actions);

    const overrideRisk = result.risk === "HIGH" ? 90 : result.risk === "MEDIUM" ? 65 : 35;
    setRiskPercentage(overrideRisk);
    setDangerZoneRadius(result.risk === "HIGH" ? 100 : result.risk === "MEDIUM" ? 70 : 35);
    setStatus(result.risk === "HIGH" ? "DANGER" : result.risk === "MEDIUM" ? "WARNING" : "SAFE");
    setSuggestions(pickSuggestionsByRisk(overrideRisk));

    // Add control room alert with urgency-based styling
    addAlert(result.alertMessage, result.risk === "HIGH" ? "DANGER" : result.risk === "MEDIUM" ? "WARNING" : "SAFE");

   if (result.risk === "HIGH") {
    scheduleNearbyUnitResponse();
    simulateThreatMovement(); // 🔥 ADDED
   }

    // Trigger siren for CRITICAL urgency
    if (result.urgency === "CRITICAL") {
      playSirenSound();
      setShowCriticalIndicator(true);
    }
  }, [addAlert, pickSuggestionsByRisk, playSirenSound, scheduleNearbyUnitResponse]);

  useEffect(() => {
    return () => {
      stopSirenPlayback();
      clearPendingTimers();
    };
  }, [clearPendingTimers, stopSirenPlayback]);

  const handleAIAnalysis = useCallback((result: { situation: string; risk: "LOW" | "MEDIUM" | "HIGH"; urgency: "NORMAL" | "ALERT" | "CRITICAL"; alertMessage: string; prediction: string; actions: string[]; source: 'api' | 'fallback' }) => {
    applyAnalysis(result);
  }, [applyAnalysis]);

  const handleSimulate = useCallback(() => {
    setIsProcessing(true);
    setIsSimulating(true);
    const startRisk = apiRiskLevel === "HIGH" ? 70 : apiRiskLevel === "MEDIUM" ? 55 : 45;
    const startRadius = apiRiskLevel === "HIGH" ? 40 : apiRiskLevel === "MEDIUM" ? 25 : 15;
    setRiskPercentage(startRisk);
    setDangerZoneRadius(startRadius);
    setIsPredictionPanelVisible(false); // Hide prediction panel during simulation
    setIsThinkingEffectVisible(false); // Hide thinking effect during simulation
    setStatus(apiRiskLevel === "HIGH" ? "DANGER" : apiRiskLevel === "MEDIUM" ? "WARNING" : "SAFE");
    setSuggestions(pickSuggestionsByRisk(startRisk)); // Initial suggestions
    addAlert(`🚨 SIMULATION MODE ACTIVATED — AI risk level: ${apiRiskLevel}`, apiRiskLevel === "HIGH" ? "DANGER" : apiRiskLevel === "MEDIUM" ? "WARNING" : "SAFE");
    addAlert("⚡ Threat modeling in progress — monitoring system responses...", apiRiskLevel === "HIGH" ? "DANGER" : "WARNING");
  }, [addAlert, pickSuggestionsByRisk, apiRiskLevel]);

  const handlePredict = useCallback(() => {
    addAlert("AI Prediction: High probability of flanking maneuver from NW quadrant within 4 minutes", "WARNING");
  }, [addAlert]);

  const handleAutoResponse = useCallback(() => {
    addAlert("Auto Response engaged — Deploying countermeasures and alerting command", "SAFE");
    setTimeout(() => {
      setStatus("SAFE");
      setAnalysisComplete(false);
      addAlert("All threats neutralized. System returning to SAFE status.", "SAFE");
    }, 3000);
  }, [addAlert]);

  const handleSuggestion = useCallback(
    (action: string) => {
      addAlert(`AI Suggestion executed: ${action}`, status === "DANGER" ? "WARNING" : "SAFE");
    },
    [addAlert, status]
  );

  // Auto-trigger AI prediction after threat detection
  useEffect(() => {
    if (!isPredicting) return;

    const predictionTimer = setTimeout(() => {
      const confidence = Math.floor(Math.random() * (95 - 70 + 1)) + 70; // Random between 70-95
      setPredictionConfidence(confidence);

      // Randomize prediction message
      const randomPrediction = PREDICTION_MESSAGES[Math.floor(Math.random() * PREDICTION_MESSAGES.length)];
      addAlert(`🔮 AI Prediction: ${randomPrediction} — Confidence: ${confidence}%`, status);

      setIsPredicting(false);
    }, 2000);

    return () => clearTimeout(predictionTimer);
  }, [isPredicting, addAlert, status]);

  // Cycle through AI processing messages during analysis
  useEffect(() => {
    if (!isProcessing) {
      setProcessingMessage("");
      return;
    }

    let messageIndex = 0;
    setProcessingMessage(AI_PROCESSING_MESSAGES[0]);

    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % AI_PROCESSING_MESSAGES.length;
      setProcessingMessage(AI_PROCESSING_MESSAGES[messageIndex]);
    }, 1200); // Change message every 1.2 seconds

    return () => clearInterval(messageInterval);
  }, [isProcessing]);

  // Simulate outcome with animated danger zone and progressive risk
  useEffect(() => {
    if (!isSimulating) return;

    let suggestionUpdateCounter = 0;
    const zoneGrowth = apiRiskLevel === "HIGH" ? 10 : apiRiskLevel === "MEDIUM" ? 6 : 4;
    const alertSeverity = apiRiskLevel === "HIGH" ? "DANGER" : apiRiskLevel === "MEDIUM" ? "WARNING" : "SAFE";

    // Alert frequency in milliseconds based on risk level
    const alertIntervalMs = apiRiskLevel === "HIGH" ? 2000 : apiRiskLevel === "MEDIUM" ? 4000 : 6000;

    // Separate alert interval for time-based pushing
    const alertInterval = setInterval(() => {
      const alertArray = apiRiskLevel === "HIGH" ? HIGH_RISK_ALERTS : apiRiskLevel === "MEDIUM" ? MEDIUM_RISK_ALERTS : LOW_RISK_ALERTS;
      const randomAlert = alertArray[Math.floor(Math.random() * alertArray.length)];
      addAlert(randomAlert, alertSeverity);
    }, alertIntervalMs);

    const simulationInterval = setInterval(() => {
      setRiskPercentage((prev) => {
        const newRisk = prev + (apiRiskLevel === "HIGH" ? 3 : apiRiskLevel === "MEDIUM" ? 2 : 1);

        // Update suggestions based on risk level
        suggestionUpdateCounter++;
        if (suggestionUpdateCounter % 5 === 0) {
          setSuggestions(pickSuggestionsByRisk(newRisk));
        }

        // 60-70%: Initial escalation
        if (prev < 70 && newRisk >= 70) {
          addAlert("⚠️ Risk escalation detected — countermeasures recommended", alertSeverity);
          setSuggestions(pickSuggestionsByRisk(70));
        }
        // 70-80%: Critical threshold
        if (prev < 80 && newRisk >= 80) {
          addAlert("🔴 CRITICAL: Danger zone expanding — evacuate non-essential personnel", alertSeverity);
          setStatus("DANGER");
          setDangerZoneRadius((r) => Math.min(r + 30, 100));
          setSuggestions(pickSuggestionsByRisk(80));
        }
        // 80-90%: Maximum danger
        if (prev < 90 && newRisk >= 90) {
          addAlert(
            "💥 IMMINENT THREAT: All defensive systems engaged — Sector 7G compromised at 90% risk",
            "DANGER"
          );
          setDangerZoneRadius((r) => Math.min(r + 50, 120));
          setSuggestions(pickSuggestionsByRisk(90));
        }

        // Expand danger zone gradually with risk-based animation
        setDangerZoneRadius((r) => Math.min(r + zoneGrowth, 120));

        return newRisk >= 95 ? 95 : newRisk;
      });
    }, 400);

    // End simulation at 95% risk
    const endTimer = setTimeout(() => {
      clearInterval(simulationInterval);
      clearInterval(alertInterval);
      setIsSimulating(false);
      setIsProcessing(false);
      setAnalysisComplete(true);
      addAlert("🎬 Simulation complete — Threat level: MAXIMUM (95% risk)", "DANGER");
      setSuggestions(pickSuggestionsByRisk(95));
    }, 18000); // ~95% reached after ~18 seconds for more drama

    return () => {
      clearInterval(simulationInterval);
      clearInterval(alertInterval);
      clearTimeout(endTimer);
    };
  }, [isSimulating, apiRiskLevel, addAlert, pickSuggestionsByRisk]);

  // Auto-update recommendations when risk changes
  useEffect(() => {
    if (!isSimulating && riskPercentage > 0) {
      setSuggestions(pickSuggestionsByRisk(riskPercentage));
    }
  }, [riskPercentage, pickSuggestionsByRisk, isSimulating]);

  const handleThinkingComplete = useCallback(() => {
    setIsThinkingEffectVisible(false);
    setIsPredictionPanelVisible(true);
  }, []);

  // Show AI Prediction Panel when analysis completes
  useEffect(() => {
    if (analysisComplete && predictionConfidence !== null && !isThinkingEffectVisible) {
      setIsPredictionPanelVisible(true);
    }
  }, [analysisComplete, predictionConfidence, isThinkingEffectVisible]);

  const borderClass =
    urgency === "CRITICAL"
      ? "border-4 border-danger/80 shadow-danger-glow"
      : status === "DANGER"
      ? "border-2 border-danger/50 shadow-danger-glow"
      : status === "WARNING"
      ? "border border-warning/30 shadow-warning-glow/50"
      : "border border-safe/30 shadow-safe-glow/30";

  const bgClass =
    urgency === "CRITICAL"
      ? "bg-gradient-to-br from-background via-background to-background"
      : status === "DANGER"
      ? "bg-gradient-to-br from-background via-background to-background"
      : status === "WARNING"
      ? "bg-gradient-to-br from-background via-background to-background"
      : "bg-gradient-to-br from-background via-background to-background";

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden transition-all duration-1000 ${borderClass} ${bgClass}`}>
      <TopNavbar status={status} isAIDriven={analysisSource !== null} isUsingAI={isUsingAI} />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <aside className="w-72 border-r border-border bg-card/40 overflow-y-auto">
          <LeftPanel onAIAnalysis={handleAIAnalysis} isProcessing={isProcessing} status={status} />
        </aside>

        {/* Center Map */}
        <main className="flex-1 p-3">
          <MapSection 
  dangerZoneRadius={dangerZoneRadius} 
  status={status} 
  apiRiskLevel={apiRiskLevel}
  threatPosition={threatPosition}
/>
        </main>

        {/* Right Panel */}
        <aside className="w-72 border-l border-border bg-card/40 overflow-y-auto">
          <RightPanel
            alerts={alerts}
            status={status}
            onSuggestionClick={handleSuggestion}
            isProcessing={isProcessing}
            processingMessage={processingMessage}
            suggestions={suggestions}
            showCriticalIndicator={showCriticalIndicator && apiRiskLevel === "HIGH"}
          />
        </aside>
      </div>

      <BottomControlBar
        analysisComplete={analysisComplete}
        isProcessing={isProcessing}
        riskPercentage={riskPercentage}
        status={status}
        onSimulate={handleSimulate}
        onPredict={handlePredict}
        onAutoResponse={handleAutoResponse}
      />

      {/* AI Thinking Effect Overlay */}
      <AIThinkingEffect
        isVisible={isThinkingEffectVisible}
        onComplete={handleThinkingComplete}
      />

      {/* AI Prediction Panel Overlay */}
      {isPredictionPanelVisible && (
        <AIPredictionPanel
          isVisible={isPredictionPanelVisible}
          predictionMessage={PREDICTION_MESSAGES[Math.floor(Math.random() * PREDICTION_MESSAGES.length)]}
          confidence={predictionConfidence || 85}
          onClose={() => setIsPredictionPanelVisible(false)}
        />
      )}
    </div>
  );
};

export default Index;
