import React from 'react';
import ExpenseForm from './ExpenseForm';

export default function ExpenseModal({ title, initialData, onClose, onSubmit }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon"
            style={{ fontSize: 18 }}
          >✕</button>
        </div>
        <ExpenseForm
          initialData={initialData}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
