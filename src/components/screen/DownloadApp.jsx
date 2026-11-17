import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Alert, Box, Button, Card, Container, Grid, Link, Stack, Typography } from '@mui/material';
import AndroidIcon from '@mui/icons-material/Android';
import DownloadIcon from '@mui/icons-material/Download';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { notify } from '../ui';
import AppHeader from '../common/AppHeader';
import PublicFooter from '../public/PublicFooter';

/** Copy the web deploy puts next to the site, and the GitHub release it comes from. */
export const APK_ON_SITE = '/downloads/MySuccess.apk';
export const APK_ON_GITHUB = 'https://github.com/successprabu/AIMobileApp/releases/latest/download/MySuccess.apk';

const STEPS = [
  'Tap Download on your Android phone.',
  'Open the downloaded MySuccess.apk.',
  'If asked, allow your browser to "Install unknown apps", then tap Install.',
  'Open My Success and sign in with your mobile number and password.',
];

const FEATURES = ['Record moi entries and expenses', 'Type names in Tamil by voice or keyboard', 'Reports and handover summary', 'Works in six languages'];

const isAndroid = () => typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);

/** Public page with the Android app download. */
const DownloadApp = () => {
  const [apkUrl, setApkUrl] = useState(APK_ON_SITE);
  const [sizeMb, setSizeMb] = useState(null);

  useEffect(() => {
    document.title = 'Download the My Success app';
    // The site answers unknown paths with the web app itself, so check it is really the APK.
    let live = true;
    fetch(APK_ON_SITE, { method: 'HEAD' })
      .then((r) => {
        const type = r.headers.get('content-type') || '';
        if (!live) return;
        if (!r.ok || type.includes('text/html')) setApkUrl(APK_ON_GITHUB);
        else {
          const bytes = Number(r.headers.get('content-length'));
          if (bytes > 0) setSizeMb(Math.round(bytes / 1048576));
        }
      })
      .catch(() => live && setApkUrl(APK_ON_GITHUB));
    return () => {
      live = false;
    };
  }, []);

  const pageUrl = typeof window !== 'undefined' ? `${window.location.origin}/download-app` : '/download-app';
  const android = isAndroid();
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      notify.success('Link copied. Open it on your Android phone.');
    } catch (e) {
      notify.info(pageUrl);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <Box sx={{ position: 'relative', overflow: 'hidden', py: { xs: 6, md: 10 }, flex: 1 }}>
        <Box aria-hidden sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(50% 50% at 80% 20%, rgba(16,185,129,0.12) 0%, transparent 70%), radial-gradient(40% 40% at 10% 10%, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />
        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Grid container spacing={{ xs: 5, md: 8 }} alignItems="center">
            <Grid item xs={12} md={7}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ color: '#10b981', mb: 1.5 }}>
                  <AndroidIcon />
                  <Typography variant="overline" sx={{ color: 'inherit' }}>Android app</Typography>
                </Stack>
                <Typography variant="h1" component="h1" sx={{ fontSize: { xs: 32, md: 46 }, letterSpacing: '-0.02em' }}>
                  My Success on your phone
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 2, fontSize: { xs: 17, md: 19 }, maxWidth: 560 }}>
                  The same account as the website. Record moi at the function, check totals and share reports, right from your phone.
                </Typography>

                {android ? (
                  <Box sx={{ mt: 4 }}>
                    <Button
                      component={motion.a}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      href={apkUrl}
                      download="MySuccess.apk"
                      variant="contained"
                      size="large"
                      startIcon={<DownloadIcon />}
                      sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }, px: 4, py: 1.5, fontSize: 17 }}
                    >
                      Download for Android{sizeMb ? ` (${sizeMb} MB)` : ''}
                    </Button>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                      One file, MySuccess.apk. Open it after it downloads to install.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ mt: 4 }}>
                    <Alert severity="info" icon={<PhoneAndroidIcon />} sx={{ mb: 2, maxWidth: 560 }}>
                      The app installs on <b>Android phones</b>. Open this page on your phone, or send the link to it.
                    </Alert>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                      <Button
                        component={motion.a}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        variant="contained"
                        size="large"
                        startIcon={<WhatsAppIcon />}
                        href={`https://wa.me/?text=${encodeURIComponent(`Download the My Success app: ${pageUrl}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }, px: 3, py: 1.5, fontSize: 16 }}
                      >
                        Send the link to my phone
                      </Button>
                      <Button variant="outlined" size="large" startIcon={<ContentCopyIcon />} onClick={copyLink}>
                        Copy link
                      </Button>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2, maxWidth: 560 }}>
                      Need the file on this computer?{' '}
                      <Link href={apkUrl} download="MySuccess.apk">Download MySuccess.apk{sizeMb ? ` (${sizeMb} MB)` : ''}</Link>
                      {' '}and copy it to your phone. Do not open it on the computer: an APK only installs on Android, and a computer shows it as a folder of files.
                    </Typography>
                  </Box>
                )}

                <Stack direction="row" spacing={2.5} flexWrap="wrap" useFlexGap sx={{ mt: 3 }}>
                  {FEATURES.map((f) => (
                    <Stack key={f} direction="row" spacing={0.75} alignItems="center">
                      <CheckIcon sx={{ fontSize: 18, color: 'success.main' }} />
                      <Typography variant="body2" color="text.secondary">{f}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={5}>
              <Card component={motion.div} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 4 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                  <PhoneAndroidIcon color="primary" />
                  <Typography variant="h6" fontWeight={700}>How to install</Typography>
                </Stack>
                <Box component="ol" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                  {STEPS.map((s, i) => (
                    <Stack component={motion.li} key={s} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.08 }} direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 2 }}>
                      <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: 'primary.main', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{i + 1}</Box>
                      <Typography sx={{ pt: 0.25 }}>{s}</Typography>
                    </Stack>
                  ))}
                </Box>
                <Alert severity="info" variant="outlined" sx={{ mt: 1 }}>
                  Installing a new version keeps your data: everything is saved in your account online.
                </Alert>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <PublicFooter />
    </Box>
  );
};

export default DownloadApp;
