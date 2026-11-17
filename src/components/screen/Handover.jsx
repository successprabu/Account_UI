import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Grid,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import SouthWestIcon from "@mui/icons-material/SouthWest";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import DiamondOutlinedIcon from "@mui/icons-material/DiamondOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import { API_SERVICE } from "../common/CommonMethod";
import { REPORT_GET_OTHERSSUMMARY_API, REPORT_GET_OVERALLSUMMARY_API } from "../common/CommonApiURL";
import { EmptyState, PageHeader } from "../ui";
import { AnimatedNumber, rupees } from "../moitech/shared";
import HandoverDialog from "../moitech/HandoverDialog";

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch (e) {
    return null;
  }
};

/** Totals per person who recorded entries (the summary report rows are per person and type). */
const byPerson = (rows) => {
  const people = {};
  rows.forEach((item) => {
    const key = item.createdBy;
    if (!people[key]) people[key] = { username: key, userId: item.createdById, receipt: 0, expense: 0, others: 0 };
    if (item.type === "R") people[key].receipt += item.total;
    if (item.type === "E") people[key].expense += item.total;
    if (item.type === "O") people[key].others += item.total;
    people[key].userId = item.createdById;
  });
  return Object.values(people).map((p, i) => ({ ...p, sNo: i + 1, total: p.receipt + p.others - p.expense }));
};

