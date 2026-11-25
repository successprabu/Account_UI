import { useTx } from '../../language/site';
import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Alert, Box, Button, Card, CardActionArea, Chip, CircularProgress, Container, Dialog, Grid, IconButton, Stack, Typography } from '@mui/material';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import AppHeader from '../common/AppHeader';
import PublicFooter from '../public/PublicFooter';
import { CONTACT } from '../public/products';

/**
 * User guides with screenshots, one per product. The content lives in public/guide/<id>.json
 * (the mobile app reads the same files), images in public/guide/<id>/, and the PDF of each guide
 * in public/guide/<id>.pdf. ?print=1 renders the print layout the PDFs are made from.
 */
export const GUIDES = [
  { id: 'moitech', title: 'Moitech', icon: <VolunteerActivismOutlinedIcon />, color: '#6366f1', who: 'For families recording moi (gifts) at their function' },
  { id: 'mahal', title: 'Mahal Management', icon: <ApartmentOutlinedIcon />, color: '#f59e0b', who: 'For marriage hall and party hall owners' },
  { id: 'school', title: 'School Website & ERP', icon: <SchoolOutlinedIcon />, color: '#10b981', who: 'For school admins, staff and parents' },
];

const useGuide = (id) => {
  const [state, setState] = useState({ loading: true, guide: null, error: '' });
  useEffect(() => {
    let live = true;
    setState({ loading: true, guide: null, error: '' });
    fetch(`/guide/${id}.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('missing'))))
      .then((guide) => live && setState({ loading: false, guide, error: '' }))
      .catch(() => live && setState({ loading: false, guide: null, error: 'This guide could not be loaded. Check your connection and try again.' }));
    return () => {
      live = false;
    };
  }, [id]);
  return state;
};

const stepCount = (g) => g.sections.reduce((n, s) => n + s.steps.length, 0);
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

const Marker = ({ n, size = 24 }) => (
  <Box component="span" sx={{ width: size, height: size, flexShrink: 0, borderRadius: '50%', bgcolor: '#ef4444', color: '#fff', fontWeight: 700, fontSize: size * 0.55, display: 'inline-grid', placeItems: 'center', mt: '1px' }}>
    {n}
  </Box>
);

/** One numbered step: title, text, numbered points (they match the red numbers on the picture) and the screenshot. */
const Step = ({ guide, step, number, print, onZoom }) => {
  const tx = useTx();
  return (
  <Box
    component={print ? 'div' : motion.div}
    {...(print ? {} : { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-60px' }, transition: { duration: 0.45 } })}
    sx={{ breakInside: 'avoid', pageBreakInside: 'avoid', mb: print ? 3 : 5 }}
  >
    <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 1.5 }}>
      <Box sx={{ minWidth: 40, height: 40, borderRadius: 2.5, bgcolor: guide.color, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 17 }}>{number}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h6" component="h3" sx={{ fontWeight: 700, lineHeight: 1.3, fontSize: print ? 17 : undefined }}>{tx(step.title)}</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5, fontSize: print ? 13.5 : 16, lineHeight: 1.6 }}>{tx(step.text)}</Typography>
        {step.points?.length > 0 && (
          <Stack spacing={0.75} sx={{ mt: 1.25 }}>
            {step.points.map((p, i) => (
              <Stack key={i} direction="row" spacing={1.25} alignItems="flex-start">
                <Marker n={i + 1} size={print ? 20 : 24} />
                <Typography variant="body2" sx={{ fontSize: print ? 13 : 15, lineHeight: 1.55 }}>{p}</Typography>
              </Stack>
            ))}
          </Stack>
        )}
      </Box>
    </Stack>
    {step.img && (
      <Box
        component={print ? 'div' : 'button'}
        type={print ? undefined : 'button'}
        onClick={print ? undefined : () => onZoom(step)}
        aria-label={print ? undefined : `Enlarge screenshot: ${tx(step.title)}`}
        sx={{ display: 'block', width: '100%', p: 0, border: 1, borderColor: 'divider', borderRadius: 3, overflow: 'hidden', bgcolor: 'background.paper', cursor: print ? 'default' : 'zoom-in', position: 'relative', boxShadow: print ? 'none' : '0 10px 30px rgba(15,23,42,.08)', transition: 'transform .2s, box-shadow .2s', '&:hover': print ? {} : { transform: 'translateY(-2px)', boxShadow: '0 16px 40px rgba(15,23,42,.14)' }, '&:hover .zoom': { opacity: 1 } }}
      >
        <Box component="img" src={`/guide/${guide.id}/${step.img}`} alt={tx(step.title)} loading={print ? 'eager' : 'lazy'} sx={{ display: 'block', width: '100%', height: 'auto' }} />
        {!print && (
          <Box className="zoom" sx={{ position: 'absolute', right: 12, bottom: 12, bgcolor: 'rgba(15,23,42,.75)', color: '#fff', borderRadius: 99, px: 1.5, py: 0.5, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: 13, opacity: 0, transition: 'opacity .2s' }}>
            <ZoomInIcon fontSize="small" />{tx(" Enlarge")}
          </Box>
        )}
      </Box>
    )}
  </Box>
  );
};

/** The print layout the PDFs are made from: a cover, then every step. */
const PrintGuide = ({ guide }) => {
  const tx = useTx();
  let n = 0;
  return (
    <Box sx={{ bgcolor: '#fff', color: '#0f172a', '@page': { size: 'A4', margin: '14mm' } }}>
      <Box sx={{ minHeight: '250mm', display: 'flex', flexDirection: 'column', justifyContent: 'center', pageBreakAfter: 'always', breakAfter: 'page' }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 6 }}>
          <Box component="img" src="/logo.png" alt="" sx={{ width: 56, height: 56 }} />
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: 24 }}>MySuccess</Typography>
            <Typography sx={{ color: '#64748b', fontSize: 14, mt: -0.5 }}>Technologies</Typography>
          </Box>
        </Stack>
        <Box sx={{ width: 80, height: 8, borderRadius: 4, bgcolor: guide.color, mb: 3 }} />
        <Typography sx={{ fontWeight: 900, fontSize: 44, lineHeight: 1.1 }}>{guide.heading}</Typography>
        <Typography sx={{ fontSize: 18, color: '#475569', mt: 2, maxWidth: 560, lineHeight: 1.5 }}>{tx(guide.summary)}</Typography>
        <Box sx={{ mt: 6 }}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>{tx("Contents")}</Typography>
          {guide.sections.map((s, i) => (
            <Typography key={tx(s.title)} sx={{ color: '#334155', fontSize: 15, py: 0.25 }}>{i + 1}. {tx(s.title)}</Typography>
          ))}
        </Box>
        <Typography sx={{ mt: 'auto', pt: 6, color: '#64748b', fontSize: 13 }}>
          {tx("Need help? Call or WhatsApp ")}{CONTACT.phoneDisplay} · {CONTACT.email}
        </Typography>
      </Box>
      {guide.sections.map((s, si) => (
        <Box key={tx(s.title)} sx={{ pageBreakBefore: si === 0 ? 'auto' : 'always', breakBefore: si === 0 ? 'auto' : 'page' }}>
          <Typography sx={{ fontWeight: 800, fontSize: 24, color: guide.color, mb: 2, borderBottom: `3px solid ${guide.color}`, pb: 0.5 }}>{si + 1}. {tx(s.title)}</Typography>
          {s.steps.map((st) => {
            n += 1;
            return <Step key={st.img || st.title} guide={guide} step={st} number={n} print />;
          })}
        </Box>
      ))}
    </Box>
  );
};

/** /guide/:id: one product's guide. */
export const UserGuidePage = () => {
  const tx = useTx();
  const { id } = useParams();
  const [params] = useSearchParams();
  const print = params.get('print') === '1';
  const meta = GUIDES.find((g) => g.id === id);
  const { loading, guide, error } = useGuide(meta ? id : 'none');
  const [zoom, setZoom] = useState(null);
  const [active, setActive] = useState('');

  useEffect(() => {
    if (guide) document.title = `${guide.heading} · My Success`;
  }, [guide]);

  // Highlight the section being read in the contents list.
  useEffect(() => {
    if (!guide || print) return undefined;
    const els = guide.sections.map((s) => document.getElementById(slug(s.title))).filter(Boolean);
    if (!els.length || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver((entries) => {
      const seen = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (seen) setActive(seen.target.id);
    }, { rootMargin: '-20% 0px -70% 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [guide, print]);

  const numbered = useMemo(() => {
    if (!guide) return [];
    let n = 0;
    return guide.sections.map((s) => ({ ...s, steps: s.steps.map((st) => ({ ...st, n: (n += 1) })) }));
  }, [guide]);

  if (print && guide) return <PrintGuide guide={guide} />;

  const pdf = `/guide/${id}.pdf`;
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppHeader />
      {!meta || error ? (
        <Container maxWidth="sm" sx={{ py: 10 }}>
          <Alert severity="warning" action={<Button component={RouterLink} to="/user-guide">{tx("All guides")}</Button>}>{tx(error || 'There is no guide at this address.')}</Alert>
        </Container>
      ) : loading || !guide ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 14 }}><CircularProgress /></Box>
      ) : (
        <>
          <Box sx={{ background: `linear-gradient(135deg, ${guide.color}22, transparent 60%)`, borderBottom: 1, borderColor: 'divider' }}>
            <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
              <Button component={RouterLink} to="/user-guide" startIcon={<ArrowBackIcon />} size="small" sx={{ mb: 2 }}>{tx("All guides")}</Button>
              <Stack component={motion.div} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ md: 'flex-end' }} justifyContent="space-between">
                <Box sx={{ maxWidth: 720 }}>
                  <Chip icon={<MenuBookOutlinedIcon />} label={`${stepCount(guide)} steps with pictures`} size="small" sx={{ mb: 1.5, bgcolor: `${guide.color}1f`, color: guide.color, fontWeight: 700, '& .MuiChip-icon': { color: guide.color } }} />
                  <Typography variant="h2" component="h1" sx={{ fontSize: { xs: 32, md: 44 } }}>{guide.heading}</Typography>
                  <Typography color="text.secondary" sx={{ mt: 1.5, fontSize: 17 }}>{tx(guide.summary)}</Typography>
                </Box>
                <Button variant="contained" size="large" startIcon={<PictureAsPdfOutlinedIcon />} href={pdf} download={`MySuccess-${guide.id}-guide.pdf`} sx={{ flexShrink: 0, bgcolor: guide.color, '&:hover': { bgcolor: guide.color, filter: 'brightness(.92)' } }}>
                  {tx("Download PDF")}
                </Button>
              </Stack>
            </Container>
          </Box>

          <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
            <Grid container spacing={{ xs: 2, md: 5 }}>
              <Grid item xs={12} md={3}>
                <Box component="nav" aria-label="Contents" sx={{ position: { md: 'sticky' }, top: { md: 88 }, display: { xs: 'flex', md: 'block' }, gap: 1, overflowX: { xs: 'auto', md: 'visible' }, pb: { xs: 1, md: 0 }, mx: { xs: -2, md: 0 }, px: { xs: 2, md: 0 } }}>
                  <Typography variant="overline" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>{tx("Contents")}</Typography>
                  {numbered.map((s, i) => {
                    const on = active === slug(s.title);
                    return (
                      <Box
                        key={tx(s.title)}
                        component="a"
                        href={`#${slug(s.title)}`}
                        sx={{ display: 'block', flexShrink: 0, textDecoration: 'none', whiteSpace: { xs: 'nowrap', md: 'normal' }, px: 1.5, py: 1, my: { md: 0.25 }, borderRadius: 2, fontSize: 14.5, fontWeight: on ? 700 : 500, color: on ? guide.color : 'text.primary', bgcolor: on ? `${guide.color}14` : { xs: 'background.paper', md: 'transparent' }, border: { xs: 1, md: 0 }, borderColor: 'divider', borderLeft: { md: `3px solid ${on ? guide.color : 'transparent'}` }, transition: 'all .2s', '&:hover': { bgcolor: `${guide.color}14` } }}
                      >
                        {i + 1}. {tx(s.title)}
                      </Box>
                    );
                  })}
                </Box>
              </Grid>
              <Grid item xs={12} md={9}>
                {numbered.map((s, i) => (
                  <Box key={tx(s.title)} id={slug(s.title)} component="section" sx={{ scrollMarginTop: 90, mb: 3 }}>
                    <Typography variant="h4" component="h2" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box component="span" sx={{ width: 8, height: 28, borderRadius: 4, bgcolor: guide.color }} />
                      {i + 1}. {tx(s.title)}
                    </Typography>
                    {s.steps.map((st) => <Step key={st.n} guide={guide} step={st} number={st.n} onZoom={setZoom} />)}
                  </Box>
                ))}
                <Card variant="outlined" sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{tx("Still need help?")}</Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.5 }}>{tx("Call or WhatsApp ")}{CONTACT.phoneDisplay} ({CONTACT.hours}), or send us a message.</Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center" sx={{ mt: 2 }}>
                    <Button variant="contained" href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noopener noreferrer">{tx("WhatsApp us")}</Button>
                    <Button variant="outlined" component={RouterLink} to="/contactus">{tx("Send a message")}</Button>
                  </Stack>
                </Card>
              </Grid>
            </Grid>
          </Container>
        </>
      )}
      <PublicFooter />

      <Dialog open={!!zoom} onClose={() => setZoom(null)} maxWidth="xl" fullWidth aria-label={zoom?.title}>
        {zoom && (
          <Box sx={{ position: 'relative' }}>
            <IconButton onClick={() => setZoom(null)} aria-label="Close" sx={{ position: 'absolute', right: 8, top: 8, bgcolor: 'rgba(15,23,42,.7)', color: '#fff', '&:hover': { bgcolor: 'rgba(15,23,42,.85)' } }}><CloseIcon /></IconButton>
            <Box component="img" src={`/guide/${guide.id}/${zoom.img}`} alt={tx(zoom.title)} sx={{ display: 'block', width: '100%' }} />
            <Typography sx={{ p: 2, fontWeight: 700 }}>{tx(zoom.title)}</Typography>
          </Box>
        )}
      </Dialog>
    </Box>
  );
};

