import React from "react";
import { motion } from "framer-motion";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Scale, BookOpen, AlertOctagon, UserCheck, ShieldAlert } from "lucide-react";

export default function Terms() {
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
            className="inline-flex p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 mb-2"
          >
            <Scale size={32} />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight"
          >
            Terms & Conditions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground text-lg"
          >
            Please read these terms and conditions carefully before using our platform.
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
            {/* Introduction */}
            <div className="p-8 rounded-[2rem] border border-border bg-card/50 backdrop-blur-sm space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600">
                  <Scale size={22} />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Introduction</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to 6ASkillCity. By accessing and using our platform, you agree to the following terms and conditions. 6ASkillCity acts solely as a communication and facilitation layer between universities, institutes, and students. We do not provide courses directly, nor do we issue enrollment numbers.
              </p>
            </div>

            {/* Services */}
            <div className="p-8 rounded-[2rem] border border-border bg-card/50 backdrop-blur-sm space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
                  <BookOpen size={22} />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Services</h2>
              </div>
              <ul className="space-y-3 pl-2">
                {[
                  "6ASkillCity enables institutes to access university courses, manage student applications, and process payments.",
                  "We provide a web application for tracking progress, submitting applications, and handling fee transactions.",
                  "Institutes are responsible for verifying student eligibility and enrollment with the respective universities.",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm font-medium text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Limitations */}
            <div className="p-8 rounded-[2rem] border border-border bg-card/50 backdrop-blur-sm space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-red-500/10 text-red-600">
                  <AlertOctagon size={22} />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Limitations</h2>
              </div>
              <ul className="space-y-3 pl-2">
                {[
                  "6ASkillCity does not own or offer courses.",
                  "We do not guarantee admission or enrollment numbers.",
                  "Institutes and universities remain solely responsible for academic content, eligibility criteria, and certification.",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm font-medium text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 shrink-0" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* User Responsibilities */}
            <div className="p-8 rounded-[2rem] border border-border bg-card/50 backdrop-blur-sm space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <UserCheck size={22} />
                </div>
                <h2 className="text-2xl font-bold text-foreground">User Responsibilities</h2>
              </div>
              <ul className="space-y-3 pl-2">
                {[
                  "Institutes must provide accurate information when submitting student applications.",
                  "Users must comply with applicable laws and regulations.",
                  "Payment transactions must be authorized and valid.",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm font-medium text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Liability */}
            <div className="p-8 rounded-[2rem] border border-border bg-card/50 backdrop-blur-sm space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-[#B82424]/10 text-[#B82424]">
                  <ShieldAlert size={22} />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Liability</h2>
              </div>
              <ul className="space-y-3 pl-2">
                {[
                  "6ASkillCity is not liable for disputes between universities, institutes, and students.",
                  "We are not responsible for academic outcomes, certifications, or course availability.",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm font-medium text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B82424] mt-2 shrink-0" />
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
