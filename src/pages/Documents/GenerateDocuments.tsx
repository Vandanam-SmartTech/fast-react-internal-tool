import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { fetchPdf } from "../../services/documentGeneratorService";
import {
  uploadDocuments,
  fetchUploadedFilesBySession,
  downloadDocumentById,
} from "../../services/oneDriveService";
import { toast } from 'react-toastify';

export interface Consumer {
  id: number;
  customerId: number;
  govIdName: string;
  consumerId: number;
  connectionType: string;
  mobileNumber: string;
  emailAddress: string;
}

interface UploadedFile {
  fileId: string;
  fileName: string;
  filePath: string;
}

const sessionOptions = [
  "WCR Page-1",
  "Annexure 1",
  "Earthing Page Document",
  "Subsidy Agreement Document",
  "Vendor Feasibility Document",
  "Netmeter Agreement Document-Page-1",
  "Netmeter Agreement Document-Page-2",
  "Declarartion Document",
];

export default function GenerateDocuments() {
  const location = useLocation();
  const navigate = useNavigate();
  const consumer = location.state?.consumer as Consumer;

  const [loadingPreviewDoc, setLoadingPreviewDoc] = useState<string | null>(null);
  const [loadingGenerateDoc, setLoadingGenerateDoc] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const connectionId = consumer?.id?.toString();

  const getDocumentNameFromSession = (session: string) => {
    return sessionOptions.find(doc => session.startsWith(doc)) || session;
  };

  const getSessionName = (docName: string) =>
    `${docName.replace(/\s/g, "_")}_${consumer.govIdName}`;

  const fetchUploaded = async (docName: string) => {
    if (!connectionId || !docName) return;
    const session = getSessionName(docName);
    const files = await fetchUploadedFilesBySession(connectionId, session);
    setUploadedFiles(files);
  };

  useEffect(() => {
    if (selectedSession) {
      fetchUploaded(selectedSession);
    }
  }, [selectedSession]);

  const handleGenerate = async (doc: string) => {
    if (!consumer?.id) return;
    setLoadingGenerateDoc(doc);
    try {
      const blob = await fetchPdf(consumer.id, doc);
      const sessionName = getSessionName(doc);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${sessionName}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Generate error:", err);
    } finally {
      setLoadingGenerateDoc(null);
    }
  };

  const handlePreview = async (doc: string) => {
    if (!consumer?.id) return;
    setLoadingPreviewDoc(doc);
    try {
      const blob = await fetchPdf(consumer.id, doc);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      console.error("Preview error:", err);
    } finally {
      setLoadingPreviewDoc(null);
    }
  };

  // const handleUpload = async () => {
  //   if (!connectionId || !selectedSession || !selectedFile) return;
  //   setUploading(true);
  //   try {
  //     const sessionName = getSessionName(selectedSession);
  //     await uploadDocuments(connectionId, sessionName, [selectedFile]);
  //     await fetchUploaded(selectedSession);
  //     setSelectedFile(null);
  //   } catch (err) {
  //     console.error("Upload failed", err);
  //   } finally {
  //     setUploading(false);
  //   }
  // };

const handleUpload = async () => {
  if (!connectionId || !selectedSession || !selectedFile) return;
  setUploading(true);
  try {
    const sessionName = getSessionName(selectedSession);
    await uploadDocuments(connectionId, sessionName, [selectedFile]);
    await fetchUploaded(selectedSession);
    
    toast.success(`${selectedFile.name} uploaded successfully`);
    
    setSelectedFile(null);
  } catch (err) {
    console.error("Upload failed", err);
    toast.error("File upload failed");
  } finally {
    setUploading(false);
  }
};


  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      const blob = await downloadDocumentById(fileId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(`/OnboardedConsumers`)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h2 className="text-2xl font-semibold">Generate & Upload/View Documents</h2>
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

      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        {sessionOptions.map((doc) => (
          <div key={doc} className="flex flex-col sm:flex-row justify-between items-center border-b py-2">
            <span className="text-lg">{doc}</span>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <button
                className="hidden md:block px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => handlePreview(doc)}
                disabled={loadingPreviewDoc === doc}
              >
                {loadingPreviewDoc === doc ? "Previewing..." : "Preview"}
              </button>
              <button
                className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={() => handleGenerate(doc)}
                disabled={loadingGenerateDoc === doc}
              >
                {loadingGenerateDoc === doc ? "Generating..." : "Generate"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload UI */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <h3 className="text-lg font-semibold">Upload/View Signed Document(s)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="">Select Document Type</option>
            {sessionOptions.map((doc) => (
              <option key={doc} value={doc}>
                {doc}
              </option>
            ))}
          </select>

          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={!selectedSession || !selectedFile || uploading}
          className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          {uploading ? "Uploading..." : "Upload Document"}
        </button>

        {/* Uploaded File List */}
        {uploadedFiles.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <h4 className="font-semibold mb-2">
              Previously Uploaded Files for{" "}
              <span className="text-blue-700">{getDocumentNameFromSession(selectedSession)}</span>

            </h4>
            <ul className="space-y-2">
              {uploadedFiles.map((file) => (
                <li key={file.fileId} className="flex justify-between items-center border p-2 rounded">
                  <span>{file.fileName}</span>
                  <button
                    onClick={() => handleDownload(file.fileId, file.fileName)}
                    className="px-4 py-1 bg-gray-800 text-white rounded hover:bg-gray-900"
                  >
                    Download
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}