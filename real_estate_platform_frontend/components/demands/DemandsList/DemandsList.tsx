'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Typography,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import ConfirmDialog from '@/components/ConfirmDialog';
import SnackbarNotification from '@/components/SnackbarNotification';
import { useDeleteDemandMutation, useGetDemandsQuery } from '@/services/demandsApi';
import { Demand } from '@/types/types';
import DemandForm from '@/components/demands/DemandForm';
import { propertyTypeDict } from '@/utils/propertyTypeDict';

import styles from './DemandsList.module.scss';

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
    <Box sx={{ p: 2 }}>
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          setSelectedDemand(undefined);
          setOpenForm(true);
        }}
        sx={{ mb: 2 }}
      >
        Добавить потребность
      </Button>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2} alignItems="stretch">
          {demandsData.map((demand) => (
            <Grid item xs={12} sm={6} md={4} key={demand.id}>
              <Card
                variant="outlined"
                className={styles.card}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  minWidth: 280,
                  height: '100%', // заставляем карточку занимать всю доступную высоту
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ pb: 2 }}>
                  <Grid container alignItems="center" justifyContent="space-between">
                    <Grid item xs={8}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {demand.client.first_name} {demand.client.middle_name}
                      </Typography>
                    </Grid>
                  </Grid>

                  {demand.realtor && (
                    <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                      Риелтор: {demand.realtor.first_name} {demand.realtor.middle_name}
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                    Адрес: {demand.address.full_address}
                  </Typography>
                </Box>
                <Divider sx={{ mb: 1 }} />
                <Box
                  sx={{
                    border: '1px solid',
                    borderColor: 'grey.400',
                    borderRadius: 1,
                    px: 1,
                    py: 0.5,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="subtitle2">
                    {demand.min_price} - {demand.max_price} руб.
                  </Typography>
                </Box>
                <Box sx={{ pt: 1 }}>
                  <Grid container alignItems="center" justifyContent="space-between">
                    <Grid item>
                      <Chip
                        label={propertyTypeDict[demand.property_type] || demand.property_type}
                        variant="outlined"
                        color="secondary"
                      />
                    </Grid>
                    <Grid item>
                      <Grid container spacing={1}>
                        <Grid item>
                          <IconButton
                            onClick={() => {
                              setSelectedDemand(demand);
                              setOpenForm(true);
                            }}
                          >
                            <Edit />
                          </IconButton>
                        </Grid>
                        <Grid item>
                          <IconButton
                            disabled={demand.fulfilled}
                            onClick={() => handleDelete(demand.id)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
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
        onCloseAction={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  );
}
