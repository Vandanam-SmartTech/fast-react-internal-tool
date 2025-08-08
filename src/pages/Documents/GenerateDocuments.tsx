import { useLocation, useNavigate } from "react-router-dom";
import { fetchPdf } from '../../services/documentGeneratorService';
import { useState } from "react";
import { ArrowLeft, Eye, Download, User, Hash, Phone, Mail, FileText } from "lucide-react";
import { Button } from "../../components/ui";
import Card, { CardBody } from "../../components/ui/Card";

export interface Consumer{
  id:number,
  customerId:number,
  govIdName: string,
  consumerId:number,
  connectionType:string,
  mobileNumber:string,
  emailAddress:string,
}

export default function GenerateDocuments() {
  const location = useLocation();
  const navigate = useNavigate();
  const consumer = location.state?.consumer as Consumer; 
  const [loadingPreviewDoc, setLoadingPreviewDoc] = useState<string | null>(null); 
  const [loadingGenerateDoc, setLoadingGenerateDoc] = useState<string | null>(null);

  const documents = [
    "WCR Page-1",
    "Annexure 1",
    "EarthingPageDocument",
    "Subsidy Agreement Document-Page-1",
    "Subsidy Agreement Document-Page-2",
    "Vendor Feasibility Document",
    "Netmeter Agreement Document-Page-1",
    "Netmeter Agreement Document-Page-2",
    "Declarartion Document",
  ];

  const handleGenerate = async (doc: string) => {
    if (!consumer || !consumer.id) {
      console.error("Consumer data missing");
      return;
    }

    setLoadingGenerateDoc(doc);

    try {
      const blob = await fetchPdf(consumer.id, doc);
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc.replace(/\s/g, "_")}_${consumer.id}.pdf`;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error generating document:", error);
    } finally {
      setLoadingGenerateDoc(null);
    }
  };

  const handlePreview = async (docName: string) => {
    if (!consumer?.id) {
      console.error("Consumer ID is missing!");
      return;
    }

    setLoadingPreviewDoc(docName);

    try {
      const blob = await fetchPdf(consumer.id, docName); 
      const pdfUrl = URL.createObjectURL(blob);
      const newTab = window.open(pdfUrl, "_blank");
      if (!newTab) {
        console.error("Failed to open new tab. Please allow popups.");
      }
    } catch (error) {
      console.error("Failed to preview the document:", error);
    } finally {
      setLoadingPreviewDoc(null);
    }
  };

  if (!consumer) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardBody className="p-8 text-center">
            <h2 className="text-2xl font-semibold mb-2">No consumer selected</h2>
            <p className="text-secondary-600 dark:text-secondary-400 mb-6">Please go back and select a consumer to generate documents.</p>
            <Button variant="primary" onClick={() => navigate('/OnboardedConsumers')} leftIcon={<ArrowLeft className="h-4 w-4" />}>Go Back</Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate(`/OnboardedConsumers`)} leftIcon={<ArrowLeft className="h-4 w-4" />}>Back</Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-secondary-100">Generate Documents</h1>
            <p className="text-secondary-600 dark:text-secondary-400">Preview or download official documents for the selected consumer</p>
          </div>
        </div>
      </div>

      {/* Consumer Info */}
      <Card className="mb-6">
        <CardBody className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary-50 dark:bg-secondary-800">
              <div className="p-2 rounded-md bg-primary-100 dark:bg-primary-900">
                <User className="h-5 w-5 text-primary-600 dark:text-primary-300" />
              </div>
              <div>
                <div className="text-xs text-secondary-500">Name</div>
                <div className="text-sm font-medium">{consumer.govIdName || '—'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary-50 dark:bg-secondary-800">
              <div className="p-2 rounded-md bg-solar-100 dark:bg-solar-900">
                <Hash className="h-5 w-5 text-solar-600 dark:text-solar-300" />
              </div>
              <div>
                <div className="text-xs text-secondary-500">Consumer No.</div>
                <div className="text-sm font-medium">{consumer.consumerId || '—'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary-50 dark:bg-secondary-800">
              <div className="p-2 rounded-md bg-primary-100 dark:bg-primary-900">
                <Phone className="h-5 w-5 text-primary-600 dark:text-primary-300" />
              </div>
              <div>
                <div className="text-xs text-secondary-500">Mobile</div>
                <div className="text-sm font-medium">{consumer.mobileNumber || '—'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary-50 dark:bg-secondary-800">
              <div className="p-2 rounded-md bg-primary-100 dark:bg-primary-900">
                <Mail className="h-5 w-5 text-primary-600 dark:text-primary-300" />
              </div>
              <div>
                <div className="text-xs text-secondary-500">Email</div>
                <div className="text-sm font-medium truncate max-w-[220px]">{consumer.emailAddress || '—'}</div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Documents Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {documents.map((doc) => (
          <Card key={doc} className="hover:shadow-xl transition-shadow">
            <CardBody className="p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-secondary-50 dark:bg-secondary-800">
                  <FileText className="h-5 w-5 text-secondary-600 dark:text-secondary-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-secondary-900 dark:text-secondary-100 truncate" title={doc}>{doc}</div>
                  <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handlePreview(doc)}
                      loading={loadingPreviewDoc === doc}
                      leftIcon={<Eye className="h-4 w-4" />}
                      className="flex-1"
                    >
                      {loadingPreviewDoc === doc ? 'Previewing...' : 'Preview'}
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => handleGenerate(doc)}
                      loading={loadingGenerateDoc === doc}
                      leftIcon={<Download className="h-4 w-4" />}
                      className="flex-1"
                    >
                      {loadingGenerateDoc === doc ? 'Generating...' : 'Generate'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
