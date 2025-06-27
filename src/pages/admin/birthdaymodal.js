import React from 'react';
import axios from 'axios';

const DownloadBirthdayIcs = () => {
  const handleDownload = () => {
    // Make an API call to the backend to download the ICS file
    axios.get('http://localhost:5000/api/download-birthday-ics', { responseType: 'blob' })
      .then((response) => {
        // Create a URL for the blob and trigger the download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'member_birthday.ics');
        document.body.appendChild(link);
        link.click();
      })
      .catch((error) => {
        console.error("Error downloading birthday ICS:", error);
      });
  };

  return (
    <div>
      <button onClick={handleDownload}>Download Member Birthdays (ICS)</button>
    </div>
  );
};

export default DownloadBirthdayIcs;