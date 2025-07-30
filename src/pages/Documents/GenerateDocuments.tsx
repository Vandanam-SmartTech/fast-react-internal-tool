import { useLocation,useNavigate } from "react-router-dom";
import { fetchPdf } from '../../services/documentGeneratorService';
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

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

  console.log("Consumer Data:", consumer);

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
    const blob = await fetchPdf(consumer.id, doc); // Axios already gives blob
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

  return (
  <div className="max-w-4xl mx-auto space-y-6">

    
    <div className="max-w-4xl mx-auto space-y-4">

          <div className="flex items-center w-full md:w-auto">
<button
  onClick={() => navigate(`/OnboardedConsumers`)}
  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition"
>
  <ArrowLeft className="w-6 h-6 text-gray-700" />
</button>


    <h2 className="text-xl md:text-2xl font-semibold">
      Generate Documents
    </h2>
  </div>


      {consumer && (
        <div className="bg-white border border-gray-200 shadow-sm rounded-md p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-10 text-sm text-gray-700">
            <div>
              <span className="font-medium text-gray-700">Consumer Name:</span>
              <span className="ml-1 text-gray-800">{consumer.govIdName || "—"}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Consumer Number:</span>
              <span className="ml-1 text-gray-800">{consumer.consumerId || "—"}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Mobile Number:</span>
              <span className="ml-1 text-gray-800">{consumer.mobileNumber || "—"}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Email Address:</span>
              <span className="ml-1 text-gray-800">{consumer.emailAddress || "—"}</span>
            </div>
          </div>
        </div>
      )}


      <div className="bg-white p-4 rounded-lg shadow-lg">
        {documents.map((doc, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row justify-between items-center border-b py-3 last:border-b-0"
          >
            <span className="text-lg font-medium text-center sm:text-left">{doc}</span>

            <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
              <button
                className="hidden md:block w-full sm:w-auto px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => handlePreview(doc)}
                disabled={loadingPreviewDoc === doc}
              >
                {loadingPreviewDoc === doc ? "Previewing..." : "Preview Document"}
              </button>
              <button
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
                onClick={() => handleGenerate(doc)}
                disabled={loadingGenerateDoc === doc}
              >
                {loadingGenerateDoc === doc ? "Generating..." : "Generate Document"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);


}
