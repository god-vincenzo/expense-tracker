import React, { useState } from 'react';
import { CATEGORIES, CATEGORY_ICONS } from '../utils/helpers';

const today = new Date().toISOString().split('T')[0];

const empty = { title: '', amount: '', date: today, category: 'Food', notes: '' };

export default function ExpenseForm({ onSubmit, onCancel, initialData }) {
  const [form, setForm] = useState(initialData ? {
    title: initialData.title || '',
    amount: initialData.amount || '',
    date: initialData.date || today,
    category: initialData.category || 'Food',
    notes: initialData.notes || '',
  } : empty);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) errs.amount = 'Enter a valid positive amount';
    if (!form.date) errs.date = 'Date is required';
    if (!form.category) errs.category = 'Category is required';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(er => ({ ...er, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    await onSubmit({ ...form, amount: parseFloat(form.amount) });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Title *</label>
          <input
            className="form-control"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Lunch at canteen"
          />
          {errors.title && <div style={{ color: 'var(--red)', fontSize: 12, marginTop: 4 }}>{errors.title}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Amount (₹) *</label>
          <input
            className="form-control"
            name="amount"
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={handleChange}
            placeholder="0.00"
          />
          {errors.amount && <div style={{ color: 'var(--red)', fontSize: 12, marginTop: 4 }}>{errors.amount}</div>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Date *</label>
          <input
            className="form-control"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
          />
          {errors.date && <div style={{ color: 'var(--red)', fontSize: 12, marginTop: 4 }}>{errors.date}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Category *</label>
          <select className="form-control" name="category" value={form.category} onChange={handleChange}>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
            ))}
          </select>
          {errors.category && <div style={{ color: 'var(--red)', fontSize: 12, marginTop: 4 }}>{errors.category}</div>}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Notes (optional)</label>
        <textarea
          className="form-control"
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Any additional notes..."
          rows={3}
          style={{ resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : initialData ? '✓ Update Expense' : '+ Add Expense'}
        </button>
      </div>
    </form>
  );
}
