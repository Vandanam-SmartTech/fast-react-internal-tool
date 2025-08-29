import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getInstallationByConsumerId, updateInstallationSpaceDetails, fetchInstallationSpaceTypesNames } from "../../services/customerRequisitionService";
import { fetchClaims } from "../../services/jwtService";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert } from '@mui/material';
import {
  UserCircleIcon,
  BoltIcon,
  HomeModernIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid";
import { toast } from "react-toastify";

export const EditInstallation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const connectionId = location.state?.connectionId || null;
  const customerId = location.state?.customerId || null;
  const consumerId = location.state?.consumerId || null;
  const installationId = location.state?.installationId || null;

  const [installation, setInstallation] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("Installation Details");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"error" | "confirm" | "success">("success");
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogAction, setDialogAction] = useState<(() => void) | null>(null);

  const [installationSpaceTypes, setInstallationSpaceTypes] = useState<{ id: number; nameEnglish: string }[]>([]);

    const tabs = [
    "Customer Details",
    "Connection Details",
    "Installation Details",
    "System Specifications",
  ];

  const [formData, setFormData] = useState<any>({
    acWireLengthFt: '',
    dcWireLengthFt: '',
    earthingWireLengthFt: NaN,
    numberOfGpPipes: NaN,
    descriptionOfInstallation: '',
    availableSouthNorthLengthFt: '',
    availableEastWestLengthFt: '',
    installationSpaceTypeId:1,
    installationSpaceTitle:'',
    customInstallationSpaceTitle:'',
  });

      useEffect(() => {
          const getInstallationSpaceTypesNames = async () => {
            try {
              const data = await fetchInstallationSpaceTypesNames();
              setInstallationSpaceTypes(data);
            } catch (error) {
              console.error("Failed to fetch connection types", error);
            }
          };
        
          getInstallationSpaceTypesNames();
        }, []);
  

  useEffect(() => {
    const fetchInstallation = async () => {
      if (consumerId && installationId) {
        const data = await getInstallationByConsumerId(Number(consumerId));
        if (data && Array.isArray(data)) {
          const selectedInstallation = data.find(inst => inst.id === Number(installationId));
          if (selectedInstallation) {
            setInstallation(selectedInstallation);
            console.log("selected installation:",selectedInstallation);

             // Define known options
          const knownTitles = [
            "At center",
            "At SW corner",
            "At SE corner",
            "At NW corner",
            "At NE corner",
            "At East side",
            "At West side",
            "At North side",
            "At South side",
          ];

          const isCustomTitle = !knownTitles.includes(selectedInstallation.installationSpaceTitle);
            setFormData({
              acWireLengthFt: selectedInstallation.acWireLengthFt || '',
              dcWireLengthFt: selectedInstallation.dcWireLengthFt || '',
              earthingWireLengthFt: selectedInstallation.earthingWireLengthFt || '',
              numberOfGpPipes: selectedInstallation.numberOfGpPipes || '',
              descriptionOfInstallation: selectedInstallation.descriptionOfInstallation || '',
              availableSouthNorthLengthFt: selectedInstallation.availableSouthNorthLengthFt || '',
              availableEastWestLengthFt: selectedInstallation.availableEastWestLengthFt || '',
              installationSpaceTypeId: selectedInstallation.installationSpaceTypeId,
              installationSpaceTitle: isCustomTitle ? 'Other' : selectedInstallation.installationSpaceTitle,
            customInstallationSpaceTitle: isCustomTitle ? selectedInstallation.installationSpaceTitle : '',
            });
          }
        }
      }
    };
    fetchInstallation();
  }, [consumerId, installationId]);

  if (!installation) return <p>Loading...</p>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();   

  const installationData = {
    connectionId,
    customerId,
    installationSpaceTypeId: formData.installationSpaceTypeId,
    acWireLengthFt: formData.acWireLengthFt || '',
    dcWireLengthFt: formData.dcWireLengthFt || '',
    earthingWireLengthFt: formData.earthingWireLengthFt || '',
    numberOfGpPipes: formData.numberOfGpPipes || '',
    descriptionOfInstallation: formData.descriptionOfInstallation || '',
    availableSouthNorthLengthFt: formData.availableSouthNorthLengthFt || '',
    availableEastWestLengthFt: formData.availableEastWestLengthFt || '',
    installationSpaceTitle:
            formData.installationSpaceTitle === 'Other'
              ? formData.customInstallationSpaceTitle
              : formData.installationSpaceTitle,
  };
  setDialogType("confirm");
        setDialogMessage("Do you want to update the installation details?");
        setDialogAction(() => async () => {
          try {
            if (installationId) {
              await updateInstallationSpaceDetails(Number(installationId), installationData);
              toast.success("Installation details updated successfully!", { 
        autoClose: 1000,
        hideProgressBar: true,
      });

                navigate(`/view-installation/${installationId}`, {
                  state: {
                    consumerId, connectionId, installationId, customerId,  },});
            }
          } catch (error) {
             toast.error("Failed to update installation details.", {
      autoClose: 1000,
      hideProgressBar: true,
    });
          }
        });
        setDialogOpen(true);
};

  

  return (
    <div className="max-w-4xl mx-auto pt-1 sm:pt-1 pr-4 pl-6 pb-4 sm:pb-6">

<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-18">
  <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2 sm:mb-0">Update Installation</h2>

  </div>
  

<div className="w-full max-w-4xl mx-auto mb-10 mt-6 overflow-x-auto">
  <div className="relative flex justify-center min-w-[500px] md:min-w-0">
    
    {/* Connector Line: between the first and last icon only */}
    <div className="absolute top-5 left-[16%] right-[18%] h-0.5 bg-gray-300 z-0 md:left-[18%] md:right-[20%]" />

    <div className="flex justify-between w-full px-4 md:w-[80%] z-10 min-w-[500px]">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;

        const Icon =
          tab === "Customer Details"
            ? UserCircleIcon
            : tab === "Connection Details"
            ? BoltIcon
            : tab === "Installation Details"
            ? HomeModernIcon
            : Cog6ToothIcon;

            const shouldHighlightIcon = tab === "Customer Details" || tab==="Connection Details" || tab==="Installation Details";


            return (
              <button
          key={tab}
          onClick={() => {
            setActiveTab(tab);
            if (tab === "Customer Details") {
              navigate(`/view-customer/${customerId}`, {
                state: {
                  customerId,
                },
              });
            } else if (tab === "Connection Details") {
              navigate(`/view-connection/${connectionId}`, {
                state: { consumerId, customerId, connectionId },
              });
            }
          }}
          className="flex flex-col items-center gap-1 min-w-[80px] md:min-w-0 z-10"
        >
          <div
            className={`rounded-full p-2 transition-all duration-300 ${
              shouldHighlightIcon
                ? "bg-blue-500 text-white"
                : "bg-white border border-gray-300 text-gray-500"
            }`}
          >
            <Icon className="w-6 h-6" />
          </div>
          <span
            className={`text-xs md:text-sm font-semibold mt-1 ${
              isActive ? "text-gray-700" : "text-gray-700"
            }`}
          >
            {tab}
          </span>
        </button>
            );
      })}
    </div>
  </div>
