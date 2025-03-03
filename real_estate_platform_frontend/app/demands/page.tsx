import DemandsList from '@/components/demands/DemandsList';
import { Container, Typography } from '@mui/material';

export default function DemandsPage() {
  return (
    <Container>
      <Typography variant="h4" sx={{ marginBottom: 2 }}>
        Потребности
      </Typography>
      <DemandsList />
    </Container>
  );
}
