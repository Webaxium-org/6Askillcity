import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import Logo from "../assets/logo.png";

const cn = (...classes) => classes.filter(Boolean).join(" ");
import ThemeToggle from "./ThemeToggle";

const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      primary: "bg-[#17468C] text-white hover:bg-[#17468C]/90 shadow",
      brandRed: "bg-[#B82424] text-white hover:bg-[#B82424]/90 shadow",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
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

        <div className="hidden md:flex items-center space-x-2">
          {["About", "Universities", "Partnership", "Contact"].map(
            (item, idx) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                initial={{ opacity: 0, y: -20, filter: "blur(5px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.1 * idx, type: "spring", bounce: 0.4 }}
                className="px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent hover:shadow-sm transition-all"
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
          <ThemeToggle />
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
