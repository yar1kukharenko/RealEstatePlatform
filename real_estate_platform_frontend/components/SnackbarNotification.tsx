'use client';

import { Alert, Snackbar } from '@mui/material';
import { SnackbarNotificationProps } from '@/types/types';

export default function SnackbarNotification({
  open,
  onCloseAction,
  message,
  severity = 'success',
}: SnackbarNotificationProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={onCloseAction}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert onClose={onCloseAction} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
