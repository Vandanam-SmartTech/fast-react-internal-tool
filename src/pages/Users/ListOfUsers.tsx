import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { fetchRepresentativesPaginated } from '../../services/jwtService';
import { getCustomerCount, getOnboardedCustomerCount } from '../../services/customerRequisitionService';
import { useNavigate } from 'react-router-dom';


interface User {
  id: number;
  name: string;
  mobile: string;
  isActive: boolean;
  customerCount: number;
  onboardedCount: number;
}


export default function ListOfUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [itemsPerPage, setItemsPerPage] = useState<number | null>(null);
  const navigate = useNavigate();



  useEffect(() => {
    loadUsers(currentPage);
  }, [currentPage]);

 const loadUsers = async (page: number) => {
  try {
    setLoading(true);

    const data = await fetchRepresentativesPaginated(page);

    const mappedUsers: User[] = await Promise.all(
      data.content.map(async (user: any) => {
        const userId: number = user.userId;

        let customerCount = 0;
        let onboardedCount = 0;

        try {
          [customerCount, onboardedCount] = await Promise.all([
            getCustomerCount(userId),
            getOnboardedCustomerCount(userId),
          ]);
        } catch (error) {
          console.error(`Failed to fetch counts for representativeId=${userId}:`, error);
        }

        return {
          id: userId,
          name: user.nameAsPerGovId,
          mobile: user.mobileNumber,
          isActive: user.isActive === true,
          customerCount,
          onboardedCount,
        };
      })
    );

    setUsers(mappedUsers);
    setTotalPages(data.totalPages);
    setItemsPerPage(data.size);
  } catch (error) {
    console.error('Error loading users:', error);
  } finally {
    setLoading(false);
  }
};




  const goToPage = (page: number) => {
    if (searchQuery.trim() === '') {
      if (page >= 0 && page < totalPages) setCurrentPage(page);
    } else {
      handleSearch(searchQuery);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(0);
  };

  const renderPagination = () => {
    const pages = [];

    if (currentPage > 2) {
      pages.push(
        <button key="first" onClick={() => goToPage(0)} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
          1
        </button>
      );
      if (currentPage > 3) pages.push(<span key="dots1">...</span>);
    }

    for (let i = Math.max(0, currentPage - 2); i <= Math.min(totalPages - 1, currentPage + 2); i++) {
      pages.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`px-3 py-1 rounded ${
            i === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-300 hover:bg-gray-400'
          }`}
        >
          {i + 1}
        </button>
      );
    }

    if (currentPage < totalPages - 3) {
      if (currentPage < totalPages - 4) pages.push(<span key="dots2">...</span>);
      pages.push(
        <button
          key="last"
          onClick={() => goToPage(totalPages - 1)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="flex justify-end max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="w-full lg:w-[87%]">
        <h1 className="text-2xl font-semibold mb-6 text-center sm:text-left">List of Representatives</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {users.map(user => (
            <div
              key={user.id}
              className="group relative bg-white shadow-md hover:shadow-xl rounded-2xl p-4 border border-gray-100 hover:scale-[1.02] transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center min-w-0 space-x-3">
                    <div className="w-9 h-9 flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow">
                      {user.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .substring(0, 2)}
                    </div>
                    <h2
                      className="text-base font-semibold text-gray-800 truncate overflow-hidden text-ellipsis whitespace-nowrap max-w-[calc(100%-40px)] group-hover:text-blue-600 transition-colors duration-200"
                      title={user.name}
                    >
                      {user.name}
                    </h2>
                  </div>

                  <div
                    className={`flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ml-3 ${
                      user.isActive
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}
                  >
                    {user.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    <span>{user.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 mb-3">
                  <span className="font-medium text-gray-700">Mobile:</span>{' '}
                  <span className="font-mono text-gray-800">{user.mobile}</span>
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4 text-center">
                  <div className="p-2 bg-blue-50 border border-blue-100 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">{user.customerCount}</div>
                    <div className="text-[11px] text-blue-700 font-medium">Total Customers</div>
                  </div>
                  <div className="p-2 bg-green-50 border border-green-100 rounded-lg">
                    <div className="text-lg font-bold text-green-600">{user.onboardedCount}</div>
                    <div className="text-[11px] text-green-700 font-medium">Onboarded Consumers</div>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/view-user/${user.id}`, {
                                              state: {userId:user.id},})}
                  className="w-full flex items-center justify-center gap-1 px-4 py-2 text-xs font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition duration-200 shadow hover:shadow-md"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>

              <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-5 transform translate-x-6 -translate-y-6 group-hover:scale-125 transition-transform duration-500" />
              <div className="absolute bottom-0 left-0 w-10 h-10 bg-gradient-to-tr from-green-400 to-blue-500 rounded-full opacity-5 transform -translate-x-5 translate-y-5 group-hover:scale-125 transition-transform duration-500" />
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center space-x-2">{renderPagination()}</div>
      </div>
    </div>
  );
}
