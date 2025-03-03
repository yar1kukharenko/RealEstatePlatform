'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import ConfirmDialog from '@/components/ConfirmDialog';
import SnackbarNotification from '@/components/SnackbarNotification';
import { useDeleteDemandMutation, useGetDemandsQuery } from '@/services/demandsApi';
import { Demand } from '@/types/types';
import DemandForm from '@/components/demands/DemandForm';
import { propertyTypeDict } from '@/utils/propertyTypeDict';

export default function DemandsList() {
  const { data: demandsData = [], isLoading, refetch } = useGetDemandsQuery();
  const [selectedDemand, setSelectedDemand] = useState<Demand>();
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

  const [deleteDemand] = useDeleteDemandMutation();

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setConfirmDelete(true);
  };

  const confirmDeleteAction = async () => {
    if (!deleteId) return;
    try {
      await deleteDemand(deleteId).unwrap();
      setSnackbar({ open: true, message: 'Потребность удалена', severity: 'success' });
      await refetch();
    } catch (error) {
      console.error(error);
      setSnackbar({ open: true, message: 'Ошибка при удалении потребности', severity: 'error' });
    }
    setConfirmDelete(false);
    setDeleteId(null);
  };

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          setSelectedDemand(undefined);
          setOpenForm(true);
        }}
        sx={{ marginBottom: 2 }}
      >
        Добавить потребность
      </Button>

      {isLoading ? (
        <CircularProgress />
      ) : (
        <Stack spacing={2}>
          {demandsData.map((demand) => (
            <Card
              key={demand.id}
              variant="outlined"
              sx={{
                maxWidth: 360,
                padding: 2,
                borderRadius: 2,
              }}
            >
              <Box sx={{ paddingBottom: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" fontWeight="bold">
                    {demand.client.first_name} {demand.client.middle_name}
                  </Typography>
                  {/* Блок с ценами с меньшим размером шрифта */}
                  <Card
                    variant={'outlined'}
                    sx={{
                      borderRadius: 1,
                      px: 1,
                      py: 0.5,
                      minWidth: 80,
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="subtitle2">
                      {demand.min_price} - {demand.max_price} руб.
                    </Typography>
                  </Card>
                </Stack>
                {demand.realtor && (
                  <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                    Риелтор: {demand.realtor.first_name} {demand.realtor.middle_name}
                  </Typography>
                )}
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                  Адрес: {demand.address.full_address}
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ paddingTop: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Chip
                    label={propertyTypeDict[demand.property_type] || demand.property_type}
                    variant="outlined"
                    color="secondary"
                  />
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      onClick={() => {
                        setSelectedDemand(demand);
                        setOpenForm(true);
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(demand.id)} color="error">
                      <Delete />
                    </IconButton>
                  </Stack>
                </Stack>
              </Box>
            </Card>
          ))}
        </Stack>
      )}

      <DemandForm
        open={openForm}
        onCloseAction={() => setOpenForm(false)}
        demand={selectedDemand}
      />

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={confirmDeleteAction}
        title="Удаление потребности"
        description="Вы уверены, что хотите удалить эту потребность? Это действие нельзя отменить."
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
