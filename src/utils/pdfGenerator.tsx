import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { QuotationData } from '../types/quotation';

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    color: '#334155',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: 150,
    fontSize: 12,
    color: '#64748b',
  },
  value: {
    flex: 1,
    fontSize: 12,
  },
});

const QuotationDocument = ({ data }: { data: QuotationData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Solar System Quotation</Text>
        <Text>Date: {new Date().toLocaleDateString()}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Consumer Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Consumer Number:</Text>
          <Text style={styles.value}>{data.consumerNumber}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{data.consumerName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{data.consumerPhoneNumber}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{data.consumerEmail}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>{data.consumerAddress1}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}></Text>
          <Text style={styles.value}>{data.consumerAddress2}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connection Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Connection Type:</Text>
          <Text style={styles.value}>{data.connectionType}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Phase:</Text>
          <Text style={styles.value}>{data.phase}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>DCR/Non-DCR:</Text>
          <Text style={styles.value}>{data.dcrNonDcr}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Monthly Avg Unit:</Text>
          <Text style={styles.value}>{data.monthlyAvgUnit}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>KW:</Text>
          <Text style={styles.value}>{data.kw}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cost Breakdown</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Solar System Cost:</Text>
          <Text style={styles.value}>₹{data.solarCostSystem.toLocaleString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Fabrication Cost:</Text>
          <Text style={styles.value}>₹{data.fabricationCost.toLocaleString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Subsidy:</Text>
          <Text style={styles.value}>₹{data.subsidy.toLocaleString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Effective Cost:</Text>
          <Text style={styles.value}>₹{data.effectiveCost.toLocaleString()}</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export const generatePDF = async (data: QuotationData) => {
  try {
    const blob = await pdf(<QuotationDocument data={data} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quotation-${data.consumerNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};