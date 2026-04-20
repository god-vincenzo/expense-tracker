import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createExpense } from '../redux/expenseSlice';
import ExpenseForm from '../components/ExpenseForm';

export default function AddExpense() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    try {
      await dispatch(createExpense(data)).unwrap();
      toast.success('Expense added successfully! 🎉');
      navigate('/expenses');
    } catch (err) {
      toast.error('Failed to add expense: ' + (err?.message || 'Unknown error'));
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h2 className="page-heading">Add New Expense</h2>
          <p className="page-subheading">Record a new transaction</p>
        </div>
      </div>

      <div className="card" style={{ padding: 32 }}>
        <ExpenseForm onSubmit={handleSubmit} onCancel={() => navigate('/expenses')} />
      </div>
    </div>
  );
}
