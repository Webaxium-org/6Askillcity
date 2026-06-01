import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Phone,
  Mail,
  Globe,
  MapPin,
  Send,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "framer-motion";
import Logo from "../assets/logo.png";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.215, 0.61, 0.355, 1], // easeOutCubic
    },
  },
};

const cardContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
  hover: {
    y: -8,
    scale: 1.015,
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 25
    }
  }
};

const MotionPhone = motion(Phone);
const MotionMail = motion(Mail);
const MotionArrowUpRight = motion(ArrowUpRight);
const MotionSend = motion(Send);

const phoneIconVariants = {
  hover: {
    rotate: [0, -15, 15, -15, 15, 0],
    transition: {
      duration: 0.6,
      ease: "easeInOut"
    }
  }
};

const mailIconVariants = {
  hover: {
    y: [0, -4, 2, 0],
    scale: [1, 1.05, 0.98, 1],
    transition: {
      duration: 0.6,
      ease: "easeInOut"
    }
  }
};

const arrowVariants = {
  hover: {
    rotate: 45,
    x: 2,
    y: -2,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 15
    }
  }
};

const sendIconVariants = {
  hover: {
    x: [0, 4, -2, 0],
    y: [0, -3, 1, 0],
    transition: {
      duration: 0.5,
      ease: "easeInOut"
    }
  }
};

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubscribed(true);
    setNewsletterEmail("");
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <footer
      className="pt-24 pb-10 bg-background border-t border-border"
      id="contact"
    >
      <div className="container mx-auto px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid lg:grid-cols-12 gap-12 lg:gap-8 pb-16 border-b border-border"
        >
          <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-2">
              <Link to="/">
                <img src={Logo} alt="Logo" className="w-28 hover:opacity-90 transition-opacity" />
              </Link>
            </div>
            <p className="text-muted-foreground text-base leading-relaxed max-w-xs">
              Managing global academic affairs with precision, integrity,
              and a commitment to student success.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-5">
            <h5 className="text-lg font-extrabold text-foreground tracking-tight">
              Navigation
            </h5>
            <ul className="space-y-3.5 text-base font-medium text-muted-foreground">
              <li>
                <a
                  href="/#mission-vision"
                  onClick={(e) => {
                    const element = document.getElementById("mission-vision");
                    if (element) {
                      e.preventDefault();
                      element.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                  className="hover:text-[#17468C] transition-colors cursor-pointer"
                >
                  Our Mission
                </a>
              </li>
              <li>
                <a
                  href="/#mission-vision"
                  onClick={(e) => {
                    const element = document.getElementById("mission-vision");
                    if (element) {
                      e.preventDefault();
                      element.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                  className="hover:text-[#17468C] transition-colors cursor-pointer"
                >
                  Our Vision
                </a>
              </li>
              <li>
                <Link
                  to="/login"
                  className="hover:text-[#17468C] transition-colors"
                >
                  Partner Portal
                </Link>
              </li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-3 space-y-5 text-left">
            <div className="space-y-2">
              <h5 className="text-lg font-extrabold text-foreground tracking-tight">
                Official Hub
              </h5>
              <p className="text-sm font-black text-[#17468C] uppercase tracking-wider leading-none">
                6A SKILL CITY (OPC) PRIVATE LIMITED
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex gap-3 text-base text-muted-foreground">
                <MapPin
                  size={20}
                  className="shrink-0 text-muted-foreground/60 mt-0.5"
                />
                <span className="leading-relaxed">
                  Grace Tower, First Floor, Cabin No.C1 Door No. 67/1392,
                  St. Vincent Road, Kacheripady, Ernakulam North,
                  Kerala, India - 682018
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-3 space-y-5">
            <h5 className="text-lg font-extrabold text-foreground tracking-tight">
              Newsletter
            </h5>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder={subscribed ? "Subscribed!" : "Enter email"}
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                disabled={subscribed}
                className="h-11 px-3 py-2 rounded-lg bg-muted text-base border border-input focus:outline-none focus:ring-1 focus:ring-primary w-full transition-all"
              />
              <motion.button
                whileHover="hover"
                whileTap={{ scale: 0.95 }}
                variants={{
                  hover: { scale: 1.05 }
                }}
                type="submit"
                disabled={subscribed}
                className="shrink-0 h-11 w-11 flex items-center justify-center rounded-lg shadow-md shadow-primary/20 bg-[#17468C] text-white hover:bg-[#17468C]/90 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <MotionSend size={16} variants={sendIconVariants} />
              </motion.button>
            </form>
            {subscribed && (
              <p className="text-sm text-emerald-600 font-bold animate-pulse">
                Thank you for subscribing!
              </p>
            )}
            <p className="text-sm text-muted-foreground font-medium">
              By subscribing, you agree to our privacy protocols.
            </p>
          </motion.div>
        </motion.div>

        {/* Horizontal Department Contact Grid */}
        <motion.div
          variants={cardContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid md:grid-cols-3 gap-8 py-12 mt-10"
        >
          {[
            {
              id: "01",
              title: "Partner Enquiry",
              description: "For new academic collaborations and university tie-ups",
              mob: "+91 9633331014",
              mobHref: "tel:+919633331014",
              land: "0484 461 4539",
              landHref: "tel:04844614539",
              email: "partner@6askillcity.com",
              emailHref: "mailto:partner@6askillcity.com",
              badgeColor: "bg-[#B82424]/10 text-[#B82424] border-[#B82424]/20",
              glowColor: "group-hover:shadow-[0_20px_40px_-15px_rgba(184,36,36,0.12)]",
              cardColor: "border-[#B82424]/10 hover:border-[#B82424]/40 hover:bg-gradient-to-b hover:from-white hover:to-[#B82424]/[0.02]",
              linkHover: "hover:text-[#B82424]",
              iconBg: "bg-[#B82424]/5 text-[#B82424]"
            },
            {
              id: "02",
              title: "Finance",
              description: "Billing enquiries, fee reconciliation, and ledger statements",
              mob: "+91 99954 53322",
              mobHref: "tel:+919995453322",
              land: "",
              landHref: "",
              email: "accounts@6askillcity.com",
              emailHref: "mailto:accounts@6askillcity.com",
              badgeColor: "bg-[#6366f1]/10 text-[#6366f1] border-[#6366f1]/20",
              glowColor: "group-hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.12)]",
              cardColor: "border-[#6366f1]/10 hover:border-[#6366f1]/40 hover:bg-gradient-to-b hover:from-white hover:to-[#6366f1]/[0.02]",
              linkHover: "hover:text-[#6366f1]",
              iconBg: "bg-[#6366f1]/5 text-[#6366f1]"
            },
            {
              id: "03",
              title: "IT Team",
              description: "Technical support, portal issues, and API integrations",
              mob: "+91 73560 75454",
              mobHref: "tel:+917356075454",
              land: "",
              landHref: "",
              email: "partner@6askillcity.com",
              emailHref: "mailto:partner@6askillcity.com",
              badgeColor: "bg-[#17468C]/10 text-[#17468C] border-[#17468C]/20",
              glowColor: "group-hover:shadow-[0_20px_40px_-15px_rgba(23,70,140,0.12)]",
              cardColor: "border-[#17468C]/10 hover:border-[#17468C]/40 hover:bg-gradient-to-b hover:from-white hover:to-[#17468C]/[0.02]",
              linkHover: "hover:text-[#17468C]",
              iconBg: "bg-[#17468C]/5 text-[#17468C]"
            },
          ].map((dept, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              whileHover="hover"
              className={`relative overflow-hidden p-6 rounded-3xl bg-card border shadow-sm transition-all duration-500 space-y-6 text-left group ${dept.cardColor} ${dept.glowColor}`}
            >
              {/* Decorative Number Badge in Background */}
              <div className="absolute right-4 top-2 text-7xl font-black text-muted/20 select-none pointer-events-none group-hover:scale-110 group-hover:text-muted/30 transition-all duration-500 font-sans">
                {dept.id}
              </div>

              {/* Card Header */}
              <div className="space-y-2 relative z-10">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${dept.badgeColor}`}>
                    {dept.title}
                  </span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-snug max-w-[85%]">
                  {dept.description}
                </p>
              </div>

              {/* Dynamic Divider */}
              <div className="h-[1px] w-full bg-gradient-to-r from-border/80 via-border/30 to-transparent" />

              {/* Contact Details Stack */}
              <div className="space-y-4 relative z-10">
                {/* Phone Item */}
                <motion.div
                  whileHover="hover"
                  className="flex items-start gap-4 p-2.5 rounded-2xl hover:bg-muted/40 transition-colors duration-300 cursor-pointer"
                >
                  <div className={`p-2.5 rounded-xl shrink-0 ${dept.iconBg}`}>
                    <MotionPhone size={18} variants={phoneIconVariants} />
                  </div>
                  <div className="space-y-1">
                    <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Call Hotline</span>
                    <div className="flex flex-wrap items-center gap-x-2">
                      <a
                        href={dept.mobHref}
                        className={`text-[15px] font-extrabold text-foreground transition-colors ${dept.linkHover} flex items-center gap-1`}
                      >
                        {dept.mob}
                      </a>
                      {dept.land && (
                        <>
                          <span className="text-muted-foreground/30 font-medium">|</span>
                          <a
                            href={dept.landHref}
                            className={`text-[14px] font-medium text-muted-foreground transition-colors ${dept.linkHover}`}
                          >
                            {dept.land}
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Email Item */}
                <motion.div
                  whileHover="hover"
                  className="flex items-start gap-4 p-2.5 rounded-2xl hover:bg-muted/40 transition-colors duration-300 cursor-pointer"
                >
                  <div className={`p-2.5 rounded-xl shrink-0 ${dept.iconBg}`}>
                    <MotionMail size={18} variants={mailIconVariants} />
                  </div>
                  <div className="space-y-1">
                    <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</span>
                    <a
                      href={dept.emailHref}
                      className={`text-[15px] font-extrabold text-foreground break-all transition-colors ${dept.linkHover} flex items-center gap-1`}
                    >
                      {dept.email}
                    </a>
                  </div>
                </motion.div>
              </div>

              {/* Visual Action Indicator Footer inside Card */}
              <div className="flex items-center justify-between pt-2 text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 tracking-wide">
                  Get in touch now
                </span>
                <div className="p-1.5 rounded-full bg-muted group-hover:bg-foreground group-hover:text-background transition-all duration-300">
                  <MotionArrowUpRight size={14} variants={arrowVariants} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-base font-bold text-muted-foreground">
            © {new Date().getFullYear()} 6A Skillcity Foundation. All
            rights reserved.
          </p>
          <div className="flex gap-6 text-base font-bold text-muted-foreground">
            <Link
              to="/privacy-policy"
              className="hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/refund-policy"
              className="hover:text-foreground transition-colors"
            >
              Refund Policy
            </Link>
            <Link
              to="/terms"
              className="hover:text-foreground transition-colors"
            >
              Terms & Conditions
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
