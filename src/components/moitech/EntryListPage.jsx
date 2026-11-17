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
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { API_SERVICE } from "../common/CommonMethod";
import { DELETE_TRANSACTION_API, LIST_TRANSACTION_API, SAVE_NEW_TRANS_API } from "../common/CommonApiURL";
import UnauthorizedAccess from "../common/UnauthorizedAccess";
import Translator from "../common/TranslationBasedOnLanguage";
import { ConfirmDialog, EmptyState, PageHeader, StatusChip } from "../ui";
import { EntryField, rupees, useVoice } from "./shared";
import EntryEditDialog from "./EntryEditDialog";

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch (e) {
    return null;
  }
};

const PAGE_SIZES = [10, 25, 50, 100];

/**
 * A list of one type of entry for the current function (receipts "R", expenses "E" or others "O"):
 * search with voice, table on wide screens, cards on phones, edit and delete.
 *
 * columns: [{ key, label, align, bold, render(row) }]; the column with key "amount" gets the page total.
 * renderCard(row): content of the phone card (amount and actions are added around it).
 * labels: { title, subtitle, add, addTo, searchName, searchPlace, deleteTitle, deleteMessage, empty, saved, deleted }
 */
const EntryListPage = ({ type, kind, columns, renderCard, labels }) => {
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
        trans_type: type,
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
      console.error("There was an error fetching the list!", e);
      setError(t("loadFailed", { defaultValue: "Could not load the list. Check your connection and try again." }));
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
      toast.success(labels.saved);
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
        toast.success(labels.deleted);
        setDeletingId(null);
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || t("an_error_occurred", { defaultValue: "Could not delete" }));
    } finally {
      setDeleting(false);
    }
  };

  const pageTotal = rows.reduce((acc, r) => acc + parseFloat(r.amount || 0), 0);
  const amountIndex = Math.max(0, columns.findIndex((c) => c.key === "amount"));

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
        title={labels.title}
        subtitle={labels.subtitle}
        breadcrumbs={[{ label: t("dashboard"), to: "/dashboard" }, { label: labels.title }]}
        actions={
          <Button component={RouterLink} to={labels.addTo} variant="contained" startIcon={<AddIcon />}>
            {labels.add}
          </Button>
        }
      />

      <Card component="form" onSubmit={search} sx={{ p: { xs: 2, md: 2.5 }, mb: 2.5 }}>
        <Grid container spacing={1.5} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>{searchField("name", labels.searchName || t("name"))}</Grid>
          <Grid item xs={12} sm={6} md={3}>{searchField("placeName", labels.searchPlace || t("placeName"))}</Grid>
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
            title={filtered ? t("noMatchesSearch", { defaultValue: "Nothing matches your search" }) : t("noData")}
            description={filtered ? t("tryOtherSearch", { defaultValue: "Try a different name, place or number." }) : labels.empty}
            action={filtered ? <Button onClick={clear}>{t("clearButton")}</Button> : <Button variant="contained" component={RouterLink} to={labels.addTo} startIcon={<AddIcon />}>{labels.add}</Button>}
          />
        </Card>
      ) : wide ? (
        <TableContainer component={Card} sx={{ opacity: loading ? 0.6 : 1, transition: "opacity .2s" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {columns.map((c) => <TableCell key={c.key} align={c.align}>{c.label}</TableCell>)}
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
                    {columns.map((c) => (
                      <TableCell key={c.key} align={c.align} sx={c.bold ? { fontWeight: c.key === "amount" ? 700 : 600 } : undefined}>
                        {c.render ? c.render(r) : r[c.key]}
                      </TableCell>
                    ))}
                    <TableCell><StatusChip label={r.isActive ? t("yes") : t("no")} tone={r.isActive ? "success" : "neutral"} /></TableCell>
                    <TableCell align="right">{actions(r)}</TableCell>
                  </TableRow>
                ))}
              </AnimatePresence>
              <TableRow sx={{ "& td": { fontWeight: 700, bgcolor: "action.hover" } }}>
                <TableCell colSpan={Math.max(1, amountIndex)}>{t("totalRows")}: {rows.length} {t("pagerows")}</TableCell>
                <TableCell align="right">{rupees(pageTotal)}</TableCell>
                <TableCell colSpan={columns.length - amountIndex + 1} />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Stack spacing={1.25} sx={{ opacity: loading ? 0.6 : 1 }}>
          <AnimatePresence initial={false}>
            {rows.map((r, i) => (
              <Card key={r.id} component={motion.div} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 10) * 0.03 } }} exit={{ opacity: 0, x: -20 }} sx={{ p: 1.75 }}>
                {renderCard(r)}
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

      <EntryEditDialog open={!!editing} entry={editing} kind={kind} onClose={() => setEditing(null)} onSave={saveEdit} />
      <ConfirmDialog
        open={deletingId !== null}
        title={labels.deleteTitle}
        message={labels.deleteMessage || t("deleteEntryMessage", { defaultValue: "It will be removed from the list and the totals." })}
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

export default EntryListPage;
