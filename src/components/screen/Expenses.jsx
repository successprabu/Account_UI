import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import * as yup from "yup";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  InputAdornment,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import ClearIcon from "@mui/icons-material/Clear";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import { API_SERVICE } from "../common/CommonMethod";
import { SAVE_NEW_TRANS_API } from "../common/CommonApiURL";
import Translator from "../common/TranslationBasedOnLanguage";
import { PageHeader } from "../ui";
import { AnimatedNumber, EntryField, rupees, useVoice } from "../moitech/shared";
import { EXPENSE_CATEGORIES } from "../moitech/constants";

// Category is stored in villageName and the person paid / description in name (type "E").
const schema = yup.object().shape({
  villageName: yup.string().required("Please choose a category"),
  name: yup.string().required("Please enter the description"),
  amount: yup.number().typeError("Please enter the amount").required("Please enter the amount").positive("Please enter the amount"),
  phoneNo: yup.string().matches(/^\d*$/, "Please Enter Valid Number"),
  remarks: yup.string(),
});

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch (e) {
    return null;
  }
};

const emptyExpense = (user) => ({
  id: 0,
  customerId: user?.customerID || 0,
  villageName: "",
  initial: "",
  name: "",
  oldAmount: 0,
  newAmount: 0,
  amount: 0,
  remarks: "",
  phoneNo: "",
  createdBy: user ? String(user.id) : "SYSTEM",
  createdDt: new Date().toISOString(),
  updatedBy: user ? String(user.id) : "SYSTEM",
  updatedDt: new Date().toISOString(),
  isActive: true,
  type: "E",
  returnStatus: "N",
  returnRemark: "",
  functionId: user?.functionId || 0,
});

