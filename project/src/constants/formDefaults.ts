import { QuotationData } from '../types/quotation';

export const initialFormData: QuotationData = {
  consumerNumber: '',
  consumerName: '',
  consumerPhoneNumber: '',
  consumerEmail: '',
  consumerAddress1: '',
  consumerAddress2: '',
  connectionType: 'Residential',
  phase: 'Single',
  dcrNonDcr: 'DCR',
  monthlyAvgUnit: NaN,
  kw: NaN,
  subsidy: NaN,
  solarCostSystem: NaN,
  fabricationCost: NaN,
  effectiveCost: NaN,
  batteryCapacity:NaN,
};