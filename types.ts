
export enum Screen {
  Home = 'HOME',
  Scan = 'SCAN',
  Results = 'RESULTS',
  History = 'HISTORY',
}

export type Language = 'en' | 'he' | 'ar' | 'es' | 'fr' | 'de';

export interface Prediction {
  condition: string;
  probability: number;
  urgency: 'green' | 'yellow' | 'red';
  description: string;
}

export interface ProductRecommendation {
  name: string;
  purpose: string;
}

export interface ScanResult {
  predictions: Prediction[];
  overall_urgency: 'green' | 'yellow' | 'red';
  recommendation: string;
  disclaimer: string;
  confidence: number;
  product_recommendations?: ProductRecommendation[];
}