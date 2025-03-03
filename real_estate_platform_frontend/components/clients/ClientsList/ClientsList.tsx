'use client';

import { useMemo, useState } from 'react';
import {
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

  // Хук для получения связанных данных выбранного клиента.
  // Он запускается, только если выбран клиент.
  const { data: relatedData, isLoading: relatedLoading } = useGetClientRelatedQuery(
    selectedClient?.id ?? 0,
    { skip: !selectedClient },
  );

  return (
    <div>
      <TextField
        label="Поиск клиентов"
        variant="outlined"
        fullWidth
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{ marginBottom: 2 }}
      />

      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          setSelectedClient(undefined);
          setOpenForm(true);
        }}
        sx={{ marginBottom: 2 }}
      >
        Добавить клиента
      </Button>

      {isLoading ? (
        <div style={{ textAlign: 'center' }}>
          <CircularProgress />
        </div>
      ) : (
        <List>
          {filteredClients.map((client) => (
            <ListItem
              key={client.id}
              secondaryAction={
                <>
                  <IconButton
                    onClick={() => {
                      setSelectedClient(client);
                      setOpenForm(true);
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(client.id)} color="error">
                    <Delete />
                  </IconButton>
                </>
              }
            >
              <ListItemButton
                onClick={() => setSelectedClient(client)}
                selected={selectedClient?.id === client.id}
              >
                <ListItemText
                  primary={`${client.first_name} ${client.middle_name} ${client.last_name}`}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}

      {/* Панель для отображения связанных данных выбранного клиента */}
      {selectedClient && (
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
        }}
        onClose={() => setOpenForm(false)}
        client={selectedClient}
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
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </div>
  );
}
