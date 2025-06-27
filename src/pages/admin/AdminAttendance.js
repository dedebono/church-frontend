import React, { useEffect, useState, useMemo } from 'react';
import { AdminAttendance as fetchAdminAttendance } from './api/API.js';
import './AdminAttendance.css';

const AdminAttendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nameFilter, setNameFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'descending' });

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const response = await fetchAdminAttendance();
        setAttendanceData(response.data);
      } catch (error) {
        console.error('Error fetching attendance:', error);
      }
      setLoading(false);
    };
    fetchAttendance();
  }, []);
  
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return 'status-present';
      case 'absent':
        return 'status-absent';
      case 'late':
        return 'status-late';
      default:
        return '';
    }
  };

  const filteredData = useMemo(() => {
    let filterableData = [...attendanceData];

    if (nameFilter) {
      filterableData = filterableData.filter(record =>
        record.memberId?.fullName.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    if (dateFilter) {
        filterableData = filterableData.filter(record => {
            const recordDate = new Date(record.date).toISOString().split('T')[0];
            return recordDate === dateFilter;
        });
    }
    
    return filterableData;
  }, [attendanceData, nameFilter, dateFilter]);

  const sortedData = useMemo(() => {
    let sortableData = [...filteredData];
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'memberName') {
            aValue = a.memberId?.fullName || '';
            bValue = b.memberId?.fullName || '';
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [filteredData, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
    const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
    }
    return '';
  };


  return (
    <div className="p-4">
      <h2 className="h2">Kehadiran Jemaat</h2>

      <div className="filter-container">
        <input
          type="text"
          placeholder="Filter by name..."
          className="filter-input"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
        />
        <input
          type="date"
          className="filter-input"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
      </div>

        <div className={`min-w-full ${loading ? 'loading' : ''}`}>
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="px-4 py-2 text-left" onClick={() => requestSort('memberName')}>
                            Member Name <span className="sort-indicator">{getSortIndicator('memberName')}</span>
                        </th>
                        <th className="px-4 py-2 text-left" onClick={() => requestSort('date')}>
                            Date <span className="sort-indicator">{getSortIndicator('date')}</span>
                        </th>
                        <th className="px-4 py-2 text-left" onClick={() => requestSort('status')}>
                            Status <span className="sort-indicator">{getSortIndicator('status')}</span>
                        </th>
                        <th className="px-4 py-2 text-left">Notes</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map((record) => (
                    <tr key={record._id} className="border-b" data-label="Attendance Record">
                        <td className="px-4 py-2" data-label="Member Name">
                        {record.memberId?.fullName || 'Unknown'}
                        </td>
                        <td className="px-4 py-2" data-label="Date">
                        {new Date(record.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric'})}
                        </td>

                        <td className="px-4 py-2" data-label="Status">
                          <span className={getStatusClass(record.status)}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-4 py-2" data-label="Notes">{record.notes}</td>
                    </tr>
                    ))}
                    {sortedData.length === 0 && (
                    <tr>
                        <td colSpan="4" className="text-center py-4 text-gray-500">
                        No attendance records found.
                        </td>
                    </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default AdminAttendance;