/** New expense for the current function. */
const Expenses = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const voice = useVoice(i18n.language);
  const [formData, setFormData] = useState(() => emptyExpense(readUser()));
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState([]);
  const [fieldBeingTranslated, setFieldBeingTranslated] = useState(null);

  const categoryRef = useRef(null);
  const nameRef = useRef(null);
  const amountRef = useRef(null);
  const phoneNoRef = useRef(null);
  const remarksRef = useRef(null);
  const saveRef = useRef(null);

  const user = readUser();
  const noFunction = !user?.functionId;

  useEffect(() => {
    if (!readUser()) navigate("/login");
  }, [navigate]);

  const setField = (name, value) => {
    setFormData((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setField(name, value);
    if (typeof value === "string" && value.endsWith(" ")) setFieldBeingTranslated(name);
  };

  const handleTranslation = (translatedText) => {
    if (fieldBeingTranslated) {
      setFormData((f) => ({ ...f, [fieldBeingTranslated]: translatedText }));
      setFieldBeingTranslated(null);
    }
  };

  const handleKeyDown = (e, nextRef) => {
    if ((e.key === "Enter" || (e.key === "Tab" && !e.shiftKey)) && nextRef?.current) {
      e.preventDefault();
      nextRef.current.focus();
    }
  };

  const handleClear = () => {
    setFormData(emptyExpense(readUser()));
    setErrors({});
    categoryRef.current?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    const userDetail = readUser();
    if (!userDetail || !userDetail.functionId) {
      toast.error("Please Create Function Details");
      return;
    }
    try {
      await schema.validate(formData, { abortEarly: false });
    } catch (validationErrors) {
      const newErrors = {};
      (validationErrors.inner || []).forEach((err) => {
        newErrors[err.path] = err.message;
      });
      setErrors(newErrors);
      const first = ["villageName", "name", "amount", "phoneNo"].find((k) => newErrors[k]);
      ({ villageName: categoryRef, name: nameRef, amount: amountRef, phoneNo: phoneNoRef })[first]?.current?.focus();
      return;
    }

    setIsSaving(true);
    try {
      const response = await API_SERVICE.post(SAVE_NEW_TRANS_API, formData);
      if (response?.data?.result) {
        setSaved((s) => [{ ...formData, key: Date.now() }, ...s].slice(0, 6));
        setFormData(emptyExpense(userDetail));
        setErrors({});
        toast.success("Expenses Saved Successfully");
        setTimeout(() => categoryRef.current?.focus(), 50);
      } else {
        toast.error(response?.data?.message || "Something went wrong on Transaction Save..pls Try Again");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "API call error");
    } finally {
      setIsSaving(false);
    }
  };

  const voiceFor = (name, digits) => ({
    recording: voice.field === name,
    onMic: () => voice.toggle(name, (said) => setField(name, digits ? said.replace(/[^\d]/g, "") : said)),
  });

  const sessionTotal = saved.reduce((s, x) => s + Number(x.amount || 0), 0);

  return (
    <Box component="form" noValidate onSubmit={handleSubmit} sx={{ py: { xs: 2.5, md: 3 } }}>
      <PageHeader
        title={t("addExpenses")}
        subtitle={t("addExpensesHint", { defaultValue: "Record money spent on the function: catering, decoration, hall and more." })}
        breadcrumbs={[{ label: t("dashboard"), to: "/dashboard" }, { label: t("addExpenses") }]}
        actions={
          <Button component={RouterLink} to="/expenses-list" variant="outlined" startIcon={<ListAltOutlinedIcon />}>
            {t("expensesList")}
          </Button>
        }
      />

      {noFunction && (
        <Alert severity="warning" sx={{ mb: 2.5 }} action={<Button color="inherit" component={RouterLink} to="/function">{t("functionMaster", { defaultValue: "Add function" })}</Button>}>
          {t("createFunctionFirst", { defaultValue: "Add your function first. Entries are saved under the selected function." })}
        </Alert>
      )}

      <Grid container spacing={2.5} alignItems="flex-start">
        <Grid item xs={12} lg={8}>
          <Card component={motion.div} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} sx={{ p: { xs: 2, md: 3 } }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <EntryField
                  select
                  required
                  autoFocus
                  label={t("expensesCategory")}
                  name="villageName"
                  value={formData.villageName}
                  onChange={(e) => {
                    handleChange(e);
                    setTimeout(() => nameRef.current?.focus(), 0);
                  }}
                  inputRef={categoryRef}
                  error={!!errors.villageName}
                  helperText={errors.villageName}
                  SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 360 } } } }}
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <MenuItem key={c} value={c}>{t(c)}</MenuItem>
                  ))}
                </EntryField>
              </Grid>
              <Grid item xs={12} md={6}>
                <EntryField
                  required
                  label={t("expensesRcdPerson")}
                  placeholder={t("enter_expensesDescription")}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onKeyDown={(e) => handleKeyDown(e, amountRef)}
                  inputRef={nameRef}
                  error={!!errors.name}
                  helperText={errors.name}
                  {...voiceFor("name")}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <EntryField
                  required
                  type="number"
                  label={t("amount")}
                  placeholder={t("enter_amount")}
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  onFocus={(e) => e.target.select()}
                  onKeyDown={(e) => handleKeyDown(e, phoneNoRef)}
                  inputRef={amountRef}
                  error={!!errors.amount}
                  helperText={errors.amount}
                  inputProps={{ min: 0, inputMode: "numeric" }}
                  InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                  {...voiceFor("amount", true)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <EntryField
                  label={t("mobile")}
                  placeholder={t("enter_mobile")}
                  type="tel"
                  name="phoneNo"
                  value={formData.phoneNo}
                  onChange={handleChange}
                  onKeyDown={(e) => handleKeyDown(e, remarksRef)}
                  inputRef={phoneNoRef}
                  error={!!errors.phoneNo}
                  helperText={errors.phoneNo}
                  inputProps={{ inputMode: "numeric" }}
                  {...voiceFor("phoneNo", true)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <EntryField
                  label={t("remarks")}
                  placeholder={t("enter_remarks")}
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  onKeyDown={(e) => handleKeyDown(e, saveRef)}
                  inputRef={remarksRef}
                  {...voiceFor("remarks")}
                />
              </Grid>
            </Grid>

            <Translator inputText={formData[fieldBeingTranslated] || ""} onTranslated={handleTranslation} sourceLanguage="en" targetLanguage={i18n.language || "en"} />

            <Divider sx={{ my: 2.5 }} />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }} justifyContent="space-between">
              <Box sx={{ px: 2, py: 1.25, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.07), minWidth: 180 }}>
                <Typography variant="caption" color="text.secondary">{t("amount")}</Typography>
                <Typography variant="h4" component="p" fontWeight={800} color="error.main" sx={{ fontVariantNumeric: "tabular-nums" }}>
                  <AnimatedNumber value={formData.amount} />
                </Typography>
              </Box>
              <Stack direction="row" spacing={1.5}>
                <Button type="button" onClick={handleClear} startIcon={<ClearIcon />} disabled={isSaving}>{t("clearButton")}</Button>
                <Button
                  ref={saveRef}
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isSaving}
                  component={motion.button}
                  whileTap={{ scale: 0.97 }}
                  startIcon={isSaving ? <CircularProgress size={18} color="inherit" /> : <SaveOutlinedIcon />}
                  sx={{ px: 4 }}
                >
                  {isSaving ? t("processing_your_request") : t("save")}
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ p: 2.5 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <ReceiptOutlinedIcon color="error" fontSize="small" />
              <Typography fontWeight={700}>{t("savedThisSessionTitle", { defaultValue: "Saved just now" })}</Typography>
            </Stack>
            {saved.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {t("savedExpensesEmpty", { defaultValue: "Expenses you save here appear in this list with their total." })}
              </Typography>
            ) : (
              <>
                <AnimatePresence initial={false}>
                  {saved.map((x) => (
                    <Stack
                      key={x.key}
                      component={motion.div}
                      layout
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={1}
                      sx={{ py: 1, borderBottom: 1, borderColor: "divider" }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography fontWeight={600} noWrap>{x.name}</Typography>
                        <Chip size="small" variant="outlined" label={t(x.villageName)} sx={{ mt: 0.25 }} />
                      </Box>
                      <Typography fontWeight={700} sx={{ flexShrink: 0 }}>{rupees(x.amount)}</Typography>
                    </Stack>
                  ))}
                </AnimatePresence>
                <Stack direction="row" justifyContent="space-between" sx={{ pt: 1.5 }}>
                  <Typography color="text.secondary">{t("total")}</Typography>
                  <Typography fontWeight={800}>{rupees(sessionTotal)}</Typography>
                </Stack>
              </>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Expenses;
