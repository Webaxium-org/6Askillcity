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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showAlert } from "../../redux/alertSlice";
import Navbar from "../../components/Navbar";

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

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          variants[variant],
          sizes[size],
          className,
        )}
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

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const handlePartnerInquiry = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call for registration
    setTimeout(() => {
      setIsSubmitting(false);
      dispatch(
        showAlert({
          type: "success",
          message:
            "Registration submitted! Our partnership team will review your application and contact you within 24 hours.",
        }),
      );
      // Optional: clear form fields here if using state
      e.target.reset();
    }, 1500);
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
                    onClick={() =>
                      window.open(
                        "https://vidhyaedufoundation.com/admission-point-application-form/",
                        "_blank",
                      )
                    }
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
                      variant="brandRed"
                      size="lg"
                      onClick={() => navigate("/register-admission-point")}
                      className="rounded-full shadow-xl shadow-[#B82424]/20 text-base hover:-translate-y-1 transition-all duration-300"
                    >
                      Join the Network <ArrowRight size={18} className="ml-2" />
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => navigate("/login")}
                      className="rounded-full text-base hover:bg-accent border-border shadow-sm hover:-translate-y-1 transition-all duration-300"
                    >
                      View Institutions
                    </Button>
                  </motion.div>

                  <motion.div
                    variants={fadeInUp}
                    className="flex items-center gap-4 pt-8 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
                  >
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Trusted By
                    </p>
                    <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                    <div className="flex gap-6 font-bold text-muted-foreground/50">
                      <span className="hover:text-[#17468C] transition-colors cursor-default">
                        BTU
                      </span>
                      <span className="hover:text-[#17468C] transition-colors cursor-default">
                        TGU
                      </span>
                      <span className="hover:text-[#17468C] transition-colors cursor-default">
                        UGC
                      </span>
                      <span className="hover:text-[#17468C] transition-colors cursor-default">
                        NCTE
                      </span>
                    </div>
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                    filter: "blur(20px)",
                    y: 40,
                  }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }}
                  transition={{
                    delay: 0.4,
                    duration: 1,
                    type: "spring",
                    bounce: 0.3,
                  }}
                  className="lg:col-span-5 relative group"
                >
                  {/* Glowing background blob behind the card */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#17468C] to-[#B82424] rounded-[1.5rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-700 pointer-events-none" />

                  <Card className="shadow-2xl shadow-foreground/5 relative overflow-hidden bg-card/80 backdrop-blur-2xl border-border">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#17468C]/5 to-transparent rounded-bl-full pointer-events-none" />
                    <CardHeader className="relative z-10 space-y-2 pb-4 pt-8 px-8">
                      <CardTitle className="text-2xl font-bold">
                        Partner Inquiry
                      </CardTitle>
                      <CardDescription>
                        Quick registration for new centers
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
                          variant="primary"
                          disabled={isSubmitting}
                          className="w-full mt-4 rounded-xl shadow-lg shadow-[#17468C]/20 hover:shadow-[#17468C]/40 hover:-translate-y-0.5 transition-all duration-300"
                        >
                          {isSubmitting
                            ? "Submitting..."
                            : "Submit Registration"}
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

          {/* CORE STATS */}
          <section className="py-20 border-y border-border bg-background relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
            <div className="container mx-auto px-6 relative z-10">
              <motion.div
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
                className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 divide-x divide-border"
              >
                {[
                  {
                    label: "Students Helped",
                    value: "80K+",
                    color: "text-[#17468C]",
                  },
                  {
                    label: "Programs",
                    value: "140+",
                    color: "text-[#B82424]",
                  },
                  {
                    label: "Recruitment Partners",
                    value: "65K+",
                    color: "text-[#17468C]",
                  },
                  {
                    label: "Partner Institutions",
                    value: "150+",
                    color: "text-[#B82424]",
                  },
                ].map((stat, i) => (
                  <motion.div
                    variants={scaleUp}
                    key={i}
                    className={cn(
                      "text-center group cursor-default",
                      i !== 0 && "pl-8 lg:pl-12",
                    )}
                  >
                    <h4
                      className={cn(
                        "text-4xl lg:text-6xl font-black tracking-tighter mb-3 group-hover:scale-110 transition-transform duration-500 origin-bottom",
                        stat.color,
                      )}
                    >
                      <CountUp value={stat.value} />
                    </h4>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* UNIVERSITY CARDS */}
          <section id="universities" className="py-32 bg-muted relative">
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
                  className="group rounded-full shadow-sm hover:shadow-md hover:border-border transition-all"
                >
                  View All Partners{" "}
                  <ArrowRight
                    size={16}
                    className="ml-2 group-hover:translate-x-1 transition-transform"
                  />
                </Button>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-10">
                {[
                  {
                    title: "Bir Tikendrajit University",
                    loc: "Manipur",
                    color:
                      "bg-gradient-to-br from-[#B82424] to-red-600 shadow-red-500/30",
                    icon: <School className="text-white" size={28} />,
                    desc: "Established by the Manipur Government (Act No. 9 of 2020) and under u/s 2(f) of UGC Act 1956. We aim to create world-level research facilities and provide state-of-the-art education to empower youth with global human resources.",
                    stats: [
                      { label: "Legislation", value: "Act No. 9 of 2020" },
                      { label: "Recognition", value: "UGC u/s 2(f)" },
                    ],
                  },
                  {
                    title: "The Global University",
                    loc: "Arunachal Pradesh",
                    color:
                      "bg-gradient-to-br from-[#17468C] to-blue-600 shadow-blue-500/30",
                    icon: <Globe className="text-white" size={28} />,
                    desc: "Widely recognized as a beacon of academic excellence and innovation in Arunachal Pradesh. Since 2024, it has been known among the top education institutions in India, shaping minds and empowering positive impact.",
                    stats: [
                      { label: "Recognition", value: "Prominent Institution" },
                      { label: "Focus", value: "Innovation & Impact" },
                    ],
                  },
                ].map((uni, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
                    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{
                      delay: i * 0.15,
                      duration: 0.8,
                      type: "spring",
                      bounce: 0.4,
                    }}
                    className="h-full"
                  >
                    <Card className="h-full flex flex-col hover:-translate-y-2 hover:shadow-2xl hover:shadow-foreground/10 transition-all duration-500 border-border bg-card/60 backdrop-blur-sm relative overflow-hidden group rounded-2xl">
                      {/* Shine effect on hover */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-foreground/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none z-20" />

                      <CardHeader className="flex flex-row items-center justify-between pb-8 pt-8 px-8 relative z-10">
                        <div
                          className={cn(
                            "p-4 rounded-2xl transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 shadow-lg",
                            uni.color,
                          )}
                        >
                          {uni.icon}
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-muted backdrop-blur text-sm"
                        >
                          {uni.loc}
                        </Badge>
                      </CardHeader>
                      <CardContent className="flex-grow space-y-4 px-8 relative z-10">
                        <CardTitle className="text-3xl font-bold">
                          {uni.title}
                        </CardTitle>
                        <CardDescription className="text-base text-muted-foreground leading-relaxed">
                          {uni.desc}
                        </CardDescription>
                      </CardContent>
                      <CardFooter className="border-t border-border pt-6 pb-8 px-8 bg-muted relative z-10 mt-6">
                        <div className="flex items-center gap-12 w-full">
                          {uni.stats.map((stat, idx) => (
                            <div key={idx} className="space-y-1">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                {stat.label}
                              </p>
                              <p className="text-sm font-bold text-foreground">
                                {stat.value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
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

              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                {[
                  {
                    title: "Admission Centres",
                    subtitle: "Application Recruitment",
                    description:
                      "6A Skillcity invites ADMISSION APPLICATION CENTRE from across India to partner and facilitate the admission process for students. Partnering with us allows admission recruiters to streamline the admission process for students, providing them with access to a diverse range of UGC-approved courses.",
                    color: "text-blue-400",
                    hoverGradient:
                      "from-[#17468C]/20 via-[#17468C]/5 to-transparent",
                    bgBadge:
                      "bg-[#17468C]/20 text-blue-300 border border-[#17468C]/30",
                    points: [
                      "Assist students in the application process for Bir Tikendrajit University & The Global University programs.",
                      "Provide guidance and support to applicants throughout the admission journey.",
                      "Serve as a local point of contact for prospective students in your region.",
                      "Contribute to the promotion of Bir Tikendrajit University & The Global University academic offerings.",
                      "Play a key role in expanding access to quality education and fostering growth.",
                    ],
                  },
                  {
                    title: "Vocational Centres",
                    subtitle: "Skill-Based Learning",
                    description:
                      "6A Skillcity recognizes the importance of vocational education in preparing students for the dynamic demands of the workforce. We invite vocational education centers across India to partner with us in offering specialized courses that cater to the needs of various industries.",
                    color: "text-red-400",
                    hoverGradient:
                      "from-[#B82424]/20 via-[#B82424]/5 to-transparent",
                    bgBadge:
                      "bg-[#B82424]/20 text-red-300 border border-[#B82424]/30",
                    points: [
                      "Offer Bir Tikendrajit University & The Global University skill-enhancing programs to your students.",
                      "Provide hands-on training and practical experience in alignment with industry requirements.",
                      "Empower students with the skills and knowledge necessary for successful career pathways.",
                      "Enhance your institution’s reputation as a provider of holistic education with a focus on employability.",
                      "Contribute to bridging the gap between academia and industry.",
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
                          <p className="text-white/50 text-sm leading-relaxed mb-6 line-clamp-4 group-hover:line-clamp-none transition-all duration-500">
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
                          variant="outline"
                          className="w-full h-12 rounded-xl bg-white/10 border-white/20 text-white hover:bg-white hover:text-black transition-all duration-300 group-hover:shadow-lg"
                          onClick={() => navigate("/register-admission-point")}
                        >
                          Become a Partner
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
                      6A Skillcity serves as an academic partner of{" "}
                      <span className="text-foreground font-semibold">
                        Bir Tikendrajit University & The Global University
                      </span>{" "}
                      handling all academic affairs. The foundation connects
                      admission application centers and vocational education
                      centers with Bir Tikendrajit University & The Global
                      University.
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      With a commitment to fostering educational growth and
                      facilitating access to quality education, 6A Skillcity
                      plays a pivotal role in connecting aspiring students with
                      Bir Tikendrajit University, The Global University’s
                      diverse range of programs.
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed italic border-l-4 border-[#B82424] pl-6 py-2">
                      "As an academic partner, 6A Skillcity contributes to the
                      advancement of education by promoting collaboration and
                      synergy between educational institutions and Bir
                      Tikendrajit University & The Global University."
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
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-white/20">
                              <GraduationCap className="text-white" size={32} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white/80">
                                Academic Partner
                              </p>
                              <p className="text-xl font-bold">
                                Official BTU Partner
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

          {/* WHY PARTNER SECTION */}
          <section
            id="why-partner"
            className="py-24 bg-background relative overflow-hidden"
          >
            <div className="container mx-auto px-6 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="mb-16 space-y-4"
              >
                <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
                  Why Partner with <br />
                  <span className="text-[#17468C]">6A Skillcity?</span>
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(24,minmax(0,1fr))] [grid-auto-rows:1fr] gap-6 mb-20">
                {[
                  {
                    title: "UGC Approved Course Certificate:",
                    desc: "Our partner institution courses are approved by the University Grants Commission (UGC), guaranteeing quality education and recognized certifications.",
                    color: "bg-[#B82424]",
                    image: Ugc,
                  },
                  {
                    title: "Government of Manipur",
                    desc: "Recognized and supported by the Government of Manipur for academic excellence.",
                    color: "bg-[#A59200]",
                    image: ManipurGovt,
                  },
                  {
                    title: "Association of Indian Universities (AIU)",
                    desc: "Membership and recognition by AIU ensuring global equivalence.",
                    color: "bg-[#4338CA]",
                    image: Aiu,
                  },
                  {
                    title: "National Council for Teacher Education (NCTE)",
                    desc: "Approval for teacher education programs across the network.",
                    color: "bg-[#1E1B4B]",
                    image: Ncte,
                  },
                  {
                    title: "Bar Council of India (BCI)",
                    desc: "Legal education programs approved by BCI.",
                    color: "bg-[#DC2626]",
                    image: Bci,
                  },
                  {
                    title: "Pharmacy Council of India (PCI)",
                    desc: "Pharmacy courses recognized by PCI standards.",
                    color: "bg-[#0284C7]",
                    image: Pci,
                  },
                  {
                    title: "Expanded Reach:",
                    desc: "Partnering with us allows admission application centers and vocational education centers to expand their reach and attract more students.",
                    color: "bg-[#E11D48]",
                    image: Reach,
                  },
                  {
                    title: "Increased Admissions:",
                    desc: "As our esteemed partner, you can benefit from increased admissions and expand your student base.",
                    color: "bg-[#4F46E5]",
                    image: IncreasedAdmission,
                  },
                  {
                    title: "Holistic Development",
                    desc: "Our focus on holistic education ensures that students not only excel academically but also develop essential life skills and prepare them for success in both academic and professional spheres.",
                    color: "bg-[#A59200]",
                    image: Holistic,
                  },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    className={cn(
                      "col-span-1 lg:col-span-6",
                      idx === 8 &&
                        "sm:col-span-2 lg:col-span-6 lg:col-start-10",
                      "rounded-3xl p-6 text-left flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow",
                      item.color,
                    )}
                  >
                    <div className="bg-white rounded-2xl p-4 mb-6 flex items-center justify-center overflow-hidden h-32">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="max-h-full object-contain"
                      />
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-white font-bold leading-tight">
                        {item.title}
                      </h4>
                      {item.desc && (
                        <p className="text-white/80 text-sm leading-relaxed">
                          {item.desc}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="max-w-3xl mx-auto space-y-8"
              >
                <div className="space-y-4 text-muted-foreground text-sm font-medium leading-relaxed">
                  <p>
                    Whether you're an admission recruiter, a vocational
                    education center, or an educational institution, 6A
                    Skillcity & BTU, TGU welcomes you to join our family of
                    partners. Let's work together to make a difference in the
                    lives of students and shape the future of education.
                  </p>
                  <p>
                    Contact us today to learn more about partnership
                    opportunities and be a part of our mission to transform
                    education.
                  </p>
                </div>

                <Button
                  variant="brandRed"
                  size="lg"
                  className="rounded-xl px-12 py-6 text-lg font-bold shadow-xl shadow-[#B82424]/20 hover:-translate-y-1 transition-all"
                  onClick={() => (window.location.href = "#contact")}
                >
                  CONTACT US
                </Button>
              </motion.div>
            </div>
          </section>

          {/* FOOTER */}
          <footer
            className="pt-24 pb-10 bg-background border-t border-border"
            id="contact"
          >
            <div className="container mx-auto px-6">
              <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 pb-16 border-b border-border">
                <div className="lg:col-span-4 space-y-6">
                  <div className="flex items-center gap-2">
                    <img src={Logo} alt="Logo" className="w-24" />
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                    Managing global academic affairs with precision, integrity,
                    and a commitment to student success.
                  </p>
                  <div className="flex gap-3">
                    {[
                      { Icon: Phone, href: "tel:+919633331014" },
                      { Icon: Mail, href: "mailto:info@6askillcity.com" },
                      { Icon: Globe, href: "https://6askillcity.com" },
                    ].map(({ Icon, href }, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="icon"
                        className="rounded-full h-10 w-10 text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all"
                        onClick={() => (window.location.href = href)}
                      >
                        <Icon size={18} />
                      </Button>
                    ))}
                  </div>

                </div>

                <div className="lg:col-span-2 space-y-5">
                  <h5 className="text-sm font-bold text-foreground">
                    Navigation
                  </h5>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li>
                      <a
                        href="#"
                        className="hover:text-[#17468C] transition-colors"
                      >
                        Our Mission
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="hover:text-[#17468C] transition-colors"
                      >
                        Partner Portal
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="hover:text-[#17468C] transition-colors"
                      >
                        Verification
                      </a>
                    </li>
                  </ul>
                </div>

                <div className="lg:col-span-3 space-y-5">
                  <h5 className="text-sm font-bold text-foreground">
                    Official Hub
                  </h5>
                  <div className="flex gap-3 text-sm text-muted-foreground">
                    <MapPin
                      size={20}
                      className="shrink-0 text-muted-foreground/60 mt-0.5"
                    />
                    <span className="leading-relaxed">
                      Grace Tower, First Floor, Cabin No.C1 Door No. 67/1382,
                      St. Vincent Road, Kacheripady, Ernakulam North,
                      Kerala-682018
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-3 space-y-5">
                  <h5 className="text-sm font-bold text-foreground">
                    Newsletter
                  </h5>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter email"
                      className="h-10 rounded-lg bg-muted"
                    />
                    <Button
                      variant="primary"
                      size="icon"
                      className="shrink-0 h-10 w-10 rounded-lg shadow-md shadow-primary/20 hover:-translate-y-0.5 transition-all"
                    >
                      <Send size={16} />
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    By subscribing, you agree to our privacy protocols.
                  </p>
                </div>
              </div>

              <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-xs font-semibold text-muted-foreground">
                  © {new Date().getFullYear()} 6A Skillcity Foundation. All
                  rights reserved.
                </p>
                <div className="flex gap-6 text-xs font-semibold text-muted-foreground">
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Compliance
                  </a>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Privacy
                  </a>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Terms
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
