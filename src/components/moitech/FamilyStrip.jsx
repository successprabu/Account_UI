import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Button, Stack } from '@mui/material';
import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import { listInvites } from '../../api/family';
import FamilyLinkDialog from './FamilyLinkDialog';
import GoldValueDialog from './GoldValueDialog';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import DiamondOutlinedIcon from '@mui/icons-material/DiamondOutlined';
import { useTx } from '../../language/site';

/** Moitech dashboard: thank givers, family live link, and a reminder of functions to attend this week (owner). */
const FamilyStrip = ({ role }) => {
  const tx = useTx();
  const [link, setLink] = useState(false);
  const [gold, setGold] = useState(false);
  const [due, setDue] = useState(0);

  useEffect(() => {
    if (role === 'NU') return;
    listInvites('Planned').then((r) => r.ok && setDue(r.data?.dueWeek || 0));
  }, [role]);

  return (
    <>
      {due > 0 && (
        <Alert severity="warning" icon={<EventOutlinedIcon />} sx={{ mb: 2 }}
          action={<Button color="inherit" size="small" component={RouterLink} to="/moi-return">{tx('Open')}</Button>}>
          {(due === 1 ? tx('1 function to attend in the next 7 days.') : tx('{{n}} functions to attend in the next 7 days.', { n: due }))}
        </Alert>
      )}
      <Stack direction="row" spacing={1} sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
        <Button variant="outlined" color="success" startIcon={<VolunteerActivismOutlinedIcon />} component={RouterLink} to="/thank-givers">{tx('Thank your givers')}</Button>
        <Button variant="outlined" startIcon={<ShareOutlinedIcon />} onClick={() => setLink(true)}>{tx('Family live link')}</Button>
        <Button variant="outlined" startIcon={<MailOutlineIcon />} component={RouterLink} to="/invitations">{tx('Invitations')}</Button>
        <Button variant="outlined" startIcon={<MenuBookOutlinedIcon />} component={RouterLink} to="/moi-book">{tx('Moi book')}</Button>
        <Button variant="outlined" color="warning" startIcon={<DiamondOutlinedIcon />} onClick={() => setGold(true)}>{tx('Gold value')}</Button>
        {role !== 'NU' && <Button variant="outlined" color="inherit" startIcon={<EventOutlinedIcon />} component={RouterLink} to="/moi-return">{tx('Moi to return')}</Button>}
      </Stack>
      <FamilyLinkDialog open={link} onClose={() => setLink(false)} />
      <GoldValueDialog open={gold} onClose={() => setGold(false)} />
    </>
  );
};

export default FamilyStrip;
