'use client';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { Realtor } from '@/types/types';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';

interface FormRealtor extends Omit<Realtor, 'id'> {
  id?: number;
  commission_rate: number;
}

interface RealtorFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  realtor?: Partial<FormRealtor> | null;
}

const schema = yup.object({
  first_name: yup.string().required('Фамилия обязательна'),
  middle_name: yup.string().required('Имя обязательно'),
  last_name: yup.string().required('Отчество обязательно'),
  commission_rate: yup
    .number()
    .typeError('Должно быть числом')
    .required('Доля комиссии обязательна')
    .min(0, 'Комиссия не может быть отрицательной')
    .max(100, 'Комиссия не может превышать 100%'),
});

export default function RealtorForm({ open, onClose, onSuccess, realtor }: RealtorFormProps) {
  const {
    handleSubmit,
    setValue,
    register,
    formState: { errors },
  } = useForm<FormRealtor>({
    resolver: yupResolver(schema),
    defaultValues: {
      first_name: realtor?.first_name || '',
      middle_name: realtor?.middle_name || '',
      last_name: realtor?.last_name || '',
      commission_rate: realtor?.commission_rate ?? 0,
    },
  });

  useEffect(() => {
    if (realtor) {
      setValue('first_name', realtor.first_name || '');
      setValue('middle_name', realtor.middle_name || '');
      setValue('last_name', realtor.last_name || '');
      setValue('commission_rate', realtor.commission_rate ?? 0);
    }
  }, [realtor, setValue]);

  const onSubmit = async (data: FormRealtor): Promise<void> => {
    try {
      const url = realtor?.id ? `/api/realtors/${realtor.id}` : '/api/realtors';
      const method = realtor?.id ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Ошибка при сохранении риэлтора', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{realtor?.id ? 'Редактировать риэлтора' : 'Добавить риэлтора'}</DialogTitle>
      <DialogContent>
        <TextField
          label="Фамилия"
          {...register('first_name')}
          fullWidth
          margin="dense"
          error={!!errors.first_name}
          helperText={errors.first_name?.message}
        />
        <TextField
          label="Имя"
          {...register('middle_name')}
          fullWidth
          margin="dense"
          error={!!errors.middle_name}
          helperText={errors.middle_name?.message}
        />
        <TextField
          label="Отчество"
          {...register('last_name')}
          fullWidth
          margin="dense"
          error={!!errors.last_name}
          helperText={errors.last_name?.message}
        />
        <TextField
          label="Доля комиссии"
          {...register('commission_rate', { valueAsNumber: true })}
          fullWidth
          margin="dense"
          type="number"
          error={!!errors.commission_rate}
          helperText={errors.commission_rate?.message}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Отмена
        </Button>
        <Button onClick={handleSubmit(onSubmit)} color="primary">
          {realtor?.id ? 'Сохранить' : 'Добавить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
