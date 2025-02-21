'use client';

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
import RealtorForm from '@/components/realtors/RealtorForm';
import { Realtor } from '@/types/types';
import ConfirmDialog from '@/components/ConfirmDialog';
import SnackbarNotification from '@/components/SnackbarNotification';
import { fuzzySearch } from '@/utils/fuzzySearch';
import { useDeleteRealtorMutation, useGetRealtorsQuery } from '@/services/realtorsApi';

import styles from './RealtorsList.module.scss';

export default function RealtorsList() {
  const { data: realtorsData = [], isLoading, refetch } = useGetRealtorsQuery();
  const [query, setQuery] = useState<string>('');

  const [selectedRealtor, setSelectedRealtor] = useState<Realtor>();
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

  const [deleteRealtor] = useDeleteRealtorMutation();

  const handleDelete = async (id: number) => {
    setDeleteId(id);
    setConfirmDelete(true);
  };

  const confirmDeleteAction = async () => {
    if (!deleteId) return;
    try {
      await deleteRealtor(deleteId).unwrap();
      setSnackbar({ open: true, message: 'Риэлтор успешно удалён', severity: 'success' });
    } catch (error) {
      console.error('Ошибка удаления риэлтора', error);
      setSnackbar({ open: true, message: 'Ошибка при удалении риэлтора', severity: 'error' });
    }
    setConfirmDelete(false);
    setDeleteId(null);
  };

  // Функция для получения ФИО клиента
  const getRealtorFields = (realtor: Realtor) => [
    realtor.first_name,
    realtor.middle_name,
    realtor.last_name,
  ];

  // Фильтрация клиентов с учетом нечёткого поиска (Левенштейн <= 3)
  const filteredRealtors = useMemo(() => {
    return fuzzySearch(realtorsData, query, getRealtorFields, undefined, 3);
  }, [realtorsData, query]);

  return (
    <div className={styles.contentWrapper}>
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
          setSelectedRealtor(undefined);
          setOpenForm(true);
        }}
        sx={{ marginBottom: 2 }}
      >
        Добавить риэлтора
      </Button>

      {isLoading ? (
        <div className={styles.loaderWrapper}>
          <CircularProgress />
        </div>
      ) : (
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
      )}

      <RealtorForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={() => refetch()}
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