/** End of the function: how much each collector holds, and recording who they handed it to. */
const Handover = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const wide = useMediaQuery(theme.breakpoints.up("md"));
  const [reportData, setReportData] = useState([]);
  const [othersData, setOthersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [handing, setHanding] = useState(null);
  const [handedOver, setHandedOver] = useState({});

  const load = useCallback(async () => {
    const user = readUser();
    if (!user) return;
    setLoading(true);
    setError("");
    const params = { customer_id: user.customerID, function_id: user.functionId || 0 };
    try {
      const [summary, others] = await Promise.all([
        API_SERVICE.get(REPORT_GET_OVERALLSUMMARY_API, params),
        API_SERVICE.get(REPORT_GET_OTHERSSUMMARY_API, params),
      ]);
      setReportData(summary?.data?.result ? summary.data.data || [] : []);
      setOthersData(others?.data?.result ? others.data.data || [] : []);
    } catch (e) {
      console.error("Error fetching handover data:", e);
      setError(t("loadFailed", { defaultValue: "Could not load the totals. Check your connection and try again." }));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const people = useMemo(() => byPerson(reportData), [reportData]);
  const totals = useMemo(() => people.reduce((a, p) => ({ receipt: a.receipt + p.receipt, expense: a.expense + p.expense, others: a.others + p.others }), { receipt: 0, expense: 0, others: 0 }), [people]);
  const net = totals.receipt + totals.others - totals.expense;
  const itemsTotal = othersData.reduce((a, x) => a + (x.totalOthers || 0), 0);

  const stats = [
    { label: t("receipt"), value: totals.receipt, icon: <SouthWestIcon />, color: theme.palette.success.main },
    { label: t("expenses"), value: totals.expense, icon: <NorthEastIcon />, color: theme.palette.error.main },
    { label: t("others"), value: totals.others, icon: <DiamondOutlinedIcon />, color: theme.palette.secondary.main },
    { label: t("total"), value: net, icon: <AccountBalanceWalletOutlinedIcon />, color: theme.palette.primary.main, strong: true },
  ];

  const handButton = (p) => (
    <Button size="small" variant={handedOver[p.userId] ? "text" : "contained"} startIcon={<HandshakeOutlinedIcon />} onClick={() => setHanding(p)}>
      {handedOver[p.userId] ? t("handedOver", { defaultValue: "Handed over" }) : t("handOver")}
    </Button>
  );

  return (
    <Box sx={{ py: { xs: 2.5, md: 3 } }}>
      <PageHeader
        title={t("handOver")}
        subtitle={t("handOverHint", { defaultValue: "At the end of the function, see what each person collected and record who they handed it to." })}
        breadcrumbs={[{ label: t("dashboard"), to: "/dashboard" }, { label: t("handOver") }]}
        actions={<Button startIcon={<RefreshIcon />} onClick={load} disabled={loading}>{t("refresh", { defaultValue: "Refresh" })}</Button>}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }} action={<Button color="inherit" onClick={load}>{t("retry", { defaultValue: "Retry" })}</Button>}>{error}</Alert>}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((s, i) => (
          <Grid item xs={6} md={3} key={s.label}>
            <Card component={motion.div} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.06 } }} sx={{ p: 2, height: "100%", ...(s.strong && { bgcolor: alpha(s.color, 0.08), border: 1, borderColor: alpha(s.color, 0.3) }) }}>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <Box sx={{ width: 36, height: 36, borderRadius: 2, display: "grid", placeItems: "center", color: s.color, bgcolor: alpha(s.color, 0.12), "& svg": { fontSize: 20 } }}>{s.icon}</Box>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>{s.label}</Typography>
              </Stack>
              {loading ? <Skeleton width="60%" height={36} /> : (
                <Typography variant="h5" component="p" fontWeight={800} sx={{ mt: 1, color: s.strong ? s.color : "text.primary", fontVariantNumeric: "tabular-nums" }}>
                  <AnimatedNumber value={s.value} />
                </Typography>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>{t("receivedBy")}</Typography>
      {loading && people.length === 0 ? (
        <Stack spacing={1}>{[0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={56} />)}</Stack>
      ) : people.length === 0 ? (
        <Card><EmptyState icon={<HandshakeOutlinedIcon />} title={t("noData")} description={t("noHandoverYet", { defaultValue: "Totals appear here once receipts or expenses are recorded for this function." })} /></Card>
      ) : wide ? (
        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t("sNo")}</TableCell>
                <TableCell>{t("receivedBy")}</TableCell>
                <TableCell align="right">{t("receipt")}</TableCell>
                <TableCell align="right">{t("expenses")}</TableCell>
                <TableCell align="right">{t("others")}</TableCell>
                <TableCell align="right">{t("total")}</TableCell>
                <TableCell align="right">{t("actions")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {people.map((p, i) => (
                <TableRow key={p.username} hover component={motion.tr} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: i * 0.04 } }}>
                  <TableCell>{p.sNo}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t(p.username, { defaultValue: p.username })}</TableCell>
                  <TableCell align="right">{rupees(p.receipt)}</TableCell>
                  <TableCell align="right">{rupees(p.expense)}</TableCell>
                  <TableCell align="right">{rupees(p.others)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>{rupees(p.total)}</TableCell>
                  <TableCell align="right">{handButton(p)}</TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ "& td": { fontWeight: 800, bgcolor: "action.hover" } }}>
                <TableCell colSpan={2}>{t("total")}</TableCell>
                <TableCell align="right">{rupees(totals.receipt)}</TableCell>
                <TableCell align="right">{rupees(totals.expense)}</TableCell>
                <TableCell align="right">{rupees(totals.others)}</TableCell>
                <TableCell align="right">{rupees(net)}</TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Stack spacing={1.25}>
          <AnimatePresence>
            {people.map((p, i) => (
              <Card key={p.username} component={motion.div} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }} sx={{ p: 2 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.14), color: "primary.main", fontWeight: 700 }}>{String(t(p.username, { defaultValue: p.username })).charAt(0).toUpperCase()}</Avatar>
                  <Typography fontWeight={700} sx={{ flex: 1, minWidth: 0 }} noWrap>{t(p.username, { defaultValue: p.username })}</Typography>
                  <Typography variant="h6" fontWeight={800}>{rupees(p.total)}</Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  {t("receipt")} {rupees(p.receipt)} · {t("expenses")} {rupees(p.expense)} · {t("others")} {rupees(p.others)}
                </Typography>
                <Box sx={{ mt: 1.25, textAlign: "right" }}>{handButton(p)}</Box>
              </Card>
            ))}
          </AnimatePresence>
        </Stack>
      )}

      <Typography variant="h6" fontWeight={700} sx={{ mt: 4, mb: 1.5 }}>{t("othersSummary")}</Typography>
      {othersData.length === 0 && !loading ? (
        <Typography color="text.secondary">{t("noData")}</Typography>
      ) : (
        <Grid container spacing={1.5}>
          {othersData.map((item, i) => (
            <Grid item xs={6} sm={4} md={2.4} key={`${item.othersType}-${i}`}>
              <Card component={motion.div} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1, transition: { delay: i * 0.05 } }} sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h4" component="p" fontWeight={800} color="secondary.main">{item.totalOthers}</Typography>
                <Typography variant="body2" color="text.secondary">{t(item.othersType) || t("others")}</Typography>
              </Card>
            </Grid>
          ))}
          {othersData.length > 0 && (
            <Grid item xs={12}>
              <Chip color="secondary" variant="outlined" label={`${t("itemTotal")}: ${itemsTotal}`} />
            </Grid>
          )}
        </Grid>
      )}

      <HandoverDialog
        open={!!handing}
        person={handing}
        onClose={() => setHanding(null)}
        onSaved={(p) => setHandedOver((h) => ({ ...h, [p.userId]: true }))}
      />
    </Box>
  );
};

export default Handover;
