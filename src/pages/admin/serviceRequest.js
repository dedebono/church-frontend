import React, { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import api from './api/API';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  RotateCw,
  Clock,
  Activity,
  CheckCircle2,
  Inbox,
  Eye,
  Phone,
  MessageCircle,
  Calendar,
  Droplets,
  Heart,
  Baby,
  ClipboardList
} from 'lucide-react';
import './serviceRequest.css';

const ServiceRequestDashboard = () => {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterServiceType, setFilterServiceType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchServiceRequests = async () => {
    setLoading(true);
    setIsRefreshing(true);
    try {
      const response = await api.get('/api/service-requests');
      setServiceRequests(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch service requests:', err);
      setError('Gagal memuat permintaan pelayanan. Silakan coba beberapa saat lagi.');
      Swal.fire({
        title: 'Error',
        text: 'Gagal memuat data permintaan pelayanan.',
        icon: 'error',
        background: '#131318',
        color: '#f8fafc',
        confirmButtonColor: '#d4a24e'
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchServiceRequests();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return { date: 'N/A', time: '' };
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return { date: dateString, time: '' };
      
      const datePart = d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      const timePart = d.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      });
      return { date: datePart, time: timePart };
    } catch (e) {
      return { date: dateString, time: '' };
    }
  };

  const getCleanPhone = (phone) => {
    if (!phone) return '';
    let cleaned = String(phone).replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1);
    }
    return cleaned;
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = serviceRequests.length;
    const pending = serviceRequests.filter(r => r.status === 'Pending').length;
    const inProgress = serviceRequests.filter(r => r.status === 'In Progress').length;
    const completed = serviceRequests.filter(r => r.status === 'Completed').length;
    return { total, pending, inProgress, completed };
  }, [serviceRequests]);

  // Filtering & Sorting
  const filteredAndSortedRequests = useMemo(() => {
    let filtered = [...serviceRequests];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(request =>
        (request.fullName && request.fullName.toLowerCase().includes(term)) ||
        (request.serviceType && request.serviceType.toLowerCase().includes(term)) ||
        (request.phoneNumber && String(request.phoneNumber).toLowerCase().includes(term)) ||
        (request.address && request.address.toLowerCase().includes(term))
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
          const aDate = new Date(aValue).getTime() || 0;
          const bDate = new Date(bValue).getTime() || 0;
          return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
        }

        return sortOrder === 'asc'
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });
    }

    return filtered;
  }, [serviceRequests, searchTerm, filterServiceType, filterStatus, sortField, sortOrder]);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterServiceType, filterStatus]);

  // Paginated items
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedRequests.length / pageSize));
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedRequests.slice(start, start + pageSize);
  }, [filteredAndSortedRequests, currentPage, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterServiceType('');
    setFilterStatus('');
    setSortField('createdAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const getServiceBadge = (serviceType) => {
    const type = String(serviceType || '').toLowerCase();
    if (type.includes('baptism') || type.includes('baptis')) {
      return (
        <span className="sr-service-badge sr-badge-baptism">
          <Droplets size={13} />
          <span>Baptisan</span>
        </span>
      );
    }
    if (type.includes('marriage') || type.includes('nikah')) {
      return (
        <span className="sr-service-badge sr-badge-marriage">
          <Heart size={13} />
          <span>Pernikahan</span>
        </span>
      );
    }
    if (type.includes('child') || type.includes('anak')) {
      return (
        <span className="sr-service-badge sr-badge-child">
          <Baby size={13} />
          <span>Penyerahan Anak</span>
        </span>
      );
    }
    return (
      <span className="sr-service-badge sr-badge-default">
        <ClipboardList size={13} />
        <span>{serviceType || 'Layanan'}</span>
      </span>
    );
  };

  const getStatusPill = (status) => {
    if (status === 'Pending') {
      return (
        <span className="sr-status-pill sr-status-pending">
          <span className="sr-status-dot"></span>
          <span>Pending</span>
        </span>
      );
    }
    if (status === 'In Progress') {
      return (
        <span className="sr-status-pill sr-status-progress">
          <span className="sr-status-dot"></span>
          <span>In Progress</span>
        </span>
      );
    }
    if (status === 'Completed') {
      return (
        <span className="sr-status-pill sr-status-completed">
          <span className="sr-status-dot"></span>
          <span>Completed</span>
        </span>
      );
    }
    return (
      <span className="sr-status-pill sr-status-pending">
        <span className="sr-status-dot"></span>
        <span>{status || 'Unknown'}</span>
      </span>
    );
  };

  const handleOpenDetailsModal = (request) => {
    let detailsHtml = '';
    if (request.requestDetails && typeof request.requestDetails === 'object' && Object.keys(request.requestDetails).length > 0) {
      detailsHtml = `
        <div style="background: #1c1c24; padding: 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); margin-top: 10px;">
          <ul style="list-style-type: none; padding: 0; margin: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">`;
      for (const [key, value] of Object.entries(request.requestDetails)) {
        let displayValue = value;
        if (typeof value === 'boolean') displayValue = value ? 'Ya' : 'Tidak';
        else if (value && typeof value === 'object') displayValue = JSON.stringify(value);
        if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
          try {
            const formatted = formatDate(value);
            displayValue = `${formatted.date} ${formatted.time}`;
          } catch (e) { }
        }
        detailsHtml += `
          <li style="display: flex; flex-direction: column; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
            <span style="font-size: 0.72rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">
              ${key.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            <span style="color: #f8fafc; font-weight: 500; font-size: 0.88rem; word-break: break-word; white-space: pre-wrap;">
              ${displayValue || '-'}
            </span>
          </li>`;
      }
      detailsHtml += `</ul></div>`;
    } else {
      detailsHtml = '<p style="color: #94a3b8; font-style: italic; text-align: center; padding: 16px 0; background: #1c1c24; border-radius: 10px; margin-top: 10px;">Tidak ada detail formulir tambahan.</p>';
    }

    const created = formatDate(request.createdAt);

    Swal.fire({
      title: `
        <div style="display: flex; align-items: center; gap: 10px; font-size: 1.25rem; font-weight: 700; color: #f8fafc; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 14px; text-align: left; margin: 0;">
          <span>📋 Detail Permintaan Pelayanan</span>
        </div>
      `,
      width: '640px',
      background: '#131318',
      color: '#f8fafc',
      showCancelButton: true,
      confirmButtonText: 'Simpan Perubahan',
      cancelButtonText: 'Tutup',
      confirmButtonColor: '#d4a24e',
      cancelButtonColor: '#262632',
      showLoaderOnConfirm: true,
      html: `
        <div style="text-align: left; font-size: 14px; line-height: 1.5; color: #cbd5e1; margin-top: 16px;">
          <!-- Primary Info Grid -->
          <div style="background: #1c1c24; padding: 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px;">
            <div>
              <span style="display: block; font-size: 0.72rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 3px;">Jenis Layanan</span>
              <span style="color: #f8fafc; font-weight: 600; font-size: 0.95rem;">${request.serviceType || '-'}</span>
            </div>
            <div>
              <span style="display: block; font-size: 0.72rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 3px;">Status Saat Ini</span>
              <span style="color: #d4a24e; font-weight: 600; font-size: 0.95rem;">${request.status || '-'}</span>
            </div>
            <div>
              <span style="display: block; font-size: 0.72rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 3px;">Nama Pemohon</span>
              <span style="color: #f8fafc; font-weight: 600; font-size: 0.95rem;">${request.fullName || '-'}</span>
            </div>
            <div>
              <span style="display: block; font-size: 0.72rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 3px;">Nomor Telepon</span>
              <span style="color: #f8fafc; font-family: monospace; font-size: 0.9rem;">${request.phoneNumber || '-'}</span>
            </div>
            <div>
              <span style="display: block; font-size: 0.72rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 3px;">Waktu Pengajuan</span>
              <span style="color: #f8fafc; font-size: 0.88rem;">${created.date} pukul ${created.time}</span>
            </div>
            <div>
              <span style="display: block; font-size: 0.72rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 3px;">Alamat</span>
              <span style="color: #f8fafc; font-size: 0.88rem;">${request.address || '-'}</span>
            </div>
          </div>

          <!-- Additional Details -->
          <div style="margin-bottom: 18px;">
            <span style="display: block; font-size: 0.85rem; font-weight: 700; color: #f8fafc; margin-bottom: 6px;">Detail Formulir Layanan:</span>
            ${detailsHtml}
          </div>
          
          <!-- Status Update Control -->
          <div style="padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.08);">
            <label for="swal-update-status" style="display: block; font-size: 0.82rem; font-weight: 700; color: #d4a24e; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.04em;">
              Perbarui Status Layanan:
            </label>
            <select id="swal-update-status" style="display: block; width: 100%; padding: 10px 14px; font-size: 0.92rem; border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; background: #1c1c24; color: #f8fafc; outline: none; box-sizing: border-box;">
              <option value="Pending" ${request.status === 'Pending' ? 'selected' : ''}>⏳ Pending (Menunggu Konfirmasi)</option>
              <option value="In Progress" ${request.status === 'In Progress' ? 'selected' : ''}>⚙️ In Progress (Sedang Diproses)</option>
              <option value="Completed" ${request.status === 'Completed' ? 'selected' : ''}>✅ Completed (Pelayanan Selesai)</option>
            </select>
          </div>
        </div>
      `,
      preConfirm: () => {
        const newStatus = document.getElementById('swal-update-status').value;
        if (newStatus === request.status) {
          return null;
        }

        return api.put(`/api/service-requests/${request._id}/status`, {
          status: newStatus,
        }).then(() => {
          return { newStatus };
        }).catch(err => {
          Swal.showValidationMessage(`Gagal memperbarui: ${err.message || err}`);
        });
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        setServiceRequests(prevRequests =>
          prevRequests.map(req =>
            req._id === request._id ? { ...req, status: result.value.newStatus } : req
          )
        );
        Swal.fire({
          title: 'Berhasil!',
          text: 'Status permintaan pelayanan berhasil diperbarui.',
          icon: 'success',
          background: '#131318',
          color: '#f8fafc',
          confirmButtonColor: '#d4a24e'
        });
      }
    });
  };

  return (
    <div className="service-requests-page">
      {/* Header */}
      <div className="sr-header">
        <div className="sr-title-group">
          <div className="sr-title-icon">
            <ClipboardList size={24} />
          </div>
          <div className="sr-title-text">
            <h1>Admin Dashboard - Service Requests</h1>
            <p>Kelola dan pantau seluruh permohonan pelayanan jemaat gereja</p>
          </div>
        </div>

        <div className="sr-header-actions">
          <button
            className="sr-btn-refresh"
            onClick={fetchServiceRequests}
            disabled={isRefreshing}
          >
            <RotateCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Memuat...' : 'Refresh Data'}</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="sr-stats-grid">
        <div
          className={`sr-stat-card ${filterStatus === '' ? 'active' : ''}`}
          onClick={() => setFilterStatus('')}
        >
          <div className="sr-stat-info">
            <span className="sr-stat-label">Total Permintaan</span>
            <span className="sr-stat-value">{stats.total}</span>
          </div>
          <div className="sr-stat-icon-wrapper sr-stat-icon-all">
            <Inbox size={20} />
          </div>
        </div>

        <div
          className={`sr-stat-card ${filterStatus === 'Pending' ? 'active' : ''}`}
          onClick={() => setFilterStatus(filterStatus === 'Pending' ? '' : 'Pending')}
        >
          <div className="sr-stat-info">
            <span className="sr-stat-label">Pending</span>
            <span className="sr-stat-value">{stats.pending}</span>
          </div>
          <div className="sr-stat-icon-wrapper sr-stat-icon-pending">
            <Clock size={20} />
          </div>
        </div>

        <div
          className={`sr-stat-card ${filterStatus === 'In Progress' ? 'active' : ''}`}
          onClick={() => setFilterStatus(filterStatus === 'In Progress' ? '' : 'In Progress')}
        >
          <div className="sr-stat-info">
            <span className="sr-stat-label">In Progress</span>
            <span className="sr-stat-value">{stats.inProgress}</span>
          </div>
          <div className="sr-stat-icon-wrapper sr-stat-icon-progress">
            <Activity size={20} />
          </div>
        </div>

        <div
          className={`sr-stat-card ${filterStatus === 'Completed' ? 'active' : ''}`}
          onClick={() => setFilterStatus(filterStatus === 'Completed' ? '' : 'Completed')}
        >
          <div className="sr-stat-info">
            <span className="sr-stat-label">Completed</span>
            <span className="sr-stat-value">{stats.completed}</span>
          </div>
          <div className="sr-stat-icon-wrapper sr-stat-icon-completed">
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="sr-toolbar">
        <div className="sr-toolbar-left">
          {/* Search Box */}
          <div className="sr-search-box">
            <Search size={16} className="sr-search-icon" />
            <input
              type="text"
              placeholder="Cari nama, layanan, nomor HP..."
              className="sr-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="sr-search-clear"
                onClick={() => setSearchTerm('')}
                title="Hapus pencarian"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Service Type Filter */}
          <select
            className="sr-filter-select"
            value={filterServiceType}
            onChange={(e) => setFilterServiceType(e.target.value)}
          >
            <option value="">Semua Jenis Layanan</option>
            <option value="Baptism">Baptisan (Baptism)</option>
            <option value="Marriage">Pernikahan (Marriage)</option>
            <option value="Child">Penyerahan Anak (Child Dedication)</option>
          </select>

          {/* Status Filter */}
          <select
            className="sr-filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="sr-toolbar-right">
          {(searchTerm || filterServiceType || filterStatus || sortField !== 'createdAt' || sortOrder !== 'desc') && (
            <button className="sr-btn-reset" onClick={handleResetFilters}>
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 mb-5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchServiceRequests}
            className="text-xs px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 font-semibold"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Main Table Card */}
      <div className="sr-table-card">
        {loading ? (
          <div className="sr-loading-state">
            <div className="sr-spinner"></div>
            <span className="text-slate-400 text-sm font-medium">Memuat data permintaan...</span>
          </div>
        ) : filteredAndSortedRequests.length === 0 ? (
          <div className="sr-empty-state">
            <div className="sr-empty-icon">
              <Inbox size={28} />
            </div>
            <h3 className="sr-empty-title">Tidak ada permintaan ditemukan</h3>
            <p className="sr-empty-desc">
              {searchTerm || filterServiceType || filterStatus
                ? 'Tidak ada data yang cocok dengan kriteria pencarian Anda.'
                : 'Belum ada permohonan pelayanan jemaat yang masuk.'}
            </p>
          </div>
        ) : (
          <>
            <div className="sr-table-wrapper">
              <table className="sr-table">
                <thead className="sr-thead">
                  <tr>
                    <th
                      className="sr-th sortable"
                      onClick={() => handleSort('serviceType')}
                      title="Klik untuk mengurutkan"
                    >
                      <div className="sr-th-content">
                        <span>Jenis Layanan</span>
                        {sortField === 'serviceType' && (
                          <span className="sr-sort-icon">
                            {sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="sr-th sortable"
                      onClick={() => handleSort('fullName')}
                      title="Klik untuk mengurutkan"
                    >
                      <div className="sr-th-content">
                        <span>Nama Pemohon</span>
                        {sortField === 'fullName' && (
                          <span className="sr-sort-icon">
                            {sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="sr-th">Kontak</th>
                    <th
                      className="sr-th sortable"
                      onClick={() => handleSort('status')}
                      title="Klik untuk mengurutkan"
                    >
                      <div className="sr-th-content">
                        <span>Status</span>
                        {sortField === 'status' && (
                          <span className="sr-sort-icon">
                            {sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="sr-th sortable"
                      onClick={() => handleSort('createdAt')}
                      title="Klik untuk mengurutkan"
                    >
                      <div className="sr-th-content">
                        <span>Tanggal Diajukan</span>
                        {sortField === 'createdAt' && (
                          <span className="sr-sort-icon">
                            {sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="sr-th" style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody className="sr-tbody">
                  {paginatedRequests.map((request) => {
                    const created = formatDate(request.createdAt);
                    const cleanPhone = getCleanPhone(request.phoneNumber);
                    const initials = (request.fullName || '?')
                      .split(' ')
                      .map(w => w[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase();

                    return (
                      <tr key={request._id || Math.random()}>
                        {/* Service Type */}
                        <td className="sr-td">
                          {getServiceBadge(request.serviceType)}
                        </td>

                        {/* Full Name */}
                        <td className="sr-td">
                          <div className="sr-member-cell">
                            <div className="sr-member-avatar">
                              {initials}
                            </div>
                            <div className="sr-member-info">
                              <span className="sr-member-name">{request.fullName || '-'}</span>
                              {request.address && (
                                <span className="sr-member-sub" title={request.address}>
                                  {request.address}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Phone Number */}
                        <td className="sr-td">
                          <div className="sr-phone-cell">
                            <Phone size={13} className="text-slate-500" />
                            <span>{request.phoneNumber || '-'}</span>
                            {cleanPhone && (
                              <a
                                href={`https://wa.me/${cleanPhone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="sr-phone-wa-btn"
                                title="Hubungi via WhatsApp"
                              >
                                <MessageCircle size={13} />
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="sr-td">
                          {getStatusPill(request.status)}
                        </td>

                        {/* Requested On */}
                        <td className="sr-td">
                          <div className="sr-date-cell">
                            <span className="sr-date-main">{created.date}</span>
                            {created.time && (
                              <span className="sr-date-time">{created.time} WIB</span>
                            )}
                          </div>
                        </td>

                        {/* Action Buttons */}
                        <td className="sr-td" style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => handleOpenDetailsModal(request)}
                            className="sr-btn-action"
                            title="Lihat Detail Permintaan"
                          >
                            <Eye size={14} />
                            <span>Detail</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="sr-pagination">
              <div className="sr-pagination-info">
                <span>
                  Menampilkan {filteredAndSortedRequests.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{' '}
                  {Math.min(currentPage * pageSize, filteredAndSortedRequests.length)} dari{' '}
                  <strong className="text-slate-200">{filteredAndSortedRequests.length}</strong> permohonan
                </span>
                <div className="flex items-center gap-1.5 ml-2">
                  <span className="text-xs text-slate-400">Baris:</span>
                  <select
                    className="sr-page-size-select"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              <div className="sr-pagination-controls">
                <button
                  className="sr-page-btn"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={14} />
                  <span>Sebelumnya</span>
                </button>
                <span className="sr-page-current">
                  {currentPage} / {totalPages}
                </span>
                <button
                  className="sr-page-btn"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <span>Selanjutnya</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ServiceRequestDashboard;
