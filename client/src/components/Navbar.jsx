import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";

import Logo from "../assets/logo.png";

const cn = (...classes) => classes.filter(Boolean).join(" ");
import ThemeToggle from "./ThemeToggle";

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

const Navbar = () => {
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-500",
          isScrolled
            ? "bg-background/70 backdrop-blur-xl border-b border-border/20 py-3 shadow-lg shadow-foreground/5"
            : "bg-transparent py-6",
        )}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", bounce: 0.4 }}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <a href="/">
              <img src={Logo} alt="Logo" className="w-16" />
            </a>
          </motion.div>

          <div className="hidden lg:flex items-center space-x-2">
            {["About", "Mission & Vision", "Universities", "Partnership", "Contact"].map((item, idx) => {
              const targetId = item.toLowerCase() === "mission & vision" ? "mission-vision" : item.toLowerCase();
              return (
                <motion.a
                  key={item}
                  href={`/#${targetId}`}
                  onClick={(e) => {
                    if (window.location.pathname === "/") {
                      const element = document.getElementById(targetId);
                      if (element) {
                        e.preventDefault();
                        element.scrollIntoView({ behavior: "smooth" });
                        window.history.pushState(null, "", `/#${targetId}`);
                      }
                    }
                  }}
                  initial={{ opacity: 0, y: -20, filter: "blur(5px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: 0.1 * idx, type: "spring", bounce: 0.4 }}
                  className="px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent hover:shadow-sm transition-all"
                >
                  {item}
                </motion.a>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", bounce: 0.4 }}
            className="flex items-center gap-3"
          >
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              className="hidden lg:flex rounded-full"
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate("/register-admission-point")}
              className="hidden lg:flex rounded-full shadow-lg shadow-[#17468C]/20 hover:shadow-[#17468C]/40 hover:-translate-y-0.5 transition-all"
            >
              Partner Now
            </Button>

            {/* Hamburger button for screens < lg */}
            <button
              onClick={() => setIsOpen(true)}
              className="flex lg:hidden items-center justify-center p-2.5 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-all border border-transparent hover:border-border/30 cursor-pointer"
            >
              <Menu size={20} />
            </button>
          </motion.div>
        </div>
      </nav>

      {/* MOBILE & TABLET SIDEBAR DRAWER */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[320px] max-w-[85vw] bg-background/95 backdrop-blur-2xl border-l border-border/40 z-50 p-6 flex flex-col justify-between shadow-2xl lg:hidden"
            >
              <div className="space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center pb-6 border-b border-border/20">
                  <a href="/" onClick={() => setIsOpen(false)}>
                    <img src={Logo} alt="Logo" className="w-16" />
                  </a>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2.5 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer border border-transparent hover:border-border/30"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Vertical Links */}
                <nav className="flex flex-col space-y-1">
                  {["About", "Mission & Vision", "Universities", "Partnership", "Contact"].map((item, idx) => {
                    const targetId = item.toLowerCase() === "mission & vision" ? "mission-vision" : item.toLowerCase();
                    return (
                      <motion.a
                        key={item}
                        href={`/#${targetId}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * idx }}
                        onClick={(e) => {
                          setIsOpen(false);
                          if (window.location.pathname === "/") {
                            const element = document.getElementById(targetId);
                            if (element) {
                              e.preventDefault();
                              element.scrollIntoView({ behavior: "smooth" });
                              window.history.pushState(null, "", `/#${targetId}`);
                            }
                          }
                        }}
                        className="px-4 py-3.5 rounded-2xl text-base font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-all flex items-center justify-between group"
                      >
                        {item}
                        <ArrowRight size={16} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                      </motion.a>
                    );
                  })}
                </nav>
              </div>

              {/* Bottom Actions */}
              <div className="space-y-4 pt-6 border-t border-border/20">
                <Button
                  variant="ghost"
                  className="w-full rounded-full py-6 text-base font-bold flex justify-center items-center gap-2 cursor-pointer"
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/login");
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  className="w-full rounded-full py-6 text-base font-bold shadow-lg shadow-[#17468C]/20 hover:shadow-[#17468C]/40 flex justify-center items-center gap-2 cursor-pointer"
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/register-admission-point");
                  }}
                >
                  Partner Now
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
