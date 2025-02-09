'use client';

import { useEffect, useState } from 'react';
import { Button, IconButton, List, ListItem, ListItemText, TextField } from '@mui/material';
import { fuzzySearch } from '@/utils/fuzzySearch';
import { Delete, Edit } from '@mui/icons-material';
import ClientForm from '@/components/ClientForm';
import { Person } from '@/types/types';

interface SearchClientsProps {
  clients: Person[];
}

export default function ClientsList({ clients: initialClients }: SearchClientsProps) {
  const [query, setQuery] = useState<string>('');
  const [filteredClients, setFilteredClients] = useState<Person[]>(initialClients);
  const [selectedClient, setSelectedClient] = useState<Person | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [clients, setClients] = useState<Person[]>(initialClients);

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/clients/${id}`, { method: 'DELETE' });
      setClients(clients.filter((client) => client.id !== id));
    } catch (error) {
      console.error('Ошибка удаления клиента', error);
    }
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
    </div>
  );
}
