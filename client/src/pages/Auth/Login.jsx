import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Sun,
  Moon,
  GraduationCap,
  Eye,
  EyeOff,
  ChevronLeft,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useDispatch } from "react-redux";
import {
  loginAdmissionPoint,
  loginUser,
  forgotPasswordAPI,
  verifyOtpAPI,
  resetPasswordAPI,
} from "../../api/auth.api";
import { showAlert } from "../../redux/alertSlice";
import { useTheme } from "../../components/global/ThemeProvider";

import Logo from "../../assets/logo.png";
import { setUser } from "../../redux/userSlice";

// Utility for class merging
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const BackgroundAnimation = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none bg-background transition-colors duration-500">
    <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 dark:bg-purple-600/10 blur-[120px]" />
    <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 dark:bg-blue-600/10 blur-[100px]" />
    <div className="absolute top-[20%] left-[60%] w-[30%] h-[30%] rounded-full bg-pink-500/10 dark:bg-pink-500/5 blur-[80px]" />
  </div>
);

const InputField = ({ icon: Icon, type, placeholder, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="relative group">
      <div
        className={cn(
          "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-300",
          isFocused
            ? "text-purple-500 dark:text-purple-400"
            : "text-muted-foreground",
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <input
        type={inputType}
        className={cn(
          "w-full pl-10 pr-10 py-3 bg-muted/30 dark:bg-zinc-900/50 border rounded-xl outline-none transition-all duration-300",
          "text-foreground placeholder-muted-foreground",
          isFocused
            ? "border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/20"
            : "border-border hover:border-muted-foreground/30",
        )}
        placeholder={placeholder}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );
};

const OtpInput = ({ value, onChange, length = 6, color = "purple" }) => {
  const inputs = React.useRef([]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;

    const newOtp = value.split("");
    newOtp[index] = val.substring(val.length - 1);
    const combinedOtp = newOtp.join("");
    onChange(combinedOtp);

    if (val && index < length - 1) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const data = e.clipboardData.getData("text").substring(0, length);
    if (isNaN(data)) return;
    onChange(data);
    if (data.length === length) {
      inputs.current[length - 1].focus();
    }
  };

  return (
    <div className="flex justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className={cn(
            "w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border bg-muted/30 dark:bg-zinc-900/50 outline-none transition-all duration-300",
            value[i]
              ? color === "purple"
                ? "border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/20"
                : "border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/20"
              : "border-border hover:border-muted-foreground/30",
          )}
        />
      ))}
    </div>
  );
};

const UserLoginForm = (props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const responseData = await loginUser(formData);

      dispatch(
        showAlert({
          type: "success",
          message: responseData.message || "Login Successful!",
        }),
      );

      const user = { ...responseData.data, type: "admin" };
      dispatch(setUser(user));

      navigate("/admin-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="space-y-1 mb-6 text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground/90 to-foreground/70 bg-clip-text text-transparent">
          Welcome Back
        </h2>
        <p className="text-muted-foreground text-sm">
          Sign in to your student/user account
        </p>
      </div>

      {error && <div className="text-red-500 text-sm text-center">{error}</div>}

      <InputField
        icon={Mail}
        type="email"
        placeholder="Email Address"
        required
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <InputField
        icon={Lock}
        type="password"
        placeholder="Password"
        required
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />

      <div className="flex items-center justify-between mt-2">
        <label className="flex items-center space-x-2 cursor-pointer group">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-input bg-muted/50 text-purple-600 focus:ring-purple-500/20"
            checked={formData.rememberMe}
            onChange={(e) =>
              setFormData({ ...formData, rememberMe: e.target.checked })
            }
          />
          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            Remember me
          </span>
        </label>
        <button
          type="button"
          onClick={props.onForgotPassword}
          className="text-sm text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors text-right"
        >
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full relative group mt-6 overflow-hidden rounded-xl bg-purple-600 text-white font-medium py-3 px-4 transition-all hover:bg-purple-500 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading ? "Signing In..." : "Sign In"}
          {!loading && (
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          )}
        </span>
        <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
      </button>
    </motion.form>
  );
};

const PartnerLoginForm = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const responseData = await loginAdmissionPoint(formData);

      dispatch(
        showAlert({
          type: "success",
          message: responseData.message || "Login Successful!",
        }),
      );

      const user = { ...responseData.data, type: "partner" };
      dispatch(setUser(user));

      navigate("/partner-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="space-y-1 mb-6 text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground/90 to-foreground/70 bg-clip-text text-transparent">
          Partner Portal
        </h2>
        <p className="text-muted-foreground text-sm">
          Secure access for verified partners
        </p>
      </div>

      {error && <div className="text-red-500 text-sm text-center">{error}</div>}

      <InputField
        icon={Mail}
        type="email"
        placeholder="Corporate Email"
        required
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <InputField
        icon={ShieldCheck}
        type="password"
        placeholder="Access Token / Password"
        required
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />

      <div className="flex items-center justify-between mt-2">
        <label className="flex items-center space-x-2 cursor-pointer group">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-input bg-muted/50 text-blue-600 focus:ring-blue-500/20"
            checked={formData.rememberMe}
            onChange={(e) =>
              setFormData({ ...formData, rememberMe: e.target.checked })
            }
          />
          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            Remember me
          </span>
        </label>
        <button
          type="button"
          onClick={props.onForgotPassword}
          className="text-sm text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors text-right"
        >
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full relative group mt-8 overflow-hidden rounded-xl bg-blue-600 text-white font-medium py-3 px-4 transition-all hover:bg-blue-500 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading ? "Authenticating..." : "Authenticate"}
          {!loading && (
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          )}
        </span>
        <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
      </button>
    </motion.form>
  );
};

