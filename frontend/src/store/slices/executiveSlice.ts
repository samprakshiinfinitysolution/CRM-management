import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ExecutiveState {
  selectedExecutiveId: string | null;
  searchQuery: string;
  statusFilter: 'all' | 'active' | 'inactive';
  detailTab: 'leads' | 'pipeline' | 'followups' | 'activities';
  leadSearchQuery: string;
  leadStatusFilter: string;
}

const initialState: ExecutiveState = {
  selectedExecutiveId: null,
  searchQuery: '',
  statusFilter: 'all',
  detailTab: 'leads',
  leadSearchQuery: '',
  leadStatusFilter: 'ALL',
};

export const executiveSlice = createSlice({
  name: 'executive',
  initialState,
  reducers: {
    setSelectedExecutiveId: (state, action: PayloadAction<string | null>) => {
      state.selectedExecutiveId = action.payload;
      state.detailTab = 'leads';
      state.leadSearchQuery = '';
      state.leadStatusFilter = 'ALL';
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<'all' | 'active' | 'inactive'>) => {
      state.statusFilter = action.payload;
    },
    setDetailTab: (
      state,
      action: PayloadAction<'leads' | 'pipeline' | 'followups' | 'activities'>
    ) => {
      state.detailTab = action.payload;
    },
    setLeadSearchQuery: (state, action: PayloadAction<string>) => {
      state.leadSearchQuery = action.payload;
    },
    setLeadStatusFilter: (state, action: PayloadAction<string>) => {
      state.leadStatusFilter = action.payload;
    },
    resetExecutiveFilters: (state) => {
      state.searchQuery = '';
      state.statusFilter = 'all';
    },
  },
});

export const {
  setSelectedExecutiveId,
  setSearchQuery,
  setStatusFilter,
  setDetailTab,
  setLeadSearchQuery,
  setLeadStatusFilter,
  resetExecutiveFilters,
} = executiveSlice.actions;

export default executiveSlice.reducer;
