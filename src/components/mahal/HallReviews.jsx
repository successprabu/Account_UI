import { Avatar, Box, Card, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { RatingLine, Stars } from './Stars';
import { useTx } from '../../language/site';

const when = (d) => new Date(d).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

/** Reviews on a public hall page: average, then the latest reviews with the hall's replies. */
const HallReviews = ({ rating, reviews }) => {
  const tx = useTx();
  if (!rating?.count) return null;
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>{tx('Reviews')}</Typography>
      <RatingLine rating={rating} size={22} />
      <Stack spacing={1.5} sx={{ mt: 2 }}>
        {reviews.map((r, i) => (
          <Card key={r.id} variant="outlined" sx={{ p: 2 }} component={motion.div} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 8) * 0.04 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.light', fontSize: 15 }}>{(r.name || '?').charAt(0).toUpperCase()}</Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontWeight={700} noWrap>{r.name}</Typography>
                <Typography variant="caption" color="text.secondary">{when(r.createdDt)}</Typography>
              </Box>
              <Stars value={r.rating} />
            </Stack>
            {r.comment && <Typography sx={{ mt: 1, whiteSpace: 'pre-line' }}>{r.comment}</Typography>}
            {r.reply && (
              <Box sx={{ mt: 1.25, pl: 1.5, borderLeft: 3, borderColor: 'primary.light' }}>
                <Typography variant="caption" fontWeight={700} color="primary">{tx('Reply from the hall')}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>{r.reply}</Typography>
              </Box>
            )}
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default HallReviews;
