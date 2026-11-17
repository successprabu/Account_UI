import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Alert, Box, Button, Card, Grid, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { API_SERVICE } from "../../common/CommonMethod";
import { REPORT_GET_OTHERSSUMMARY_API, REPORT_GET_OVERALLSUMMARY_API } from "../../common/CommonApiURL";
import { EmptyState, PageHeader } from "../../ui";
import { ExportButtons, pdfInfo, readUser } from "../../moitech/ReportPage";
import { downloadReportPdf, exportExcel } from "../../moitech/reportExport";
import { AnimatedNumber, rupees } from "../../moitech/shared";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";

/** Totals per person who recorded entries, from the per-person-and-type summary rows. */
const byPerson = (rows) => {
  const people = {};
  rows.forEach((item) => {
    const key = item.createdBy;
    if (!people[key]) people[key] = { username: key, receipt: 0, expense: 0, others: 0 };
    if (item.type === "R") people[key].receipt += item.total;
    if (item.type === "E") people[key].expense += item.total;
    if (item.type === "O") people[key].others += item.total;
  });
  return Object.values(people).map((p) => ({ ...p, total: p.receipt + p.others - p.expense }));
};

/** Summary of the whole function: received, spent, others and the balance, per person, with item counts. */
const OverallSummaryReport = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [reportData, setReportData] = useState([]);
  const [othersData, setOthersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const user = readUser();
    if (!user) return;
    setLoading(true);
    setError("");
    const params = { customer_id: user.customerID, function_id: user.functionId || 0 };
    try {
      const [summary, others] = await Promise.all([API_SERVICE.get(REPORT_GET_OVERALLSUMMARY_API, params), API_SERVICE.get(REPORT_GET_OTHERSSUMMARY_API, params)]);
      setReportData(summary?.data?.result ? summary.data.data || [] : []);
      setOthersData(others?.data?.result ? others.data.data || [] : []);
    } catch (e) {
      console.error("Summary report could not be loaded", e);
      setError(t("loadFailed", { defaultValue: "Could not load the report. Check your connection and try again." }));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const people = useMemo(() => byPerson(reportData), [reportData]);
  const totals = useMemo(() => people.reduce((a, p) => ({ receipt: a.receipt + p.receipt, expense: a.expense + p.expense, others: a.others + p.others }), { receipt: 0, expense: 0, others: 0 }), [people]);
  const balance = totals.receipt + totals.others - totals.expense;
  const itemsTotal = othersData.reduce((a, x) => a + (x.totalOthers || 0), 0);

  const columns = [
    { key: "sNo", label: t("sNo") },
    { key: "username", label: t("receivedBy"), value: (r) => t(r.username, { defaultValue: r.username }) },
    { key: "receipt", label: t("receipt"), align: "right" },
    { key: "expense", label: t("expenses"), align: "right" },
    { key: "others", label: t("others"), align: "right" },
    { key: "total", label: t("total"), align: "right" },
  ];
  const itemColumns = [
    { key: "othersType", label: t("othersType"), value: (r) => t(r.othersType) || t("others") },
    { key: "totalOthers", label: t("itemTotal"), align: "right" },
  ];
  const totalsRow = { label: t("total"), values: { ...totals, total: balance } };
  const stats = [
    { label: t("receipt"), value: totals.receipt, color: theme.palette.success.main },
    { label: t("expenses"), value: totals.expense, color: theme.palette.error.main },
    { label: t("others"), value: totals.others, color: theme.palette.secondary.main },
    { label: t("total"), value: balance, color: theme.palette.primary.main, strong: true },
  ];

  const toExcel = () =>
    exportExcel({
      fileName: "summaryReport.xlsx",
      sheetName: t("summaryReport"),
      columns,
      rows: people,
      totals: totalsRow,
      extraSheets: [{ name: t("othersSummary"), columns: itemColumns, rows: othersData }],
    });
  const toPdf = async () =>
    downloadReportPdf({
      fileName: "Overall_Summary_Report.pdf",
      title: t("summaryReport"),
      columns,
      rows: people,
      totals: totalsRow,
      info: await pdfInfo(t),
      summary: [
        ...stats.map((s) => [s.label, rupees(s.value)]),
        ...othersData.map((x) => [t(x.othersType) || t("others"), x.totalOthers]),
      ],
    });

  return (
    <Box sx={{ py: { xs: 2.5, md: 3 } }}>
      <PageHeader
        title={t("summaryReport")}
        subtitle={t("summaryReportHint", { defaultValue: "The whole function at a glance: received, spent and the balance, per person." })}
        breadcrumbs={[{ label: t("dashboard"), to: "/dashboard" }, { label: t("summaryReport") }]}
        actions={<ExportButtons onExcel={toExcel} onPdf={toPdf} disabled={loading || people.length === 0} />}
      />
      {error && <Alert severity="error" sx={{ mb: 2 }} action={<Button color="inherit" onClick={load}>{t("retry", { defaultValue: "Retry" })}</Button>}>{error}</Alert>}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((s, i) => (
          <Grid item xs={6} md={3} key={s.label}>
            <Card component={motion.div} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.06 } }} sx={{ p: 2, height: "100%", borderTop: `3px solid ${s.color}`, ...(s.strong && { bgcolor: alpha(s.color, 0.06) }) }}>
              <Typography variant="body2" color="text.secondary">{s.label}</Typography>
              {loading ? <Skeleton width="60%" height={36} /> : (
                <Typography variant="h5" component="p" fontWeight={800} sx={{ mt: 0.5, color: s.strong ? s.color : "text.primary", fontVariantNumeric: "tabular-nums" }}>
                  <AnimatedNumber value={s.value} />
                </Typography>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>

      {loading && people.length === 0 ? (
        <Stack spacing={1}>{[0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={48} />)}</Stack>
      ) : people.length === 0 ? (
        <Card><EmptyState icon={<AssessmentOutlinedIcon />} title={t("noData")} description={t("noReportData", { defaultValue: "Entries for the current function appear here." })} /></Card>
      ) : (
        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow>{columns.map((c) => <TableCell key={c.key} align={c.align}>{c.label}</TableCell>)}</TableRow>
            </TableHead>
            <TableBody>
              {people.map((p, i) => (
                <TableRow key={p.username} hover component={motion.tr} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: i * 0.04 } }}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t(p.username, { defaultValue: p.username })}</TableCell>
                  <TableCell align="right">{rupees(p.receipt)}</TableCell>
                  <TableCell align="right">{rupees(p.expense)}</TableCell>
                  <TableCell align="right">{rupees(p.others)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>{rupees(p.total)}</TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ "& td": { fontWeight: 800, bgcolor: alpha(theme.palette.primary.main, 0.06) } }}>
                <TableCell colSpan={2}>{t("total")}</TableCell>
                <TableCell align="right">{rupees(totals.receipt)}</TableCell>
                <TableCell align="right">{rupees(totals.expense)}</TableCell>
                <TableCell align="right">{rupees(totals.others)}</TableCell>
                <TableCell align="right">{rupees(balance)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Typography variant="h6" fontWeight={700} sx={{ mt: 4, mb: 1.5 }}>{t("othersSummary")}</Typography>
      {othersData.length === 0 && !loading ? (
        <Typography color="text.secondary">{t("noData")}</Typography>
      ) : (
        <Grid container spacing={1.5}>
          {othersData.map((item, i) => (
            <Grid item xs={6} sm={4} md={2} key={`${item.othersType}-${i}`}>
              <Card component={motion.div} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1, transition: { delay: i * 0.05 } }} sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h4" component="p" fontWeight={800} color="secondary.main">{item.totalOthers}</Typography>
                <Typography variant="body2" color="text.secondary">{t(item.othersType) || t("others")}</Typography>
              </Card>
            </Grid>
          ))}
          {othersData.length > 0 && (
            <Grid item xs={6} sm={4} md={2}>
              <Card sx={{ p: 2, textAlign: "center", bgcolor: alpha(theme.palette.secondary.main, 0.08) }}>
                <Typography variant="h4" component="p" fontWeight={800}>{itemsTotal}</Typography>
                <Typography variant="body2" color="text.secondary">{t("itemTotal")}</Typography>
              </Card>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default OverallSummaryReport;
