import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import {
  Building2,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  UserCheck,
  FileText,
  BadgeDollarSign,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getMyProfile } from "../../api/partner.api";
import { useDispatch } from "react-redux";
import { showAlert } from "../../redux/alertSlice";

export default function MyProfile() {
  const dispatch = useDispatch();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await getMyProfile();
      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      dispatch(
        showAlert({
          type: "error",
          message: error.response?.data?.message || "Failed to load profile",
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="My Profile">
        <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Loading profile...
        </div>
      </DashboardLayout>
    );
  }

  if (!data) return null;

  const { partner, permissions } = data;

  return (
    <DashboardLayout title="My Partner Profile">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm"
        >
          <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent relative">
            <div className="absolute -bottom-12 left-8 p-1 bg-card rounded-3xl border border-border shadow-lg">
              <div className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Building2 className="w-12 h-12 text-primary" />
              </div>
            </div>
          </div>

          <div className="pt-16 pb-8 px-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-black tracking-tight">
                    {partner.centerName}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600">
                    Active Partner
                  </span>
                </div>
                <p className="text-muted-foreground font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {partner.location.city}, {partner.location.state}
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="bg-muted/50 px-4 py-2 rounded-2xl border border-border/50">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                    Member Since
                  </p>
                  <p className="text-sm font-bold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    {new Date(partner.registrationDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="bg-card border border-border rounded-3xl p-8 space-y-8 shadow-sm">
              <div>
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-primary" />
                  Licensee Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      Full Name
                    </p>
                    <p className="font-semibold text-lg">
                      {partner.licenseeName}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      Email Address
                    </p>
                    <p className="font-semibold flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      {partner.licenseeEmail}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      Contact Number
                    </p>
                    <p className="font-semibold flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      {partner.licenseeContactNumber}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-border">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Office Location
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      Street Address
                    </p>
                    <p className="font-semibold">{partner.location.address}</p>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        City
                      </p>
                      <p className="font-semibold">{partner.location.city}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        State
                      </p>
                      <p className="font-semibold">{partner.location.state}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Pincode
                      </p>
                      <p className="font-semibold">
                        {partner.location.pincode}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Country
                      </p>
                      <p className="font-semibold">
                        {partner.location.country}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Permissions & Fees */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm flex flex-col h-full">
              <div className="px-6 py-5 border-b border-border bg-muted/30">
                <h3 className="font-bold flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  Assigned Inventory
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Universities and Programs you can enroll students in.
                </p>
              </div>

              <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                {/* Universities */}
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-3 flex items-center gap-2">
                    <Building2 className="w-3 h-3" /> Universities
                  </h4>
                  <div className="space-y-2">
                    {permissions.filter((p) => p.type === "university")
                      .length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">
                        No universities assigned
                      </p>
                    ) : (
                      permissions
                        .filter((p) => p.type === "university")
                        .map((p) => (
                          <div
                            key={p._id}
                            className="p-3 rounded-xl bg-muted/50 border border-border/50 text-sm font-bold"
                          >
                            {p.universityId?.name}
                          </div>
                        ))
                    )}
                  </div>
                </div>

                {/* Programs & Fees */}
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-3 flex items-center gap-2">
                    <GraduationCap className="w-3 h-3" /> Programs & Fees
                  </h4>
                  <div className="space-y-3">
                    {permissions.filter((p) => p.type === "program").length ===
                    0 ? (
                      <p className="text-xs text-muted-foreground italic">
                        No programs assigned
                      </p>
                    ) : (
                      permissions
                        .filter((p) => p.type === "program")
                        .map((p) => (
                          <div
                            key={p._id}
                            className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-2"
                          >
                            <p className="text-sm font-bold text-primary">
                              {p.programId?.name}
                            </p>
                            <div className="flex items-center justify-between pt-2 border-t border-primary/10">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <BadgeDollarSign className="w-3 h-3" /> Total
                                Fee
                              </span>
                              <span className="text-sm font-black">
                                ₹
                                {p.currentFee?.totalFee?.toLocaleString() ||
                                  "0.00"}
                              </span>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
