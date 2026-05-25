import React from "react";
import { motion } from "framer-motion";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Shield, Lock, Eye, FileText } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="relative min-h-screen bg-background font-sans selection:bg-[#B82424] selection:text-white overflow-x-hidden">
      <Navbar />

      {/* Hero section */}
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden bg-background">
        <div className="absolute inset-0 -z-10 h-full w-full bg-background [background:radial-gradient(125%_125%_at_50%_10%,var(--background)_40%,#17468c08_100%)]" />
        <div className="container mx-auto px-6 max-w-4xl text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex p-3 rounded-2xl bg-blue-500/10 text-blue-600 mb-2"
          >
            <Shield size={32} />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight"
          >
            Privacy Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground text-lg"
          >
            Your privacy and trust are paramount to us. Learn how we handle your data.
          </motion.p>
        </div>
      </section>

      {/* Content Section */}
      <section className="pb-32 bg-background">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="space-y-12"
          >
            {/* Data Collection */}
            <div className="p-8 rounded-[2rem] border border-border bg-card/50 backdrop-blur-sm space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
                  <Lock size={22} />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Data Collection</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We collect information necessary to facilitate communication between universities, institutes, and students, including:
              </p>
              <ul className="space-y-3 pl-2">
                {[
                  "Institute and student details",
                  "Course application data",
                  "Payment information",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm font-semibold text-foreground/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Data Usage */}
            <div className="p-8 rounded-[2rem] border border-border bg-card/50 backdrop-blur-sm space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600">
                  <Eye size={22} />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Data Usage</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Data is used to process applications, track progress, and manage payments.
              </p>
              <ul className="space-y-3 pl-2">
                {[
                  "We do not sell or share personal data with unauthorized third parties.",
                  "Information may be shared with universities and institutes strictly for enrollment and administrative purposes.",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm font-medium text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2 shrink-0" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Security */}
            <div className="p-8 rounded-[2rem] border border-border bg-card/50 backdrop-blur-sm space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <Shield size={22} />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Security</h2>
              </div>
              <ul className="space-y-3 pl-2">
                {[
                  "We implement industry-standard security measures to protect user data.",
                  "Payment information is processed securely through integrated payment gateways.",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm font-medium text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* User Rights */}
            <div className="p-8 rounded-[2rem] border border-border bg-card/50 backdrop-blur-sm space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
                  <FileText size={22} />
                </div>
                <h2 className="text-2xl font-bold text-foreground">User Rights</h2>
              </div>
              <ul className="space-y-3 pl-2">
                {[
                  "Users may request access to their data.",
                  "Users may request correction or deletion of inaccurate information.",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm font-medium text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2 shrink-0" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
