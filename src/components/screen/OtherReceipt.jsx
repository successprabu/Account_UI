import { useCallback, useEffect, useRef, useState } from "react";
import { useTx } from "../../language/site";
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
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  InputAdornment,
  Stack,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import ClearIcon from "@mui/icons-material/Clear";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import TranslateIcon from "@mui/icons-material/Translate";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DiamondOutlinedIcon from "@mui/icons-material/DiamondOutlined";
import { API_SERVICE } from "../common/CommonMethod";
import { SAVE_NEW_TRANS_API } from "../common/CommonApiURL";
import Translator from "../common/TranslationBasedOnLanguage";
import { PageHeader } from "../ui";
import { EntryField, rupees, useSuggestions, useVoice } from "../moitech/shared";
import { OTHERS_TYPES } from "../moitech/constants";

const schema = yup.object().shape({
  villageName: yup.string().required("Village name is required"),
  name: yup.string().required("Name is required"),
  initial: yup.string(),
  others: yup.number().typeError("Please enter a number").required("Others amount is required").min(0, "Amount cannot be negative"),
  othersType: yup.string().required("Please select an option"),
  amount: yup.number().typeError("Please enter a number").min(0, "Amount cannot be negative"),
  phoneNo: yup.string().matches(/^\d*$/, "Please enter a valid number"),
  remarks: yup.string(),
  othersRemark: yup.string(),
});

const TEXT_FIELDS = ["villageName", "name", "initial", "othersRemark", "remarks"];

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch (e) {
    return null;
  }
};

const emptyOthers = (user) => ({
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
  type: "O",
  returnStatus: "N",
  returnRemark: "",
  functionId: user?.functionId || 0,
  others: 0,
  weightGrams: "",
  othersType: "",
  othersRemark: "",
});

