import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { API_SERVICE } from "../../common/CommonMethod";
import { REPORT_GET_REGIONALSUMMARY_API } from "../../common/CommonApiURL";
import ReportPage, { readUser } from "../../moitech/ReportPage";
import { rupees } from "../../moitech/shared";

/** Receipts totalled per place. The API returns every place, so the place search runs here. */
const load = async (filters) => {
  const user = readUser();
  const response = await API_SERVICE.get(REPORT_GET_REGIONALSUMMARY_API, {
    customer_id: user?.customerID,
    trans_type: "R",
    report_type: "REGIONAL",
    userId: user?.id || 0,
    function_id: user?.functionId || 0,
  });
  const rows = response?.data?.result ? response.data.data || [] : [];
  const q = (filters.placeName || "").trim().toLowerCase();
  return rows
    .filter((r) => !q || String(r.villageName || "").toLowerCase().includes(q))
    .sort((a, b) => (b.total || 0) - (a.total || 0));
};

const RegionalSummaryReport = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const columns = useMemo(() => [
    { key: "sNo", label: t("sNo") },
    { key: "villageName", label: t("placeName"), bold: true },
    { key: "total", label: t("total"), align: "right", bold: true, render: (r) => rupees(r.total) },
  ], [t]);
  const filters = useMemo(() => [{ key: "placeName", label: t("placeName") }], [t]);

  return (
    <ReportPage
      title={t("locationAmountReport")}
      subtitle={t("locationReportHint", { defaultValue: "How much moi came from each place, highest first." })}
      pdfTitle={t("locationAmountReport")}
      fileBase="RegionalReport"
      columns={columns}
      totalKeys={["total"]}
      filters={filters}
      load={load}
      stats={(rows, totals) => [
        { label: t("places", { defaultValue: "Places" }), value: rows.length },
        { label: t("total"), value: totals.total, money: true, color: theme.palette.success.main },
        ...(rows[0] ? [{ label: `${t("highest", { defaultValue: "Highest" })}: ${rows[0].villageName}`, value: rows[0].total, money: true, color: theme.palette.warning.main }] : []),
      ]}
      renderCard={(r, i) => (
        <>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline">
            <Typography fontWeight={700}>{i + 1}. {r.villageName}</Typography>
            <Typography variant="h6" fontWeight={800}>{rupees(r.total)}</Typography>
          </Stack>
        </>
      )}
    />
  );
};

export default RegionalSummaryReport;
