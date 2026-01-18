import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Circle, FileText, Upload, Play, Download, Trash2, Pencil } from "lucide-react";
import IconButton from "../../components/ui/IconButton";
import { buildAcceptAttribute, isFileAllowed, buildAllowedOnlyMessage, kbToBytes, isFileSizeWithin, buildMaxSizeMessage } from "../../utils/fileValidation";
import { fetchPdf } from "../../services/documentGeneratorService";
import { uploadDocuments, downloadDocumentById, fetchUploadedDocuments, deleteDocumentById, updateDocumentById } from "../../services/documentManagerService";
import { checkIsConnectionOnboarded, saveSanctionDetails } from "../../services/customerRequisitionService";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert } from '@mui/material';
import { toast } from 'react-toastify';
import { formatFileName } from "../../utils/formatFileName";
import pdfToText from "react-pdftotext";


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
  id: string;
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
    fileExtensions?: string[]; // e.g., ['pdf'] or ['jpeg','jpg','png']
    fileMimeTypes?: string[]; // e.g., ['application/pdf'] or ['image/jpeg','image/png']
    maxBytes?: number; // optional max size in bytes
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
  const [, setSelectedSession] = useState<string>("");
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

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogAction, setDialogAction] = useState<(() => void) | null>(null);

  const [quotedTotals, setQuotedTotals] = useState<Record<string, number | ''>>({});
  const [isConnectionOnboarded, setIsConnectionOnboarded] = useState<boolean>(false);
  const [fileSizeError, setFileSizeError] = useState<Record<string, boolean>>({});

  const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 1 MB

  const connectionId = consumer?.id?.toString();

  const userInfo = JSON.parse(localStorage.getItem("selectedOrg") || "{}");
  const userRoleFromLocalStorage = userInfo?.role;

  const [, setSanctionNo] = useState<string | null>(null);
  const [, setSanctionDate] = useState<string | null>(null);


  // Documents that require material data (module, inverter, installation)
  const documentsRequiringMaterialData = [
    "Net Agreement",
    "WCR",
    "Annexure-I",
    "RTS Declaration",
    "Earthing Report",
    "Vendor Feasibility",
    "Consumer Vendor Agreement",
    "Gen Meter Testing Letter"
  ];

  
  // const checkMaterialDataExists = async (connectionId: number): Promise<boolean> => {
  //   try {
  //     const [module, inverter, installation] = await Promise.all([
  //       fetchModule(connectionId),
  //       fetchInverter(connectionId),
  //       fetchInstallation(connectionId)
  //     ]);

  //     // Return true only if all three exist (not null)
  //     return module !== null && inverter !== null && installation !== null;
  //   } catch (error) {
  //     console.error("Error checking material data:", error);
  //     return false;
  //   }
  // };


  const documentSteps: DocumentStep[] = [
    {
      id: 1,
      title: "Identity & Financial Documents",
      documents: [
        { label: "Aadhaar Card", name: "AadhaarCard", canGenerate: false, canPreview: false },
        { label: "Bank Passbook/Cancelled Cheque", name: "BankPassbook", canGenerate: false, canPreview: false },
        { label: "Downloaded Electricity Bill", name: "Ebill", canGenerate: false, canPreview: false, fileExtensions: ["pdf"], fileMimeTypes: ["application/pdf"] },
        { label: "Scanned Electricity Bill", name: "Regular Bill", canGenerate: false, canPreview: false, fileExtensions: ["jpeg", "jpg", "png"], fileMimeTypes: ["image/jpeg", "image/png", "image/jpg"] }
      ],
      isCompleted: false,
      isExpanded: true
    },
    {
      id: 2,
      title: "Quotations",
      documents: [
        { label: "Unsigned/Proposed Quotations", name: "Unsigned Quotation", canGenerate: false, canPreview: false },
        { label: "Signed/Accepted Quotation", name: "Signed Quotation", canGenerate: false, canPreview: false }
      ],
      isCompleted: false,
      isExpanded: false
    },
    {
      id: 3,
      title: "Consumer Vendor Agreement",
      documents: [
        { label: "Consumer Vendor Agreement (Draft)", name: "Consumer Vendor Agreement Draft", canGenerate: true, canPreview: true },
        { label: "Consumer Vendor Agreement (Signed)", name: "Consumer Vendor Agreement Signed", canGenerate: false, canPreview: false }
      ],
      isCompleted: false,
      isExpanded: false
    },
    {
      id: 4,
      title: "Sanction Letter",
      documents: [
        { label: "Sanction Letter", name: "Sanction Letter", canGenerate: false, canPreview: false, fileExtensions: ["pdf"], fileMimeTypes: ["application/pdf"], maxBytes: kbToBytes(50) }
      ],
      isCompleted: false,
      isExpanded: false
    },
    {
      id: 5,
      title: "Meter Testing",
      documents: [
        { label: "Gen Meter Testing Letter", name: "Gen Meter Testing Letter", canGenerate: true, canPreview: true },
        { label: "Gen Meter Testing Report", name: "Gen Meter Testing Report", canGenerate: false, canPreview: false },
        { label: "Fee Receipt", name: "Fee Receipt", canGenerate: false, canPreview: false }
      ],
      isCompleted: false,
      isExpanded: false
    },
    {
      id: 6,
      title: "Installation",
      documents: [
        { label: "Panel Serial Number Photos", name: "Panel SN", canGenerate: false, canPreview: false },
        { label: "Inverter Serial Number Photo", name: "Inverter SN", canGenerate: false, canPreview: false },
        { label: "MCB", name: "MCB", canGenerate: false, canPreview: false },
        { label: "RCCB", name: "RCCB", canGenerate: false, canPreview: false }
      ],
      isCompleted: false,
      isExpanded: false
    },
    {
      id: 7,
      title: "MNRE and Discom Documents",
      documents: [
        { label: "WCR (Draft)", name: "WCR Draft", canGenerate: true, canPreview: true },
        { label: "WCR (Signed)", name: "WCR Signed", canGenerate: false, canPreview: false },
        { label: "Net Agreement (Draft)", name: "Net Agreement Draft", canGenerate: true, canPreview: true },
        { label: "Net Agreement (Signed)", name: "Net Agreement Signed", canGenerate: false, canPreview: false },
        { label: "Annexure-I (Draft)", name: "Annexure-I Draft", canGenerate: true, canPreview: true },
        { label: "Annexure-I (Signed)", name: "Annexure-I Signed", canGenerate: false, canPreview: false },
        { label: "RTS Declaration (Draft)", name: "RTS Declaration Draft", canGenerate: true, canPreview: true },
        { label: "RTS Declaration (Signed)", name: "RTS Declaration Signed", canGenerate: false, canPreview: false },
        { label: "Earthing Report", name: "Earthing Report", canGenerate: true, canPreview: true },
        { label: "Geo Tag Photo", name: "Geo Tag", canGenerate: false, canPreview: false, fileExtensions: ["jpeg", "jpg", "png"], fileMimeTypes: ["image/jpeg", "image/png", "image/jpg"] },
        { label: "D1-Form", name: "D1Form", canGenerate: false, canPreview: false },
        { label: "Vendor Feasibility", name: "Vendor Feasibility", canGenerate: true, canPreview: true },
        { label: "Digital Approval Letter", name: "Digital Approval Letter", canGenerate: false, canPreview: false },
      ],
      isCompleted: false,
      isExpanded: false
    },
    {
      id: 8,
      title: "DCR & Warranty Certificates",
      documents: [
        { label: "DCR Certificate", name: "DCR Certificate", canGenerate: false, canPreview: false },
        { label: "Inverter Warranty Certificate", name: "Inverter Warranty Certificate", canGenerate: false, canPreview: false },
        { label: "Panel Warranty Certificate", name: "Panel Warranty Certificate", canGenerate: false, canPreview: false }
      ],
      isCompleted: false,
      isExpanded: false
    },
    {
      id: 9,
      title: "Release Order",
      documents: [
        { label: "Release Order", name: "Release Order", canGenerate: false, canPreview: false }
      ],
      isCompleted: false,
      isExpanded: false
    },
  ];

  // Filter steps based on role
  let visibleSteps = documentSteps;

  if (
    userRoleFromLocalStorage === "ROLE_OR_REPRESENTATIVE" ||
    userRoleFromLocalStorage === "ROLE_AGENCY_REPRESENTATIVE"
  ) {
    visibleSteps = documentSteps.filter(
      (step) => step.title === "Identity & Financial Documents"
    );
  }

  const extractSanctionNo = async (blob: Blob) => {
    try {
      const text = await pdfToText(blob);

      const sanctionMatch = text.match(
        /Sanction\s*No\s*[:\-]?\s*([\s\S]*?)(?=\s*Date\s*:)/i
      );

      const dateMatch = text.match(
        /Date\s*[:\-]?\s*([0-9]{1,2}-[A-Za-z]{3}-[0-9]{4})/i
      );

      return {
        sanctionNo: sanctionMatch ? sanctionMatch[1].trim() : null,
        sanctionDate: dateMatch ? dateMatch[1].trim() : null,
      };
    } catch (err) {
      console.error("Failed to extract data:", err);
      return { sanctionNo: null, sanctionDate: null };
    }
  };



  const [hasSanctionLetter, setHasSanctionLetter] = useState(false);



  const loadDocuments = useCallback(async () => {
    try {
      const data = await fetchUploadedDocuments(connectionId);

      const grouped = data.reduce((acc: Record<string, any[]>, doc: any) => {
        if (!acc[doc.documentType]) acc[doc.documentType] = [];
        acc[doc.documentType].push(doc);
        return acc;
      }, {});

      setUploadedDocuments(grouped);

      // Check if sanction letter uploaded
      const sanctionDocs = grouped["Sanction Letter"];
      setHasSanctionLetter(!!sanctionDocs?.length);

      if (sanctionDocs?.length) {
        const blob = await downloadDocumentById(sanctionDocs[0].id);

        // extract { sanctionNo, date }
        const { sanctionNo, sanctionDate } = await extractSanctionNo(blob);

        // Set state
        setSanctionNo(sanctionNo);
        setSanctionDate(sanctionDate);

        console.log("Sanction No:", sanctionNo);
        console.log("Sanction Date:", sanctionDate);

        if (sanctionNo && sanctionDate) {
          await saveSanctionDetails(connectionId, sanctionNo, sanctionDate);
        }
      }


    } catch (error) {
      console.error("Failed to fetch documents", error);
    }
  }, [connectionId]);

  useEffect(() => {
    if (connectionId) {
      loadDocuments();
    }
  }, [connectionId, loadDocuments]);


  useEffect(() => {
    const checkOnboardedStatus = async () => {
      if (consumer?.id) {
        try {
          const isOnboarded = await checkIsConnectionOnboarded(consumer.id);
          setIsConnectionOnboarded(isOnboarded);
        } catch (error) {
          console.error("Error checking connection onboarded status:", error);
          setIsConnectionOnboarded(false);
        }
      }
    };

    checkOnboardedStatus();
  }, [consumer?.id]);


  const handleDownload = async (id: number, fileName: string) => {
    try {
      const blob = await downloadDocumentById(id);
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download file", {
        autoClose: 1000,
        hideProgressBar: true
      })
    }
  };


  const proceedWithGenerate = async (doc: string) => {
    if (!consumer?.id) return;

    let quotedTotal: number | undefined;
    if (doc === "Consumer Vendor Agreement Draft") {
      quotedTotal = quotedTotals[doc];
      if (!quotedTotal || isNaN(quotedTotal)) {
        toast.error("Please enter a valid quoted total amount before generating.", {
          autoClose: 1000,
          hideProgressBar: true
        });
        return;
      }
    }

    setLoadingGenerateDoc(doc);
    try {
      const blob = await fetchPdf(consumer.id, doc, quotedTotal);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc}_${consumer.govIdName}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Generate error:", err);
      toast.error("Failed to generate document", {
        autoClose: 1000,
        hideProgressBar: true
      });
    } finally {
      setLoadingGenerateDoc(null);
    }
  };

  const handleGenerate = async (doc: string) => {
    if (!consumer?.id) return;

    // Check if this document requires material data
    // if (documentsRequiringMaterialData.includes(doc)) {
    //   const hasMaterialData = await checkMaterialDataExists(consumer.id);
    //   if (!hasMaterialData) {
    //     setPendingDocAction({ type: 'generate', doc });
    //     setMaterialDataDialogOpen(true);
    //     return;
    //   }
    // }

    await proceedWithGenerate(doc);
  };


  const proceedWithPreview = async (doc: string) => {
    if (!consumer?.id) return;

    let quotedTotal: number | undefined;
    if (doc === "Consumer Vendor Agreement Draft") {
      quotedTotal = quotedTotals[doc];
      if (!quotedTotal || isNaN(quotedTotal)) {
        toast.error("Please enter a valid quoted total amount before previewing.", {
          autoClose: 1000,
          hideProgressBar: true
        });
        return;
      }
    }

    setLoadingPreviewDoc(doc);
    try {
      const blob = await fetchPdf(consumer.id, doc, quotedTotal);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      console.error("Preview error:", err);
      toast.error("Failed to preview document", {
        autoClose: 1000,
        hideProgressBar: true
      });
    } finally {
      setLoadingPreviewDoc(null);
    }
  };

  const handlePreview = async (doc: string) => {
    if (!consumer?.id) return;

    // Check if this document requires material data
    // if (documentsRequiringMaterialData.includes(doc)) {
    //   const hasMaterialData = await checkMaterialDataExists(consumer.id);
    //   if (!hasMaterialData) {
    //     setPendingDocAction({ type: 'preview', doc });
    //     setMaterialDataDialogOpen(true);
    //     return;
    //   }
    // }

    await proceedWithPreview(doc);
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

    setFileSizeError((prev) => ({
      ...prev,
      [docName]: false,
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
      toast.error("Document Upload Failed!", { autoClose: 1000, hideProgressBar: true });
    } finally {
      setLoadingUploadDoc(null);
    }
  };



  const toggleStepExpansion = (stepId: number) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      const wasExpanded = newSet.has(stepId);
      if (wasExpanded) {
        // If already expanded, allow toggling to collapse
        newSet.delete(stepId);
      } else {
        // If not expanded, expand it and scroll to it on mobile
        newSet.clear();
        newSet.add(stepId);
        // On mobile, scroll to the expanded step content
        setTimeout(() => {
          const element = document.getElementById(`step-content-mobile-${stepId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
          }
        }, 100);
      }
      return newSet;
    });
  };

  const handleDeleteDocument = async (id: number, documentType: string) => {
    try {

      await deleteDocumentById(id);

      setUploadedDocuments((prev) => {
        const currentList = prev[documentType] || [];
        const updatedList = currentList.filter((d: any) => d.id !== id);
        return { ...prev, [documentType]: updatedList };
      });

      await loadDocuments();

      toast.success("Document deleted", { autoClose: 1000, hideProgressBar: true });

    } catch (error) {
      console.error("Delete failed", error);
      toast.error("Failed to delete document", {
        autoClose: 1000,
        hideProgressBar: true
      });
      await loadDocuments();
    }
  };


  const handleReplaceFileChange = (docId: string, file: File | null) => {
    setReplaceFiles((prev) => ({ ...prev, [docId]: file }));
  };

  const handleUpdateDocument = async (id: number) => {
    const file = replaceFiles[id];
    if (!file) return;
    try {
      setLoadingUploadDoc(id);

      await updateDocumentById(id, file);
      toast.success("Document updated", { autoClose: 800, hideProgressBar: true });
      setReplaceFiles((prev) => ({ ...prev, [id]: null }));
      await loadDocuments();
    } catch (error) {
      console.error("Update failed", error);
      toast.error("Failed to update document", {
        autoClose: 1000,
        hideProgressBar: true
      });
    } finally {
      // Stop spinner
      setLoadingUploadDoc(null);
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

  const isRepresentative =
    userRoleFromLocalStorage === "ROLE_ORG_REPRESENTATIVE" ||
    userRoleFromLocalStorage === "ROLE_AGENCY_REPRESENTATIVE";

  // const totalSteps = documentSteps.length;
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

  const formatFileTail = (fileName: string, keep: number = 18): string => {
    if (!fileName) return "";
    const dotIndex = fileName.lastIndexOf('.')
    const base = dotIndex > 0 ? fileName.substring(0, dotIndex) : fileName;
    const ext = dotIndex > 0 ? fileName.substring(dotIndex) : '';
    const suffix = base.length > keep ? base.slice(-keep) : base;
    return `${base.length > keep ? '…' : ''}${suffix}${ext}`;
  };



  // Render step content - reusable for both mobile and desktop
  const renderStepContent = (step: DocumentStep, contentId?: string) => (
    <div
      id={contentId || `step-content-${step.id}`}
      className="bg-white border border-gray-200 shadow-sm rounded-lg"
      aria-expanded={expandedSteps.has(step.id)}
    >
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          {userRoleFromLocalStorage === "ROLE_ORG_REPRESENTATIVE" ||
            userRoleFromLocalStorage === "ROLE_AGENCY_REPRESENTATIVE"
            ? step.title
            : `Step ${step.id}: ${step.title}`}
        </h2>
        <p className="text-sm text-gray-600">Upload, generate, and manage documents for this step.</p>
      </div>
      <div className="px-6 py-4">
        <div
          className={`grid gap-4 ${isRepresentative ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-2"
            }`}
        >
          {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4"></div> */}
          {step.documents.map((docDef) => {

            const isSanction = docDef.name === "Sanction Letter";
            const sanctionUploaded = isSanction && hasSanctionLetter;

            return (
              <div key={docDef.name} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3 mb-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium text-gray-900">{docDef.label}</h4>
                </div>

                {/* File Upload Section */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Choose File
                  </label>

                  <input
                    key={inputKeys[docDef.name] || 0}
                    type="file"
                    disabled={sanctionUploaded}
                    title={sanctionUploaded ? "You can upload only one sanction letter" : ""}
                    accept={docDef.fileExtensions?.length ? buildAcceptAttribute(docDef.fileExtensions) : 'application/pdf,image/*'}
                    onChange={(e) => {
                      if (sanctionUploaded) return;

                      const file = e.target.files?.[0] || null;
                      if (file) {
                        // Check for file type validation
                        if (docDef.fileExtensions?.length || docDef.fileMimeTypes?.length) {
                          const typeOk = isFileAllowed(file, { mimeTypes: docDef.fileMimeTypes, extensions: docDef.fileExtensions });
                          if (!typeOk) {
                            toast.error(buildAllowedOnlyMessage(docDef.label, docDef.fileExtensions || []));
                            setInputKeys((prev) => ({ ...prev, [docDef.name]: Date.now() }));
                            setFileSizeError((prev) => ({ ...prev, [docDef.name]: true })); // Set error for UI
                            return;
                          }
                        }
                        // Check for file size validation (1MB limit)
                        if (file.size > MAX_FILE_SIZE_BYTES) {
                          toast.error(`You can't upload file greater than 1 MB`, {
                            hideProgressBar: true,
                          });
                          setInputKeys((prev) => ({ ...prev, [docDef.name]: Date.now() }));
                          setFileSizeError((prev) => ({ ...prev, [docDef.name]: true }));
                          return;
                        }
                        // Existing maxBytes validation (if defined for the document)
                        if (docDef.maxBytes && !isFileSizeWithin(file, docDef.maxBytes)) {
                          toast.error(buildMaxSizeMessage(docDef.label, docDef.maxBytes));
                          setInputKeys((prev) => ({ ...prev, [docDef.name]: Date.now() }));
                          setFileSizeError((prev) => ({ ...prev, [docDef.name]: true }));
                          return;
                        }
                        setFileSizeError((prev) => ({ ...prev, [docDef.name]: false })); // Clear any previous error
                      }
                      handleDocumentFileChange(docDef.name, file);
                    }}
                    className={`w-full text-xs border border-gray-300 rounded px-2 py-1
    ${sanctionUploaded ? "bg-gray-100 opacity-60 cursor-not-allowed" : ""}
    focus:ring-1 focus:ring-blue-500 focus:border-blue-500
    file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs
    file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100
  `}
                  />
                </div>

                {docDef.name === "Consumer Vendor Agreement Draft" && (
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Total Quoted Price (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Enter total quoted Price"
                      value={quotedTotals[docDef.name] || ''}
                      onChange={(e) =>
                        setQuotedTotals((prev) => ({
                          ...prev,
                          [docDef.name]: e.target.value ? parseFloat(e.target.value) : '',
                        }))
                      }
                      className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">

                  {docDef.canPreview && (
                    <button
                      onClick={() => handlePreview(docDef.name)}
                      disabled={loadingPreviewDoc === docDef.name}
                      className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors disabled:opacity-50"
                      title="Preview document"
                    >
                      {loadingPreviewDoc === docDef.name ? (
                        <Play className="w-3 h-3 animate-spin" />
                      ) : (
                        <Play className="w-3 h-3" />
                      )}
                      <span>{loadingPreviewDoc === docDef.name ? "Previewing..." : "Preview"}</span>
                    </button>
                  )}

                  {docDef.canGenerate && (
                    <button
                      onClick={() => handleGenerate(docDef.name)}
                      disabled={loadingGenerateDoc === docDef.name}
                      className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors disabled:opacity-50"
                      title="Generate document"
                    >
                      {loadingGenerateDoc === docDef.name ? (
                        <Play className="w-3 h-3 animate-spin" />
                      ) : (
                        <Play className="w-3 h-3" />
                      )}
                      <span>{loadingGenerateDoc === docDef.name ? "Generating..." : "Generate"}</span>
                    </button>
                  )}

                  {documentFiles[docDef.name] && (
                    <button
                      onClick={() => handleDocumentUpload(docDef.name)}
                      disabled={loadingUploadDoc === docDef.name || fileSizeError[docDef.name]}
                      className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors disabled:opacity-50"
                      title="Upload selected file"
                    >
                      {loadingUploadDoc === docDef.name ? (
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

                {documentFiles[docDef.name] && (
                  <div className="mt-2 text-xs text-gray-600 flex items-center">
                    <span className="font-medium mr-1">Selected:</span>
                    <span className="truncate flex-1">
                      {documentFiles[docDef.name]?.name ? formatFileName(documentFiles[docDef.name]!.name as string, 40) : ''}
                    </span>
                    <button
                      onClick={() => clearSelectedFile(docDef.name)}
                      className="ml-2 text-red-500 hover:text-red-700 text-xs flex-shrink-0"
                    >
                      ✖
                    </button>
                  </div>
                )}




                {uploadedDocuments[docDef.name] && uploadedDocuments[docDef.name].length > 0 && (
                  <div className="mt-3">
                    <h5 className="text-xs font-medium text-gray-700 mb-1">Uploaded Files:</h5>
                    <ul className="space-y-1">
                      {uploadedDocuments[docDef.name].map((doc) => (
                        <li key={doc.id} className="text-xs bg-gray-50 px-2 py-2 rounded">

                          <div className="mb-2">
                            {/* Row with filename + actions */}
                            <div className="flex items-center">
                              <span className="flex-1 truncate" title={doc.fileName}>
                                {formatFileTail(doc.fileName, 18)}
                              </span>

                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {/* Hidden file input for Update */}
                                <input
                                  id={`update-input-${doc.id}`}
                                  type="file"
                                  accept={docDef.fileExtensions?.length ? buildAcceptAttribute(docDef.fileExtensions) : 'application/pdf,image/*'}
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    if (!file) return;
                                    if (docDef.fileExtensions?.length || docDef.fileMimeTypes?.length) {
                                      const ok = isFileAllowed(file, { mimeTypes: docDef.fileMimeTypes, extensions: docDef.fileExtensions });
                                      if (!ok) {
                                        toast.error(buildAllowedOnlyMessage(docDef.label, docDef.fileExtensions || []));
                                        e.currentTarget.value = '';
                                        return;
                                      }
                                    }
                                    if (docDef.maxBytes && !isFileSizeWithin(file, docDef.maxBytes)) {
                                      toast.error(buildMaxSizeMessage(docDef.label, docDef.maxBytes));
                                      e.currentTarget.value = '';
                                      return;
                                    }
                                    handleReplaceFileChange(doc.id, file);
                                    e.currentTarget.value = "";
                                  }}
                                />

                                {/* View */}
                                <IconButton
                                  aria-label={`View ${doc.fileName}`}
                                  title="Download"
                                  size="sm"
                                  variant="outline"
                                  className="bg-white border border-gray-200 text-blue-600 hover:bg-blue-50"
                                  icon={<Download className="w-4 h-4" />}
                                  onClick={() => handleDownload(doc.id, doc.fileName)}
                                />

                                {/* Update */}
                                <IconButton
                                  aria-label={`Update ${doc.fileName}`}
                                  title="Update"
                                  size="sm"
                                  variant="outline"
                                  className="bg-white border border-gray-200 text-amber-600 hover:bg-amber-50"
                                  icon={<Pencil className="w-4 h-4" />}
                                  onClick={() => {
                                    setDialogMessage(`Do you want to replace the current file?`);
                                    setDialogAction(() => () => {
                                      const input = document.getElementById(
                                        `update-input-${doc.id}`
                                      ) as HTMLInputElement | null;
                                      input?.click();
                                    });
                                    setDialogOpen(true);
                                  }}
                                />

                                {/* Delete */}
                                <IconButton
                                  aria-label={`Delete ${doc.fileName}`}
                                  title="Delete"
                                  size="sm"
                                  variant="outline"
                                  className="bg-white border border-gray-200 text-rose-600 hover:bg-rose-50"
                                  icon={<Trash2 className="w-4 h-4" />}
                                  onClick={() => {
                                    setDialogMessage(`Do you really want to delete the file?`);
                                    setDialogAction(() => () => handleDeleteDocument(doc.id, docDef.name));
                                    setDialogOpen(true);
                                  }}
                                />
                              </div>
                            </div>

                            {replaceFiles[doc.id] && (
                              <div className="mt-2 text-xs text-gray-600 flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <span className="font-medium">Selected:</span>{" "}
                                  <span className="truncate inline-block max-w-[180px] align-bottom">
                                    {replaceFiles[doc.id]?.name}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 flex-shrink-0">
                                  <button
                                    onClick={() => handleUpdateDocument(doc.id)}
                                    disabled={loadingUploadDoc === doc.id}
                                    className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition-colors disabled:opacity-50"
                                    title="Update selected file"
                                  >
                                    {loadingUploadDoc === doc.id ? (
                                      <>
                                        <Upload className="w-3 h-3 animate-spin" />
                                        <span className="truncate max-w-[80px]">Updating...</span>
                                      </>
                                    ) : (
                                      <>
                                        <Upload className="w-3 h-3" />
                                        <span>Update</span>
                                      </>
                                    )}
                                  </button>

                                  <button
                                    onClick={() =>
                                      setReplaceFiles((prev) => ({ ...prev, [doc.id]: null }))
                                    }
                                    className="ml-2 text-red-500 hover:text-red-700 text-xs"
                                  >
                                    ✖
                                  </button>
                                </div>
                              </div>

                            )}
                          </div>

                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => navigate(-1)}
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
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Consumer Information</h2>
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
              <span className="ml-2 text-gray-800 break-all">{consumer.emailAddress || "—"}</span>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {(!(userInfo?.role === "ROLE_ORG_REPRESENTATIVE" || userInfo?.role === "ROLE_AGENCY_REPRESENTATIVE") && <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm text-gray-600" aria-live="polite">{completedDocs}/{totalDocs} · {progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercent}>
          <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>)}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {(() => {
          const userInfo = JSON.parse(localStorage.getItem("selectedOrg") || "{}");
          const userRoleFromLocalStorage = userInfo?.role;

          const isRepresentative =
            userRoleFromLocalStorage === "ROLE_ORG_REPRESENTATIVE" ||
            userRoleFromLocalStorage === "ROLE_AGENCY_REPRESENTATIVE";

          // Filter visible steps
          let visibleSteps = documentSteps;
          if (isRepresentative) {
            visibleSteps = documentSteps.filter(
              (step) => step.title === "Identity & Financial Documents"
            );
          }

          if (isRepresentative) {
            // 👇 Directly show documents (hide sidebar)
            const identityStep = visibleSteps[0];
            return (
              <section className="col-span-12">
                {renderStepContent(identityStep)}
              </section>
            );
          }

          // 👇 Regular layout (sidebar + right section)
          return (
            <>
              <aside className="lg:col-span-4">
                <nav aria-label="Document steps" className="space-y-2">
                  {visibleSteps.map((step) => {
                    const status = getStepStatus(step);
                    const totalRequired = step.documents.length;
                    const uploadedCount = step.documents.reduce((count, doc) => {
                      const isUploaded =
                        uploadedDocuments[doc.name] &&
                        uploadedDocuments[doc.name].length > 0;
                      return count + (isUploaded ? 1 : 0);
                    }, 0);

                    const base =
                      "w-full text-left p-4 border rounded-lg flex items-start gap-3 focus:outline-none focus:ring-2 focus:ring-blue-500";
                    const variant =
                      status === "completed"
                        ? "bg-green-50 border-green-200 hover:bg-green-100"
                        : status === "in_progress"
                          ? "bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
                          : "bg-white border-gray-200 hover:bg-gray-50";

                    const isStepDisabled =
                      (step.id >= 3 && !isConnectionOnboarded) ||   // Rule 1: onboarding not done
                      (step.id > 4 && !hasSanctionLetter);         // Rule 2: sanction letter missing


                    const disabledClasses = isStepDisabled ? "opacity-50 cursor-not-allowed" : "";

                    return (
                      <div key={step.id} className="space-y-2">
                        <button
                          type="button"
                          className={`${base} ${variant} ${disabledClasses}`}
                          onClick={() => {
                            if (!isStepDisabled) {
                              setCurrentStep(step.id);
                              toggleStepExpansion(step.id);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              if (!isStepDisabled) {
                                setCurrentStep(step.id);
                                toggleStepExpansion(step.id);
                              }
                            }
                          }}
                          disabled={isStepDisabled}
                          aria-current={currentStep === step.id ? "step" : undefined}
                          aria-controls={`step-content-${step.id} step-content-mobile-${step.id}`}
                          aria-expanded={expandedSteps.has(step.id)}
                          title={
                            isStepDisabled
                              ? step.id > 4 && !hasSanctionLetter
                                ? "Upload the Sanction Letter to access this step."
                                : "This step is disabled. Connection must be onboarded to access steps 3 and above."
                              : undefined
                          }
                        >
                          <div
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${getStepClasses(
                              step
                            )}`}
                          >
                            {getStepIcon(step)}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-semibold text-gray-900">
                                Step {step.id}: {step.title}
                              </h3>
                              {status === "completed" && (
                                <CheckCircle
                                  className="w-4 h-4 text-green-600"
                                  aria-hidden="true"
                                />
                              )}
                            </div>

                            {uploadedCount === 0 && (
                              <p className="text-xs text-gray-600">
                                {totalRequired} document
                                {totalRequired !== 1 ? "s" : ""} required
                              </p>
                            )}
                            {uploadedCount > 0 && uploadedCount < totalRequired && (
                              <p className="text-xs text-yellow-700">
                                {uploadedCount} of {totalRequired} documents uploaded
                              </p>
                            )}
                            {uploadedCount === totalRequired && (
                              <p className="text-xs text-green-700">
                                All documents uploaded
                              </p>
                            )}
                          </div>
                        </button>

                        {/* Mobile: Show step content inline below button when expanded */}
                        {expandedSteps.has(step.id) && (
                          <div
                            id={`step-content-mobile-${step.id}`}
                            className="lg:hidden"
                          >
                            {renderStepContent(step, `step-content-mobile-${step.id}`)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </nav>
              </aside>

              {/* Right: Active Step Content (Desktop only) */}
              <section className="hidden lg:block lg:col-span-8">
                <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4
                  max-h-[90vh] overflow-y-auto">
                {(() => {
                  const activeStep =
                    documentSteps.find((s) => s.id === currentStep) ||
                    documentSteps[0];
                  const isActiveStepDisabled = activeStep.id >= 3 && !isConnectionOnboarded;

                  if (isActiveStepDisabled) {

                    const fallbackStep = documentSteps.find((s) => s.id < 3) || documentSteps[0];
                    return (
                      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
                        <div className="text-center py-8">
                          <p className="text-gray-600 mb-4">
                            This step is disabled. Connection must be onboarded to access steps 3 and above.
                          </p>
                          <button
                            onClick={() => {
                              setCurrentStep(fallbackStep.id);
                              toggleStepExpansion(fallbackStep.id);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            Go to Step {fallbackStep.id}: {fallbackStep.title}
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return renderStepContent(activeStep);
                })()}
                </div>
              </section>
            </>
          );
        })()}

        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Confirm</DialogTitle>
          <DialogContent dividers>
            <Alert severity="info">{dialogMessage}</Alert>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setDialogOpen(false);
                setDialogAction(null); // cancel
              }}
            >
              No
            </Button>
            <Button
              onClick={() => {
                setDialogOpen(false);
                if (dialogAction) dialogAction();
              }}
              autoFocus
            >
              Yes
            </Button>
          </DialogActions>
        </Dialog>

      </div>




    </div>
  );
}