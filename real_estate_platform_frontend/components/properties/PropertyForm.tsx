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
import { useAddPropertyMutation, useUpdatePropertyMutation } from '@/services/propertiesApi';
import { Property } from '@/types/types';

interface PropertyFormProps {
  open: boolean;
  onClose: () => void;
  property?: Property;
}

export default function PropertyForm({ open, onClose, property }: PropertyFormProps) {
  const isEditMode = Boolean(property);

  const {
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<Partial<Property>>({
    defaultValues: property || {
      title: '',
      property_type: 'apartment',
      price: 0,
      description: '',
      city: '',
      street: '',
      house_number: '',
      apartment_number: '',
      latitude: null,
      longitude: null,
      floor: null,
      total_floors: null,
      rooms: null,
      area: null,
    },
  });

  const [addProperty] = useAddPropertyMutation();
  const [updateProperty] = useUpdatePropertyMutation();

  const propertyType = watch('property_type');

  useEffect(() => {
    if (property) {
      reset({
        property_type: property.property_type || 'apartment',
        description: property.description || '',
        city: property.city || '',
        street: property.street || '',
        house_number: property.house_number || '',
        apartment_number: property.apartment_number || '',
        latitude: property.latitude ?? null,
        longitude: property.longitude ?? null,
        floor: property.floor ?? null,
        total_floors: property.total_floors ?? null,
        rooms: property.rooms ?? null,
        area: property.area ?? null,
      });
    } else {
      reset({
        property_type: 'apartment',
        description: '',
        city: '',
        street: '',
        house_number: '',
        apartment_number: '',
        latitude: null,
        longitude: null,
        floor: null,
        total_floors: null,
        rooms: null,
        area: null,
      });
    }
  }, [property, reset]);

  const onSubmit = async (data: Partial<Property>) => {
    try {
      if (isEditMode) {
        await updateProperty({ id: property!.id, data }).unwrap();
      } else {
        await addProperty(data).unwrap();
      }
      onClose();
    } catch (error) {
      console.error('Ошибка при сохранении объекта недвижимости', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{isEditMode ? 'Редактировать объект' : 'Добавить объект'}</DialogTitle>
      <DialogContent>
        {/* Тип недвижимости */}
        {/*Если редактирование, то менять тип нельзя*/}
        {!property && (
          <Controller
            name="property_type"
            control={control}
            render={({ field }) => (
              <TextField {...field} select fullWidth label="Тип недвижимости" margin="dense">
                <MenuItem value="apartment">Квартира</MenuItem>
                <MenuItem value="house">Дом</MenuItem>
                <MenuItem value="land">Земля</MenuItem>
              </TextField>
            )}
          />
        )}

        {/* Адрес */}
        <Controller
          name="city"
          control={control}
          render={({ field }) => <TextField {...field} fullWidth label="Город" margin="dense" />}
        />
        <Controller
          name="street"
          control={control}
          render={({ field }) => <TextField {...field} fullWidth label="Улица" margin="dense" />}
        />
        <Controller
          name="house_number"
          control={control}
          render={({ field }) => (
            <TextField {...field} fullWidth label="Номер дома" margin="dense" />
          )}
        />
        <Controller
          name="apartment_number"
          control={control}
          render={({ field }) => (
            <TextField {...field} fullWidth label="Номер квартиры" margin="dense" />
          )}
        />

        {/* Координаты */}
        <Controller
          name="latitude"
          control={control}
          rules={{
            min: { value: -90, message: 'Широта должна быть от -90 до +90' },
            max: { value: 90, message: 'Широта должна быть от -90 до +90' },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              type="number"
              fullWidth
              label="Широта"
              margin="dense"
              value={field.value == null ? '' : field.value}
              error={!!errors.latitude}
              helperText={errors.latitude?.message}
            />
          )}
        />
        <Controller
          name="longitude"
          control={control}
          rules={{
            min: { value: -180, message: 'Долгота должна быть от -180 до +180' },
            max: { value: 180, message: 'Долгота должна быть от -180 до +180' },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              type="number"
              fullWidth
              label="Долгота"
              margin="dense"
              value={field.value == null ? '' : field.value}
              error={!!errors.longitude}
              helperText={errors.longitude?.message}
            />
          )}
        />

        {/* Специфичные поля для разных типов недвижимости */}
        {propertyType === 'apartment' && (
          <>
            <Controller
              name="floor"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  value={field.value == null ? '' : field.value}
                  fullWidth
                  label="Этаж"
                  margin="dense"
                />
              )}
            />
            <Controller
              name="rooms"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  value={field.value == null ? '' : field.value}
                  fullWidth
                  label="Количество комнат"
                  margin="dense"
                />
              )}
            />
            <Controller
              name="area"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  fullWidth
                  label="Площадь (кв.м)"
                  value={field.value == null ? '' : field.value}
                  margin="dense"
                />
              )}
            />
          </>
        )}

        {propertyType === 'house' && (
          <>
            <Controller
              name="total_floors"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  fullWidth
                  label="Этажность дома"
                  value={field.value == null ? '' : field.value}
                  margin="dense"
                />
              )}
            />
            <Controller
              name="rooms"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  fullWidth
                  value={field.value == null ? '' : field.value}
                  label="Количество комнат"
                  margin="dense"
                />
              )}
            />
            <Controller
              name="area"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  fullWidth
                  value={field.value == null ? '' : field.value}
                  label="Площадь (кв.м)"
                  margin="dense"
                />
              )}
            />
          </>
        )}

        {propertyType === 'land' && (
          <Controller
            name="area"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                fullWidth
                value={field.value == null ? '' : field.value}
                label="Площадь (кв.м)"
                margin="dense"
              />
            )}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Отмена
        </Button>
        <Button onClick={handleSubmit(onSubmit)} color="primary">
          {isEditMode ? 'Сохранить' : 'Добавить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
