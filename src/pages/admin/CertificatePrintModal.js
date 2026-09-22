import React, { useState, useRef } from "react";
import {
  Printer,
  X,
  ExternalLink,
  Edit3,
  Upload,
  RotateCcw
} from "lucide-react";
import "./CertificatePrintModal.css";

// =========================================================================
// 1. OFFICIAL MLBC LOGO (Fallback vector)
// =========================================================================
export const MLBCLogo = ({ size = 70 }) => (
  <div className="mlbc-logo-container" style={{ width: size }}>
    <svg
      viewBox="0 0 240 250"
      width={size}
      height={size * 1.04}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mlbc-logo-svg"
    >
      <g fill="#00188f">
        <path d="M120,208 C115,202 32,146 32,86 C32,50 58,32 90,32 C103,32 113,38 120,46 C127,38 137,32 150,32 C182,32 208,50 208,86 C208,146 125,202 120,208 Z" />
      </g>
      <g fill="#b98d1d">
        <rect x="138" y="52" width="14" height="66" rx="1.5" />
        <rect x="120" y="68" width="50" height="13.5" rx="1.5" />
      </g>
      <g fill="#ffffff">
        <path d="M120,52 C116,42 106,38 92,38 C65,38 42,54 42,86 C42,132 108,184 120,196 C123,193 148,168 168,142 C162,140 155,134 153,124 C148,124 142,120 140,112 C135,112 130,108 128,100 L128,86 C124,84 121,80 120,74 C117,66 118,58 120,52 Z" />
      </g>
      <g fill="#00188f">
        <path d="M120,196 C110,186 52,138 52,90 C52,66 68,50 88,50 C94,50 100,53 104,58 C100,64 94,74 92,86 C89,102 96,118 106,132 C97,125 87,114 82,102 C79,94 80,84 84,76 C76,82 72,92 72,104 C72,126 94,156 120,182 Z" />
        <path d="M104,58 C102,68 98,82 96,96 C102,86 108,74 112,64 C110,61 107,59 104,58 Z" />
        <path d="M112,68 C110,76 106,88 104,98 C110,90 114,80 118,72 Z" />
      </g>
      <text
        x="120"
        y="238"
        textAnchor="middle"
        fill="#00188f"
        fontSize="13.5"
        fontWeight="800"
        letterSpacing="0.9"
        fontFamily="'Segoe UI', -apple-system, BlinkMacSystemFont, Arial, sans-serif"
      >
        MAKING LIFE BETTER CHURCH
      </text>
    </svg>
  </div>
);

// =========================================================================
// 2. BORDER COMPONENTS
// =========================================================================

// --- A. Pernikahan / Marriage Border (Image 3) ---
export const MarriageBorder = () => {
  const width = 794;
  const height = 1123;
  const m = 30;
  const band = 36;
  const topY = m + band / 2;
  const botY = height - m - band / 2;
  const leftX = m + band / 2;
  const rightX = width - m - band / 2;

  const renderMotif = (cx, cy, rotate = 0, key) => (
    <g key={key} transform={`translate(${cx}, ${cy}) rotate(${rotate})`}>
      <path d="M0,0 C-5,-7 -13,-7 -18,0 C-13,7 -5,7 0,0 Z" fill="#6ba38d" />
      <path d="M0,0 C5,-7 13,-7 18,0 C13,7 5,7 0,0 Z" fill="#6ba38d" />
      <path d="M0,0 L-6,-4 L0,-16 L6,-4 Z" fill="#e27c62" />
      <path d="M0,0 L-6,4 L0,16 L6,4 Z" fill="#e27c62" />
    </g>
  );

  const renderDot = (cx, cy, key) => (
    <circle key={key} cx={cx} cy={cy} r="4" fill="#1b315b" />
  );

  const elements = [];
  const hCount = 13;
  const hStep = (rightX - leftX) / (hCount + 1);

  for (let i = 1; i <= hCount; i++) {
    const x = leftX + i * hStep;
    elements.push(renderMotif(x, topY, 0, `m-top-m-${i}`));
    elements.push(renderMotif(x, botY, 0, `m-bot-m-${i}`));
    if (i < hCount) {
      elements.push(renderDot(x + hStep / 2, topY, `m-top-d-${i}`));
      elements.push(renderDot(x + hStep / 2, botY, `m-bot-d-${i}`));
    }
  }
  elements.push(renderDot(leftX + hStep / 2, topY, "m-td-s"));
  elements.push(renderDot(rightX - hStep / 2, topY, "m-td-e"));
  elements.push(renderDot(leftX + hStep / 2, botY, "m-bd-s"));
  elements.push(renderDot(rightX - hStep / 2, botY, "m-bd-e"));

  const vCount = 19;
  const vStep = (botY - topY) / (vCount + 1);

  for (let j = 1; j <= vCount; j++) {
    const y = topY + j * vStep;
    elements.push(renderMotif(leftX, y, 90, `m-l-m-${j}`));
    elements.push(renderMotif(rightX, y, 90, `m-r-m-${j}`));
    if (j < vCount) {
      elements.push(renderDot(leftX, y + vStep / 2, `m-l-d-${j}`));
      elements.push(renderDot(rightX, y + vStep / 2, `m-r-d-${j}`));
    }
  }
  elements.push(renderDot(leftX, topY + vStep / 2, "m-ld-t"));
  elements.push(renderDot(rightX, topY + vStep / 2, "m-rd-t"));
  elements.push(renderDot(leftX, botY - vStep / 2, "m-ld-b"));
  elements.push(renderDot(rightX, botY - vStep / 2, "m-rd-b"));

  elements.push(renderMotif(leftX, topY, 45, "m-c-tl"));
  elements.push(renderMotif(rightX, topY, -45, "m-c-tr"));
  elements.push(renderMotif(leftX, botY, 135, "m-c-bl"));
  elements.push(renderMotif(rightX, botY, -135, "m-c-br"));

  return (
    <svg
      className="mlbc-cert-border-svg"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0" y="0" width={width} height={height} fill="#ffffff" />
      {elements}
    </svg>
  );
};

