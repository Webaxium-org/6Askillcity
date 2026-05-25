import React from "react";
import { motion } from "framer-motion";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { RotateCcw, ShieldAlert, BadgeInfo, Clock } from "lucide-react";

export default function RefundPolicy() {
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
            className="inline-flex p-3 rounded-2xl bg-red-500/10 text-red-600 mb-2"
          >
            <RotateCcw size={32} />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight"
          >
            Refund Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground text-lg"
          >
            Learn about refund structures, university policies, and transaction processing.
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
            {/* General Policy */}
            <div className="p-8 rounded-[2rem] border border-border bg-card/50 backdrop-blur-sm space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-red-500/10 text-red-600">
                  <BadgeInfo size={22} />
                </div>
                <h2 className="text-2xl font-bold text-foreground">General Policy</h2>
              </div>
              <ul className="space-y-3 pl-2">
                {[
                  "6ASkillCity facilitates payment transactions between institutes and universities. Refunds are subject to the policies of the respective institute or university.",
                  "6ASkillCity does not independently issue refunds.",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm font-medium text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 shrink-0" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Refund Process */}
            <div className="p-8 rounded-[2rem] border border-border bg-card/50 backdrop-blur-sm space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
                  <RotateCcw size={22} />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Refund Process</h2>
              </div>
              <ul className="space-y-3 pl-2">
                {[
                  "Institutes must initiate refund requests directly with the university.",
                  "Once approved, refunds will be processed through the 6ASkillCity platform using the original payment method.",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm font-medium text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Non-Refundable Cases */}
            <div className="p-8 rounded-[2rem] border border-border bg-card/50 backdrop-blur-sm space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-[#B82424]/10 text-[#B82424]">
                  <ShieldAlert size={22} />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Non-Refundable Cases</h2>
              </div>
              <ul className="space-y-3 pl-2">
                {[
                  "Application fees or administrative charges may be non-refundable.",
                  "Refund eligibility depends on the university’s and institute’s policies.",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm font-medium text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B82424] mt-2 shrink-0" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Timeline */}
            <div className="p-8 rounded-[2rem] border border-border bg-card/50 backdrop-blur-sm space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <Clock size={22} />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Timeline</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Refunds, once approved, will be processed within <strong className="text-foreground">7–14 business days</strong>.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