/** Non-cash moi: rings, chains, coins, pattam and other gifts. */
const OtherReceipt = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const voice = useVoice(i18n.language);
  const [formData, setFormData] = useState(() => emptyOthers(readUser()));
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastRecord, setLastRecord] = useState(null);
  const [savedCount, setSavedCount] = useState(0);
  const [autoTranslateEnabled, setAutoTranslateEnabled] = useState(false);
  const [fieldBeingTranslated, setFieldBeingTranslated] = useState(null);

  const villageNameRef = useRef(null);
  const nameRef = useRef(null);
  const initialRef = useRef(null);
  const othersRef = useRef(null);
  const amountRef = useRef(null);
  const weightRef = useRef(null);
  const tx = useTx();
  const otherRemarkRef = useRef(null);
  const phoneNoRef = useRef(null);
  const remarksRef = useRef(null);
  const saveRef = useRef(null);

  const user = readUser();
  const noFunction = !user?.functionId;

  const setField = useCallback((name, value) => {
    setFormData((f) => ({ ...f, [name]: value }));
    setErrors((er) => (er[name] ? { ...er, [name]: undefined } : er));
  }, []);
  const suggest = useSuggestions(autoTranslateEnabled, i18n.language, setField);

  useEffect(() => {
    if (!readUser()) navigate("/login");
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setField(name, value);
    if (TEXT_FIELDS.includes(name)) suggest.lookup(name, value);
    if (typeof value === "string" && value.endsWith(" ")) setFieldBeingTranslated(name);
  };

  const handleTranslation = (translatedText) => {
    if (fieldBeingTranslated) {
      setFormData((f) => ({ ...f, [fieldBeingTranslated]: translatedText }));
      setFieldBeingTranslated(null);
    }
  };

  const handleKeyDown = (e, nextRef) => {
    if (suggest.handleKey(e)) return;
    if ((e.key === "Enter" || (e.key === "Tab" && !e.shiftKey)) && nextRef?.current) {
      e.preventDefault();
      suggest.clear();
      nextRef.current.focus();
    }
  };

  const handleClear = () => {
    setFormData(emptyOthers(readUser()));
    setErrors({});
    suggest.clear();
    villageNameRef.current?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    const userDetail = readUser();
    if (!userDetail || !userDetail.functionId) {
      toast.error("Please Create Function Detail");
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
      const first = ["villageName", "name", "others", "amount", "phoneNo"].find((k) => newErrors[k]);
      ({ villageName: villageNameRef, name: nameRef, others: othersRef, amount: amountRef, phoneNo: phoneNoRef })[first]?.current?.focus();
      return;
    }

    setIsSaving(true);
    try {
      const response = await API_SERVICE.post(SAVE_NEW_TRANS_API, { ...formData, weightGrams: Number(formData.weightGrams) > 0 ? Number(formData.weightGrams) : null });
      if (response?.data?.result) {
        setLastRecord(response.data.data);
        setSavedCount((c) => c + 1);
        setFormData(emptyOthers(userDetail));
        setErrors({});
        suggest.clear();
        toast.success("Details Saved Successfully");
        setTimeout(() => villageNameRef.current?.focus(), 50);
      } else {
        toast.error(response?.data?.message || "Something went wrong on Transaction Save..pls Try Again");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "API call error");
      console.error("API call error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const fieldProps = (name, ref, nextRef, extra = {}) => ({
    name,
    value: formData[name],
    onChange: handleChange,
    onKeyDown: (e) => handleKeyDown(e, nextRef),
    onBlur: () => suggest.field === name && setTimeout(suggest.clear, 150),
    inputRef: ref,
    error: !!errors[name],
    helperText: errors[name],
    recording: voice.field === name,
    onMic: () => voice.toggle(name, (said) => setField(name, /^(others|amount|phoneNo)$/.test(name) ? said.replace(/[^\d.]/g, "") : said)),
    ...suggest.propsFor(name),
    ...extra,
  });

  const numberProps = (name, ref, nextRef, rupee) =>
    fieldProps(name, ref, nextRef, {
      type: "number",
      onFocus: (e) => e.target.select(),
      inputProps: { min: 0, inputMode: "decimal" },
      InputProps: rupee ? { startAdornment: <InputAdornment position="start">₹</InputAdornment> } : undefined,
    });

  const last = lastRecord?.transaction;

  return (
    <Box component="form" noValidate onSubmit={handleSubmit} sx={{ py: { xs: 2.5, md: 3 } }}>
      <PageHeader
        title={t("addOthers")}
        subtitle={t("addOthersHint", { defaultValue: "Record rings, chains, coins, pattam and other gifts given as moi." })}
        breadcrumbs={[{ label: t("dashboard"), to: "/dashboard" }, { label: t("addOthers") }]}
        actions={
          <Button component={RouterLink} to="/others-list" variant="outlined" startIcon={<ListAltOutlinedIcon />}>
            {t("othersList")}
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
              <Grid item xs={12} md={5}>
                <EntryField label={t("village")} placeholder={t("enter_village")} required autoFocus {...fieldProps("villageName", villageNameRef, nameRef)} />
              </Grid>
              <Grid item xs={7} md={4}>
                <EntryField label={t("name")} placeholder={t("enter_name")} required {...fieldProps("name", nameRef, initialRef)} />
              </Grid>
              <Grid item xs={5} md={3}>
                <EntryField label={t("initial")} {...fieldProps("initial", initialRef, othersRef)} />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {t("othersType")} <Typography component="span" color="error.main">*</Typography>
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  value={formData.othersType}
                  onChange={(_, v) => {
                    if (v) {
                      setField("othersType", v);
                      setTimeout(() => othersRef.current?.focus(), 0);
                    }
                  }}
                  aria-label={t("othersType")}
                  sx={{ flexWrap: "wrap", gap: 1, "& .MuiToggleButtonGroup-grouped": { border: "1px solid !important", borderColor: errors.othersType ? `${theme.palette.error.main} !important` : "divider", borderRadius: "999px !important", px: 2.25 } }}
                >
                  {OTHERS_TYPES.map((o) => (
                    <ToggleButton key={o} value={o} sx={{ textTransform: "none", fontWeight: 600, "&.Mui-selected": { bgcolor: alpha(theme.palette.secondary.main, 0.14), color: "secondary.main" } }}>
                      {t(o)}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
                {errors.othersType && <Typography color="error" variant="caption" display="block" sx={{ mt: 0.5 }}>{errors.othersType}</Typography>}
              </Grid>

              <Grid item xs={6} md={3}>
                <EntryField label={t("others")} placeholder={t("enter_amount")} required {...numberProps("others", othersRef, amountRef)} />
              </Grid>
              <Grid item xs={6} md={3}>
                <EntryField label={t("amount")} {...numberProps("amount", amountRef, otherRemarkRef, true)} />
              </Grid>
              <Grid item xs={6} md={3}>
                <EntryField label={tx("Weight in grams (optional)")} {...numberProps("weightGrams", weightRef, otherRemarkRef)}
                  helperText={tx("For the gold value")} />
              </Grid>
              <Grid item xs={12} md={3}>
                <EntryField label={t("othersRemarks")} placeholder={t("enter_description_detail")} {...fieldProps("othersRemark", otherRemarkRef, phoneNoRef)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <EntryField label={t("mobile")} placeholder={t("enter_mobile")} type="tel" inputProps={{ inputMode: "numeric" }} {...fieldProps("phoneNo", phoneNoRef, remarksRef)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <EntryField label={t("remarks")} placeholder={t("enter_remarks")} {...fieldProps("remarks", remarksRef, saveRef)} />
              </Grid>
            </Grid>

            <Translator inputText={formData[fieldBeingTranslated] || ""} onTranslated={handleTranslation} sourceLanguage="en" targetLanguage={i18n.language || "en"} />

            <Divider sx={{ my: 2.5 }} />

            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
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
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Stack spacing={2.5}>
            <Card sx={{ p: 2 }}>
              <FormControlLabel
                control={<Switch checked={autoTranslateEnabled} onChange={() => { setAutoTranslateEnabled((v) => !v); suggest.clear(); }} />}
                label={
                  <Box>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <TranslateIcon fontSize="small" color="primary" />
                      <Typography fontWeight={600}>{t("spellingSuggestions", { defaultValue: "Spelling suggestions" })}</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {t("spellingSuggestionsHint", { defaultValue: "Type in English letters and pick the word in your language." })}
                    </Typography>
                  </Box>
                }
                sx={{ alignItems: "flex-start", m: 0, gap: 1 }}
              />
            </Card>

            <AnimatePresence mode="wait">
              {lastRecord ? (
                <Card
                  key={savedCount}
                  component={motion.div}
                  initial={{ opacity: 0, x: 24, scale: 0.98 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  sx={{ p: 2.5, borderLeft: `4px solid ${theme.palette.success.main}` }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                    <CheckCircleIcon color="success" fontSize="small" />
                    <Typography fontWeight={700}>{t("lastRecordHistory")}</Typography>
                  </Stack>
                  <Typography variant="h6" fontWeight={700}>{last?.name}</Typography>
                  <Typography color="text.secondary">{last?.villageName}</Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                    <DiamondOutlinedIcon color="secondary" fontSize="small" />
                    <Typography fontWeight={700}>{[last?.others, last?.othersType ? t(last.othersType) : null].filter(Boolean).join(" × ")}</Typography>
                  </Stack>
                  <Divider sx={{ my: 2 }} />
                  {[
                    [t("totalRecord"), lastRecord.totalTrans],
                    [t("totalAmount"), rupees(lastRecord.totalAmount)],
                  ].map(([label, value]) => (
                    <Stack key={label} direction="row" justifyContent="space-between" spacing={2} sx={{ py: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">{label}</Typography>
                      <Typography fontWeight={700} sx={{ flexShrink: 0 }}>{value}</Typography>
                    </Stack>
                  ))}
                </Card>
              ) : (
                <Card key="empty" component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} sx={{ p: 2.5, bgcolor: "action.hover", boxShadow: "none" }}>
                  <Typography fontWeight={600}>{t("lastRecordHistory")}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {t("lastRecordEmpty", { defaultValue: "After you save, the last entry and running totals appear here." })}
                  </Typography>
                </Card>
              )}
            </AnimatePresence>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OtherReceipt;
