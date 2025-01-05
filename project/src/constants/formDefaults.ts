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
  monthlyAvgUnit: 0,
  kw: 0,
  subsidy: 0,
  solarCostSystem: 0,
  fabricationCost: 0,
  effectiveCost: 0,
};