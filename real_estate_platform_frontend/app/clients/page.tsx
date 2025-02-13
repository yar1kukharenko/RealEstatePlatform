import { Container, Typography } from '@mui/material';

import ClientsList from '@/components/Clients/ClientsList';
import { Client } from '@/types/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://real-estate-backend:8000/api/clients/';

async function getClients(): Promise<Client[]> {
  const res = await fetch(API_URL, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error('Ошибка загрузки клиентов');
  }

  return res.json();
}

export default async function ClientsPage() {
  const clients: Client[] = await getClients();

  return (
    <Container>
      <Typography variant="h4" sx={{ marginBottom: 2 }}>
        Клиенты
      </Typography>
      <ClientsList clients={clients} />
    </Container>
  );
}
