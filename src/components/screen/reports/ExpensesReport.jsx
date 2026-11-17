import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Chip, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ReportPage from "../../moitech/ReportPage";
import { rupees } from "../../moitech/shared";
import { loadEntries } from "./_allEntries";

const load = loadEntries("E", "EXPENSES");

/** Expense report for the current function, with totals per category, Excel and PDF. */
const ExpensesReport = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const category = (r) => t(r.villageName, { defaultValue: r.villageName });
  const columns = useMemo(() => [
    { key: "sNo", label: t("sNo") },
    { key: "villageName", label: t("expensesCategory"), value: (r) => t(r.villageName, { defaultValue: r.villageName }), render: (r) => <Chip size="small" variant="outlined" label={t(r.villageName, { defaultValue: r.villageName })} /> },
    { key: "name", label: t("expensesDescription"), bold: true },
    { key: "amount", label: t("amount"), align: "right", bold: true, render: (r) => rupees(r.amount) },
    { key: "phoneNo", label: t("phoneNo") },
  ], [t]);
  const filters = useMemo(() => [
    { key: "name", label: t("expensesDescription") },
    { key: "placeName", label: t("expensesCategory") },
    { key: "mobile", label: t("mobile"), digits: true },
  ], [t]);

  return (
    <ReportPage
      title={t("expenseReport")}
      subtitle={t("expenseReportHint", { defaultValue: "Money spent on this function. Search, then download as Excel or PDF." })}
      pdfTitle={t("expenseReport")}
      fileBase="ExpensesReport"
      columns={columns}
      totalKeys={["amount"]}
      filters={filters}
      load={load}
      stats={(rows, totals) => {
        const byCat = {};
        rows.forEach((r) => { byCat[r.villageName] = (byCat[r.villageName] || 0) + (Number(r.amount) || 0); });
        const top = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
        return [
          { label: t("totalRecord", { defaultValue: "Entries" }), value: rows.length },
          { label: t("total"), value: totals.amount, money: true, color: theme.palette.error.main },
          ...(top ? [{ label: `${t("highest", { defaultValue: "Highest" })}: ${t(top[0], { defaultValue: top[0] })}`, value: top[1], money: true, color: theme.palette.warning.main }] : []),
        ];
      }}
      renderCard={(r, i) => (
        <>
          <Stack direction="row" spacing={1.5} alignItems="baseline" justifyContent="space-between">
            <Typography fontWeight={700} sx={{ minWidth: 0, overflowWrap: "anywhere" }}>{i + 1}. {r.name}</Typography>
            <Typography variant="h6" fontWeight={800} sx={{ flexShrink: 0 }}>{rupees(r.amount)}</Typography>
          </Stack>
          <Chip size="small" variant="outlined" label={category(r)} sx={{ mt: 0.5 }} />
        </>
      )}
    />
  );
};

export default ExpensesReport;
