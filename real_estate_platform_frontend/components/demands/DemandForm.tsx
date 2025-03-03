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
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useAddDemandMutation, useUpdateDemandMutation } from '@/services/demandsApi';
import { Client, Demand, Property, Realtor } from '@/types/types';
import { useGetClientsQuery } from '@/services/clientsApi';
import { useGetRealtorsQuery } from '@/services/realtorsApi';
import { useGetPropertiesQuery } from '@/services/propertiesApi';

// Интерфейс для значений формы
interface DemandFormValues {
  client: number | undefined;
  address: number | undefined;
  realtor: number | undefined;
  property_type: 'apartment' | 'house' | 'land' | undefined;
  min_price: number;
  max_price: number;
  min_area?: number;
  max_area?: number;
  min_rooms?: number;
  max_rooms?: number;
  min_floor?: number;
  max_floor?: number;
  min_total_floors?: number;
  max_total_floors?: number;
}

interface DemandFormProps {
  open: boolean;
  onCloseAction: () => void;
  demand?: Demand;
}

export default function DemandForm({ open, onCloseAction, demand }: DemandFormProps) {
  const isEditMode = Boolean(demand);

  const {
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<DemandFormValues>({
    defaultValues: demand
      ? {
          client: demand.client?.id,
          realtor: demand.realtor?.id,
          address: demand.address?.id,
          property_type: demand.property_type, // теперь строка
          min_price: demand.min_price,
          max_price: demand.max_price,
          min_area: demand.min_area,
          max_area: demand.max_area,
          min_rooms: demand.min_rooms,
          max_rooms: demand.max_rooms,
          min_floor: demand.min_floor,
          max_floor: demand.max_floor,
          min_total_floors: demand.min_total_floors,
          max_total_floors: demand.max_total_floors,
        }
      : {
          client: undefined,
          realtor: undefined,
          address: undefined,
          property_type: undefined,
          min_price: 0,
          max_price: 0,
          min_area: undefined,
          max_area: undefined,
          min_rooms: undefined,
          max_rooms: undefined,
          min_floor: undefined,
          max_floor: undefined,
          min_total_floors: undefined,
          max_total_floors: undefined,
        },
  });

  const [addDemand] = useAddDemandMutation();
  const [updateDemand] = useUpdateDemandMutation();
  const { data: clients = [] } = useGetClientsQuery();
  const { data: realtors = [] } = useGetRealtorsQuery();
  const { data: properties = [] } = useGetPropertiesQuery();

  // Так как property_type теперь строка, сравнение корректное:
  const selectedType = watch('property_type');

  useEffect(() => {
    if (demand) {
      reset({
        client: demand.client?.id,
        realtor: demand.realtor?.id,
        address: demand.address?.id,
        property_type: demand.property_type,
        min_price: demand.min_price,
        max_price: demand.max_price,
        min_area: demand.min_area,
        max_area: demand.max_area,
        min_rooms: demand.min_rooms,
        max_rooms: demand.max_rooms,
        min_floor: demand.min_floor,
        max_floor: demand.max_floor,
        min_total_floors: demand.min_total_floors,
        max_total_floors: demand.max_total_floors,
      });
    } else {
      reset({
        client: undefined,
        realtor: undefined,
        address: undefined,
        property_type: undefined,
        min_price: 0,
        max_price: 0,
        min_area: undefined,
        max_area: undefined,
        min_rooms: undefined,
        max_rooms: undefined,
        min_floor: undefined,
        max_floor: undefined,
        min_total_floors: undefined,
        max_total_floors: undefined,
      });
    }
  }, [demand, reset]);

  // Преобразуем данные формы в формат Partial<Demand>, ожидаемый API:
  const onSubmit: SubmitHandler<DemandFormValues> = async (data) => {
    try {
      const payload: Partial<Demand> = {
        client: data.client ? ({ id: data.client } as Client) : undefined,
        realtor: data.realtor ? ({ id: data.realtor } as Realtor) : null,
        address: data.address ? ({ id: data.address } as Property) : undefined,
        property_type: data.property_type,
        min_price: data.min_price,
        max_price: data.max_price,
        min_area: data.min_area,
        max_area: data.max_area,
        min_rooms: data.min_rooms,
        max_rooms: data.max_rooms,
        min_floor: data.min_floor,
        max_floor: data.max_floor,
        min_total_floors: data.min_total_floors,
        max_total_floors: data.max_total_floors,
      };

      if (isEditMode) {
        await updateDemand({ id: demand!.id, data: payload }).unwrap();
      } else {
        await addDemand(payload).unwrap();
      }
      onCloseAction();
    } catch (error) {
      console.error('Ошибка при сохранении потребности', error);
    }
  };

  return (
    <Dialog open={open} onClose={onCloseAction}>
      <DialogTitle>{isEditMode ? 'Редактировать потребность' : 'Добавить потребность'}</DialogTitle>
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

        {/* Выбор типа недвижимости */}
        {!demand?.property_type && (
          <Controller
            name="property_type"
            control={control}
            rules={{ required: 'Выберите тип недвижимости' }}
            render={({ field }) => (
              <TextField
                {...field}
                select
                fullWidth
                label="Тип недвижимости"
                margin="dense"
                error={!!errors.property_type}
                helperText={errors.property_type?.message}
              >
                <MenuItem value="apartment">Квартира</MenuItem>
                <MenuItem value="house">Дом</MenuItem>
                <MenuItem value="land">Земля</MenuItem>
              </TextField>
            )}
          />
        )}

        {/* Выбор объекта недвижимости (адрес) */}
        <Controller
          name="address"
          control={control}
          rules={{ required: 'Выберите объект недвижимости' }}
          render={({ field }) => (
            <TextField
              {...field}
              select
              fullWidth
              label="Объект недвижимости"
              margin="dense"
              error={!!errors.address}
              helperText={errors.address?.message}
            >
              {properties.map((property: Property) => (
                <MenuItem key={property.id} value={property.id}>
                  {property.full_address}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        {/* Минимальная цена */}
        <Controller
          name="min_price"
          control={control}
          rules={{
            required: 'Введите минимальную цену',
            min: { value: 1, message: 'Цена должна быть положительной' },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              type="number"
              fullWidth
              label="Минимальная цена"
              margin="dense"
              error={!!errors.min_price}
              helperText={errors.min_price?.message}
            />
          )}
        />

        {/* Максимальная цена */}
        <Controller
          name="max_price"
          control={control}
          rules={{
            required: 'Введите максимальную цену',
            min: { value: 1, message: 'Цена должна быть положительной' },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              type="number"
              fullWidth
              label="Максимальная цена"
              margin="dense"
              error={!!errors.max_price}
              helperText={errors.max_price?.message}
            />
          )}
        />

        {/* Дополнительные поля для недвижимости, отличной от "land" */}
        {selectedType !== 'land' && (
          <>
            <Controller
              name="min_area"
              control={control}
              render={({ field }) => (
                <TextField {...field} type="number" fullWidth label="Мин. площадь" margin="dense" />
              )}
            />
            <Controller
              name="max_area"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  fullWidth
                  label="Макс. площадь"
                  margin="dense"
                />
              )}
            />
            <Controller
              name="min_rooms"
              control={control}
              render={({ field }) => (
                <TextField {...field} type="number" fullWidth label="Мин. комнаты" margin="dense" />
              )}
            />
            <Controller
              name="max_rooms"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  fullWidth
                  label="Макс. комнаты"
                  margin="dense"
                />
              )}
            />
          </>
        )}
        {selectedType === 'house' && (
          <>
            <Controller
              name="min_total_floors"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  fullWidth
                  label="Мин. этажность"
                  margin="dense"
                />
              )}
            />
            <Controller
              name="max_total_floors"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  fullWidth
                  label="Макс. этажность"
                  margin="dense"
                />
              )}
            />
          </>
        )}
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
