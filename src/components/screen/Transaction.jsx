import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTx } from "../../language/site";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import ClearIcon from "@mui/icons-material/Clear";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import GuestQrDialog from "../moitech/GuestQrDialog";
import VoiceEntryButton from "../moitech/VoiceEntryButton";
import TranslateIcon from "@mui/icons-material/Translate";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { API_SERVICE } from "../common/CommonMethod";
import { SAVE_NEW_TRANS_API } from "../common/CommonApiURL";
import Translator from "../common/TranslationBasedOnLanguage";
import { PageHeader } from "../ui";
import { schema } from "../moitech/receiptSchema";
import { AnimatedNumber, EntryField, rupees, speechLang } from "../moitech/shared";
import ReceiptImportDialog from "../moitech/ReceiptImportDialog";
import PayModeToggle, { useCurrentFunction } from "../moitech/PayModeToggle";

const TEXT_FIELDS = ["villageName", "name", "initial", "remarks"];
const SUGGEST_LANGS = new Set(["ta", "hi", "ml", "te", "kn"]);

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch (e) {
    return null;
  }
};

const emptyReceipt = (user) => ({
  id: 0,
  // Cash unless the helper switches to Online (guest paid the family's UPI); reset to Cash after each save.
  payMode: "Cash",
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
  type: "R",
  returnStatus: "N",
  returnRemark: "",
  functionId: user?.functionId || 0,
});

