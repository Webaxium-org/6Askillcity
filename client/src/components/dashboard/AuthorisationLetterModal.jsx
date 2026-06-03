import React from "react";

// Authorisation Letter Modal (Printable)
export const AuthorisationLetterModal = ({ partner, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const letterDate = new Date(partner.inspectionCompletedAt || Date.now()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-zinc-950/60 backdrop-blur-md print:bg-white print:p-0">
      <div className="bg-card w-full max-w-[800px] rounded-3xl border border-border shadow-2xl p-8 max-h-[90vh] overflow-y-auto print:border-none print:shadow-none print:max-h-none print:overflow-visible print:p-0 custom-scrollbar">
        
        {/* Action buttons (hidden when printing) */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Partnership Certificate</h4>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 transition-all shadow-md shadow-primary/10"
            >
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-muted text-foreground font-bold text-xs hover:bg-muted/80 transition-all border border-border"
            >
              Close
            </button>
          </div>
        </div>

        {/* The Formal Letter (A4 Proportion) */}
        <div className="bg-white border-2 border-slate-900 rounded-sm p-10 font-serif text-slate-800 shadow-sm relative print:border-none print:shadow-none print:p-0">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900" />
          
          <div className="text-center border-b-2 border-slate-900 pb-6 mb-8">
            <h1 className="text-blue-900 text-3xl font-black font-sans leading-none">6A SKILLCITY</h1>
            <p className="text-slate-500 text-xs font-bold font-sans tracking-[0.15em] uppercase mt-2">National Skill Development & Education Network</p>
            <p className="text-slate-700 text-xs font-serif italic mt-1">Authorized Admission and Learning Resource Point Protocol</p>
          </div>

          <table className="w-full mb-8 text-xs font-sans text-slate-600">
            <tbody>
              <tr>
                <td><strong>Ref No:</strong> 6A-AP/L-AUTH-{partner._id?.slice(-6).toUpperCase()}</td>
                <td className="text-right"><strong>Date:</strong> {letterDate}</td>
              </tr>
            </tbody>
          </table>

          <h2 className="text-center text-blue-900 text-lg font-black font-sans tracking-[0.15em] uppercase border-b border-slate-200 pb-2 mb-8">LETTER OF AUTHORISATION</h2>

          <p className="text-sm leading-relaxed text-justify mb-6">
            This is to certify that <strong>{partner.centerName}</strong>, under the leadership of Licensee/Director <strong>{partner.licenseeName}</strong>, located at <em>{partner.location?.address}, {partner.location?.city}, {partner.location?.state} - {partner.location?.pincode}</em>, is formally designated as an <strong>Authorized Admission & Learning Resource Point</strong> of <strong>6A Skillcity</strong>.
          </p>

          <p className="text-sm leading-relaxed text-justify mb-6">
            Following a successful physical/online inspection of the facility and verification of operational criteria, the designated point has been assigned Center Code <strong>6A-AP-{partner._id?.slice(-4).toUpperCase()}</strong>.
          </p>

          <p className="text-sm leading-relaxed text-justify mb-10">
            As an Authorized Point, {partner.centerName} is permitted to guide candidates, facilitate admissions, register students for skill development programs, and access the official University networks and courses mapped to the 6A Skillcity portal, subject to the terms of the Partnership Agreement.
          </p>

          <table className="w-full mt-16 font-sans">
            <tbody>
              <tr>
                <td className="w-1/2 text-xs text-slate-400 vertical-align-bottom">
                  <div className="border-t border-slate-200 w-36 pt-2">
                    Verification Seal<br />
                    6A Skillcity Audit Division
                  </div>
                </td>
                <td className="w-1/2 text-right text-xs font-bold text-blue-900">
                  <div className="mb-2 italic text-[10px] text-slate-400 font-normal">Digital Signature Verified</div>
                  <div className="border-t border-blue-900 inline-block pt-2 w-48 text-center ml-auto">
                    Director of Operations<br />
                    <span className="text-[10px] font-normal text-slate-400">6A Skillcity Network</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="border-t border-slate-100 mt-16 pt-4 text-center text-[9px] text-slate-400 font-sans">
            This is a digitally issued and verified certificate. For any verification, please query with Center Code on 6A Skillcity Portal.
          </div>
        </div>

      </div>

      {/* Styled `@media print` print styles to format perfectly on A4 */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:bg-white {
            background-color: white !important;
          }
          .fixed, .fixed * {
            visibility: visible;
          }
          .fixed {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:border-none {
            border: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:max-h-none {
            max-height: none !important;
          }
          .print\\:overflow-visible {
            overflow: visible !important;
          }
        }
      ` }} />
    </div>
  );
};
