import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Box, Dialog, IconButton, Stack, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import { photoUrl } from '../../api/mahal';

const navBtn = { position: 'absolute', top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(15,23,42,.55)', color: '#fff', '&:hover': { bgcolor: 'rgba(15,23,42,.8)' } };

/**
 * Hall photos on the booking page: a large photo (cover first), thumbnails underneath, and a full-screen
 * viewer with next / previous (arrows, keyboard, or swipe on a phone).
 */
const MahalGallery = ({ photos, name, height = 320 }) => {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [dir, setDir] = useState(1);
  const touch = useRef(null);
  const count = photos.length;

  const go = useCallback(
    (step) => {
      setDir(step);
      setIndex((i) => (i + step + count) % count);
    },
    [count]
  );

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, go]);

  const swipe = {
    onTouchStart: (e) => {
      touch.current = e.touches[0].clientX;
    },
    onTouchEnd: (e) => {
      if (touch.current == null) return;
      const dx = e.changedTouches[0].clientX - touch.current;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      touch.current = null;
    },
  };

  const slide = {
    initial: (d) => ({ opacity: 0, x: d * 40 }),
    animate: { opacity: 1, x: 0 },
    exit: (d) => ({ opacity: 0, x: d * -40 }),
  };

  return (
    <Box>
      <Box sx={{ position: 'relative', height, borderRadius: 4, overflow: 'hidden', bgcolor: 'grey.900' }} {...swipe}>
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <Box
            key={photos[index]}
            component={motion.img}
            custom={dir}
            variants={slide}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            src={photoUrl(photos[index])}
            alt={`${name}: photo ${index + 1} of ${count}`}
            onClick={() => setOpen(true)}
            sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in' }}
          />
        </AnimatePresence>
        {count > 1 && (
          <>
            <IconButton onClick={() => go(-1)} aria-label="Previous photo" sx={{ ...navBtn, left: 10 }}><ChevronLeftIcon /></IconButton>
            <IconButton onClick={() => go(1)} aria-label="Next photo" sx={{ ...navBtn, right: 10 }}><ChevronRightIcon /></IconButton>
          </>
        )}
        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ position: 'absolute', bottom: 12, right: 12, px: 1.25, py: 0.5, borderRadius: 99, bgcolor: 'rgba(15,23,42,.7)', color: '#fff' }}>
          <PhotoLibraryOutlinedIcon sx={{ fontSize: 16 }} />
          <Typography variant="caption" fontWeight={700}>{index + 1} / {count}</Typography>
        </Stack>
      </Box>

      {count > 1 && (
        <Stack direction="row" spacing={1} sx={{ mt: 1.25, overflowX: 'auto', pb: 0.5 }}>
          {photos.map((id, i) => (
            <Box
              key={id}
              component="button"
              type="button"
              onClick={() => { setDir(i > index ? 1 : -1); setIndex(i); }}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === index}
              sx={{ p: 0, flexShrink: 0, width: 84, height: 60, borderRadius: 2, overflow: 'hidden', cursor: 'pointer', border: 2, borderColor: i === index ? 'primary.main' : 'transparent', opacity: i === index ? 1 : 0.7, transition: 'all .2s', '&:hover': { opacity: 1 } }}
            >
              <Box component="img" src={photoUrl(id, true)} alt="" loading="lazy" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </Box>
          ))}
        </Stack>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullScreen PaperProps={{ 'aria-label': `${name} photos`, sx: { bgcolor: 'rgba(2,6,23,.96)' } }}>
        <Box sx={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }} {...swipe}>
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <Box key={photos[index]} component={motion.img} custom={dir} variants={slide} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} src={photoUrl(photos[index])} alt={`${name}: photo ${index + 1} of ${count}`} sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          </AnimatePresence>
          {count > 1 && (
            <>
              <IconButton onClick={() => go(-1)} aria-label="Previous photo" sx={{ ...navBtn, left: 16 }}><ChevronLeftIcon fontSize="large" /></IconButton>
              <IconButton onClick={() => go(1)} aria-label="Next photo" sx={{ ...navBtn, right: 16 }}><ChevronRightIcon fontSize="large" /></IconButton>
            </>
          )}
          <IconButton onClick={() => setOpen(false)} aria-label="Close" sx={{ position: 'absolute', top: 16, right: 16, bgcolor: 'rgba(255,255,255,.12)', color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,.25)' } }}><CloseIcon /></IconButton>
          <Typography sx={{ position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', color: 'rgba(255,255,255,.85)', fontWeight: 600 }}>
            {name} · {index + 1} / {count}
          </Typography>
        </Box>
      </Dialog>
    </Box>
  );
};

export default MahalGallery;
