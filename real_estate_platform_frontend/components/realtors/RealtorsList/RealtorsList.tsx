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
import RealtorForm from '@/components/realtors/RealtorForm';
import { Realtor } from '@/types/types';
import ConfirmDialog from '@/components/ConfirmDialog';
import SnackbarNotification from '@/components/SnackbarNotification';
import { fuzzySearch } from '@/utils/fuzzySearch';
import {
  useDeleteRealtorMutation,
  useGetRealtorRelatedQuery,
  useGetRealtorsQuery,
} from '@/services/realtorsApi';
import RelatedDataDialog from '@/components/RelatedDataDialog/RelatedDataDialog';

export default function RealtorsList() {
  const { data: realtorsData = [], isLoading, refetch } = useGetRealtorsQuery();
  const [query, setQuery] = useState<string>('');
  const [selectedRealtor, setSelectedRealtor] = useState<Realtor | undefined>(undefined);
  const [editingRealtor, setEditingRealtor] = useState<Realtor | undefined>(undefined);
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

  // Функция для получения ФИО риэлтора
  const getRealtorFields = (realtor: Realtor) => [
    realtor.first_name,
    realtor.middle_name,
    realtor.last_name,
  ];

  // Фильтрация риэлторов по нечёткому поиску (Левенштейн <= 3)
  const filteredRealtors = useMemo(() => {
    return fuzzySearch(realtorsData, query, getRealtorFields, undefined, 3);
  }, [realtorsData, query]);

  // Получение связанных данных выбранного риэлтора (для просмотра)
  const { data: relatedData, isLoading: relatedLoading } = useGetRealtorRelatedQuery(
    selectedRealtor?.id ?? 0,
    { skip: !selectedRealtor || !!editingRealtor },
  );

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setConfirmDelete(true);
  };

  const confirmDeleteAction = async () => {
    if (!deleteId) return;
    try {
      await deleteRealtor(deleteId).unwrap();
      setSnackbar({ open: true, message: 'Риэлтор успешно удалён', severity: 'success' });
      await refetch();
    } catch (error) {
      console.error('Ошибка при удалении риэлтора', error);
      setSnackbar({ open: true, message: 'Ошибка при удалении риэлтора', severity: 'error' });
    }
    setConfirmDelete(false);
    setDeleteId(null);
  };

  return (
    <Box sx={{ p: 2 }}>
      <TextField
        label="Поиск риэлторов"
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
          setSelectedRealtor(undefined);
          setEditingRealtor(undefined);
          setOpenForm(true);
        }}
        sx={{ mb: 2 }}
      >
        Добавить риэлтора
      </Button>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      ) : (
        <List>
          {filteredRealtors.map((realtor) => (
            <ListItem
              key={realtor.id}
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
                  if (!editingRealtor) setSelectedRealtor(realtor);
                }}
                selected={selectedRealtor?.id === realtor.id && !editingRealtor}
                sx={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <ListItemText
                  primary={`${realtor.first_name} ${realtor.middle_name} ${realtor.last_name} (Комиссия: ${realtor.commission_rate}%)`}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingRealtor(realtor);
                      setOpenForm(true);
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(realtor.id);
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

      {/* Отображаем RelatedDataDialog только если выбран риэлтор и не идёт редактирование */}
      {selectedRealtor && !editingRealtor && (
        <RelatedDataDialog
          open={!!selectedRealtor}
          onCloseAction={() => setSelectedRealtor(undefined)}
          title={`Данные для риэлтора: ${selectedRealtor.first_name} ${selectedRealtor.last_name}`}
          relatedData={relatedData}
          isLoading={relatedLoading}
        />
      )}

      <RealtorForm
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setEditingRealtor(undefined);
        }}
        onSuccess={() => {
          refetch();
          setEditingRealtor(undefined);
        }}
        realtor={editingRealtor}
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
        onCloseAction={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  );
}
