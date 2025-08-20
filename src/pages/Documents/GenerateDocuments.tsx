import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronRight, CheckCircle, Circle, FileText, Upload, Download, Eye, Play } from "lucide-react";
import { fetchPdf } from "../../services/documentGeneratorService";
import { uploadDocuments, fetchUploadedFilesBySession, downloadDocumentById, fetchUploadedDocuments} from "../../services/oneDriveService";
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

interface DocumentStep {
  id: number;
  title: string;
  documents: Array<{
    name: string;
    canGenerate: boolean;
    canPreview: boolean;
    uploadedFile?: File | null;
  }>;
  isCompleted: boolean;
  isExpanded: boolean;
}

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
  const [currentStep, setCurrentStep] = useState(1);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([1]));
  const [documentFiles, setDocumentFiles] = useState<Record<string, File | null>>({});

  const [loadingUploadDoc, setLoadingUploadDoc] = useState<string | null>(null);

  const [uploadedDocuments, setUploadedDocuments] = useState<Record<string, any[]>>({});

  const [inputKeys, setInputKeys] = useState<Record<string, number>>({});


  const connectionId = consumer?.id?.toString();


  const documentSteps: DocumentStep[] = [
    {
      id: 1,
      title: "Identity & Financial Documents",
      documents: [
        { name: "AadhaarCard", canGenerate: false, canPreview: false },
        { name: "BankPassbook", canGenerate: false, canPreview: false },
        { name: "Ebill", canGenerate: false, canPreview: false }
      ],
      isCompleted: false,
      isExpanded: true
    },
    {
      id: 2,
      title: "Quotation",
      documents: [
        { name: "Quotation", canGenerate: true, canPreview: true }
      ],
      isCompleted: false,
      isExpanded: false
    },
    {
      id: 3,
      title: "Testing & Payment",
      documents: [
        { name: "Gen Meter Testing Letter", canGenerate: false, canPreview: false },
        { name: "Fee Receipt", canGenerate: false, canPreview: false }
      ],
      isCompleted: false,
      isExpanded: false
    },
    {
      id: 4,
      title: "DCR Certificate",
      documents: [
        { name: "DCR Certificate", canGenerate: false, canPreview: false }
      ],
      isCompleted: false,
      isExpanded: false
    },
    {
      id: 5,
      title: "Comprehensive Documents",
      documents: [
        { name: "Vendor Feasibility", canGenerate: true, canPreview: true },
        { name: "Digital Approval Letter", canGenerate: false, canPreview: false },
        { name: "WCR", canGenerate: true, canPreview: true },
        { name: "Net Agreement", canGenerate: true, canPreview: true },
        { name: "Geo Tag", canGenerate: true, canPreview: false },
        { name: "Declaration", canGenerate: true, canPreview: true },
        { name: "Annexure-I", canGenerate: true, canPreview: true },
        { name: "Subsidy Document", canGenerate: true, canPreview: true },
        { name: "Earthing", canGenerate: true, canPreview:true },
        { name: "D1Form", canGenerate: true, canPreview: false },
        { name: "Gen Meter Testing Report", canGenerate: false, canPreview: false }
      ],
      isCompleted: false,
      isExpanded: false
    },
    {
      id: 6,
      title: "Final Approval",
      documents: [
        { name: "Sanction Letter", canGenerate: false, canPreview: false }
      ],
      isCompleted: false,
      isExpanded: false
    }
  ];

  // const getDocumentNameFromSession = (session: string) => {
  //   const allDocuments = documentSteps.flatMap(step => step.documents.map(doc => doc.name));
  //   return allDocuments.find(doc => session.startsWith(doc)) || session;
  // };

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

// useEffect(() => {
//   const loadDocuments = async () => {
//     try {
//       const data = await fetchUploadedDocuments(connectionId);

//       const grouped = data.reduce((acc: Record<string, any[]>, doc: any) => {
//         if (!acc[doc.documentType]) acc[doc.documentType] = [];
//         acc[doc.documentType].push(doc);
//         return acc;
//       }, {});

//       setUploadedDocuments(grouped);
//     } catch (error) {
//       console.error("Failed to fetch documents", error);
//     }
//   };

//   if (connectionId) {
//     loadDocuments();
//   }
// }, [connectionId]);

  const loadDocuments = useCallback(async () => {
    try {
      const data = await fetchUploadedDocuments(connectionId);

      const grouped = data.reduce((acc: Record<string, any[]>, doc: any) => {
        if (!acc[doc.documentType]) acc[doc.documentType] = [];
        acc[doc.documentType].push(doc);
        return acc;
      }, {});

      setUploadedDocuments(grouped);
    } catch (error) {
      console.error("Failed to fetch documents", error);
    }
  }, [connectionId]);

  useEffect(() => {
    if (connectionId) {
      loadDocuments();
    }
  }, [connectionId, loadDocuments]);

// const handlePreviewUploaded = (doc: any) => {
//   const fileUrl = `http://localhost:8192/api/document-manager/documents/file/${doc.fileId}`;
//   window.open(fileUrl, "_blank"); // opens in new tab
// };

