import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Box, Card, CardActionArea, Dialog, DialogContent, DialogTitle, IconButton, Stack, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import { SCHOOL_ERP_URL } from '../public/products';

/** Sign-up choices: each product has its own registration. */
export const SIGN_UPS = [
  { id: 'moitech', title: 'DigiMoi', text: 'Record moi (gifts) at your function. 7 days free.', to: '/purchase', icon: <VolunteerActivismOutlinedIcon />, color: '#6366f1' },
  { id: 'mahal', title: 'Mahal Management', text: 'For hall owners: take bookings online. 1 month free.', to: '/mahal-reg', icon: <ApartmentOutlinedIcon />, color: '#f59e0b' },
  { id: 'school', title: 'School Website & ERP', text: 'Register your school: website and ERP. 1 month free.', href: `${SCHOOL_ERP_URL}register-school`, icon: <SchoolOutlinedIcon />, color: '#10b981' },
];

const SignUpChooser = ({ open, onClose }) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
    <DialogTitle sx={{ pr: 6, fontWeight: 800 }}>
      Sign up for
      <Typography variant="body2" color="text.secondary">Choose what you want to use.</Typography>
      <IconButton onClick={onClose} aria-label="Close" sx={{ position: 'absolute', right: 12, top: 12 }}><CloseIcon /></IconButton>
    </DialogTitle>
    <DialogContent>
      <Stack spacing={1.5} sx={{ pt: 0.5 }}>
        {SIGN_UPS.map((s, i) => (
          <Card key={s.id} component={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} variant="outlined" sx={{ borderRadius: 3, borderLeft: `4px solid ${s.color}` }}>
            <CardActionArea
              {...(s.href ? { component: 'a', href: s.href, target: '_blank', rel: 'noopener noreferrer' } : { component: RouterLink, to: s.to })}
              onClick={onClose}
              sx={{ p: 1.75, display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: 'flex-start' }}
            >
              <Box sx={{ width: 44, height: 44, borderRadius: 2.5, display: 'grid', placeItems: 'center', bgcolor: `${s.color}1f`, color: s.color, flexShrink: 0 }}>{s.icon}</Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 800 }}>{s.title}</Typography>
                <Typography variant="body2" color="text.secondary">{s.text}</Typography>
              </Box>
              {s.href ? <OpenInNewIcon fontSize="small" color="action" /> : <ArrowForwardIcon fontSize="small" color="action" />}
            </CardActionArea>
          </Card>
        ))}
      </Stack>
    </DialogContent>
  </Dialog>
);

export default SignUpChooser;
