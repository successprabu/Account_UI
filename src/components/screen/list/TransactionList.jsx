import { useTranslation } from "react-i18next";
import { Chip, Stack, Typography } from "@mui/material";
import { useTx } from "../../../language/site";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EntryListPage from "../../moitech/EntryListPage";
import { rupees } from "../../moitech/shared";

/** Receipts (moi received) for the current function: search, edit and delete. */
const TransactionList = () => {
  const { t } = useTranslation();
  const tx = useTx();
  const modeChip = (r) => (r.payMode === "Online"
    ? <Chip size="small" color="success" variant="outlined" label={tx("Online")} />
    : <Chip size="small" variant="outlined" label={tx("Cash")} />);
  const columns = [
    { key: "villageName", label: t("placeName") },
    { key: "initial", label: t("initial") },
    { key: "name", label: t("name"), bold: true },
    { key: "oldAmount", label: t("oldAmount"), align: "right", render: (r) => rupees(r.oldAmount) },
    { key: "newAmount", label: t("newAmount"), align: "right", render: (r) => rupees(r.newAmount) },
    { key: "amount", label: t("amount"), align: "right", bold: true, render: (r) => rupees(r.amount) },
    { key: "payMode", label: tx("Paid by"), render: modeChip },
    { key: "phoneNo", label: t("phoneNo") },
  ];

  const renderCard = (r) => (
    <>
      <Stack direction="row" spacing={1.5} alignItems="baseline" justifyContent="space-between">
        <Typography fontWeight={700} sx={{ minWidth: 0, overflowWrap: "anywhere" }}>{[r.initial, r.name].filter(Boolean).join(". ")}</Typography>
        <Typography variant="h6" fontWeight={800} sx={{ flexShrink: 0 }}>{rupees(r.amount)}</Typography>
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="body2" color="text.secondary">{r.villageName}</Typography>
        {r.payMode === "Online" && modeChip(r)}
      </Stack>
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
    </>
  );

  return (
    <EntryListPage
      type="R"
      kind="receipt"
      columns={columns}
      renderCard={renderCard}
      labels={{
        title: t("transactionList"),
        subtitle: t("transactionListHint", { defaultValue: "Every moi received for this function. Search, correct or remove an entry." }),
        add: t("addTransaction"),
        addTo: "/transaction",
        deleteTitle: t("deleteReceiptTitle", { defaultValue: "Delete this receipt?" }),
        empty: t("noReceiptsYet", { defaultValue: "Receipts you add will appear here." }),
        saved: t("receiptUpdated", { defaultValue: "Receipt updated" }),
        deleted: t("receiptDeleted", { defaultValue: "Receipt deleted" }),
      }}
    />
  );
};

export default TransactionList;