const handleDownload = async (fileId: string, fileName: string) => {
  try {
    const blob = await downloadDocumentById(fileId);
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed:", error);
    alert("Failed to download file.");
  }
};


const handleGenerate = async (doc: string) => {
  if (!consumer?.id) return;
  setLoadingGenerateDoc(doc);
  try {
    const blob = await fetchPdf(consumer.id, doc);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc}.pdf`; // or use getSessionName(doc)
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (err) {
    console.error("Generate error:", err);
    toast.error("Failed to generate document");
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
    toast.error("Failed to preview document");
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
      
  //     toast.success(`${selectedFile.name} uploaded successfully`);
      
  //     setSelectedFile(null);
  //   } catch (err) {
  //     console.error("Upload failed", err);
  //     toast.error("File upload failed");
  //   } finally {
  //     setUploading(false);
  //   }
  // };

  const handleDocumentFileChange = (docName: string, file: File | null) => {
  setDocumentFiles((prev) => ({
    ...prev,
    [docName]: file,
  }));
};


const clearSelectedFile = (docName: string) => {
  
  setDocumentFiles((prev) => {
    const updated = { ...prev };
    delete updated[docName];
    return updated;
  });

  
  setInputKeys((prev) => ({
    ...prev,
    [docName]: Date.now(),
  }));
};


const handleDocumentUpload = async (documentName: string) => {
    const file = documentFiles[documentName];
    if (!file) return;

    try {
      setLoadingUploadDoc(documentName);

      await uploadDocuments(
        consumer?.id?.toString() || "",
        documentName,
        file
        );

      toast.success("Document Uploaded Successfully!", {
        autoClose: 1000,
        hideProgressBar: true,
      });


        setDocumentFiles((prev) => {
          const updated = { ...prev };
          delete updated[documentName];
          return updated;
          });


        await loadDocuments();
        clearSelectedFile(documentName);


    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Document Upload Failed!", { autoClose: 2000 });
    } finally {
      setLoadingUploadDoc(null);
    }
  };


  // const handleDownload = async (fileId: string, fileName: string) => {
  //   try {
  //     const blob = await downloadDocumentById(fileId);
  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement("a");
  //     a.href = url;
  //     a.download = fileName;
  //     document.body.appendChild(a);
  //     a.click();
  //     document.body.removeChild(a);
  //   } catch (err) {
  //     console.error("Download error:", err);
  //     toast.error("Failed to download file");
  //   }
  // };

  const toggleStepExpansion = (stepId: number) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return "completed";
    if (stepId === currentStep) return "current";
    return "pending";
  };

  const getStepIcon = (stepId: number) => {
    const status = getStepStatus(stepId);
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "current":
        return <Circle className="w-5 h-5 text-blue-600 fill-current" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStepClasses = (stepId: number) => {
    const status = getStepStatus(stepId);
    switch (status) {
      case "completed":
        return "text-green-600 border-green-600 bg-green-50";
      case "current":
        return "text-blue-600 border-blue-600 bg-blue-50";
      default:
        return "text-gray-400 border-gray-300 bg-gray-50";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(`/list-of-consumers`)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
          aria-label="Go back to consumers list"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">Generate & Upload Documents</h1>
      </div>

      {/* Consumer Information */}
      {consumer && (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Consumer Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Consumer Name:</span>
              <span className="ml-2 text-gray-800">{consumer.govIdName || "—"}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Consumer Number:</span>
              <span className="ml-2 text-gray-800">{consumer.consumerId || "—"}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Mobile Number:</span>
              <span className="ml-2 text-gray-800">{consumer.mobileNumber || "—"}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Email Address:</span>
              <span className="ml-2 text-gray-800">{consumer.emailAddress || "—"}</span>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar - Horizontal on Desktop, Vertical on Mobile */}
      {/* <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Document Progress</h2>
        
        <div className="hidden lg:block">
          <div className="flex items-center justify-between">
            {documentSteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${getStepClasses(step.id)}`}>
                    {getStepIcon(step.id)}
                  </div>
                  <span className="text-xs font-medium text-gray-600 mt-2 text-center max-w-24">
                    {step.title}
                  </span>
                </div>
                {index < documentSteps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${getStepStatus(step.id) === "completed" ? "bg-green-600" : "bg-gray-300"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:hidden">
          <div className="space-y-4">
            {documentSteps.map((step) => (
              <div key={step.id} className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${getStepClasses(step.id)}`}>
                  {getStepIcon(step.id)}
                </div>
                <span className="text-sm font-medium text-gray-700">{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div> */}

      <div className="space-y-4">
        {documentSteps.map((step) => (
          <div key={step.id} className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
            {/* Step Header */}
            <button
              onClick={() => toggleStepExpansion(step.id)}
              className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
              aria-expanded={expandedSteps.has(step.id)}
              aria-controls={`step-content-${step.id}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${getStepClasses(step.id)}`}>
                    {getStepIcon(step.id)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Step {step.id}: {step.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {step.documents.length} document{step.documents.length !== 1 ? 's' : ''} required
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {expandedSteps.has(step.id) ? 'Collapse' : 'Expand'}
                  </span>
                  {expandedSteps.has(step.id) ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>
            </button>

            {/* Step Content */}
            {expandedSteps.has(step.id) && (
              <div id={`step-content-${step.id}`} className="border-t border-gray-200 px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {step.documents.map((document) => (
                    <div key={document.name} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-3 mb-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <h4 className="font-medium text-gray-900">{document.name}</h4>
                      </div>
                      
                      {/* File Upload Section */}
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          Choose File
                        </label>
                            <input
                              key={inputKeys[document.name] || 0}   
                              type="file"
                              accept="application/pdf,image/*"
                              onChange={(e) =>
                                  handleDocumentFileChange(document.name, e.target.files?.[0] || null)
                              }
                          className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 
                            file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium 
                            file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />

                      </div>


                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">

                        {document.canPreview && (
                          <button
                            onClick={() => handlePreview(document.name)}
                            disabled={loadingPreviewDoc === document.name}
                            className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors disabled:opacity-50"
                            title="Preview document"
                          >
                            {loadingPreviewDoc === document.name ? (
                              <Play className="w-3 h-3 animate-spin" />
                            ) : (
                              <Play className="w-3 h-3" />
                            )}
                            <span>{loadingPreviewDoc === document.name ? "Previewing..." : "Preview"}</span>
                          </button>
                        )}
                        
                        {/* Generate Button - Only for documents that can be generated */}
                        {document.canGenerate && (
                          <button
                            onClick={() => handleGenerate(document.name)}
                            disabled={loadingGenerateDoc === document.name}
                            className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors disabled:opacity-50"
                            title="Generate document"
                          >
                            {loadingGenerateDoc === document.name ? (
                              <Play className="w-3 h-3 animate-spin" />
                            ) : (
                              <Play className="w-3 h-3" />
                            )}
                            <span>{loadingGenerateDoc === document.name ? "Generating..." : "Generate"}</span>
                          </button>
                        )}

                        {/* Upload Button - Only when file is selected */}
                        {documentFiles[document.name] && (
                        <button
                            onClick={() => handleDocumentUpload(document.name)}
                            disabled={loadingUploadDoc === document.name}
                            className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors disabled:opacity-50"
                            title="Upload selected file"
                        >
                          {loadingUploadDoc === document.name ? (
                          <>
                        <Upload className="w-3 h-3 animate-spin" />
                            <span>Uploading...</span>
                        </>
                      ) : (
                      <>
                      <Upload className="w-3 h-3" />
                    <span>Upload</span>
                      </>
                    )}
                    </button>
                  )}

                      </div>

                      {/* File Status */}
                      {documentFiles[document.name] && (
                      <div className="mt-2 text-xs text-gray-600 flex items-center justify-between">
                        <div>
                            <span className="font-medium">Selected:</span> {documentFiles[document.name]?.name}
                        </div>
                           <button
                              onClick={() => clearSelectedFile(document.name)}
                              className="ml-2 text-red-500 hover:text-red-700 text-xs"
                            >
                              ✖
                            </button>

                      </div>
                      )}


                    {uploadedDocuments[document.name] &&
      uploadedDocuments[document.name].length > 0 && (
        <div className="mt-3">
          <h5 className="text-xs font-medium text-gray-700 mb-1">
            Uploaded Files:
          </h5>
          <ul className="space-y-1">
            {uploadedDocuments[document.name].map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between text-xs bg-gray-50 px-2 py-1 rounded"
              >
                <span className="truncate">{doc.fileName}</span>
                <button
                  onClick={() => handleDownload(doc.fileId, doc.fileName)}
                  className="text-blue-600 hover:underline ml-2"
                >
                  View
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
  </div>
                  
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Upload Section
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload/View Signed Documents</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Select document type for upload"
          >
            <option value="">Select Document Type</option>
            {documentSteps.flatMap(step => step.documents).map((doc) => (
              <option key={doc.name} value={doc.name}>
                {doc.name}
              </option>
            ))}
          </select>

          <input
            type="file"
            accept="application/pdf,image/*"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            aria-label="Choose file to upload"
          />

          <button
            onClick={handleUpload}
            disabled={!selectedSession || !selectedFile || uploading}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Upload selected document"
          >
            {uploading ? (
              <>
                <Play className="w-4 h-4 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload Document</span>
              </>
            )}
          </button>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              Previously Uploaded Files for{" "}
              <span className="text-blue-700">{getDocumentNameFromSession(selectedSession)}</span>
            </h3>
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <div key={file.fileId} className="flex items-center justify-between border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{file.fileName}</span>
                  </div>
                  <button
                    onClick={() => handleDownload(file.fileId, file.fileName)}
                    className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    aria-label={`Download ${file.fileName}`}
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div> */}
    </div>
  );
}