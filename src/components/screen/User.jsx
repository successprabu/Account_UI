import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import * as yup from "yup";
import {
  Avatar,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Skeleton,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import ClearIcon from "@mui/icons-material/Clear";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { API_SERVICE } from "../common/CommonMethod";
import { LIST_CLIENT_API, SAVE_NEW_USER_API, UPDATE_CUSTOMER_API } from "../common/CommonApiURL";
import { EmptyState, PageHeader, StatusChip } from "../ui";
import { EntryField, useVoice } from "../moitech/shared";

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch (e) {
    return null;
  }
};

// Every user added here belongs to the signed-in account and starts active.
const emptyUser = (owner) => ({
  id: 0,
  customerId: owner?.customerID || 0,
  name: "",
  primary_phone: "",
  secondary_phone: "",
  country: "",
  state: "",
  district: "",
  address_line1: "",
  address_line2: "",
  is_primary_phone_whatsup: false,
  is_secondary_phone_whatsup: false,
  pincode: 0,
  email: "",
  createdBy: owner ? String(owner.id) : "SYSTEM",
  createdDt: new Date().toISOString(),
  updatedBy: owner ? String(owner.id) : "SYSTEM",
  updatedDt: new Date().toISOString(),
  isActive: true,
  password: "",
  conpassword: "",
  userType: "NU",
});

