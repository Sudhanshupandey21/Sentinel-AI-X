export type SystemStatus = "SAFE" | "WARNING" | "DANGER";
export type RiskLevel = "Low" | "Medium" | "High";

export interface AlertItem {
  id: string;
  timestamp: Date;
  message: string;
  severity: SystemStatus;
}

export interface DetectionResult {
  confidence: number;
  boundingBox?: { x: number; y: number; width: number; height: number };
  message: string;
  threatLevel: SystemStatus;
  riskScore: number;
  analysisType: string;
}

export interface ThreatAnalysis {
  riskLevel: RiskLevel;
  riskScore: number; // 0-100
  location: [number, number];
  recommendations: string[];
  timestamp: Date;
}
