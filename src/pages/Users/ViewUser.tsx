import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { getUserById } from '../../services/jwtService'; 

const ViewUser = () => {
  const location = useLocation();
  const userId = location.state?.userId;

  const [user, setUser] = useState<Record<string, any> | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;

      const result = await getUserById(Number(userId));
      if (result.data) {
        setUser(result.data); 
      } else {
        console.warn(result.message);
      }
    };

    fetchUser();
  }, [userId]);

  if (!user) {
    return <div className="text-center py-10 text-gray-500">Loading user details...</div>;
  }

  return (
  <div className="min-h-[20vh] px-4 py-6 flex flex-col items-center">
    {/* Header */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 w-full max-w-3xl">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-700">
        View User Details
      </h2>
    </div>

    {/* Representative Card */}
    <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-3xl">
      <h3 className="text-xl font-semibold text-gray-800 mb-2">User Details</h3>
      <div className="border-b border-gray-200 mb-4" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-6 md:gap-x-20 mb-10">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Name as per Gov ID</h3>
          <p className="mt-1 text-base text-gray-800 break-words">{user.nameAsPerGovId || "....."}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Mobile Number</h3>
          <p className="mt-1 text-base text-gray-800 break-words">{user.mobileNumber || "....."}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Email</h3>
          <p className="mt-1 text-base text-gray-800 break-words">{user.emailAddress || "....."}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">User Code</h3>
          <p className="mt-1 text-base text-gray-800 break-words">{user.representativeCode || "....."}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Preferred Name</h3>
          <p className="mt-1 text-base text-gray-800 break-words">{user.preferredName || "....."}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Username</h3>
          <p className="mt-1 text-base text-gray-800 break-words">{user.username || "....."}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Manager Name</h3>
          <p className="mt-1 text-base text-gray-800 break-words">{user.managerName || "....."}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Manager Email</h3>
          <p className="mt-1 text-base text-gray-800 break-words">{user.managerEmail || "....."}</p>
        </div>
        <div className="md:col-span-2">
          <h3 className="text-sm font-medium text-gray-500">Roles</h3>
          <p className="mt-1 text-base text-gray-800 break-words">
            {user.roles?.length ? user.roles.map(r => r.name).join(', ') : '.....'}
          </p>
        </div>
      </div>
    </div>

<div className="w-full max-w-3xl mt-6 flex justify-start">
  <button
    onClick={() =>
      navigate(`/edit-user/${userId}`, {
        state: { userId },
      })
    }
    className="py-2 px-6 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
  >
    Edit User
  </button>
</div>

    </div>

);

};

export default ViewUser;
