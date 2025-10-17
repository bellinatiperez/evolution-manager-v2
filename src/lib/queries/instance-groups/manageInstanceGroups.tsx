import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { apiGlobal } from "../api";
import { 
  CreateInstanceGroup, 
  UpdateInstanceGroup, 
  AddInstanceToGroup, 
  RemoveInstanceFromGroup,
  SendTextWithGroupBalancing 
} from "../../../types/evolution.types";
import { 
  CreateInstanceGroupResponse, 
  UpdateInstanceGroupResponse, 
  DeleteInstanceGroupResponse,
  AddInstanceToGroupResponse,
  RemoveInstanceFromGroupResponse,
  SendTextWithGroupBalancingResponse
} from "./types";

interface CreateInstanceGroupParams {
  data: CreateInstanceGroup;
  token?: string;
}

interface UpdateInstanceGroupParams {
  groupId: string;
  data: UpdateInstanceGroup;
  token?: string;
}

interface DeleteInstanceGroupParams {
  groupId: string;
  token?: string;
}

interface AddInstanceToGroupParams {
  groupId: string;
  data: AddInstanceToGroup;
  token?: string;
}

interface RemoveInstanceFromGroupParams {
  groupId: string;
  data: RemoveInstanceFromGroup;
  token?: string;
}

interface SendTextWithGroupBalancingParams {
  data: SendTextWithGroupBalancing;
  token?: string;
}

// Create Instance Group
export const useCreateInstanceGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation<CreateInstanceGroupResponse, Error, CreateInstanceGroupParams>({
    mutationFn: async ({ data, token }) => {
      const response = await apiGlobal.post("/instance-group", data, {
        headers: { apikey: token },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instance-groups"] });
      toast.success("Grupo de instâncias criado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao criar grupo de instâncias");
    },
  });
};

// Update Instance Group
export const useUpdateInstanceGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation<UpdateInstanceGroupResponse, Error, UpdateInstanceGroupParams>({
    mutationFn: async ({ groupId, data, token }) => {
      const response = await apiGlobal.put(`/instance-group/${groupId}`, data, {
        headers: { apikey: token },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instance-groups"] });
      toast.success("Grupo de instâncias atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao atualizar grupo de instâncias");
    },
  });
};

// Delete Instance Group
export const useDeleteInstanceGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation<DeleteInstanceGroupResponse, Error, DeleteInstanceGroupParams>({
    mutationFn: async ({ groupId, token }) => {
      const response = await apiGlobal.delete(`/instance-group/${groupId}`, {
        headers: { apikey: token },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instance-groups"] });
      toast.success("Grupo de instâncias deletado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao deletar grupo de instâncias");
    },
  });
};

// Add Instance to Group
export const useAddInstanceToGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation<AddInstanceToGroupResponse, Error, AddInstanceToGroupParams>({
    mutationFn: async ({ groupId, data, token }) => {
      const response = await apiGlobal.post(`/instance-group/${groupId}/instances`, data, {
        headers: { apikey: token },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instance-groups"] });
      toast.success("Instância adicionada ao grupo com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao adicionar instância ao grupo");
    },
  });
};

// Remove Instance from Group
export const useRemoveInstanceFromGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation<RemoveInstanceFromGroupResponse, Error, RemoveInstanceFromGroupParams>({
    mutationFn: async ({ groupId, data, token }) => {
      const response = await apiGlobal.delete(`/instance-group/${groupId}/instances`, {
        data,
        headers: { apikey: token },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instance-groups"] });
      toast.success("Instância removida do grupo com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao remover instância do grupo");
    },
  });
};

// Send Text with Group Balancing
export const useSendTextWithGroupBalancing = () => {
  return useMutation<SendTextWithGroupBalancingResponse, Error, SendTextWithGroupBalancingParams>({
    mutationFn: async ({ data, token }) => {
      const response = await apiGlobal.post("/message/sendTextWithGroupBalancing", data, {
        headers: { apikey: token },
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Mensagem enviada com sucesso via ${data.instanceUsed}!`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao enviar mensagem com balanceamento");
    },
  });
};