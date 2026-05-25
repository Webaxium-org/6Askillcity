import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Phone,
  Mail,
  Globe,
  MapPin,
  Send,
} from "lucide-react";
import Logo from "../assets/logo.png";

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
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 pb-16 border-b border-border">
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-2">
              <Link to="/">
                <img src={Logo} alt="Logo" className="w-24 hover:opacity-90 transition-opacity" />
              </Link>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Managing global academic affairs with precision, integrity,
              and a commitment to student success.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Phone, href: "tel:+919633331014" },
                { Icon: Mail, href: "mailto:partner@6askillcity.com" },
                { Icon: Globe, href: "https://6askillcity.com" },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="flex items-center justify-center rounded-full h-10 w-10 text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 border border-input transition-all"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-5">
            <h5 className="text-sm font-bold text-foreground">
              Navigation
            </h5>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link
                  to="/"
                  className="hover:text-[#17468C] transition-colors"
                >
                  Our Mission
                </Link>
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
          </div>

          <div className="lg:col-span-3 space-y-5">
            <h5 className="text-sm font-bold text-foreground">
              Official Hub
            </h5>
            <div className="space-y-4">
              <div className="flex gap-3 text-sm text-muted-foreground">
                <MapPin
                  size={20}
                  className="shrink-0 text-muted-foreground/60 mt-0.5"
                />
                <span className="leading-relaxed">
                  Grace Tower, First Floor, Cabin No.C1 Door No. 67/1382,
                  St. Vincent Road, Kacheripady, Ernakulam North,
                  Kerala, India - 682018
                </span>
              </div>
              <div className="flex gap-3 text-sm text-muted-foreground">
                <Phone
                  size={18}
                  className="shrink-0 text-muted-foreground/60 mt-0.5"
                />
                <div className="flex flex-col gap-1">
                  <a href="tel:+919633331014" className="hover:text-primary transition-colors">
                    +91 9633331014
                  </a>
                  <a href="tel:+91995453322" className="hover:text-primary transition-colors">
                    +91 995453322
                  </a>
                  <a href="tel:04844614539" className="hover:text-primary transition-colors">
                    0484 461 4539
                  </a>
                </div>
              </div>
              <div className="flex gap-3 text-sm text-muted-foreground">
                <Mail
                  size={18}
                  className="shrink-0 text-muted-foreground/60 mt-0.5"
                />
                <a href="mailto:partner@6askillcity.com" className="hover:text-primary transition-colors">
                  partner@6askillcity.com
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-5">
            <h5 className="text-sm font-bold text-foreground">
              Newsletter
            </h5>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder={subscribed ? "Subscribed!" : "Enter email"}
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                disabled={subscribed}
                className="h-10 px-3 py-2 rounded-lg bg-muted text-sm border border-input focus:outline-none focus:ring-1 focus:ring-primary w-full"
              />
              <button
                type="submit"
                disabled={subscribed}
                className="shrink-0 h-10 w-10 flex items-center justify-center rounded-lg shadow-md shadow-primary/20 bg-[#17468C] text-white hover:bg-[#17468C]/90 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <Send size={16} />
              </button>
            </form>
            {subscribed && (
              <p className="text-xs text-emerald-600 font-bold animate-pulse">
                Thank you for subscribing!
              </p>
            )}
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
        </div>
      </div>
    </footer>
  );
}
