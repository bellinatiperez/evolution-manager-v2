import { InstanceGroup } from "../../../types/evolution.types";

export type FetchInstanceGroupsResponse = InstanceGroup[];
export type FetchInstanceGroupResponse = InstanceGroup;
export type CreateInstanceGroupResponse = InstanceGroup;
export type UpdateInstanceGroupResponse = InstanceGroup;
export type DeleteInstanceGroupResponse = { message: string };
export type AddInstanceToGroupResponse = { message: string };
export type RemoveInstanceFromGroupResponse = { message: string };
export type SendTextWithGroupBalancingResponse = { 
  message: string; 
  instanceUsed: string; 
  messageId?: string; 
};