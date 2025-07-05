import React, { useState } from "react";
import "./ChurchInfoCard.css"; // Import the CSS

const ChurchInfoCard = () => {
  const [tab, setTab] = useState("Gereja");

  return (
    <div className="church-card">
      <img
        className="church-image"
        src="https://firebasestorage.googleapis.com/v0/b/church-app-f10af.firebasestorage.app/o/gallery%2F1751468507671_WhatsApp%20Image%202025-06-28%20at%2014.47.04%20(1).jpeg?alt=media&token=b70cea5f-d93f-4ea0-ac0f-35600c717d04"
        alt="Making Life Better Church"
      />
      <div className="church-body">
        <h3 className="church-title">Making Life Better Church</h3>

        <div className="tab-buttons">
          {["Gereja", "Kantor", "Ibadah", "Memberi"].map((t) => (
            <button
              key={t}
              className={`tab-button ${tab === t ? "active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="tab-content">
          {tab === "Gereja" && (
            <div>
              <p>MLB CENTER</p>
              <p>Sekolah Harapan Bangsa 99G Lt.3</p>
              <p>Balikpapan, Kalimantan timur</p>
<button 
  className="blue-button"
  onClick={() => window.open('https://www.google.com/maps?q=MLB+CHURCH+Balikpapan', '_blank')}
>
  Lihat Lokasi
</button>

            </div>
          )}
          {tab === "Kantor" && (
            <div>
              <p> Sekolah Harapan Bangsa 99G</p>
              <p>Balikpapan</p>
              <p>📞 62-812-5494-8220</p>
              <p>📧 wartanewsgo2@gmail.com</p>
            </div>
          )}
          {tab === "Ibadah" && (
            <div>
              <strong className="section-label">Ibadah Umum</strong>
              <ul>
                <li>Ibadah Umum : 09.00 WITA</li>
                <li>MLB KIDS CLUB : 09.00 WITA</li>
              </ul>
            </div>
          )}
          {tab === "Memberi" && (
            <div className="giving-section">
              <p><strong>Making Life Better</strong></p>
              <p className="account-number">BCA 781.588.8057</p>
              <button className="blue-button">Salin</button>
              <img
                src="https://via.placeholder.com/120x120.png?text=QR"
                alt="QR Code"
                className="qr-code"
              />
              <p>Pindai QR code dengan aplikasi berikut:</p>
              <div className="pay-icons">
                <span>BCA</span>
                <span>OVO</span>
                <span>DANA</span>
                <span>LinkAja</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChurchInfoCard;
