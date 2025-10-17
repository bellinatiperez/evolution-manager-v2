import { useQuery } from "@tanstack/react-query";

import { apiGlobal } from "../api";
import { UseQueryParams } from "../types";
import { FetchInstanceGroupResponse } from "./types";

interface IParams {
  groupId: string | null;
  token?: string;
}

const queryKey = (params: Partial<IParams>) => ["instance-groups", "fetchInstanceGroup", JSON.stringify(params)];

export const fetchInstanceGroup = async ({ groupId, token }: IParams) => {
  const response = await apiGlobal.get(`/instance-group/${groupId}`, {
    headers: { apikey: token },
  });
  return response.data;
};

export const useFetchInstanceGroup = (props: UseQueryParams<FetchInstanceGroupResponse> & Partial<IParams>) => {
  const { groupId, token, ...rest } = props;
  return useQuery<FetchInstanceGroupResponse>({
    ...rest,
    queryKey: queryKey({ groupId, token }),
    queryFn: () => fetchInstanceGroup({ groupId: groupId!, token: token! }),
    enabled: !!groupId && (props.enabled ?? true),
  });
};