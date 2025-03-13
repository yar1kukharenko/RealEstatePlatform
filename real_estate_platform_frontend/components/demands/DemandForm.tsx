import { useEffect } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import {
  useAddDemandMutation,
  useGetDemandsQuery,
  useSearchOffersForDemandQuery,
  useUpdateDemandMutation,
} from '@/services/demandsApi';
import { Demand, DemandMutationInput, Offer, Property } from '@/types/types';
import { useGetClientsQuery } from '@/services/clientsApi';
import { useGetRealtorsQuery } from '@/services/realtorsApi';
import { useGetPropertiesQuery } from '@/services/propertiesApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useAddDealMutation } from '@/services/dealsApi';

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
  const [addDeal] = useAddDealMutation();

  const { data: foundOffers = [], isFetching: isSearchingOffers } = useSearchOffersForDemandQuery(
    demand?.id ?? 0,
    { skip: !demand },
  );

  const { refetch } = useGetDemandsQuery();

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
        min_price: undefined,
        max_price: undefined,
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

  const createDeal = async (offerId: number) => {
    try {
      await addDeal({ offer: offerId, demand: demand!.id }).unwrap();
      alert('Сделка успешно создана!');
      onCloseAction();
      await refetch();
    } catch (error) {
      console.error('Ошибка при создании сделки', error);
    }
  };

  // Преобразуем данные формы в формат Partial<Demand>, ожидаемый API:
  const onSubmit: SubmitHandler<DemandFormValues> = async (data) => {
    try {
      const payload: DemandMutationInput = {
        client: data.client!,
        realtor: data.realtor!,
        address: data.address!,
        property_type: data.property_type!,
        min_price: Number(data.min_price),
        max_price: Number(data.max_price),
        min_area: data.min_area != null ? Number(data.min_area) : undefined,
        max_area: data.max_area != null ? Number(data.max_area) : undefined,
        min_rooms: data.min_rooms != null ? Number(data.min_rooms) : undefined,
        max_rooms: data.max_rooms != null ? Number(data.max_rooms) : undefined,
        min_floor: data.min_floor != null ? Number(data.min_floor) : undefined,
        max_floor: data.max_floor != null ? Number(data.max_floor) : undefined,
        min_total_floors: data.min_total_floors != null ? Number(data.min_total_floors) : undefined,
        max_total_floors: data.max_total_floors != null ? Number(data.max_total_floors) : undefined,
      };

      if (isEditMode) {
        await updateDemand({ id: demand!.id, data: payload }).unwrap();
      } else {
        await addDemand(payload).unwrap();
      }
      onCloseAction();
      reset({
        client: undefined,
        realtor: undefined,
        address: undefined,
        property_type: undefined,
        min_price: undefined,
        max_price: undefined,
        min_area: undefined,
        max_area: undefined,
        min_rooms: undefined,
        max_rooms: undefined,
        min_floor: undefined,
        max_floor: undefined,
        min_total_floors: undefined,
        max_total_floors: undefined,
      });
      await refetch();
    } catch (error) {
      console.error('Ошибка при сохранении потребности', error);
      if ((error as FetchBaseQueryError).data) {
        console.error('Подробности ошибки:', (error as FetchBaseQueryError).data);
      }
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
              value={field.value ?? ''}
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
              value={field.value ?? ''}
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
                value={field.value ?? ''}
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
              value={field.value ?? ''}
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
              value={field.value ?? ''}
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
              value={field.value ?? ''}
              fullWidth
              label="Максимальная цена"
              margin="dense"
              error={!!errors.max_price}
              helperText={errors.max_price?.message}
            />
          )}
        />

        {/* Дополнительные поля для недвижимости, отличной от "land" */}
        {selectedType && (
          <>
            <Controller
              name="min_area"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  fullWidth
                  label="Мин. площадь"
                  margin="dense"
                  value={field.value ?? ''}
                />
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
                  value={field.value ?? ''}
                />
              )}
            />
          </>
        )}

        {/* Если выбран тип "apartment" – показываем дополнительные поля для квартиры */}
        {selectedType === 'apartment' && (
          <>
            <Controller
              name="min_rooms"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  fullWidth
                  label="Мин. комнаты"
                  margin="dense"
                  value={field.value ?? ''}
                />
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
                  value={field.value ?? ''}
                />
              )}
            />
            <Controller
              name="min_floor"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  fullWidth
                  label="Мин. этаж"
                  margin="dense"
                  value={field.value ?? ''}
                />
              )}
            />
            <Controller
              name="max_floor"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  fullWidth
                  label="Макс. этаж"
                  margin="dense"
                  value={field.value ?? ''}
                />
              )}
            />
          </>
        )}

        {/* Если выбран тип "house" – показываем дополнительные поля для дома */}
        {selectedType === 'house' && (
          <>
            <Controller
              name="min_rooms"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  fullWidth
                  label="Мин. комнаты"
                  margin="dense"
                  value={field.value ?? ''}
                />
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
                  value={field.value ?? ''}
                />
              )}
            />
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
                  value={field.value ?? ''}
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
                  value={field.value ?? ''}
                />
              )}
            />
          </>
        )}
        {isEditMode && !demand?.fulfilled && (
          <Box sx={{ mt: 2, p: 1 }}>
            <Typography variant="h6" gutterBottom>
              Найденные предложения:
            </Typography>
            {isSearchingOffers ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={20} />
              </Box>
            ) : foundOffers.length ? (
              <List>
                {foundOffers.map((offer: Offer) => (
                  <ListItem key={offer.id} disableGutters>
                    <Grid container alignItems="center" spacing={2}>
                      <Grid item xs={12} sm={8}>
                        <ListItemText
                          primary={`Объект: ${offer.property.full_address}`}
                          secondary={`Цена: ${offer.price} руб.`}
                        />
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        sm={4}
                        sx={{ textAlign: { xs: 'left', sm: 'right' }, mt: { xs: 1, sm: 0 } }}
                      >
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => createDeal(offer.id)}
                        >
                          Создать сделку
                        </Button>
                      </Grid>
                    </Grid>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body1" sx={{ mt: 1 }}>
                Предложения не найдены.
              </Typography>
            )}
          </Box>
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
