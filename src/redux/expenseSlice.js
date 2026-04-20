import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// ─── localStorage helpers ───────────────────────────────────────
const STORAGE_KEY = 'spendwise_expenses';

const loadExpenses = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveExpenses = (expenses) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
};

let nextId = (() => {
  const all = loadExpenses();
  return all.length > 0 ? Math.max(...all.map(e => e.id)) + 1 : 1;
})();

// ─── Thunks ─────────────────────────────────────────────────────
export const fetchExpenses = createAsyncThunk('expenses/fetchAll', async (filters = {}) => {
  let expenses = loadExpenses();
  if (filters.startDate) expenses = expenses.filter(e => e.date >= filters.startDate);
  if (filters.endDate) expenses = expenses.filter(e => e.date <= filters.endDate);
  if (filters.category) expenses = expenses.filter(e => e.category === filters.category);
  return expenses;
});

export const createExpense = createAsyncThunk('expenses/create', async (expense) => {
  const all = loadExpenses();
  const newExpense = { ...expense, id: nextId++ };
  all.push(newExpense);
  saveExpenses(all);
  return newExpense;
});

export const updateExpense = createAsyncThunk('expenses/update', async ({ id, expense }) => {
  const all = loadExpenses();
  const idx = all.findIndex(e => e.id === id);
  if (idx === -1) throw new Error('Expense not found');
  const updated = { ...all[idx], ...expense, id };
  all[idx] = updated;
  saveExpenses(all);
  return updated;
});

export const deleteExpense = createAsyncThunk('expenses/delete', async (id) => {
  let all = loadExpenses();
  all = all.filter(e => e.id !== id);
  saveExpenses(all);
  return id;
});

export const fetchMonthlySummary = createAsyncThunk('expenses/monthlySum', async () => {
  const all = loadExpenses();
  const map = {};
  all.forEach(e => {
    const month = new Date(e.date).getMonth() + 1;
    map[month] = (map[month] || 0) + e.amount;
  });
  return Object.entries(map)
    .map(([month, total]) => ({ month: Number(month), total }))
    .sort((a, b) => a.month - b.month);
});

export const fetchCategorySummary = createAsyncThunk('expenses/categorySum', async () => {
  const all = loadExpenses();
  const map = {};
  all.forEach(e => {
    map[e.category] = (map[e.category] || 0) + e.amount;
  });
  return Object.entries(map)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
});

export const fetchDashboardStats = createAsyncThunk('expenses/stats', async () => {
  const all = loadExpenses();
  const totalExpenses = all.reduce((s, e) => s + e.amount, 0);
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const currentMonthTotal = all
    .filter(e => {
      const d = new Date(e.date);
      return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((s, e) => s + e.amount, 0);
  return { totalExpenses, currentMonthTotal, totalTransactions: all.length };
});

// ─── Slice ──────────────────────────────────────────────────────
const expenseSlice = createSlice({
  name: 'expenses',
  initialState: {
    list: [],
    monthlySummary: [],
    categorySummary: [],
    stats: { totalExpenses: 0, currentMonthTotal: 0, totalTransactions: 0 },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchExpenses.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchExpenses.fulfilled, (s, a) => { s.loading = false; s.list = a.payload; })
      .addCase(fetchExpenses.rejected, (s, a) => { s.loading = false; s.error = a.error.message; })
      // Create
      .addCase(createExpense.fulfilled, (s, a) => { s.list.unshift(a.payload); })
      // Update
      .addCase(updateExpense.fulfilled, (s, a) => {
        const idx = s.list.findIndex(e => e.id === a.payload.id);
        if (idx !== -1) s.list[idx] = a.payload;
      })
      // Delete
      .addCase(deleteExpense.fulfilled, (s, a) => {
        s.list = s.list.filter(e => e.id !== a.payload);
      })
      // Monthly summary
      .addCase(fetchMonthlySummary.fulfilled, (s, a) => { s.monthlySummary = a.payload; })
      // Category summary
      .addCase(fetchCategorySummary.fulfilled, (s, a) => { s.categorySummary = a.payload; })
      // Dashboard stats
      .addCase(fetchDashboardStats.fulfilled, (s, a) => { s.stats = a.payload; });
  },
});

export default expenseSlice.reducer;
