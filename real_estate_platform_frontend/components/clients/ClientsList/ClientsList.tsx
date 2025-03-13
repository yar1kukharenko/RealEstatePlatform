'use client';

import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import ClientForm from '@/components/clients/ClientForm';
import ConfirmDialog from '@/components/ConfirmDialog';
import SnackbarNotification from '@/components/SnackbarNotification';
import {
  useDeleteClientMutation,
  useGetClientRelatedQuery,
  useGetClientsQuery,
} from '@/services/clientsApi';
import { fuzzySearch } from '@/utils/fuzzySearch';
import { Client } from '@/types/types';
import RelatedDataDialog from '@/components/RelatedDataDialog/RelatedDataDialog';

export default function ClientsList() {
  const { data: clientsData = [], isLoading, refetch } = useGetClientsQuery();
  const [query, setQuery] = useState<string>('');
  const [selectedClient, setSelectedClient] = useState<Client | undefined>(undefined);
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
  const [openForm, setOpenForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const [deleteClient] = useDeleteClientMutation();

  // Функция для получения ФИО клиента
  const getClientFields = (client: Client) => [
    client.first_name,
    client.middle_name,
    client.last_name,
  ];

  // Фильтрация клиентов с учетом нечёткого поиска (Левенштейн <= 3)
  const filteredClients = useMemo(() => {
    return fuzzySearch(clientsData, query, getClientFields, undefined, 3);
  }, [clientsData, query]);

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setConfirmDelete(true);
  };

  const confirmDeleteAction = async () => {
    if (!deleteId) return;
    try {
      await deleteClient(deleteId).unwrap();
      setSnackbar({ open: true, message: 'Клиент удалён', severity: 'success' });
      await refetch();
    } catch (error) {
      console.error(error);
      setSnackbar({ open: true, message: 'Ошибка при удалении клиента', severity: 'error' });
    }
    setConfirmDelete(false);
    setDeleteId(null);
  };

  // Хук для получения связанных данных выбранного клиента
  const { data: relatedData, isLoading: relatedLoading } = useGetClientRelatedQuery(
    selectedClient?.id ?? 0,
    { skip: !selectedClient || !!editingClient },
  );

  return (
    <Box sx={{ p: 2 }}>
      <TextField
        label="Поиск клиентов"
        variant="outlined"
        fullWidth
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          setSelectedClient(undefined);
          setEditingClient(undefined);
          setOpenForm(true);
        }}
        sx={{ mb: 2 }}
      >
        Добавить клиента
      </Button>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      ) : (
        <List>
          {filteredClients.map((client) => (
            <ListItem
              key={client.id}
              disablePadding
              sx={{
                borderBottom: '1px solid',
                borderColor: 'divider',
                py: 1,
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <ListItemButton
                component="div"
                onClick={() => {
                  if (!editingClient) setSelectedClient(client);
                }}
                selected={selectedClient?.id === client.id && !editingClient}
                sx={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <ListItemText
                  primary={`${client.first_name} ${client.middle_name} ${client.last_name}`}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingClient(client);
                      setOpenForm(true);
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(client.id);
                    }}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}

      {/* Отображаем связанные данные, если выбран клиент и не в режиме редактирования */}
      {selectedClient && !editingClient && (
        <RelatedDataDialog
          open={!!selectedClient}
          onCloseAction={() => setSelectedClient(undefined)}
          title={`Данные для клиента: ${selectedClient.first_name} ${selectedClient.last_name}`}
          relatedData={relatedData}
          isLoading={relatedLoading}
        />
      )}

      <ClientForm
        open={openForm}
        onSuccess={() => {
          refetch();
          setSelectedClient(undefined);
          setEditingClient(undefined);
        }}
        onClose={() => {
          setOpenForm(false);
          setEditingClient(undefined);
        }}
        client={editingClient}
      />

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={confirmDeleteAction}
        title="Удаление клиента"
        description="Вы уверены, что хотите удалить этого клиента? Это действие нельзя отменить."
      />

      <SnackbarNotification
        open={snackbar.open}
        onCloseAction={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  );
}
