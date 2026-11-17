import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ReportPage from "../../moitech/ReportPage";
import { rupees } from "../../moitech/shared";
import { loadEntries } from "./_allEntries";

const load = loadEntries("R", "INCOME");
const phone = (r) => r.mobile || r.phoneNo || "";

/** Receipt report: every moi received for the current function, with totals, Excel and PDF. */
const IncomeReport = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const columns = useMemo(() => [
    { key: "sNo", label: t("sNo") },
    { key: "villageName", label: t("placeName") },
    { key: "initial", label: t("initial") },
    { key: "name", label: t("name"), bold: true },
    { key: "oldAmount", label: t("oldAmount"), align: "right", render: (r) => rupees(r.oldAmount) },
    { key: "newAmount", label: t("newAmount"), align: "right", render: (r) => rupees(r.newAmount) },
    { key: "amount", label: t("total"), align: "right", bold: true, render: (r) => rupees(r.amount) },
    { key: "mobile", label: t("phoneNo"), value: phone, render: phone },
  ], [t]);
  const filters = useMemo(() => [
    { key: "name", label: t("name") },
    { key: "placeName", label: t("placeName") },
    { key: "mobile", label: t("mobile"), digits: true },
  ], [t]);

  return (
    <ReportPage
      title={t("receiptReport")}
      subtitle={t("receiptReportHint", { defaultValue: "Every moi received for this function. Search, then download as Excel or PDF." })}
      pdfTitle={t("receiptReport")}
      fileBase="IncomeReport"
      columns={columns}
      totalKeys={["oldAmount", "newAmount", "amount"]}
      filters={filters}
      load={load}
      stats={(rows, totals) => [
        { label: t("totalRecord", { defaultValue: "Entries" }), value: rows.length },
        { label: t("oldAmount"), value: totals.oldAmount, money: true, color: theme.palette.info.main },
        { label: t("newAmount"), value: totals.newAmount, money: true, color: theme.palette.secondary.main },
        { label: t("total"), value: totals.amount, money: true, color: theme.palette.success.main },
      ]}
      renderCard={(r, i) => (
        <>
          <Stack direction="row" spacing={1.5} alignItems="baseline" justifyContent="space-between">
            <Typography fontWeight={700} sx={{ minWidth: 0, overflowWrap: "anywhere" }}>{i + 1}. {[r.initial, r.name].filter(Boolean).join(". ")}</Typography>
            <Typography variant="h6" fontWeight={800} sx={{ flexShrink: 0 }}>{rupees(r.amount)}</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">{r.villageName}{phone(r) ? ` · ${phone(r)}` : ""}</Typography>
          {r.oldAmount > 0 && <Typography variant="caption" color="text.secondary">{t("oldAmount")} {rupees(r.oldAmount)} · {t("newAmount")} {rupees(r.newAmount)}</Typography>}
        </>
      )}
    />
  );
};

export default IncomeReport;
