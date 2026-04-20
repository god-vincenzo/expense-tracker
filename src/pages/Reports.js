import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend, LineElement, PointElement, Filler
} from 'chart.js';
import {
  fetchExpenses, fetchMonthlySummary, fetchCategorySummary, fetchDashboardStats
} from '../redux/expenseSlice';
import { formatCurrency, CATEGORY_COLORS, CATEGORY_ICONS, MONTH_NAMES } from '../utils/helpers';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  Tooltip, Legend, LineElement, PointElement, Filler
);

const tooltipDefaults = {
  backgroundColor: '#181824',
  borderColor: 'rgba(255,255,255,0.1)',
  borderWidth: 1,
  titleColor: '#f0f0ff',
  bodyColor: 'rgba(240,240,255,0.7)',
  padding: 12,
  cornerRadius: 10,
};

export default function Reports() {
  const dispatch = useDispatch();
  const { list, monthlySummary, categorySummary, stats } = useSelector(s => s.expenses);

  useEffect(() => {
    dispatch(fetchExpenses());
    dispatch(fetchMonthlySummary());
    dispatch(fetchCategorySummary());
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  // Bar chart - monthly
  const barData = {
    labels: monthlySummary.map(m => MONTH_NAMES[m.month]),
    datasets: [{
      label: 'Monthly Spending (₹)',
      data: monthlySummary.map(m => m.total),
      backgroundColor: monthlySummary.map((_, i) =>
        i % 2 === 0 ? 'rgba(124,106,247,0.7)' : 'rgba(167,139,250,0.7)'
      ),
      borderColor: '#7c6af7',
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  // Line chart - trend
  const lineData = {
    labels: monthlySummary.map(m => MONTH_NAMES[m.month]),
    datasets: [{
      label: 'Spending Trend',
      data: monthlySummary.map(m => m.total),
      borderColor: '#34d399',
      backgroundColor: 'rgba(52,211,153,0.08)',
      borderWidth: 2.5,
      pointBackgroundColor: '#34d399',
      pointRadius: 5,
      pointHoverRadius: 7,
      tension: 0.4,
      fill: true,
    }],
  };

  // Doughnut - category
  const pieData = {
    labels: categorySummary.map(c => c.category),
    datasets: [{
      data: categorySummary.map(c => c.total),
      backgroundColor: categorySummary.map(c => CATEGORY_COLORS[c.category] || '#94a3b8'),
      borderWidth: 0,
      hoverOffset: 10,
    }],
  };

  const axisDefaults = {
    grid: { color: 'rgba(255,255,255,0.04)' },
    ticks: { color: 'rgba(240,240,255,0.5)', font: { family: 'DM Sans' } },
  };

  const commonOpts = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: tooltipDefaults },
    scales: {
      x: axisDefaults,
      y: { ...axisDefaults, ticks: { ...axisDefaults.ticks, callback: v => `₹${(v / 1000).toFixed(0)}k` } },
    },
  };

  const pieOpts = {
    responsive: true,
    cutout: '65%',
    plugins: {
      legend: { display: false },
      tooltip: {
        ...tooltipDefaults,
        callbacks: { label: ctx => ` ${ctx.label}: ${formatCurrency(ctx.raw)}` },
      },
    },
  };

  // Top categories
  const topCats = [...categorySummary].sort((a, b) => b.total - a.total).slice(0, 5);
  const maxCatTotal = topCats[0]?.total || 1;

  // This month vs last month
  const currentMonth = new Date().getMonth() + 1;
  const thisMonthData = monthlySummary.find(m => m.month === currentMonth);
  const lastMonthData = monthlySummary.find(m => m.month === currentMonth - 1);
  const change = thisMonthData && lastMonthData
    ? (((thisMonthData.total - lastMonthData.total) / lastMonthData.total) * 100).toFixed(1)
    : null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-heading">Reports & Analytics</h2>
          <p className="page-subheading">Visual breakdown of your spending patterns</p>
        </div>
      </div>

      {/* Summary row */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card purple">
          <div className="stat-icon">💰</div>
          <div className="stat-label">Total Spend</div>
          <div className="stat-value purple">{formatCurrency(stats.totalExpenses)}</div>
          <div className="stat-sub">All time</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">📅</div>
          <div className="stat-label">This Month</div>
          <div className="stat-value green">{formatCurrency(thisMonthData?.total || 0)}</div>
          <div className="stat-sub">
            {change !== null
              ? <span style={{ color: parseFloat(change) > 0 ? 'var(--red)' : 'var(--green)' }}>
                  {parseFloat(change) > 0 ? '▲' : '▼'} {Math.abs(change)}% vs last month
                </span>
              : 'Current month'}
          </div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon">🏆</div>
          <div className="stat-label">Top Category</div>
          <div className="stat-value orange" style={{ fontSize: 20, paddingTop: 4 }}>
            {topCats[0] ? `${CATEGORY_ICONS[topCats[0].category]} ${topCats[0].category}` : '—'}
          </div>
          <div className="stat-sub">{topCats[0] ? formatCurrency(topCats[0].total) : ''}</div>
        </div>
        <div className="stat-card pink">
          <div className="stat-icon">📈</div>
          <div className="stat-label">Avg/Month</div>
          <div className="stat-value pink">
            {monthlySummary.length > 0
              ? formatCurrency(stats.totalExpenses / monthlySummary.length)
              : '₹0'}
          </div>
          <div className="stat-sub">Over {monthlySummary.length} month{monthlySummary.length !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="charts-grid" style={{ marginBottom: 20 }}>
        <div className="chart-card">
          <div className="chart-title">Monthly Bar Chart</div>
          {monthlySummary.length > 0
            ? <Bar data={barData} options={commonOpts} height={200} />
            : <div className="empty-state" style={{ padding: 40 }}><div className="big-icon">📊</div><p>No data</p></div>}
        </div>
        <div className="chart-card">
          <div className="chart-title">Spending Trend (Line)</div>
          {monthlySummary.length > 0
            ? <Line data={lineData} options={commonOpts} height={200} />
            : <div className="empty-state" style={{ padding: 40 }}><div className="big-icon">📈</div><p>No data</p></div>}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-title">Category Breakdown</div>
          {categorySummary.length > 0 ? (
            <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
              <div style={{ width: 170, flexShrink: 0 }}>
                <Doughnut data={pieData} options={pieOpts} />
              </div>
              <div className="cat-legend" style={{ flex: 1 }}>
                {categorySummary.map(c => (
                  <div className="cat-row" key={c.category}>
                    <div className="cat-dot" style={{ background: CATEGORY_COLORS[c.category] || '#94a3b8' }} />
                    <span className="cat-name">{CATEGORY_ICONS[c.category]} {c.category}</span>
                    <span className="cat-val">{formatCurrency(c.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: 40 }}><div className="big-icon">🍩</div><p>No data</p></div>
          )}
        </div>

        <div className="chart-card">
          <div className="chart-title">Top Spending Categories</div>
          {topCats.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
              {topCats.map(c => {
                const pct = ((c.total / maxCatTotal) * 100).toFixed(0);
                return (
                  <div key={c.category}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                      <span style={{ color: 'var(--text-sub)' }}>{CATEGORY_ICONS[c.category]} {c.category}</span>
                      <span style={{ fontWeight: 600, color: CATEGORY_COLORS[c.category] }}>{formatCurrency(c.total)}</span>
                    </div>
                    <div style={{ background: 'var(--bg3)', borderRadius: 6, height: 8, overflow: 'hidden' }}>
                      <div style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: CATEGORY_COLORS[c.category] || '#7c6af7',
                        borderRadius: 6,
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: 40 }}><div className="big-icon">📊</div><p>No data</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
