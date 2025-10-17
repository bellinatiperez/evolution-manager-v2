import { zodResolver } from "@hookform/resolvers/zod";
import { MessageSquare, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Textarea } from "@/components/ui/textarea";

import { useSendTextWithGroupBalancing } from "@/lib/queries/instance-groups/manageInstanceGroups";
import { getToken, TOKEN_ID } from "@/lib/queries/token";

import { InstanceGroup } from "@/types/evolution.types";

const sendMessageSchema = z.object({
  number: z.string()
    .min(1, "Número é obrigatório")
    .regex(/^\d+$/, "Número deve conter apenas dígitos"),
  text: z.string().min(1, "Mensagem é obrigatória"),
  delay: z.number().min(0, "Delay deve ser positivo").optional(),
});

type SendMessageForm = z.infer<typeof sendMessageSchema>;

interface SendMessageDialogProps {
  group: InstanceGroup;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SendMessageDialog({ group, open, onOpenChange }: SendMessageDialogProps) {
  const token = getToken(TOKEN_ID.TOKEN);
  
  const { mutate: sendMessage, isPending } = useSendTextWithGroupBalancing();

  const form = useForm<SendMessageForm>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: {
      number: "",
      text: "",
      delay: 1000,
    },
  });

  const onSubmit = (data: SendMessageForm) => {
    sendMessage(
      { 
        data: {
          alias: group.alias,
          number: data.number,
          text: data.text,
          delay: data.delay,
          mentionsEveryOne: false,
          mentioned: [],
        }, 
        token: token || undefined 
      },
      {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
      }
    );
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isPending) {
      form.reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare size="20" />
            Enviar Mensagem
          </DialogTitle>
          <DialogDescription>
            Envie uma mensagem usando o balanceamento automático do grupo "{group.name}".
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 rounded-lg border p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Grupo Selecionado:</span>
            <Badge variant={group.enabled ? "default" : "secondary"}>
              {group.enabled ? "Ativo" : "Inativo"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{group.name}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {group.instances.map((instance) => (
              <Badge key={instance} variant="outline" className="text-xs">
                {instance}
              </Badge>
            ))}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número do Destinatário</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="5511999999999" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Digite apenas os números (com código do país)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mensagem</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Digite sua mensagem aqui..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="delay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delay (ms)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder="1000"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Tempo de espera em milissegundos antes do envio
                  </FormDescription>
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
              <Button type="submit" disabled={isPending || !group.enabled}>
                {isPending ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <Send size="16" className="mr-2" />
                    Enviar Mensagem
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>

        {!group.enabled && (
          <div className="mt-2 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
            ⚠️ Este grupo está inativo. Ative o grupo para enviar mensagens.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}