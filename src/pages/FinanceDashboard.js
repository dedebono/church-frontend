// src/components/FinanceDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import api from './admin/api/API'; // Assuming this axios instance is configured
import TransactionTable from './TransactionTable';
import SummaryChart from './SummaryChart';
import { format, subYears } from 'date-fns';
import './FinanceDashboard.css';
import Swal from 'sweetalert2';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom'; // Add this import

const FinanceDashboard = () => {
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({
    startDate: format(subYears(new Date(), 1), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    category: '',
  });
  const [form, setForm] = useState({
    memberId: '',
    type: 'INCOME',
    category: '',
    amount: '',
    description: '',
    transactionDate: format(new Date(), 'yyyy-MM-dd'),
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const navigate = useNavigate(); // Add this hook

  // Helper function to format numbers as IDR
  const formatIDR = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Fetch precomputed summary with fallback calculation
  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      const year = format(new Date(filters.startDate), 'yyyy');
      const month = format(new Date(filters.startDate), 'MM');
      const { data } = await api.get(`/api/finance/summary?year=${year}&month=${month}`);

      if (data && typeof data.totalIncome === 'number' && typeof data.totalExpense === 'number') {
        setSummary({
          totalIncome: data.totalIncome,
          totalExpense: data.totalExpense,
          balance: data.totalIncome - data.totalExpense,
        });
      } else {
        throw new Error('Invalid summary data');
      }
    } catch (err) {
      console.error('Error fetching summary:', err);
      setError(err.response?.data?.message || 'Failed to fetch summary, calculating from transactions');

      try {
        const params = new URLSearchParams({
          startDate: filters.startDate,
          endDate: filters.endDate,
        });
        const { data: transactions } = await api.get(`/api/finance/${params.toString()}`);
        const totalIncome = transactions
          .filter((t) => t.type === 'INCOME')
          .reduce((sum, t) => sum + Number(t.amount), 0);
        const totalExpense = transactions
          .filter((t) => t.type === 'EXPENSE')
          .reduce((sum, t) => sum + Number(t.amount), 0);
        setSummary({
          totalIncome,
          totalExpense,
          balance: totalIncome - totalExpense,
        });
      } catch (fallbackErr) {
        setError(fallbackErr.response?.data?.message || 'Failed to calculate summary');
        toast.error(fallbackErr.response?.data?.message || 'Failed to calculate summary');
      }
    } finally {
      setLoading(false);
    }
  }, [filters.startDate, filters.endDate]);

  //handle logout
   // Add this logout handler function
  const handleLogout = () => {
    // Clear authentication tokens
    localStorage.removeItem('adminToken');
    localStorage.removeItem('isAdmin');
    
    // Clear user session data
    sessionStorage.clear();
    
    // Redirect to login page
    navigate('/login');
    
    // Show logout confirmation
    toast.success('You have been logged out successfully');
  };

  // Fetch transactions with filters
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        ...(filters.category && { category: filters.category }),
      });
      const { data } = await api.get(`/api/finance/transactions?${params.toString()}`);
      setTransactions(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch transactions');
      toast.error(err.response?.data?.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [filters.startDate, filters.endDate, filters.category]);

  // Handle member search input change
  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedMember(null);

    if (query.length > 2) {
      try {
        const response = await api.get(`/api/members/search/${encodeURIComponent(query)}`);
        const data = response.data;

        if (!Array.isArray(data) || data.length === 0) {
          setSearchResults([]);
          Swal.fire({
            icon: 'info',
            title: 'No results found',
            text: 'No members match the search query.',
          });
          return;
        }

        setSearchResults(data);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setSearchResults([]);
          Swal.fire({
            icon: 'info',
            title: 'No members found',
            text: 'There are no members that match your search.',
          });
        } else {
          console.error('Error during search:', err);
          Swal.fire({
            icon: 'error',
            title: 'Search Error',
            text: err.response?.data?.message || 'An error occurred while searching for members.',
          });
        }
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  // Handle member selection
  const handleSelectMember = (member) => {
    setSelectedMember(member);
    setSearchQuery(member.fullName || '');
    setForm((prev) => ({
      ...prev,
      memberId: member._id,
    }));
    setSearchResults([]);
  };

  // Clear member selection
  const clearMemberSelection = () => {
    setSelectedMember(null);
    setSearchQuery('');
    setForm((prev) => ({ ...prev, memberId: '' }));
    setSearchResults([]);
  };

  // Handle form submission for new transaction
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.memberId) {
      setError('Please select a member for the transaction.');
      toast.error('Please select a member for the transaction.');
      return;
    }
    try {
      setLoading(true);
      await api.post('/api/finance', form);
      setForm({
        memberId: '',
        type: 'INCOME',
        category: '',
        amount: '',
        description: '',
        transactionDate: format(new Date(), 'yyyy-MM-dd'),
      });
      setSearchQuery('');
      setSelectedMember(null);
      setSearchResults([]);
      setError('');
      fetchSummary();
      fetchTransactions();
      toast.success('Transaction added successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create transaction');
      toast.error(err.response?.data?.message || 'Failed to create transaction');
    } finally {
      setLoading(false);
    }
  };

  // Handle transaction deletion
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this transaction?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await api.delete(`/api/finance/${id}`);
        fetchSummary();
        fetchTransactions();
        toast.success('Transaction deleted successfully!');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete transaction');
        toast.error(err.response?.data?.message || 'Failed to delete transaction');
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    fetchSummary();
    fetchTransactions();
  };

  // Fetch data on mount
  useEffect(() => {
    fetchSummary();
    fetchTransactions();
  }, [fetchSummary, fetchTransactions]);

  //HTML
  return (
    <div className='background'>
    <div className="finance-dashboard">
      <h2>Finance Dashboard</h2>
      {error && <p className="error">{error}</p>}
      {loading && <p>Loading...</p>}

      {/* Add logout button at the top */}
      <div className="logout-container">
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>

      <div className='dashboardFinance'>
      {/* Summary Section */}
      <section className="summary">
        <h3>Data Keuangan Gereja</h3>
        <div className="summary-stats">
          <p>Total Income: {formatIDR(summary.totalIncome)}</p>
          <p>Total Expenses: {formatIDR(summary.totalExpense)}</p>
          <p>Balance: {formatIDR(summary.balance)}</p>
        </div>
        <SummaryChart summary={summary} formatIDR={formatIDR} />
      </section>

      {/* Transaction Form */}
      <section className="transaction-form">
        <h3>Tambahkan Transaksi</h3>
        <form onSubmit={handleSubmit}>
          <div className="member-search-container">
            <input
              type="text"
              placeholder="cari nama member"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((member) => (
                  <div
                    key={member._id}
                    className={`search-result-item ${
                      selectedMember && selectedMember._id === member._id ? 'selected-member' : ''
                    }`}
                    onClick={() => handleSelectMember(member)}
                  >
                    <p>{member.fullName || 'Unnamed Member'}</p>
                  </div>
                ))}
              </div>
            )}
            {selectedMember && (
              <div className="selected-member">
                <p>Member terpilih: {selectedMember.fullName}</p>
                <button type="button" onClick={clearMemberSelection}>
                  Clear
                </button>
              </div>
            )}
            <input type="hidden" name="memberId" value={form.memberId} />
          </div>

          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            required
          >
            <option value="INCOME">Pemasukan</option>
            <option value="EXPENSE">Pengeluaran</option>
          </select>
          <input
            type="text"
            placeholder="Kategori (e.g., Perpuluhan, dana misi)"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Jumlah (IDR)"
            value={form.amount}
            onChange={(e) =>
              setForm({ ...form, amount: parseFloat(e.target.value) || '' })
            }
            required
            min="0"
            step="1"
          />
          <input
            type="text"
            placeholder="Keterangan"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            type="date"
            value={form.transactionDate}
            onChange={(e) => setForm({ ...form, transactionDate: e.target.value })}
            required
          />
          <button type="submit" disabled={loading || !form.memberId}>
            Tambah
          </button>
        </form>
      </section>
    </div>

      {/* Filters Section */}
      <section className="filters">
        <h3>Filter Transactions</h3>
        <div className="filter-form">
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
          />
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
          />
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
          >
            <option value="">Semua Kategori</option>
            <option value="Perpuluhan">Perpuluhan</option>
            <option value="persembahan">Persembahan</option>
            <option value="dana misi">Dana misi</option>
            <option value="Kunjungan">Kunjungan</option>
            <option value="KUNJUNGAN JEMAAT">Kunjungan Jemaat</option>
            <option value="Salary">Salary</option>
          </select>
          <button 
          onClick={applyFilters}>Apply Filters</button>
        </div>
      </section>

      {/* Transactions Table */}
      <section className="transactions">
        <h3>Transactions</h3>
        <TransactionTable
          transactions={transactions}
          onDelete={handleDelete}
          formatIDR={formatIDR}
          loading={loading}
        />
      </section>

      <ToastContainer position="top-center" />
    </div>
    </div>
  );
};

export default FinanceDashboard;