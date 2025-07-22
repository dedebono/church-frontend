// src/components/TransactionTable.js
import React from 'react';
import Swal from 'sweetalert2'; // For in-table confirmation

const TransactionTable = ({ transactions, onDelete, formatIDR, loading }) => {
  // Handle delete with in-table confirmation, check if onDelete is a function
  const handleDeleteClick = (id, description) => {
    if (typeof onDelete !== 'function') {
      console.error('onDelete is not a function');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Delete functionality is not available.',
      });
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: `Delete transaction: ${description}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        onDelete(id); // Call the onDelete prop
      }
    });
  };

  return (
    <table className="transaction-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Type</th>
          <th>Category</th>
          <th>Amount (IDR)</th>
          <th>Description</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {transactions.length === 0 ? (
          <tr>
            <td colSpan="6">No transactions found</td>
          </tr>
        ) : (
          transactions.map((transaction) => (
            <tr key={transaction._id}>
              <td>{new Date(transaction.transactionDate).toLocaleDateString('id-ID')}</td>
              <td>{transaction.type}</td>
              <td>{transaction.category}</td>
              <td>{formatIDR(transaction.amount)}</td>
              <td>{transaction.description}</td>
              <td>
                <button
                  onClick={() => handleDeleteClick(transaction._id, transaction.description)}
                  disabled={loading || typeof onDelete !== 'function'}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default TransactionTable;