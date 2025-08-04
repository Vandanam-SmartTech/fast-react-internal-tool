import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { createOrganization, updateOrganization, getOrganizationById, Organization } from '../../services/organizationService';
import { getDistrictNameByCode, fetchDistricts, fetchTalukas, fetchVillages } from '../../services/customerRequisitionService';
import { fetchClaims } from '../../services/jwtService';
import { toast } from 'react-toastify';

interface District {
  code: number;
  nameEnglish: string;
}

interface Taluka {
  code: number;
  nameEnglish: string;
}

interface Village {
  code: number;
  nameEnglish: string;
  pincode: string;
}

const AgencyForm: React.FC = () => {
  const { orgId, agencyId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(agencyId);

  const [formData, setFormData] = useState<Organization>({
    name: '',
    displayName: '',
    legalName:'',
    addressLine1: '',
    addressLine2: '',
    districtCode:0,
    talukaCode:0,
    villageCode:0,
    pincode: '',
    contactNumber: '',
    logoUrl:'',
    parentId: parseInt(orgId!)
  });

  const [loading, setLoading] = useState(false);

  const [districts, setDistricts] = useState<District[]>([]);
  const [talukas, setTalukas] = useState<Taluka[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
    
  const [districtCode, setDistrictCode] = useState<number>(0);
  const [talukaCode, setTalukaCode] = useState<number>(0);
  const [pincode, setPincode] = useState<string>("");
  const [villageCode, setVillageCode] = useState<number>(0);
  const [districtName, setDistrictName] = useState<string>("");
  const [talukaName, setTalukaName] = useState<string>("");
  const [villageName, setVillageName] = useState<string>("");

  useEffect(() => {
    if (isEdit && agencyId) {
      loadAgency(parseInt(agencyId));
    }
  }, [agencyId, isEdit]);

  const loadAgency = async (id: number) => {
    try {
      const agency = await getOrganizationById(id);
      setFormData(agency);
    } catch (error) {
      toast.error('Failed to load agency');
      navigate(`/agencies/${orgId}`);
    }
  };

  useEffect(() => {
      const fetchDistrictsData = async () => {
        try {
          const districtData = await fetchDistricts();
          setDistricts(districtData);
        } catch (error) {
          console.error('Error fetching districts:', error);
        }
      };
      fetchDistrictsData();
    }, []);
  
    useEffect(() => {
      if (districtCode) {
          getDistrictNameByCode(districtCode)
              .then((name) => setDistrictName(name))
              .catch(() => setDistrictName("Unknown District"));
      }
  }, [districtCode]);
  
    useEffect(() => {
      const fetchTalukasData = async () => {
        if (districtCode) {
          try {
            const talukaData = await fetchTalukas(districtCode);
            setTalukas(talukaData);
          } catch (err) {
            console.error('Error fetching talukas:', err);
          }
        } else {
          setTalukas([]);
        }
      };
      fetchTalukasData();
    }, [districtCode]);
  
    useEffect(() => {
      const fetchVillagesData = async () => {
        if (talukaCode) {
          try {
            const villageData = await fetchVillages(talukaCode);
            setVillages(villageData);
          } catch (err) {
            console.error('Error fetching villages:', err);
          }
        } else {
          setVillages([]);
        }
      };
      fetchVillagesData();
    }, [talukaCode]);
  
    const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = parseInt(e.target.value, 10);
      setDistrictCode(value);
      setTalukaCode(0);
      setVillageCode(0);
      setTalukaName(""); 
      setVillageName(""); 
      setPincode("");
      setFormData((prev) => ({
        ...prev,
        districtCode: value,
        talukaCode: 0,
        villageCode: 0,
        pincode: "",
      }));
    };
  
    const handleTalukaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = parseInt(e.target.value, 10);
      setTalukaCode(value);
  
      setVillageCode(0);
      setVillageName("");
      setPincode("");
      setFormData((prev) => ({
        ...prev,
        talukaCode: value,
        villageCode: 0,
        pincode: "",
      }));
    };
  
    const handleVillageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = parseInt(e.target.value, 10);
      const selectedVillage = villages.find((village) => village.code === value);
  
      if (selectedVillage) {
        setVillageCode(value);
        setPincode(selectedVillage.pincode || "");
        setFormData((prev) => ({
          ...prev,
          villageCode: value,
          pincode: selectedVillage.pincode,
        }));
      }
    };
  
    const handlepincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        setPincode(value);
        setFormData((prev) => ({ ...prev, pincode: value }));
        console.log("Current state pincode:", pincode);
      };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const claims = await fetchClaims();
      const userId = claims?.id || claims?.user_id || claims?.userId;
      
      const agencyData = {
        ...formData,
        parentId: parseInt(orgId!),
        createdBy: userId
      };
      
      if (isEdit && agencyId) {
        await updateOrganization(parseInt(agencyId), agencyData);
        toast.success('Agency updated successfully');
      } else {
        await createOrganization(agencyData);
        toast.success('Agency created successfully');
      }
      navigate(`/agencies/${orgId}`);
    } catch (error) {
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} agency`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto pt-1 sm:pt-1">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(`/agencies/${orgId}`)}
          className="rounded-full hover:bg-gray-200 transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl md:text-2xl font-semibold text-gray-700">
          {isEdit ? 'Edit Agency' : 'Create Agency'}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Legal Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="legalName"
              value={formData.legalName}
              onChange={handleChange}
              placeholder="e.g. EcoVolt Renewable Energy Pvt. Ltd."
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              placeholder="e.g. EcoVolt Solar Solutions"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name (Short Name) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. SunTech, EcoVolt, SolarMax"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="9567023456"
              maxLength={15}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 1 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="addressLine1"
              value={formData.addressLine1 || ''}
              onChange={handleChange}
              
              placeholder="e.g. Flat No, House No, Street Name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 2
            </label>
            <input
              type="text"
              name="addressLine2"
              placeholder="e.g. Apartment, Suite, Unit, Building"
              value={formData.addressLine2 || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">District <span className="text-red-500">*</span></label>
            <select
              name="distrct"
              id="district"
              value={districtCode}
              onChange={handleDistrictChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>{districtName || "Select District"}</option>
              {districts.map((district) => (
                <option key={district.nameEnglish} value={district.code}>
                  {district.nameEnglish}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Taluka <span className="text-red-500">*</span></label>
            <select
              name="talukaCode"
              id="taluka"
              value={talukaCode}
              onChange={handleTalukaChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>{talukaName || "Select Taluka"}</option>
              {talukas.map((taluka) => (
                <option key={taluka.nameEnglish} value={taluka.code}>
                  {taluka.nameEnglish}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Village <span className="text-red-500">*</span></label>
            <select
              name="villageCode"
              id="village"
              value={villageCode}
              onChange={handleVillageChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>{villageName || "Select Village"}</option>
              {villages.map((village) => (
                <option key={village.code} value={village.code}>
                  {village.nameEnglish}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pincode <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="pincode"
              name="pincode"
              value={formData.pincode || ''}  
              onChange={handlepincodeChange}
              placeholder="e.g. 416000"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

        </div>

        <div className="col-span-2 flex justify-start gap-4 mt-8">
          <button
            type="button"
            onClick={() => navigate(`/agencies/${orgId}`)}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AgencyForm;