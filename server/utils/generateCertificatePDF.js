import PDFDocument from "pdfkit";

// Helper function to format date to DD/MM/YYYY
const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// Helper function to get valid until date (1 year later, minus 1 day)
const getValidUntilDate = (date) => {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + 1);
  d.setDate(d.getDate() - 1);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export const generateCertificatePDF = (partner) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", layout: "portrait", margin: 0 });
      const buffers = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      doc.on("error", (err) => reject(err));

      const A4_WIDTH = 595.28;
      const A4_HEIGHT = 841.89;

      // 1. Double outer borders
      // Outer Navy border (3.5pt)
      doc.rect(8, 8, A4_WIDTH - 16, A4_HEIGHT - 16).lineWidth(3.5).stroke("#0B2545");
      
      // Outer Gold border (1pt)
      doc.rect(11.5, 11.5, A4_WIDTH - 23, A4_HEIGHT - 23).lineWidth(1).stroke("#C5A880");
      
      // Inner Thick Navy frame (9pt)
      doc.rect(18.5, 18.5, A4_WIDTH - 37, A4_HEIGHT - 37).lineWidth(9).stroke("#0B2545");
      
      // Inner Gold border (1pt)
      doc.rect(24, 24, A4_WIDTH - 48, A4_HEIGHT - 48).lineWidth(1).stroke("#C5A880");

      // Draw Cream Paper Background color inside Gold 2 border
      doc.rect(24.5, 24.5, A4_WIDTH - 49, A4_HEIGHT - 49).fill("#FCFBF7");

      // Re-draw inner gold border lines on top of fill
      doc.rect(24, 24, A4_WIDTH - 48, A4_HEIGHT - 48).lineWidth(1).stroke("#C5A880");

      // 2. Corner Accent Brackets
      const startX = 24;
      const startY = 24;
      const endX = A4_WIDTH - 24;
      const endY = A4_HEIGHT - 24;

      // Top-left
      doc.moveTo(startX + 3, startY + 11).lineTo(startX + 3, startY + 3).lineTo(startX + 11, startY + 3).lineWidth(2).stroke("#C5A880");
      // Top-right
      doc.moveTo(endX - 3, startY + 11).lineTo(endX - 3, startY + 3).lineTo(endX - 11, startY + 3).lineWidth(2).stroke("#C5A880");
      // Bottom-left
      doc.moveTo(startX + 3, endY - 11).lineTo(startX + 3, endY - 3).lineTo(startX + 11, endY - 3).lineWidth(2).stroke("#C5A880");
      // Bottom-right
      doc.moveTo(endX - 3, endY - 11).lineTo(endX - 3, endY - 3).lineTo(endX - 11, endY - 3).lineWidth(2).stroke("#C5A880");

      // 3. Header solid navy block
      const headerH = 105;
      doc.rect(startX + 1, startY + 1, A4_WIDTH - 50, headerH).fill("#0B2545");

      // Header Text
      doc.font("Helvetica-Bold").fontSize(10.5).fillColor("#FAF8F5").text("THE GLOBAL UNIVERSITY, ARUNACHAL PRADESH", 0, startY + 14, { align: "center" });
      doc.font("Helvetica").fontSize(8).fillColor("#FAF8F5").text("(UGC Approved | NAAC Accredited)", 0, startY + 28, { align: "center", opacity: 0.85 });

      // Header Gold Separator
      doc.moveTo(A4_WIDTH / 2 - 75, startY + 41).lineTo(A4_WIDTH / 2 + 75, startY + 41).lineWidth(0.75).stroke("#C5A880");

      doc.font("Helvetica-Bold").fontSize(9).fillColor("#C5A880").text("NATIONAL ADMISSION PARTNER", 0, startY + 49, { align: "center" });
      doc.font("Helvetica-Bold").fontSize(13.5).fillColor("#FFFFFF").text("6A SKILL CITY (OPC) PRIVATE LIMITED", 0, startY + 62, { align: "center" });

      doc.font("Times-Roman").fontSize(8.5).fillColor("#D1D5DB").text("Grace Tower, First Floor, Ernakulam, Kerala — 682018", 0, startY + 79, { align: "center" });
      doc.font("Helvetica").fontSize(8).fillColor("#D1D5DB").text("operations@6askillcity.com | +91 983 33 31 014", 0, startY + 91, { align: "center" });

      // 4. Central Logo Section
      const logoY = startY + headerH + 20; // 24 + 105 + 20 = 149
      // Outer Gold circle
      doc.circle(A4_WIDTH / 2, logoY + 26, 26).lineWidth(2).stroke("#C5A880");
      // Inner Navy circle
      doc.circle(A4_WIDTH / 2, logoY + 26, 23).lineWidth(1).stroke("#0B2545");
      // Logo text
      doc.font("Helvetica-Bold").fontSize(18).fillColor("#0B2545").text("6A", A4_WIDTH / 2 - 20, logoY + 12, { width: 40, align: "center" });
      doc.font("Helvetica-Bold").fontSize(5.5).fillColor("#C5A880").text("SKILL CITY", A4_WIDTH / 2 - 30, logoY + 32, { width: 60, align: "center" });

      // Cert Intro
      doc.font("Times-Italic").fontSize(11).fillColor("#4B5563").text("This is to certify that", 0, logoY + 62, { align: "center" });

      // Certificate Title
      doc.font("Times-Bold").fontSize(22).fillColor("#0B2545").text("CERTIFICATE OF AUTHORISATION", 0, logoY + 76, { align: "center" });
      doc.font("Times-Italic").fontSize(9.5).fillColor("#C5A880").text("Application Point — Counselling & Admission Facilitation", 0, logoY + 101, { align: "center" });

      // 5. Partner / Centre Name Box
      const boxY = logoY + 118; // 149 + 118 = 267
      const boxW = 460;
      const boxH = 35;
      const boxX = A4_WIDTH / 2 - boxW / 2;

      // Draw light blue background rectangle
      doc.rect(boxX, boxY, boxW, boxH).fillAndStroke("#EBF2FA", "#0B2545");
      
      // Center Partner Name Text inside
      doc.font("Helvetica-Bold").fontSize(12.5).fillColor("#0B2545").text((partner.centerName || "").toUpperCase(), boxX + 10, boxY + 11, { width: boxW - 20, align: "center" });

      // 6. Authorization Statements
      const stmtY = boxY + 48; // 267 + 48 = 315
      doc.font("Times-Italic").fontSize(11).fillColor("#4B5563").text("is hereby authorised as an official", 0, stmtY, { align: "center" });
      doc.font("Helvetica-Bold").fontSize(12.5).fillColor("#0B2545").text("APPLICATION POINT", 0, stmtY + 15, { align: "center" });
      
      const bodyText = `of 6A Skill City (OPC) Private Limited, the National Admission Partner of\nThe Global University, Arunachal Pradesh (UGC Approved).`;
      doc.font("Times-Roman").fontSize(9.5).fillColor("#374151").text(bodyText, 0, stmtY + 32, { align: "center", lineGap: 3 });

      // 7. Scope of Authorisation Separator & Section
      const scopeY = stmtY + 72; // 315 + 72 = 387
      doc.moveTo(startX + 40, scopeY).lineTo(endX - 40, scopeY).lineWidth(0.5).stroke("rgba(197, 168, 128, 0.4)");

      doc.font("Helvetica-Bold").fontSize(9.5).fillColor("#0B2545").text("SCOPE OF AUTHORISATION", 0, scopeY + 10, { align: "center" });

      // Draw custom checkmarks & items list
      const listStartX = 115;
      const listStartY = scopeY + 24;
      const items = [
        "Provide counselling to prospective students for all programs",
        "Assist in application submission and documentation",
        "Facilitate admissions to UG, PG, Diploma & Skill programs",
        "Conduct student awareness and orientation sessions",
        "Collect and forward applications to the National Admission Partner"
      ];

      const drawCheckmark = (x, y) => {
        doc.moveTo(x, y + 4)
           .lineTo(x + 3, y + 7)
           .lineTo(x + 8, y + 1)
           .lineWidth(1.5)
           .stroke("#C5A880");
      };

      items.forEach((item, idx) => {
        const itemY = listStartY + (idx * 14);
        drawCheckmark(listStartX, itemY);
        doc.font("Helvetica").fontSize(9).fillColor("#374151").text(item, listStartX + 15, itemY + 1);
      });

      // 8. Metadata Grid Table
      const gridY = listStartY + (items.length * 14) + 16; // 387 + 24 + 70 + 16 = 497
      const colW = 210;
      const col2X = A4_WIDTH / 2 + 10;
      const col1X = A4_WIDTH / 2 - colW - 10;

      const issuedDateObj = partner.authorisationLetterIssuedAt || partner.inspectionCompletedAt || new Date();
      const issuedDate = formatDate(issuedDateObj);
      const validUntilDate = getValidUntilDate(issuedDateObj);

      const drawGridCell = (x, y, label, value) => {
        doc.font("Helvetica-Bold").fontSize(9).fillColor("#0B2545").text(label, x, y);
        doc.font("Helvetica-Bold").fontSize(9).fillColor("#1F2937").text(value, x, y, { width: colW, align: "right" });
        doc.moveTo(x, y + 12).lineTo(x + colW, y + 12).lineWidth(0.5).stroke("rgba(197, 168, 128, 0.4)");
      };

      // Row 1
      drawGridCell(col1X, gridY, "Certificate No.:", `6ASC/AP/${partner._id.toString().slice(-4).toUpperCase()}/2026`);
      drawGridCell(col2X, gridY, "Valid From:", issuedDate);

      // Row 2
      drawGridCell(col1X, gridY + 22, "Partner ID:", `6A-AP-${partner._id.toString().slice(-4).toUpperCase()}`);
      drawGridCell(col2X, gridY + 22, "Valid Until:", validUntilDate);

      // Row 3
      const districtState = `${partner.location?.state || "Kerala"} / ${partner.location?.city || "Ernakulam"}`;
      drawGridCell(col1X, gridY + 44, "State / District:", districtState);
      drawGridCell(col2X, gridY + 44, "Issued On:", issuedDate);

      // 9. Signatures & Seal Section
      const sigY = gridY + 80; // 497 + 80 = 577
      doc.moveTo(startX + 40, sigY).lineTo(endX - 40, sigY).lineWidth(0.5).stroke("rgba(197, 168, 128, 0.4)");

      const sigStartY = sigY + 35; // line for signatures

      // Left Signature
      doc.moveTo(col1X + 10, sigStartY).lineTo(col1X + 130, sigStartY).lineWidth(0.5).stroke("#9CA3AF");
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#0B2545").text("Authorised Signatory", col1X + 10, sigStartY + 4, { width: 120, align: "center" });
      doc.font("Helvetica").fontSize(7.5).fillColor("#6B7280").text("6A Skill City (OPC) Pvt. Ltd.", col1X + 10, sigStartY + 14, { width: 120, align: "center" });

      // Center Dotted Seal
      const sealCX = A4_WIDTH / 2;
      const sealCY = sigStartY + 10;
      doc.circle(sealCX, sealCY, 26).lineWidth(1.5).dash(2, { space: 2 }).stroke("#C5A880");
      doc.circle(sealCX, sealCY, 23).lineWidth(0.75).undash().stroke("#C5A880");
      doc.rect(sealCX - 23, sealCY - 23, 46, 46).clip(); // Clip text inside circle bounds
      
      doc.font("Helvetica-Bold").fontSize(5).fillColor("#C5A880").text("OFFICIAL SEAL", sealCX - 25, sealCY - 14, { width: 50, align: "center" });
      doc.font("Helvetica-Bold").fontSize(6.5).fillColor("#0B2545").text("6A SKILL CITY", sealCX - 25, sealCY - 4, { width: 50, align: "center" });
      doc.font("Helvetica-Bold").fontSize(3.5).fillColor("#6B7280").text("APPLICATION POINT", sealCX - 25, sealCY + 7, { width: 50, align: "center" });
      
      // Reset clipping path for the rest of the document
      doc.initClip();

      // Right Signature
      doc.moveTo(col2X + 80, sigStartY).lineTo(col2X + 200, sigStartY).lineWidth(0.5).stroke("#9CA3AF");
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#0B2545").text("Director / Manager", col2X + 80, sigStartY + 4, { width: 120, align: "center" });
      doc.font("Helvetica").fontSize(7.5).fillColor("#6B7280").text("Authorised Application Point", col2X + 80, sigStartY + 14, { width: 120, align: "center" });

      // 10. Bottom solid navy block
      const footerH = 55;
      const footerY = endY - footerH - 1; // Fit exactly at the bottom inside Gold 2 frame
      doc.rect(startX + 1, footerY, A4_WIDTH - 50, footerH).fill("#0B2545");

      // Footer Text
      doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#D1D5DB").text("This certificate is valid only with the official seal of 6A Skill City (OPC) Private Limited.", 0, footerY + 10, { align: "center" });
      
      // Footer Divider inside block
      doc.moveTo(startX + 30, footerY + 22).lineTo(endX - 30, footerY + 22).lineWidth(0.5).stroke("rgba(197, 168, 128, 0.3)");

      doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#E5E7EB").text("6askillcity.com | partner@6askillcity.com | +91 983 33 31 014", 0, footerY + 28, { align: "center" });
      doc.font("Times-Roman").fontSize(7.5).fillColor("#cbd5e1").text("Grace Tower, 1st Floor, Ernakulam North, Kerala — 682018", 0, footerY + 38, { align: "center" });

      // Close document
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
