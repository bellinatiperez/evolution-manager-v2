import { useQuery } from "@tanstack/react-query";

import { apiGlobal } from "../api";
import { UseQueryParams } from "../types";
import { FetchInstanceGroupsResponse } from "./types";

interface IParams {
  token?: string;
}

const queryKey = (params: Partial<IParams>) => ["instance-groups", "fetchInstanceGroups", JSON.stringify(params)];

export const fetchInstanceGroups = async ({ token }: IParams) => {
  const response = await apiGlobal.get("/instance-group", {
    headers: { apikey: token },
  });
  return response.data;
};

export const useFetchInstanceGroups = (props: UseQueryParams<FetchInstanceGroupsResponse> & Partial<IParams>) => {
  const { token, ...rest } = props;
  return useQuery<FetchInstanceGroupsResponse>({
    ...rest,
    queryKey: queryKey({ token }),
    queryFn: () => fetchInstanceGroups({ token: token! }),
    enabled: props.enabled ?? true,
  });
};