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
          </div>

          <div className="lg:col-span-2 space-y-5">
            <h5 className="text-sm font-bold text-foreground">
              Navigation
            </h5>
            <ul className="space-y-3 text-sm text-muted-foreground">
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
          </div>

          <div className="lg:col-span-3 space-y-5 text-left">
            <div className="space-y-1.5">
              <h5 className="text-sm font-bold text-foreground">
                Official Hub
              </h5>
              <p className="text-[11px] font-black text-[#17468C] uppercase tracking-wider leading-none">
                6A SKILL CITY (OPC) PRIVATE LIMITED
              </p>
            </div>
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

        {/* Horizontal Department Contact Grid */}
        <div className="grid md:grid-cols-3 gap-6 py-10 border-t border-border mt-12">
          {[
            {
              title: "Partner Enquiry",
              mob: "+91 9633331014",
              mobHref: "tel:+919633331014",
              land: "0484 461 4539",
              landHref: "tel:04844614539",
              email: "partner@6askillcity.com",
              emailHref: "mailto:partner@6askillcity.com",
              badgeColor: "bg-[#B82424]/10 text-[#B82424]",
              dotColor: "bg-[#B82424]",
              cardColor: "border-[#B82424]/10 hover:border-[#B82424]/40 hover:bg-[#B82424]/[0.02]",
              linkHover: "hover:text-[#B82424]"
            },
            {
              title: "IT Team",
              mob: "+91 73560 75454",
              mobHref: "tel:+9173560 75454",
              land: "0484 461 4422",
              landHref: "tel:04844614422",
              email: "it@6askillcity.com",
              emailHref: "mailto:it@6askillcity.com",
              badgeColor: "bg-[#17468C]/10 text-[#17468C]",
              dotColor: "bg-[#17468C]",
              cardColor: "border-[#17468C]/10 hover:border-[#17468C]/40 hover:bg-[#17468C]/[0.02]",
              linkHover: "hover:text-[#17468C]"
            },
            {
              title: "Finance",
              mob: "+91 99954 53322",
              mobHref: "tel:+9199954 53322",
              land: "0484 461 4477",
              landHref: "tel:04844614477",
              email: "accounts@6askillcity.com",
              emailHref: "mailto:accounts@6askillcity.com",
              badgeColor: "bg-[#17468C]/10 text-[#17468C]",
              dotColor: "bg-[#17468C]",
              cardColor: "border-[#17468C]/10 hover:border-[#17468C]/40 hover:bg-[#17468C]/[0.02]",
              linkHover: "hover:text-[#17468C]"
            },
          ].map((dept, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl bg-card border hover:shadow-lg transition-all duration-300 space-y-3.5 text-left group ${dept.cardColor}`}
            >
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${dept.badgeColor}`}>
                  {dept.title}
                </span>
                <div className={`w-2 h-2 rounded-full ${dept.dotColor} opacity-70 group-hover:scale-125 transition-transform duration-300`} />
              </div>
              
              <div className="space-y-2.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2.5">
                  <Phone size={14} className="text-muted-foreground/50 shrink-0 group-hover:text-foreground transition-colors" />
                  <div className="flex flex-wrap items-center gap-x-1.5">
                    <a href={dept.mobHref} className={`transition-colors font-bold text-foreground/80 group-hover:text-foreground ${dept.linkHover}`}>{dept.mob}</a>
                    <span className="text-muted-foreground/20">|</span>
                    <a href={dept.landHref} className={`transition-colors ${dept.linkHover}`}>{dept.land}</a>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail size={14} className="text-muted-foreground/50 shrink-0 group-hover:text-foreground transition-colors" />
                  <a href={dept.emailHref} className={`transition-colors font-semibold ${dept.linkHover}`}>{dept.email}</a>
                </div>
              </div>
            </div>
          ))}
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
