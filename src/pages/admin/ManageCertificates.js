import React, { useState } from "react";
import { Award, Droplets, Heart, Baby, Printer } from "lucide-react";
import BaptismForm from "./sertificate";
import MarriageForm from "./MarriageForm";
import ChildForm from "./ChildForm";
import CertificatePrintModal from "./CertificatePrintModal";
import "./ManageCertificates.css";

const ManageCertificates = () => {
  const [type, setType] = useState("baptism");
  const [sampleModalOpen, setSampleModalOpen] = useState(false);

  const certificateTypes = [
    { id: "baptism", label: "Baptisan", icon: Droplets, desc: "Penerbitan & cetak sertifikat baptisan kudus" },
    { id: "marriage", label: "Pernikahan", icon: Heart, desc: "Penerbitan & cetak sertifikat pernikahan kudus" },
    { id: "child", label: "Penyerahan Anak", icon: Baby, desc: "Penerbitan & cetak sertifikat penyerahan anak" },
  ];

  const currentTypeInfo = certificateTypes.find((t) => t.id === type);

  return (
    <div className="certificate-page-wrapper">
      {/* Modern Minimalist Header */}
      <div className="cert-header-card">
        <div className="cert-header-main">
          <div className="cert-header-icon">
            <Award size={24} />
          </div>
          <div className="cert-header-text">
            <h1>Manajemen Sertifikat</h1>
            <p>Penerbitan, arsip data, dan pencetakan sertifikat pelayanan gereja</p>
          </div>
        </div>

        {/* Minimalist Segmented Tabs */}
        <div className="cert-tabs-bar">
          {certificateTypes.map((item) => {
            const IconComponent = item.icon;
            const isActive = type === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`cert-tab-btn ${isActive ? "active" : ""}`}
                onClick={() => setType(item.id)}
              >
                <IconComponent size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Form Indicator Bar */}
      <div className="cert-active-indicator">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span className="cert-active-dot"></span>
          <span className="cert-active-text">{currentTypeInfo?.desc}</span>
        </div>
        <button
          type="button"
          className="btn-cert-sample-trigger"
          onClick={() => setSampleModalOpen(true)}
          title={`Lihat & cetak sampel layout sertifikat ${currentTypeInfo?.label}`}
        >
          <Printer size={14} />
          <span>Cetak Sampel {currentTypeInfo?.label}</span>
        </button>
      </div>

      {/* Child Forms */}
      <div className="certificate-form-content">
        {type === "baptism" && <BaptismForm />}
        {type === "marriage" && <MarriageForm />}
        {type === "child" && <ChildForm />}
      </div>

      {sampleModalOpen && (
        <CertificatePrintModal
          isOpen={sampleModalOpen}
          onClose={() => setSampleModalOpen(false)}
          type={type}
          record={{}}
        />
      )}
    </div>
  );
};

export default ManageCertificates;
