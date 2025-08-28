import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Circle, FileText, Upload, Play } from "lucide-react";
import { fetchPdf } from "../../services/documentGeneratorService";
import { uploadDocuments, downloadDocumentById, fetchUploadedDocuments, deleteDocumentById, updateDocumentById} from "../../services/oneDriveService";
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
    label: string;
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

  const [replaceFiles, setReplaceFiles] = useState<Record<string, File | null>>({});


  const connectionId = consumer?.id?.toString();


const documentSteps: DocumentStep[] = [
    {
      id: 1,
      title: "Identity & Financial Documents",
      documents: [
        { label: "Aadhaar Card", name: "AadhaarCard", canGenerate: false, canPreview: false },
        { label: "Bank Passbook/Cancelled Cheque", name: "BankPassbook", canGenerate: false, canPreview: false },
        { label: "E-Bill", name: "Ebill", canGenerate: false, canPreview: false },
        { label: "Regular Bill", name: "Regular Bill", canGenerate: false, canPreview: false}
      ],
      isCompleted: false,
      isExpanded: true
    },
    {
      id: 2,
      title: "Quotations",
      documents: [
        { label: "Quotations", name: "Quotation", canGenerate: false, canPreview: false }
      ],
      isCompleted: false,
      isExpanded: false
    },
    {
      id: 3,
      title: "Customer Vendor Agreement",
      documents: [
        { label: "Customer Vendor Agreement", name: "Customer Vendor Agreement", canGenerate: true, canPreview: true }
      ],
      isCompleted: false,
      isExpanded: false
    },
    {
      id: 4,
      title: "Sanction Letter",
      documents: [
        { label: "Sanction Letter", name: "Sanction Letter", canGenerate: false, canPreview: false }
      ],
      isCompleted: false,
      isExpanded: false
    },
    {
      id: 5,
      title: "Meter Testing",
      documents: [
        { label: "Gen Meter Testing Letter", name: "Gen Meter Testing Letter", canGenerate: false, canPreview: false },
        { label:"Gen Meter Testing Report",name: "Gen Meter Testing Report", canGenerate: false, canPreview: false },
        { label: "Fee Receipt", name: "Fee Receipt", canGenerate: false, canPreview: false }
      ],
      isCompleted: false,
      isExpanded: false
    },
    {
      id: 6,
      title: "MNRE and Discom Documents",
      documents: [
        { label:"Net Agreement 1",name: "Net Agreement 1", canGenerate: true, canPreview: true },
        { label:"Net Agreement 2",name: "Net Agreement 2", canGenerate: true, canPreview: true },
        { label:"WCR",name: "WCR", canGenerate: true, canPreview: true },
        { label:"Annexure-I",name: "Annexure-I", canGenerate: true, canPreview: true },
        { label:"RTS Declaration",name: "RTS Declaration", canGenerate: true, canPreview: true },
        { label:"Earthing Report",name: "Earthing Report", canGenerate: true, canPreview:true },
        { label:"Geo Tag Photo",name: "Geo Tag", canGenerate: false, canPreview: false },
        { label:"D1-Form",name: "D1Form", canGenerate: false, canPreview: false },
        { label:"Vendor Feasibility",name: "Vendor Feasibility", canGenerate: true, canPreview: true },
        { label:"Digital Approval Letter",name: "Digital Approval Letter", canGenerate: false, canPreview: false },
      ],
      isCompleted: false,
      isExpanded: false
    },
    {
      id: 7,
      title: "DCR & Warranty Certificates",
      documents: [
        { label:"DCR Certificate",name: "DCR Certificate", canGenerate: false, canPreview: false },
        { label:"Inverter Warranty Certificate",name: "Inverter Warranty Certificate", canGenerate: false, canPreview: false },
        { label:"Panel Warranty Certificate",name: "Panel Warranty Certificate", canGenerate: false, canPreview: false }
      ],
      isCompleted: false,
      isExpanded: false
    },
    {
      id: 8,
      title: "Release Order",
      documents: [
        { label:"Release Order",name: "Release Order", canGenerate: false, canPreview: false }
      ],
      isCompleted: false,
      isExpanded: false
    },
    
  ];


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

  const handleDeleteDocument = async (fileId: string) => {
    try {
      await deleteDocumentById(fileId);
      toast.success("Document deleted", { autoClose: 800, hideProgressBar: true });
      await loadDocuments();
    } catch (error) {
      console.error("Delete failed", error);
      toast.error("Failed to delete document");
    }
  };

  const handleReplaceFileChange = (docId: string, file: File | null) => {
    setReplaceFiles((prev) => ({ ...prev, [docId]: file }));
  };

  const handleUpdateDocument = async (fileId: string) => {
    const file = replaceFiles[fileId];
    if (!file) return;
    try {
      await updateDocumentById(fileId, file);
      toast.success("Document updated", { autoClose: 800, hideProgressBar: true });
      setReplaceFiles((prev) => ({ ...prev, [fileId]: null }));
      await loadDocuments();
    } catch (error) {
      console.error("Update failed", error);
      toast.error("Failed to update document");
    }
  };

  const getStepStatus = (step: DocumentStep) => {
    const totalRequired = step.documents.length;
    const uploadedCount = step.documents.reduce((count, doc) => {
      const isUploaded = uploadedDocuments[doc.name] && uploadedDocuments[doc.name].length > 0;
      return count + (isUploaded ? 1 : 0);
    }, 0);

    if (uploadedCount === 0) return "pending";
    if (uploadedCount < totalRequired) return "in_progress";
    return "completed";
  };

  const getStepIcon = (step: DocumentStep) => {
    const status = getStepStatus(step);
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "in_progress":
        return <Circle className="w-5 h-5 text-yellow-500 fill-current" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStepClasses = (step: DocumentStep) => {
    const status = getStepStatus(step);
    switch (status) {
      case "completed":
        return "text-green-600 border-green-600 bg-green-50";
      case "in_progress":
        return "text-yellow-600 border-yellow-500 bg-yellow-50";
      default:
        return "text-gray-400 border-gray-300 bg-gray-50";
    }
  };

  const totalSteps = documentSteps.length;
  // Overall documents progress across all steps
  const totalDocs = documentSteps.reduce((sum, step) => sum + step.documents.length, 0);
  const completedDocs = documentSteps.reduce((sum, step) => {
    const uploadedInStep = step.documents.reduce((count, doc) => {
      const isUploaded = uploadedDocuments[doc.name] && uploadedDocuments[doc.name].length > 0;
      return count + (isUploaded ? 1 : 0);
    }, 0);
    return sum + uploadedInStep;
  }, 0);
  const progressPercent = totalDocs === 0 ? 0 : Math.round((completedDocs / totalDocs) * 100);

  // No-op to preserve existing variables without altering behavior
  const __noop = (..._args: unknown[]) => undefined;
  __noop(uploading, selectedFile, uploadedFiles, setSelectedSession, setUploading, setSelectedFile, setUploadedFiles, toggleStepExpansion);

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

      {/* Progress Bar */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm text-gray-600" aria-live="polite">{completedDocs}/{totalDocs} · {progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercent}>
          <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Vertical Stepper Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Stepper */}
        <aside className="lg:col-span-4">
          <nav aria-label="Document steps" className="space-y-2">
            {documentSteps.map((step) => {
              const status = getStepStatus(step);
              const totalRequired = step.documents.length;
              const uploadedCount = step.documents.reduce((count, doc) => {
                const isUploaded = uploadedDocuments[doc.name] && uploadedDocuments[doc.name].length > 0;
                return count + (isUploaded ? 1 : 0);
              }, 0);
              const base = 'w-full text-left p-4 border rounded-lg flex items-start gap-3 focus:outline-none focus:ring-2 focus:ring-blue-500';
              const variant =
                status === 'completed'
                  ? 'bg-green-50 border-green-200 hover:bg-green-100'
                  : status === 'in_progress'
                  ? 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
                  : 'bg-white border-gray-200 hover:bg-gray-50';
              return (
            <button
                  key={step.id}
                  type="button"
                  className={`${base} ${variant}`}
                  onClick={() => { setCurrentStep(step.id); setExpandedSteps(new Set([step.id])); }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCurrentStep(step.id); setExpandedSteps(new Set([step.id])); } }}
                  aria-current={currentStep === step.id ? 'step' : undefined}
              aria-controls={`step-content-${step.id}`}
            >
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${getStepClasses(step)}`}>
                    {getStepIcon(step)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900">Step {step.id}: {step.title}</h3>
                      {status === 'completed' && <CheckCircle className="w-4 h-4 text-green-600" aria-hidden="true" />}
                    </div>
                    {uploadedCount === 0 && (
                      <p className="text-xs text-gray-600">{totalRequired} document{totalRequired !== 1 ? 's' : ''} required</p>
                    )}
                    {uploadedCount > 0 && uploadedCount < totalRequired && (
                      <p className="text-xs text-yellow-700">{uploadedCount} of {totalRequired} documents uploaded</p>
                    )}
                    {uploadedCount === totalRequired && (
                      <p className="text-xs text-green-700">All documents uploaded</p>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right: Active Step Content */}
        <section className="lg:col-span-8">
          {(() => {
            const activeStep = documentSteps.find((s) => s.id === currentStep) || documentSteps[0];
            return (
              <div id={`step-content-${activeStep.id}`} className="bg-white border border-gray-200 shadow-sm rounded-lg" aria-expanded={expandedSteps.has(activeStep.id)}>
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Step {activeStep.id}: {activeStep.title}</h2>
                  <p className="text-sm text-gray-600">Upload, generate, and manage documents for this step.</p>
                </div>
                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                    {activeStep.documents.map((document) => (
                    <div key={document.name} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-3 mb-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <h4 className="font-medium text-gray-900">{document.label}</h4>
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
                            className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
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

                        {uploadedDocuments[document.name] && uploadedDocuments[document.name].length > 0 && (
        <div className="mt-3">
                            <h5 className="text-xs font-medium text-gray-700 mb-1">Uploaded Files:</h5>
          <ul className="space-y-1">
            {uploadedDocuments[document.name].map((doc) => (
                                <li key={doc.id} className="text-xs bg-gray-50 px-2 py-2 rounded">
                <div className="flex items-center justify-between">
                  <span className="truncate">{doc.fileName}</span>
                  <div className="flex gap-2">
                    <button onClick={() => handleDownload(doc.fileId, doc.fileName)} className="text-blue-600 hover:underline ml-2">View</button>
                    {document.name === 'Quotations' && (
                      <>
                        <button onClick={() => handleDeleteDocument(doc.fileId)} className="text-red-600 hover:underline">Delete</button>
                      </>
                    )}
                  </div>
                </div>
                {document.name === 'Quotations' && (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={(e) => handleReplaceFileChange(doc.fileId, e.target.files?.[0] || null)}
                      className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={() => handleUpdateDocument(doc.fileId)}
                      className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 disabled:opacity-50"
                      disabled={!replaceFiles[doc.fileId]}
                    >
                      Replace
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
  </div>
                  ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </section>
      </div>

     
    </div>
  );
}