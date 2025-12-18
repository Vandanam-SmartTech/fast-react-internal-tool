import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Edit, Trash2, Building2, ArrowLeft, Eye, Search, Phone, MoreVertical, CheckCircle, XCircle } from 'lucide-react';
import { deleteOrganization, Organization, getChildOrganizationsInPagination } from '../../services/organizationService';
import { fetchOrganizationImage } from '../../services/documentManagerService';
import { toast } from 'react-toastify';
import { Button } from '../../components/ui';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button as MuiButton, Alert } from '@mui/material';

const AgencyList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orgId = location.state?.orgId;
  const gstNumber = location.state?.gstNumber;
  const [agencies, setAgencies] = useState<Organization[]>([]);
  const [filteredAgencies, setFilteredAgencies] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [, setTotalElements] = useState<number>(0);

  const [organizationLogos, setOrganizationLogos] = useState<Map<number, string>>(new Map());

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"error" | "confirm" | "success">("success");
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogAction, setDialogAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (orgId) {
      loadAgencies(0, parseInt(orgId)); // Load first page initially
    }
  }, [orgId]);

  useEffect(() => {
    if (orgId) {
      loadAgencies(currentPage, parseInt(orgId)); // Load data when page changes
    }
  }, [currentPage, orgId]);

  const toggleDropdown = (id: number) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  useEffect(() => {
    agencies.forEach(async () => {
      if (orgId && !organizationLogos.has(orgId)) {
        const imageUrl = await fetchOrganizationImage(orgId);
        setOrganizationLogos(prev => new Map(prev).set(orgId!, imageUrl));
      }
    });
  }, [agencies, organizationLogos]);



  const loadAgencies = async (page: number, parentId: number) => {
    try {
      setLoading(true);
      const data = await getChildOrganizationsInPagination(parentId, page);
      setAgencies(data.content);
      setFilteredAgencies(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setCurrentPage(data.currentPage);
    } catch (error) {
      toast.error('Failed to load agencies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = agencies.filter(agency =>
      agency.name.toLowerCase().includes(term.toLowerCase()) ||
      agency.displayName?.toLowerCase().includes(term.toLowerCase()) ||
      agency.contactNumber?.includes(term)
    );
    setFilteredAgencies(filtered);
  };

  const renderPagination = () => {
    if (searchTerm.trim() !== "") return null;

    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(
          <Button
            key={i}
            variant={i === currentPage ? "primary" : "outline"}
            size="sm"
            onClick={() => setCurrentPage(i)}
            className="min-w-[40px]"
          >
            {i + 1}
          </Button>
        );
      }
    } else {
      // First page
      pages.push(
        <Button
          key="first"
          variant={currentPage === 0 ? "primary" : "outline"}
          size="sm"
          onClick={() => setCurrentPage(0)}
        >
          1
        </Button>
      );

      // Ellipsis if needed
      if (currentPage > 2) {
        pages.push(<span key="dots1" className="px-2">...</span>);
      }

      // Current page and neighbors
      for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages - 2, currentPage + 1); i++) {
        pages.push(
          <Button
            key={i}
            variant={i === currentPage ? "primary" : "outline"}
            size="sm"
            onClick={() => setCurrentPage(i)}
          >
            {i + 1}
          </Button>
        );
      }

      // Ellipsis if needed
      if (currentPage < totalPages - 3) {
        pages.push(<span key="dots2" className="px-2">...</span>);
      }

      // Last page
      pages.push(
        <Button
          key="last"
          variant={currentPage === totalPages - 1 ? "primary" : "outline"}
          size="sm"
          onClick={() => setCurrentPage(totalPages - 1)}
        >
          {totalPages}
        </Button>
      );
    }

    return pages;
  };

  const handleDelete = (id: number) => {
    setDialogType("confirm");
    setDialogMessage("Do you really want to delete this agency?");

    setDialogAction(() => async () => {
      setLoading(true);
      try {
        await deleteOrganization(id);
        toast.success("Agency deleted successfully",{
          autoClose:1000,
          hideProgressBar:true
        });

        if (orgId) {
          loadAgencies(currentPage, parseInt(orgId));
        }
      } catch (error) {
        toast.error("Failed to delete agency",{
          autoClose:1000,
          hideProgressBar:true
        });
      } finally {
        setLoading(false);
      }
    });

    setDialogOpen(true);
  };


  if (loading) return <div className="flex justify-center p-8">Loading...</div>;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-200 transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Agencies
          </h1>
        </div>

        {/* Search and Add Button */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search agencies..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() =>
              navigate("/agency-form", {
                state: { orgId: orgId, gstNumber: gstNumber },
              })
            }
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Agency
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      {filteredAgencies.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {searchTerm ? 'No agencies match your search' : 'No agencies found'}
          </p>
          {!searchTerm && (
            <button
              onClick={() =>
                navigate("/agency-form", {
                  state: { orgId: orgId },
                })
              }
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create your first agency
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredAgencies.map((agency) => (
            <div
              key={agency.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-4 sm:p-5">
                <div className="flex justify-between items-start mb-3">
                  {/* <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Building2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <h3 className="font-semibold text-gray-900 truncate" title={agency.name}>
                      {agency.name}
                    </h3>
                  </div> */}

                  <div
                    className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer"
                  >
                    <div className="relative group h-12 w-12">
                      {organizationLogos.has(orgId!) ? (
                        <img
                          src={organizationLogos.get(orgId!)}
                          alt={`${agency.name} logo`}
                          className="h-12 w-12 object-contain rounded-full border border-gray-200 p-1 bg-white"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full border border-gray-200 bg-white p-2 flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-blue-600" />
                        </div>
                      )}

                    </div>

                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">{agency.name}</h3>
                      {agency.isActive ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </div>

                  {/* Dropdown Menu */}
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDropdown(agency.id!);
                      }}
                      className="p-3 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-500" />
                    </button>

                    {openDropdown === agency.id && (
                      <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-40">
                        <button
                          onClick={() => {
                            navigate(`/agency-view`, {
                              state: {
                                orgId: orgId,
                                agencyId: agency.id,
                              },
                            });
                            setOpenDropdown(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            navigate("/edit-agency", {
                              state: {
                                orgId: orgId,
                                agencyId: agency.id
                              },
                            });
                            setOpenDropdown(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(agency.id!)}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Display Name */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">Display Name:</span>
                    <span className="truncate" title={agency.displayName || 'Not Available'}>
                      {agency.displayName || 'Not Available'}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate" title={agency.contactNumber || 'Not Available'}>
                      {agency.contactNumber || 'Not Available'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Action Buttons - Mobile Friendly */}
              <div className="border-t border-gray-100 p-3 bg-gray-50">
                <div className="flex justify-between items-center gap-2">
                  <button
                    onClick={() =>
                      navigate(`/agency-view`, {
                        state: {
                          agencyId: agency.id,
                          orgId: orgId,
                        },
                      })
                    }
                    className="flex-1 bg-white text-gray-600 border border-gray-300 px-3 py-2 rounded text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    <span className="hidden sm:inline">View</span>
                  </button>

                  <button
                    onClick={() => navigate(`/edit-agency`, {
                      state: {
                        orgId: orgId,
                        agencyId: agency.id,
                      }
                    })}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {renderPagination() && (
        <div className="flex justify-center items-center mt-8 gap-2">
          {renderPagination()}
        </div>
      )}

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
                    <MuiButton
                      onClick={() => {
                        setDialogOpen(false);
                      }}
                    >
                      No
                    </MuiButton>
                    <MuiButton
                      onClick={() => {
                        setDialogOpen(false);
                        if (dialogAction) dialogAction();
                      }}
                      autoFocus
                    >
                      Yes
                    </MuiButton>
                  </>
                ) : (
                  <MuiButton
                    onClick={() => {
                      setDialogOpen(false);
                      if (dialogAction) dialogAction();
                    }}
                    autoFocus
                  >
                    OK
                  </MuiButton>
                )}
              </DialogActions>
            </Dialog>

    </div>
  );
};

export default AgencyList;