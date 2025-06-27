// RegistrationForm.js
import React, { useState, useEffect } from 'react';
import api from './admin/api/API';
import './RegistrationForm.css';

function RegistrationForm() {
  const [familyName, setFamilyName] = useState('');
  const [familyDate, setFamilyDate] = useState('');
  const [email, setEmail] = useState('');
  const [familyId, setFamilyId] = useState(null);
  const [isFamilySubmitted, setIsFamilySubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [members, setMembers] = useState([{
    fullName: '',
    gender: '',
    placeOfBirth: '',
    dateOfBirth: '',
    bloodType: '',
    phoneNumber: '',
    address: '',
    familyStatus: '',
    hobby: '',
    eduHistory: '',
    jobNow: '',
    baptismStatus: '',
    maritalStatus: '',
    congregationStatus: '',
    bpjsStatus: '',
    yakumkrisStatus: ''
  }]);

  // Debugging: watch familyId
  useEffect(() => {
    console.log("Updated familyId:", familyId);
  }, [familyId]);

  const handleFamilySubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!familyName || !familyDate || !email) {
      setError('Please fill out all required fields.');
      return;
    }

    setIsLoading(true);
    try {
      const familyResponse = await api.post('/api/families', {
        familyName,
        familyDate,
        email,
      });

      const id = familyResponse.data._id;
      if (!id) {
        throw new Error('Family _id not found in response');
      }

      setFamilyId(id);
      setIsFamilySubmitted(true);
    } catch (error) {
      console.error('Family registration failed:', {
        error: error.message,
        response: error.response?.data,
        stack: error.stack
      });
      setError(error.response?.data?.message || 'Failed to register family. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMemberChange = (index, fieldName, event) => {
    const newMembers = [...members];
    newMembers[index][fieldName] = event.target.value;
    setMembers(newMembers);
  };

  const handleMemberDateChange = (index, fieldName, date) => {
    const newMembers = [...members];
    newMembers[index][fieldName] = date ? date.toISOString().split('T')[0] : '';
    setMembers(newMembers);
  };

  const addMember = () => {
    setMembers([
      ...members,
      {
        fullName: '',
        gender: '',
        placeOfBirth: '',
        dateOfBirth: '',
        bloodType: '',
        phoneNumber: '',
        address: '',
        familyStatus: '',
        hobby: '',
        eduHistory: '',
        jobNow: '',
        baptismStatus: '',
        maritalStatus: '',
        congregationStatus: '',
        bpjsStatus: '',
        yakumkrisStatus: ''
      }
    ]);
  };

  const removeMember = (index) => {
    if (members.length <= 1) return;
    const newMembers = [...members];
    newMembers.splice(index, 1);
    setMembers(newMembers);
  };

  const handleAllSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!familyId) {
      setError('Please register the family first.');
      return;
    }

    const invalidMembers = members.some(member =>
      !member.fullName || !member.gender || !member.familyStatus
    );

    if (invalidMembers) {
      setError('Please fill all required fields for each member.');
      return;
    }

    setIsLoading(true);
    try {
      const membersWithFamily = members.map((member) => ({
        ...member,
        familyId: familyId
      }));

      const response = await api.post('/api/members', membersWithFamily);
      console.log('Members submission response:', response);

      resetForm();
      alert('Registration successful! Family and members have been registered.');
    } catch (error) {
      console.error('Members registration failed:', {
        error: error.message,
        response: error.response?.data,
        stack: error.stack
      });
      setError(error.response?.data?.message || 'Failed to register members. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFamilyName('');
    setFamilyDate('');
    setEmail('');
    setFamilyId(null);
    setIsFamilySubmitted(false);
    setMembers([{
      fullName: '',
      gender: '',
      placeOfBirth: '',
      dateOfBirth: '',
      bloodType: '',
      phoneNumber: '',
      address: '',
      familyStatus: '',
      hobby: '',
      eduHistory: '',
      jobNow: '',
      baptismStatus: '',
      maritalStatus: '',
      congregationStatus: '',
      bpjsStatus: '',
      yakumkrisStatus: ''
    }]);
  };

  return (
    <div className='page-outer'>
      <div><h2 className='h2-up'>Pendaftaran Keluarga</h2><div>
        <div className='family-registration'>
          <form onSubmit={isFamilySubmitted ? handleAllSubmit : handleFamilySubmit}>
            <div className='cont-family'>
              <label><h3>Data Keluarga:</h3></label>
              <p className='info'>Nama Kepala Keluarga</p>
              <input className="form-input"
                type="text"
                placeholder='Nama Kepala Keluarga'
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                required={!isFamilySubmitted}
                disabled={isFamilySubmitted}
              />
              <p className='info'>Tanggal Pernikahan (isi dengan 00/00/2000 - jika belum menikah)</p>
              <input
                className="form-date"
                type="date"
                value={familyDate}
                onChange={(e) => setFamilyDate(e.target.value)}
                placeholder="Tanggal Pernikahan"
                required={!isFamilySubmitted}
                disabled={isFamilySubmitted}
              />
              <p className='info'>Email (password akan dikirim ke email)</p>
                <input className="form-input"
                type="email"
                placeholder='email'
                value={email}  
                onChange={(e) => setEmail(e.target.value)}
                required={!isFamilySubmitted}
                disabled={isFamilySubmitted}
              />
              
              {!isFamilySubmitted && (
                <button className='button-submit' type="submit">Register Family</button>
              )}
            </div>

            {isFamilySubmitted && members.map((member, index) => (
              <div className='cont-member' key={index}>
                <h4>Anggota Keluarga {index + 1}</h4>
                <input className="form-input" name="fullName" placeholder='Nama lengkap sesuai KTP'
                  value={member.fullName}
                  onChange={(e) => handleMemberChange(index, 'fullName', e)}
                  required
                />
                <select className='form-select'
                  name="gender" value={member.gender} onChange={(e) => handleMemberChange(index, 'gender', e)} required>
                  <option value="">Jenis Kelamin</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
                <input className="form-input" name="placeOfBirth" placeholder="Tempat Lahir" value={member.placeOfBirth}
                  onChange={(e) => handleMemberChange(index, 'placeOfBirth', e)}
                  required
                />
                <p className='info'>Tanggal Lahir</p>
                <input type="date" 
                className='form-date'
                value={member.dateOfBirth} onChange={(e) => 
                  handleMemberChange(index, 'dateOfBirth', e)} 
                required />
                <select className='form-select'
                  value={member.bloodType}
                  onChange={(e) => handleMemberChange(index, 'bloodType', e)}
                  required
                >
                  <option value="">Pilih Golongan Darah</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="O">O</option>
                  <option value="AB">AB</option>
                </select>
                <input className="form-input" name="address" placeholder="Alamat" value={member.address} onChange={(e) => handleMemberChange(index, 'address', e)} required />
                <select className="form-select"
                  value={member.familyStatus}
                  onChange={(e) => handleMemberChange(index, 'familyStatus', e)}
                  required
                >
                  <option value="">Hubungan Keluarga</option>
                  <option value="Suami">Suami</option>
                  <option value="Istri">Istri</option>
                  <option value="Anak">Anak</option>
                  <option value="Saudara">Saudara</option>
                  <option value="Single">Single</option>
                </select>
                <input className="form-input" name="phoneNumber" placeholder="Handphone" value={member.phoneNumber} onChange={(e) => handleMemberChange(index, 'phoneNumber', e)} required />
                <input className="form-input" name="hobby" placeholder="Hobi" value={member.hobby} onChange={(e) => handleMemberChange(index, 'hobby', e)} required />
                <select className="form-select"
                  value={member.eduHistory}
                  onChange={(e) => handleMemberChange(index, 'eduHistory', e)}
                  required
                >
                  <option value="">Pendidikan Terakhir</option>
                  <option value="Belum Sekolah">Belum Sekolah</option>
                  <option value="Sekolah Dasar (SD)">Sekolah Dasar (SD)</option>
                  <option value="Sekolah Menengah Pertama(SMP)">Sekolah Menengah Pertama(SMP)</option>
                  <option value="Sekolah Menengah Atas (SMA)">Sekolah Menengah Atas (SMA)</option>
                  <option value="Perguruan Tinggi">Perguruan Tinggi</option>
                </select>
                <input className="form-input" name="jobNow" placeholder="Pekerjaan" value={member.jobNow} onChange={(e) => handleMemberChange(index, 'jobNow', e)} required />
                <select className="form-select"
                  value={member.maritalStatus}
                  onChange={(e) => handleMemberChange(index, 'maritalStatus', e)}
                  required
                >
                  <option value="">Status Pernikahan</option>
                  <option value="Menikah">Menikah</option>
                  <option value="Belum Menikah">Belum Menikah</option>
                  <option value="Janda/Duda">Janda/Duda</option>
                </select>
                <select className="form-select"
                  value={member.baptismStatus}
                  onChange={(e) => handleMemberChange(index, 'baptismStatus', e)}
                  required
                >
                  <option value="">Status Baptisan</option>
                  <option value="Belum">Belum</option>
                  <option value="Sudah">Sudah</option>
                </select>
                <select className="form-select"
                  value={member.congregationStatus}
                  onChange={(e) => handleMemberChange(index, 'congregationStatus', e)}
                  required
                >
                  <option value="">Status Anggota</option>
                  <option value="Jemaat">Jemaat</option>
                  <option value="Simpatisan">Simpatisan</option>
                  <option value="Tamu">Tamu</option>
                </select>
                <select className="form-select"
                  value={member.bpjsStatus}
                  onChange={(e) => handleMemberChange(index, 'bpjsStatus', e)}
                  required
                >
                  <option value="">BPJS</option>
                  <option value="Ada">Ada</option>
                  <option value="Tidak ada">Tidak ada</option>
                </select>
                <select className="form-select"
                  value={member.yakumkrisStatus}
                  onChange={(e) => handleMemberChange(index, 'yakumkrisStatus', e)}
                  required
                >
                  <option value="">Anggota YAKUMKRIS ?</option>
                  <option value="Iya">Iya</option>
                  <option value="Tidak">Tidak</option>
                </select>

                {members.length > 1 && (
                  <button className='button-remove' type="button" onClick={() => removeMember(index)} style={{ marginTop: '5px' }}>Remove Member</button>
                )}
              </div>
            ))}

            {isFamilySubmitted && (
              <>
                <button className='button-add' type="button" onClick={addMember} style={{ marginTop: '10px' }}>Tambahkan Anggota</button>
                <button className='button-submit' type="submit">Register All</button>
              </>
            )}
          </form>
        </div>
      </div>
      </div>
    </div>
  );
}

export default RegistrationForm;