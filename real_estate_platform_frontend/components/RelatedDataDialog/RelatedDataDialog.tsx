'use client';

import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogContent,
  Divider,
  Grid,
  IconButton,
  Typography,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { Demand, Offer } from '@/types/types';
import { propertyTypeDict } from '@/utils/propertyTypeDict';

interface RelatedData {
  offers: Offer[];
  demands: Demand[];
}

interface RelatedDataDialogProps {
  open: boolean;
  onCloseAction: () => void;
  title: string;
  relatedData?: RelatedData;
  isLoading: boolean;
}

export default function RelatedDataDialog({
  open,
  onCloseAction,
  title,
  relatedData,
  isLoading,
}: RelatedDataDialogProps) {
  console.log(relatedData);
  return (
    <Dialog
      key={open ? 'open' : 'closed'}
      open={open}
      onClose={onCloseAction}
      fullWidth
      maxWidth="md"
    >
      <Box sx={{ position: 'relative', p: 2 }}>
        <IconButton
          aria-label="close"
          onClick={onCloseAction}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Close />
        </IconButton>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {title}
        </Typography>
        <Divider />
        <DialogContent>
          {isLoading ? (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : relatedData ? (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Предложения
                </Typography>
                {relatedData.offers.length > 0 ? (
                  relatedData.offers.map((offer) => (
                    <Card
                      key={offer.id}
                      variant="outlined"
                      sx={{ mb: 1, p: 1, backgroundColor: 'grey.50' }}
                    >
                      <CardContent sx={{ p: 1 }}>
                        <Typography variant="body2">
                          Цена: <strong>{offer.price} руб.</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Объект: {offer.property.full_address}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Нет предложений.
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Потребности
                </Typography>
                {relatedData.demands.length > 0 ? (
                  relatedData.demands.map((demand) => (
                    <Card
                      key={demand.id}
                      variant="outlined"
                      sx={{ mb: 1, p: 1, backgroundColor: 'grey.50' }}
                    >
                      <CardContent sx={{}}>
                        <Typography variant="body2">
                          Цена:{' '}
                          <strong>
                            от {demand.min_price} до {demand.max_price} руб.
                          </strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Тип: {propertyTypeDict[demand.property_type] || demand.property_type}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Нет потребностей.
                  </Typography>
                )}
              </Grid>
            </Grid>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Нет данных.
            </Typography>
          )}
        </DialogContent>
      </Box>
    </Dialog>
  );
}
