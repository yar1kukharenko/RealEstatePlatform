'use client';

import styles from './PropertiesList.module.scss';

import { useMemo, useState } from 'react';
import {
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import ConfirmDialog from '@/components/ConfirmDialog';
import SnackbarNotification from '@/components/SnackbarNotification';
import { useDeletePropertyMutation, useGetPropertiesQuery } from '@/services/propertiesApi';
import { fuzzySearch } from '@/utils/fuzzySearch';
import { Property } from '@/types/types';
import PropertyForm from '@/components/properties/PropertyForm';
import { propertyTypeDict } from '@/utils/propertyTypeDict';
import { isInsidePolygon } from '@/utils/geoUtils';
import PolygonInput from '../PolygonInput';

export default function PropertiesList() {
  const { data: propertiesData = [], isLoading } = useGetPropertiesQuery();
  const [query, setQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [polygon, setPolygon] = useState<[number, number][]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property>();
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

  const [deleteProperty] = useDeletePropertyMutation();

  const filteredProperties = useMemo(() => {
    let filtered = propertiesData;

    // Применяем фильтр по типу недвижимости
    if (selectedType !== 'all') {
      filtered = filtered.filter((property) => property.property_type === selectedType);
    }

    if (polygon.length > 2) {
      filtered = filtered.filter((property) => {
        if (!property.latitude || !property.longitude) return false;
        return isInsidePolygon(property.latitude, property.longitude, polygon);
      });
    }

    // Применяем нечёткий поиск
    return fuzzySearch(
      filtered,
      query,
      (property) => [property.city || '', property.street || ''],
      (property) => [property.house_number || '', property.apartment_number || ''],
      3,
      1,
    );
  }, [polygon, propertiesData, query, selectedType]);

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setConfirmDelete(true);
  };

  const confirmDeleteAction = async () => {
    if (!deleteId) return;
    try {
      await deleteProperty(deleteId).unwrap();
      setSnackbar({ open: true, message: 'Объект недвижимости удалён', severity: 'success' });
    } catch (error) {
      console.error(error);
      setSnackbar({ open: true, message: 'Ошибка при удалении объекта', severity: 'error' });
    }
    setConfirmDelete(false);
    setDeleteId(null);
  };

  return (
    <div className={styles.contentWrapper}>
      <FormControl fullWidth sx={{ marginBottom: 2 }}>
        <InputLabel>Тип недвижимости</InputLabel>
        <Select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          label="Тип недвижимости"
        >
          <MenuItem value="all">Все</MenuItem>
          <MenuItem value="apartment">Квартира</MenuItem>
          <MenuItem value="house">Дом</MenuItem>
          <MenuItem value="land">Земля</MenuItem>
        </Select>
      </FormControl>
      <PolygonInput polygon={polygon} setPolygon={setPolygon} />
      <TextField
        label="Поиск объектов недвижимости"
        variant="outlined"
        fullWidth
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{ marginBottom: 2 }}
      />

      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          setSelectedProperty(undefined);
          setOpenForm(true);
        }}
        sx={{ marginBottom: 2 }}
      >
        Добавить объект недвижимости
      </Button>

      {isLoading ? (
        <div className={styles.loaderWrapper}>
          <CircularProgress />
        </div>
      ) : (
        <List>
          {filteredProperties.map((property) => (
            <ListItem
              key={property.id}
              secondaryAction={
                <>
                  <IconButton
                    onClick={() => {
                      setSelectedProperty(property);
                      setOpenForm(true);
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(property.id)} color="error">
                    <Delete />
                  </IconButton>
                </>
              }
            >
              <ListItemText
                primary={`${property.city}, ${property.street}, ${property.house_number} (${propertyTypeDict[property.property_type] || property.property_type})`}
              />
            </ListItem>
          ))}
        </List>
      )}

      <PropertyForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        property={selectedProperty}
      />

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={confirmDeleteAction}
        title="Удаление объекта недвижимости"
        description="Вы уверены, что хотите удалить этот объект? Это действие нельзя отменить."
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
