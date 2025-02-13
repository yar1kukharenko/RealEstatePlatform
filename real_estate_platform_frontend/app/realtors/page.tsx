import RealtorsList from '@/components/Realtors/RealtorsList';
import { Realtor } from '@/types/types';
import { Container, Typography } from '@mui/material';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://real-estate-backend:8000/api/realtors/';

async function getRealtors(): Promise<Realtor[]> {
  const res = await fetch(API_URL, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error('Ошибка загрузки риэлторов');
  }

  return res.json();
}

export default async function RealtorsPage() {
  const realtors: Realtor[] = await getRealtors();

  return (
    <Container>
      <Typography variant="h4" sx={{ marginBottom: 2 }}>
        Риэлторы
      </Typography>
      <RealtorsList realtors={realtors} />
    </Container>
  );
}
