export interface QuotationData {
  isMsebConnection: string;
  isNameCorrection: string;
  isEmailCorrection: string;
  isLoanRequired: string;
  inversionType: string;
  consumerNumber: string;
  consumerName: string;
  correctionType: string;
  billedTo: string;
  gstNo: string;
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
  solarCostSystem: bigint; // Using bigint for large numbers
  fabricationCost: number;
  effectiveCost: bigint; // Using bigint for large numbers
  batteryWattage: number;
  pincode: string; // String because it may contain leading zeros
  districtCode: number;
  talukaCode: number;
  villageCode: number;
}
