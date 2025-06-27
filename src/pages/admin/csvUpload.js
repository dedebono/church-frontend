import React, { useState } from 'react';
import Papa from 'papaparse';
import Swal from 'sweetalert2';
import { importMembers } from './api/API';
import './csvUpload.css';

const CsvUpload = () => {
  const [csvFile, setCsvFile] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
    setProgress(0);
  };

  const handleUpload = () => {
    if (!csvFile) {
      Swal.fire('No file selected', 'Please choose a CSV file.', 'warning');
      return;
    }
  
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const parsedData = results.data;
  
          const isValid = parsedData.every(
            (row) =>
              row.familyName &&
              row.familyDate &&
              row.email &&
              row.fullName &&
              row.gender &&
              row.dateOfBirth
          );
  
          if (!isValid) {
            Swal.fire(
              'Invalid Data',
              'Some rows are missing required fields: familyName, familyDate, email, fullName, gender, or dateOfBirth.',
              'error'
            );
            return;
          }
  
          // Group rows by familyName
          const groupedByFamily = {};
          parsedData.forEach((row) => {
            if (!groupedByFamily[row.familyName]) {
              groupedByFamily[row.familyName] = {
                familyDate: row.familyDate,
                email: row.email,
                members: [],
              };
            }
  
            groupedByFamily[row.familyName].members.push({
              fullName: row.fullName,
              gender: row.gender,
              dateOfBirth: row.dateOfBirth,
              placeOfBirth: row.placeOfBirth || '',
              bloodType: row.bloodType || '',
              phoneNumber: row.phoneNumber || '',
              address: row.address || '',
              hobby: row.hobby || '',
              maritalStatus: row.maritalStatus || '',
              congregationStatus: row.congregationStatus || '',
              email: row.memberEmail || '', // optional member email
            });
          });
  
          const allFamilies = Object.entries(groupedByFamily);
          let uploadedCount = 0;
  
          for (const [familyName, data] of allFamilies) {
            const rowsToSend = data.members.map((member) => ({
              ...member,
              familyName,
              familyDate: data.familyDate,
              email: data.email,
            }));
  
            await importMembers(rowsToSend);
            uploadedCount += rowsToSend.length;
            setProgress(Math.round((uploadedCount / parsedData.length) * 100));
          }
  
          Swal.fire('Success!', 'CSV uploaded successfully!', 'success');
        } catch (error) {
          console.error('❌ Error uploading members:', error.response?.data || error.message);
          Swal.fire('Upload Failed', 'Check console for details.', 'error');
        }
      },
    });
  };
  
  const handleDownloadSample = () => {
    const sample = [
      [
        'familyName',
        'familyDate',
        'email', // family email
        'fullName',
        'gender',
        'dateOfBirth',
        'memberEmail', // optional per-member email
      ],
      ['Doe', '2021-05-20', 'doe@gmail.com', 'John Doe', 'Male', '1990-01-01', 'john.doe@gmail.com'],
      ['Doe', '2021-05-20', 'doe@gmail.com', 'Jane Doe', 'Female', '1992-07-15', 'jane.doe@gmail.com'],
    ];
    const csvContent = sample.map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sample_members.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
    className='page-all'>
      <h2 className='h2'>Upload CSV Members</h2>
      <div className='upload-container input'>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button 
      className='button-upload'
      onClick={handleUpload}>Upload</button>
      <button 
      className='button-download'
      onClick={handleDownloadSample} style={{ marginLeft: '10px' }}>
        Download Sample CSV
      </button>
      </div>  

      {progress > 0 && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ width: '100%', background: '#ccc', borderRadius: '5px' }}>
            <div
              style={{
                width: `${progress}%`,
                background: '#0bc4ab',
                padding: '8px',
                borderRadius: '5px',
                color: 'white',
                textAlign: 'center',
                transition: 'width 0.3s ease'
              }}
            >
              {progress}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CsvUpload;
