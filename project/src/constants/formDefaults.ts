import { QuotationData } from '../types/quotation';

export const initialFormData: QuotationData = {
  gridType:'',
  isMsebConnection: '',
  consumerNumber: '',
  consumerName: '',
  consumerPhoneNumber: '',
  consumerEmail: '',
  consumerAddress1: '',
  consumerAddress2: '',
  connectionType: 'Residential',
  phase: 'Single',
  dcrNonDcr: 'DCR',
  batteryWattage: 0, 
  monthlyAvgUnit: NaN,
  kw: 0,
  subsidy: 0,
  solarCostSystem: 0,
  fabricationCost: 0,
  effectiveCost: 0,
  pincode:0,
};