import { Container, Typography } from '@mui/material';
import DealsList from '@/components/deals/DealsList';

export default function DealsPage() {
  return (
    <Container>
      <Typography variant="h4" sx={{ marginBottom: 2 }}>
        Сделки
      </Typography>
      <DealsList />
    </Container>
  );
}
