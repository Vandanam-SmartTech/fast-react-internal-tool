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
  subsidy: NaN,
  solarCostSystem: NaN,
  fabricationCost: NaN,
  effectiveCost: NaN,
  pincode:NaN,
};