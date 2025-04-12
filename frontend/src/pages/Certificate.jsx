import React from 'react';
import './Certificate.scss';
import Border from './Gold Frame.jpg'; // Correct import path

const Certificate = ({ name, marks }) => {
  return (
    <div className="certificate-wrapper">
      <div className="certificate">
        <img src={Border} alt="A gold border frame" />
        <div className="certificate-content">
          <h1>श्री अखिल भारतीय सुधर्म जैन संस्कृति<br/>रक्षक संघ छ. ग. शाखा</h1>
          <p>प्रमाण पत्र</p>
          <h2 className="cert-name">{name}</h2>
          <p>has successfully scored</p>
          <h3 className="cert-marks">{marks} Marks out of 100 Marks</h3>
          <p>on the assessment.</p>
          <div className="signature-section">
            <p>____________________</p>
            <p>Authorized Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
