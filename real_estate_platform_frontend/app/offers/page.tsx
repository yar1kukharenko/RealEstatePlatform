import { Container, Typography } from '@mui/material';
import OffersList from '@/components/offers/OffersList';

export default function OffersPage() {
  return (
    <Container>
      <Typography variant="h4" sx={{ marginBottom: 2 }}>
        Предложения
      </Typography>
      <OffersList />
    </Container>
  );
}
