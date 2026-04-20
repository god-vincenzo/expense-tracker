export const CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Health',
  'Education',
  'Entertainment',
  'Utilities',
  'Other',
];

export const CATEGORY_ICONS = {
  Food: '🍜',
  Transport: '🚗',
  Shopping: '🛍️',
  Health: '❤️',
  Education: '📚',
  Entertainment: '🎮',
  Utilities: '💡',
  Other: '📦',
};

export const CATEGORY_COLORS = {
  Food: '#fbbf24',
  Transport: '#22d3ee',
  Shopping: '#f472b6',
  Health: '#34d399',
  Education: '#a78bfa',
  Entertainment: '#fb923c',
  Utilities: '#60a5fa',
  Other: '#94a3b8',
};

export const MONTH_NAMES = [
  '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const getAmountClass = (amount) => {
  if (amount >= 5000) return 'high';
  if (amount >= 1000) return 'mid';
  return 'low';
};

export const getBadgeClass = (category) => category?.toLowerCase() || 'other';
