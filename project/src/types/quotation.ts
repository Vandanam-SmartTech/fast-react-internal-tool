export interface QuotationData {
  isMsebConnection: string;
  inversionType:string;
  consumerNumber: string;
  consumerName: string;
  consumerPhoneNumber: string;
  consumerEmail: string;
  consumerAddress1: string;
  consumerAddress2: string;
  connectionType: string;
  phase: string;
  dcrNonDcr: string;
  monthlyAvgUnit: number;
  kw: number;
  subsidy: number;
  solarCostSystem: number;
  fabricationCost: number;
  effectiveCost: number;
  batteryWattage: number; 
  pincode:number;
  districtCode:number;
  talukaCode:number;
  villageCode:number;
}

export type District = {
  code: number;
  nameEnglish: string;
  nameMarathi: string | null;
  stateCode: number;
};

export type Taluka = {
  code: number;
  nameEnglish: string;
  nameMarathi: string | null;
  districtCode: number;
};

export type Village = {
  code: number;
  nameEnglish: string;
  nameMarathi: string | null;
  talukaCode: number;
  pincode: number;
};
