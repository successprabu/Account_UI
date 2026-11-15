import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import i18n from 'i18next';
import { useTheme as useAppTheme } from '../../ThemeProvider';
import { brand, status, slate, type, radius } from '../../design/tokens';
import { PageHeader, SectionCard, StatCard, DataTable, EmptyState, StatusChip, ConfirmDialog, notify } from '../ui';

const inr = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

// Sample rows for the preview only.
const sampleRows = [
  { id: 1, name: 'முருகன் K', village: 'Thiruvarur', amount: 5000, date: '2026-11-02', status: 'Paid' },
  { id: 2, name: 'Lakshmi Devi', village: 'Kumbakonam', amount: 2500, date: '2026-11-05', status: 'Pending' },
  { id: 3, name: 'Arun Prakash', village: 'Mannargudi', amount: 10000, date: '2026-10-28', status: 'Paid' },
  { id: 4, name: 'செல்வி R', village: 'Needamangalam', amount: 1500, date: '2026-11-09', status: 'Cancelled' },
  { id: 5, name: 'Rajesh Kumar', village: 'Thanjavur', amount: 7500, date: '2026-11-11', status: 'Paid' },
  { id: 6, name: 'Meena S', village: 'Papanasam', amount: 3000, date: '2026-11-12', status: 'Pending' },
];
const tone = { Paid: 'success', Pending: 'warning', Cancelled: 'error' };

const LANGS = [
  { code: 'en', name: 'English' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'kn', name: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'മലയാളം' },
];

const Swatch = ({ color, name, hex }) => (
  <Stack spacing={0.75} sx={{ minWidth: 96 }}>
    <Box sx={{ height: 56, borderRadius: 2, background: color, border: 1, borderColor: 'divider' }} />
    <Typography variant="body2" fontWeight={600}>
      {name}
    </Typography>
    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
      {hex}
    </Typography>
  </Stack>
);

const LanguageSample = ({ code, name }) => {
  const t = useMemo(() => i18n.getFixedT(code), [code]);
  return (
    <SectionCard title={name} subtitle={code.toUpperCase()}>
      <Stack spacing={2}>
        <TextField label={t('name')} defaultValue="" />
        <TextField label={t('mobile')} defaultValue="" />
        <TextField label={t('village')} defaultValue="" />
        <TextField label={t('amount')} defaultValue="" />
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button variant="contained" startIcon={<SaveOutlinedIcon />}>
            {t('save')}
          </Button>
          <Button variant="outlined" color="inherit">
            {t('cancel')}
          </Button>
        </Stack>
        <StatCard label={t('expenses')} value={inr(42500)} icon={<ReceiptLongOutlinedIcon />} color="warning" />
      </Stack>
    </SectionCard>
  );
};