/** /guide: pick a product's guide. */
const UserGuides = () => {
  const tx = useTx();
  useEffect(() => {
    document.title = 'User guides · My Success';
  }, []);
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppHeader />
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Stack spacing={1.5} alignItems="center" textAlign="center" sx={{ mb: { xs: 4, md: 6 } }}>
          <Typography variant="overline" color="primary.main">{tx("Help centre")}</Typography>
          <Typography variant="h2" component="h1">{tx("User guides")}</Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 600, fontSize: 17 }}>{tx("Step-by-step guides with pictures for each product. Read them here or download the PDF to print or share.")}</Typography>
        </Stack>
        <Grid container spacing={3}>
          {GUIDES.map((g, i) => (
            <Grid item xs={12} md={4} key={g.id}>
              <Card component={motion.div} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -6 }} variant="outlined" sx={{ height: '100%', borderRadius: 4, display: 'flex', flexDirection: 'column', borderTop: `4px solid ${g.color}` }}>
                <CardActionArea component={RouterLink} to={`/user-guide/${g.id}`} sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                  <Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: `${g.color}1f`, color: g.color, display: 'grid', placeItems: 'center', mb: 2, '& svg': { fontSize: 30 } }}>{g.icon}</Box>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>{tx(g.title)}</Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.5 }}>{tx(g.who)}</Typography>
                  <Typography sx={{ mt: 2, color: g.color, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>{tx("Read the guide ")}<ArrowForwardIcon fontSize="small" /></Typography>
                </CardActionArea>
                <Box sx={{ px: 3, pb: 3 }}>
                  <Button fullWidth variant="outlined" startIcon={<PictureAsPdfOutlinedIcon />} href={`/guide/${g.id}.pdf`} download={`MySuccess-${g.id}-guide.pdf`}>{tx("Download PDF")}</Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
      <PublicFooter />
    </Box>
  );
};

export default UserGuides;
