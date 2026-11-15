import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useTranslation } from 'react-i18next';

/** Asks before a destructive or important action. danger=true makes the confirm button red. */
const ConfirmDialog = ({ open, title, message, confirmLabel, cancelLabel, danger = false, loading = false, onConfirm, onClose }) => {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      {message && (
        <DialogContent>
          <DialogContentText>{message}</DialogContentText>
        </DialogContent>
      )}
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={loading} color="inherit">
          {cancelLabel || t('cancel', { defaultValue: 'Cancel' })}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={danger ? 'error' : 'primary'}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {confirmLabel || t('confirm', { defaultValue: 'Confirm' })}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
