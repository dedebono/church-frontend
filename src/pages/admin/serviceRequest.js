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
    let detailsHtml = '';
    if (request.requestDetails && typeof request.requestDetails === 'object' && Object.keys(request.requestDetails).length > 0) {
      detailsHtml = `<div style="background: #f9fafb; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb;">
        <ul style="list-style-type: none; padding: 0; margin: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">`;
      for (const [key, value] of Object.entries(request.requestDetails)) {
        let displayValue = value;
        if (typeof value === 'boolean') displayValue = value ? 'Yes' : 'No';
        else if (value && typeof value === 'object') displayValue = JSON.stringify(value);
        if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
          try { displayValue = formatDate(value); } catch (e) { }
        }
        detailsHtml += `<li style="display: flex; flex-direction: column; border-bottom: 1px solid #f3f4f6; padding-bottom: 4px;">
            <span style="font-size: 0.75rem; font-weight: 600; color: #6b7280; text-transform: uppercase; margin-bottom: 4px;">
              ${key.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            <span style="color: #111827; font-weight: 500; white-space: pre-wrap;">
              ${displayValue || '-'}
            </span>
          </li>`;
      }
      detailsHtml += `</ul></div>`;
    } else {
      detailsHtml = '<p style="color: #6b7280; font-style: italic; text-align: center; padding: 10px 0;">No additional details provided.</p>';
    }

    Swal.fire({
      title: '<h2 style="font-size: 1.5rem; font-weight: bold; color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; text-align: left; margin: 0;">Detail Permintaan</h2>',
      width: '600px',
      html: `
        <div style="text-align: left; font-size: 14px; line-height: 1.6; color: #374151;">
          <div style="background: #f9fafb; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; margin-top: 16px;">
            <div style="grid-column: span 1;"><strong style="color: #374151; display: block; margin-bottom: 4px;">Service Type:</strong> <span style="color: #111827; font-weight: 500;">${request.serviceType}</span></div>
            <div style="grid-column: span 1;"><strong style="color: #374151; display: block; margin-bottom: 4px;">Full Name:</strong> <span style="color: #111827; font-weight: 500;">${request.fullName}</span></div>
            <div style="grid-column: span 1;"><strong style="color: #374151; display: block; margin-bottom: 4px;">Phone Number:</strong> <span style="color: #111827; font-weight: 500;">${request.phoneNumber}</span></div>
            <div style="grid-column: span 1;"><strong style="color: #374151; display: block; margin-bottom: 4px;">Requested On:</strong> <span style="color: #111827; font-weight: 500;">${formatDate(request.createdAt)}</span></div>
            <div style="grid-column: span 2;"><strong style="color: #374151; display: block; margin-bottom: 4px;">Address:</strong> <span style="color: #111827; font-weight: 500;">${request.address || '-'}</span></div>
          </div>

          <strong style="display: block; font-size: 1.125rem; font-weight: 600; color: #1f2937; margin-bottom: 12px; padding-top: 16px; border-top: 1px solid #e5e7eb;">Request Details:</strong>
          ${detailsHtml}
          
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
            <label for="swal-update-status" style="display: block; font-size: 0.875rem; font-weight: 700; color: #374151; margin-bottom: 8px;">
              Update Status:
            </label>
            <select id="swal-update-status" style="display: block; width: 100%; padding: 8px 12px; font-size: 1rem; border: 1px solid #d1d5db; border-radius: 6px; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); color: #111827; outline: none; background-color: #fff;">
              <option value="Pending" ${request.status === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="In Progress" ${request.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
              <option value="Completed" ${request.status === 'Completed' ? 'selected' : ''}>Completed</option>
            </select>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Save Changes',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ea580c',
      showLoaderOnConfirm: true,
      preConfirm: () => {
        const newStatus = document.getElementById('swal-update-status').value;
        if (newStatus === request.status) {
          return null; // Return null if no change is made, bypassing the API call
        }

        return api.put(`/api/service-requests/${request._id}/status`, {
          status: newStatus,
        }).then(response => {
          return { newStatus };
        }).catch(error => {
          Swal.showValidationMessage(
            `Request failed: ${error}`
          );
        });
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      // If result.value is true, it means the API call succeeded (or no change was made if it's null).
      if (result.isConfirmed && result.value) {
        setServiceRequests(prevRequests =>
          prevRequests.map(req =>
            req._id === request._id ? { ...req, status: result.value.newStatus } : req
          )
        );
        Swal.fire('Success', 'Service request status updated successfully!', 'success');
      } else if (result.isConfirmed && result.value === null) {
        Swal.fire('Info', 'No changes were made to the status.', 'info');
      }
    });
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
    </div>
  );
};

export default App;
