import { Container, Typography } from '@mui/material';

import ClientsList from '@/components/Clients/ClientsList/ClientsList';

export default async function ClientsPage() {
  return (
    <Container>
      <Typography variant="h4" sx={{ marginBottom: 2 }}>
        Клиенты
      </Typography>
      <ClientsList />
    </Container>
  );
}
