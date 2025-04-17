import React from 'react';
import './Certificate.scss';
import CertificateImage from "../photo/Certificate.png";

const Certificate = ({ name, marks }) => {
  // const Certificate = () => {

  return (
    <div className="certificate-wrapper">
      <div className="certificate">
        <img src={CertificateImage} alt="A gold border frame" />
        <div className="certificate-content">
          <h3>{name}</h3>
          <p>{marks}</p>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
