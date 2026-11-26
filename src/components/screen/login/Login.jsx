import { useState, useEffect } from "react";
import AndroidIcon from '@mui/icons-material/Android';
import { useNavigate, useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { safeNext } from "./safeNext";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import PhoneIphoneOutlinedIcon from "@mui/icons-material/PhoneIphoneOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LoginIcon from "@mui/icons-material/Login";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { loginSchema } from "../../../validations/ValidationSchema";
import { LOGIN_API, LOGIN_USER_ACCOUNT_CHECK_API } from "../../common/CommonApiURL";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { currentUser } from "../../../utils/session";
import AppHeader from "../../common/AppHeader";
import SignUpChooser from "../../common/SignUpChooser";

const Login = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    userType: "AU",
    userTypeDescription: "",
  });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState("");
  // Sent here because the login expired: a short note (not an error), gone once the user types.
  const [params] = useSearchParams();
  const [sessionNote, setSessionNote] = useState(params.get("session") === "expired");
  const [loading, setLoading] = useState(false);
  const [userTypes, setUserTypes] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const stored = JSON.parse(localStorage.getItem("user"));
    if (stored) {
      if (!currentUser()) {
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        // Already signed in: go straight to the dashboard instead of asking again.
        navigate(safeNext(params.get("next")), { replace: true });
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // An old message goes away as soon as the user changes the mobile number or password.
    if (loginError) setLoginError("");
    if (sessionNote) setSessionNote(false);
    if (errors.validation) setErrors({});
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const handleUsernameBlur = async () => {
    // Only check a complete 10 digit number; nothing to say while it is empty or still being typed.
    if (!/^\d{10}$/.test(String(formData.username || "").trim())) return;
    try {
      setLoginError("");
      const response = await axios.get(
        `${LOGIN_USER_ACCOUNT_CHECK_API}userName=${formData.username}&appName=MOI`
      );
      const data = response.data;

      if (data.result && data.data.length > 0) {
        setFormData({
          ...formData,
          userType: data.data[0].userType,
          userTypeDescription: data.data[0].userTypeDescription,
        });

        const uniqueUserTypes = [
          ...new Set(data.data.map((item) => item.userType)),
        ];

        const userTypesWithDescriptions = uniqueUserTypes.map((userType) => {
          const userTypeInfo = data.data.find(
            (item) => item.userType === userType
          );
          return {
            userType: userTypeInfo.userType,
            userTypeDescription: userTypeInfo.userTypeDescription,
          };
        });

        if (uniqueUserTypes.length === 1) {
          setFormData({
            ...formData,
            userType: userTypesWithDescriptions[0].userType,
            userTypeDescription:
              userTypesWithDescriptions[0].userTypeDescription,
          });
          setUserTypes([]);
        } else {
          setUserTypes(userTypesWithDescriptions);
        }
      } else {
        setLoginError(t("no_user_found"));
        setUserTypes([]);
      }
    } catch (error) {
      setLoginError(t("an_error_occurred"));
      setUserTypes([]);
    }
  };

  const handleUserTypeChange = (e) => {
    const selectedUserType = userTypes.find(
      (type) => type.userType === e.target.value
    );
    setFormData({
      ...formData,
      userType: selectedUserType.userType,
      userTypeDescription: selectedUserType.userTypeDescription,
    });
  };

  // The API says "Invalid User" for a wrong mobile number or password.
  const friendly = (message) =>
    /^invalid user$/i.test(String(message || "").trim())
      ? t("wrong_mobile_or_password", { defaultValue: "Wrong mobile number or password. Please check and try again." })
      : message;

  const userLogin = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const isValid = await loginSchema.isValid(formData);
      if (isValid) {
        const response = await axios.post(LOGIN_API, formData);
        const data = response.data;

        if (data.result) {
          const decodedToken = jwtDecode(data.data.token);
          const currentTime = Date.now() / 1000;

          if (decodedToken.exp > currentTime) {
            localStorage.setItem("user", JSON.stringify(data.data));
            navigate(safeNext(params.get("next")), { replace: true });
          } else {
            setLoginError(t("session_expired"));
          }
        } else {
          setLoginError(friendly(data.message));
        }
      } else {
        setErrors({ validation: t("please_enter_username_password") });
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setLoginError(friendly(error.response.data.message));
      } else {
        setLoginError(t("an_error_occurred"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "background.default" }}>
      <AppHeader />
      <Container maxWidth="lg" sx={{ flex: 1, display: "flex", alignItems: "center", py: { xs: 4, md: 8 } }}>
        <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">
          <Grid item xs={12} md={6} sx={{ display: { xs: "none", md: "block" } }}>
            <Box sx={{ background: "var(--ms-gradient)", color: "#fff", borderRadius: 5, p: 6 }}>
              <Typography variant="h2" component="h2" sx={{ color: "#fff" }}>
                {t("welcome_back")}
              </Typography>
              <Typography sx={{ mt: 2, opacity: 0.9, fontSize: 17 }}>{t("login_illustration_text")}</Typography>
              <Stack spacing={1.5} sx={{ mt: 4 }}>
                {["DigiMoi", "Mahal Management", "Reports in PDF and Excel"].map((x) => (
                  <Stack key={x} direction="row" spacing={1.25} alignItems="center">
                    <CheckCircleIcon sx={{ fontSize: 20, opacity: 0.9 }} />
                    <Typography>{x}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ p: { xs: 3, sm: 5 }, maxWidth: 480, mx: "auto", boxShadow: "var(--ms-shadow-md)" }}>
              <Typography variant="h3" component="h1">
                {t("sign_in")}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
                {t("login_security_note")}
              </Typography>

              {sessionNote && !loginError && (
                <Alert severity="info" sx={{ mb: 2.5 }}>
                  {t("session_ended_sign_in", { defaultValue: "Your session has ended. Please sign in again." })}
                </Alert>
              )}
              {/* Only when there is a real message to show. */}
              {Boolean((typeof loginError === "string" && loginError.trim()) || errors.validation) && (
                <Alert severity="error" sx={{ mb: 2.5 }}>
                  {loginError || errors.validation}
                </Alert>
              )}

              <Box component="form" onSubmit={userLogin} noValidate>
                <Stack spacing={2.5}>
                  <TextField
                    label={t("mobile_number")}
                    name="username"
                    placeholder={t("enter_mobile_number")}
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={handleUsernameBlur}
                    autoComplete="username"
                    inputProps={{ inputMode: "tel" }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIphoneOutlinedIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    label={t("password")}
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("enter_password")}
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon fontSize="small" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={togglePasswordVisibility}
                            edge="end"
                            size="small"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  {userTypes.length > 1 && (
                    <TextField select label={t("userType")} name="userType" value={formData.userType} onChange={handleUserTypeChange}>
                      {userTypes.map((type, index) => (
                        <MenuItem key={index} value={type.userType}>
                          {type.userTypeDescription}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <LoginIcon />}
                  >
                    {t("sign_in")}
                  </Button>
                </Stack>
              </Box>

              <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
                <MuiLink component={Link} to="/forgot-password" underline="hover" variant="body2">
                  {t("forgot_password")}
                </MuiLink>
                {/* Each product has its own sign-up: Moitech, Mahal Management or School. */}
                <MuiLink component="button" type="button" onClick={() => setSignUpOpen(true)} underline="hover" variant="body2" fontWeight={600}>
                  {t("sign_up")}
                </MuiLink>
              </Stack>
              <SignUpChooser open={signUpOpen} onClose={() => setSignUpOpen(false)} />
              <MuiLink component={Link} to="/download-app" underline="hover" variant="body2" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, mt: 2.5, color: '#10b981' }}>
                <AndroidIcon fontSize="small" /> {t("getAndroidApp", { defaultValue: "Get the Android app" })}
              </MuiLink>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Login;