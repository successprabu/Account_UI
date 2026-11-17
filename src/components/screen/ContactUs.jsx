import { useState } from 'react';
import { submitEnquiry } from '../../api/enquiries';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Button, Card, CircularProgress, Container, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import AppHeader from '../common/AppHeader';
import PublicFooter from '../public/PublicFooter';
import { IconTile } from '../public/Section';
import { CONTACT, PRODUCTS } from '../public/products';

const TOPICS = ['Website or custom software', 'Digitizing my business', 'AI and automation', ...PRODUCTS.map((p) => p.title), 'Pricing and plans', 'Help with my account', 'Something else'];

const emptyForm = { name: '', phone: '', email: '', topic: TOPICS[0], message: '', website: '' };

const ContactUs = () => {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const requested = params.get('topic');
  const [form, setForm] = useState(() => ({ ...emptyForm, topic: TOPICS.includes(requested) ? requested : emptyForm.topic }));
  const [errors, setErrors] = useState({});
  const [sentVia, setSentVia] = useState('');
  const [sending, setSending] = useState(false);
  const [saved, setSaved] = useState('');
  const [saveError, setSaveError] = useState('');

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const validate = () => {
    const er = {};
    if (!form.name.trim()) er.name = 'Please enter your name';
    if (form.phone && !/^[+\d][\d\s-]{7,}$/.test(form.phone.trim())) er.phone = 'Enter a valid phone number';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email.trim())) er.email = 'Enter a valid email address';
    if (!form.phone.trim() && !form.email.trim()) er.phone = 'Give a phone number or email so we can reply';
    if (!form.message.trim()) er.message = 'Please write a short message';
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const body = () =>
    [`Name: ${form.name}`, form.phone && `Phone: ${form.phone}`, form.email && `Email: ${form.email}`, `Topic: ${form.topic}`, '', form.message]
      .filter((x) => x !== false && x !== undefined && x !== '')
      .join('\n');

  // Main path: store the message so the team can reply from the Enquiries inbox.
  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSending(true);
    setSaveError('');
    const res = await submitEnquiry(form);
    setSending(false);
    if (res.ok) {
      setSaved(res.message || 'Thank you. We will reply within one working day.');
      setForm({ ...emptyForm, topic: form.topic });
    } else {
      setSaveError(res.message);
    }
  };

  // Fallbacks: hand the message to the visitor's email app or WhatsApp.
  const sendEmail = () => {
    if (!validate()) return;
    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(`[MySuccess] ${form.topic}`)}&body=${encodeURIComponent(body())}`;
    setSentVia('email');
  };

  const sendWhatsApp = () => {
    if (!validate()) return;
    window.open(`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(body())}`, '_blank', 'noopener,noreferrer');
    setSentVia('WhatsApp');
  };

  const cards = [
    { icon: <PhoneOutlinedIcon />, color: '#10b981', label: 'Call us', value: CONTACT.phoneDisplay, href: `tel:${CONTACT.phoneTel}` },
    { icon: <WhatsAppIcon />, color: '#22c55e', label: 'WhatsApp', value: CONTACT.phoneDisplay, href: `https://wa.me/${CONTACT.whatsapp}` },
    { icon: <MailOutlineIcon />, color: '#6366f1', label: 'Email', value: CONTACT.email, href: `mailto:${CONTACT.email}` },
    { icon: <PlaceOutlinedIcon />, color: '#f59e0b', label: 'Office', value: CONTACT.city },
    { icon: <ScheduleOutlinedIcon />, color: '#8b5cf6', label: 'Hours', value: CONTACT.hours },
  ];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <AppHeader />

      <Box component="section" sx={{ pt: { xs: 6, md: 9 }, pb: { xs: 3, md: 4 }, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="overline" color="primary.main">
            {t('contact_us', { defaultValue: 'Contact us' })}
          </Typography>
          <Typography variant="h1" component="h1" sx={{ fontSize: { xs: 32, md: 44 }, mt: 1 }}>
            How can we help?
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 2, fontSize: 18 }}>
            Questions about a product, pricing or your account. Call, WhatsApp or send us a message below.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: { xs: 7, md: 10 } }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Stack spacing={2}>
              {cards.map((c) => (
                <Card key={c.label} sx={{ p: 2.5 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <IconTile color={c.color} size={44}>
                      {c.icon}
                    </IconTile>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" color="text.secondary">
                        {c.label}
                      </Typography>
                      {c.href ? (
                        <Typography
                          component="a"
                          href={c.href}
                          target={c.href.startsWith('http') ? '_blank' : undefined}
                          rel="noopener noreferrer"
                          sx={{ fontWeight: 600, color: 'text.primary', textDecoration: 'none', wordBreak: 'break-word', '&:hover': { color: 'primary.main' } }}
                        >
                          {c.value}
                        </Typography>
                      ) : (
                        <Typography fontWeight={600}>{c.value}</Typography>
                      )}
                    </Box>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} md={7}>
            <Card sx={{ p: { xs: 2.5, md: 4 } }}>
              <Typography variant="h4" component="h2">
                Send a message
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
                We reply within one working day by phone, email or WhatsApp.
              </Typography>
              {saved ? (
                <Stack spacing={2} alignItems="flex-start">
                  <Alert severity="success" sx={{ width: '100%' }}>
                    {saved}
                  </Alert>
                  <Button variant="outlined" color="inherit" onClick={() => setSaved('')}>
                    Send another message
                  </Button>
                </Stack>
              ) : (
                <>
                  {saveError && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setSaveError('')}>
                      {saveError} You can also send it by email or WhatsApp below.
                    </Alert>
                  )}
                  {sentVia && (
                    <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSentVia('')}>
                      Your message is ready in {sentVia}. Press send there and we will reply within one working day.
                    </Alert>
                  )}
                  <Box component="form" noValidate onSubmit={submit}>
                    {/* Hidden from people; bots that fill every field are ignored by the server */}
                    <Box aria-hidden="true" sx={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
                      <label htmlFor="contact-website">Website</label>
                      <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField label="Your name" required value={form.name} onChange={set('name')} error={!!errors.name} helperText={errors.name} autoComplete="name" />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField label="Phone number" value={form.phone} onChange={set('phone')} error={!!errors.phone} helperText={errors.phone} autoComplete="tel" inputProps={{ inputMode: 'tel' }} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField label="Email" value={form.email} onChange={set('email')} error={!!errors.email} helperText={errors.email} autoComplete="email" inputProps={{ inputMode: 'email' }} />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField select label="Topic" value={form.topic} onChange={set('topic')}>
                          {TOPICS.map((tp) => (
                            <MenuItem key={tp} value={tp}>
                              {tp}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Message"
                          required
                          multiline
                          minRows={4}
                          value={form.message}
                          onChange={set('message')}
                          error={!!errors.message}
                          placeholder={form.topic === 'Custom Software' ? 'What does your business do, how do you work today, and what should the software do for you?' : undefined}
                          helperText={errors.message || (form.topic === 'Custom Software' ? 'A few lines is enough. We will call you to understand the details.' : undefined)}
                          inputProps={{ maxLength: 2000 }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
                          <Button type="submit" variant="contained" size="large" disabled={sending} startIcon={sending ? <CircularProgress size={18} color="inherit" /> : <SendOutlinedIcon />}>
                            {sending ? 'Sending…' : 'Send message'}
                          </Button>
                          <Typography variant="body2" color="text.secondary" sx={{ px: { sm: 1 } }}>
                            or
                          </Typography>
                          <Button variant="text" size="large" color="inherit" onClick={sendEmail} disabled={sending}>
                            Use my email app
                          </Button>
                          <Button variant="text" size="large" color="success" startIcon={<WhatsAppIcon />} onClick={sendWhatsApp} disabled={sending}>
                            WhatsApp
                          </Button>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Box>
                </>
              )}
            </Card>
          </Grid>
        </Grid>
      </Container>

      <PublicFooter />
    </Box>
  );
};

export default ContactUs;