// --- B. Baptisan / Baptism Border (Image 1) ---
export const BaptismBorder = () => {
  const width = 794;
  const height = 1123;
  const margin = 28;
  const gold = "#cf9e3d";
  const lightGold = "#e6be6d";

  const renderGoldFlourish = (cx, cy, rotate = 0, scale = 1, key) => (
    <g key={key} transform={`translate(${cx}, ${cy}) rotate(${rotate}) scale(${scale})`}>
      <path
        d="M0,0 C-3,-6 -8,-10 -14,-10 C-10,-4 -5,-2 0,0 C5,-2 10,-4 14,-10 C8,-10 3,-6 0,0 Z"
        fill="none"
        stroke={gold}
        strokeWidth="1.6"
      />
      <path
        d="M0,0 C-6,3 -14,6 -18,1 C-20,-3 -18,-8 -12,-8 C-7,-8 -4,-4 -1,0"
        fill="none"
        stroke={gold}
        strokeWidth="1.4"
      />
      <path
        d="M0,0 C6,3 14,6 18,1 C20,-3 18,-8 12,-8 C7,-8 4,-4 1,0"
        fill="none"
        stroke={gold}
        strokeWidth="1.4"
      />
      <circle cx="0" cy="-4" r="2" fill={gold} />
      <circle cx="-16" cy="1" r="1.5" fill={lightGold} />
      <circle cx="16" cy="1" r="1.5" fill={lightGold} />
    </g>
  );

  const elements = [];
  const topY = margin + 18;
  const botY = height - margin - 18;
  const leftX = margin + 18;
  const rightX = width - margin - 18;

  const hSteps = 9;
  const hDist = (rightX - leftX) / hSteps;
  for (let i = 1; i < hSteps; i++) {
    const x = leftX + i * hDist;
    elements.push(renderGoldFlourish(x, topY, 0, 0.9, `bap-h-top-${i}`));
    elements.push(renderGoldFlourish(x, botY, 180, 0.9, `bap-h-bot-${i}`));
    elements.push(<circle key={`bap-dot-t-${i}`} cx={x - hDist / 2} cy={topY} r="2.2" fill={gold} />);
    elements.push(<circle key={`bap-dot-b-${i}`} cx={x - hDist / 2} cy={botY} r="2.2" fill={gold} />);
  }
  elements.push(<circle key="bap-dot-te" cx={rightX - hDist / 2} cy={topY} r="2.2" fill={gold} />);
  elements.push(<circle key="bap-dot-be" cx={rightX - hDist / 2} cy={botY} r="2.2" fill={gold} />);

  const vSteps = 13;
  const vDist = (botY - topY) / vSteps;
  for (let j = 1; j < vSteps; j++) {
    const y = topY + j * vDist;
    elements.push(renderGoldFlourish(leftX, y, -90, 0.9, `bap-v-l-${j}`));
    elements.push(renderGoldFlourish(rightX, y, 90, 0.9, `bap-v-r-${j}`));
    elements.push(<circle key={`bap-vdot-l-${j}`} cx={leftX} cy={y - vDist / 2} r="2.2" fill={gold} />);
    elements.push(<circle key={`bap-vdot-r-${j}`} cx={rightX} cy={y - vDist / 2} r="2.2" fill={gold} />);
  }
  elements.push(<circle key="bap-vdot-le" cx={leftX} cy={botY - vDist / 2} r="2.2" fill={gold} />);
  elements.push(<circle key="bap-vdot-re" cx={rightX} cy={botY - vDist / 2} r="2.2" fill={gold} />);

  const renderCorner = (cx, cy, rotate, key) => (
    <g key={key} transform={`translate(${cx}, ${cy}) rotate(${rotate})`}>
      <path
        d="M0,0 C-10,-4 -20,-3 -26,4 C-28,8 -27,15 -21,18 C-14,20 -6,14 -4,6 C-3,2 -1,1 0,0"
        fill="none"
        stroke={gold}
        strokeWidth="1.8"
      />
      <path
        d="M0,0 C-4,-10 -3,-20 4,-26 C8,-28 15,-27 18,-21 C20,-14 14,-6 6,-4 C2,-3 1,-1 0,0"
        fill="none"
        stroke={gold}
        strokeWidth="1.8"
      />
      <circle cx="-14" cy="9" r="2.5" fill={gold} />
      <circle cx="9" cy="-14" r="2.5" fill={gold} />
      <circle cx="0" cy="0" r="3" fill={lightGold} />
    </g>
  );

  elements.push(renderCorner(leftX, topY, 0, "bap-cor-tl"));
  elements.push(renderCorner(rightX, topY, 90, "bap-cor-tr"));
  elements.push(renderCorner(rightX, botY, 180, "bap-cor-br"));
  elements.push(renderCorner(leftX, botY, 270, "bap-cor-bl"));

  return (
    <svg
      className="mlbc-cert-border-svg"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0" y="0" width={width} height={height} fill="#ffffff" />
      <rect
        x={margin}
        y={margin}
        width={width - margin * 2}
        height={height - margin * 2}
        fill="none"
        stroke={gold}
        strokeWidth="0.8"
        strokeOpacity="0.6"
      />
      <rect
        x={margin + 34}
        y={margin + 34}
        width={width - margin * 2 - 68}
        height={height - margin * 2 - 68}
        fill="none"
        stroke={gold}
        strokeWidth="0.8"
        strokeOpacity="0.4"
      />
      {elements}
    </svg>
  );
};

