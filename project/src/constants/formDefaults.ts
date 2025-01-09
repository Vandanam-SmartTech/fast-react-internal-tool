import { QuotationData } from '../types/quotation';

export const initialFormData: QuotationData = {
  gridType:'',
  msebConnection: '',
  consumerNumber: '',
  consumerName: '',
  consumerPhoneNumber: '',
  consumerEmail: '',
  consumerAddress1: '',
  consumerAddress2: '',
  connectionType: 'Residential',
  phase: 'Single',
  dcrNonDcr: 'DCR',
  batteryWattage: NaN, 
  monthlyAvgUnit: NaN,
  kw: NaN,
  subsidy: NaN,
  solarCostSystem: NaN,
  fabricationCost: NaN,
  effectiveCost: NaN,
};