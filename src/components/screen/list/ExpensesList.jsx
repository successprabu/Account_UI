import { useTranslation } from "react-i18next";
import { Chip, Stack, Typography } from "@mui/material";
import EntryListPage from "../../moitech/EntryListPage";
import { rupees } from "../../moitech/shared";

/** Expenses of the current function: search, edit and delete. Category is stored in villageName. */
const ExpensesList = () => {
  const { t } = useTranslation();
  const category = (r) => t(r.villageName, { defaultValue: r.villageName });
  const columns = [
    { key: "villageName", label: t("expensesCategory"), render: (r) => <Chip size="small" variant="outlined" label={category(r)} /> },
    { key: "name", label: t("expensesDescription"), bold: true },
    { key: "amount", label: t("amount"), align: "right", bold: true, render: (r) => rupees(r.amount) },
    { key: "phoneNo", label: t("phoneNo") },
  ];

  const renderCard = (r) => (
    <>
      <Stack direction="row" spacing={1.5} alignItems="baseline" justifyContent="space-between">
        <Typography fontWeight={700} sx={{ minWidth: 0, overflowWrap: "anywhere" }}>{r.name}</Typography>
        <Typography variant="h6" fontWeight={800} sx={{ flexShrink: 0 }}>{rupees(r.amount)}</Typography>
      </Stack>
      <Chip size="small" variant="outlined" label={category(r)} sx={{ mt: 0.5 }} />
      {r.phoneNo && <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>{r.phoneNo}</Typography>}
    </>
  );

  return (
    <EntryListPage
      type="E"
      kind="expense"
      columns={columns}
      renderCard={renderCard}
      labels={{
        title: t("expensesList"),
        subtitle: t("expensesListHint", { defaultValue: "Money spent on this function. Search, correct or remove an expense." }),
        add: t("addExpenses"),
        addTo: "/addExpenses",
        searchName: t("expensesDescription"),
        searchPlace: t("expensesCategory"),
        deleteTitle: t("deleteExpenseTitle", { defaultValue: "Delete this expense?" }),
        empty: t("noExpensesYet", { defaultValue: "Expenses you add will appear here." }),
        saved: t("expenseUpdated", { defaultValue: "Expense updated" }),
        deleted: t("expenseDeleted", { defaultValue: "Expense deleted" }),
      }}
    />
  );
};

export default ExpensesList;
