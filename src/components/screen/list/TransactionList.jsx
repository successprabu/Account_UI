import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Grid,
  IconButton,
  MenuItem,
  Pagination,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import { API_SERVICE } from "../../common/CommonMethod";
import { DELETE_TRANSACTION_API, LIST_TRANSACTION_API, SAVE_NEW_TRANS_API } from "../../common/CommonApiURL";
import UnauthorizedAccess from "../../common/UnauthorizedAccess";
import Translator from "../../common/TranslationBasedOnLanguage";
import { ConfirmDialog, EmptyState, PageHeader, StatusChip } from "../../ui";
import { EntryField, rupees, useVoice } from "../../moitech/shared";
import EntryEditDialog from "../../moitech/EntryEditDialog";

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch (e) {
    return null;
  }
};

const PAGE_SIZES = [10, 25, 50, 100];

/** Receipts (moi received) for the current function: search, edit and delete. */
const TransactionList = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const wide = useMediaQuery(theme.breakpoints.up("md"));
  const user = readUser();
  const voice = useVoice(i18n.language);

  const [filters, setFilters] = useState({ name: "", placeName: "", mobile: "" });
  const [applied, setApplied] = useState(filters);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [fieldBeingTranslated, setFieldBeingTranslated] = useState(null);

  const fetchTransactions = useCallback(async () => {
    const u = readUser();
    if (!u) return;
    setLoading(true);
    setError("");
    try {
      const response = await API_SERVICE.get(LIST_TRANSACTION_API, {
        customer_id: u.customerID,
        id: null,
        customer_name: applied.name,
        trans_type: "R",
        village_name: applied.placeName,
        mobile: applied.mobile,
        user_type: u.userType,
        userId: u.id,
        current_page: currentPage,
        page_size: pageSize,
      });
      if (response?.data?.result) {
        setRows(response.data.data?.transactions || []);
        setTotalPages(Math.max(1, response.data.data?.totalPages || 1));
      } else {
        setRows([]);
        setTotalPages(1);
      }
    } catch (e) {
      console.error("There was an error fetching the receipt list!", e);
      setError(t("loadFailed", { defaultValue: "Could not load the receipts. Check your connection and try again." }));
    } finally {
      setLoading(false);
    }
  }, [applied, currentPage, pageSize, t]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  if (!user) return <UnauthorizedAccess />;

  const setFilter = (k) => (e) => {
    const { value } = e.target;
    setFilters((f) => ({ ...f, [k]: value }));
    if (value.endsWith(" ") && k !== "mobile") setFieldBeingTranslated(k);
  };
  const search = (e) => {
    e?.preventDefault();
    setCurrentPage(1);
    setApplied({ ...filters });
  };
  const clear = () => {
    const empty = { name: "", placeName: "", mobile: "" };
    setFilters(empty);
    setCurrentPage(1);
    setApplied(empty);
  };
  const filtered = applied.name || applied.placeName || applied.mobile;

  const saveEdit = async (updated) => {
    try {
      const res = await API_SERVICE.post(SAVE_NEW_TRANS_API, updated);
      if (res?.data?.result === false) return { ok: false, message: res.data.message };
      setRows((rs) => rs.map((r) => (r.id === updated.id ? updated : r)));
      setEditing(null);
      toast.success(t("updatedSuccessfully", { defaultValue: "Receipt updated" }));
      return { ok: true };
    } catch (e) {
      return { ok: false, message: e?.response?.data?.message };
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const res = await API_SERVICE.postreq(DELETE_TRANSACTION_API, {
        id: deletingId,
        deletedBy: user.primary_phone || user.mobile || String(user.id ?? "system"),
      });
      if (res?.data?.result === false) {
        toast.error(res.data.message || t("an_error_occurred", { defaultValue: "Could not delete" }));
      } else {
        setRows((rs) => rs.filter((r) => r.id !== deletingId));
        toast.success(t("deletedSuccessfully", { defaultValue: "Receipt deleted" }));
        setDeletingId(null);
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || t("an_error_occurred", { defaultValue: "Could not delete" }));
    } finally {
      setDeleting(false);
    }
  };

  const pageTotal = rows.reduce((acc, r) => acc + parseFloat(r.amount || 0), 0);

  const searchField = (k, label, extra = {}) => (
    <EntryField
      size="small"
      label={label}
      value={filters[k]}
      onChange={setFilter(k)}
      onKeyDown={(e) => e.key === "Enter" && search(e)}
      recording={voice.field === k}
      onMic={() => voice.toggle(k, (said) => setFilters((f) => ({ ...f, [k]: k === "mobile" ? said.replace(/\D/g, "") : said })))}
      {...extra}
    />
  );

  const actions = (r) => (
    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
      <Tooltip title={t("edit")}>
        <IconButton size="small" color="primary" onClick={() => setEditing(r)} aria-label={`${t("edit")} ${r.name}`}>
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={t("delete")}>
        <IconButton size="small" color="error" onClick={() => setDeletingId(r.id)} aria-label={`${t("delete")} ${r.name}`}>
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );

  return (
    <Box sx={{ py: { xs: 2.5, md: 3 } }}>
      <PageHeader
        title={t("transactionList")}
        subtitle={t("transactionListHint", { defaultValue: "Every moi received for this function. Search, correct or remove an entry." })}
        breadcrumbs={[{ label: t("dashboard"), to: "/dashboard" }, { label: t("transactionList") }]}
        actions={
          <Button component={RouterLink} to="/transaction" variant="contained" startIcon={<AddIcon />}>
            {t("addTransaction")}
          </Button>
        }
      />

      <Card component="form" onSubmit={search} sx={{ p: { xs: 2, md: 2.5 }, mb: 2.5 }}>
        <Grid container spacing={1.5} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>{searchField("name", t("name"))}</Grid>
          <Grid item xs={12} sm={6} md={3}>{searchField("placeName", t("placeName"))}</Grid>
          <Grid item xs={12} sm={6} md={2}>{searchField("mobile", t("mobile"), { type: "tel", inputProps: { inputMode: "numeric" } })}</Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Stack direction="row" spacing={1}>
              <Button type="submit" variant="contained" startIcon={<SearchIcon />} sx={{ flex: 1 }}>{t("search")}</Button>
              <Button onClick={clear} startIcon={<ClearIcon />} disabled={!filtered && !filters.name && !filters.placeName && !filters.mobile}>{t("clearButton")}</Button>
            </Stack>
          </Grid>
        </Grid>
        {fieldBeingTranslated && (
          <Translator
            inputText={filters[fieldBeingTranslated] || ""}
            onTranslated={(text) => {
              setFilters((f) => ({ ...f, [fieldBeingTranslated]: text }));
              setFieldBeingTranslated(null);
            }}
            sourceLanguage="en"
            targetLanguage={i18n.language || "en"}
          />
        )}
      </Card>

      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
        <Chip icon={<ReceiptLongOutlinedIcon />} label={`${t("totalRows")}: ${rows.length} ${t("pagerows")}`} />
        <Chip color="primary" variant="outlined" label={`${t("amount")}: ${rupees(pageTotal)}`} />
        {filtered && <Chip label={t("filtered", { defaultValue: "Filtered" })} onDelete={clear} />}
        <Box sx={{ flex: 1 }} />
        <TextField select size="small" label={t("pageSize")} value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} sx={{ width: 110 }}>
          {PAGE_SIZES.map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
        </TextField>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} action={<Button color="inherit" onClick={fetchTransactions}>{t("retry", { defaultValue: "Retry" })}</Button>}>{error}</Alert>}

      {loading && rows.length === 0 ? (
        <Stack spacing={1}>{[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} variant="rounded" height={52} />)}</Stack>
      ) : rows.length === 0 && !error ? (
        <Card>
          <EmptyState
            icon={<ReceiptLongOutlinedIcon />}
            title={filtered ? t("noMatches", { defaultValue: "No receipts match your search" }) : t("noData")}
            description={filtered ? t("tryOtherSearch", { defaultValue: "Try a different name, place or number." }) : t("noReceiptsYet", { defaultValue: "Receipts you add will appear here." })}
            action={filtered ? <Button onClick={clear}>{t("clearButton")}</Button> : <Button variant="contained" component={RouterLink} to="/transaction" startIcon={<AddIcon />}>{t("addTransaction")}</Button>}
          />
        </Card>
      ) : wide ? (
        <TableContainer component={Card} sx={{ opacity: loading ? 0.6 : 1, transition: "opacity .2s" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t("placeName")}</TableCell>
                <TableCell>{t("initial")}</TableCell>
                <TableCell>{t("name")}</TableCell>
                <TableCell align="right">{t("oldAmount")}</TableCell>
                <TableCell align="right">{t("newAmount")}</TableCell>
                <TableCell align="right">{t("amount")}</TableCell>
                <TableCell>{t("phoneNo")}</TableCell>
                <TableCell>{t("active")}</TableCell>
                <TableCell align="right">{t("actions")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <AnimatePresence initial={false}>
                {rows.map((r, i) => (
                  <TableRow
                    key={r.id}
                    hover
                    component={motion.tr}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 12) * 0.02 } }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <TableCell>{r.villageName}</TableCell>
                    <TableCell>{r.initial}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{r.name}</TableCell>
                    <TableCell align="right">{rupees(r.oldAmount)}</TableCell>
                    <TableCell align="right">{rupees(r.newAmount)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>{rupees(r.amount)}</TableCell>
                    <TableCell>{r.phoneNo}</TableCell>
                    <TableCell><StatusChip label={r.isActive ? t("yes") : t("no")} tone={r.isActive ? "success" : "neutral"} /></TableCell>
                    <TableCell align="right">{actions(r)}</TableCell>
                  </TableRow>
                ))}
              </AnimatePresence>
              <TableRow sx={{ "& td": { fontWeight: 700, bgcolor: "action.hover" } }}>
                <TableCell colSpan={5}>{t("totalRows")}: {rows.length} {t("pagerows")}</TableCell>
                <TableCell align="right">{rupees(pageTotal)}</TableCell>
                <TableCell colSpan={3} />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Stack spacing={1.25} sx={{ opacity: loading ? 0.6 : 1 }}>
          <AnimatePresence initial={false}>
            {rows.map((r, i) => (
              <Card key={r.id} component={motion.div} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 10) * 0.03 } }} exit={{ opacity: 0, x: -20 }} sx={{ p: 1.75 }}>
                <Stack direction="row" spacing={1.5} alignItems="baseline" justifyContent="space-between">
                  <Typography fontWeight={700} sx={{ minWidth: 0, overflowWrap: "anywhere" }}>{[r.initial, r.name].filter(Boolean).join(". ")}</Typography>
                  <Typography variant="h6" fontWeight={800} sx={{ flexShrink: 0 }}>{rupees(r.amount)}</Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">{r.villageName}</Typography>
                {r.oldAmount > 0 && r.newAmount > 0 && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    {t("oldAmount")} {rupees(r.oldAmount)} · {t("newAmount")} {rupees(r.newAmount)}
                  </Typography>
                )}
                {r.oldAmount > 0 && !(r.newAmount > 0) && (
                  <Typography variant="caption" color="text.secondary" display="block">{t("oldAmount")}</Typography>
                )}
                {r.phoneNo && (
                  <Stack direction="row" spacing={0.5} alignItems="center" color="text.secondary">
                    <PhoneOutlinedIcon sx={{ fontSize: 14 }} />
                    <Typography variant="caption">{r.phoneNo}</Typography>
                  </Stack>
                )}
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                  <StatusChip label={r.isActive ? t("yes") : t("no")} tone={r.isActive ? "success" : "neutral"} />
                  {actions(r)}
                </Stack>
              </Card>
            ))}
          </AnimatePresence>
        </Stack>
      )}

      {totalPages > 1 && (
        <Stack alignItems="center" sx={{ mt: 2.5 }}>
          <Pagination count={totalPages} page={currentPage} onChange={(_, p) => setCurrentPage(p)} color="primary" showFirstButton showLastButton siblingCount={wide ? 1 : 0} />
        </Stack>
      )}

      <EntryEditDialog open={!!editing} entry={editing} onClose={() => setEditing(null)} onSave={saveEdit} />
      <ConfirmDialog
        open={deletingId !== null}
        title={t("deleteReceiptTitle", { defaultValue: "Delete this receipt?" })}
        message={t("deleteReceiptMessage", { defaultValue: "It will be removed from the list and the totals." })}
        confirmLabel={t("delete")}
        cancelLabel={t("cancel")}
        danger
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => !deleting && setDeletingId(null)}
      />
    </Box>
  );
};

export default TransactionList;
