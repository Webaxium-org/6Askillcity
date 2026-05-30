import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  CheckCircle,
  MapPin,
  Mail,
  Phone,
  Globe,
  ArrowRight,
  School,
  Sparkles,
  ShieldCheck,
  Send,
  ChevronDown,
  Target,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showAlert } from "../../redux/alertSlice";
import { axiosInstance } from "../../api/axiosInstance";
import { getPublicPrograms, getPublicBranches } from "../../api/university.api";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

import Logo from "../../assets/logo.png";
import AboutImg from "../../assets/about.png";
import Ugc from "../../assets/ugc-v.webp";
import ManipurGovt from "../../assets/Group-1000005110.webp";
import Aiu from "../../assets/aiu.webp";
import Ncte from "../../assets/ncte.webp";
import Bci from "../../assets/bar-council.webp";
import Pci from "../../assets/pharmacy-council.webp";
import Reach from "../../assets/Reach.webp";
import IncreasedAdmission from "../../assets/empower.webp";
import Holistic from "../../assets/Holistic.webp";
import PartnershipIllustration from "../../assets/partnership_illustration.png";
import GlobalUniversityLogo from "../../assets/global_university_logo.png";
import TguImg1 from "../../assets/tgu/tgu-img-1.jpeg";
import TguImg2 from "../../assets/tgu/tgu_university.webp";
import TguImg3 from "../../assets/tgu/tgu-img-3.jpeg";
import TguWebp from "../../assets/tgu/tgu.webp";

/**
 * UTILITIES
 */
// Simplified cn utility for class merging (simulating clsx + tailwind-merge)
const cn = (...classes) => classes.filter(Boolean).join(" ");

/**
 * SHADCN UI COMPONENTS (Inline Implementations)
 */

const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      primary: "bg-[#17468C] text-white hover:bg-[#17468C]/90 shadow",
      brandRed: "bg-[#B82424] text-white hover:bg-[#B82424]/90 shadow",
      brandGradient: "bg-gradient-to-r from-[#0a3382] via-[#63163a] to-[#bd0808] text-white hover:opacity-95 shadow-xl",
      destructive:
        "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline:
        "border border-input hover:bg-accent hover:text-accent-foreground",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
    };
    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    };

    let finalClass = cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-base font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
      variants[variant],
      sizes[size],
      className,
    );

    if (className?.includes("rounded-full") || variants[variant]?.includes("rounded-full")) {
      finalClass = finalClass.replace(/rounded-md/g, "");
    }

    const hasCustomWeight = className?.includes("font-semibold") || className?.includes("font-bold") || className?.includes("font-extrabold") || className?.includes("font-black");
    if (hasCustomWeight) {
      finalClass = finalClass.replace(/font-medium/g, "");
    }

    const hasCustomTextSize = className?.includes("text-sm") || className?.includes("text-lg") || className?.includes("text-xl") || className?.includes("text-2xl") || variants[variant]?.includes("text-sm") || variants[variant]?.includes("text-lg");
    if (hasCustomTextSize) {
      finalClass = finalClass.replace(/text-base/g, "");
    }

    return (
      <button
        ref={ref}
        className={finalClass}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

const Label = React.forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className,
    )}
    {...props}
  />
));
Label.displayName = "Label";

function Badge({ className, variant = "default", ...props }) {
  const variants = {
    default:
      "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary:
      "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive:
      "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground border-border",
    brandBlue:
      "border-transparent bg-[#17468C]/10 text-[#17468C] hover:bg-[#17468C]/20 border border-[#17468C]/20",
    brandRed:
      "border-transparent bg-[#B82424]/10 text-[#B82424] hover:bg-[#B82424]/20 border border-[#B82424]/20",
  };
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-border bg-card text-card-foreground shadow-sm",
      className,
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

/**
 * ANIMATION VARIANTS
 */
const fadeInUp = {
  initial: { opacity: 0, y: 40, filter: "blur(10px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.8, type: "spring", bounce: 0.3 },
};

const scaleUp = {
  initial: { opacity: 0, scale: 0.8, filter: "blur(10px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  transition: { duration: 0.8, type: "spring", bounce: 0.4 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

/**
 * COUNT-UP COMPONENT
 * Animates a numeric stat (e.g. "80K+") from 0 to its target
 * when it scrolls into the viewport.
 */
function parseStatValue(raw) {
  // Extracts leading number and trailing suffix: "80K+" → { target: 80, suffix: "K+" }
  const match = raw.match(/^([\d.]+)(.*)$/);
  if (!match) return { target: 0, suffix: raw };
  return { target: parseFloat(match[1]), suffix: match[2] };
}

function CountUp({ value }) {
  const { target, suffix } = parseStatValue(value);
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted.current) {
          hasStarted.current = true;
          const duration = 1800; // ms
          const startTime = performance.now();

          const tick = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
            else setDisplay(target);
          };

          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

/**
 * MAIN PAGE COMPONENTS
 */

const LoadingScreen = ({ onFinished }) => {
  useEffect(() => {
    const timer = setTimeout(onFinished, 2000);
    return () => clearTimeout(timer);
  }, [onFinished]);

  return (
    <motion.div
      key="loader"
      exit={{ opacity: 0, y: -50, filter: "blur(10px)" }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, filter: "blur(10px)" }}
        animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.5, type: "spring" }}
        className="relative"
      >
        {/* <div className="w-20 h-20 rounded-2xl flex items-center justify-center relative z-10 bg-[#17468C] shadow-2xl shadow-[#17468C]/30"> */}
        <img src={Logo} alt="Logo" className="w-48" />
        {/* </div> */}
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.05, 0.3],
            rotate: [0, 90, 180],
          }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="absolute inset-0 rounded-2xl -z-0 bg-gradient-to-br from-[#B82424] to-purple-500 blur-xl"
        />
      </motion.div>
      <div className="w-48 h-1.5 bg-slate-100 rounded-full mt-12 overflow-hidden relative shadow-inner">
        <motion.div
          initial={{ left: "-100%" }}
          animate={{ left: "100%" }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
          className="absolute h-full w-1/2 bg-gradient-to-r from-transparent via-[#B82424] to-transparent rounded-full"
        />
      </div>
    </motion.div>
  );
};

