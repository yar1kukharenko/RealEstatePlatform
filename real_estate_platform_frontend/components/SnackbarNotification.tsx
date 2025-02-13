'use client';

import { Alert, Snackbar } from '@mui/material';

interface SnackbarNotificationProps {
  open: boolean;
  onClose: () => void;
  message: string;
  severity?: 'success' | 'error' | 'warning' | 'info';
}

export default function SnackbarNotification({
  open,
  onClose,
  message,
  severity = 'success',
}: SnackbarNotificationProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
