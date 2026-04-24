import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import Logo from "../assets/logo.png";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants = {
      default: "bg-slate-900 text-slate-50 hover:bg-slate-900/90",
      primary: "bg-[#17468C] text-white hover:bg-[#17468C]/90 shadow",
      brandRed: "bg-[#B82424] text-white hover:bg-[#B82424]/90 shadow",
      destructive: "bg-red-500 text-slate-50 hover:bg-red-500/90",
      outline:
        "border border-slate-200  hover:bg-slate-100 hover:text-slate-900",
      secondary: "bg-slate-100 text-slate-900 hover:bg-slate-100/80",
      ghost: "hover:bg-slate-100 hover:text-slate-900",
      link: "text-slate-900 underline-offset-4 hover:underline",
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

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-500",
        isScrolled
          ? "bg-white/70 backdrop-blur-xl border-b border-white/20 py-3 shadow-lg shadow-slate-200/20"
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

        <div className="hidden md:flex items-center space-x-2">
          {["About", "Universities", "Partnership", "Contact"].map(
            (item, idx) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                initial={{ opacity: 0, y: -20, filter: "blur(5px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.1 * idx, type: "spring", bounce: 0.4 }}
                className="px-4 py-2 rounded-full text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 hover:shadow-sm transition-all"
              >
                {item}
              </motion.a>
            ),
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="flex items-center gap-3"
        >
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:flex rounded-full"
            onClick={() => navigate("/login")}
          >
            Login
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="rounded-full shadow-lg shadow-[#17468C]/20 hover:shadow-[#17468C]/40 hover:-translate-y-0.5 transition-all"
          >
            Partner Now
          </Button>
        </motion.div>
      </div>
    </nav>
  );
};

export default Navbar;