/** Users (counter staff) of the account who record moi: add, edit, activate or deactivate. */
const User = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const voice = useVoice(i18n.language);
  const [formData, setFormData] = useState(() => emptyUser(readUser()));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userList, setUserList] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const formRef = useRef(null);
  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const passwordRef = useRef(null);
  const conpasswordRef = useRef(null);
  const emailRef = useRef(null);
  const saveRef = useRef(null);

  const schema = yup.object().shape({
    name: yup.string().required(t("required")),
    primary_phone: yup.string().required(t("required")).matches(/^\d{10}$/, t("validation_phone")),
    password: yup.string().required(t("required")).min(8, t("passwordMin8", { defaultValue: "At least 8 characters" })),
    conpassword: yup.string().oneOf([yup.ref("password"), null], t("passwordMatch")).required(t("required")),
    email: yup.string().email(t("invalidEmail")).nullable(),
  });

  const fetchUserList = useCallback(async () => {
    const u = readUser();
    if (!u) return;
    setLoading(true);
    try {
      const response = await API_SERVICE.get(LIST_CLIENT_API, { id: null, customer_id: u.customerID, function_name: "", current_page: 1, page_size: 50 });
      setUserList(response?.data?.data?.customers || []);
    } catch (error) {
      console.error("Error fetching user list:", error);
      toast.error(t("loadFailed", { defaultValue: "Could not load the list. Check your connection and try again." }));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!readUser()) navigate("/login");
    else fetchUserList();
  }, [navigate, fetchUserList]);

  const setField = (name, value) => {
    setFormData((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const handleKeyDown = (e, nextRef) => {
    if ((e.key === "Enter" || (e.key === "Tab" && !e.shiftKey)) && nextRef?.current) {
      e.preventDefault();
      nextRef.current.focus();
    }
  };

  const handleClear = () => {
    setFormData(emptyUser(readUser()));
    setErrors({});
    setShowPassword(false);
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
      const first = ["name", "primary_phone", "password", "conpassword", "email"].find((k) => newErrors[k]);
      ({ name: nameRef, primary_phone: phoneRef, password: passwordRef, conpassword: conpasswordRef, email: emailRef })[first]?.current?.focus();
      return;
    }
    setSaving(true);
    const editing = formData.id > 0;
    try {
      const owner = readUser();
      const payload = { ...formData, updatedBy: String(owner?.id ?? "SYSTEM"), updatedDt: new Date().toISOString() };
      const response = await API_SERVICE.post(editing ? UPDATE_CUSTOMER_API : SAVE_NEW_USER_API, payload);
      if (response?.data?.result === false) {
        toast.error(response.data.message || "Something went wrong on User Save..pls Try Again");
      } else {
        toast.success(editing ? "User Updated Successfully" : "User Saved Successfully");
        handleClear();
        fetchUserList();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "API call error");
      console.error("API call error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (u) => {
    setFormData({
      ...emptyUser(readUser()),
      ...u,
      email: u.email || "",
      password: u.password || "",
      conpassword: u.password || "",
    });
    setErrors({});
    formRef.current?.scrollIntoView?.({ behavior: "smooth", block: "start" });
    setTimeout(() => nameRef.current?.focus(), 300);
  };

  const editing = formData.id > 0;
  const passwordAdornment = (
    <InputAdornment position="end">
      <Tooltip title={showPassword ? t("hide") : t("show")}>
        <IconButton onClick={() => setShowPassword((s) => !s)} edge="end" aria-label={showPassword ? t("hide") : t("show")}>
          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
        </IconButton>
      </Tooltip>
    </InputAdornment>
  );

  return (
    <Box sx={{ py: { xs: 2.5, md: 3 } }}>
      <PageHeader
        title={t("userCreate")}
        subtitle={t("userCreateHint", { defaultValue: "People who record moi at the counter. They sign in with their mobile number and password." })}
        breadcrumbs={[{ label: t("dashboard"), to: "/dashboard" }, { label: t("userCreate") }]}
      />

      <Card ref={formRef} component="form" noValidate onSubmit={handleSubmit} sx={{ p: { xs: 2, md: 3 }, mb: 3, scrollMarginTop: 90, outline: editing ? `2px solid ${alpha(theme.palette.primary.main, 0.5)}` : "none" }}>
        <Collapse in={editing}>
          <Chip color="primary" icon={<EditOutlinedIcon />} label={t("editingUser", { defaultValue: "Editing {{name}}", name: formData.name || "" })} sx={{ mb: 2 }} />
        </Collapse>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <EntryField
              required
              autoFocus
              label={t("name")}
              placeholder={t("enter_name")}
              value={formData.name}
              onChange={(e) => setField("name", e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, phoneRef)}
              inputRef={nameRef}
              error={!!errors.name}
              helperText={errors.name}
              recording={voice.field === "name"}
              onMic={() => voice.toggle("name", (said) => setField("name", said))}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <EntryField
              required
              label={t("primary_phone")}
              placeholder={t("enter_primary_phone")}
              type="tel"
              value={formData.primary_phone}
              onChange={(e) => setField("primary_phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
              onKeyDown={(e) => handleKeyDown(e, passwordRef)}
              inputRef={phoneRef}
              error={!!errors.primary_phone}
              helperText={errors.primary_phone || t("signsInWithThis", { defaultValue: "They sign in with this number" })}
              inputProps={{ inputMode: "numeric" }}
              InputProps={{ startAdornment: <InputAdornment position="start">+91</InputAdornment> }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <EntryField
              required
              label={t("password")}
              placeholder={t("enter_password")}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={formData.password}
              onChange={(e) => setField("password", e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, conpasswordRef)}
              inputRef={passwordRef}
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{ endAdornment: passwordAdornment }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <EntryField
              required
              label={t("confirm_password")}
              placeholder={t("enter_confirm_password")}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={formData.conpassword}
              onChange={(e) => setField("conpassword", e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, emailRef)}
              inputRef={conpasswordRef}
              error={!!errors.conpassword}
              helperText={errors.conpassword}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <EntryField
              label={t("email")}
              placeholder={t("enter_email")}
              type="email"
              value={formData.email}
              onChange={(e) => setField("email", e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, saveRef)}
              inputRef={emailRef}
              error={!!errors.email}
              helperText={errors.email}
            />
          </Grid>
          <Grid item xs={12}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 0, sm: 3 }}>
              <FormControlLabel
                control={<Checkbox checked={!!formData.is_primary_phone_whatsup} onChange={(e) => setField("is_primary_phone_whatsup", e.target.checked)} />}
                label={t("is_primary_phone_whatsup")}
              />
              <FormControlLabel control={<Switch checked={!!formData.isActive} onChange={(e) => setField("isActive", e.target.checked)} />} label={t("isActive")} />
            </Stack>
          </Grid>
        </Grid>
        <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 1.5 }}>
          <Button onClick={handleClear} startIcon={<ClearIcon />} disabled={saving}>{editing ? t("cancel") : t("clearButton")}</Button>
          <Button ref={saveRef} type="submit" variant="contained" size="large" disabled={saving} startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveOutlinedIcon />} sx={{ px: 4 }}>
            {t("save")}
          </Button>
        </Stack>
      </Card>

      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Typography variant="h6" fontWeight={700}>{t("user_list")}</Typography>
        {userList.length > 0 && <Chip size="small" label={userList.length} />}
      </Stack>
      {loading && userList.length === 0 ? (
        <Grid container spacing={2}>{[0, 1, 2].map((i) => <Grid item xs={12} sm={6} lg={4} key={i}><Skeleton variant="rounded" height={110} /></Grid>)}</Grid>
      ) : userList.length === 0 ? (
        <Card>
          <EmptyState icon={<GroupOutlinedIcon />} title={t("noUsersYet", { defaultValue: "No users yet" })} description={t("noUsersHint", { defaultValue: "Add the people who will record moi at your function." })} />
        </Card>
      ) : (
        <Grid container spacing={2}>
          <AnimatePresence>
            {userList.map((u, i) => (
              <Grid item xs={12} sm={6} lg={4} key={u.id}>
                <Card
                  component={motion.div}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 8) * 0.04 } }}
                  whileHover={{ y: -3 }}
                  sx={{ p: 2, opacity: u.isActive ? 1 : 0.7 }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.14), color: "primary.main", fontWeight: 700 }}>
                      {(u.name || "?").trim().charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography fontWeight={700} noWrap>{u.name}</Typography>
                      <Stack direction="row" spacing={0.5} alignItems="center" color="text.secondary">
                        {u.is_primary_phone_whatsup ? <WhatsAppIcon sx={{ fontSize: 16, color: "#25D366" }} /> : <PhoneOutlinedIcon sx={{ fontSize: 16 }} />}
                        <Typography variant="body2">{u.primary_phone}</Typography>
                      </Stack>
                    </Box>
                    <Tooltip title={t("edit")}>
                      <IconButton color="primary" onClick={() => handleEdit(u)} aria-label={`${t("edit")} ${u.name}`}><EditOutlinedIcon /></IconButton>
                    </Tooltip>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                    <StatusChip label={u.isActive ? t("active") : t("inactive", { defaultValue: "Inactive" })} tone={u.isActive ? "success" : "neutral"} />
                    {u.userType === "AU" && <Chip size="small" label={t("admin", { defaultValue: "Admin" })} />}
                  </Stack>
                </Card>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>
      )}
    </Box>
  );
};

export default User;
