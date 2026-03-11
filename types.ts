
export enum DetectionLabel {
  REAL = 'Real',
  FAKE = 'Fake'
}

export interface DetectionResult {
  id: string;
  filename: string;
  imageUrl: string;
  label: DetectionLabel;
  confidence: number;
  timestamp: number;
  analysis?: string;
  anomalies?: string[];
}

export interface BatchAnalysisState {
  isProcessing: boolean;
  progress: number;
  results: DetectionResult[];
}
