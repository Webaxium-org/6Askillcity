import React from "react";

// Helper function to format date to DD/MM/YYYY
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Helper function to get valid until date (1 year later, minus 1 day)
const getValidUntilDate = (dateString) => {
  const date = dateString ? new Date(dateString) : new Date();
  date.setFullYear(date.getFullYear() + 1);
  date.setDate(date.getDate() - 1);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const AuthorisationLetterModal = ({ partner, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const issuedDateObj = partner.authorisationLetter ? partner.authorisationLetter.issuedAt : (partner.authorisationLetterIssuedAt || partner.inspectionCompletedAt || Date.now());
  const issuedDate = formatDate(issuedDateObj);
  const validUntilDate = partner.authorisationLetter ? formatDate(partner.authorisationLetter.validUntil) : getValidUntilDate(issuedDateObj);

  return (
    <div className="authorisation-letter-modal-backdrop fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-zinc-950/80 backdrop-blur-md print:bg-white print:p-0">
      <div className="bg-card w-full max-w-[850px] rounded-3xl border border-border shadow-2xl p-6 max-h-[95vh] overflow-y-auto print:border-none print:shadow-none print:max-h-none print:overflow-visible print:p-0 custom-scrollbar">
        
        {/* Action buttons (hidden when printing) */}
        <div className="flex justify-between items-center mb-4 print:hidden">
          <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground font-['Montserrat']">Partnership Certificate</h4>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 transition-all shadow-md shadow-primary/10 cursor-pointer"
            >
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-muted text-foreground font-bold text-xs hover:bg-muted/80 transition-all border border-border cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

        {/* Responsive horizontal scrollable container for the certificate on smaller viewports */}
        <div className="w-full overflow-x-auto py-2 flex justify-center custom-scrollbar print:overflow-visible print:p-0">
          
          {/* Certificate Container - Exact Portrait A4 Proportions in pixels (793px x 1122px) */}
          <div id="authorisation-certificate" className="relative w-[793px] h-[1122px] bg-[#FCFBF7] p-2 border-[3.5px] border-[#0B2545] select-none text-slate-800 shadow-md shrink-0 flex flex-col justify-between print:shadow-none print:m-0 print:border-none">
            
            {/* Outer thin gold frame */}
            <div className="w-full h-full border border-[#C5A880] p-2.5 flex flex-col justify-between">
              
              {/* Inner thick navy frame */}
              <div className="w-full h-full border-[9px] border-[#0B2545] p-2 flex flex-col justify-between">
                
                {/* Innermost thin gold frame */}
                <div className="w-full h-full border border-[#C5A880] p-6 relative flex flex-col justify-between bg-[#FCFBF7]">
                  
                  {/* Corner Accent Brackets */}
                  <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-[#C5A880]" />
                  <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-[#C5A880]" />
                  <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-[#C5A880]" />
                  <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-[#C5A880]" />

                  {/* Header solid navy block */}
                  <div className="bg-[#0B2545] text-center py-4 px-6 text-white relative">
                    <h3 className="font-['Montserrat'] text-[10.5px] font-black tracking-[0.25em] text-[#FAF8F5] uppercase">
                      THE GLOBAL UNIVERSITY, ARUNACHAL PRADESH
                    </h3>
                    <p className="font-['Montserrat'] text-[8px] font-bold text-[#FAF8F5]/85 tracking-[0.1em] mt-1">
                      (UGC Approved | NAAC Accredited)
                    </p>
                    
                    <div className="w-48 h-[1px] bg-[#C5A880]/60 mx-auto my-2" />
                    
                    <h4 className="font-['Montserrat'] text-[9px] font-black text-[#C5A880] tracking-[0.2em] uppercase">
                      NATIONAL ADMISSION PARTNER
                    </h4>
                    <h2 className="font-['Montserrat'] text-[13.5px] font-extrabold text-white tracking-wider mt-1 uppercase">
                      6A SKILL CITY (OPC) PRIVATE LIMITED
                    </h2>
                    
                    <p className="font-serif text-[8.5px] text-slate-300 font-medium tracking-wide mt-1">
                      Grace Tower, First Floor, Ernakulam, Kerala — 682018
                    </p>
                    <p className="font-['Montserrat'] text-[8.5px] text-slate-300 tracking-wider mt-0.5">
                      operations@6askillcity.com | +91 983 33 31 014
                    </p>
                  </div>

                  {/* Logo, Title & Certified Intro */}
                  <div className="text-center mt-5">
                    {/* Logo seal badge */}
                    <div className="relative w-16 h-16 mx-auto rounded-full border-2 border-[#C5A880] bg-white flex items-center justify-center p-1 shadow-sm">
                      <div className="w-full h-full rounded-full border border-[#0B2545] flex flex-col items-center justify-center bg-white">
                        <span className="text-xl font-extrabold text-[#0B2545] leading-none font-['Montserrat']">6A</span>
                        <span className="text-[6px] font-black text-[#C5A880] tracking-wider leading-none mt-0.5 font-['Montserrat']">SKILL CITY</span>
                      </div>
                    </div>
                    
                    <p className="text-[11px] font-medium text-slate-600 font-['Playfair_Display'] italic mt-3">This is to certify that</p>
                    
                    <h1 className="text-2xl font-black text-[#0B2545] tracking-[0.05em] uppercase font-['Cinzel'] mt-1">
                      CERTIFICATE OF AUTHORISATION
                    </h1>
                    
                    <p className="text-[9.5px] font-semibold text-[#C5A880] tracking-wider italic font-['Playfair_Display'] mt-0.5">
                      Application Point — Counselling & Admission Facilitation
                    </p>
                  </div>

                  {/* Partner / Centre Name Box */}
                  <div className="w-[88%] mx-auto my-3">
                    <div className="bg-[#EBF2FA]/80 border border-[#0B2545]/80 rounded-lg py-3 px-4 text-center shadow-sm">
                      <h2 className="font-['Montserrat'] text-sm sm:text-base font-black text-[#0B2545] tracking-wide uppercase">
                        {partner.centerName || "[PARTNER / CENTRE NAME]"}
                      </h2>
                    </div>
                  </div>

                  {/* Authorization Statement */}
                  <div className="text-center space-y-1">
                    <p className="text-[11px] font-medium text-slate-600 font-['Playfair_Display'] italic">
                      is hereby authorised as an official
                    </p>
                    <h3 className="font-['Montserrat'] font-black text-[13px] text-[#0B2545] tracking-widest uppercase">
                      APPLICATION POINT
                    </h3>
                    <p className="text-[10px] text-slate-700 leading-relaxed font-['Playfair_Display'] max-w-[85%] mx-auto">
                      of 6A Skill City (OPC) Private Limited, the National Admission Partner of<br />
                      The Global University, Arunachal Pradesh (UGC Approved).
                    </p>
                  </div>

                  {/* Scope of Authorisation */}
                  <div className="w-[85%] mx-auto my-2 border-t border-[#C5A880]/30 pt-3">
                    <h4 className="font-['Montserrat'] font-black text-[9.5px] text-[#0B2545] tracking-[0.15em] uppercase text-center mb-2">
                      SCOPE OF AUTHORISATION
                    </h4>
                    <div className="flex justify-center">
                      <ul className="text-[9.5px] text-slate-700 font-['Montserrat'] font-medium space-y-1 text-left list-none pl-0 max-w-[95%]">
                        <li className="flex items-start">
                          <span className="text-[#C5A880] font-black mr-2">✓</span>
                          <span>Provide counselling to prospective students for all programs</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-[#C5A880] font-black mr-2">✓</span>
                          <span>Assist in application submission and documentation</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-[#C5A880] font-black mr-2">✓</span>
                          <span>Facilitate admissions to UG, PG, Diploma & Skill programs</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-[#C5A880] font-black mr-2">✓</span>
                          <span>Conduct student awareness and orientation sessions</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-[#C5A880] font-black mr-2">✓</span>
                          <span>Collect and forward applications to the National Admission Partner</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Metadata Table */}
                  <div className="grid grid-cols-2 gap-x-10 gap-y-2.5 w-[85%] mx-auto my-3 text-[9.5px] font-['Montserrat'] text-slate-700">
                    <div className="flex justify-between items-baseline border-b border-[#C5A880]/40 pb-0.5">
                      <span className="font-bold text-[#0B2545]">Certificate No.:</span>
                      <span className="font-bold text-slate-800 text-[10px]">
                        {partner.authorisationLetter ? partner.authorisationLetter.certificateNumber : `6ASC/AP/${partner._id?.toString().slice(-4).toUpperCase() || "xxxx"}/${new Date(issuedDateObj).getFullYear()}`}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline border-b border-[#C5A880]/40 pb-0.5">
                      <span className="font-bold text-[#0B2545]">Valid From:</span>
                      <span className="font-bold text-slate-800">{issuedDate}</span>
                    </div>
                    <div className="flex justify-between items-baseline border-b border-[#C5A880]/40 pb-0.5">
                      <span className="font-bold text-[#0B2545]">Partner ID:</span>
                      <span className="font-bold text-slate-800">
                        6A-AP-{partner._id?.toString().slice(-4).toUpperCase() || "xxxx"}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline border-b border-[#C5A880]/40 pb-0.5">
                      <span className="font-bold text-[#0B2545]">Valid Until:</span>
                      <span className="font-bold text-slate-800">{validUntilDate}</span>
                    </div>
                    <div className="flex justify-between items-baseline border-b border-[#C5A880]/40 pb-0.5">
                      <span className="font-bold text-[#0B2545]">State / District:</span>
                      <span className="font-bold text-slate-800 truncate max-w-[150px]">
                        {partner.location?.state || "Kerala"} / {partner.location?.city || "Ernakulam"}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline border-b border-[#C5A880]/40 pb-0.5">
                      <span className="font-bold text-[#0B2545]">Issued On:</span>
                      <span className="font-bold text-slate-800">{issuedDate}</span>
                    </div>
                  </div>

                  {/* Signatures & Seal Section */}
                  <div className="flex justify-between items-end w-[85%] mx-auto mt-4 mb-4 pt-1.5 border-t border-[#C5A880]/30">
                    {/* Left Signature */}
                    <div className="text-center w-1/3">
                      <div className="h-6 w-28 border-b border-slate-400 mx-auto mb-1" />
                      <p className="text-[8.5px] font-bold text-[#0B2545] leading-none font-['Montserrat']">Authorised Signatory</p>
                      <p className="text-[7.5px] text-slate-500 mt-0.5 font-['Montserrat']">6A Skill City (OPC) Pvt. Ltd.</p>
                    </div>

                    {/* Center Seal */}
                    <div className="text-center w-1/3 relative flex justify-center">
                      <div className="relative w-16 h-16 rounded-full border-2 border-dashed border-[#C5A880] flex items-center justify-center p-0.5 bg-white shadow-sm">
                        <div className="w-full h-full rounded-full border border-[#C5A880]/80 flex flex-col items-center justify-center p-1 text-center bg-[#FCFBF7]">
                          <span className="text-[5px] font-black text-[#C5A880] tracking-wider leading-none uppercase font-['Montserrat']">OFFICIAL SEAL</span>
                          <span className="text-[6.5px] font-black text-[#0B2545] leading-none my-0.5 font-['Montserrat']">6A SKILL CITY</span>
                          <span className="text-[4px] font-bold text-slate-500 leading-none uppercase font-['Montserrat']">APPLICATION POINT</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Signature */}
                    <div className="text-center w-1/3">
                      <div className="h-6 w-28 border-b border-slate-400 mx-auto mb-1" />
                      <p className="text-[8.5px] font-bold text-[#0B2545] leading-none font-['Montserrat']">Director / Manager</p>
                      <p className="text-[7.5px] text-slate-500 mt-0.5 font-['Montserrat']">Authorised Application Point</p>
                    </div>
                  </div>

                  {/* Footer solid navy block */}
                  <div className="bg-[#0B2545] text-center text-white py-2.5 px-4 mt-auto">
                    <p className="font-['Montserrat'] text-[7.5px] tracking-wide text-slate-300 border-b border-[#C5A880]/30 pb-1 flex items-center justify-center gap-1.5 uppercase font-semibold">
                      This certificate is valid only with the official seal of 6A Skill City (OPC) Private Limited.
                    </p>
                    <p className="font-['Montserrat'] text-[7.5px] tracking-wider mt-1 font-medium text-slate-200">
                      6askillcity.com | partner@6askillcity.com | +91 983 33 31 014
                    </p>
                    <p className="font-serif text-[7.5px] text-slate-300 mt-0.5">
                      Grace Tower, 1st Floor, Ernakulam North, Kerala — 682018
                    </p>
                  </div>

                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Optimized printable stylesheet to make portrait A4 fit perfectly */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            height: 100% !important;
            width: 100% !important;
            overflow: hidden !important;
          }
          .authorisation-letter-modal-backdrop, .authorisation-letter-modal-backdrop * {
            visibility: visible !important;
          }
          .authorisation-letter-modal-backdrop {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: white !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: hidden !important;
            z-index: 999999 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          #authorisation-certificate {
            position: relative !important;
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 auto !important;
            padding: 8px !important;
            box-shadow: none !important;
            border: 3.5px solid #0B2545 !important;
            box-sizing: border-box !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
          }
          #authorisation-certificate * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      ` }} />
    </div>
  );
};