/** Moi entry: one receipt at a time, with voice input, Tamil suggestions and bulk import. */
const Transaction = () => {
  const { t, i18n } = useTranslation();
  const tx = useTx();
  const theme = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(() => emptyReceipt(readUser()));
  const [errors, setErrors] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [recordingField, setRecordingField] = useState(null);
  const recognitionRef = useRef(null);
  const [lastRecord, setLastRecord] = useState(null);
  const [savedCount, setSavedCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [autoTranslateEnabled, setAutoTranslateEnabled] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestionField, setActiveSuggestionField] = useState(null);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [showDetails, setShowDetails] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showGuestQr, setShowGuestQr] = useState(false);
  const [fieldBeingTranslated, setFieldBeingTranslated] = useState(null);
  const currentFunction = useCurrentFunction();

  const villageNameRef = useRef(null);
  const nameRef = useRef(null);
  const initialRef = useRef(null);
  const oldAmountRef = useRef(null);
  const newAmountRef = useRef(null);
  const phoneNoRef = useRef(null);
  const remarksRef = useRef(null);
  const saveRef = useRef(null);

  const user = readUser();
  const noFunction = !user?.functionId;

  useEffect(() => {
    if (!readUser()) navigate("/login");
  }, [navigate]);

  // Total = old + new, kept in step with the two amounts.
  useEffect(() => {
    setFormData((f) => ({ ...f, amount: Number(f.oldAmount) + Number(f.newAmount) }));
  }, [formData.oldAmount, formData.newAmount]);

  const clearSuggestions = () => {
    setSuggestions([]);
    setActiveSuggestionField(null);
    setSelectedSuggestionIndex(-1);
  };

  // English letters → regional script suggestions (Google Input Tools), when switched on.
  const fetchSuggestions = async (text, fieldName) => {
    const langCode = i18n?.language ? String(i18n.language).split("-")[0] : "en";
    if (!autoTranslateEnabled || !text.trim() || !SUGGEST_LANGS.has(langCode)) {
      clearSuggestions();
      return;
    }
    try {
      const url = `https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=${langCode}-t-i0-und&num=5`;
      const data = await (await fetch(url)).json();
      if (data && Array.isArray(data[1]) && data[1][0] && Array.isArray(data[1][0][1])) {
        setSuggestions(data[1][0][1]);
        setActiveSuggestionField(fieldName);
        setSelectedSuggestionIndex(-1);
      } else {
        clearSuggestions();
      }
    } catch (error) {
      clearSuggestions();
      toast.error("Failed to fetch suggestions. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined, amount: name.endsWith("Amount") ? undefined : er.amount }));
    if (TEXT_FIELDS.includes(name)) {
      if (!autoTranslateEnabled || !value.trim()) clearSuggestions();
      else {
        setActiveSuggestionField(name);
        fetchSuggestions(value, name);
      }
    }
    if (value.endsWith(" ")) setFieldBeingTranslated(name);
  };

  const handleSuggestionSelect = (suggestion) => {
    if (activeSuggestionField) setFormData((f) => ({ ...f, [activeSuggestionField]: suggestion }));
    clearSuggestions();
  };

  const handleTranslation = (translatedText) => {
    if (fieldBeingTranslated) {
      setFormData((f) => ({ ...f, [fieldBeingTranslated]: translatedText }));
      setFieldBeingTranslated(null);
    }
  };

  // Enter / Tab moves to the next field; arrows pick a suggestion.
  const handleKeyDown = (e, nextRef) => {
    if (suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedSuggestionIndex((p) => (p < suggestions.length - 1 ? p + 1 : p));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedSuggestionIndex((p) => (p > -1 ? p - 1 : p));
        return;
      }
      if (e.key === "Enter" && selectedSuggestionIndex >= 0) {
        e.preventDefault();
        handleSuggestionSelect(suggestions[selectedSuggestionIndex]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        clearSuggestions();
        return;
      }
    }
    if ((e.key === "Enter" || (e.key === "Tab" && !e.shiftKey)) && nextRef?.current) {
      e.preventDefault();
      clearSuggestions();
      nextRef.current.focus();
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    setRecordingField(null);
    recognitionRef.current?.stop();
  };

  const startRecording = (fieldName) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    recognitionRef.current?.stop();
    setIsRecording(true);
    setRecordingField(fieldName);
    const rec = new SpeechRecognition();
    rec.lang = speechLang(i18n.language);
    rec.onresult = (event) => {
      const said = event.results[0][0].transcript;
      // Amount and phone fields keep only the digits that were spoken.
      const value = /Amount$|phoneNo/.test(fieldName) ? said.replace(/[^\d]/g, "") : said;
      setFormData((f) => ({ ...f, [fieldName]: value }));
    };
    rec.onend = () => {
      setIsRecording(false);
      setRecordingField(null);
    };
    recognitionRef.current = rec;
    rec.start();
  };

  const toggleRecording = (fieldName) => (isRecording && recordingField === fieldName ? stopRecording() : startRecording(fieldName));

  const handleClear = () => {
    setFormData(emptyReceipt(readUser()));
    setErrors({});
    clearSuggestions();
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
        newErrors[err.path || "amount"] = err.message;
      });
      setErrors(newErrors);
      const first = ["villageName", "name", "oldAmount", "newAmount", "amount", "phoneNo"].find((k) => newErrors[k]);
      ({ villageName: villageNameRef, name: nameRef, oldAmount: oldAmountRef, newAmount: newAmountRef, amount: newAmountRef, phoneNo: phoneNoRef })[first]?.current?.focus();
      return;
    }

    setIsSaving(true);
    try {
      const response = await API_SERVICE.post(SAVE_NEW_TRANS_API, formData);
      if (response?.data?.result) {
        setLastRecord(response.data.data);
        setSavedCount((c) => c + 1);
        setFormData(emptyReceipt(userDetail));
        setErrors({});
        clearSuggestions();
        toast.success("Transaction Saved Successfully");
        // Ready for the next person straight away.
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
    onBlur: () => activeSuggestionField === name && setTimeout(clearSuggestions, 150),
    inputRef: ref,
    error: !!errors[name],
    helperText: errors[name],
    recording: isRecording && recordingField === name,
    onMic: () => toggleRecording(name),
    suggestions: activeSuggestionField === name ? suggestions : [],
    selectedIndex: selectedSuggestionIndex,
    onPick: handleSuggestionSelect,
    ...extra,
  });

  const amountProps = (name, ref, nextRef) =>
    fieldProps(name, ref, nextRef, {
      type: "number",
      inputProps: { min: 0, inputMode: "numeric" },
      onFocus: (e) => e.target.select(),
      InputProps: { startAdornment: <InputAdornment position="start">₹</InputAdornment> },
      error: !!errors[name] || !!errors.amount,
    });

  const last = lastRecord?.transaction;

  return (
    <Box component="form" noValidate onSubmit={handleSubmit} sx={{ py: { xs: 2.5, md: 3 } }}>
      <PageHeader
        title={t("addTransaction")}
        subtitle={t("addTransactionHint", { defaultValue: "Record each moi as it is given. Press Enter to move to the next field." })}
        breadcrumbs={[{ label: t("dashboard"), to: "/dashboard" }, { label: t("addTransaction") }]}
        actions={
          <>
            <VoiceEntryButton
              language={i18n.language}
              onFill={(v) =>
                setFormData((f) => ({
                  ...f,
                  villageName: v.villageName || f.villageName,
                  initial: v.initial || f.initial,
                  name: v.name || f.name,
                  newAmount: v.amount ?? f.newAmount,
                  oldAmount: v.oldAmount ?? f.oldAmount,
                  phoneNo: v.phoneNo || f.phoneNo,
                  payMode: v.payMode || f.payMode,
                }))
              }
            />
            <Button startIcon={<QrCode2Icon />} onClick={() => setShowGuestQr(true)}>
              {tx("Guest QR")}
            </Button>
            <Button startIcon={<UploadFileOutlinedIcon />} onClick={() => setShowImport(true)}>
              {t("import", { defaultValue: "Import" })}
            </Button>
            <Button component={RouterLink} to="/transaction-list" variant="outlined" startIcon={<ListAltOutlinedIcon />}>
              {t("transactionList")}
            </Button>
          </>
        }
      />

      {noFunction && (
        <Alert severity="warning" sx={{ mb: 2.5 }} action={<Button color="inherit" component={RouterLink} to="/function">{t("functionMaster", { defaultValue: "Add function" })}</Button>}>
          {t("createFunctionFirst", { defaultValue: "Add your function first. Receipts are saved under the selected function." })}
        </Alert>
      )}

      <Grid container spacing={2.5} alignItems="flex-start">
        <Grid item xs={12} lg={8}>
          <Card component={motion.div} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} sx={{ p: { xs: 2, md: 3 } }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <EntryField label={t("village")} placeholder={t("enter_village")} required autoFocus {...fieldProps("villageName", villageNameRef, nameRef)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <EntryField label={t("name")} placeholder={t("enter_name")} required {...fieldProps("name", nameRef, initialRef)} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <EntryField label={t("initial")} placeholder={t("enter_initial")} {...fieldProps("initial", initialRef, oldAmountRef)} />
              </Grid>
              <Grid item xs={6} sm={4}>
                <EntryField label={t("oldAmount")} placeholder={t("enter_amount")} {...amountProps("oldAmount", oldAmountRef, newAmountRef)} />
              </Grid>
              <Grid item xs={6} sm={4}>
                <EntryField label={t("newAmount")} placeholder={t("enter_amount")} {...amountProps("newAmount", newAmountRef, phoneNoRef)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <EntryField label={t("mobile")} placeholder={t("enter_mobile")} type="tel" inputProps={{ inputMode: "numeric" }} {...fieldProps("phoneNo", phoneNoRef, remarksRef)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <EntryField label={t("remarks")} placeholder={t("enter_remarks")} {...fieldProps("remarks", remarksRef, saveRef)} />
              </Grid>
            </Grid>

            {errors.amount && !errors.oldAmount && !errors.newAmount && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>{t("enterOldOrNewAmount", { defaultValue: "Enter the old or new amount." })}</Typography>
            )}

            <Translator inputText={formData[fieldBeingTranslated] || ""} onTranslated={handleTranslation} sourceLanguage="en" targetLanguage={i18n.language || "en"} />

            <Box sx={{ mt: 2 }}>
              <PayModeToggle value={formData.payMode} fn={currentFunction} onChange={(m) => setFormData((f) => ({ ...f, payMode: m }))} />
            </Box>

            <Divider sx={{ my: 2.5 }} />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }} justifyContent="space-between">
              <Box sx={{ px: 2, py: 1.25, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.08), minWidth: 180 }}>
                <Typography variant="caption" color="text.secondary">{t("total")}</Typography>
                <Typography variant="h4" component="p" fontWeight={800} color="primary.main" sx={{ fontVariantNumeric: "tabular-nums" }}>
                  <AnimatedNumber value={formData.amount} />
                </Typography>
              </Box>
              <Stack direction="row" spacing={1.5}>
                <Button type="button" onClick={handleClear} startIcon={<ClearIcon />} disabled={isSaving}>
                  {t("clearButton")}
                </Button>
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
          <Stack spacing={2.5}>
            <Card sx={{ p: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={autoTranslateEnabled}
                    onChange={() => {
                      setAutoTranslateEnabled((v) => !v);
                      clearSuggestions();
                    }}
                  />
                }
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
                  <Typography variant="h5" fontWeight={800} sx={{ mt: 1 }}>{rupees(last?.amount)}</Typography>
                  <Divider sx={{ my: 2 }} />
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography variant="overline" color="text.secondary">{t("runningTotals", { defaultValue: "Running totals" })}</Typography>
                    <Tooltip title={showDetails ? t("hide") : t("show")}>
                      <IconButton size="small" onClick={() => setShowDetails((s) => !s)} aria-label={showDetails ? t("hide") : t("show")}>
                        {showDetails ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </Stack>
                  {[
                    [t("totalRecord"), lastRecord.totalTrans],
                    [t("totalAmount"), rupees(lastRecord.totalAmount)],
                  ].map(([label, value]) => (
                    <Stack key={label} direction="row" justifyContent="space-between" spacing={2} sx={{ py: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">{label}</Typography>
                      <Typography fontWeight={700} sx={{ fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{showDetails ? value : "•••••"}</Typography>
                    </Stack>
                  ))}
                  {savedCount > 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
                      {t("savedThisSession", { defaultValue: "{{count}} saved on this screen", count: savedCount })}
                    </Typography>
                  )}
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

      <GuestQrDialog open={showGuestQr} onClose={() => setShowGuestQr(false)} />
      <ReceiptImportDialog open={showImport} onClose={() => setShowImport(false)} schema={schema} />
    </Box>
  );
};

export default Transaction;
