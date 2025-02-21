import React from 'react';
import { Button, Grid, IconButton, TextField } from '@mui/material';
import { Delete } from '@mui/icons-material';

interface PolygonInputProps {
  polygon: [number, number][];
  setPolygon: (polygon: [number, number][]) => void;
}

const PolygonInput: React.FC<PolygonInputProps> = ({ polygon, setPolygon }) => {
  const handleCoordinateChange = (index: number, key: 'lat' | 'lon', value: string) => {
    const newPolygon = [...polygon];
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      if (key === 'lat') {
        newPolygon[index][0] = parsed;
      } else {
        newPolygon[index][1] = parsed;
      }
      setPolygon(newPolygon);
    }
  };

  const addCoordinate = () => {
    // Добавляем новую координату с дефолтными значениями (0,0)
    setPolygon([...polygon, [0, 0]]);
  };

  const removeCoordinate = (index: number) => {
    const newPolygon = polygon.filter((_, i) => i !== index);
    setPolygon(newPolygon);
  };

  return (
    <div>
      {polygon.map((coord, index) => (
        <Grid container spacing={1} alignItems="center" key={index} sx={{ marginBottom: 1 }}>
          <Grid item xs={5}>
            <TextField
              label="Широта"
              value={coord[0]}
              onChange={(e) => handleCoordinateChange(index, 'lat', e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={5}>
            <TextField
              label="Долгота"
              value={coord[1]}
              onChange={(e) => handleCoordinateChange(index, 'lon', e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={2}>
            <IconButton onClick={() => removeCoordinate(index)} color="error">
              <Delete />
            </IconButton>
          </Grid>
        </Grid>
      ))}
      <Button sx={{ marginBottom: 2 }} variant="contained" onClick={addCoordinate}>
        Добавить координату
      </Button>
    </div>
  );
};

export default PolygonInput;
