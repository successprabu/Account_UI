import { useTx } from '../../language/site';
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import * as yup from "yup";
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Collapse,
  Grid,
  IconButton,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import ClearIcon from "@mui/icons-material/Clear";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CelebrationOutlinedIcon from "@mui/icons-material/CelebrationOutlined";
import { API_SERVICE } from "../common/CommonMethod";
import { SAVE_FUNCTION_API, LIST_FUNCTION_API } from "../common/CommonApiURL";
import Translator from "../common/TranslationBasedOnLanguage";
import { EmptyState, PageHeader } from "../ui";
import { EntryField, useVoice } from "../moitech/shared";

const schema = yup.object().shape({
  functionName: yup.string().required("Please enter the function name"),
  functionDate: yup.string().required("Please choose the date"),
  mahalName: yup.string().required("Please enter the hall name"),
  funPersionNames: yup.string().required("Please enter the names"),
  remarks: yup.string(),
  funMessage: yup.string(),
});

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch (e) {
    return null;
  }
};

/** The function new receipts and expenses are saved under (kept with the signed-in user). */
const setCurrentFunction = (id) => {
  const u = readUser();
  if (!u) return;
  localStorage.setItem("user", JSON.stringify({ ...u, functionId: id }));
};

// The API sends dates like "2026-12-12T00:00:00"; the date field needs "2026-12-12".
const toInputDate = (v) => (v ? String(v).slice(0, 10) : "");
const showDate = (v) => {
  if (!v) return "";
  const d = new Date(`${toInputDate(v)}T00:00:00`);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
};

const emptyFunction = (user) => ({
  id: 0,
  customerId: user?.customerID || 0,
  functionName: "",
  functionDate: "",
  mahalName: "",
  funPersionNames: "",
  remarks: "",
  funMessage: "",
  upiId: "",
  upiName: "",
  createdBy: user ? String(user.id) : "SYSTEM",
  createdDt: new Date().toISOString(),
  updatedBy: user ? String(user.id) : "SYSTEM",
  updatedDt: new Date().toISOString(),
  isActive: true,
});

