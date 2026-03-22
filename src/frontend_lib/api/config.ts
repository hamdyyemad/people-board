import { DefaultOptions } from "@tanstack/react-query";

export const queryClientConfig: DefaultOptions = {
  queries: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  },
  mutations: {
    retry: 1,
  },
};
