import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Box, Button, Chip, CircularProgress, IconButton, LinearProgress, Stack, Tooltip, Typography } from '@mui/material';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { deletePhoto, photoUrl, setCoverPhoto, uploadPhoto } from '../../api/mahal';
import { resizeImage } from '../../utils/resizeImage';
import { notify } from '../ui';

export const MAX_PHOTOS = 12;

/**
 * Hall photos in the add / edit hall form. For a saved hall, photos upload straight away; for a new hall they
 * wait in `queue` and the form uploads them right after the hall is saved (uploadQueued below).
 * The first photo is the cover (shown on the cards); the star makes another one the cover.
 */
const PhotoManager = ({ mahalId, photos, onPhotos, queue, onQueue }) => {
  const input = useRef(null);
  const [busy, setBusy] = useState('');
  const count = (mahalId ? photos.length : 0) + queue.length;

  const add = async (files) => {
    const list = Array.from(files || []).slice(0, Math.max(0, MAX_PHOTOS - count));
    if (!list.length) return notify.info(`A hall can have up to ${MAX_PHOTOS} photos.`);
    for (const [i, f] of list.entries()) {
      setBusy(list.length > 1 ? `Adding photo ${i + 1} of ${list.length}…` : 'Adding photo…');
      try {
        const { full, thumb } = await resizeImage(f);
        if (mahalId) {
          const res = await uploadPhoto(mahalId, full, thumb);
          if (!res.ok) {
            notify.error(res.message);
            break;
          }
          onPhotos(res.data.map((p) => p.id));
        } else {
          onQueue((q) => [...q, { key: `${Date.now()}-${i}`, full, thumb, preview: URL.createObjectURL(thumb) }]);
        }
      } catch (e) {
        notify.error(e.message || 'This photo could not be added.');
      }
    }
    setBusy('');
    if (input.current) input.current.value = '';
  };

  const remove = async (id) => {
    setBusy('Removing…');
    const res = await deletePhoto(id);
    setBusy('');
    if (res.ok) onPhotos(res.data.map((p) => p.id));
    else notify.error(res.message);
  };

  const cover = async (id) => {
    setBusy('Setting cover…');
    const res = await setCoverPhoto(id);
    setBusy('');
    if (res.ok) onPhotos(res.data.map((p) => p.id));
    else notify.error(res.message);
  };

  const tiles = mahalId
    ? photos.map((id, i) => ({ key: `p${id}`, id, src: photoUrl(id, true), cover: i === 0 }))
    : queue.map((q, i) => ({ key: q.key, src: q.preview, cover: i === 0, queued: q }));

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {count ? `${count} of ${MAX_PHOTOS} photos. The first one (star) is shown on the hall card.` : 'Add photos of the hall: stage, dining, rooms, outside. Customers see them when they choose your hall.'}
        </Typography>
      </Stack>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 1.25 }}>
        <AnimatePresence initial={false}>
          {tiles.map((t) => (
            <Box key={t.key} component={motion.div} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} sx={{ position: 'relative', aspectRatio: '4 / 3', borderRadius: 2, overflow: 'hidden', border: 2, borderColor: t.cover ? 'warning.main' : 'divider', bgcolor: 'action.hover' }}>
              <Box component="img" src={t.src} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              {t.cover && <Chip size="small" icon={<StarIcon />} label="Cover" color="warning" sx={{ position: 'absolute', top: 6, left: 6, height: 22, fontWeight: 700 }} />}
              <Stack direction="row" spacing={0.5} sx={{ position: 'absolute', bottom: 4, right: 4 }}>
                {!t.cover && t.id && (
                  <Tooltip title="Make this the cover">
                    <IconButton size="small" onClick={() => cover(t.id)} disabled={!!busy} aria-label="Make this the cover photo" sx={{ bgcolor: 'rgba(15,23,42,.7)', color: '#fff', '&:hover': { bgcolor: 'rgba(15,23,42,.85)' } }}>
                      <StarBorderIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Remove">
                  <IconButton
                    size="small"
                    onClick={() => (t.id ? remove(t.id) : onQueue((q) => q.filter((x) => x !== t.queued)))}
                    disabled={!!busy}
                    aria-label="Remove this photo"
                    sx={{ bgcolor: 'rgba(15,23,42,.7)', color: '#fff', '&:hover': { bgcolor: 'error.main' } }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>
          ))}
        </AnimatePresence>
        {count < MAX_PHOTOS && (
          <Button
            variant="outlined"
            onClick={() => input.current?.click()}
            disabled={!!busy}
            sx={{ aspectRatio: '4 / 3', borderStyle: 'dashed', borderWidth: 2, borderRadius: 2, flexDirection: 'column', gap: 0.5, '&:hover': { borderStyle: 'dashed', borderWidth: 2 } }}
          >
            {busy ? <CircularProgress size={22} /> : <AddPhotoAlternateOutlinedIcon />}
            <Typography variant="caption" fontWeight={700}>Add photos</Typography>
          </Button>
        )}
      </Box>
      {busy && <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />}
      {busy && <Typography variant="caption" color="text.secondary">{busy}</Typography>}
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => add(e.target.files)} data-testid="photo-input" />
    </Box>
  );
};

/** Uploads photos chosen before a new hall was saved. Returns how many failed. */
export const uploadQueued = async (mahalId, queue, onProgress) => {
  let failed = 0;
  for (const [i, q] of queue.entries()) {
    onProgress?.(i + 1, queue.length);
    const res = await uploadPhoto(mahalId, q.full, q.thumb);
    if (!res.ok) failed += 1;
    URL.revokeObjectURL(q.preview);
  }
  return failed;
};

export default PhotoManager;
