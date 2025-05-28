import { useLocation } from "react-router-dom";
import { fetchPdf } from '../services/api';
import { useState } from "react";

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
  const consumer = location.state?.consumer as Consumer; // Retrieve consumer data
  const [loadingPreviewDoc, setLoadingPreviewDoc] = useState<string | null>(null); // Track loading per document

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
    console.log("Document Generating")
    if (!consumer || !consumer.id) {
      console.error("Consumer data missing");
      return;
    }
  
    try {
      const response = await fetchPdf(consumer.id, doc);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
  
      // Create a temporary link to trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc.replace(/\s/g, "_")}_${consumer.id}.pdf`;
      document.body.appendChild(a);
      a.click();
  
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error generating document:", error);
    }
  };

  const handlePreview = async (docName: string) => {
    if (!consumer?.id) {
      console.error("Consumer ID is missing!");
      return;
    }

    setLoadingPreviewDoc(docName); // Set loading for the specific button

    try {
      const response = await fetchPdf(consumer.id, docName);
      const pdfBlob = await response.blob();
      const pdfUrl = URL.createObjectURL(pdfBlob);

      // Open in a new tab for preview
      const popupWindow = window.open("", "_blank", "width=800,height=600");
      if (popupWindow) {
        popupWindow.document.write(`
          <html>
            <head>
              <title>Document Preview</title>
            </head>
            <body>
              <embed src="${pdfUrl}" type="application/pdf" width="100%" height="100%" />
            </body>
          </html>
        `);
      } else {
        console.error("Popup blocked. Please allow popups and try again.");
      }
    } catch (error) {
      console.error("Failed to preview the document:", error);
    } finally {
      setLoadingPreviewDoc(null); // Reset loading state after completion
    }
  };
  
  

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {consumer && (
        <p className="mb-4 text-lg font-medium text-center">
          Generating Documents for:{" "}
          <span className="font-semibold">{consumer.govIdName} ({consumer.consumerId})</span>
        </p>
      )}
      <div className="bg-white p-4 rounded-lg shadow-lg max-w-3xl mx-auto">
        {documents.map((doc, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row justify-between items-center border-b py-3 last:border-b-0"
          >
            <span className="text-lg font-medium text-center sm:text-left">{doc}</span>

            <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
            <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                onClick={() => handlePreview(doc)}
                disabled={loadingPreviewDoc === doc} // Disable only the button being clicked
              >
                {loadingPreviewDoc === doc ? "Loading..." : "Preview Document"}
              </button>
              <button
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                    onClick={() => handleGenerate(doc)}
            >
        Generate Document
</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
