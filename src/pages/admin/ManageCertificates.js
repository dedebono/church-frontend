import React, { useState } from "react"
import BaptismForm from "./sertificate"
import MarriageForm from "./MarriageForm"
import ChildForm from "./ChildForm"

const ManageCertificates = () => {
  const [type, setType] = useState("baptism")

  return (
    <div className="certificate-admin-container">
      <h2>📜 Manajemen Sertifikat</h2>
      <select 
      value={type} onChange={(e) => setType(e.target.value)} className="form-dropdown width40px">
        <option value="baptism">🕊️ Baptis</option>
        <option value="marriage">💍 Pernikahan</option>
        <option value="child">👶 Penyerahan Anak</option>
      </select>

      <div className="certificate-form">
        {type === "baptism" && <BaptismForm />}
        {type === "marriage" && <MarriageForm />}
        {type === "child" && <ChildForm />}
      </div>
    </div>
  )
}

export default ManageCertificates