const staticBachelors = [
  "Bachelor of Commerce (BCom)",
  "Bachelor of Arts (BA)",
  "Bachelor of Science (BSc)",
  "Bachelor of Computer Applications (BCA)",
  "Bachelor of Business Administration (BBA)",
];
const staticMasters = [
  "Master of Commerce (MCom)",
  "Master of Arts (MA)",
  "Master of Science (MSc)",
  "Master of Computer Applications (MCA)",
  "Master of Business Administration (MBA)",
];
const staticPgDiplomas = [
  "Addiction Counselling",
  "Banking & Finance",
  "Beauty Therapy",
  "Business & Marketing",
  "Business Management",
  "Child Psychology",
  "Cognitive Behaviour Therapy",
  "Computer Application",
  "Cosmetology",
  "Counselling Psychology",
  "Disaster Risk Reduction",
  "Environmental & Social Governance",
  "Environmental Health & Safety",
  "Environmental Management",
  "Fashion & Creative Makeup",
  "Finance Management",
  "Fire & Safety",
  "Fire Fighting",
  "Fire Safety & Audit",
  "Fire Technology & Industrial Safety Operation",
  "GIS & Remote Sensing",
  "Hair Dressing",
  "Health Management",
  "Hospital & Tourism",
  "Hospital Management",
  "Hotel Management",
  "HR Management",
  "Industrial Safety",
  "Industrial Safety & Environment Management",
  "Journalism & Mass Communication",
  "Makeup Artistry",
  "Marketing",
  "Mass Communication",
  "Material Management",
  "Metallurgy",
  "Nail Technology",
  "Personal Management",
  "Personnel Management",
  "PGDIT",
  "Physical Education",
  "Rural Development",
  "Salon Management",
  "School Counselling",
  "Special Effects Makeup",
  "Special Need",
  "Styling & Makeup Artistry",
  "Script Writing & Direction",
  "Supply Chain Management"
];
const staticSkillPrograms = [
  "CARPET",
  "AUTOMOTIVE REPAIR",
  "FABRICATION",
  "ELECTRONICS",
  "FASHION DESIGN",
  "GARMENT MAKING",
  "HANDICRAFTS",
  "LEATHER AND FOOTWEAR",
  "PRINTING TECHNOLOGY",
  "POULTRY FARMING",
  "DAIRYING",
  "LIVESTOCK BREEDING",
  "ORGANIC FARMING",
  "HORTICULTURE AND FORESTRY",
  "APICULTURE AND SERICULTURE",
  "AGRICULTURE MACHINERY AND IMPLEMENTS SECTOR",
  "BEAUTY CULTURE",
  "HAIR STYLING",
  "SPA AND WELLNESS SECTOR",
  "RENEWABLE ENERGY AND POWER SECTOR",
  "GLASS DIVERSIFIED SECTOR",
  "CLAY ART SECTOR",
  "WATER RE-CYCLING AND SEWERAGE TREATMENT SECTOR",
  "COSMETOLOGY AND TRICHOLOGY SECTOR",
  "AEROSPACE AND AVIATION SECTOR",
  "TELECOM SECTOR",
  "COUNSELLING SKILLS SECTOR",
  "MARINE AND SHIPPING SECTOR",
  "HEALTH EDUCATION SECTOR",
  "REIKI SECTOR",
  "AYURVEDA SECTOR",
  "STED BEAUTY SCHOOL SECTOR",
  "COMPUTER SYSTEM AND APPLICATIONS SECTOR",
  "BUSINESS AND MANAGEMENT EDUCATION SECTOR",
  "MUSIC AND MEDIA SECTOR",
  "ALLIED HEALTH EDUCATION SECTOR",
  "CREATIVE ART AND CRAFTS SECTOR",
  "FIRE AND SAFETY SECTOR",
  "CIVIL ENGINEERING SECTOR",
  "TEXTILE SECTOR",
  "INTERIOR DESIGNING SECTOR",
  "TEXTILE RE-CYCLING SECTOR",
  "BEAUTY THERAPIST",
  "BEAUTY CONSULTANT",
  "FASHION DESIGNER",
  "SEWING MACHINE OPERATOR",
  "OFFICE ASSISTANT",
  "COMPUTER OPERATOR",
  "TALLY OPERATOR",
  "LOGISTICS COORDINATOR",
  "SOLAR TECHNICIAN",
  "SPINNING TECHNICIAN",
  "WEAVING TECHNICIAN",
  "YOGA TEACHER",
  "FIRE & SAFETY INSPECTOR",
  "CRAFT INSTRUCTOR",
  "DENTAL ASSISTANT",
  "NURSING ASSISTANT",
  "PHARMACY ASSISTANT",
  "PANJAKARMA THERAPIST",
  "SOUND ENGINEER",
  "VEDIO EDITOR",
  "PRE-SCHOOL TEACHER",
  "TAILORING",
  "REFRIGERATION & AC MECHANIC",
  "PLUMBER",
  "ELECTRICIAN",
  "DRAFTSMAN CIVIL",
  "DRAFTSMAN MECHANICAL",
  "HOTEL MANAGEMENT",
  "TOURIST GUIDE",
  "CATERING",
  "FOOD PRODUCTION",
  "NURSERY MANAGEMENT",
  "POULTRY FEED TECHNICIAN",
  "BEEKEEPER",
  "SILKWORM REARER",
  "FIBER OPTICS TECHNICIAN",
  "ROUTING AND SWITCHING",
  "CALL CENTER EXECUTIVE",
  "TENT DESIGNER",
  "EVENT MANAGER",
  "PHOTOGRAPHER",
  "GRAPHIC DESIGNER",
  "WEB DEVELOPER",
  "APP DEVELOPER",
  "CYBER SECURITY SPECIALIST",
  "CLOUDE ARCHITECT",
  "DATA ANALYST",
  "AI ENGINEER",
  "ROBOTIC TECHNICIAN",
  "3D PRINTING OPERATOR",
  "CNC MACHINE OPERATOR",
  "WELDING INSPECTOR",
  "NCTE APPROVED TRAINER",
  "PCI VERIFIED PHARMACIST",
  "BCI ADVOCATE ASSISTANT",
  "AIU REGISTRATION DESK OFFICER",
  "UGC COMPLIANCE SPECIALIST"
];

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("bachelors");
  const [highlightInquiry, setHighlightInquiry] = useState(false);
  const [dbPrograms, setDbPrograms] = useState([]);
  const [dbBranches, setDbBranches] = useState([]);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const res = await getPublicPrograms({ isActive: "true" });
        if (res.success) {
          setDbPrograms(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch programs:", err);
      }
    };
    const fetchBranches = async () => {
      try {
        const res = await getPublicBranches();
        if (res.success) {
          setDbBranches(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch branches:", err);
      }
    };
    fetchPrograms();
    fetchBranches();
  }, []);

  const bachelors = dbPrograms.filter((p) => p.programType === "Bachelors Degree");
  const bachelorsList = bachelors.length > 0
    ? bachelors
    : staticBachelors.map((name, i) => ({ _id: `fallback-bach-${i}`, name, isFallback: true }));

  const masters = dbPrograms.filter((p) => p.programType === "Masters Degree");
  const mastersList = masters.length > 0
    ? masters
    : staticMasters.map((name, i) => ({ _id: `fallback-mast-${i}`, name, isFallback: true }));

  const pgDiplomaBranches = dbBranches.filter(
    (b) => b.program && (b.program.programType === "PG Diploma" || b.program.programType === "PG Deploma")
  );
  const pgDiplomasList = pgDiplomaBranches.length > 0
    ? pgDiplomaBranches.map((b) => ({
      _id: b.program._id,
      name: b.name,
      isFallback: false
    }))
    : staticPgDiplomas.map((name, i) => ({ _id: `fallback-pgd-${i}`, name, isFallback: true }));

  const skillPrograms = dbPrograms.filter((p) => p.programType === "Skill Programs");
  const skillProgramsList = skillPrograms.length > 0
    ? skillPrograms
    : staticSkillPrograms.map((name, i) => ({ _id: `fallback-skill-${i}`, name, isFallback: true }));

  const programCategories = [
    {
      id: "bachelors",
      title: "Bachelors Degree",
      subtitle: "Undergraduate Education",
      count: `${bachelorsList.length} Programs`,
      icon: GraduationCap,
      color: "from-blue-600 to-indigo-600",
      accentColor: "#17468C",
      shadowColor: "rgba(23,70,140,0.15)",
      bgLight: "bg-blue-50/50",
      borderColor: "border-blue-100",
      description: "Establish a strong professional foundation with our industry-aligned undergraduate programs, delivering rigorous academic theory combined with core practical skills.",
      programs: bachelorsList,
    },
    {
      id: "masters",
      title: "Masters Degree",
      subtitle: "Postgraduate Excellence",
      count: `${mastersList.length} Programs`,
      icon: School,
      color: "from-[#B82424] to-red-500",
      accentColor: "#B82424",
      shadowColor: "rgba(184,36,36,0.15)",
      bgLight: "bg-red-50/50",
      borderColor: "border-red-100",
      description: "Advance your expertise and unlock executive leadership opportunities with our advanced, research-informed postgraduate degrees tailored for modern career demands.",
      programs: mastersList,
    },
    {
      id: "pg-diploma",
      title: "PG Diploma",
      subtitle: "Specialized Certifications",
      count: `${pgDiplomasList.length} Programs`,
      icon: ShieldCheck,
      color: "from-indigo-600 to-purple-600",
      accentColor: "#6366f1",
      shadowColor: "rgba(99,102,241,0.15)",
      bgLight: "bg-indigo-50/50",
      borderColor: "border-indigo-100",
      description: "Accelerate your professional path with focused, high-impact postgraduate diplomas designed to deliver targeted specialization in high-growth industries.",
      programs: pgDiplomasList,
    },
    {
      id: "skill-programs",
      title: "Skill Programs",
      subtitle: "Skilled & Practical Learning",
      count: `${skillProgramsList.length} Programs`,
      icon: Sparkles,
      color: "from-amber-600 to-orange-500",
      accentColor: "#d97706",
      shadowColor: "rgba(217,119,6,0.15)",
      bgLight: "bg-amber-50/50",
      borderColor: "border-amber-100",
      description: "Acquire high-income, job-ready capabilities with hands-on skill enhancement courses developed in direct collaboration with leading industry experts.",
      programs: skillProgramsList,
    },
  ];

  useEffect(() => {
    // Handle hash scrolling when the component mounts or hash changes
    const handleHashScroll = () => {
      const { hash } = window.location;
      if (hash) {
        const id = hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 100);
        }
      }
    };

    if (!isLoading) {
      handleHashScroll();
      // Also listen for hash changes
      window.addEventListener("hashchange", handleHashScroll);
      return () => window.removeEventListener("hashchange", handleHashScroll);
    }
  }, [isLoading]);

  const handlePartnerInquiry = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const centerName = e.target.centerName.value;
    const contactName = e.target.contactName.value;
    const phone = e.target.phone.value;
    const email = e.target.email.value;
    const address = e.target.address.value;

    try {
      const response = await axiosInstance.post("/admission-points/partner-inquiry", {
        centerName,
        contactName,
        phone,
        email,
        address,
      });

      if (response.data?.success) {
        dispatch(
          showAlert({
            type: "success",
            message:
              "Registration inquiry submitted! Our partnership team will review your application and contact you within 24 hours.",
          }),
        );
        e.target.reset();
      } else {
        throw new Error(response.data?.message || "Failed to submit inquiry.");
      }
    } catch (error) {
      console.error("Partner inquiry error:", error);
      dispatch(
        showAlert({
          type: "destructive",
          message:
            error.response?.data?.message ||
            error.message ||
            "Failed to submit inquiry. Please try again.",
        }),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background font-sans selection:bg-[#B82424] selection:text-white overflow-x-hidden">
      <AnimatePresence mode="wait">
        {isLoading && <LoadingScreen onFinished={() => setIsLoading(false)} />}
      </AnimatePresence>

      {!isLoading && (
        <div className="relative">
          <Navbar />

          {/* HERO SECTION */}
          <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-36 overflow-hidden bg-background">
            <div className="absolute inset-0 -z-10 h-full w-full bg-background [background:radial-gradient(125%_125%_at_50%_10%,var(--background)_40%,#17468c08_100%)]" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* Decorative background blur blobs */}
            <div className="absolute top-20 right-0 w-96 h-96 bg-[#17468C]/10 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-0 left-10 w-72 h-72 bg-[#B82424]/5 rounded-full blur-[80px] -z-10" />

            <div className="container mx-auto px-6">
              <div className="grid lg:grid-cols-12 gap-16 items-center">
                <motion.div
                  initial="initial"
                  animate="animate"
                  variants={staggerContainer}
                  className="lg:col-span-7 space-y-8"
                >
                  <motion.div
                    variants={fadeInUp}
                    className="cursor-pointer"
                    onClick={() => navigate("/register-admission-point")}
                  >
                    <Badge
                      variant="brandRed"
                      className="px-4 py-1.5 text-xs shadow-sm shadow-[#B82424]/10 border-[#B82424]/20 backdrop-blur-md bg-[#B82424]/5"
                    >
                      <Sparkles size={14} className="mr-2 text-[#B82424]" />
                      Inviting Admission Partners
                    </Badge>
                  </motion.div>

                  <motion.h1
                    variants={fadeInUp}
                    className="text-5xl lg:text-[4.5rem] font-bold text-foreground leading-[1.05] tracking-tight"
                  >
                    Empower <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#17468C] via-[#6366f1] to-[#B82424]">
                      Education Globally
                    </span>
                  </motion.h1>

                  <motion.p
                    variants={fadeInUp}
                    className="text-lg text-muted-foreground max-w-xl leading-relaxed"
                  >
                    Join us in expanding your global presence and reaching
                    qualified students worldwide through a single, easy-to-use
                    platform trusted by over 100 institutions. Revolutionize
                    education and fulfill your mission to educate the world.
                  </motion.p>

                  <motion.div
                    variants={fadeInUp}
                    className="flex flex-col sm:flex-row gap-4 pt-4"
                  >
                    <Button
                      variant="brandGradient"
                      size="lg"
                      onClick={() => navigate("/register-admission-point")}
                      className="rounded-full shadow-2xl shadow-[#bd0808]/25 text-lg font-bold hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 px-8 py-5 h-auto"
                    >
                      Join Education Network <ArrowRight size={18} className="ml-2.5 stroke-[2]" />
                    </Button>
                  </motion.div>

                  <motion.div
                    variants={fadeInUp}
                    className="pt-8"
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -30, filter: "blur(5px)" }}
                      whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.8, type: "spring", bounce: 0.25 }}
                      whileHover={{
                        scale: 1.02,
                        x: 4,
                        boxShadow: "0 20px 25px -5px rgba(23, 70, 140, 0.08), 0 8px 10px -6px rgba(23, 70, 140, 0.08)"
                      }}
                      className="relative bg-gradient-to-r from-[#17468C]/8 via-[#17468C]/2 to-transparent p-5 rounded-r-2xl max-w-xl flex flex-col sm:flex-row items-center sm:items-start gap-5 hover:from-[#17468C]/12 transition-all duration-300 group cursor-default shadow-sm border border-[#17468C]/10 border-l-0 pl-7 overflow-hidden"
                    >
                      {/* Infinite Shifting Gradient Left-Border Line */}
                      <motion.div
                        className="absolute left-0 top-0 bottom-0 w-[4px] rounded-l-2xl"
                        animate={{
                          background: [
                            "linear-gradient(to bottom, #17468C, #B82424)",
                            "linear-gradient(to bottom, #B82424, #17468C)",
                            "linear-gradient(to bottom, #17468C, #B82424)"
                          ]
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      />

                      {/* Floating Institutional Logo container */}
                      <motion.div
                        animate={{ y: [0, -3, 0] }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="w-16 h-16 bg-white p-2.5 rounded-xl border border-slate-100 shadow-md shrink-0 flex items-center justify-center group-hover:scale-108 group-hover:rotate-1 transition-all duration-300 relative overflow-hidden"
                      >
                        {/* Soft ambient aura behind logo */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#17468C]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <img
                          src={Ugc}
                          alt="UGC Logo"
                          className="w-full h-full object-contain filter drop-shadow-sm relative z-10"
                        />
                      </motion.div>

                      <div className="text-center sm:text-left space-y-2">
                        <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#17468C]/10 text-[#17468C] border border-[#17468C]/20">
                            <motion.span
                              animate={{ rotate: [0, 15, -15, 0] }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                              className="inline-block"
                            >
                              <Sparkles size={10} className="stroke-[3]" />
                            </motion.span>
                            Recognized by
                          </span>
                          <span className="h-3 w-px bg-border hidden sm:block" />
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            Academic Accreditation
                          </span>
                        </div>

                        <p className="text-sm sm:text-base font-extrabold text-foreground leading-snug tracking-tight">
                          Our partner University Is Recognized By{" "}
                          <span className="font-black text-[#17468C] relative inline-block">
                            University Grant's commission India ( UGC )
                            <motion.span
                              className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#17468C] to-[#B82424] rounded"
                              initial={{ width: 0 }}
                              whileInView={{ width: "100%" }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
                            />
                          </span>
                        </p>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                    filter: "blur(20px)",
                    y: 40,
                  }}
                  animate={
                    highlightInquiry
                      ? {
                        scale: [1, 1.06, 0.96, 1.02, 1],
                        rotateY: [0, 360],
                        z: [0, 40, -10, 5, 0],
                      }
                      : {
                        opacity: 1,
                        scale: 1,
                        filter: "blur(0px)",
                        y: 0,
                        rotateX: 0,
                        rotateY: 0,
                      }
                  }
                  transition={
                    highlightInquiry
                      ? {
                        duration: 2.5,
                        ease: "easeInOut",
                      }
                      : {
                        delay: 0.4,
                        duration: 1,
                        type: "spring",
                        bounce: 0.3,
                      }
                  }
                  style={{ perspective: 1000 }}
                  className="lg:col-span-5 relative group"
                >
                  {/* Glowing background blob behind the card */}
                  <div
                    className={cn(
                      "absolute -inset-1 bg-gradient-to-r from-[#17468C] to-[#B82424] rounded-[1.5rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-700 pointer-events-none",
                      highlightInquiry && "opacity-60 scale-105",
                    )}
                  />

                  <Card
                    id="partner-inquiry-form"
                    className={cn(
                      "shadow-2xl relative overflow-hidden bg-card/80 backdrop-blur-2xl transition-all duration-500 rounded-[1.5rem]",
                      highlightInquiry
                        ? "border-[#17468C] ring-4 ring-[#17468C]/15 shadow-[#17468C]/20 scale-[1.03]"
                        : "border-border shadow-foreground/5",
                    )}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#17468C]/5 to-transparent rounded-bl-full pointer-events-none" />
                    <CardHeader className="relative z-10 space-y-2 pb-4 pt-8 px-8">
                      <CardTitle
                        className={cn(
                          "text-3xl font-black transition-all duration-500 text-transparent bg-clip-text bg-gradient-to-r select-none",
                          highlightInquiry
                            ? "from-[#B82424] to-red-500 scale-[1.02]"
                            : "from-[#17468C] to-[#6366f1]"
                        )}
                      >
                        Partner Enquiry
                      </CardTitle>
                      <CardDescription>
                        Register for admission partnerships now
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="relative z-10 px-8">
                      <form
                        onSubmit={handlePartnerInquiry}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="centerName">Center Name</Label>
                            <Input
                              id="centerName"
                              required
                              placeholder="Your center name"
                              className="bg-background/50 border-border/60 focus:bg-background transition-colors"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="contactName">
                              Contact Person Name
                            </Label>
                            <Input
                              id="contactName"
                              required
                              placeholder="John Doe"
                              className="bg-background/50 border-border/60 focus:bg-background transition-colors"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">
                            Contact Person Phone Number
                          </Label>
                          <Input
                            id="phone"
                            required
                            placeholder="+91 00000 00000"
                            className="bg-background/50 border-border/60 focus:bg-background transition-colors"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Contact Person Email</Label>
                          <Input
                            id="email"
                            required
                            type="email"
                            placeholder="john@example.com"
                            className="bg-background/50 border-border/60 focus:bg-background transition-colors"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="address">Center Address</Label>
                          <Textarea
                            id="address"
                            required
                            placeholder="Enter complete office address"
                            className="bg-background/50 border-border/60 focus:bg-background transition-colors resize-none"
                          />
                        </div>

                        <Button
                          type="submit"
                          variant="none"
                          size="none"
                          disabled={isSubmitting}
                          className="w-full mt-4 py-5 px-8 rounded-full font-bold bg-gradient-to-r from-[#0052cc] to-[#00297a] text-white shadow-2xl shadow-[#0052cc]/25 hover:shadow-[#0052cc]/40 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group tracking-wide text-lg h-auto cursor-pointer"
                        >
                          {/* Premium subtle shine overlay */}
                          <div className="animate-shine pointer-events-none" />

                          <span className="flex items-center justify-center gap-2">
                            {isSubmitting ? (
                              <>
                                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                                Submitting Enquiry...
                              </>
                            ) : (
                              <>
                                Submit
                                <ArrowRight size={18} className="ml-.5 stroke-[2] transition-transform duration-300 group-hover:translate-x-1" />
                              </>
                            )}
                          </span>
                        </Button>
                      </form>
                    </CardContent>

                    <CardFooter className="justify-center pt-4 pb-8 relative z-10 bg-muted/50 mt-6 border-t border-border/50">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-[#17468C]/50" />{" "}
                        Secure Data Processing
                      </p>
                    </CardFooter>
                  </Card>
                </motion.div>
              </div>
            </div>
          </section>

          {/* UNIVERSITY CARDS */}
          <section id="universities" className="pb-32 bg-muted relative">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-background to-transparent pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, type: "spring" }}
                className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20"
              >
                <div className="max-w-2xl space-y-4">
                  <Badge variant="brandBlue" className="px-3 py-1 shadow-sm">
                    Academic Excellence
                  </Badge>
                  <h2 className="text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
                    Primary University Partners
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    World-class institutions recognized by the University Grants
                    Commission.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="group rounded-full shadow-sm hover:shadow-md hover:border-border transition-all text-base font-semibold"
                >
                  View All Partners{" "}
                  <ArrowRight
                    size={16}
                    className="ml-2 group-hover:translate-x-1 transition-transform"
                  />
                </Button>
              </motion.div>

              <div className="max-w-6xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    duration: 0.8,
                    type: "spring",
                    bounce: 0.3,
                  }}
                >
                  <Card className="hover:shadow-2xl hover:shadow-[#17468C]/5 transition-all duration-500 border-border bg-card/60 backdrop-blur-sm relative overflow-hidden group rounded-[2rem] p-8 md:p-12">
                    {/* Shine effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-foreground/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none z-20" />

                    <div className="grid lg:grid-cols-12 gap-10 items-center">
                      {/* Left: Info Details */}
                      <div className="lg:col-span-7 space-y-8">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                          <div className="p-4 rounded-2xl bg-white border-2 border-blue-500/20 shadow-xl shadow-blue-500/10 w-24 h-24 flex items-center justify-center shrink-0">
                            <img
                              src={GlobalUniversityLogo}
                              alt="Global University"
                              className="w-16 h-16 object-contain"
                            />
                          </div>
                          <div>
                            <h3 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
                              The Global University,{" "}
                              <span className="text-2xl font-semibold text-foreground/80">India,</span>{" "}
                              <span className="text-lg font-medium text-foreground/60">Arunachal Pradesh</span>
                            </h3>
                          </div>
                        </div>

                        <p className="text-lg text-muted-foreground leading-relaxed">
                          Widely recognized as a beacon of academic excellence and innovation in Arunachal Pradesh. Since 2024, it has been known among the top education institutions in India, shaping minds and empowering positive impact through premium UGC-approved programs.
                        </p>

                        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border/60">
                          {[
                            { label: "Recognition", value: "Prominent Institution" },
                            { label: "Focus", value: "Innovation & Impact" },
                          ].map((stat, idx) => (
                            <div key={idx} className="space-y-1">
                              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                {stat.label}
                              </p>
                              <p className="text-xl font-extrabold text-foreground">
                                {stat.value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Campus Grid */}
                      <div className="lg:col-span-5 relative">
                        <div className="grid grid-cols-4 grid-rows-2 gap-3 h-64 md:h-80">
                          {/* Large Image (Left, 2x2) */}
                          <div className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden group shadow-md border border-border/50">
                            <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-transparent group-hover:opacity-0 transition-opacity duration-500 z-10 pointer-events-none" />
                            <img
                              src={TguWebp}
                              alt="Campus View 1"
                              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                            />
                          </div>
                          {/* Medium Wide Image (Top Right, 2x1) */}
                          <div className="col-span-2 row-span-1 relative rounded-2xl overflow-hidden group shadow-sm border border-border/50">
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500 z-10 pointer-events-none" />
                            <img
                              src={TguImg2}
                              alt="Campus View 2"
                              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                            />
                          </div>
                          {/* Small Image (Bottom Right 1, 1x1) */}
                          <div className="col-span-1 row-span-1 relative rounded-2xl overflow-hidden group shadow-sm border border-border/50">
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500 z-10 pointer-events-none" />
                            <img
                              src={TguImg1}
                              alt="Campus View 3"
                              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                            />
                          </div>
                          {/* Small Image (Bottom Right 2, 1x1) */}
                          <div className="col-span-1 row-span-1 relative rounded-2xl overflow-hidden group shadow-sm border border-border/50">
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500 z-10 pointer-events-none" />
                            <img
                              src={TguImg3}
                              alt="Campus View 4"
                              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </div>
            </div>
          </section>

          {/* RECRUITMENT PATHWAYS */}
          <section
            id="partnership"
            className="py-32 bg-slate-950 text-slate-50 overflow-hidden relative"
          >
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-[#17468C]/20 to-transparent blur-[120px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#B82424]/10 to-transparent blur-[100px] rounded-full pointer-events-none -translate-x-1/3 translate-y-1/3" />

            <div className="container mx-auto px-6 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, type: "spring" }}
                className="text-center max-w-3xl mx-auto mb-20 space-y-6"
              >
                <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-white">
                  Partner Ecosystem
                </h2>
                <p className="text-white/60 text-lg leading-relaxed">
                  Choose your pathway and start your journey as an official 6A
                  Skillcity partner.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                {[
                  {
                    title: "Application Point",
                    subtitle: "Application Recruitment",
                    description:
                      "6A Skillcity invites ADMISSION APPLICATION POINT from across India to partner and facilitate the admission process for students. Partnering with us allows admission recruiters to streamline the admission process for students, providing them with access to a diverse range of UGC-approved courses.",
                    color: "text-blue-400",
                    hoverGradient:
                      "from-[#17468C]/20 via-[#17468C]/5 to-transparent",
                    bgBadge:
                      "bg-[#17468C]/20 text-blue-300 border border-[#17468C]/30",
                    buttonClass:
                      "bg-gradient-to-r from-[#1570ff] to-[#0949d0] shadow-[#1570ff]/25 hover:shadow-[#1570ff]/40 border-transparent",
                    points: [
                      "Assist students in the application process for The Global University programs.",
                      "Provide guidance and support to applicants throughout the admission journey.",
                      "Serve as a local point of contact for prospective students in your region.",
                      "Contribute to the promotion of The Global University academic offerings.",
                      "Play a key role in expanding access to quality education and fostering growth.",
                    ],
                  },
                  {
                    title: "Skill Training Centres",
                    subtitle: "Skill-Based Learning",
                    description:
                      "6A Skillcity recognizes the importance of skill education in preparing students for the dynamic demands of the workforce. We invite skill education centers across India to partner with us in offering specialized courses that cater to the needs of various industries.",
                    color: "text-red-400",
                    hoverGradient:
                      "from-[#B82424]/20 via-[#B82424]/5 to-transparent",
                    bgBadge:
                      "bg-[#B82424]/20 text-red-300 border border-[#B82424]/30",
                    buttonClass:
                      "bg-gradient-to-r from-[#e60000] to-[#990000] shadow-[#e60000]/25 hover:shadow-[#e60000]/40 border-transparent",
                    points: [
                      "Offer The Global University skill-enhancing programs to your students.",
                      "Provide hands-on training and practical experience in alignment with industry requirements.",
                      "Empower students with the skills and knowledge necessary for successful career pathways.",
                      "Enhance your institution’s reputation as a provider of holistic education with a focus on employability.",
                      "Contribute to bridging the gap between academia and industry.",
                    ],
                  },
                  {
                    title: "Skill Testing Centres",
                    subtitle: "Skill Testing & Certification",
                    description:
                      "6A Skillcity invites SKILL TESTING CENTRES to partner with us in facilitating assessments for individuals who possess practical skills but lack formal certification. Our partner universities evaluate their real-world expertise and award UGC-approved certificates to validate their capabilities.",
                    color: "text-emerald-400",
                    hoverGradient:
                      "from-[#10b981]/20 via-[#10b981]/5 to-transparent",
                    bgBadge:
                      "bg-[#10b981]/20 text-emerald-300 border border-[#10b981]/30",
                    buttonClass:
                      "bg-gradient-to-r from-[#0a3382] via-[#63163a] to-[#bd0808] shadow-[#bd0808]/25 hover:shadow-[#bd0808]/40 border-transparent",
                    points: [
                      "Partner with universities to test and evaluate candidates' existing practical skills.",
                      "Facilitate formal UGC-approved certification for experienced individuals.",
                      "Provide assessment pathways for skilled workers without formal academic qualifications.",
                      "Serve as a verified testing venue for Recognition of Prior Learning (RPL).",
                      "Empower professionals with credentials that validate their real-world expertise.",
                    ],
                  },
                ].map((path, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
                    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    viewport={{ once: true }}
                    transition={{
                      delay: i * 0.2,
                      duration: 0.8,
                      type: "spring",
                      bounce: 0.3,
                    }}
                    className="h-full"
                  >
                    <Card className="bg-white/5 backdrop-blur-xl border-white/10 text-white h-full flex flex-col relative overflow-hidden group hover:border-white/20 transition-all duration-500 shadow-2xl rounded-3xl">
                      {/* Animated gradient background on hover */}
                      <div
                        className={cn(
                          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-gradient-to-br",
                          path.hoverGradient,
                        )}
                      />

                      <CardHeader className="pb-8 pt-10 px-10 relative z-10">
                        <div className="mb-6">
                          <span
                            className={cn(
                              "inline-flex px-4 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-inner",
                              path.bgBadge,
                            )}
                          >
                            {path.subtitle}
                          </span>
                        </div>
                        <CardTitle className="text-4xl font-bold text-white group-hover:translate-x-2 transition-transform duration-500">
                          {path.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow space-y-6 px-10 relative z-10">
                        {path.description && (
                          <p className="text-white/50 text-[15px] leading-relaxed mb-6 line-clamp-4 group-hover:line-clamp-none transition-all duration-500">
                            {path.description}
                          </p>
                        )}

                        {path.points.map((point, idx) => (
                          <div key={idx} className="flex items-center gap-4">
                            <CheckCircle
                              size={22}
                              className={cn(
                                "transition-transform duration-500 group-hover:scale-125",
                                path.color,
                              )}
                            />
                            <span className="text-white/70 font-medium text-lg">
                              {point}
                            </span>
                          </div>
                        ))}
                      </CardContent>
                      <CardFooter className="px-10 pb-10 pt-6 relative z-10">
                        <Button
                          variant="none"
                          size="none"
                          className={cn(
                            "w-full py-5 px-8 rounded-full text-white font-bold tracking-wide transition-all duration-300 group/btn relative overflow-hidden cursor-pointer shadow-2xl hover:-translate-y-1 border-transparent text-lg h-auto",
                            path.buttonClass
                          )}
                          onClick={() => navigate("/register-admission-point")}
                        >
                          <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 -translate-x-[150%] group-hover/btn:animate-[shine_1.5s_ease-in-out_infinite]" />
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            Be a Partner
                            <ArrowRight size={18} className="transition-transform duration-300 group-hover/btn:translate-x-1" />
                          </span>
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ABOUT SECTION */}
          <section
            id="about"
            className="py-24 bg-background relative overflow-hidden"
          >
            <div className="container mx-auto px-6">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -50, filter: "blur(10px)" }}
                  whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, type: "spring" }}
                  className="space-y-8"
                >
                  <div className="space-y-4">
                    <Badge variant="brandRed" className="px-3 py-1 shadow-sm">
                      Who We Are
                    </Badge>
                    <h2 className="text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-tight">
                      About <span className="text-[#17468C]">6A Skillcity</span>
                    </h2>
                  </div>

                  <div className="space-y-6">
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      6A Skillcity serves as a national admission partner of{" "}
                      <span className="text-foreground font-semibold">
                        The Global University, India, Arunachal Pradesh
                      </span>{" "}
                      handling all admission affairs. The foundation connects
                      admission application point and skill education
                      centers with The
                      Global University.
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      With a commitment to fostering educational growth and
                      facilitating access to quality education, 6A Skillcity
                      plays a pivotal role in connecting aspiring students with
                      {/* Bir Tikendrajit University, */}
                      The Global University’s diverse range of programs.
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed italic border-l-4 border-[#B82424] pl-6 py-2">
                      "As an admission partner, 6A Skillcity contributes to the
                      advancement of education by promoting collaboration and
                      synergy between educational institutions and{" "}
                      {/* Bir
                      Tikendrajit University & */}{" "}
                      The Global University."
                    </p>
                  </div>

                  <div className="flex items-center gap-6 pt-4">
                    <div className="flex -space-x-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="w-12 h-12 rounded-full border-4 border-background bg-slate-200 overflow-hidden shadow-lg"
                        >
                          <img
                            src={`https://i.pravatar.cc/150?u=${i + 10}`}
                            alt="User"
                          />
                        </div>
                      ))}
                      <div className="w-12 h-12 rounded-full border-4 border-background bg-[#17468C] flex items-center justify-center text-white text-xs font-bold shadow-lg">
                        +80k
                      </div>
                    </div>
                    <div className="text-sm">
                      <p className="font-bold text-foreground">
                        Trusted by Students
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
                  whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 1, type: "spring", bounce: 0.3 }}
                  className="relative"
                >
                  {/* Decorative Elements */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#17468C]/10 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#B82424]/10 rounded-full blur-3xl animate-pulse" />

                  <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-border group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#17468C]/20 to-transparent mix-blend-overlay z-10" />
                    <img
                      src={AboutImg}
                      alt="Education Building"
                      className="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    <div className="absolute bottom-8 left-8 right-8 z-20">
                      <Card className="bg-white/10 backdrop-blur-xl border-white/20 text-white shadow-2xl">
                        <CardContent className="p-6 pt-6">
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-white/20">
                              <GraduationCap className="text-white" size={32} />
                            </div>
                            <div>
                              <p className="text-xl font-bold">
                                Official TGU Admission Partner
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* MISSION & VISION SECTION */}
          <section id="mission-vision" className="py-24 bg-gradient-to-b from-background to-muted/20 relative overflow-hidden">
            {/* Ambient decorative glowing blobs */}
            <div className="absolute top-1/3 left-10 w-96 h-96 bg-[#17468C]/5 rounded-full blur-[100px] pointer-events-none -z-10" />
            <div className="absolute bottom-1/3 right-10 w-96 h-96 bg-[#B82424]/5 rounded-full blur-[100px] pointer-events-none -z-10" />

            <div className="container mx-auto px-6 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, type: "spring" }}
                className="text-center max-w-3xl mx-auto mb-20 space-y-4"
              >
                <Badge variant="brandRed" className="px-4 py-1.5 text-xs shadow-sm shadow-[#B82424]/5 border-[#B82424]/15 backdrop-blur-md bg-[#B82424]/5">
                  Our Purpose & Future
                </Badge>
                <h2 className="text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-none">
                  Mission & Vision
                </h2>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                  Guiding our efforts to bridge the gap between aspirations and achievements, creating a world of borderless opportunities.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-10 items-stretch">
                {/* Our Mission Card */}
                <motion.div
                  initial={{ opacity: 0, x: -40, filter: "blur(10px)" }}
                  whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, type: "spring", bounce: 0.2 }}
                  className="h-full"
                >
                  <Card className="h-full bg-card/60 backdrop-blur-xl border-border hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#B82424]/5 transition-all duration-500 rounded-3xl relative overflow-hidden group p-8 md:p-10 flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#B82424]/5 to-transparent rounded-bl-full pointer-events-none" />

                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="p-4 rounded-2xl bg-[#B82424]/10 text-[#B82424] shadow-lg shadow-[#B82424]/10 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                          <Target size={32} />
                        </div>
                        <div>
                          <h3 className="text-3xl font-extrabold text-foreground tracking-tight">Our Mission</h3>
                          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mt-0.5">Empowering potential through education</p>
                        </div>
                      </div>

                      <p className="text-lg text-muted-foreground leading-relaxed">
                        To democratize high-quality skill development and academic excellence across India by establishing a seamless, technology-driven partnership network. We aim to empower application, training, and testing centers, enabling every student to access UGC-approved, industry-aligned education.
                      </p>

                      <ul className="space-y-3.5 pt-2">
                        {[
                          "Provide nationwide access to premium UGC-approved degree pathways.",
                          "Equip learners with employment-ready skills matching global standards.",
                          "Bridge the critical gap between traditional academia and modern industries."
                        ].map((point, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <CheckCircle size={18} className="text-[#B82424] mt-1 shrink-0" />
                            <span className="text-muted-foreground font-medium">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-8 border-t border-border/50 mt-8 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-[#B82424]">
                      <span>Action Driven</span>
                      <Sparkles size={16} className="animate-pulse" />
                    </div>
                  </Card>
                </motion.div>

                {/* Our Vision Card */}
                <motion.div
                  initial={{ opacity: 0, x: 40, filter: "blur(10px)" }}
                  whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, type: "spring", bounce: 0.2 }}
                  className="h-full"
                >
                  <Card className="h-full bg-card/60 backdrop-blur-xl border-border hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#17468C]/5 transition-all duration-500 rounded-3xl relative overflow-hidden group p-8 md:p-10 flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#17468C]/5 to-transparent rounded-bl-full pointer-events-none" />

                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="p-4 rounded-2xl bg-[#17468C]/10 text-[#17468C] shadow-lg shadow-[#17468C]/10 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                          <Eye size={32} />
                        </div>
                        <div>
                          <h3 className="text-3xl font-extrabold text-foreground tracking-tight">Our Vision</h3>
                          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mt-0.5">The future of skilled learning</p>
                        </div>
                      </div>

                      <p className="text-lg text-muted-foreground leading-relaxed">
                        To become the nation's premier catalyst for skilled and academic transformation, fostering a future-ready workforce. We envision an ecosystem where practical expertise and formal recognition unite, creating borderless opportunities for lifelong learning, global competence, and sustainable career success.
                      </p>

                      <ul className="space-y-3.5 pt-2">
                        {[
                          "Build a borderless community of certified, highly skilled professionals.",
                          "Pioneer Recognition of Prior Learning (RPL) on a national scale.",
                          "Be the benchmark of excellence for academic-skilled integration.",
                          "Drive continuous economic empowerment through localized education pathways."
                        ].map((point, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <CheckCircle size={18} className="text-[#17468C] mt-1 shrink-0" />
                            <span className="text-muted-foreground font-medium">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-8 border-t border-border/50 mt-8 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-[#17468C]">
                      <span>Future Focused</span>
                      <Sparkles size={16} className="animate-pulse" />
                    </div>
                  </Card>
                </motion.div>
              </div>
            </div>
          </section>

          {/* ACADEMIC PROGRAMS SECTION */}
          <section id="programs" className="py-28 bg-muted/30 relative overflow-hidden">
            {/* Ambient decorative glowing blobs */}
            <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-[#17468C]/5 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-[#B82424]/5 rounded-full blur-[120px] pointer-events-none -z-10" />

            <div className="container mx-auto px-6 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, type: "spring" }}
                className="text-center max-w-3xl mx-auto mb-20 space-y-4"
              >
                <Badge variant="brandBlue" className="px-4 py-1.5 text-xs shadow-sm shadow-[#17468C]/5 border-[#17468C]/15 backdrop-blur-md bg-[#17468C]/5">
                  Curriculum & Pathways
                </Badge>
                <h2 className="text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-none">
                  Academic Programs
                </h2>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                  Explore our comprehensive array of certified degree pathways and specialized industry-led skill programs.
                </p>
              </motion.div>

              <div className="grid lg:grid-cols-12 gap-10 items-start">
                {/* Left Side: Category Tabs Selector */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                  {programCategories.map((cat, idx) => {
                    const CatIcon = cat.icon;
                    const isActive = activeCategory === cat.id;

                    return (
                      <motion.button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1, duration: 0.5 }}
                        className={cn(
                          "w-full flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 text-left cursor-pointer group relative overflow-hidden",
                          isActive
                            ? "bg-white shadow-xl shadow-foreground/5 border-border scale-[1.02]"
                            : "bg-white/40 backdrop-blur-sm border-border/60 hover:bg-white/80 hover:border-border hover:shadow-md"
                        )}
                      >
                        {/* Dynamic category active vertical ribbon */}
                        {isActive && (
                          <motion.div
                            layoutId="activeRibbon"
                            className={cn(
                              "absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b",
                              cat.color
                            )}
                          />
                        )}

                        <div className="flex items-center gap-4 relative z-10">
                          <div
                            className={cn(
                              "p-3 rounded-xl transition-all duration-300",
                              isActive
                                ? "bg-gradient-to-br text-white shadow-md shadow-foreground/5"
                                : "bg-muted text-muted-foreground group-hover:bg-white group-hover:text-foreground"
                            )}
                            style={isActive ? { backgroundImage: `linear-gradient(to bottom right, ${cat.accentColor}, ${cat.accentColor}dd)` } : {}}
                          >
                            <CatIcon size={22} className="transition-transform duration-500 group-hover:rotate-3" />
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-[15px] leading-tight">
                              {cat.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                              {cat.subtitle}
                            </p>
                          </div>
                        </div>

                        <div className="relative z-10 flex flex-col items-end gap-1">
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-[10px] font-bold tracking-wide transition-colors",
                              isActive ? "bg-muted text-foreground" : "bg-muted/50 text-muted-foreground"
                            )}
                          >
                            {cat.count}
                          </Badge>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Right Side: Tab Panel Content Card */}
                <div className="lg:col-span-8 w-full min-w-0">
                  <AnimatePresence mode="wait">
                    {programCategories.map((cat) => {
                      if (activeCategory !== cat.id) return null;
                      const CatIcon = cat.icon;

                      return (
                        <motion.div
                          key={cat.id}
                          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                          exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                          transition={{ duration: 0.4 }}
                          className="bg-card/85 backdrop-blur-xl border border-border shadow-2xl shadow-foreground/5 rounded-[2.5rem] p-6 sm:p-8 md:p-10 relative overflow-hidden"
                        >
                          {/* Corner ambient glow inside panel */}
                          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br opacity-[0.03] rounded-bl-full pointer-events-none" style={{ backgroundImage: `linear-gradient(to bottom right, ${cat.accentColor}, transparent)` }} />

                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/60 mb-8">
                            <div className="flex items-center gap-4">
                              <div
                                className="p-4 rounded-2xl text-white shadow-lg shrink-0"
                                style={{
                                  background: `linear-gradient(to bottom right, ${cat.accentColor}, ${cat.accentColor}dd)`,
                                  boxShadow: `0 8px 25px ${cat.shadowColor}`
                                }}
                              >
                                <CatIcon size={28} />
                              </div>
                              <div>
                                <h3 className="text-3xl font-extrabold text-foreground tracking-tight leading-tight">
                                  {cat.title}
                                </h3>
                                <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mt-1">
                                  {cat.subtitle}
                                </p>
                              </div>
                            </div>

                            <Badge
                              className="px-4 py-1.5 text-xs font-bold text-white border-transparent self-start md:self-auto w-fit"
                              style={{
                                background: `linear-gradient(to right, ${cat.accentColor}, ${cat.accentColor}cc)`
                              }}
                            >
                              {cat.count} Available
                            </Badge>
                          </div>

                          <div className="space-y-8">
                            <p className="text-[17px] text-muted-foreground leading-relaxed">
                              {cat.description}
                            </p>

                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                                Available Specializations
                              </p>
                              <div
                                className={cn(
                                  "transition-all duration-500 ease-in-out",
                                  (cat.id === "skill-programs" || cat.id === "pg-diploma") ? "max-h-[420px] overflow-y-auto pr-3 py-2 scroll-smooth custom-scrollbar" : ""
                                )}
                                style={
                                  (cat.id === "skill-programs" || cat.id === "pg-diploma")
                                    ? {
                                      scrollbarWidth: "thin",
                                      scrollbarColor: `${cat.accentColor}33 transparent`,
                                    }
                                    : {}
                                }
                              >
                                <style dangerouslySetInnerHTML={{
                                  __html: `
                                  .custom-scrollbar::-webkit-scrollbar {
                                    width: 6px;
                                  }
                                  .custom-scrollbar::-webkit-scrollbar-track {
                                    background: transparent;
                                  }
                                  .custom-scrollbar::-webkit-scrollbar-thumb {
                                    background-color: ${cat.accentColor}33;
                                    border-radius: 20px;
                                  }
                                  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                                    background-color: ${cat.accentColor}66;
                                  }
                                `}} />
                                <div className="grid sm:grid-cols-2 gap-4">
                                  {cat.programs.map((prog, pIdx) => (
                                    <motion.div
                                      key={prog._id}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: Math.min(pIdx, 20) * 0.03, duration: 0.3 }}
                                      onClick={() => {
                                        if (!prog.isFallback) {
                                          navigate(`/specialization/${prog._id}`);
                                        }
                                      }}
                                      className={cn(
                                        "flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/80 hover:border-border hover:bg-background hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group/item min-w-0",
                                        prog.isFallback ? "cursor-default" : "cursor-pointer hover:border-primary/20 hover:shadow-primary/5"
                                      )}
                                    >
                                      <div className="flex items-center gap-3 min-w-0 mr-2">
                                        <CheckCircle
                                          size={18}
                                          className="transition-colors duration-300 shrink-0"
                                          style={{ color: cat.accentColor }}
                                        />
                                        <span className="font-semibold text-foreground/80 group-hover/item:text-foreground transition-colors uppercase text-sm sm:text-base tracking-tight truncate break-words">
                                          {prog.name}
                                        </span>
                                      </div>
                                      <ArrowRight
                                        size={14}
                                        className={cn(
                                          "transition-all duration-300 shrink-0",
                                          prog.isFallback
                                            ? "text-muted-foreground/0 group-hover/item:text-muted-foreground/100 group-hover/item:translate-x-0.5"
                                            : "text-muted-foreground group-hover/item:text-primary group-hover/item:translate-x-0.5"
                                        )}
                                      />
                                    </motion.div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="pt-4">
                              <Button
                                variant="none"
                                size="none"
                                className="px-8 py-5 rounded-full font-bold bg-gradient-to-r from-[#0052cc] to-[#00297a] text-white shadow-2xl shadow-[#0052cc]/25 hover:shadow-[#0052cc]/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer text-lg h-auto w-full sm:w-auto"
                                onClick={() => {
                                  const el = document.getElementById("contact");
                                  if (el) el.scrollIntoView({ behavior: "smooth" });
                                }}
                              >
                                Enquire Now
                                <ArrowRight size={18} className="transition-transform duration-300 hover:translate-x-1" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </section>

          {/* WHY PARTNER SECTION */}
          <section
            id="why-partner"
            className="py-32 bg-slate-50 relative overflow-hidden"
          >
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#17468C]/5 to-transparent rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#B82424]/5 to-transparent rounded-full blur-[100px] pointer-events-none -translate-x-1/3 translate-y-1/3" />

            <div className="container mx-auto px-6 relative z-10">
              <div className="flex flex-col lg:flex-row gap-16">
                {/* Left Side: Sticky Header & Image */}
                <div className="lg:w-1/3 lg:sticky lg:top-32 h-fit space-y-8">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                  >
                    <Badge variant="brandRed" className="mb-4">
                      Partnership Benefits
                    </Badge>
                    <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
                      Why Partner with <br />
                      <span className="text-[#17468C]">6A Skillcity?</span>
                    </h2>
                    <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
                      Join a network of excellence and unlock unparalleled
                      growth for your institution with our comprehensive support
                      and global recognition.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-white/20 bg-white"
                  >
                    <img
                      src={PartnershipIllustration}
                      alt="Partnership Illustration"
                      className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                    />
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end p-6">
                      <p className="text-white font-semibold text-lg drop-shadow-md">
                        Empowering Education Together
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="hidden lg:block pt-4"
                  >
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full rounded-xl py-6 text-lg font-bold shadow-xl shadow-[#17468C]/20 hover:-translate-y-1 transition-all"
                      onClick={() => (window.location.href = "#contact")}
                    >
                      Contact Us Now
                    </Button>
                  </motion.div>
                </div>

                {/* Right Side: Cards Grid */}
                <div className="lg:w-2/3">
                  <div className="grid sm:grid-cols-2 gap-6">
                    {[
                      {
                        title: "UGC Approved Courses",
                        desc: "Our partner institution courses are approved by the University Grants Commission (UGC), guaranteeing quality education and recognized certifications.",
                        color: "from-red-50 to-red-100/50",
                        textColor: "text-[#B82424]",
                        borderColor: "border-red-200",
                        image: Ugc,
                      },
                      {
                        title: "Government of Arunachal Pradesh",
                        desc: "Recognized and supported by the Government of Arunachal Pradesh for academic excellence.",
                        color: "from-yellow-50 to-yellow-100/50",
                        textColor: "text-[#A59200]",
                        borderColor: "border-yellow-200",
                        image: ManipurGovt,
                      },
                      {
                        title: "Association of Indian Universities (AIU)",
                        desc: "Membership by AIU ensuring global equivalence.",
                        color: "from-indigo-50 to-indigo-100/50",
                        textColor: "text-indigo-700",
                        borderColor: "border-indigo-200",
                        image: Aiu,
                      },
                      {
                        title: "Expanded Reach",
                        desc: "Partnering with us allows admission point to expand their reach and attract more students globally.",
                        color: "from-pink-50 to-pink-100/50",
                        textColor: "text-pink-700",
                        borderColor: "border-pink-200",
                        image: Reach,
                      },
                      {
                        title: "Increased Admissions",
                        desc: "As our esteemed partner, you can benefit from increased admissions and expand your student base.",
                        color: "from-violet-50 to-violet-100/50",
                        textColor: "text-violet-700",
                        borderColor: "border-violet-200",
                        image: IncreasedAdmission,
                      },
                      {
                        title: "Holistic Development",
                        desc: "Our focus ensures students excel academically and develop essential life skills for success.",
                        color: "from-amber-50 to-amber-100/50",
                        textColor: "text-amber-700",
                        borderColor: "border-amber-200",
                        image: Holistic,
                      },
                    ].map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{
                          delay: (idx % 2) * 0.1,
                          duration: 0.6,
                          type: "spring",
                        }}
                        className={cn(
                          "group relative bg-white rounded-[2rem] p-6 shadow-xl shadow-foreground/5 border transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl overflow-hidden",
                          item.borderColor,
                          idx === 8 && "sm:col-span-2 max-w-md mx-auto w-full", // Center the last item
                        )}
                      >
                        {/* Background subtle gradient hover effect */}
                        <div
                          className={cn(
                            "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
                            item.color,
                          )}
                        />

                        <div className="relative z-10 flex flex-col h-full">
                          <div className="mb-6 h-16 flex items-center justify-start">
                            <div className="p-3 bg-white shadow-sm border border-border/50 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="h-14 object-contain"
                              />
                            </div>
                          </div>
                          <div className="space-y-3 flex-grow">
                            <h4
                              className={cn(
                                "font-bold text-lg leading-tight transition-colors duration-300",
                                item.textColor,
                              )}
                            >
                              {item.title}
                            </h4>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                              {item.desc}
                            </p>
                          </div>

                          <div className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                            Know more{" "}
                            <ArrowRight
                              size={14}
                              className="group-hover:translate-x-1 transition-transform"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Mobile contact button */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="lg:hidden mt-12"
                  >
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full rounded-xl py-6 text-lg font-bold shadow-xl shadow-[#17468C]/20 hover:-translate-y-1 transition-all"
                      onClick={() => (window.location.href = "#contact")}
                    >
                      Contact Us Now
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA BANNER SECTION */}
          <section className="py-24 bg-background relative overflow-hidden">
            <div className="container mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, type: "spring" }}
                className="relative rounded-[3rem] overflow-hidden bg-gradient-to-br from-[#17468C] via-[#0d2244] to-[#B82424] px-8 py-16 md:py-24 shadow-2xl text-white border border-white/10"
              >
                {/* Abstract grid & wavy glowing overlays */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08),transparent_70%)] pointer-events-none" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                {/* Floating ambient accent shapes */}
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />

                <div className="relative z-10 grid lg:grid-cols-12 gap-12 items-center max-w-6xl mx-auto">
                  {/* Left Column: Asymmetrical Typography and Value Proposition */}
                  <div className="lg:col-span-4 space-y-6 text-left">
                    <Badge
                      variant="none"
                      className="px-4 py-1.5 rounded-full text-xs font-bold tracking-wider text-white border border-white/30 bg-white/10 backdrop-blur-md inline-flex items-center gap-2 shadow-inner"
                    >
                      <Sparkles size={14} className="text-white animate-pulse" />
                      PARTNER INVITATION {new Date().getFullYear()}
                    </Badge>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                      Ready to <br />
                      Partner?
                    </h2>
                  </div>

                  {/* Right Column: Two Responsive CTA Cards */}
                  <div className="lg:col-span-8 grid md:grid-cols-2 gap-6 w-full">
                    {/* Card 1: Become a Partner */}
                    <motion.div
                      whileHover={{ y: -6, rotate: 0.5 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group flex flex-col justify-between h-full"
                    >
                      <div className="absolute -inset-1 bg-gradient-to-r from-[#17468C] to-[#B82424] rounded-[2rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-500 pointer-events-none" />

                      <div className="relative z-10 space-y-4 text-left flex-grow">
                        <h4 className="text-2xl font-bold text-white tracking-tight">
                          Be a Partner
                        </h4>
                        <p className="text-white/70 text-sm leading-relaxed">
                          Submit your complete center details and launch your official collaboration.
                        </p>
                      </div>

                      <div className="relative z-10 pt-6 space-y-4">
                        <div className="rounded-full border border-white/20 p-[3px] transition-all duration-300 hover:border-white/40 hover:-translate-y-1 group/btnWrapper cursor-pointer">
                          <Button
                            variant="none"
                            size="none"
                            className="w-full py-5 px-8 rounded-full font-bold bg-gradient-to-r from-[#0052cc] to-[#00297a] text-white shadow-2xl shadow-[#0052cc]/25 hover:shadow-[#0052cc]/40 transition-all duration-300 relative overflow-hidden cursor-pointer flex items-center justify-center gap-2 text-base h-auto"
                            onClick={() => navigate("/register-admission-point")}
                          >
                            <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 -translate-x-[150%] group-hover/btnWrapper:animate-[shine_1.5s_ease-in-out_infinite]" />
                            <span className="relative z-10 flex items-center justify-center gap-2 text-white">
                              Register Now
                              <ArrowRight size={18} className="transition-transform duration-300 group-hover/btnWrapper:translate-x-1" />
                            </span>
                          </Button>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-white/50 font-bold uppercase tracking-wider">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                          Applications Active
                        </div>
                      </div>
                    </motion.div>

                    {/* Card 2: Partner Inquiry (Enquire Now) */}
                    <motion.div
                      whileHover={{ y: -6, rotate: -0.5 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group flex flex-col justify-between h-full"
                    >
                      <div className="absolute -inset-1 bg-gradient-to-r from-[#B82424] to-[#17468C] rounded-[2rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-500 pointer-events-none" />

                      <div className="relative z-10 space-y-4 text-left flex-grow">
                        <h4 className="text-2xl font-bold text-white tracking-tight">
                          Partner Inquiry
                        </h4>
                        <p className="text-white/70 text-sm leading-relaxed">
                          Have quick questions? Submit an inquiry and our partner team will reach out.
                        </p>
                      </div>

                      <div className="relative z-10 pt-6 space-y-4">
                        <div className="rounded-full border border-white/20 p-[3px] transition-all duration-300 hover:border-white/40 hover:-translate-y-1 group/btnWrapper cursor-pointer">
                          <Button
                            variant="none"
                            size="none"
                            className="w-full py-5 px-8 rounded-full font-bold bg-gradient-to-r from-[#e60000] to-[#990000] text-white shadow-2xl shadow-[#e60000]/25 hover:shadow-[#e60000]/40 transition-all duration-300 relative overflow-hidden cursor-pointer flex items-center justify-center gap-2 text-base h-auto border-transparent"
                            onClick={() => {
                              const el = document.getElementById("partner-inquiry-form");
                              if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                              setHighlightInquiry(true);
                              setTimeout(() => setHighlightInquiry(false), 2000);
                            }}
                          >
                            <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 -translate-x-[150%] group-hover/btnWrapper:animate-[shine_1.5s_ease-in-out_infinite]" />
                            <span className="relative z-10 flex items-center justify-center gap-2 text-white">
                              Enquire Now
                              <ArrowRight size={18} className="transition-transform duration-300 group-hover/btnWrapper:translate-x-1" />
                            </span>
                          </Button>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-white/50 font-bold uppercase tracking-wider">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                          Quick Response Team
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* FOOTER */}
          <Footer />
        </div>
      )}
    </div>
  );
}
