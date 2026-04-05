export type SystemStatus = "SAFE" | "WARNING" | "DANGER";

export interface AlertItem {
  id: string;
  timestamp: Date;
  message: string;
  severity: SystemStatus;
}

export interface DetectionResult {
  label: string;
  confidence: number;
  threatLevel: SystemStatus;
}
