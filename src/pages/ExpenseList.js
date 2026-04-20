import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchExpenses, deleteExpense, updateExpense } from '../redux/expenseSlice';
import {
  formatCurrency, formatDate, CATEGORIES,
  CATEGORY_ICONS, getAmountClass, getBadgeClass
} from '../utils/helpers';
import ExpenseModal from '../components/ExpenseModal';

export default function ExpenseList() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector(s => s.expenses);

  const [filters, setFilters] = useState({ startDate: '', endDate: '', category: '' });
  const [editExpense, setEditExpense] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { dispatch(fetchExpenses()); }, [dispatch]);

  const handleFilter = () => {
    dispatch(fetchExpenses(filters));
  };

  const handleReset = () => {
    const reset = { startDate: '', endDate: '', category: '' };
    setFilters(reset);
    dispatch(fetchExpenses());
  };

  const handleEdit = (expense) => {
    setEditExpense(expense);
    setShowModal(true);
  };

  const handleUpdate = async (data) => {
    try {
      await dispatch(updateExpense({ id: editExpense.id, expense: data })).unwrap();
      toast.success('Expense updated!');
      setShowModal(false);
      setEditExpense(null);
      dispatch(fetchExpenses());
    } catch {
      toast.error('Failed to update expense.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteExpense(id)).unwrap();
      toast.success('Expense deleted.');
      setDeleteId(null);
    } catch {
      toast.error('Failed to delete expense.');
    }
  };

  const sorted = [...list].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-heading">All Expenses</h2>
          <p className="page-subheading">{list.length} transaction{list.length !== 1 ? 's' : ''} found</p>
        </div>
        <Link to="/add" className="btn btn-primary">+ Add Expense</Link>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <input
          type="date"
          className="filter-control"
          value={filters.startDate}
          onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))}
          placeholder="Start date"
        />
        <input
          type="date"
          className="filter-control"
          value={filters.endDate}
          onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))}
          placeholder="End date"
        />
        <select
          className="filter-control"
          value={filters.category}
          onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
        </select>
        <button className="btn btn-primary btn-sm" onClick={handleFilter}>Apply</button>
        <button className="btn btn-ghost btn-sm" onClick={handleReset}>Reset</button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="spinner" />
      ) : sorted.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="big-icon">🧾</div>
            <h3>No expenses found</h3>
            <p style={{ marginBottom: 16 }}>Try adjusting filters or add a new expense</p>
            <Link to="/add" className="btn btn-primary btn-sm">+ Add Expense</Link>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Category</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((exp, i) => (
                <tr key={exp.id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{i + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{CATEGORY_ICONS[exp.category] || '📦'}</span>
                      {exp.title}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getBadgeClass(exp.category)}`}>
                      {exp.category}
                    </span>
                  </td>
                  <td>{formatDate(exp.date)}</td>
                  <td>
                    <span className={`amount ${getAmountClass(exp.amount)}`}>
                      {formatCurrency(exp.amount)}
                    </span>
                  </td>
                  <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {exp.notes || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>—</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleEdit(exp)} title="Edit">✏️</button>
                      <button className="btn btn-danger btn-icon btn-sm" onClick={() => setDeleteId(exp.id)} title="Delete">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {showModal && (
        <ExpenseModal
          title="Edit Expense"
          initialData={editExpense}
          onClose={() => { setShowModal(false); setEditExpense(null); }}
          onSubmit={handleUpdate}
        />
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="confirm-dialog">
              <div className="big-icon">🗑️</div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, marginBottom: 8 }}>Delete Expense?</h3>
              <p>This action cannot be undone. The expense will be permanently removed.</p>
              <div className="actions">
                <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={() => handleDelete(deleteId)}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
