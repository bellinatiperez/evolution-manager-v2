import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Separator } from "@/components/ui/separator";

import { useAddInstanceToGroup, useRemoveInstanceFromGroup } from "@/lib/queries/instance-groups/manageInstanceGroups";
import { getToken, TOKEN_ID } from "@/lib/queries/token";

import { InstanceGroup } from "@/types/evolution.types";

const addInstanceSchema = z.object({
  instanceName: z.string().min(1, "Nome da instância é obrigatório"),
});

type AddInstanceForm = z.infer<typeof addInstanceSchema>;

interface InstanceManagementDialogProps {
  group: InstanceGroup;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function InstanceManagementDialog({ group, open, onOpenChange, onSuccess }: InstanceManagementDialogProps) {
  const [removingInstance, setRemovingInstance] = useState<string | null>(null);
  const token = getToken(TOKEN_ID.TOKEN);
  
  const { mutate: addInstance, isPending: isAdding } = useAddInstanceToGroup();
  const { mutate: removeInstance, isPending: isRemoving } = useRemoveInstanceFromGroup();

  const form = useForm<AddInstanceForm>({
    resolver: zodResolver(addInstanceSchema),
    defaultValues: {
      instanceName: "",
    },
  });

  const onSubmitAdd = (data: AddInstanceForm) => {
    if (group.instances.includes(data.instanceName)) {
      form.setError("instanceName", { message: "Esta instância já está no grupo" });
      return;
    }

    addInstance(
      { 
        groupId: group.id,
        data: { instanceName: data.instanceName }, 
        token: token || undefined 
      },
      {
        onSuccess: () => {
          form.reset();
          onSuccess();
        },
      }
    );
  };

  const handleRemoveInstance = (instanceName: string) => {
    setRemovingInstance(instanceName);
    removeInstance(
      { 
        groupId: group.id,
        data: { instanceName }, 
        token: token || undefined 
      },
      {
        onSuccess: () => {
          setRemovingInstance(null);
          onSuccess();
        },
        onError: () => {
          setRemovingInstance(null);
        },
      }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      form.handleSubmit(onSubmitAdd)();
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isAdding && !isRemoving) {
      form.reset();
      setRemovingInstance(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users size="20" />
            Gerenciar Instâncias
          </DialogTitle>
          <DialogDescription>
            Adicione ou remova instâncias do grupo "{group.name}".
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add Instance Section */}
          <div>
            <h4 className="mb-3 text-sm font-medium">Adicionar Nova Instância</h4>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitAdd)} className="space-y-3">
                <FormField
                  control={form.control}
                  name="instanceName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Instância</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input 
                            placeholder="Ex: vendedor4" 
                            {...field}
                            onKeyPress={handleKeyPress}
                          />
                        </FormControl>
                        <Button 
                          type="submit" 
                          size="icon"
                          disabled={isAdding || !field.value.trim()}
                        >
                          {isAdding ? <LoadingSpinner /> : <Plus size="16" />}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>

          <Separator />

          {/* Current Instances Section */}
          <div>
            <h4 className="mb-3 text-sm font-medium">
              Instâncias Atuais ({group.instances.length})
            </h4>
            
            {group.instances.length === 0 ? (
              <div className="flex h-20 items-center justify-center rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground">Nenhuma instância no grupo</p>
              </div>
            ) : (
              <div className="space-y-2">
                {group.instances.map((instance) => (
                  <div
                    key={instance}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{instance}</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleRemoveInstance(instance)}
                      disabled={isRemoving || group.instances.length === 1}
                      title={group.instances.length === 1 ? "Não é possível remover a última instância" : "Remover instância"}
                    >
                      {removingInstance === instance ? (
                        <LoadingSpinner />
                      ) : (
                        <Trash2 size="14" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {group.instances.length === 1 && (
              <p className="mt-2 text-xs text-muted-foreground">
                ⚠️ Um grupo deve ter pelo menos uma instância
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isAdding || isRemoving}
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}