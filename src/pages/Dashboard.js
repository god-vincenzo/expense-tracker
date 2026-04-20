import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend, Title
} from 'chart.js';
import {
  fetchExpenses, fetchMonthlySummary,
  fetchCategorySummary, fetchDashboardStats
} from '../redux/expenseSlice';
import {
  formatCurrency, formatDate, CATEGORY_ICONS,
  CATEGORY_COLORS, MONTH_NAMES, getAmountClass
} from '../utils/helpers';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title);

export default function Dashboard() {
  const dispatch = useDispatch();
  const { list, monthlySummary, categorySummary, stats, loading } = useSelector(s => s.expenses);

  useEffect(() => {
    dispatch(fetchExpenses());
    dispatch(fetchMonthlySummary());
    dispatch(fetchCategorySummary());
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const recent = [...list].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

  const barData = {
    labels: monthlySummary.map(m => MONTH_NAMES[m.month]),
    datasets: [{
      label: 'Spending (₹)',
      data: monthlySummary.map(m => m.total),
      backgroundColor: 'rgba(124,106,247,0.7)',
      borderColor: '#7c6af7',
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const pieData = {
    labels: categorySummary.map(c => c.category),
    datasets: [{
      data: categorySummary.map(c => c.total),
      backgroundColor: categorySummary.map(c => CATEGORY_COLORS[c.category] || '#94a3b8'),
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  const chartOpts = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#181824',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleColor: '#f0f0ff',
        bodyColor: 'rgba(240,240,255,0.7)',
        padding: 12,
        cornerRadius: 10,
      },
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(240,240,255,0.5)', font: { family: 'DM Sans' } } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(240,240,255,0.5)', font: { family: 'DM Sans' }, callback: v => `₹${(v/1000).toFixed(0)}k` } },
    },
  };

  const pieOpts = {
    responsive: true,
    cutout: '68%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#181824',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleColor: '#f0f0ff',
        bodyColor: 'rgba(240,240,255,0.7)',
        padding: 12,
        cornerRadius: 10,
        callbacks: { label: ctx => ` ${ctx.label}: ${formatCurrency(ctx.raw)}` },
      },
    },
  };

  if (loading && list.length === 0) return <div className="spinner" />;

  return (
    <div>
      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card purple">
          <div className="stat-icon">💎</div>
          <div className="stat-label">Total Spent</div>
          <div className="stat-value purple">{formatCurrency(stats.totalExpenses)}</div>
          <div className="stat-sub">All time</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">📅</div>
          <div className="stat-label">This Month</div>
          <div className="stat-value green">{formatCurrency(stats.currentMonthTotal)}</div>
          <div className="stat-sub">Current month</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon">🧾</div>
          <div className="stat-label">Transactions</div>
          <div className="stat-value orange">{Math.round(stats.totalTransactions)}</div>
          <div className="stat-sub">Total entries</div>
        </div>
        <div className="stat-card pink">
          <div className="stat-icon">📊</div>
          <div className="stat-label">Avg. per Entry</div>
          <div className="stat-value pink">
            {stats.totalTransactions > 0
              ? formatCurrency(stats.totalExpenses / stats.totalTransactions)
              : '₹0'}
          </div>
          <div className="stat-sub">Per transaction</div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-title">Monthly Spending</div>
          {monthlySummary.length > 0
            ? <Bar data={barData} options={chartOpts} height={200} />
            : <div className="empty-state" style={{ padding: 40 }}>
                <div className="big-icon">📊</div>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No data yet</p>
              </div>
          }
        </div>

        <div className="chart-card">
          <div className="chart-title">Spending by Category</div>
          {categorySummary.length > 0 ? (
            <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
              <div style={{ width: 160, flexShrink: 0 }}>
                <Doughnut data={pieData} options={pieOpts} />
              </div>
              <div className="cat-legend" style={{ flex: 1 }}>
                {categorySummary.slice(0, 6).map(c => (
                  <div className="cat-row" key={c.category}>
                    <div className="cat-dot" style={{ background: CATEGORY_COLORS[c.category] || '#94a3b8' }} />
                    <span className="cat-name">{CATEGORY_ICONS[c.category]} {c.category}</span>
                    <span className="cat-val">{formatCurrency(c.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: 40 }}>
              <div className="big-icon">🍩</div>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 600 }}>Recent Transactions</h3>
          <Link to="/expenses" className="btn btn-ghost btn-sm">View all →</Link>
        </div>
        {recent.length === 0 ? (
          <div className="empty-state">
            <div className="big-icon">🧾</div>
            <h3>No expenses yet</h3>
            <p style={{ marginBottom: 16 }}>Start tracking your spending</p>
            <Link to="/add" className="btn btn-primary btn-sm">+ Add First Expense</Link>
          </div>
        ) : (
          <div className="recent-list">
            {recent.map(e => (
              <div className="recent-item" key={e.id}>
                <div className="recent-icon" style={{ background: `${CATEGORY_COLORS[e.category]}20` }}>
                  {CATEGORY_ICONS[e.category] || '📦'}
                </div>
                <div className="recent-info">
                  <div className="recent-title">{e.title}</div>
                  <div className="recent-date">{formatDate(e.date)} · {e.category}</div>
                </div>
                <div className={`recent-amount amount ${getAmountClass(e.amount)}`}>
                  {formatCurrency(e.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
