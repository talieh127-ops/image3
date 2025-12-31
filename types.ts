
export interface DesignPreferences {
  style: string;
  colorPalette: string;
  cabinetMaterial: string;
  countertop: string;
  lighting: string;
  flooring: string;
  extraDetails: string;
  userRequests: string;
}

export interface MaterialItem {
  item: string;
  material: string;
  dimensions: string;
  count: string;
  description: string;
}

export interface GenerationResult {
  originalImage: string;
  generatedImage: string;
  cuttingList?: MaterialItem[];
  timestamp: number;
}
