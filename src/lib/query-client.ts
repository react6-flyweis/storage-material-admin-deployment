import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnMount: "always",
      staleTime: 0,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});