</div>


      <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-6 sm:mb-8">
        Installation Details
      </h2>
  
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Input Fields */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Installation Space Type <span className="text-red-500">*</span></label>
        <select
          name="installationSpaceTypeId"
          value={formData.installationSpaceTypeId}
          onChange={handleChange}
          className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {installationSpaceTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.nameEnglish}
              </option>
              ))}
        </select>
      </div>

<div>
  <label className="block text-sm font-medium text-gray-700">
    Installation Space Title <span className="text-red-500">*</span>
  </label>

<select
  name="installationSpaceTitle"
  value={formData.installationSpaceTitle}
  onChange={(e) => {
    const value = e.target.value;
    if (value === 'Other') {
      // Keep value as 'Other' so the select reflects it
      setFormData((prev) => ({
        ...prev,
        installationSpaceTitle: 'Other',
        customInstallationSpaceTitle: '', // introduce a new field
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        installationSpaceTitle: value,
        customInstallationSpaceTitle: '', // clear if previously typed
      }));
    }
  }}
  required
  className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
>
  <option value="" disabled>Select Installation Title</option>
  <option value="At center">At center</option>
  <option value="At SW corner">At SW corner</option>
  <option value="At SE corner">At SE corner</option>
  <option value="At NW corner">At NW corner</option>
  <option value="At NE corner">At NE corner</option>
  <option value="At East side">At East side</option>
  <option value="At West side">At West side</option>
  <option value="At North side">At North side</option>
  <option value="At South side">At South side</option>
  <option value="Other">Other</option>
</select>


  {/* Show input only when "Other" is selected */}
{formData.installationSpaceTitle === 'Other' && (
  <input
    type="text"
    name="customInstallationSpaceTitle"
    value={formData.customInstallationSpaceTitle || ''}
    onChange={handleChange}
    required
    placeholder="Specify installation space title"
    className="mt-2 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
  />
)}

