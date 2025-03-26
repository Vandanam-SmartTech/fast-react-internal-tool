export interface QuotationData {
  id: number;
  customerId: number;
  isMsebConnection: string;
  isNameCorrection: string;
  isEmailCorrection: string;
  isOutOfStation: string;
  distance: number;
  isLoanRequired: string;
  inversionType: string;
  consumerId: string;
  govIdName: string;//
  correctionType: string;
  billedTo: string;
  gstIn: string;
  mobileNumber: string;//
  aadharNumber: string;
  panNumber: string;
  emailAddress: string;//
  addressLine1: string;
  addressLine2: string;
  connectionType: string;
  phase: string;
  addressType: string;
  sectionId: string;
  dcrNonDcr: string;
  latitude: string;
  longitude: string;
  monthlyAvgUnit: number;//
  kw: number;
  panelBrand: string;
  acWireLengthFt: number;
  dcWireLengthFt: number;
  earthingWireLengthFt: number;
  numberOfGpPipes: number;
  descriptionOfInstallation: string;
  recommendedInstallationSpaceType: string;
  recommendedInstallationStructureType: string;
  recommendedKW:number;
  floorNumber: number;
  availableSouthNorthLengthFt: number;
  availableEastWestLengthFt: number;
  spaceType: string;
  subsidy: number;
  solarSystemCost: bigint; // Using bigint for large numbers
  fabricationCost: number;
  effectiveCost: bigint; // Using bigint for large numbers
  batteryWattage: number;
  pincode: string; // String because it may contain leading zeros
  districtCode: number;
  talukaCode: number;
  villageCode: number;
}
