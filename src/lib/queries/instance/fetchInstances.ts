import { useQuery } from "@tanstack/react-query";

import { apiGlobal } from "../api";
import { UseQueryParams } from "../types";
import { FetchInstancesResponse } from "./types";

const queryKey = ["instance", "fetchInstances"];

export const fetchInstances = async () => {
  const response = await apiGlobal.get(`/instance/fetchInstances`);
  return response.data;
};

export const useFetchInstances = (props?: UseQueryParams<FetchInstancesResponse>) => {
  return useQuery<FetchInstancesResponse>({
    ...props,
    queryKey,
    queryFn: () => fetchInstances(),
    staleTime: 5 * 1000, // 5 seconds - balance between performance and accuracy
    gcTime: 2 * 60 * 1000, // 2 minutes - shorter cache for fresher data
    refetchOnWindowFocus: true, // Refetch when window regains focus for accuracy
    refetchOnMount: true, // Always refetch on mount for latest data
    refetchInterval: 15 * 1000, // Auto-refetch every 15 seconds for real-time updates
  });
};
