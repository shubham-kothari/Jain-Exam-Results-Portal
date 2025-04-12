import React, { useRef } from 'react';
import './Certificate.scss';
import Border from './Gold Frame.jpg';
import html2pdf from 'html2pdf.js';

const Certificate = ({ name, marks }) => {
  const certificateRef = useRef();

  const downloadPDF = () => {
    const element = certificateRef.current;
    const opt = {
      filename: `${name}_Certificate.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        allowTaint: true
      },
      jsPDF: {
        unit: 'in',
        format: 'a4',
        orientation: 'portrait'
      },
      margin: 0.5
    };
    
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="certificate-container">
      <div className="certificate-wrapper" ref={certificateRef}>
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
      <button className="download-btn" onClick={downloadPDF}>
        Download Certificate
      </button>
    </div>
  );
};

export default Certificate;
