import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  Skeleton,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ReplayIcon from '@mui/icons-material/Replay';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import { EmptyState, StatusChip, notify } from '../../ui';
import { getEnquiry, listEnquiries, replyToEnquiry, setEnquiryStatus } from '../../../api/enquiries';

const STATUS_TONE = { New: 'info', Replied: 'success', Closed: 'neutral' };
const TABS = ['New', 'Replied', 'Closed', 'All'];

// The API stores UTC without a zone marker; read it as UTC and show local time.
const parseUtc = (v) => (v ? new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(v) ? v : `${v}Z`) : null);
const fmt = (v, withTime = true) => {
  const d = parseUtc(v);
  if (!d) return '';
  return d.toLocaleString('en-IN', withTime ? { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' } : { day: '2-digit', month: 'short', year: 'numeric' });
};
const ago = (v) => {
  const d = parseUtc(v);
  if (!d) return '';
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} h ago`;
  const days = Math.round(hrs / 24);
  return days < 7 ? `${days} d ago` : fmt(v, false);
};
const waDigits = (phone) => {
  const d = (phone || '').replace(/\D/g, '');
  return d.length === 10 ? `91${d}` : d;
};

/** Side panel: the full enquiry, earlier replies and the reply box. */
const EnquiryDetail = ({ id, onClose, onChanged }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enquiry, setEnquiry] = useState(null);
  const [channel, setChannel] = useState('email');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const res = await getEnquiry(id);
    setLoading(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setEnquiry(res.data);
    setChannel(res.data?.email ? 'email' : 'whatsapp');
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const send = async () => {
    if (text.trim().length < 2) return;
    setSending(true);
    const res = await replyToEnquiry(id, text.trim(), channel);
    setSending(false);
    if (res.ok) {
      if (channel === 'whatsapp' && res.data?.whatsappUrl) {
        window.open(res.data.whatsappUrl, '_blank', 'noopener,noreferrer');
      }
      notify.success(res.message || 'Reply sent');
      setText('');
      await load();
      onChanged();
    } else {
      notify.error(res.message);
      await load();
      onChanged();
    }
  };

  const changeStatus = async (status) => {
    setStatusBusy(true);
    const res = await setEnquiryStatus(id, status);
    setStatusBusy(false);
    if (res.ok) {
      notify.success(status === 'Closed' ? 'Marked as closed' : 'Reopened');
      await load();
      onChanged();
    } else {
      notify.error(res.message);
    }
  };

  const e = enquiry;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2.5, py: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h5" component="h2" noWrap>
            {e ? e.name : 'Enquiry'}
          </Typography>
          {e && (
            <Typography variant="caption" color="text.secondary">
              #{e.id} · {e.topic} · {fmt(e.createdDt)}
            </Typography>
          )}
        </Box>
        {e && <StatusChip label={e.status} tone={STATUS_TONE[e.status]} />}
        <IconButton onClick={onClose} aria-label="Close">
          <CloseIcon />
        </IconButton>
      </Stack>

      <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5 }}>
        {loading && !e && (
          <Stack spacing={1.5}>
            <Skeleton height={28} />
            <Skeleton variant="rounded" height={120} />
            <Skeleton variant="rounded" height={160} />
          </Stack>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        {e && (
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {e.phone && (
                <Button size="small" variant="outlined" color="inherit" startIcon={<PhoneOutlinedIcon />} href={`tel:${e.phone.replace(/\s/g, '')}`}>
                  {e.phone}
                </Button>
              )}
              {e.phone && (
                <Button size="small" variant="outlined" color="success" startIcon={<WhatsAppIcon />} href={`https://wa.me/${waDigits(e.phone)}`} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </Button>
              )}
              {e.email && (
                <Button size="small" variant="outlined" color="inherit" startIcon={<MailOutlineIcon />} href={`mailto:${e.email}`}>
                  {e.email}
                </Button>
              )}
            </Stack>

            <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="caption" color="text.secondary">
                Message
              </Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}>{e.message}</Typography>
            </Card>

            {e.replies?.length > 0 && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Replies ({e.replies.length})
                </Typography>
                <Stack spacing={1.5}>
                  {e.replies.map((r) => (
                    <Card key={r.id} variant="outlined" sx={{ p: 2, borderColor: r.delivered ? 'divider' : 'error.main' }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                        {r.channel === 'whatsapp' ? <WhatsAppIcon fontSize="small" color="success" /> : <MailOutlineIcon fontSize="small" color="primary" />}
                        <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                          {r.createdBy || 'Admin'} · {fmt(r.createdDt)} · to {r.sentTo}
                        </Typography>
                        {!r.delivered && <Chip size="small" color="error" variant="outlined" label="Not sent" />}
                      </Stack>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {r.message}
                      </Typography>
                      {r.error && (
                        <Typography variant="caption" color="error.main" component="p" sx={{ mt: 0.75 }}>
                          {r.error}
                        </Typography>
                      )}
                    </Card>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        )}
      </Box>

      {e && (
        <Box sx={{ p: 2.5, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
            <ToggleButtonGroup size="small" exclusive value={channel} onChange={(_, v) => v && setChannel(v)} aria-label="Reply by">
              <ToggleButton value="email" disabled={!e.email} sx={{ textTransform: 'none', gap: 0.75 }}>
                <MailOutlineIcon fontSize="small" /> Email
              </ToggleButton>
              <ToggleButton value="whatsapp" disabled={!e.phone} sx={{ textTransform: 'none', gap: 0.75 }}>
                <WhatsAppIcon fontSize="small" /> WhatsApp
              </ToggleButton>
            </ToggleButtonGroup>
            {e.status === 'Closed' ? (
              <Button size="small" color="inherit" startIcon={<ReplayIcon />} onClick={() => changeStatus('New')} disabled={statusBusy}>
                Reopen
              </Button>
            ) : (
              <Button size="small" color="inherit" startIcon={<CheckCircleOutlineIcon />} onClick={() => changeStatus('Closed')} disabled={statusBusy}>
                Mark closed
              </Button>
            )}
          </Stack>
          <TextField
            multiline
            minRows={3}
            maxRows={8}
            placeholder={channel === 'email' ? `Reply to ${e.email}` : `WhatsApp reply to ${e.phone}`}
            value={text}
            onChange={(ev) => setText(ev.target.value)}
            inputProps={{ maxLength: 4000, 'aria-label': 'Reply' }}
          />
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.5 }}>
            <Typography variant="caption" color="text.secondary">
              {channel === 'email' ? 'Sent from mysuccesstechnologies@gmail.com' : 'Opens WhatsApp with this text, ready to send'}
            </Typography>
            <Button
              variant="contained"
              onClick={send}
              disabled={sending || text.trim().length < 2}
              startIcon={sending ? <CircularProgress size={16} color="inherit" /> : channel === 'email' ? <SendOutlinedIcon /> : <WhatsAppIcon />}
            >
              {channel === 'email' ? 'Send email' : 'Open WhatsApp'}
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  );
};

/** Super-admin inbox for messages sent from the website contact form. */
const Enquiries = () => {
  const theme = useTheme();
  const wide = useMediaQuery(theme.breakpoints.up('md'));
  const [tab, setTab] = useState('New');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [data, setData] = useState({ items: [], total: 0, counts: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);
  const timer = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await listEnquiries({ status: tab === 'All' ? '' : tab, search: query, page: page + 1, pageSize });
    setLoading(false);
    if (res.ok) {
      setError('');
      setData({ items: res.data?.items || [], total: res.data?.total || 0, counts: res.data?.counts || {} });
    } else {
      setError(res.message);
    }
  }, [tab, query, page, pageSize]);

  useEffect(() => {
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, [load]);

  // Debounce the search box
  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setQuery(search.trim());
      setPage(0);
    }, 350);
    return () => clearTimeout(timer.current);
  }, [search]);

  const total = useMemo(() => Object.values(data.counts || {}).reduce((a, b) => a + b, 0), [data.counts]);
  const countFor = (t) => (t === 'All' ? total : data.counts?.[t] || 0);

  return (
    <Box sx={{ py: { xs: 2.5, md: 3 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }} justifyContent="space-between" sx={{ mb: 2.5 }}>
        <Box>
          <Typography variant="h3" component="h1" sx={{ fontSize: { xs: 22, md: 26 } }}>
            Enquiries
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Messages from the website contact form. Reply by email or WhatsApp.
          </Typography>
        </Box>
        <Button variant="outlined" color="inherit" size="small" startIcon={<RefreshIcon />} onClick={load} disabled={loading}>
          Refresh
        </Button>
      </Stack>

      <Card>
        <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} spacing={1.5} sx={{ px: 2, pt: 1, pb: { xs: 2, md: 1 }, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tab}
            onChange={(_, v) => {
              setTab(v);
              setPage(0);
            }}
            variant="scrollable"
            allowScrollButtonsMobile
            sx={{ flex: 1, minHeight: 44 }}
          >
            {TABS.map((t) => (
              <Tab
                key={t}
                value={t}
                sx={{ minHeight: 44 }}
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>{t}</span>
                    <Badge color={t === 'New' && countFor(t) > 0 ? 'primary' : 'default'} badgeContent={countFor(t)} max={999} showZero sx={{ '& .MuiBadge-badge': { position: 'static', transform: 'none' } }} />
                  </Stack>
                }
              />
            ))}
          </Tabs>
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, email or text"
            sx={{ maxWidth: { md: 320 } }}
            inputProps={{ 'aria-label': 'Search enquiries' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        {error && (
          <Alert severity="error" sx={{ m: 2 }} action={<Button color="inherit" size="small" onClick={load}>Retry</Button>}>
            {error}
          </Alert>
        )}

        <TableContainer sx={{ border: 0, borderRadius: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>From</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Topic</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Received</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && data.items.length === 0 &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`sk-${i}`}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <TableCell key={j} sx={j === 1 ? { display: { xs: 'none', md: 'table-cell' } } : undefined}>
                        <Skeleton />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              {data.items.map((e) => (
                <TableRow key={e.id} hover onClick={() => setOpenId(e.id)} sx={{ cursor: 'pointer', '& td': { fontWeight: e.status === 'New' ? 600 : 400 } }}>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <Typography variant="body2" fontWeight="inherit">
                      {e.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={400}>
                      {e.phone || e.email}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, whiteSpace: 'nowrap' }}>{e.topic}</TableCell>
                  <TableCell sx={{ maxWidth: 420 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={400} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {e.preview}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <Tooltip title={fmt(e.createdDt)}>
                      <span>{ago(e.createdDt)}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <StatusChip label={e.status} tone={STATUS_TONE[e.status]} />
                  </TableCell>
                </TableRow>
              ))}
              {!loading && !error && data.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} sx={{ border: 0 }}>
                    <EmptyState
                      compact
                      icon={<InboxOutlinedIcon />}
                      title={query ? 'No matching enquiries' : tab === 'New' ? 'No new enquiries' : 'Nothing here yet'}
                      description={query ? 'Try a different search.' : 'Messages from the website contact form will appear here.'}
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Divider />
        <TablePagination
          component="div"
          count={data.total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => {
            setPageSize(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Card>

      <Drawer anchor="right" open={openId != null} onClose={() => setOpenId(null)} PaperProps={{ sx: { width: wide ? 560 : '100%' } }}>
        {openId != null && <EnquiryDetail id={openId} onClose={() => setOpenId(null)} onChanged={load} />}
      </Drawer>
    </Box>
  );
};

export default Enquiries;
