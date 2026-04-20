import React, { useState } from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import ExpenseList from './pages/ExpenseList';
import AddExpense from './pages/AddExpense';
import Reports from './pages/Reports';

const NAV_ITEMS = [
  { path: '/', icon: '⬡', label: 'Dashboard' },
  { path: '/expenses', icon: '⊟', label: 'Expenses' },
  { path: '/add', icon: '⊕', label: 'Add Expense' },
  { path: '/reports', icon: '◑', label: 'Reports' },
];

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/expenses': 'All Expenses',
  '/add': 'Add Expense',
  '/reports': 'Reports & Analytics',
};

function Layout() {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'Expense Tracker';

  return (
    <div className="app-wrapper">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">💎</div>
          <div className="logo-text">
            Spend<span>Wise</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Menu</div>
          {NAV_ITEMS.map(({ path, icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              end={path === '/'}
            >
              <span className="icon">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, marginTop: 8 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '0 12px', lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--text-sub)', fontFamily: 'Syne, sans-serif' }}>SpendWise</strong><br />
            Digital Expense Tracker<br />
            <span style={{ opacity: 0.6 }}>v1.0 · College Project</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        <div className="top-bar">
          <h1 className="top-bar-title">{title}</h1>
          <div className="top-bar-actions">
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), var(--pink))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'Syne, sans-serif'
            }}>S</div>
          </div>
        </div>

        <div className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/expenses" element={<ExpenseList />} />
            <Route path="/add" element={<AddExpense />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </div>
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#181824',
            color: '#f0f0ff',
            border: '1px solid rgba(255,255,255,0.1)',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 14,
          },
          success: { iconTheme: { primary: '#34d399', secondary: '#181824' } },
          error: { iconTheme: { primary: '#f87171', secondary: '#181824' } },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Layout />
    </HashRouter>
  );
}