// --- C. Penyerahan Anak / Child Presentation Border (Image 2) ---
export const ChildBorder = () => {
  const width = 794;
  const height = 1123;
  const margin = 26;
  const band = 38;
  const gold = "#cba358";
  const darkGold = "#b68e42";

  const renderLatticeTile = (x, y, w, h, key) => (
    <g key={key} transform={`translate(${x}, ${y})`}>
      <rect x="0" y="0" width={w} height={h} fill="none" stroke={gold} strokeWidth="1" />
      <polygon
        points={`${w / 2},0 ${w},${h / 2} ${w / 2},${h} 0,${h / 2}`}
        fill="none"
        stroke={darkGold}
        strokeWidth="1"
      />
      <line x1="0" y1="0" x2={w} y2={h} stroke={gold} strokeWidth="0.8" />
      <line x1={w} y1="0" x2="0" y2={h} stroke={gold} strokeWidth="0.8" />
      <circle cx={w / 2} cy={h / 2} r="2.8" fill={gold} />
    </g>
  );

  const tiles = [];
  const tileSize = 28;

  const numHTiles = Math.floor((width - margin * 2) / tileSize);
  const hOffset = (width - margin * 2 - numHTiles * tileSize) / 2;

  for (let i = 0; i < numHTiles; i++) {
    const x = margin + hOffset + i * tileSize;
    tiles.push(renderLatticeTile(x, margin, tileSize, tileSize, `c-top-${i}`));
    tiles.push(
      renderLatticeTile(x, height - margin - tileSize, tileSize, tileSize, `c-bot-${i}`)
    );
  }

  const numVTiles = Math.floor((height - margin * 2 - tileSize * 2) / tileSize);
  const vOffset = (height - margin * 2 - tileSize * 2 - numVTiles * tileSize) / 2;

  for (let j = 0; j < numVTiles; j++) {
    const y = margin + tileSize + vOffset + j * tileSize;
    tiles.push(renderLatticeTile(margin, y, tileSize, tileSize, `c-left-${j}`));
    tiles.push(
      renderLatticeTile(width - margin - tileSize, y, tileSize, tileSize, `c-right-${j}`)
    );
  }

  return (
    <svg
      className="mlbc-cert-border-svg"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0" y="0" width={width} height={height} fill="#ffffff" />
      <rect
        x={margin}
        y={margin}
        width={width - margin * 2}
        height={height - margin * 2}
        fill="none"
        stroke={gold}
        strokeWidth="1.2"
      />
      <rect
        x={margin + band}
        y={margin + band}
        width={width - margin * 2 - band * 2}
        height={height - margin * 2 - band * 2}
        fill="none"
        stroke={gold}
        strokeWidth="1.2"
      />
      {tiles}
    </svg>
  );
};

