'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import ConfirmDialog from '@/components/ConfirmDialog';
import SnackbarNotification from '@/components/SnackbarNotification';
import { useDeleteOfferMutation, useGetOffersQuery } from '@/services/offersApi';
import { Offer } from '@/types/types';
import OfferForm from '@/components/offers/OfferForm';

export default function OffersList() {
  const { data: offersData = [], isLoading, refetch } = useGetOffersQuery();
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
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

  const [deleteOffer] = useDeleteOfferMutation();

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setConfirmDelete(true);
  };

  const confirmDeleteAction = async () => {
    if (!deleteId) return;
    try {
      await deleteOffer(deleteId).unwrap();
      setSnackbar({ open: true, message: 'Предложение удалено', severity: 'success' });
      await refetch();
    } catch (error) {
      console.error(error);
      setSnackbar({ open: true, message: 'Ошибка при удалении предложения', severity: 'error' });
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
          setSelectedOffer(null);
          setOpenForm(true);
        }}
        sx={{ marginBottom: 2 }}
      >
        Добавить предложение
      </Button>

      {isLoading ? (
        <CircularProgress />
      ) : (
        <Stack spacing={2}>
          {offersData.map((offer) => (
            <Card
              key={offer.id}
              variant="outlined"
              sx={{
                maxWidth: 360,
                p: 2,
                borderRadius: 2,
              }}
            >
              <Box sx={{ pb: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" fontWeight="bold">
                    {offer.client.middle_name} {offer.client.last_name}
                  </Typography>
                  {/* Блок с ценой */}
                  <Card
                    variant="outlined"
                    sx={{
                      borderRadius: 1,
                      px: 1,
                      py: 0.5,
                      minWidth: 80,
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                      {offer.price} руб.
                    </Typography>
                  </Card>
                </Stack>
                {offer.realtor && (
                  <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                    Риелтор: {offer.realtor.first_name} {offer.realtor.middle_name}
                  </Typography>
                )}
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                  Объект: {offer.property.full_address}
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ paddingTop: 2 }}>
                <Stack justifyContent={'end'} direction="row" spacing={1}>
                  <IconButton
                    onClick={() => {
                      setSelectedOffer(offer);
                      setOpenForm(true);
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(offer.id)} color="error">
                    <Delete />
                  </IconButton>
                </Stack>
              </Box>
            </Card>
          ))}
        </Stack>
      )}

      <OfferForm open={openForm} onCloseAction={() => setOpenForm(false)} offer={selectedOffer} />

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={confirmDeleteAction}
        title="Удаление предложения"
        description="Вы уверены, что хотите удалить это предложение? Это действие нельзя отменить."
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
