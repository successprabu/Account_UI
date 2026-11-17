import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Chip, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ReportPage from "../../moitech/ReportPage";
import { rupees } from "../../moitech/shared";
import { OTHERS_TYPES } from "../../moitech/constants";
import { loadEntries } from "./_allEntries";

const load = loadEntries("O", "OTHERS");

/** Gifts other than cash (rings, chains, coins…) for the current function, with item counts, Excel and PDF. */
const OthersReport = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const columns = useMemo(() => [
    { key: "sNo", label: t("sNo") },
    { key: "villageName", label: t("placeName") },
    { key: "name", label: t("name"), bold: true },
    { key: "others", label: t("others"), align: "right" },
    { key: "othersType", label: t("othersType"), value: (r) => (r.othersType ? t(r.othersType) : ""), render: (r) => (r.othersType ? <Chip size="small" color="secondary" variant="outlined" label={t(r.othersType)} /> : "") },
    { key: "othersRemark", label: t("othersRemarks") },
    { key: "amount", label: t("amount"), align: "right", render: (r) => rupees(r.amount) },
    { key: "phoneNo", label: t("phoneNo") },
  ], [t]);
  const filters = useMemo(() => [
    { key: "name", label: t("name") },
    { key: "placeName", label: t("placeName") },
    { key: "mobile", label: t("mobile"), digits: true },
  ], [t]);

  return (
    <ReportPage
      title={t("othersReport")}
      subtitle={t("othersReportHint", { defaultValue: "Rings, chains, coins and other gifts received. Search, then download as Excel or PDF." })}
      pdfTitle={t("othersReport")}
      fileBase="OthersReport"
      columns={columns}
      totalKeys={["others", "amount"]}
      filters={filters}
      load={load}
      stats={(rows) => {
        // Item counts per kind (the "Item details" summary).
        const counts = {};
        rows.forEach((r) => { if (r.othersType) counts[r.othersType] = (counts[r.othersType] || 0) + (Number(r.others) || 0); });
        const kinds = OTHERS_TYPES.filter((k) => counts[k]).concat(Object.keys(counts).filter((k) => !OTHERS_TYPES.includes(k)));
        return [
          { label: t("totalRecord", { defaultValue: "Entries" }), value: rows.length },
          ...kinds.slice(0, 3).map((k) => ({ label: t(k), value: counts[k], color: theme.palette.secondary.main })),
        ];
      }}
      renderCard={(r, i) => (
        <>
          <Stack direction="row" spacing={1.5} alignItems="baseline" justifyContent="space-between">
            <Typography fontWeight={700} sx={{ minWidth: 0, overflowWrap: "anywhere" }}>{i + 1}. {r.name}</Typography>
            {r.amount > 0 && <Typography variant="h6" fontWeight={800}>{rupees(r.amount)}</Typography>}
          </Stack>
          <Typography variant="body2" color="text.secondary">{r.villageName}</Typography>
          {r.othersType && <Chip size="small" color="secondary" variant="outlined" label={`${r.others || ""} ${t(r.othersType)}`.trim()} sx={{ mt: 0.5 }} />}
          {r.othersRemark && <Typography variant="caption" color="text.secondary" display="block">{r.othersRemark}</Typography>}
        </>
      )}
    />
  );
};

export default OthersReport;
