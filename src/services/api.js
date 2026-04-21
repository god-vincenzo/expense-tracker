// ─── localStorage-based API (no backend required) ───────────────
const STORAGE_KEY = 'spendwise_expenses';

function getStoredExpenses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveExpenses(expenses) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function nextId() {
  const expenses = getStoredExpenses();
  return expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1;
}

// Helper to wrap results in axios-like { data } shape
const wrap = (data) => Promise.resolve({ data });

export const expenseAPI = {
  // Get all expenses with optional filters
  getAll: (filters = {}) => {
    let expenses = getStoredExpenses();

    if (filters.startDate) {
      expenses = expenses.filter(e => e.date >= filters.startDate);
    }
    if (filters.endDate) {
      expenses = expenses.filter(e => e.date <= filters.endDate);
    }
    if (filters.category) {
      expenses = expenses.filter(e => e.category === filters.category);
    }

    // Sort by date descending (newest first)
    expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    return wrap(expenses);
  },

  // Get expense by ID
  getById: (id) => {
    const expense = getStoredExpenses().find(e => e.id === id);
    if (!expense) return Promise.reject({ response: { data: { error: 'Expense not found' } } });
    return wrap(expense);
  },

  // Create new expense
  create: (expense) => {
    const expenses = getStoredExpenses();
    const newExpense = { ...expense, id: nextId() };
    expenses.push(newExpense);
    saveExpenses(expenses);
    return wrap(newExpense);
  },

  // Update expense
  update: (id, expense) => {
    const expenses = getStoredExpenses();
    const idx = expenses.findIndex(e => e.id === id);
    if (idx === -1) return Promise.reject({ response: { data: { error: 'Expense not found' } } });
    expenses[idx] = { ...expense, id };
    saveExpenses(expenses);
    return wrap(expenses[idx]);
  },

  // Delete expense
  delete: (id) => {
    let expenses = getStoredExpenses();
    expenses = expenses.filter(e => e.id !== id);
    saveExpenses(expenses);
    return wrap({ message: 'Expense deleted successfully' });
  },

  // Get monthly summary — aggregate from local data
  getMonthlySummary: () => {
    const expenses = getStoredExpenses();
    const monthMap = {};

    expenses.forEach(e => {
      const month = new Date(e.date).getMonth() + 1; // 1-12
      monthMap[month] = (monthMap[month] || 0) + Number(e.amount);
    });

    const summary = Object.entries(monthMap)
      .map(([month, total]) => ({ month: Number(month), total }))
      .sort((a, b) => a.month - b.month);

    return wrap(summary);
  },

  // Get category summary — aggregate from local data
  getCategorySummary: () => {
    const expenses = getStoredExpenses();
    const catMap = {};

    expenses.forEach(e => {
      catMap[e.category] = (catMap[e.category] || 0) + Number(e.amount);
    });

    const summary = Object.entries(catMap)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);

    return wrap(summary);
  },

  // Get dashboard stats — compute from local data
  getDashboardStats: () => {
    const expenses = getStoredExpenses();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const currentMonthTotal = expenses
      .filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, e) => sum + Number(e.amount), 0);

    return wrap({
      totalExpenses,
      currentMonthTotal,
      totalTransactions: expenses.length,
    });
  },
};

export default expenseAPI;
