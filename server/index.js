import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

const googleApiKey = process.env.GOOGLE_API_KEY;
const PORT = process.env.PORT || 4000;
const GEMINI_TIMEOUT_MS = 6000;

const createFallbackResponse = (scenario) => {
  const lower = scenario.toLowerCase();

  if (lower.includes("flood") || lower.includes("water") || lower.includes("rain")) {
    return {
      situation: "Water level anomaly detected — flooding risk in restricted area",
      risk: "HIGH",
      urgency: "CRITICAL",
      prediction: "High risk of water level rise and damage.",
      alertMessage: "🚨 CRITICAL: Flood risk escalation — immediate evacuation required",
      actions: [
        "Move vulnerable assets to higher ground",
        "Increase flood monitoring and weather updates",
        "Prepare emergency pumps and evacuation routes"
      ]
    };
  }

  if (lower.includes("drone") || lower.includes("intrusion")) {
    return {
      situation: "Unmanned aerial vehicle detected in restricted airspace",
      risk: "HIGH",
      urgency: "CRITICAL",
      prediction: "High probability of security breach.",
      alertMessage: "🚨 CRITICAL: Drone incursion — activate air defense systems",
      actions: [
        "Lock down the affected perimeter immediately",
        "Notify security command and deploy response teams",
        "Monitor sensors and communications for additional intrusion signs"
      ]
    };
  }

  if (lower.includes("crowd")) {
    return {
      situation: "Large crowd gathering detectedin monitored zone",
      risk: "MEDIUM",
      urgency: "ALERT",
      prediction: "Crowd density may create a moderate public safety risk.",
      alertMessage: "⚠️ ALERT: Crowd assembly detected — increase monitoring resources",
      actions: [
        "Increase situational awareness and crowd monitoring",
        "Deploy support personnel to manage the gathering",
        "Prepare contingency routes and escalation protocols"
      ]
    };
  }

  if (lower.includes("fire") || lower.includes("wildfire") || lower.includes("smoke") || lower.includes("heat")) {
    return {
      situation: "Uncontrolled fire detected spreading toward infrastructure",
      risk: "HIGH",
      urgency: "CRITICAL",
      prediction: "The fire threat is likely to spread rapidly toward critical infrastructure if left unchecked.",
      alertMessage: "🚨 CRITICAL: Fire emergency — activate suppression and evacuation protocols",
      actions: [
        "Activate fire suppression systems immediately",
        "Evacuate the affected area and nearby personnel",
        "Alert emergency response teams and maintain perimeter control"
      ]
    };
  }

  if (lower.includes("earthquake") || lower.includes("tremor") || lower.includes("quake")) {
    return {
      situation: "Seismic activity detected affecting critical facilities",
      risk: "HIGH",
      urgency: "CRITICAL",
      prediction: "Aftershocks may trigger additional damage and secondary failures shortly.",
      alertMessage: "🚨 CRITICAL: Earthquake emergency — execute structural safety protocols",
      actions: [
        "Inspect structural integrity of key facilities",
        "Shut down noncritical systems to reduce risk",
        "Deploy rapid response teams to vulnerable zones"
      ]
    };
  }

  if (lower.includes("network") || lower.includes("traffic") || lower.includes("data") || lower.includes("communication")) {
    return {
      situation: "Network anomaly detected in critical infrastructure segment",
      risk: "MEDIUM",
      urgency: "ALERT",
      prediction: "Network anomalies may enable a coordinated cyber event in the near term.",
      alertMessage: "⚠️ ALERT: Network anomaly — isolate and investigate immediately",
      actions: [
        "Increase monitoring of suspicious traffic patterns",
        "Segment critical network assets and apply stricter filtering",
        "Notify cybersecurity teams for immediate review"
      ]
    };
  }

  return {
    situation: "Routine surveillance observation — no immediate threat",
    risk: "LOW",
    urgency: "NORMAL",
    prediction: "Suspicious activity detected with low immediate threat.",
    alertMessage: "✓ NORMAL: System monitoring active — baseline alert status",
    actions: [
      "Monitor the scenario closely",
      "Keep response teams on standby",
      "Review the area for further evidence"
    ]
  };
};

const extractJson = (text) => {
  if (!text || typeof text !== "string") return null;

  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
};

const normalizeResponse = (candidate) => {
  if (!candidate || typeof candidate !== "object") return null;

  const situation = String(candidate.situation || "").trim();
  const risk = String(candidate.risk || "").toUpperCase().trim();
  const urgency = String(candidate.urgency || "").toUpperCase().trim();
  const alertMessage = String(candidate.alertMessage || "").trim();
  const prediction = String(candidate.prediction || "").trim();
  const actions = Array.isArray(candidate.actions)
    ? candidate.actions.map((action) => String(action).trim()).filter(Boolean)
    : [];

  if (!risk || !["LOW", "MEDIUM", "HIGH"].includes(risk)) return null;
  if (!urgency || !["NORMAL", "ALERT", "CRITICAL"].includes(urgency)) return null;
  if (!situation || !prediction || !alertMessage) return null;
  if (!actions.length) return null;

  return { situation, risk, urgency, alertMessage, prediction, actions };
};

app.post("/ai-analyze", async (req, res) => {
  const scenario = String(req.body?.scenario || "").trim();
  if (!scenario) {
    return res.status(400).json({ error: "Missing scenario text." });
  }

  const fallback = createFallbackResponse(scenario);

  if (!googleApiKey) {
    console.warn("/ai-analyze: GOOGLE_API_KEY not configured, using fallback");
    return res.status(200).json({ ...fallback, source: 'fallback' });
  }

  const prompt = `Analyze this critical security or disaster scenario:\n${scenario}\n\nReturn response in JSON format with EXACT fields:\n{\n\"situation\": \"brief current situation description\",\n\"risk\": \"LOW / MEDIUM / HIGH\",\n\"urgency\": \"NORMAL / ALERT / CRITICAL\",\n\"alertMessage\": \"emoji + message for control room\",\n\"prediction\": \"short future threat prediction\",\n\"actions\": [\"action1\", \"action2\", \"action3\"]\n}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${googleApiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      },
      {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    clearTimeout(timeout);

    const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const parsed = extractJson(rawText);
    const normalized = normalizeResponse(parsed);

    if (normalized) {
      // API succeeded - return with source indicator
      return res.status(200).json({ ...normalized, source: 'api' });
    }

    // API response invalid - use fallback
    console.warn("/ai-analyze: API response invalid, using fallback");
    return res.status(200).json({ ...fallback, source: 'fallback' });
  } catch (error) {
    console.error("/ai-analyze error:", error?.message || error);
    // API failed - use fallback
    return res.status(200).json({ ...fallback, source: 'fallback' });
  }
});

app.listen(PORT, () => {
  console.log(`AI backend listening on http://localhost:${PORT}`);
});
