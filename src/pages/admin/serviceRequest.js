import React, { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import api from './api/API'; // ✅ Use your custom Axios instance
import { ChevronUp, ChevronDown } from "lucide-react";

const App = () => {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterServiceType, setFilterServiceType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const fetchServiceRequests = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      const response = await api.get('/api/service-requests'); // ✅ Use Axios instance
      setServiceRequests(response.data);
    } catch (err) {
      console.error("Failed to fetch service requests:", err);
      setError("Failed to load service requests. Please try again later.");
      Swal.fire('Error', 'Failed to load service requests.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceRequests();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const filteredAndSortedRequests = useMemo(() => {
    let filtered = [...serviceRequests];

    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.serviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterServiceType) {
      filtered = filtered.filter(request => request.serviceType === filterServiceType);
    }

    if (filterStatus) {
      filtered = filtered.filter(request => request.status === filterStatus);
    }

    if (sortField) {
      filtered.sort((a, b) => {
        const aValue = a[sortField] || '';
        const bValue = b[sortField] || '';

        if (sortField === 'createdAt') {
          const aDate = new Date(aValue);
          const bDate = new Date(bValue);
          return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
        }

        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      });
    }

    return filtered;
  }, [serviceRequests, searchTerm, filterServiceType, filterStatus, sortField, sortOrder]);

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 300);
  };

  const handleSort = (field) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortField(field);
    setSortOrder(isAsc ? 'desc' : 'asc');
  };

  const handleOpenDetailsModal = (request) => {
    setSelectedRequest({ ...request });
    setShowModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedRequest) return;

    setIsUpdating(true);
    try {
      await api.put(`/api/service-requests/${selectedRequest._id}/status`, {
        status: selectedRequest.status,
      }); // ✅ Use Axios PUT

      setServiceRequests(prevRequests =>
        prevRequests.map(req =>
          req._id === selectedRequest._id ? { ...req, status: selectedRequest.status } : req
        )
      );
      Swal.fire('Success', 'Service request status updated successfully!', 'success');
      setShowModal(false);
    } catch (err) {
      console.error("Failed to update service request:", err);
      Swal.fire('Error', 'Failed to update service request status.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const LoadingSpinner = ({ size = "small" }) => (
    <div className={`inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] ${size === "small" ? "h-4 w-4" : "h-6 w-6"
      }`}>
      <span className="sr-only">Loading...</span>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="text-xl font-semibold text-gray-700 flex items-center space-x-2">
          <LoadingSpinner size="large" /> <span>Loading service requests...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-100 p-4">
        <div className="text-xl font-semibold text-red-700">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-inter">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-xl p-6 sm:p-8">
        <h2>
          Admin Dashboard - Service Requests
        </h2>

        <div className="mb-6 space-y-4 sm:space-y-0 sm:flex sm:gap-4 items-center">
          <input
            type="text"
            placeholder="Search by name, type, or phone..."
            className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
          />
          <button
            onClick={handleSearch}
            className="w-full sm:w-auto px-6 py-3 bg-orange-600 text-white font-semibold rounded-md hover:bg-orange-700 transition-colors duration-200 flex items-center justify-center space-x-2"
            disabled={loading || isSearching}
          >
            {isSearching ? <LoadingSpinner /> : 'Search'}
          </button>

          <select
            className="w-full sm:w-auto p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={filterServiceType}
            onChange={(e) => setFilterServiceType(e.target.value)}
            disabled={loading}
          >
            <option value="">All Service Types</option>
            <option value="Baptism">Baptism</option>
            <option value="Marriage">Marriage</option>
            <option value="Child">Child Dedication</option>
          </select>

          <select
            className="w-full sm:w-auto p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            disabled={loading}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {filteredAndSortedRequests.length === 0 ? (
          <div className="text-center text-gray-600 text-lg py-10">
            No service requests found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer sm:px-6" onClick={() => handleSort('serviceType')}>
                    Service Type {sortField === 'serviceType' && (sortOrder === 'asc' ? <ChevronUp size={14} className="inline" /> : <ChevronDown size={14} className="inline" />)}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer sm:px-6" onClick={() => handleSort('fullName')}>
                    Full Name {sortField === 'fullName' && (sortOrder === 'asc' ? <ChevronUp size={14} className="inline" /> : <ChevronDown size={14} className="inline" />)}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                    Phone Number
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer sm:px-6" onClick={() => handleSort('status')}>
                    Status {sortField === 'status' && (sortOrder === 'asc' ? <ChevronUp size={14} className="inline" /> : <ChevronDown size={14} className="inline" />)}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer sm:px-6" onClick={() => handleSort('createdAt')}>
                    Requested On {sortField === 'createdAt' && (sortOrder === 'asc' ? <ChevronUp size={14} className="inline" /> : <ChevronDown size={14} className="inline" />)}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedRequests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900 sm:px-6">{request.serviceType}</td>
                    <td className="px-4 py-4 text-sm text-gray-700 sm:px-6">{request.fullName}</td>
                    <td className="px-4 py-4 text-sm text-gray-700 sm:px-6">{request.phoneNumber}</td>
                    <td className="px-4 py-4 text-sm sm:px-6">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                        }`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 sm:px-6">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 sm:px-6">
                      <button
                        onClick={() => handleOpenDetailsModal(request)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 text-xs"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2>Detail Permintaan</h2>
            <div className="space-y-3 mb-6">
              <p><strong>Service Type:</strong> {selectedRequest.serviceType}</p>
              <p><strong>Full Name:</strong> {selectedRequest.fullName}</p>
              <p><strong>Address:</strong> {selectedRequest.address}</p>
              <p><strong>Phone Number:</strong> {selectedRequest.phoneNumber}</p>
              <p><strong>Requested On:</strong> {formatDate(selectedRequest.createdAt)}</p>
              <div>
                <strong>Request Details:</strong>
                <pre className="bg-gray-100 p-3 rounded-md text-sm whitespace-pre-wrap break-words mt-1">
                  {JSON.stringify(selectedRequest.requestDetails, null, 2)}
                </pre>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status:
                </label>
                <select
                  id="status"
                  name="status"
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  value={selectedRequest.status}
                  onChange={(e) => setSelectedRequest({ ...selectedRequest, status: e.target.value })}
                  disabled={isUpdating}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                disabled={isUpdating}
              >
                {isUpdating ? <LoadingSpinner /> : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
