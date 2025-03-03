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

import { Client, Offer, Property, Realtor } from '@/types/types';
import { useAddOfferMutation, useUpdateOfferMutation } from '@/services/offersApi';
import { useGetClientsQuery } from '@/services/clientsApi';
import { useGetRealtorsQuery } from '@/services/realtorsApi';
import { useGetPropertiesQuery } from '@/services/propertiesApi';
import { propertyTypeDict } from '@/utils/propertyTypeDict';

interface OfferFormValues {
  client: number | undefined;
  property: number | undefined;
  realtor: number | undefined;
  price: number;
}

interface OfferFormProps {
  open: boolean;
  onCloseAction: () => void;
  offer: Offer | null;
}

export default function OfferForm({ open, onCloseAction, offer }: OfferFormProps) {
  const isEditMode = Boolean(offer);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<OfferFormValues>({
    defaultValues: offer
      ? {
          client: offer.client?.id,
          property: offer.property?.id,
          realtor: offer.realtor ? offer.realtor.id : undefined,
          price: offer.price,
        }
      : {
          client: undefined,
          property: undefined,
          realtor: undefined,
          price: 0,
        },
  });

  const [addOffer] = useAddOfferMutation();
  const [updateOffer] = useUpdateOfferMutation();
  const { data: clients = [] } = useGetClientsQuery();
  const { data: realtors = [] } = useGetRealtorsQuery();
  const { data: properties = [] } = useGetPropertiesQuery();

  useEffect(() => {
    if (offer) {
      reset({
        client: offer.client?.id,
        property: offer.property?.id,
        realtor: offer.realtor ? offer.realtor.id : undefined,
        price: offer.price,
      });
    } else {
      reset({
        client: undefined,
        property: undefined,
        realtor: undefined,
        price: 0,
      });
    }
  }, [offer, reset]);

  const onSubmit = async (data: OfferFormValues) => {
    try {
      const transformedData: Partial<Offer> = {
        client: data.client ? ({ id: data.client } as Client) : undefined,
        property: data.property ? ({ id: data.property } as Property) : undefined,
        realtor: data.realtor ? ({ id: data.realtor } as Realtor) : undefined,
        price: data.price,
      };
      if (isEditMode) {
        await updateOffer({ id: offer!.id, data: transformedData }).unwrap();
      } else {
        await addOffer(transformedData).unwrap();
      }
      onCloseAction();
    } catch (error) {
      console.error('Ошибка при сохранении предложения', error);
    }
  };

  return (
    <Dialog open={open} onClose={onCloseAction}>
      <DialogTitle>{isEditMode ? 'Редактировать предложение' : 'Добавить предложение'}</DialogTitle>
      <DialogContent>
        {/* Выбор клиента */}
        <Controller
          name="client"
          control={control}
          rules={{ required: 'Выберите клиента' }}
          render={({ field }) => (
            <TextField
              {...field}
              select
              fullWidth
              label="Клиент"
              margin="dense"
              error={!!errors.client}
              helperText={errors.client?.message}
            >
              {clients.map((client) => (
                <MenuItem key={client.id} value={client.id}>
                  {client.first_name} {client.middle_name} {client.last_name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        {/* Выбор риэлтора */}
        <Controller
          name="realtor"
          control={control}
          rules={{ required: 'Выберите риэлтора' }}
          render={({ field }) => (
            <TextField
              {...field}
              select
              fullWidth
              label="Риэлтор"
              margin="dense"
              error={!!errors.realtor}
              helperText={errors.realtor?.message}
            >
              {realtors.map((realtor) => (
                <MenuItem key={realtor.id} value={realtor.id}>
                  {realtor.first_name} {realtor.middle_name} {realtor.last_name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        {/* Выбор объекта недвижимости */}
        <Controller
          name="property"
          control={control}
          rules={{ required: 'Выберите объект недвижимости' }}
          render={({ field }) => (
            <TextField
              {...field}
              select
              fullWidth
              label="Объект недвижимости"
              margin="dense"
              error={!!errors.property}
              helperText={errors.property?.message}
            >
              {properties.map((property) => (
                <MenuItem key={property.id} value={property.id}>
                  {property.city}, {property.street}, {property.house_number} (
                  {propertyTypeDict[property.property_type] || property.property_type})
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        {/* Поле цены */}
        <Controller
          name="price"
          control={control}
          rules={{
            required: 'Укажите цену',
            min: { value: 1, message: 'Цена должна быть положительным числом' },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              type="number"
              fullWidth
              label="Цена"
              margin="dense"
              error={!!errors.price}
              helperText={errors.price?.message}
            />
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCloseAction} color="secondary">
          Отмена
        </Button>
        <Button onClick={handleSubmit(onSubmit)} color="primary">
          {isEditMode ? 'Сохранить' : 'Добавить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