// =========================================================================
// 3. DATE HELPER (Indonesian Format)
// =========================================================================
export const formatIndonesianDate = (dateVal, includeDayName = true) => {
  if (!dateVal) return "-";
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal);
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember"
  ];
  const dayName = days[d.getDay()];
  const dateNum = d.getDate();
  const monthName = months[d.getMonth()];
  const year = d.getFullYear();
  return includeDayName
    ? `${dayName} , ${dateNum} ${monthName} ${year}`
    : `${dateNum} ${monthName} ${year}`;
};

// =========================================================================
// 4. MAIN CERTIFICATE PRINT MODAL COMPONENT
// =========================================================================
export default function CertificatePrintModal({
  isOpen,
  onClose,
  type = "marriage", // "marriage" | "baptism" | "child"
  record = {}
}) {
  const logoInputRef = useRef(null);
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [customLogoUrl, setCustomLogoUrl] = useState("/mlbc-logo.svg");

  // Editable fields with smart defaults matching the physical certificate
  const [editedData, setEditedData] = useState({
    certificateNumber:
      record?.certificateNumber ||
      (type === "marriage" ? "MLBC / PN / 01 / 06 / 2026" : "MLBC / BP / 01 / 06 / 2026"),
    serviceDate: record?.date || "2026-06-20",
    place: record?.placeOfMarriage || record?.place || "Making Life Better Church Balikpapan",
    pastorName: record?.pastorName || "Pdt. Jimmy Utomo S.M.",
    leadPastor: "Pdt. Ronny Runtukahu S.E., M.Th.",
    city: "Balikpapan",

    // Marriage specific
    husbandName: record?.husband?.fullName || record?.husbandName || "Reiven Sumanti",
    husbandBirth:
      record?.husbandplaceofbirth && record?.husbandateofbirth
        ? `${record.husbandplaceofbirth}, ${formatIndonesianDate(record.husbandateofbirth, false)}`
        : record?.husbandateofbirth
        ? formatIndonesianDate(record.husbandateofbirth, false)
        : "27 Januari 1995",
    wifeName: record?.wife?.fullName || record?.wifeName || "Ingrit Agustin Wullur",
    wifeBirth:
      record?.wifeplaceofbirth && record?.wifedateofbirth
        ? `${record.wifeplaceofbirth}, ${formatIndonesianDate(record.wifedateofbirth, false)}`
        : record?.wifedateofbirth
        ? formatIndonesianDate(record.wifedateofbirth, false)
        : "14 Agustus 1995",

    // Baptism specific
    memberName: record?.member?.fullName || record?.fullName || "Jason Setiawan",
    gender: record?.gender || record?.member?.gender || "Laki-laki",
    memberBirth:
      record?.member?.placeOfBirth && record?.member?.dateOfBirth
        ? `${record.member.placeOfBirth}, ${formatIndonesianDate(record.member.dateOfBirth, false)}`
        : "Balikpapan, 6 Mei 2016",
    fatherName: record?.fatherName || record?.father || "Bpk. Hendra",
    motherName: record?.motherName || record?.mother || "Ibu Maria",

    // Child specific
    childName: record?.childName || record?.member?.fullName || "Gavin Octavianus",
    childBirth:
      record?.placeofbirth && record?.dateofbirth
        ? `${record.placeofbirth}, ${formatIndonesianDate(record.dateofbirth, false)}`
        : "Balikpapan, 11 Oktober 2024"
  });

  if (!isOpen) return null;

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setCustomLogoUrl(uploadEvent.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = () => {
    setCustomLogoUrl("/mlbc-logo.svg");
  };

  // Direct Browser Print
  const handleDirectPrint = () => {
    window.print();
  };

  // Open Standalone Print Window for isolated print
  const handleOpenPrintWindow = () => {
    const printContent = document.getElementById("mlbc-printable-certificate");
    if (!printContent) return;

    const printWin = window.open("", "_blank");
    if (!printWin) {
      alert("Popup terblokir browser. Silakan izinkan popup atau gunakan 'Cetak Sekarang'.");
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${docTitleHeader}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 0;
            }
            * {
              box-sizing: border-box;
            }
            body {
              margin: 0;
              padding: 0;
              background: #ffffff;
              display: flex;
              justify-content: center;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .sheet {
              width: 210mm;
              height: 297mm;
              position: relative;
              overflow: hidden;
              background: #ffffff;
            }
            ${document.querySelector('style[data-vite-dev-id*="CertificatePrintModal.css"]')?.innerHTML || ""}
          </style>
        </head>
        <body>
          <div class="sheet">
            ${printContent.innerHTML}
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            };
          </script>
        </body>
      </html>
    `;

    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();
  };

  // Certificate Specific Headers and Verses
  let docTitleHeader = "SERTIFIKAT PERNIKAHAN";
  let documentTitle = "Sertifikat Pernikahan";
  let verseText =
    "Demikianlah mereka bukan lagi dua, melainkan satu. Karena itu, apa yang telah dipersatukan Allah, tidak boleh diceraikan manusia.";
  let verseRef = "Matius 19:6";

  if (type === "baptism") {
    docTitleHeader = "SERTIFIKAT BAPTISAN";
    documentTitle = "Sertifikat Baptisan";
    verseText =
      "Dengan demikian kita telah dikuburkan bersama-sama dengan Dia oleh baptisan dalam kematian, supaya, sama seperti Kristus telah dibangkitkan dari antara orang mati oleh kemuliaan Bapa, demikian juga kita akan hidup dalam hidup yang baru.";
    verseRef = "Roma 6:4";
  } else if (type === "child") {
    docTitleHeader = "SERTIFIKAT PENYERAHAN ANAK";
    documentTitle = "Sertifikat Penyerahan Anak";
    verseText =
      '"Biarkan anak-anak itu datang kepada-Ku, jangan menghalang-halangi mereka, sebab orang-orang yang seperti itulah yang empunya Kerajaan Allah."';
    verseRef = "Markus 10:14b";
  }

  const formattedServiceDate = formatIndonesianDate(editedData.serviceDate, true);

  return (
    <div className="cert-modal-backdrop" onClick={onClose}>
      <div className="cert-modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Top Action Bar */}
        <div className="cert-modal-topbar">
          <div className="cert-modal-title">
            <h3>Pratinjau & Cetak Sertifikat</h3>
            <span className="cert-modal-badge">{documentTitle}</span>
          </div>

          <div className="cert-modal-actions">
            {/* Hidden file input for logo */}
            <input
              type="file"
              accept="image/*"
              ref={logoInputRef}
              style={{ display: "none" }}
              onChange={handleLogoUpload}
            />

            <button
              type="button"
              className="btn-cert-action btn-cert-secondary"
              onClick={() => logoInputRef.current?.click()}
              title="Ganti logo dengan file logo lokal"
            >
              <Upload size={15} />
              <span>Ganti Logo</span>
            </button>

            {customLogoUrl !== "/mlbc-logo.svg" && (
              <button
                type="button"
                className="btn-cert-action btn-cert-secondary"
                onClick={handleResetLogo}
                title="Reset ke logo bawaan"
              >
                <RotateCcw size={14} />
                <span>Reset Logo</span>
              </button>
            )}

            <button
              type="button"
              className="btn-cert-action btn-cert-secondary"
              onClick={() => setShowEditDrawer(!showEditDrawer)}
              title="Sesuaikan nama pendeta, tanggal, nomor sertifikat"
            >
              <Edit3 size={15} />
              <span>{showEditDrawer ? "Tutup Editor" : "Sesuaikan Data"}</span>
            </button>

            <button
              type="button"
              className="btn-cert-action btn-cert-secondary"
              onClick={handleOpenPrintWindow}
              title="Buka pratinjau di jendela browser terpisah"
            >
              <ExternalLink size={15} />
              <span>Tab Baru</span>
            </button>

            <button
              type="button"
              className="btn-cert-action btn-cert-primary"
              onClick={handleDirectPrint}
            >
              <Printer size={16} />
              <span>Cetak Sekarang</span>
            </button>

            <button
              type="button"
              className="btn-cert-close"
              onClick={onClose}
              aria-label="Tutup"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Quick Edit Drawer */}
        {showEditDrawer && (
          <div className="cert-edit-drawer">
            <div className="cert-edit-field">
              <label>No. Sertifikat</label>
              <input
                type="text"
                name="certificateNumber"
                value={editedData.certificateNumber}
                onChange={handleFieldChange}
              />
            </div>
            <div className="cert-edit-field">
              <label>Hari & Tanggal Pelayanan</label>
              <input
                type="date"
                name="serviceDate"
                value={
                  editedData.serviceDate
                    ? new Date(editedData.serviceDate).toISOString().split("T")[0]
                    : ""
                }
                onChange={handleFieldChange}
              />
            </div>
            <div className="cert-edit-field">
              <label>Tempat Ibadah</label>
              <input
                type="text"
                name="place"
                value={editedData.place}
                onChange={handleFieldChange}
              />
            </div>
            <div className="cert-edit-field">
              <label>Dilayani Oleh (Pendeta)</label>
              <input
                type="text"
                name="pastorName"
                value={editedData.pastorName}
                onChange={handleFieldChange}
              />
            </div>

            {type === "marriage" && (
              <>
                <div className="cert-edit-field">
                  <label>Nama Mempelai Pria</label>
                  <input
                    type="text"
                    name="husbandName"
                    value={editedData.husbandName}
                    onChange={handleFieldChange}
                  />
                </div>
                <div className="cert-edit-field">
                  <label>Tempat & Tgl Lahir Pria</label>
                  <input
                    type="text"
                    name="husbandBirth"
                    value={editedData.husbandBirth}
                    onChange={handleFieldChange}
                  />
                </div>
                <div className="cert-edit-field">
                  <label>Nama Mempelai Wanita</label>
                  <input
                    type="text"
                    name="wifeName"
                    value={editedData.wifeName}
                    onChange={handleFieldChange}
                  />
                </div>
                <div className="cert-edit-field">
                  <label>Tempat & Tgl Lahir Wanita</label>
                  <input
                    type="text"
                    name="wifeBirth"
                    value={editedData.wifeBirth}
                    onChange={handleFieldChange}
                  />
                </div>
              </>
            )}

            {type === "baptism" && (
              <>
                <div className="cert-edit-field">
                  <label>Nama Jemaat</label>
                  <input
                    type="text"
                    name="memberName"
                    value={editedData.memberName}
                    onChange={handleFieldChange}
                  />
                </div>
                <div className="cert-edit-field">
                  <label>Jenis Kelamin</label>
                  <input
                    type="text"
                    name="gender"
                    value={editedData.gender}
                    onChange={handleFieldChange}
                  />
                </div>
                <div className="cert-edit-field">
                  <label>Tempat & Tgl Lahir</label>
                  <input
                    type="text"
                    name="memberBirth"
                    value={editedData.memberBirth}
                    onChange={handleFieldChange}
                  />
                </div>
                <div className="cert-edit-field">
                  <label>Nama Ayah</label>
                  <input
                    type="text"
                    name="fatherName"
                    value={editedData.fatherName}
                    onChange={handleFieldChange}
                  />
                </div>
                <div className="cert-edit-field">
                  <label>Nama Ibu</label>
                  <input
                    type="text"
                    name="motherName"
                    value={editedData.motherName}
                    onChange={handleFieldChange}
                  />
                </div>
              </>
            )}

            {type === "child" && (
              <>
                <div className="cert-edit-field">
                  <label>Nama Anak</label>
                  <input
                    type="text"
                    name="childName"
                    value={editedData.childName}
                    onChange={handleFieldChange}
                  />
                </div>
                <div className="cert-edit-field">
                  <label>Jenis Kelamin</label>
                  <input
                    type="text"
                    name="gender"
                    value={editedData.gender}
                    onChange={handleFieldChange}
                  />
                </div>
                <div className="cert-edit-field">
                  <label>Tempat & Tgl Lahir</label>
                  <input
                    type="text"
                    name="childBirth"
                    value={editedData.childBirth}
                    onChange={handleFieldChange}
                  />
                </div>
                <div className="cert-edit-field">
                  <label>Nama Ayah</label>
                  <input
                    type="text"
                    name="fatherName"
                    value={editedData.fatherName}
                    onChange={handleFieldChange}
                  />
                </div>
                <div className="cert-edit-field">
                  <label>Nama Ibu</label>
                  <input
                    type="text"
                    name="motherName"
                    value={editedData.motherName}
                    onChange={handleFieldChange}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Certificate Viewport */}
        <div className="cert-preview-viewport">
          {/* Target for Screen & Print (#mlbc-printable-certificate) */}
          <div id="mlbc-printable-certificate" className={`mlbc-certificate-sheet mlbc-cert-type-${type}`}>
            {/* 1. Distinctive SVG Border for each certificate */}
            {type === "marriage" && <MarriageBorder />}
            {type === "baptism" && <BaptismBorder />}
            {type === "child" && <ChildBorder />}

            {/* 2. Inner Document Content */}
            <div className="mlbc-cert-inner">
              {/* Header */}
              <div className="mlbc-cert-header">
                <div className="mlbc-cert-logo-wrap">
                  <img
                    src={customLogoUrl}
                    alt="Making Life Better Church"
                    className="mlbc-cert-official-logo"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const fb = document.getElementById("mlbc-fallback-logo-svg");
                      if (fb) fb.style.display = "flex";
                    }}
                  />
                  <div id="mlbc-fallback-logo-svg" style={{ display: "none" }}>
                    <MLBCLogo size={68} />
                  </div>
                </div>
                <h1 className="mlbc-cert-church-name">MAKING LIFE BETTER CHURCH</h1>
                <h2 className="mlbc-cert-city-name">{editedData.city.toUpperCase()}</h2>
                <h3 className="mlbc-cert-doc-title">{docTitleHeader}</h3>

                {/* Certificate Number Row */}
                <div className="mlbc-cert-number-row">
                  <span className="mlbc-cert-no-label">No.</span>
                  <div className="mlbc-cert-no-line-wrap">
                    <span className="mlbc-cert-no-value">{editedData.certificateNumber}</span>
                  </div>
                </div>

                {/* Scripture Verse flanked by thin divider lines */}
                <div className="mlbc-cert-verse-section">
                  <div className="mlbc-cert-divider-line"></div>
                  <div className="mlbc-cert-verse-box">
                    <p className="mlbc-cert-verse-text">{verseText}</p>
                    <p className="mlbc-cert-verse-ref">{verseRef}</p>
                  </div>
                  <div className="mlbc-cert-divider-line"></div>
                </div>
              </div>

              {/* ======================================================= */}
              {/* BODY: MARRIAGE CERTIFICATE (Image 3)                    */}
              {/* ======================================================= */}
              {type === "marriage" && (
                <div className="mlbc-cert-body">
                  {/* Revision #4: Bold Subheading */}
                  <div className="mlbc-cert-subheading-lead">
                    Telah diteguhkan dan diberkati pernikahannya
                  </div>

                  <div className="mlbc-cert-form-group">
                    <div className="mlbc-cert-row">
                      <span className="mlbc-cert-label">Nama :</span>
                      <span className="mlbc-cert-value-line">{editedData.husbandName}</span>
                    </div>
                    <div className="mlbc-cert-row">
                      <span className="mlbc-cert-label">Tempat & Tanggal Lahir :</span>
                      <span className="mlbc-cert-value-line">{editedData.husbandBirth}</span>
                    </div>
                  </div>

                  <div className="mlbc-cert-connector-text">Dengan</div>

                  <div className="mlbc-cert-form-group">
                    <div className="mlbc-cert-row">
                      <span className="mlbc-cert-label">Nama :</span>
                      <span className="mlbc-cert-value-line">{editedData.wifeName}</span>
                    </div>
                    <div className="mlbc-cert-row">
                      <span className="mlbc-cert-label">Tempat & Tanggal Lahir :</span>
                      <span className="mlbc-cert-value-line">{editedData.wifeBirth}</span>
                    </div>
                  </div>

                  <div className="mlbc-cert-service-section">
                    <div className="mlbc-cert-subheading">Dalam Ibadah</div>
                    <div className="mlbc-cert-row">
                      <span className="mlbc-cert-label">Hari & Tanggal :</span>
                      <span className="mlbc-cert-value-line">{formattedServiceDate}</span>
                    </div>
                    <div className="mlbc-cert-row">
                      <span className="mlbc-cert-label">Tempat :</span>
                      <span className="mlbc-cert-value-line">{editedData.place}</span>
                    </div>
                    <div className="mlbc-cert-row">
                      <span className="mlbc-cert-label">Dilayani Oleh :</span>
                      <span className="mlbc-cert-value-line">{editedData.pastorName}</span>
                    </div>
                  </div>

                  {/* Revision #2 & #3: Frame Foto HANYA untuk pernikahan (landscape ratio) */}
                  {/* & Posisi Tanda Tangan dinaikkan ~100px */}
                  <div className="mlbc-cert-bottom-row mlbc-cert-bottom-raised">
                    {/* Landscape Photo Frame: Border ONLY, NO fill */}
                    <div className="mlbc-photo-box mlbc-photo-box-landscape"></div>

                    {/* Signature block: NO stamp, NO digital signature */}
                    <div className="mlbc-sig-block">
                      <div className="mlbc-sig-city-date">
                        {editedData.city}, {formatIndonesianDate(editedData.serviceDate, false)}
                      </div>
                      <div className="mlbc-sig-dotted-line"></div>
                      <div className="mlbc-sig-blank-space"></div>
                      <div className="mlbc-pastor-name-line">{editedData.leadPastor}</div>
                      <div className="mlbc-solid-underline"></div>
                      <div className="mlbc-pastor-title">Gembala Sidang</div>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================= */}
              {/* BODY: BAPTISM CERTIFICATE (Image 1)                     */}
              {/* ======================================================= */}
              {type === "baptism" && (
                <div className="mlbc-cert-body">
                  {/* Revision #5: Bold Subheading */}
                  <div className="mlbc-cert-subheading-lead mlbc-subheading-baptism">
                    Telah dibaptis dalam nama<br />
                    Allah Bapa, Anak dan Roh Kudus
                  </div>

                  <div className="mlbc-cert-form-group">
                    <div className="mlbc-cert-row">
                      <span className="mlbc-cert-label">Nama :</span>
                      <span className="mlbc-cert-value-line">{editedData.memberName}</span>
                    </div>
                    <div className="mlbc-cert-row">
                      <span className="mlbc-cert-label">Jenis Kelamin :</span>
                      <span className="mlbc-cert-value-line">{editedData.gender}</span>
                    </div>
                    <div className="mlbc-cert-row">
                      <span className="mlbc-cert-label">Tempat & Tanggal Lahir :</span>
                      <span className="mlbc-cert-value-line">{editedData.memberBirth}</span>
                    </div>
                    <div className="mlbc-cert-row">
                      <span className="mlbc-cert-label">Nama Ayah :</span>
                      <span className="mlbc-cert-value-line">{editedData.fatherName}</span>
                    </div>
                    <div className="mlbc-cert-row">
                      <span className="mlbc-cert-label">Nama Ibu :</span>
                      <span className="mlbc-cert-value-line">{editedData.motherName}</span>
                    </div>
                  </div>

                  <div className="mlbc-cert-service-section">
                    <div className="mlbc-cert-row">
                      <span className="mlbc-cert-label">Hari & Tanggal :</span>
                      <span className="mlbc-cert-value-line">{formattedServiceDate}</span>
                    </div>
                    <div className="mlbc-cert-row">
                      <span className="mlbc-cert-label">Tempat :</span>
                      <span className="mlbc-cert-value-line">{editedData.place}</span>
                    </div>
                    <div className="mlbc-cert-row">
                      <span className="mlbc-cert-label">Dilayani Oleh :</span>
                      <span className="mlbc-cert-value-line">{editedData.pastorName}</span>
                    </div>
                  </div>

                  {/* Revision #2: NO photo frame for baptism! Frame foto HANYA untuk pernikahan */}
                  {/* Revision #3: Posisi Tanda Tangan dinaikkan ~100px */}
                  <div className="mlbc-cert-bottom-row mlbc-bottom-no-photo mlbc-cert-bottom-raised">
                    <div className="mlbc-bottom-spacer"></div>

                    {/* Signature block: NO stamp, NO digital signature */}
                    <div className="mlbc-sig-block">
                      <div className="mlbc-sig-dotted-line"></div>
                      <div className="mlbc-sig-blank-space"></div>
                      <div className="mlbc-solid-underline"></div>
                      <div className="mlbc-pastor-title">Gembala Sidang</div>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================= */}
              {/* BODY: CHILD PRESENTATION CERTIFICATE (Image 2)          */}
              {/* ======================================================= */}
              {type === "child" && (
                <div className="mlbc-cert-body">
                  <div className="mlbc-cert-form-group">
                    <div className="mlbc-cert-row">
                      <span className="mlbc-cert-label">Nama :</span>
                      <span className="mlbc-cert-value-line">{editedData.childName}</span>
                    </div>
                    <div className="mlbc-cert-row">
                      <span className="mlbc-cert-label">Jenis Kelamin :</span>
                      <span className="mlbc-cert-value-line">{editedData.gender}</span>
                    </div>
                    <div className="mlbc-cert-row">
                      <span className="mlbc-cert-label">Tempat & Tanggal Lahir :</span>
                      <span className="mlbc-cert-value-line">{editedData.childBirth}</span>
                    </div>
                    <div className="mlbc-cert-row">
                      <span className="mlbc-cert-label">Nama Ayah :</span>
                      <span className="mlbc-cert-value-line">{editedData.fatherName}</span>
                    </div>
                    <div className="mlbc-cert-row">
                      <span className="mlbc-cert-label">Nama Ibu :</span>
                      <span className="mlbc-cert-value-line">{editedData.motherName}</span>
                    </div>
                  </div>

                  <div className="mlbc-cert-subheading-lead mlbc-subheading-child">
                    Telah diserahkan kepada Tuhan
                  </div>

                  <div className="mlbc-cert-service-section">
                    <div className="mlbc-cert-subheading">Dalam Ibadah</div>
                    <div className="mlbc-cert-row">
                      <span className="mlbc-cert-label">Hari & Tanggal :</span>
                      <span className="mlbc-cert-value-line">{formattedServiceDate}</span>
                    </div>
                    <div className="mlbc-cert-row">
                      <span className="mlbc-cert-label">Tempat :</span>
                      <span className="mlbc-cert-value-line">{editedData.place}</span>
                    </div>
                    <div className="mlbc-cert-row">
                      <span className="mlbc-cert-label">Dilayani Oleh :</span>
                      <span className="mlbc-cert-value-line">{editedData.pastorName}</span>
                    </div>
                  </div>

                  {/* Revision #2: NO photo frame for child */}
                  {/* Revision #3: Posisi Tanda Tangan dinaikkan ~100px */}
                  <div className="mlbc-cert-bottom-row mlbc-bottom-no-photo mlbc-cert-bottom-raised">
                    <div className="mlbc-bottom-spacer"></div>

                    {/* Signature block: NO stamp, NO digital signature */}
                    <div className="mlbc-sig-block">
                      <div className="mlbc-sig-dotted-line"></div>
                      <div className="mlbc-sig-blank-space"></div>
                      <div className="mlbc-solid-underline"></div>
                      <div className="mlbc-pastor-title">Gembala Sidang</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
