'use client';

import { useEffect, useState } from 'react';
import { Button, IconButton, List, ListItem, ListItemText, TextField } from '@mui/material';
import { fuzzySearch } from '@/utils/fuzzySearch';
import { Delete, Edit } from '@mui/icons-material';
import ClientForm from '@/components/Clients/ClientForm';
import { Client } from '@/types/types';
import ConfirmDialog from '@/components/ConfirmDialog';
import SnackbarNotification from '@/components/SnackbarNotification';

interface SearchClientsProps {
  clients: Client[];
}

export default function ClientsList({ clients: initialClients }: SearchClientsProps) {
  const [query, setQuery] = useState<string>('');
  const [filteredClients, setFilteredClients] = useState<Client[]>(initialClients);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
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

  // const handleDelete = async (id: number) => {
  //   try {
  //     await fetch(`/api/clients/${id}`, { method: 'DELETE' });
  //     setClients(clients.filter((client) => client.id !== id));
  //   } catch (error) {
  //     console.error('Ошибка удаления клиента', error);
  //   }
  // };

  const handleDelete = async (id: number) => {
    setDeleteId(id);
    setConfirmDelete(true);
  };

  const confirmDeleteAction = async () => {
    if (!deleteId) return;
    try {
      await fetch(`/api/clients/${deleteId}`, { method: 'DELETE' });
      setClients(clients.filter((client) => client.id !== deleteId));
      setSnackbar({ open: true, message: 'Клиент успешно удалён', severity: 'success' });
    } catch (error) {
      console.error('Ошибка удаления риэлтора', error);
      setSnackbar({ open: true, message: 'Ошибка при удалении клиента', severity: 'error' });
    }
    setConfirmDelete(false);
    setDeleteId(null);
  };

  useEffect(() => {
    setFilteredClients(fuzzySearch(clients, query));
  }, [query, clients]);

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
          setSelectedClient(null);
          setOpenForm(true);
        }}
        sx={{ marginBottom: 2 }}
      >
        Добавить клиента
      </Button>

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
                <IconButton onClick={() => handleDelete(client.id!)} color="error">
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
      <ClientForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={() => window.location.reload()}
        client={selectedClient!}
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
