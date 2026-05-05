import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { clearAlert } from "../../redux/alertSlice";

const alertStyles = {
  success: "bg-green-500/10 border-green-500/20 text-green-700",
  error: "bg-red-500/10 border-red-500/20 text-red-700",
  warning: "bg-yellow-500/10 border-yellow-500/20 text-yellow-700",
  info: "bg-blue-500/10 border-blue-500/20 text-blue-700",
};

const alertIcons = {
  success: <CheckCircle className="text-green-500" size={20} />,
  error: <AlertCircle className="text-red-500" size={20} />,
  warning: <AlertTriangle className="text-yellow-500" size={20} />,
  info: <Info className="text-blue-500" size={20} />,
};

export default function AlertManager() {
  const alerts = useSelector((state) => state.alert.alerts);
  const dispatch = useDispatch();

  useEffect(() => {
    // Auto-dismiss alerts after 5 seconds
    if (alerts.length > 0) {
      alerts.forEach((alert) => {
        setTimeout(() => {
          dispatch(clearAlert(alert.id));
        }, 5000);
      });
    }
  }, [alerts, dispatch]);

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full">
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md ${alertStyles[alert.type] || alertStyles.info}`}
          >
            {alertIcons[alert.type] || alertIcons.info}
            <div className="flex-1 pt-0.5">
              <p className="text-sm font-semibold leading-tight">{alert.message}</p>
            </div>
            <button
              onClick={() => dispatch(clearAlert(alert.id))}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
