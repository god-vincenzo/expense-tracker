import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { expenseAPI } from '../services/api';

// ─── Thunks ─────────────────────────────────────────────────────
export const fetchExpenses = createAsyncThunk('expenses/fetchAll', async (filters = {}, { rejectWithValue }) => {
  try {
    const response = await expenseAPI.getAll(filters);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const createExpense = createAsyncThunk('expenses/create', async (expense, { rejectWithValue }) => {
  try {
    const response = await expenseAPI.create(expense);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const updateExpense = createAsyncThunk('expenses/update', async ({ id, expense }, { rejectWithValue }) => {
  try {
    const response = await expenseAPI.update(id, expense);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const deleteExpense = createAsyncThunk('expenses/delete', async (id, { rejectWithValue }) => {
  try {
    await expenseAPI.delete(id);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const fetchMonthlySummary = createAsyncThunk('expenses/monthlySum', async (_, { rejectWithValue }) => {
  try {
    const response = await expenseAPI.getMonthlySummary();
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const fetchCategorySummary = createAsyncThunk('expenses/categorySum', async (_, { rejectWithValue }) => {
  try {
    const response = await expenseAPI.getCategorySummary();
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const fetchDashboardStats = createAsyncThunk('expenses/stats', async (_, { rejectWithValue }) => {
  try {
    const response = await expenseAPI.getDashboardStats();
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
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
