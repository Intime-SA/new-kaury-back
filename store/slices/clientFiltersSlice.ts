import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store'; // Asegúrate que la ruta sea correcta

// Interfaz para el estado de los filtros de clientes/usuarios
export interface ClientFiltersState {
  searchTerm: string | null; // Para buscar nombre, email, dni, etc.
  registrationDateFrom: string | null; // Fecha ISO YYYY-MM-DD
  registrationDateTo: string | null;   // Fecha ISO YYYY-MM-DD
  email: string | null; // <-- Nuevo filtro por email
  province: string | null; // <-- Nuevo filtro por provincia/estado
  // Podríamos añadir estado/provincia si fuera necesario
  // stateProvince: string | null; 
}

// Estado inicial (sin filtros aplicados)
const initialState: ClientFiltersState = {
  searchTerm: null,
  registrationDateFrom: null,
  registrationDateTo: null,
  email: null, // <-- Añadir al estado inicial
  province: null, // <-- Añadir al estado inicial
  // stateProvince: null,
};

const clientFiltersSlice = createSlice({
  name: 'clientFilters',
  initialState,
  reducers: {
    // Acción para establecer el término de búsqueda
    setClientSearchTerm: (state, action: PayloadAction<string | null>) => {
      state.searchTerm = action.payload;
    },
    setClientRegistrationDateRange: (state, action: PayloadAction<{ from?: string | null; to?: string | null }>) => {
      if (action.payload.from !== undefined) {
        state.registrationDateFrom = action.payload.from;
      }
      if (action.payload.to !== undefined) {
        state.registrationDateTo = action.payload.to;
      }
    },
    // Acción para establecer el email
    setClientEmail: (state, action: PayloadAction<string | null>) => {
      state.email = action.payload;
    },
    // Acción para establecer la provincia
    setClientProvince: (state, action: PayloadAction<string | null>) => {
      state.province = action.payload;
    },
    // Acción para limpiar un filtro específico
    // Usamos keyof para las propiedades directas, y alias para el rango de fechas
    clearClientFilter: (state, action: PayloadAction<keyof ClientFiltersState | 'registrationDate'>) => {
      const filterToClear = action.payload;
      if (filterToClear === 'registrationDate' || filterToClear === 'registrationDateFrom' || filterToClear === 'registrationDateTo') {
        state.registrationDateFrom = null;
        state.registrationDateTo = null;
      } else if (filterToClear in initialState) { // Verificar si es una clave válida del estado
         // Castear para asegurar que es una clave válida y no un rango
         const key = filterToClear as keyof ClientFiltersState;
         // Solo limpiar si no es una de las claves de fecha individuales (ya manejadas)
         if (key !== 'registrationDateFrom' && key !== 'registrationDateTo') {
             state[key] = null; // Limpiar el filtro correspondiente
         }
      } 
      // Añadir aquí lógica para otros filtros como stateProvince si se implementan
    },
    // Acción para resetear todos los filtros al estado inicial
    resetClientFilters: () => initialState,
  },
});

// Exportar las acciones
export const {
  setClientSearchTerm,
  setClientRegistrationDateRange,
  setClientEmail,
  setClientProvince,
  clearClientFilter,
  resetClientFilters,
} = clientFiltersSlice.actions;

// Selectores
export const selectClientFilters = (state: RootState): ClientFiltersState => state.clientFilters;
export const selectIsAnyClientFilterActive = (state: RootState): boolean => {
    const filters = state.clientFilters;
    return Object.values(filters).some(value => value !== null);
};

// Exportar el reducer
export default clientFiltersSlice.reducer; 