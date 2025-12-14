export type Language = 'zh-TW' | 'en' | 'ja' | 'ko';

export interface Color {
  hex: string;
  name: string;
}

export interface Palette {
  id: string;
  name: string;
  description: string;
  designAdvice: string;
  colors: Color[];
  createdAt: number;
}

export interface GeneratePaletteResponse {
  name: string;
  description: string;
  designAdvice: string;
  colors: Color[];
}