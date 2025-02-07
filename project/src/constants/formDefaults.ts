import { QuotationData } from '../types/quotation';

export const initialFormData: QuotationData = {
  inversionType: '',
  isMsebConnection: 'Yes',
  isNameCorrection: 'No',
  isEmailCorrection: 'Yes',
  isLoanRequired: 'No',
  correctionType: '',
  consumerNumber: '',
  consumerName: '',
  consumerPhoneNumber: '',
  consumerEmail: '',
  consumerAddress1: '',
  consumerAddress2: '',
  connectionType: 'Residential',
  phase: '',
  dcrNonDcr: 'DCR',
  batteryWattage: 0,
  monthlyAvgUnit: 0,
  kw: 0,
  subsidy: 0,
  solarCostSystem: BigInt(0), // Using BigInt for accurate representation
  fabricationCost: 0,
  effectiveCost: BigInt(0), // Using BigInt for accurate representation
  pincode: '',
  districtCode: 0,
  talukaCode: 0,
  villageCode: 0,
  billedTo: '',
  gstNo: ''
};