const ForgotPasswordForm = ({ userType, onBack }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await forgotPasswordAPI({ email, userType });
      dispatch(showAlert({ type: "success", message: "OTP sent to your email!" }));
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await verifyOtpAPI({ email, otp, userType });
      dispatch(showAlert({ type: "success", message: "OTP verified!" }));
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await resetPasswordAPI({ email, otp, newPassword, userType });
      dispatch(showAlert({ type: "success", message: "Password reset successful! Please login." }));
      onBack();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const themeColor = userType === "partner" ? "blue" : "purple";
  const btnBg = userType === "partner" ? "bg-blue-600 hover:bg-blue-500" : "bg-purple-600 hover:bg-purple-500";

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="space-y-1 mb-6 text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground/90 to-foreground/70 bg-clip-text text-transparent">
          {step === 1 ? "Forgot Password" : step === 2 ? "Verify OTP" : "Reset Password"}
        </h2>
        <p className="text-muted-foreground text-sm">
          {step === 1
            ? `Enter your ${userType === "partner" ? "corporate" : ""} email to receive an OTP`
            : step === 2
            ? "Enter the 6-digit code sent to your email"
            : "Choose a strong new password"}
        </p>
      </div>

      {error && <div className="text-red-500 text-sm text-center">{error}</div>}

      {step === 1 && (
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <InputField
            icon={Mail}
            type="email"
            placeholder="Email Address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full relative group mt-6 overflow-hidden rounded-xl text-white font-medium py-3 px-4 transition-all active:scale-[0.98] disabled:opacity-70",
              btnBg
            )}
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div className="flex justify-center py-4">
            <OtpInput value={otp} onChange={setOtp} color={themeColor} />
          </div>
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className={cn(
              "w-full relative group mt-6 overflow-hidden rounded-xl text-white font-medium py-3 px-4 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed",
              btnBg
            )}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <InputField
            icon={Lock}
            type="password"
            placeholder="New Password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full relative group mt-6 overflow-hidden rounded-xl text-white font-medium py-3 px-4 transition-all active:scale-[0.98] disabled:opacity-70",
              btnBg
            )}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}

      <button
        onClick={onBack}
        className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2 flex items-center justify-center gap-2 group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Login
      </button>
    </motion.div>
  );
};

export default function Login() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("user"); // 'user' or 'partner'
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center bg-background p-4 sm:p-8 font-sans selection:bg-purple-500/30 transition-colors duration-500">
      <BackgroundAnimation />

      {/* Top Header Bar */}
      <div className="fixed top-0 right-0 w-full flex items-center justify-end px-6 py-6 sm:px-12 sm:py-8 z-50">
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="p-3 rounded-2xl bg-card/40 backdrop-blur-xl border border-border shadow-xl text-foreground hover:bg-card/60 transition-all"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-purple-600" />
          )}
        </motion.button>
      </div>

      {/* Glossy Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-b from-foreground/10 to-transparent rounded-2xl blur-xs pointer-events-none" />

        <div className="bg-card/80 backdrop-blur-2xl border border-border shadow-2xl rounded-2xl p-6 sm:p-8 overflow-hidden relative">
          {/* Top Logo / Decor */}
          <div className="flex justify-center mb-8 relative">
            {/* Glowing background blob behind the logo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-16 bg-purple-500/20 blur-2xl rounded-full pointer-events-none" />

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative rounded-2xl bg-gradient-to-tr from-purple-600/30 to-blue-500/30 p-[1px] shadow-xl shadow-purple-500/10 cursor-pointer group"
              onClick={() => navigate("/")}
            >
              <div className="bg-card/90 backdrop-blur-sm rounded-2xl px-6 py-4 flex items-center justify-center transition-all duration-300 group-hover:bg-card/70">
                <img
                  src={Logo}
                  alt="Logo"
                  className="h-10 w-auto object-contain drop-shadow-md transition-transform duration-500 group-hover:drop-shadow-xl"
                />
              </div>
            </motion.div>
          </div>

          {/* Toggle Switch */}
          <div className="bg-muted/50 p-1 rounded-xl mb-8 flex relative border border-border">
            <button
              onClick={() => setActiveTab("user")}
              className={cn(
                "flex-1 py-1.5 text-sm font-medium z-10 transition-colors flex items-center justify-center gap-2",
                activeTab === "user"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground/70",
              )}
            >
              <User className="w-4 h-4" /> User
            </button>
            <button
              onClick={() => setActiveTab("partner")}
              className={cn(
                "flex-1 py-1.5 text-sm font-medium z-10 transition-colors flex items-center justify-center gap-2",
                activeTab === "partner"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground/70",
              )}
            >
              <Briefcase className="w-4 h-4" /> Partner
            </button>

            {/* Active Tab Background Indicator */}
            <div className="absolute inset-1 pointer-events-none flex">
              <motion.div
                layoutId="activeTabIndicator"
                className="w-1/2 h-full bg-card rounded-lg shadow-sm border border-border"
                initial={false}
                animate={{
                  x: activeTab === "user" ? 0 : "100%",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </div>
          </div>

          {/* Form Area Wrapper for smooth height changes & transitions */}
          <div className="relative min-h-[300px]">
            <AnimatePresence mode="wait">
              {showForgotPassword ? (
                <ForgotPasswordForm
                  key="forgot"
                  userType={activeTab}
                  onBack={() => setShowForgotPassword(false)}
                />
              ) : activeTab === "user" ? (
                <UserLoginForm
                  key="user"
                  onForgotPassword={() => setShowForgotPassword(true)}
                />
              ) : (
                <PartnerLoginForm
                  key="partner"
                  onForgotPassword={() => setShowForgotPassword(true)}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Global generic animations using tailwind arbitrarily */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `,
        }}
      />
    </div>
  );
}
