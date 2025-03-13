'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Typography,
} from '@mui/material';
import {
  AttachMoney,
  Business,
  CorporateFare,
  Delete,
  Edit,
  Home,
  MonetizationOn,
  Person,
} from '@mui/icons-material';
import ConfirmDialog from '@/components/ConfirmDialog';
import SnackbarNotification from '@/components/SnackbarNotification';
import { useDeleteDealMutation, useGetDealsQuery } from '@/services/dealsApi';
import { Deal, SnackbarNotificationProps } from '@/types/types';
import DealForm from '@/components/deals/DealForm';
import { propertyTypeDict } from '@/utils/propertyTypeDict';

export default function DealsList() {
  const { data: dealsData = [], isLoading, refetch } = useGetDealsQuery();
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarNotificationProps>({
    open: false,
    message: '',
    onCloseAction: () => {},
    severity: 'success',
  });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteDeal] = useDeleteDealMutation();

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setConfirmDelete(true);
  };

  const confirmDeleteAction = async () => {
    if (!deleteId) return;
    try {
      await deleteDeal(deleteId).unwrap();
      setSnackbar({ open: true, message: 'Сделка удалена', severity: 'success' });
      await refetch();
    } catch (error) {
      setSnackbar({ open: true, message: 'Ошибка при удалении сделки', severity: 'error' });
      console.error(error);
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
          setSelectedDeal(null);
          setOpenForm(true);
        }}
        sx={{ mb: 2 }}
      >
        Добавить сделку
      </Button>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2} alignItems="stretch">
          {dealsData.map((deal) => (
            <Grid item xs={12} sm={6} md={4} key={deal.id}>
              <Card
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Сделка #{deal.id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    <Home sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Предложение: {deal.offer_details?.property} ({deal.offer_details?.price} руб.)
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    <Business sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Потребность:{' '}
                    {propertyTypeDict[deal.demand_details.property_type] ||
                      deal.demand_details?.property_type}{' '}
                    (от {deal.demand_details?.min_price} до {deal.demand_details?.max_price} руб.)
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <AttachMoney sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Комиссия продавца: {deal.seller_fee} руб.
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <MonetizationOn sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Комиссия покупателя: {deal.buyer_fee} руб.
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <CorporateFare sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Отчисления компании: {deal.company_share} руб.
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <Person sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Отчисления риэлтору: {deal.realtor_share} руб.
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Edit />}
                    onClick={() => {
                      setSelectedDeal(deal);
                      setOpenForm(true);
                    }}
                  >
                    Редактировать
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => handleDelete(deal.id)}
                  >
                    Удалить
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <DealForm open={openForm} onCloseAction={() => setOpenForm(false)} deal={selectedDeal} />

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={confirmDeleteAction}
        title="Удаление сделки"
        description="Вы уверены, что хотите удалить эту сделку? Это действие нельзя отменить."
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
