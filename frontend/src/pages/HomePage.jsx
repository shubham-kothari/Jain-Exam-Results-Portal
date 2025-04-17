import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Certificate from "./Certificate";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import Header from "../component/header";
import Confetti from "../component/Confetti";

const HomePage = () => {
  const [area, setArea] = useState("");
  const [data, setData] = useState([]);
  const [areaSelected, setAreaSelected] = useState(false);
  const [name, setName] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const certificateRef = useRef(null);

  const scrollToCertificate = () => {
    certificateRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    if (area) {
      setAreaSelected(true);
      axios
        .get(`${process.env.REACT_APP_API_URL}/data?area=${area}`)
        .then((response) => setData(response.data))
        .catch((error) => {
          console.error(error);
          setData([]);
        });
    }
  }, [area]);

  const downloadCertificate = () => {
    const certificateContent = document.querySelector(".certificate-wrapper");

    html2canvas(certificateContent, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const y = (pageHeight - imgHeight) / 2;

      doc.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight);

      doc.save("certificate.pdf");
    });
  };


  return (
    <div className="container-result">
      <Header />
      <Confetti />
      <h3 className="select-title"><strong>अपना क्षेत्र चुनें</strong></h3>

      <select className="dropdown" onChange={(e) => setArea(e.target.value)}>
        <option value="">अपना शहर चुने</option>
        {areas.map((areaName, index) => (
          <option key={index} value={areaName}>
            {areaName}
          </option>
        ))}
      </select>

      <select
        className="dropdown"
        onChange={(e) => {
          const selectedName = e.target.value;
          setName(selectedName);

          const user = data.find((item) => item.name === selectedName);

          if (user) {
            setSelectedUser(user);
            setShowConfetti(true);

            // Scroll using ref
            setTimeout(() => {
              certificateRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100); // Short delay to ensure render
          }
        }}
      >
        <option value="">अपना नाम चुने</option>
        {data.map((item, index) => (
          <option key={index} value={item.name}>
            {item.name}
          </option>
        ))}
      </select>



      {selectedUser && (
        <>
          <div id="certificate-wrapper" ref={certificateRef}>
            <Certificate name={selectedUser.name} marks={selectedUser.marks} />
          </div>

          <button onClick={downloadCertificate} className="download-btn">
            Download Certificate
          </button>
        </>
      )}

      <Confetti show={showConfetti} setShow={setShowConfetti} />
    </div>
  );
};

const areas = [
  "अतरिया", "बागबहरा", "बालोद", "भानुप्रतापपुर", "चरोदा", "छुईखदान",
  "दल्ली राजहरा", "धमतरी", "डोंगरगढ़", "डोंगरगाँव", "दुर्ग", "गीदम",
  "जगदलपुर", "जयपुर झाड़ी", "कवर्धा", "केशकाल", "खैरागढ़", "खरीयार रोड", "कोंडागाँव ", "कोरबा",
  "लंजोड़ा", "महासमुंद", "मुड़ीपार", "नगरी", "नारायणपुर", "रायपुर", "राजनांदगाँव",
  "सम्बलपुर", "वैशालीनगर"
].sort();

export default HomePage;
