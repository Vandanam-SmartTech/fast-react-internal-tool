import React, { useState } from 'react';
import { CheckCircle, XCircle, Eye } from 'lucide-react';

interface User {
  id: number;
  name: string;
  mobile: string;
  isActive: boolean;
  customerCount: number;
  onboardedCount: number;
}

const users: User[] = [
  // Add as many users as needed
  { id: 1, name: 'Rajesh Kumar Mishra Mishra Mishra', mobile: '9876543210', isActive: true, customerCount: 12, onboardedCount: 7 },
  { id: 2, name: 'Anita Sharma', mobile: '9876543211', isActive: false, customerCount: 10, onboardedCount: 5 },
  { id: 3, name: 'Vikas Mehra', mobile: '9876543212', isActive: true, customerCount: 15, onboardedCount: 9 },
  { id: 4, name: 'Sunita Joshi', mobile: '9876543213', isActive: true, customerCount: 8, onboardedCount: 4 },
  { id: 5, name: 'Arjun Singh', mobile: '9876543214', isActive: false, customerCount: 6, onboardedCount: 3 },
  { id: 6, name: 'Meena Patil', mobile: '9876543215', isActive: true, customerCount: 20, onboardedCount: 14 },
  { id: 7, name: 'Dinesh Raut', mobile: '9876543216', isActive: true, customerCount: 9, onboardedCount: 5 },
  { id: 8, name: 'Kavita Desai', mobile: '9876543217', isActive: false, customerCount: 4, onboardedCount: 2 },
  { id: 9, name: 'Nikhil Jain', mobile: '9876543218', isActive: true, customerCount: 18, onboardedCount: 13 },
  { id: 10, name: 'Sangeeta Bhosale', mobile: '9876543219', isActive: true, customerCount: 7, onboardedCount: 3 },
  { id: 11, name: 'Ajay Malhotra', mobile: '9876543220', isActive: false, customerCount: 11, onboardedCount: 6 },
  { id: 12, name: 'Rita Chavan', mobile: '9876543221', isActive: true, customerCount: 13, onboardedCount: 10 },
  { id: 13, name: 'Deepak Rane', mobile: '9876543222', isActive: false, customerCount: 5, onboardedCount: 1 },
];

const ITEMS_PER_PAGE = 12;

export default function ListOfUsers() {
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    if (searchQuery.trim() === "") {
      if (page >= 0 && page < totalPages) setCurrentPage(page);
    } else {
      handleSearch(searchQuery);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(0);
    // Add search logic here if needed
  };

  const renderPagination = () => {
    if (searchQuery.trim() === "") {
      const pages = [];

      if (currentPage > 2) {
        pages.push(
          <button key="first" onClick={() => goToPage(0)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">1</button>
        );
        if (currentPage > 3) pages.push(<span key="dots1">...</span>);
      }

      for (let i = Math.max(0, currentPage - 2); i <= Math.min(totalPages - 1, currentPage + 2); i++) {
        pages.push(
          <button key={i} onClick={() => goToPage(i)}
            className={`px-3 py-1 rounded ${i === currentPage ? "bg-blue-600 text-white" : "bg-gray-300 hover:bg-gray-400"}`}>
            {i + 1}
          </button>
        );
      }

      if (currentPage < totalPages - 3) {
        if (currentPage < totalPages - 4) pages.push(<span key="dots2">...</span>);
        pages.push(
          <button key="last" onClick={() => goToPage(totalPages - 1)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
            {totalPages}
          </button>
        );
      }

      return pages;
    } else {
      return null;
    }
  };

  const paginatedUsers = users.slice(
    currentPage * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  );

return (
    <div className="flex justify-end max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="w-full lg:w-[87%]">
        <h1 className="text-2xl font-semibold mb-6 text-center sm:text-left">
          List of Representatives
        </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {paginatedUsers.map(user => (
          <div
            key={user.id}
            className="group relative bg-white shadow-md hover:shadow-xl rounded-2xl p-4 border border-gray-100 hover:scale-[1.02] transition-all duration-300 overflow-hidden"
          >
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>

            {/* Card Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
  {/* Avatar + Name Container */}
  <div className="flex items-center min-w-0 space-x-3">
    {/* Avatar */}
    <div className="w-9 h-9 flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow">
      {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
    </div>

    {/* Name */}
    <h2
      className="text-base font-semibold text-gray-800 truncate overflow-hidden text-ellipsis whitespace-nowrap max-w-[calc(100%-40px)] group-hover:text-blue-600 transition-colors duration-200"
      title={user.name}
    >
      {user.name}
    </h2>
  </div>

  {/* Status */}
  <div
    className={`flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ml-3 ${
      user.isActive
        ? 'bg-green-50 text-green-700 border-green-200'
        : 'bg-red-50 text-red-700 border-red-200'
    }`}
  >
    {user.isActive ? (
      <CheckCircle className="w-3 h-3" />
    ) : (
      <XCircle className="w-3 h-3" />
    )}
    <span>{user.isActive ? 'Active' : 'Inactive'}</span>
  </div>
</div>


              {/* Mobile Info */}
              <p className="text-xs text-gray-600 mb-3">
                <span className="font-medium text-gray-700">Mobile:</span>{' '}
                <span className="font-mono text-gray-800">{user.mobile}</span>
              </p>

              {/* Stats */}
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

              {/* Button */}
              <button
                onClick={() => alert(`Viewing ${user.name}`)}
                className="w-full flex items-center justify-center gap-1 px-4 py-2 text-xs font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition duration-200 shadow hover:shadow-md"
              >
                <Eye className="w-4 h-4" />
                View Details
              </button>
            </div>

            {/* Decorative Circles */}
            <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-5 transform translate-x-6 -translate-y-6 group-hover:scale-125 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-10 h-10 bg-gradient-to-tr from-green-400 to-blue-500 rounded-full opacity-5 transform -translate-x-5 translate-y-5 group-hover:scale-125 transition-transform duration-500" />
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-10 flex justify-center space-x-2">
        {renderPagination()}
      </div>
    </div>
  </div>
);

}
