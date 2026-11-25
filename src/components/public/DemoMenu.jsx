import { useTx } from '../../language/site';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { DEMO_PRODUCTS, linkProps } from './products';

/**
 * "Try Demo" button that asks which product: each product has its own demo
 * (Moitech free trial, mahal registration, the School ERP demo).
 * Any extra props go to the button, e.g. variant, size, sx, fullWidth.
 */
const DemoMenu = ({ label, onPick, ...buttonProps }) => {
  const tx = useTx();
  const { t } = useTranslation();
  const [anchor, setAnchor] = useState(null);
  const close = () => setAnchor(null);

  return (
    <>
      <Button
        variant="contained"
        endIcon={<KeyboardArrowDownIcon sx={{ transition: 'transform .2s', transform: anchor ? 'rotate(180deg)' : 'none' }} />}
        aria-haspopup="menu"
        aria-expanded={Boolean(anchor)}
        onClick={(e) => setAnchor(e.currentTarget)}
        {...buttonProps}
      >
        {label || t('watchDemo', { defaultValue: 'Try Demo' })}
      </Button>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { mt: 1, minWidth: 280 } } }}
      >
        {DEMO_PRODUCTS.map((p) => (
          <MenuItem
            key={p.id}
            {...linkProps(p.demo)}
            onClick={() => {
              close();
              if (onPick) onPick(p);
            }}
            sx={{ py: 1.25 }}
          >
            <ListItemIcon>
              <Box sx={{ display: 'flex', color: p.color }}>{p.icon}</Box>
            </ListItemIcon>
            <ListItemText
              primary={t(p.titleKey, { defaultValue: p.title })}
              secondary={tx(p.demo.label)}
              primaryTypographyProps={{ fontWeight: 600 }}
            />
            {p.demo.href && <OpenInNewIcon fontSize="small" sx={{ ml: 2, color: 'text.secondary' }} />}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default DemoMenu;
