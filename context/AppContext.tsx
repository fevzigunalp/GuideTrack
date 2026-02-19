import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from 'react';
import {
  Agency,
  AppSettings,
  AppState,
  Commission,
  Expense,
  PaymentStatus,
  Tip,
  TourEntry,
  UserProfile,
  DEFAULT_EXPENSE_CATEGORIES,
} from '../types';
import * as storage from '../services/storage';

// ─── Actions ──────────────────────────────────────────────────────────────────

type AppAction =
  | { type: 'INIT'; payload: Partial<AppState> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: UserProfile | null }
  | { type: 'ADD_TOUR'; payload: TourEntry }
  | { type: 'UPDATE_TOUR'; payload: TourEntry }
  | { type: 'DELETE_TOUR'; payload: string }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'ADD_AGENCY'; payload: Agency }
  | { type: 'UPDATE_AGENCY'; payload: Agency }
  | { type: 'DELETE_AGENCY'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'ADD_EXPENSE_CATEGORY'; payload: string }
  | {
      type: 'ADD_TIP';
      payload: { tourId: string; tip: Tip };
    }
  | {
      type: 'ADD_COMMISSION';
      payload: { tourId: string; commission: Commission };
    }
  | {
      type: 'UPDATE_PAYMENT_STATUS';
      payload: { tourId: string; status: PaymentStatus; paidAmount: number };
    };

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: AppState = {
  tours: [],
  expenses: [],
  agencies: [],
  user: null,
  settings: {
    defaultDailyRate: 1500,
    notificationsEnabled: true,
    firstDayOfWeek: 1,
  },
  expenseCategories: [...DEFAULT_EXPENSE_CATEGORIES],
  isLoading: true,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'INIT':
      return { ...state, ...action.payload, isLoading: false };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_USER':
      return { ...state, user: action.payload };

    // ── Tours ──
    case 'ADD_TOUR':
      return { ...state, tours: [action.payload, ...state.tours] };

    case 'UPDATE_TOUR':
      return {
        ...state,
        tours: state.tours.map((t) =>
          t.id === action.payload.id ? action.payload : t,
        ),
      };

    case 'DELETE_TOUR':
      return {
        ...state,
        tours: state.tours.filter((t) => t.id !== action.payload),
      };

    case 'ADD_TIP':
      return {
        ...state,
        tours: state.tours.map((t) =>
          t.id === action.payload.tourId
            ? { ...t, tips: [...t.tips, action.payload.tip], updatedAt: new Date().toISOString() }
            : t,
        ),
      };

    case 'ADD_COMMISSION':
      return {
        ...state,
        tours: state.tours.map((t) =>
          t.id === action.payload.tourId
            ? { ...t, commissions: [...t.commissions, action.payload.commission], updatedAt: new Date().toISOString() }
            : t,
        ),
      };

    case 'UPDATE_PAYMENT_STATUS':
      return {
        ...state,
        tours: state.tours.map((t) =>
          t.id === action.payload.tourId
            ? {
                ...t,
                paymentStatus: action.payload.status,
                paidAmount: action.payload.paidAmount,
                paidDate: action.payload.status === 'PAID' ? new Date().toISOString() : t.paidDate,
                updatedAt: new Date().toISOString(),
              }
            : t,
        ),
      };

    // ── Expenses ──
    case 'ADD_EXPENSE':
      return { ...state, expenses: [action.payload, ...state.expenses] };

    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map((e) =>
          e.id === action.payload.id ? action.payload : e,
        ),
      };

    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter((e) => e.id !== action.payload),
      };

    // ── Agencies ──
    case 'ADD_AGENCY':
      return { ...state, agencies: [...state.agencies, action.payload] };

    case 'UPDATE_AGENCY':
      return {
        ...state,
        agencies: state.agencies.map((a) =>
          a.id === action.payload.id ? action.payload : a,
        ),
      };

    case 'DELETE_AGENCY':
      return {
        ...state,
        agencies: state.agencies.filter((a) => a.id !== action.payload),
      };

    // ── Settings ──
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };

    // ── Expense Categories ──
    case 'ADD_EXPENSE_CATEGORY':
      if (state.expenseCategories.includes(action.payload)) return state;
      return {
        ...state,
        expenseCategories: [...state.expenseCategories, action.payload],
      };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Convenience helpers
  addTour: (tour: TourEntry) => Promise<void>;
  updateTour: (tour: TourEntry) => Promise<void>;
  deleteTour: (id: string) => Promise<void>;
  addTip: (tourId: string, tip: Tip) => Promise<void>;
  addCommission: (tourId: string, commission: Commission) => Promise<void>;
  updatePaymentStatus: (tourId: string, status: PaymentStatus, paidAmount: number) => Promise<void>;
  addExpense: (expense: Expense) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addAgency: (agency: Agency) => Promise<void>;
  updateAgency: (agency: Agency) => Promise<void>;
  deleteAgency: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  setUser: (user: UserProfile | null) => Promise<void>;
  addExpenseCategory: (category: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data on mount
  useEffect(() => {
    (async () => {
      const [tours, expenses, agencies, settings, user, extraCategories] =
        await Promise.all([
          storage.getTours(),
          storage.getExpenses(),
          storage.getAgencies(),
          storage.getSettings(),
          storage.getUser(),
          storage.getExpenseCategories(),
        ]);

      const mergedCategories = [
        ...DEFAULT_EXPENSE_CATEGORIES,
        ...extraCategories.filter(
          (c) => !(DEFAULT_EXPENSE_CATEGORIES as readonly string[]).includes(c),
        ),
      ];

      dispatch({
        type: 'INIT',
        payload: { tours, expenses, agencies, settings, user, expenseCategories: mergedCategories },
      });
    })();
  }, []);

  // Sync tours to storage whenever they change
  useEffect(() => {
    if (!state.isLoading) storage.setTours(state.tours);
  }, [state.tours, state.isLoading]);

  useEffect(() => {
    if (!state.isLoading) storage.setExpenses(state.expenses);
  }, [state.expenses, state.isLoading]);

  useEffect(() => {
    if (!state.isLoading) storage.setAgencies(state.agencies);
  }, [state.agencies, state.isLoading]);

  useEffect(() => {
    if (!state.isLoading) storage.setSettings(state.settings);
  }, [state.settings, state.isLoading]);

  // ── Helpers ──

  const addTour = useCallback(async (tour: TourEntry) => {
    dispatch({ type: 'ADD_TOUR', payload: tour });
  }, []);

  const updateTour = useCallback(async (tour: TourEntry) => {
    dispatch({ type: 'UPDATE_TOUR', payload: tour });
  }, []);

  const deleteTour = useCallback(async (id: string) => {
    dispatch({ type: 'DELETE_TOUR', payload: id });
  }, []);

  const addTip = useCallback(async (tourId: string, tip: Tip) => {
    dispatch({ type: 'ADD_TIP', payload: { tourId, tip } });
  }, []);

  const addCommission = useCallback(async (tourId: string, commission: Commission) => {
    dispatch({ type: 'ADD_COMMISSION', payload: { tourId, commission } });
  }, []);

  const updatePaymentStatus = useCallback(
    async (tourId: string, status: PaymentStatus, paidAmount: number) => {
      dispatch({ type: 'UPDATE_PAYMENT_STATUS', payload: { tourId, status, paidAmount } });
    },
    [],
  );

  const addExpense = useCallback(async (expense: Expense) => {
    dispatch({ type: 'ADD_EXPENSE', payload: expense });
  }, []);

  const updateExpense = useCallback(async (expense: Expense) => {
    dispatch({ type: 'UPDATE_EXPENSE', payload: expense });
  }, []);

  const deleteExpense = useCallback(async (id: string) => {
    dispatch({ type: 'DELETE_EXPENSE', payload: id });
  }, []);

  const addAgency = useCallback(async (agency: Agency) => {
    dispatch({ type: 'ADD_AGENCY', payload: agency });
  }, []);

  const updateAgency = useCallback(async (agency: Agency) => {
    dispatch({ type: 'UPDATE_AGENCY', payload: agency });
  }, []);

  const deleteAgency = useCallback(async (id: string) => {
    dispatch({ type: 'DELETE_AGENCY', payload: id });
  }, []);

  const updateSettings = useCallback(async (settings: Partial<AppSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  }, []);

  const setUser = useCallback(async (user: UserProfile | null) => {
    dispatch({ type: 'SET_USER', payload: user });
    if (user) await storage.setUser(user);
    else await storage.removeUser();
  }, []);

  const addExpenseCategory = useCallback(async (category: string) => {
    dispatch({ type: 'ADD_EXPENSE_CATEGORY', payload: category });
    const current = await storage.getExpenseCategories();
    if (!current.includes(category)) {
      await storage.setExpenseCategories([...current, category]);
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        addTour,
        updateTour,
        deleteTour,
        addTip,
        addCommission,
        updatePaymentStatus,
        addExpense,
        updateExpense,
        deleteExpense,
        addAgency,
        updateAgency,
        deleteAgency,
        updateSettings,
        setUser,
        addExpenseCategory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
