import React from "react";
import { motion } from "framer-motion";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { RotateCcw, ShieldAlert, BadgeInfo, Clock, Scale } from "lucide-react";

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
            className="inline-flex p-3 rounded-2xl bg-[#B82424]/10 text-[#B82424] mb-2"
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
            Please read our refund policies, procedures, timelines, and limitations.
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
            className="space-y-10"
          >
            {/* General Policy */}
            <div className="p-8 rounded-[2rem] border border-border bg-card/50 backdrop-blur-sm space-y-5">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-[#B82424]/10 text-[#B82424]">
                  <BadgeInfo size={22} />
                </div>
                <h2 className="text-2xl font-bold text-foreground">General Policy</h2>
              </div>
              <p className="text-muted-foreground text-base leading-relaxed pl-2 font-medium">
                6ASkillCity acts as a payment facilitation and support platform between 
                students, institutes, and universities. Refund requests shall be governed in 
                accordance with the refund policies of the respective institute or university, as 
                applicable.
              </p>
            </div>

            {/* Refund Procedure */}
            <div className="p-8 rounded-[2rem] border border-border bg-card/50 backdrop-blur-sm space-y-5">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-[#17468C]/10 text-[#17468C]">
                  <RotateCcw size={22} />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Refund Procedure</h2>
              </div>
              <div className="space-y-4 pl-2">
                <p className="text-muted-foreground text-base leading-relaxed font-medium">
                  Students seeking a refund must submit their request through the concerned institute or 
                  university in accordance with the applicable policies, procedures, and timelines.
                </p>
                <p className="text-muted-foreground text-base leading-relaxed font-medium">
                  Upon approval of the refund by the concerned institute or university, the refund may be 
                  processed either by the respective university/institute or through the 6ASkillCity platform 
                  using the original mode of payment, subject to applicable processing requirements.
                </p>
              </div>
            </div>

            {/* Non-Refundable Charges */}
            <div className="p-8 rounded-[2rem] border border-border bg-card/50 backdrop-blur-sm space-y-5">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-[#B82424]/10 text-[#B82424]">
                  <ShieldAlert size={22} />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Non-Refundable Charges</h2>
              </div>
              <p className="text-muted-foreground text-base leading-relaxed pl-2 font-medium">
                Certain charges, including application fees, processing fees, convenience fees, or 
                administrative charges, may be non-refundable, subject to the policies communicated by the 
                respective institute or university prior to payment.
              </p>
            </div>

            {/* Processing Timeline */}
            <div className="p-8 rounded-[2rem] border border-border bg-card/50 backdrop-blur-sm space-y-5">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-[#17468C]/10 text-[#17468C]">
                  <Clock size={22} />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Processing Timeline</h2>
              </div>
              <p className="text-muted-foreground text-base leading-relaxed pl-2 font-medium">
                Approved refunds shall ordinarily be processed within 7-14 business days. However, the actual 
                credit timeline may vary depending upon banking channels, payment gateways, financial 
                institutions, or other third-party payment service providers.
              </p>
            </div>

            {/* Limitation */}
            <div className="p-8 rounded-[2rem] border border-border bg-card/50 backdrop-blur-sm space-y-5">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-[#B82424]/10 text-[#B82424]">
                  <Scale size={22} />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Limitation</h2>
              </div>
              <div className="space-y-4 pl-2">
                <p className="text-muted-foreground text-base leading-relaxed font-medium">
                  6ASkillCity shall act only as a facilitation platform for payment processing and refund 
                  coordination and shall not independently determine refund eligibility, which shall remain 
                  subject to the policies and approval of the respective institute or university.
                </p>
                <p className="text-muted-foreground text-base leading-relaxed font-medium">
                  Nothing contained in this policy shall limit or restrict any rights or remedies available to users 
                  under applicable laws, including consumer protection laws in force in India.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
