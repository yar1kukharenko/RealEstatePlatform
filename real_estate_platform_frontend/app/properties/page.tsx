import { Container, Typography } from '@mui/material';
import PropertiesList from '@/components/properties/PropertiesList/PropertiesList';

export default async function PropertiesPage() {
  return (
    <Container>
      <Typography variant="h4" sx={{ marginBottom: 2 }}>
        Недвижимость
      </Typography>
      <PropertiesList />
    </Container>
  );
}
