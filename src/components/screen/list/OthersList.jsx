import { useTranslation } from "react-i18next";
import { Chip, Stack, Typography } from "@mui/material";
import EntryListPage from "../../moitech/EntryListPage";
import { rupees } from "../../moitech/shared";

/** Non-cash moi (rings, chains, coins, pattam…) for the current function: search, edit and delete. */
const OthersList = () => {
  const { t } = useTranslation();
  const gift = (r) => [r.others > 0 ? r.others : null, r.othersType ? t(r.othersType) : null].filter(Boolean).join(" × ");
  const columns = [
    { key: "villageName", label: t("placeName") },
    { key: "name", label: t("name"), bold: true },
    { key: "others", label: t("others"), align: "right" },
    { key: "othersType", label: t("othersType"), render: (r) => (r.othersType ? <Chip size="small" color="secondary" variant="outlined" label={t(r.othersType)} /> : "") },
    { key: "othersRemark", label: t("othersRemarks") },
    { key: "amount", label: t("amount"), align: "right", bold: true, render: (r) => rupees(r.amount) },
    { key: "phoneNo", label: t("phoneNo") },
  ];

  const renderCard = (r) => (
    <>
      <Stack direction="row" spacing={1.5} alignItems="baseline" justifyContent="space-between">
        <Typography fontWeight={700} sx={{ minWidth: 0, overflowWrap: "anywhere" }}>{[r.initial, r.name].filter(Boolean).join(". ")}</Typography>
        {r.amount > 0 && <Typography variant="h6" fontWeight={800} sx={{ flexShrink: 0 }}>{rupees(r.amount)}</Typography>}
      </Stack>
      <Typography variant="body2" color="text.secondary">{r.villageName}</Typography>
      {gift(r) && <Chip size="small" color="secondary" variant="outlined" label={gift(r)} sx={{ mt: 0.5 }} />}
      {r.othersRemark && <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>{r.othersRemark}</Typography>}
      {r.phoneNo && <Typography variant="caption" color="text.secondary" display="block">{r.phoneNo}</Typography>}
    </>
  );

  return (
    <EntryListPage
      type="O"
      kind="others"
      columns={columns}
      renderCard={renderCard}
      labels={{
        title: t("othersList"),
        subtitle: t("othersListHint", { defaultValue: "Rings, chains, coins and other gifts received. Search, correct or remove an entry." }),
        add: t("addOthers"),
        addTo: "/others",
        deleteTitle: t("deleteOthersTitle", { defaultValue: "Delete this entry?" }),
        empty: t("noOthersYet", { defaultValue: "Gifts you add will appear here." }),
        saved: t("othersUpdated", { defaultValue: "Entry updated" }),
        deleted: t("othersDeleted", { defaultValue: "Entry deleted" }),
      }}
    />
  );
};

export default OthersList;
