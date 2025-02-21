'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { Client } from '@/types/types';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';

interface FormPerson extends Omit<Client, 'phone_number' | 'email' | 'id'> {
  id?: number;
  phone_number?: string | null;
  email?: string | null;
}

interface ClientFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  client?: FormPerson;
}

const schema = yup
  .object({
    first_name: yup.string().required('Фамилия обязательна'),
    middle_name: yup.string().required('Имя обязательно'),
    last_name: yup.string().required('Отчество обязательно'),
    phone_number: yup
      .string()
      .nullable()
      .test('is-valid-phone', 'Некорректный формат телефона', (value) => {
        if (!value) return true; // Если значение пустое, проверка не производится (обязательность проверяется отдельно)
        // Убираем все символы, кроме цифр
        const digits = value.replace(/\D/g, '');
        // Если номер без кода — 10 цифр, с кодом (например, +7) — 11 цифр
        return digits.length === 10 || digits.length === 11;
      }),
    email: yup.string().email('Некорректный email').nullable(),
  })
  .test(
    'phone_or_email',
    'Должен быть указан либо телефон, либо email',
    (values) => !!values.phone_number || !!values.email,
  );
export default function ClientForm({ open, onClose, onSuccess, client }: ClientFormProps) {
  const {
    handleSubmit,
    reset,
    register,
    formState: { errors },
  } = useForm<FormPerson>({
    resolver: yupResolver(schema),
    defaultValues: client || {
      first_name: '',
      middle_name: '',
      last_name: '',
      phone_number: '',
      email: '',
    },
  });

  useEffect(() => {
    if (client) {
      reset({
        first_name: client.first_name,
        middle_name: client.middle_name,
        last_name: client.last_name,
        phone_number: client.phone_number || '',
        email: client.email || '',
      });
    } else {
      reset({
        first_name: '',
        middle_name: '',
        last_name: '',
        phone_number: '',
        email: '',
      });
    }
  }, [client, reset, open]);
  const onSubmit = async (data: FormPerson) => {
    try {
      const url = client ? `/api/clients/${client.id}` : '/api/clients';
      const method = client ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Ошибка при сохранении клиента', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{client ? 'Редактировать клиента' : 'Добавить клиента'}</DialogTitle>
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
          label="Телефон"
          fullWidth
          margin="dense"
          placeholder="+7 (___) ___-__-__"
          error={!!errors.phone_number}
          helperText={errors.phone_number?.message}
          {...register('phone_number')}
        />
        <TextField
          label="Email"
          {...register('email')}
          fullWidth
          margin="dense"
          error={!!errors.email}
          helperText={errors.email?.message}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Отмена
        </Button>
        <Button onClick={handleSubmit(onSubmit)} color="primary">
          {client ? 'Сохранить' : 'Добавить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
