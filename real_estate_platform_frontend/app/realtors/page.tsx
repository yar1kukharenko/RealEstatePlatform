import RealtorsList from '@/components/Realtors/RealtorsList/RealtorsList';
import { Container, Typography } from '@mui/material';

export default async function RealtorsPage() {
  return (
    <Container>
      <Typography variant="h4" sx={{ marginBottom: 2 }}>
        Риэлторы
      </Typography>
      <RealtorsList />
    </Container>
  );
}
