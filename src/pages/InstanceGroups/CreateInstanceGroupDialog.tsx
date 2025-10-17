import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { useCreateInstanceGroup } from "@/lib/queries/instance-groups/manageInstanceGroups";
import { getToken, TOKEN_ID } from "@/lib/queries/token";

const createInstanceGroupSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
  alias: z.string().min(1, "Alias é obrigatório").max(50, "Alias deve ter no máximo 50 caracteres"),
  description: z.string().max(500, "Descrição deve ter no máximo 500 caracteres").optional(),
  enabled: z.boolean().default(true),
  instances: z.array(z.string()).min(1, "Pelo menos uma instância é obrigatória"),
});

type CreateInstanceGroupForm = z.infer<typeof createInstanceGroupSchema>;

interface CreateInstanceGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateInstanceGroupDialog({ open, onOpenChange, onSuccess }: CreateInstanceGroupDialogProps) {
  const [newInstance, setNewInstance] = useState("");
  const token = getToken(TOKEN_ID.TOKEN);
  
  const { mutate: createGroup, isPending } = useCreateInstanceGroup();

  const form = useForm<CreateInstanceGroupForm>({
    resolver: zodResolver(createInstanceGroupSchema),
    defaultValues: {
      name: "",
      alias: "",
      description: "",
      enabled: true,
      instances: [],
    },
  });

  const instances = form.watch("instances");

  const addInstance = () => {
    if (newInstance.trim() && !instances.includes(newInstance.trim())) {
      form.setValue("instances", [...instances, newInstance.trim()]);
      setNewInstance("");
    }
  };

  const removeInstance = (instanceToRemove: string) => {
    form.setValue("instances", instances.filter(instance => instance !== instanceToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addInstance();
    }
  };

  const onSubmit = (data: CreateInstanceGroupForm) => {
    createGroup(
      { 
        data: {
          name: data.name,
          alias: data.alias,
          description: data.description || undefined,
          enabled: data.enabled,
          instances: data.instances,
        }, 
        token: token || undefined 
      },
      {
        onSuccess: () => {
          form.reset();
          setNewInstance("");
          onOpenChange(false);
          onSuccess();
        },
      }
    );
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isPending) {
      form.reset();
      setNewInstance("");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Novo Grupo</DialogTitle>
          <DialogDescription>
            Crie um novo grupo de instâncias para balanceamento automático de mensagens.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Grupo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Grupo Vendas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="alias"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alias</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: picpay-mvp" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descrição do grupo..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Grupo Ativo</FormLabel>
                    <FormDescription className="text-sm">
                      Ativar o grupo para receber mensagens
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instances"
              render={() => (
                <FormItem>
                  <FormLabel>Instâncias</FormLabel>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nome da instância"
                        value={newInstance}
                        onChange={(e) => setNewInstance(e.target.value)}
                        onKeyPress={handleKeyPress}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={addInstance}
                        disabled={!newInstance.trim() || instances.includes(newInstance.trim())}
                      >
                        <Plus size="16" />
                      </Button>
                    </div>
                    
                    {instances.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {instances.map((instance) => (
                          <Badge key={instance} variant="secondary" className="flex items-center gap-1">
                            {instance}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => removeInstance(instance)}
                            >
                              <X size="12" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <LoadingSpinner /> : "Criar Grupo"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}