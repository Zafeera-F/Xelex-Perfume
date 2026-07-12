import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Card from "../../components/ui/Card";
import Logo from "../../components/ui/Logo";
import MfaSetup from "../../components/ui/MfaSetup";
import { fadeInUp } from "../../lib/animations";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { PATHS } from "../../routes/paths";

/**
 * AdminMfaSetup — mandatory enrollment step for every admin account.
 * Standalone (not nested under AdminLayout), same reasoning as AdminLogin:
 * the sidebar's nav links would 403 for an admin who hasn't finished this
 * yet (see requireAdmin's allowlist in the backend), so there's nothing
 * useful to show around this form.
 */
export default function AdminMfaSetup() {
  const { admin, status, setupMfa, confirmMfaSetup } = useAdminAuth();
  const navigate = useNavigate();

  if (status === "loading") {
    return <div className="min-h-screen bg-background" />;
  }

  if (status === "guest") {
    return <Navigate to={PATHS.admin.login} replace />;
  }

  // Already enrolled — nothing to do here.
  if (admin.mfaEnabled) {
    return <Navigate to={PATHS.admin.dashboard} replace />;
  }

  function handleSuccess() {
    navigate(PATHS.admin.dashboard, { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <h1 className="text-center font-display text-2xl text-ivory">Secure Your Account</h1>
        <p className="mt-2 text-center text-sm text-muted">
          Two-factor authentication is required for all admin accounts before you can continue.
        </p>

        <Card className="mt-8 p-6" hoverable={false}>
          <MfaSetup onSetup={setupMfa} onConfirm={confirmMfaSetup} onSuccess={handleSuccess} />
        </Card>
      </motion.div>
    </div>
  );
}
