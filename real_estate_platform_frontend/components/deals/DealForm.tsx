'use client';

import { useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Deal } from '@/types/types';
import { useAddDealMutation, useUpdateDealMutation } from '@/services/dealsApi';
import { useGetOffersQuery } from '@/services/offersApi';
import { useGetDemandsQuery } from '@/services/demandsApi';
import { propertyTypeDict } from '@/utils/propertyTypeDict';

interface DealFormProps {
  open: boolean;
  onCloseAction: () => void;
  deal?: Deal | null;
}

interface DealFormValues {
  offer: number;
  demand: number;
}

const schema = yup.object().shape({
  offer: yup.number().required('Выберите предложение'),
  demand: yup.number().required('Выберите потребность'),
});

export default function DealForm({ open, onCloseAction, deal }: DealFormProps) {
  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<DealFormValues>({
    resolver: yupResolver(schema),
    defaultValues: deal || {
      offer: undefined,
      demand: undefined,
    },
  });

  // Запросы предложений и потребностей
  const { data: offers = [] } = useGetOffersQuery();
  const { data: demands = [] } = useGetDemandsQuery();

  // Мутации для добавления и обновления сделки
  const [addDeal] = useAddDealMutation();
  const [updateDeal] = useUpdateDealMutation();

  useEffect(() => {
    if (deal) {
      setValue('offer', deal.offer);
      setValue('demand', deal.demand);
    }
  }, [deal, setValue]);

  const onSubmit = async (data: Partial<Deal>) => {
    console.log(data);
    try {
      if (deal) {
        await updateDeal({ id: deal.id, data }).unwrap();
      } else {
        await addDeal(data).unwrap();
      }
      onCloseAction();
    } catch (error) {
      console.error('Ошибка при сохранении сделки', error);
    }
  };

  useEffect(() => {
    if (open) {
      reset(
        deal ? { offer: deal.offer, demand: deal.demand } : { offer: undefined, demand: undefined },
      );
    }
  }, [open, deal, reset]);

  return (
    <Dialog open={open} onClose={onCloseAction} fullWidth maxWidth="sm">
      <DialogTitle>{deal ? 'Редактировать сделку' : 'Добавить сделку'}</DialogTitle>
      <DialogContent>
        <Controller
          name="offer"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              select
              label="Выберите предложение"
              fullWidth
              margin="dense"
              error={!!errors.offer}
              helperText={errors.offer?.message}
              value={field.value || ''}
            >
              {offers
                .filter((offer) => (deal ? true : !offer.fulfilled))
                .map((offer) => (
                  <MenuItem key={offer.id} value={offer.id}>
                    {propertyTypeDict[offer.property.property_type] || offer.property.property_type}
                    , {offer.property.full_address} — {offer.price} руб.
                  </MenuItem>
                ))}
            </TextField>
          )}
        />

        <Controller
          name="demand"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              select
              label="Выберите потребность"
              fullWidth
              margin="dense"
              error={!!errors.demand}
              helperText={errors.demand?.message}
              value={field.value || ''}
            >
              {demands
                .filter((demand) => (deal ? true : !demand.fulfilled))
                .map((demand) => (
                  <MenuItem key={demand.id} value={demand.id}>
                    {propertyTypeDict[demand.address.property_type] || demand.address.property_type}
                    , {demand.address.full_address} (от {demand.min_price} до {demand.max_price}{' '}
                    руб.)
                  </MenuItem>
                ))}
            </TextField>
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCloseAction} color="secondary">
          Отмена
        </Button>
        <Button onClick={handleSubmit(onSubmit)} color="primary">
          {deal ? 'Сохранить' : 'Добавить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