</div>

  
        <div>
          <label className="block text-sm font-medium text-gray-700">East-West-Length (Feet) <span className="text-red-500">*</span></label>
          <input
            type="text"
            inputMode="numeric"
            name="availableEastWestLengthFt"
            //min="0"
            //onWheel={(e) => e.currentTarget.blur()}
            value={formData.availableEastWestLengthFt}
            onChange={(e) => {
            const value = e.target.value;
              if (/^\d*$/.test(value)) {
              handleChange(e);
             }
          }}
            placeholder="e.g. 10"
            className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
  
        <div>
          <label className="block text-sm font-medium text-gray-700">South-North-Length (Feet) <span className="text-red-500">*</span></label>
          <input
            type="text"
            inputMode="numeric"
            name="availableSouthNorthLengthFt"
            //min="0"
            //onWheel={(e) => e.currentTarget.blur()}
            value={formData.availableSouthNorthLengthFt}
            placeholder="e.g. 10"
            onChange={(e) => {
            const value = e.target.value;
              if (/^\d*$/.test(value)) {
              handleChange(e);
             }
          }}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Panel To Inverter Distance (Feet)</label>
          <input
            type="text"
            inputMode="numeric"
            id="dcWireLengthFt"
            name="dcWireLengthFt"
            //min="0"
            //onWheel={(e) => e.currentTarget.blur()}
            value={formData.dcWireLengthFt}
            placeholder="e.g. 10"
            onChange={(e) => {
            const value = e.target.value;
              if (/^\d*$/.test(value)) {
              handleChange(e);
             }
          }}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
  
        <div>
          <label className="block text-sm font-medium text-gray-700">Inverter to NetMeter Distance (Feet)</label>
          <input
            type="text"
            inputMode="numeric"
            id="acWireLengthFt"
            name="acWireLengthFt"
            //min="0"
            //onWheel={(e) => e.currentTarget.blur()}
            value={formData.acWireLengthFt}
            placeholder="e.g. 10"
            onChange={(e) => {
            const value = e.target.value;
              if (/^\d*$/.test(value)) {
              handleChange(e);
             }
          }}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
  
        {/* <div>
          <label className="block text-sm font-medium text-gray-700">AC Wire Length (Feet)</label>
          <input
            type="number"
            id="acWireLengthFt"
            name="acWireLengthFt"
            min="0"
            onWheel={(e) => e.currentTarget.blur()}
            value={formData.acWireLengthFt}
            placeholder="e.g. 10"
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
  
        <div>
          <label className="block text-sm font-medium text-gray-700">DC Wire Length (Feet)</label>
          <input
            type="number"
            id="dcWireLengthFt"
            name="dcWireLengthFt"
            min="0"
            onWheel={(e) => e.currentTarget.blur()}
            value={formData.dcWireLengthFt}
            placeholder="e.g. 10"
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div> */}
  
        {/* <div>
          <label className="block text-sm font-medium text-gray-700">Earthing Wire Length (Feet)</label>
          <input
            type="number"
            id="earthingWireLengthFt"
            name="earthingWireLengthFt"
            min="0"
            onWheel={(e) => e.currentTarget.blur()}
            value={formData.earthingWireLengthFt}
            placeholder="e.g. 10"
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
  
        <div>
          <label className="block text-sm font-medium text-gray-700">Number of GP Pipes</label>
          <input
            type="number"
            id="numberOfGpPipes"
            name="numberOfGpPipes"
            min="0"
            onWheel={(e) => e.currentTarget.blur()}
            value={formData.numberOfGpPipes}
            placeholder="e.g. 10"
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div> */}
  
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Description about Installation</label>
          <input
            type="text"
            id="descriptionOfInstallation"
            name="descriptionOfInstallation"
            value={formData.descriptionOfInstallation}
            onChange={handleChange}
            placeholder="e.g. Designated area is on rooftop"
            className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
  
        {/* Submit Button */}
        <div className="sm:col-span-2 flex justify-center sm:justify-start mt-4">
          <button
            type="submit"
            className="w-full sm:w-auto py-2 px-6 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
          >
            Update Installation
          </button>
        </div>
      </form>

              <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle id="alert-dialog-title">
          {dialogType === "success" && "Success"}
          {dialogType === "error" && "Error"}
          {dialogType === "confirm" && "Confirm"}
        </DialogTitle>
        <DialogContent dividers>
          <Alert
            severity={
              dialogType === "success"
                ? "success"
                : dialogType === "error"
                ? "error"
                : "info"
            }
          >
            {dialogMessage}
          </Alert>
        </DialogContent>
        <DialogActions>
          {dialogType === "confirm" ? (
            <>
              <Button
                onClick={() => {
                  setDialogOpen(false);
                  // Cancel = reset data
                   if (installation) {
                     setFormData({
      
        installationSpaceTypeId:installation.installationSpaceTypeId,
        acWireLengthFt: installation.acWireLengthFt || '',
        dcWireLengthFt: installation.dcWireLengthFt || '',
        earthingWireLengthFt: installation.earthingWireLengthFt || '',
        numberOfGpPipes: installation.numberOfGpPipes || '',
        descriptionOfInstallation: installation.descriptionOfInstallation || '',
        availableSouthNorthLengthFt: installation.availableSouthNorthLengthFt || '',
        availableEastWestLengthFt: installation.availableEastWestLengthFt || '',
        installationSpaceTitle: installation.installationSpaceTitle || '',
      });
      
                }}
              }
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
            </>
          ) : (
            <Button
              onClick={() => {
                setDialogOpen(false);
                if (dialogAction) dialogAction();
              }}
              autoFocus
            >
              OK
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
};