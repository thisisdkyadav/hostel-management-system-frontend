import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query"
import { ApiError, NetworkError } from "@/service/core/errors"

let redirecting = false

const handleAuthFailure = () => {
  if (redirecting) return
  redirecting = true
  localStorage.removeItem("user")
  localStorage.removeItem("publicKey")
  window.location.assign("/login")
}

const shouldRetry = (failureCount, error) => {
  if (error instanceof NetworkError) return failureCount < 2
  if (error instanceof ApiError) {
    if (error.isAuthError() || error.isNotFound()) return false
    if (!error.isServerError()) return false
  }
  return failureCount < 2
}

const onError = (error) => {
  if (error instanceof ApiError && !(error instanceof NetworkError) && error.status === 401) {
    handleAuthFailure()
  }
}

export const createAppQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30000,
        gcTime: 5 * 60 * 1000,
        retry: shouldRetry,
        refetchOnWindowFocus: true,
      },
      mutations: {
        retry: false,
      },
    },
    queryCache: new QueryCache({ onError }),
    mutationCache: new MutationCache({ onError }),
  })