/** Functions (events) of the account: add, edit, and choose which one entries are saved under. */
const FunctionWithList = () => {
  const tx = useTx();
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const voice = useVoice(i18n.language);
  const [formData, setFormData] = useState(() => emptyFunction(readUser()));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [functionList, setFunctionList] = useState([]);
  const [currentId, setCurrentId] = useState(() => readUser()?.functionId || 0);
  const [fieldBeingTranslated, setFieldBeingTranslated] = useState(null);
  const formRef = useRef(null);

  const functionNameRef = useRef(null);
  const functionDateRef = useRef(null);
  const mahalNameRef = useRef(null);
  const funPersionNamesRef = useRef(null);
  const remarksRef = useRef(null);
  const funMessageRef = useRef(null);
  const saveRef = useRef(null);

  const fetchFunctionList = useCallback(async () => {
    const u = readUser();
    if (!u) return;
    setLoading(true);
    try {
      const response = await API_SERVICE.get(LIST_FUNCTION_API, { id: null, customer_id: u.customerID, function_name: "", current_page: 1, page_size: 50 });
      setFunctionList(response?.data?.data?.functions || []);
    } catch (error) {
      console.error("Error fetching Function list:", error);
      toast.error("Error fetching Function list");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!readUser()) navigate("/login");
    else fetchFunctionList();
  }, [navigate, fetchFunctionList]);

  const setField = (name, value) => {
    setFormData((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setField(name, value);
    if (value.endsWith(" ")) setFieldBeingTranslated(name);
  };

  const handleKeyDown = (e, nextRef) => {
    // Multi-line fields keep Enter for new lines.
    if (e.target.tagName === "TEXTAREA" && e.key === "Enter") return;
    if ((e.key === "Enter" || (e.key === "Tab" && !e.shiftKey)) && nextRef?.current) {
      e.preventDefault();
      nextRef.current.focus();
    }
  };

  const handleClear = () => {
    setFormData(emptyFunction(readUser()));
    setErrors({});
  };

  const makeCurrent = (fn) => {
    setCurrentFunction(fn.id);
    setCurrentId(fn.id);
    toast.success(t("functionSelected", { defaultValue: "New entries will be saved under {{name}}", name: fn.functionName }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    try {
      await schema.validate(formData, { abortEarly: false });
    } catch (validationErrors) {
      const newErrors = {};
      (validationErrors.inner || []).forEach((err) => {
        newErrors[err.path] = err.message;
      });
      setErrors(newErrors);
      const first = ["functionName", "functionDate", "mahalName", "funPersionNames"].find((k) => newErrors[k]);
      ({ functionName: functionNameRef, functionDate: functionDateRef, mahalName: mahalNameRef, funPersionNames: funPersionNamesRef })[first]?.current?.focus();
      return;
    }
    setSaving(true);
    try {
      const response = await API_SERVICE.post(SAVE_FUNCTION_API, formData);
      if (response?.data?.result) {
        const savedId = response.data.data?.id;
        // The first function becomes the current one, so receipts can be saved straight away.
        if (savedId && !readUser()?.functionId) {
          setCurrentFunction(savedId);
          setCurrentId(savedId);
        }
        handleClear();
        toast.success(formData.id ? t("functionUpdated", { defaultValue: "Function updated" }) : "Function Saved Successfully");
        fetchFunctionList();
      } else {
        toast.error(response?.data?.message || "Something went wrong on Function Save..pls Try Again");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "API call error");
      console.error("API call error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (fn) => {
    setFormData({
      ...emptyFunction(readUser()),
      ...fn,
      functionDate: toInputDate(fn.functionDate),
      remarks: fn.remarks || "",
      funMessage: fn.funMessage || "",
    });
    setErrors({});
    formRef.current?.scrollIntoView?.({ behavior: "smooth", block: "start" });
    setTimeout(() => functionNameRef.current?.focus(), 300);
  };

  const field = (name, label, ref, nextRef, extra = {}) => (
    <EntryField
      label={label}
      name={name}
      value={formData[name] || ""}
      onChange={handleChange}
      onKeyDown={(e) => handleKeyDown(e, nextRef)}
      inputRef={ref}
      error={!!errors[name]}
      helperText={errors[name]}
      recording={voice.field === name}
      onMic={() => voice.toggle(name, (said) => setField(name, said))}
      {...extra}
    />
  );

  const editing = formData.id > 0;

  return (
    <Box sx={{ py: { xs: 2.5, md: 3 } }}>
      <PageHeader
        title={t("functionCreate")}
        subtitle={t("functionCreateHint", { defaultValue: "Each function (wedding, ear piercing, house warming…) keeps its own receipts, expenses and reports." })}
        breadcrumbs={[{ label: t("dashboard"), to: "/dashboard" }, { label: t("functionCreate") }]}
      />

      <Card ref={formRef} component="form" noValidate onSubmit={handleSubmit} sx={{ p: { xs: 2, md: 3 }, mb: 3, scrollMarginTop: 90, outline: editing ? `2px solid ${alpha(theme.palette.primary.main, 0.5)}` : "none" }}>
        <Collapse in={editing}>
          <Chip color="primary" icon={<EditOutlinedIcon />} label={t("editingFunction", { defaultValue: "Editing {{name}}", name: formData.functionName || "" })} sx={{ mb: 2 }} />
        </Collapse>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>{field("functionName", t("functionName"), functionNameRef, functionDateRef, { required: true, placeholder: t("enter_function_name") })}</Grid>
          <Grid item xs={12} sm={6} md={3}>
            {field("functionDate", t("functionDate"), functionDateRef, mahalNameRef, { required: true, type: "date", InputLabelProps: { shrink: true }, onMic: undefined })}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>{field("mahalName", t("mahalName"), mahalNameRef, funPersionNamesRef, { required: true, placeholder: t("enter_mahal_name") })}</Grid>
          <Grid item xs={12}>{field("funPersionNames", t("funPersionNames"), funPersionNamesRef, remarksRef, { required: true, placeholder: t("enter_fun_persion_names") })}</Grid>
          <Grid item xs={12} md={6}>{field("remarks", t("remarks"), remarksRef, funMessageRef, { multiline: true, minRows: 2, placeholder: t("enter_remarks") })}</Grid>
          <Grid item xs={12} md={6}>{field("funMessage", t("funMessage"), funMessageRef, saveRef, { multiline: true, minRows: 2, placeholder: t("enter_fun_message") })}</Grid>
          <Grid item xs={12} sm={6}>
            {field("upiId", tx("Family UPI ID for online moi (optional)"), null, saveRef, { onMic: undefined, placeholder: "ravi@okicici", inputProps: { autoCapitalize: "none", spellCheck: false } })}
          </Grid>
          <Grid item xs={12} sm={6}>{field("upiName", tx("Name shown in UPI apps (optional)"), null, saveRef, { onMic: undefined })}</Grid>
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary">{tx("Guests can scan a QR on the receipt screen to give moi straight to this UPI ID. Mark those receipts as Online.")}</Typography>
          </Grid>
        </Grid>
        <Translator
          inputText={formData[fieldBeingTranslated] || ""}
          onTranslated={(text) => {
            if (fieldBeingTranslated) setField(fieldBeingTranslated, text);
            setFieldBeingTranslated(null);
          }}
          sourceLanguage="en"
          targetLanguage={i18n.language || "en"}
        />
        <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 2.5 }}>
          <Button onClick={handleClear} startIcon={<ClearIcon />} disabled={saving}>{editing ? t("cancel") : t("clearButton")}</Button>
          <Button
            ref={saveRef}
            type="submit"
            variant="contained"
            size="large"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveOutlinedIcon />}
            sx={{ px: 4 }}
          >
            {t("save")}
          </Button>
        </Stack>
      </Card>

      <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>{t("functionList", { defaultValue: "Your functions" })}</Typography>
      {loading && functionList.length === 0 ? (
        <Grid container spacing={2}>{[0, 1, 2].map((i) => <Grid item xs={12} md={6} lg={4} key={i}><Skeleton variant="rounded" height={170} /></Grid>)}</Grid>
      ) : functionList.length === 0 ? (
        <Card>
          <EmptyState icon={<CelebrationOutlinedIcon />} title={t("noFunctionsYet", { defaultValue: "No functions yet" })} description={t("noFunctionsHint", { defaultValue: "Add your first function above. Receipts and expenses are saved under it." })} />
        </Card>
      ) : (
        <Grid container spacing={2}>
          <AnimatePresence>
            {functionList.map((fn, i) => {
              const current = fn.id === currentId;
              return (
                <Grid item xs={12} md={6} lg={4} key={fn.id}>
                  <Card
                    component={motion.div}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 8) * 0.04 } }}
                    whileHover={{ y: -3 }}
                    sx={{ p: 2.25, height: "100%", display: "flex", flexDirection: "column", border: 2, borderColor: current ? "success.main" : "transparent" }}
                  >
                    <Stack direction="row" spacing={1} alignItems="flex-start" justifyContent="space-between">
                      <Typography variant="h6" fontWeight={700} sx={{ minWidth: 0, overflowWrap: "anywhere" }}>{fn.functionName}</Typography>
                      <Tooltip title={t("edit")}>
                        <IconButton size="small" color="primary" onClick={() => handleEdit(fn)} aria-label={`${t("edit")} ${fn.functionName}`}><EditOutlinedIcon fontSize="small" /></IconButton>
                      </Tooltip>
                    </Stack>
                    <Stack spacing={0.5} sx={{ mt: 1, color: "text.secondary", flex: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center"><EventOutlinedIcon sx={{ fontSize: 18 }} /><Typography variant="body2">{showDate(fn.functionDate)}</Typography></Stack>
                      {fn.mahalName && <Stack direction="row" spacing={1} alignItems="center"><PlaceOutlinedIcon sx={{ fontSize: 18 }} /><Typography variant="body2">{fn.mahalName}</Typography></Stack>}
                      {fn.funPersionNames && <Stack direction="row" spacing={1} alignItems="center"><PeopleOutlineIcon sx={{ fontSize: 18 }} /><Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>{fn.funPersionNames}</Typography></Stack>}
                      {fn.funMessage && <Typography variant="body2" sx={{ fontStyle: "italic", mt: 0.5 }}>“{fn.funMessage}”</Typography>}
                    </Stack>
                    <Box sx={{ mt: 1.5 }}>
                      {current ? (
                        <Chip color="success" icon={<CheckCircleIcon />} label={t("currentFunction", { defaultValue: "Entries are saved here" })} />
                      ) : (
                        <Button size="small" variant="outlined" onClick={() => makeCurrent(fn)}>{t("useThisFunction", { defaultValue: "Use this function" })}</Button>
                      )}
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </AnimatePresence>
        </Grid>
      )}
    </Box>
  );
};

export default FunctionWithList;
