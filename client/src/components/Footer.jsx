import React from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, ArrowUpRight } from "lucide-react";
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
    y: -3,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
};

const MotionPhone = motion(Phone);
const MotionMail = motion(Mail);
const MotionArrowUpRight = motion(ArrowUpRight);

const phoneIconVariants = {
  hover: {
    rotate: [0, -15, 15, -15, 15, 0],
    transition: {
      duration: 0.6,
      ease: "easeInOut",
    },
  },
};

const mailIconVariants = {
  hover: {
    y: [0, -4, 2, 0],
    scale: [1, 1.05, 0.98, 1],
    transition: {
      duration: 0.6,
      ease: "easeInOut",
    },
  },
};

const arrowVariants = {
  hover: {
    rotate: 45,
    x: 2,
    y: -2,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 15,
    },
  },
};

export default function Footer() {
  return (
    <footer
      className="pt-24 pb-10 bg-slate-50/50 border-t border-slate-100"
      id="contact"
    >
      <div className="container mx-auto px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid lg:grid-cols-12 gap-12 lg:gap-8 pb-8 border-b border-slate-200"
        >
          <motion.div
            variants={itemVariants}
            className="lg:col-span-4 space-y-6"
          >
            <div className="flex items-center gap-2">
              <Link to="/">
                <img
                  src={Logo}
                  alt="Logo"
                  className="w-28 hover:opacity-90 transition-opacity"
                />
              </Link>
            </div>
            <p className="text-slate-500 text-base leading-relaxed max-w-xs font-medium">
              Managing global academic affairs with precision, integrity, and a
              commitment to student success.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 space-y-5"
          >
            <h5 className="text-lg font-extrabold text-slate-800 tracking-tight">
              Navigation
            </h5>
            <ul className="space-y-3.5 text-base font-semibold text-slate-500">
              <li>
                <a
                  href="/#mission-vision"
                  onClick={(e) => {
                    const element = document.getElementById("mission-vision");
                    if (element) {
                      e.preventDefault();
                      element.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
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
                      element.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
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

          <motion.div
            variants={itemVariants}
            className="lg:col-span-3 space-y-5 text-left"
          >
            <div className="space-y-2">
              <h5 className="text-lg font-extrabold text-slate-800 tracking-tight">
                Official Hub
              </h5>
              <p className="text-sm font-black text-[#17468C] uppercase tracking-wider leading-none">
                6A SKILL CITY (OPC) PRIVATE LIMITED
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex gap-3 text-base text-slate-500 font-medium">
                <MapPin size={20} className="shrink-0 text-slate-400 mt-0.5" />
                <span className="leading-relaxed">
                  Grace Tower, First Floor, Cabin No.C1 Door No. 67/1392, St.
                  Vincent Road, Kacheripady, Ernakulam North, Kerala, India -
                  682018
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="lg:col-span-3 space-y-3"
          >
            <h5 className="text-lg font-extrabold text-slate-800 tracking-tight">
              Find Us
            </h5>
            <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
              <iframe
                title="6A Skill City Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d353.56040350065024!2d76.28409987070272!3d9.98972836681259!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b080d29910d7d43%3A0x2fde9beb35d3b209!2s6A%20SKILLCITY%20(OPC)%20PRIVATE%20LIMITED!5e1!3m2!1sen!2sin!4v1780488359305!5m2!1sen!2sin"
                width="100%"
                height="180"
                style={{ border: 0, display: "block" }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a
              href="https://maps.google.com/?q=Grace+Tower,+St.+Vincent+Road,+Kacheripady,+Ernakulam,+Kerala+682018"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#17468C] hover:underline"
            >
              <MapPin size={13} />
              Open in Google Maps
            </a>
          </motion.div>
        </motion.div>

        {/* Horizontal Department Contact Grid */}
        <motion.div
          variants={cardContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid md:grid-cols-3 gap-8 pt-10"
        >
          {[
            {
              id: "01",
              title: "Partner Enquiry",
              description:
                "For new academic collaborations and university tie-ups.",
              mob: "+91 963 33 31 014",
              mobHref: "tel:+919633331014",
              land: "0484 461 4539",
              landHref: "tel:04844614539",
              email: "partner@6askillcity.com",
              emailHref: "mailto:partner@6askillcity.com",
              blueWord: "Partner",
              redWord: "Enquiry",
              borderGradient: "from-[#17468C] to-[#B82424]",
            },
            {
              id: "02",
              title: "Finance",
              description:
                "Billing enquiries, fee reconciliation, and ledger statements.",
              mob: "+91 999 54 53 322",
              mobHref: "tel:+919995453322",
              land: "",
              landHref: "",
              email: "accounts@6askillcity.com",
              emailHref: "mailto:accounts@6askillcity.com",
              blueWord: "Finance",
              redWord: "",
              borderGradient: "from-[#B82424] to-[#17468C]",
            },
            {
              id: "03",
              title: "Administration & IT Support",
              description:
                "Technical support, portal issues, and API integrations.",
              mob: "+91 735 60 75 454",
              mobHref: "tel:+917356075454",
              land: "",
              landHref: "",
              email: "itsupport@6askillcity.com",
              emailHref: "mailto:itsupport@6askillcity.com",
              blueWord: "IT",
              redWord: "Team",
              borderGradient: "from-[#17468C] to-[#B82424]",
            },
          ].map((dept, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              whileHover="hover"
              className={`p-[1px] rounded-[2rem] bg-gradient-to-r ${idx === 1 ? "from-[#B82424] to-[#17468C]" : "from-[#17468C] to-[#B82424]"} shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_15px_40px_rgb(0,0,0,0.08)] transition-all duration-500`}
            >
              <div className="bg-white rounded-[1.95rem] p-8 space-y-6 text-left w-full h-full relative group">
                {/* Card Header */}
                <div className="space-y-2 relative z-10">
                  <h3 className="text-3xl font-black tracking-tight pb-1">
                    <span
                      style={{
                        backgroundImage:
                          "linear-gradient(to right, #17468C, #B82424)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        display: "inline-block",
                      }}
                    >
                      {dept.title}
                    </span>
                  </h3>
                  <p className="text-sm font-semibold text-slate-500 leading-snug">
                    {dept.description}
                  </p>
                </div>

                {/* Dynamic Divider */}
                <div className="h-[1px] w-full bg-slate-200" />

                {/* Contact Details Stack */}
                <div className="space-y-4 relative z-10">
                  {/* Phone Item */}
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#17468C] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#17468C]/15">
                      <Phone size={16} />
                    </div>
                    <div className="space-y-0.5">
                      <a
                        href={dept.mobHref}
                        className="block text-base font-black text-slate-800 hover:text-[#17468C] transition-colors"
                      >
                        {dept.mob}
                      </a>
                      {dept.land && (
                        <a
                          href={dept.landHref}
                          className="block text-sm font-bold text-slate-500 hover:text-[#17468C] transition-colors"
                        >
                          {dept.land}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Email Item */}
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#B82424] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#B82424]/15">
                      <Mail size={16} />
                    </div>
                    <a
                      href={dept.emailHref}
                      className="text-base font-black text-slate-800 hover:text-[#B82424] transition-colors truncate"
                    >
                      {dept.email}
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div
          className="w-24 h-[1.5px] bg-slate-300 mx-auto mt-12 mb-8"
          style={{ backgroundColor: "#cbd5e1", width: "96px", height: "1.5px" }}
        />

        <div
          className="flex flex-col items-center justify-center gap-4 text-center"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            textAlign: "center",
            opacity: 1,
            visibility: "visible",
          }}
        >
          <p
            className="text-sm font-extrabold text-slate-800"
            style={{ color: "#1e293b", fontSize: "14px", fontWeight: 800 }}
          >
            © 6A Skillcity {new Date().getFullYear()} is reserved all rights.
          </p>
          <div
            className="flex justify-center flex-wrap gap-x-8 gap-y-2 text-xs font-black text-slate-600"
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              columnGap: "32px",
              rowGap: "8px",
              fontSize: "12px",
              fontWeight: 900,
            }}
          >
            <Link
              to="/privacy-policy"
              className="hover:text-[#17468C] transition-colors"
              style={{ color: "#64748b", textDecoration: "none" }}
            >
              Privacy policy
            </Link>
            <Link
              to="/refund-policy"
              className="hover:text-[#17468C] transition-colors"
              style={{ color: "#64748b", textDecoration: "none" }}
            >
              Refund policy
            </Link>
            <Link
              to="/terms"
              className="hover:text-[#17468C] transition-colors"
              style={{ color: "#64748b", textDecoration: "none" }}
            >
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
