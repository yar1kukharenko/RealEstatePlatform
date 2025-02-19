'use client';

import styles from './ClientsList.module.scss';

import { useMemo, useState } from 'react';
import {
  Button,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import ClientForm from '@/components/Clients/ClientForm';
import ConfirmDialog from '@/components/ConfirmDialog';
import SnackbarNotification from '@/components/SnackbarNotification';
import { useDeleteClientMutation, useGetClientsQuery } from '@/services/clientsApi';
import { fuzzySearch } from '@/utils/fuzzySearch';
import { Client } from '@/types/types';

export default function ClientsList() {
  const { data: clientsData = [], isLoading, refetch } = useGetClientsQuery();
  const [query, setQuery] = useState<string>('');
  const [selectedClient, setSelectedClient] = useState<Client>();
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

  // Вычисляем отфильтрованных клиентов при изменении clientsData или query
  const filteredClients = useMemo(() => {
    return fuzzySearch(clientsData, query);
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
    } catch (error) {
      console.error(error);
      setSnackbar({ open: true, message: 'Ошибка при удалении клиента', severity: 'error' });
    }
    setConfirmDelete(false);
    setDeleteId(null);
  };

  return (
    <div className={styles.contentWrapper}>
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
        <div className={styles.loaderWrapper}>
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
              <ListItemText
                primary={`${client.first_name} ${client.middle_name} ${client.last_name}`}
              />
            </ListItem>
          ))}
        </List>
      )}

      <ClientForm
        open={openForm}
        onSuccess={() => refetch()}
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
