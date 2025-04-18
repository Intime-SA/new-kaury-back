'use client'

import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { store } from './store/store'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 30000,
    },
  },
})

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        {children}
      </Provider>
    </QueryClientProvider>
  )
} 