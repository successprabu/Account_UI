import { Box, IconButton, Stack, Typography } from '@mui/material';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarHalfRoundedIcon from '@mui/icons-material/StarHalfRounded';
import StarOutlineRoundedIcon from '@mui/icons-material/StarOutlineRounded';
import { useTx } from '../../language/site';

const GOLD = '#f59e0b';

/** Read-only stars for a rating such as 4.3 (half stars shown). */
export const Stars = ({ value = 0, size = 18 }) => (
  <Box component="span" sx={{ display: 'inline-flex', color: GOLD, verticalAlign: 'middle' }} role="img" aria-label={`${value} / 5`}>
    {[1, 2, 3, 4, 5].map((i) => {
      const Icon = value >= i - 0.25 ? StarRoundedIcon : value >= i - 0.75 ? StarHalfRoundedIcon : StarOutlineRoundedIcon;
      return <Icon key={i} sx={{ fontSize: size }} />;
    })}
  </Box>
);

/** "★ 4.6 (23 reviews)" chip text; nothing when there are no reviews. */
export const RatingLine = ({ rating, size = 18 }) => {
  const tx = useTx();
  if (!rating?.count) return null;
  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      <Stars value={rating.average} size={size} />
      <Typography fontWeight={700}>{rating.average.toFixed(1)}</Typography>
      <Typography color="text.secondary" variant="body2">({tx(rating.count === 1 ? '1 review' : '{{n}} reviews', { n: rating.count })})</Typography>
    </Stack>
  );
};

const LABELS = ['', 'Poor', 'Below average', 'Good', 'Very good', 'Excellent'];

/** Tap-to-rate input (1–5). */
export const StarInput = ({ value, onChange }) => {
  const tx = useTx();
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Box>
        {[1, 2, 3, 4, 5].map((i) => (
          <IconButton key={i} onClick={() => onChange(i)} aria-label={tx('{{n}} stars', { n: i })} aria-pressed={value === i} sx={{ p: 0.5, color: GOLD }}>
            {value >= i ? <StarRoundedIcon sx={{ fontSize: 40 }} /> : <StarOutlineRoundedIcon sx={{ fontSize: 40 }} />}
          </IconButton>
        ))}
      </Box>
      {value > 0 && <Typography fontWeight={700}>{tx(LABELS[value])}</Typography>}
    </Stack>
  );
};