const DesignSystem = () => {
  const app = useAppTheme();
  const muiTheme = useMuiTheme();
  const mode = app?.mode || 'light';
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const columns = [
    { field: 'name', headerName: 'Name' },
    { field: 'village', headerName: 'Village' },
    { field: 'amount', headerName: 'Amount', align: 'right', render: (r) => inr(r.amount) },
    { field: 'date', headerName: 'Date' },
    { field: 'status', headerName: 'Status', render: (r) => <StatusChip label={r.status} tone={tone[r.status]} /> },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      exportable: false,
      align: 'right',
      render: () => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Tooltip title="Edit">
            <IconButton size="small" aria-label="Edit">
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" aria-label="Delete" onClick={() => setConfirmOpen(true)}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const confirmDelete = () => {
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setConfirmOpen(false);
      notify.success('Record deleted');
    }, 900);
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: { xs: 3, md: 5 } }}>
      <Container maxWidth="lg">
        <PageHeader
          title="MySuccess design system"
          subtitle="Phase 2 preview: the colours, type and components every page will use. Review it in light and dark mode."
          breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Design system' }]}
          actions={
            <Button
              variant="outlined"
              color="inherit"
              startIcon={mode === 'light' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
              onClick={() => app?.toggleTheme?.()}
            >
              {mode === 'light' ? 'Dark mode' : 'Light mode'}
            </Button>
          }
        />

        <Stack spacing={3}>
          <SectionCard title="Colour" subtitle="Indigo and violet carry the brand; status colours are kept for meaning (paid, pending, failed).">
            <Stack spacing={3}>
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                <Swatch color={muiTheme.palette.primary.main} name="Primary" hex={muiTheme.palette.primary.main} />
                <Swatch color={muiTheme.palette.secondary.main} name="Accent" hex={muiTheme.palette.secondary.main} />
                <Swatch color={brand.gradient} name="Brand gradient" hex="indigo → violet" />
                <Swatch color={brand.gold} name="Logo gold" hex={brand.gold} />
              </Stack>
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                <Swatch color={status.success} name="Success" hex={status.success} />
                <Swatch color={status.warning} name="Warning" hex={status.warning} />
                <Swatch color={status.error} name="Error" hex={status.error} />
                <Swatch color={status.info} name="Info" hex={status.info} />
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((k) => (
                  <Swatch key={k} color={slate[k]} name={`Slate ${k}`} hex={slate[k]} />
                ))}
              </Stack>
            </Stack>
          </SectionCard>

          <SectionCard title="Typography" subtitle="Inter for English; Noto Sans for Tamil, Hindi, Telugu, Kannada and Malayalam.">
            <Stack spacing={1.5}>
              {[
                ['h1', 'Display', type.display],
                ['h2', 'Heading 1', type.h1],
                ['h3', 'Heading 2', type.h2],
                ['h4', 'Heading 3', type.h3],
                ['h5', 'Heading 4', type.h4],
                ['body1', 'Body: மொய் வரவு செலவு கணக்கு, quick and clear.', type.body],
                ['body2', 'Small body: used in tables and helper text.', type.bodySmall],
                ['caption', 'Caption: timestamps and footnotes.', type.caption],
              ].map(([variant, text, t]) => (
                <Stack key={variant} direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0, sm: 3 }} alignItems={{ sm: 'baseline' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ width: 120, flexShrink: 0, fontFamily: 'monospace' }}>
                    {t.size}px / {t.weight}
                  </Typography>
                  <Typography variant={variant}>{text}</Typography>
                </Stack>
              ))}
            </Stack>
          </SectionCard>

          <SectionCard title="Buttons" subtitle={`Corner radius ${radius.md}px, 40px tall; one filled button per screen for the main action.`}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap alignItems="center">
                <Button variant="contained" startIcon={<AddIcon />}>
                  Add entry
                </Button>
                <Button variant="outlined">Secondary</Button>
                <Button variant="outlined" color="inherit">
                  Neutral
                </Button>
                <Button>Text button</Button>
                <Button variant="contained" color="error" startIcon={<DeleteOutlineIcon />}>
                  Delete
                </Button>
                <Button variant="contained" disabled>
                  Disabled
                </Button>
              </Stack>
              <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap alignItems="center">
                <Button variant="contained" size="small">
                  Small
                </Button>
                <Button variant="contained">Medium</Button>
                <Button variant="contained" size="large">
                  Large
                </Button>
              </Stack>
            </Stack>
          </SectionCard>

          <SectionCard title="Form fields" subtitle="Labels sit above the value; errors say what to fix.">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField label="Full name" placeholder="e.g. Lakshmi Devi" />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField label="Mobile number" defaultValue="98765" error helperText="Enter all 10 digits" />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField select label="Village" defaultValue="Thiruvarur">
                  {['Thiruvarur', 'Kumbakonam', 'Mannargudi'].map((v) => (
                    <MenuItem key={v} value={v}>
                      {v}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField label="Amount (₹)" type="number" defaultValue={5000} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField label="Date" type="date" defaultValue="2026-11-15" InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField label="Notes" disabled defaultValue="Read only" />
              </Grid>
              <Grid item xs={12}>
                <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
                  <FormControlLabel control={<Checkbox defaultChecked />} label="Send SMS receipt" />
                  <FormControlLabel control={<Switch defaultChecked />} label="Active" />
                </Stack>
              </Grid>
            </Grid>
          </SectionCard>

          <Box>
            <Typography variant="h5" component="h2" sx={{ mb: 1.5 }}>
              Summary cards
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard label="Total income" value={inr(124500)} icon={<AccountBalanceWalletOutlinedIcon />} color="primary" trend={{ value: '12%', direction: 'up', label: 'vs last month' }} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard label="Expenses" value={inr(42500)} icon={<ReceiptLongOutlinedIcon />} color="warning" trend={{ value: '4%', direction: 'down', label: 'vs last month' }} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard label="Contributors" value="318" icon={<PeopleAltOutlinedIcon />} color="success" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard label="Bookings" value="—" icon={<EventAvailableOutlinedIcon />} color="info" loading />
              </Grid>
            </Grid>
          </Box>

          <Box>
            <Typography variant="h5" component="h2" sx={{ mb: 1.5 }}>
              Data table
            </Typography>
            <DataTable
              columns={columns}
              rows={sampleRows}
              exportFileName="sample-transactions"
              searchPlaceholder="Search name or village"
              initialSort={{ field: 'date', direction: 'desc' }}
              pageSizeOptions={[5, 10, 25]}
              toolbar={
                <Button variant="contained" startIcon={<AddIcon />}>
                  Add entry
                </Button>
              }
            />
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <SectionCard title="Messages">
                <Stack spacing={1.5}>
                  <Alert severity="success">Entry saved and SMS receipt sent.</Alert>
                  <Alert severity="info">Reports refresh every night at 2 AM.</Alert>
                  <Alert severity="warning">3 entries are missing a village.</Alert>
                  <Alert severity="error">Could not reach the server. Check your connection and try again.</Alert>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ pt: 1 }}>
                    <Button size="small" variant="outlined" onClick={() => notify.success('Saved')}>
                      Success toast
                    </Button>
                    <Button size="small" variant="outlined" color="error" onClick={() => notify.error('Could not save')}>
                      Error toast
                    </Button>
                    <Button size="small" variant="outlined" color="inherit" onClick={() => setConfirmOpen(true)}>
                      Confirm dialog
                    </Button>
                  </Stack>
                </Stack>
              </SectionCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <SectionCard title="Empty state" noPadding>
                <EmptyState
                  title="No expenses yet"
                  description="Add your first expense to see totals and reports here."
                  action={
                    <Button variant="contained" startIcon={<AddIcon />}>
                      Add expense
                    </Button>
                  }
                />
              </SectionCard>
            </Grid>
          </Grid>

          <Box>
            <Typography variant="h5" component="h2" sx={{ mb: 0.5 }}>
              Language check
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              The same fields and buttons in all six languages, using the app's real translations.
            </Typography>
            <Grid container spacing={2}>
              {LANGS.map((l) => (
                <Grid item xs={12} sm={6} md={4} key={l.code}>
                  <LanguageSample code={l.code} name={l.name} />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Stack>
      </Container>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this entry?"
        message="This removes the entry and its receipt. You can't undo this."
        confirmLabel="Delete"
        danger
        loading={busy}
        onConfirm={confirmDelete}
        onClose={() => setConfirmOpen(false)}
      />
    </Box>
  );
};

export default DesignSystem;
