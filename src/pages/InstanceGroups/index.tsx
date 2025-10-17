import { MoreHorizontal, Plus, RefreshCw, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

import { useFetchInstanceGroups } from "@/lib/queries/instance-groups/fetchInstanceGroups";
import { useDeleteInstanceGroup } from "@/lib/queries/instance-groups/manageInstanceGroups";
import { getToken, TOKEN_ID } from "@/lib/queries/token";

import { InstanceGroup } from "@/types/evolution.types";

import { CreateInstanceGroupDialog } from "./CreateInstanceGroupDialog";
import { EditInstanceGroupDialog } from "./EditInstanceGroupDialog";
import { SendMessageDialog } from "./SendMessageDialog";
import { CopyAndPaste } from "@/components/copy-and-paste";

function InstanceGroups() {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const [editingGroup, setEditingGroup] = useState<InstanceGroup | null>(null);
  const [sendMessageGroup, setSendMessageGroup] = useState<InstanceGroup | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const token = getToken(TOKEN_ID.TOKEN);
  const { data: instanceGroups, isLoading, refetch } = useFetchInstanceGroups({ token: token || undefined });
  const { mutate: deleteGroup, isPending: isDeleting } = useDeleteInstanceGroup();

  const filteredGroups = useMemo(() => {
    if (!instanceGroups) return [];

    return instanceGroups.filter((group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [instanceGroups, searchTerm]);

  const handleDeleteGroup = (groupId: string) => {
    deleteGroup(
      { groupId, token: token || undefined },
      {
        onSuccess: () => {
          setDeleteConfirmation(null);
          refetch();
        },
      }
    );
  };

  const resetTable = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="my-4 px-4">
      <div className="flex w-full items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Grupos de Instâncias</h2>
          <p className="text-muted-foreground">Gerencie grupos de instâncias para balanceamento automático</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={resetTable}>
            <RefreshCw size="20" />
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus size="16" className="mr-2" />
            Novo Grupo
          </Button>
        </div>
      </div>

      <div className="my-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar grupos por nome ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredGroups.map((group) => (
          <Card key={group.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Users size="18" />
                      {group.name}
                    </div>
                    <CopyAndPaste value={group.alias} />
                  </CardTitle>
                  {group.description && (
                    <CardDescription className="mt-1">{group.description}</CardDescription>
                  )}
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal size="16" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setEditingGroup(group)}>
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSendMessageGroup(group)}>
                      Enviar Mensagem
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setDeleteConfirmation(group.id)}
                    >
                      Deletar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant={group.enabled ? "default" : "secondary"}>
                    {group.enabled ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Instâncias:</span>
                  <span className="text-sm font-medium">{group.instances.length}</span>
                </div>
                {group.instances.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Lista:</span>
                    <div className="flex flex-wrap gap-1">
                      {group.instances.slice(0, 3).map((instance) => (
                        <Badge key={instance} variant="outline" className="text-xs">
                          {instance}
                        </Badge>
                      ))}
                      {group.instances.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{group.instances.length - 3} mais
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  Criado em: {new Date(group.createdAt).toLocaleDateString("pt-BR")}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGroups.length === 0 && !isLoading && (
        <div className="flex h-64 flex-col items-center justify-center text-center">
          <Users size="48" className="mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Nenhum grupo encontrado</h3>
          <p className="text-muted-foreground">
            {searchTerm ? "Tente ajustar sua busca" : "Crie seu primeiro grupo de instâncias"}
          </p>
        </div>
      )}

      {/* Create Dialog */}
      <CreateInstanceGroupDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={resetTable}
      />

      {/* Edit Dialog */}
      {editingGroup && (
        <EditInstanceGroupDialog
          group={editingGroup}
          open={!!editingGroup}
          onOpenChange={(open) => !open && setEditingGroup(null)}
          onSuccess={resetTable}
        />
      )}

      {/* Send Message Dialog */}
      {sendMessageGroup && (
        <SendMessageDialog
          group={sendMessageGroup}
          open={!!sendMessageGroup}
          onOpenChange={(open) => !open && setSendMessageGroup(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmation} onOpenChange={() => setDeleteConfirmation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar este grupo de instâncias? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmation && handleDeleteGroup(deleteConfirmation)}
              disabled={isDeleting}
            >
              {isDeleting ? <LoadingSpinner /> : "Deletar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { InstanceGroups };