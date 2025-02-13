'use client';

import { useEffect, useState } from 'react';
import { Button, IconButton, List, ListItem, ListItemText, TextField } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import RealtorForm from '@/components/Realtors/RealtorForm';
import { Realtor } from '@/types/types';
import ConfirmDialog from '@/components/ConfirmDialog';
import SnackbarNotification from '@/components/SnackbarNotification';
import { fuzzySearch } from '@/utils/fuzzySearch';

interface SearchRealtorsProps {
  realtors: Realtor[];
}

export default function RealtorsList({ realtors: initialRealtors }: SearchRealtorsProps) {
  const [query, setQuery] = useState<string>('');
  const [filteredRealtors, setFilteredRealtors] = useState<Realtor[]>(initialRealtors);
  const [selectedRealtor, setSelectedRealtor] = useState<Realtor | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [realtors, setRealtors] = useState<Realtor[]>(initialRealtors);
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

  const handleDelete = async (id: number) => {
    setDeleteId(id);
    setConfirmDelete(true);
  };

  const confirmDeleteAction = async () => {
    if (!deleteId) return;
    try {
      await fetch(`/api/realtors/${deleteId}`, { method: 'DELETE' });
      setRealtors(realtors.filter((realtor) => realtor.id !== deleteId));
      setSnackbar({ open: true, message: 'Риэлтор успешно удалён', severity: 'success' });
    } catch (error) {
      console.error('Ошибка удаления риэлтора', error);
      setSnackbar({ open: true, message: 'Ошибка при удалении риэлтора', severity: 'error' });
    }
    setConfirmDelete(false);
    setDeleteId(null);
  };

  useEffect(() => {
    setFilteredRealtors(fuzzySearch(realtors, query));
  }, [query, realtors]);

  return (
    <div>
      <TextField
        label="Поиск риэлторов"
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
          setSelectedRealtor(null);
          setOpenForm(true);
        }}
        sx={{ marginBottom: 2 }}
      >
        Добавить риэлтора
      </Button>

      <List>
        {filteredRealtors.map((realtor) => (
          <ListItem
            key={realtor.id}
            secondaryAction={
              <>
                <IconButton
                  onClick={() => {
                    setSelectedRealtor(realtor);
                    setOpenForm(true);
                  }}
                >
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(realtor.id!)} color="error">
                  <Delete />
                </IconButton>
              </>
            }
          >
            <ListItemText
              primary={`${realtor.first_name} ${realtor.middle_name} ${realtor.last_name} (Комиссия: ${realtor.commission_rate}%)`}
            />
          </ListItem>
        ))}
      </List>
      <RealtorForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={() => window.location.reload()}
        realtor={selectedRealtor}
      />

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={confirmDeleteAction}
        title="Удаление риэлтора"
        description="Вы уверены, что хотите удалить этого риэлтора? Это действие нельзя отменить."
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
