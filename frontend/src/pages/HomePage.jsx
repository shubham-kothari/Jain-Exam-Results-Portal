import React, { useState, useEffect } from "react";
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


  useEffect(() => {
    if (area) {
      setAreaSelected(true);
      axios
        .get(`${process.env.REACT_APP_API_URL}/data?area=${area}`)
        .then((response) => setData(response.data.data))
        .catch((error) => {
          console.error(error);
          setData([]);
        });
    }
  }, [area]);

  // Function to generate PDF and download it
  const downloadCertificate = () => {
    const certificateContent = document.querySelector(".certificate-wrapper");

    // Wait for all images and content to load
    html2canvas(certificateContent, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const doc = new jsPDF();

      // Add the image to the PDF
      doc.addImage(imgData, "PNG", 10, 10, 180, 250); // Adjust the size to fit the page

      // Save the document as a PDF
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
          setSelectedUser(user || null);

          if (user) {
            setShowConfetti(true);
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

      {areaSelected && (
        <div>
          {!selectedUser ? (
            <div className="name-selection">
              <h3>अपना नाम चुनें</h3>
              <select
                className="dropdown"
                onChange={(e) => {
                  const selectedName = e.target.value;
                  setName(selectedName);
                  const user = data.find((item) => item.name === selectedName);
                  setSelectedUser(user || null);
                  if (user) setShowConfetti(true);
                }}
              >
                <option value="">अपना नाम चुने</option>
                {data.map((item, index) => (
                  <option key={index} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <div className="user-data">
                <h3>Result:</h3>
                <div style={{ width: "100%" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={{ backgroundColor: "lightblue" }}>S.no.</th>
                        <th style={{ backgroundColor: "lightblue" }}>Name</th>
                        <th style={{ backgroundColor: "lightblue" }}>Area</th>
                        <th style={{ backgroundColor: "lightblue" }}>Marks</th>
                      </tr>
                    </thead>
                    <tbody style={{ backgroundColor: "white" }}>
                      <tr>
                        <td>1.</td>
                        <td>{selectedUser.name}</td>
                        <td>{selectedUser.area}</td>
                        <td>{selectedUser.marks}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div id="certificate-wrapper">
                <Certificate name={selectedUser.name} marks={selectedUser.marks} />
              </div>

              <button onClick={downloadCertificate} className="download-btn">
                Download Certificate
              </button>
            </div>
          )}
        </div>
      )}
      <Confetti show={showConfetti} setShow={setShowConfetti} />
    </div>
  );
};

const areas = [
  "अतरिया", "बागबहरा", "बालोद", "भानुपरतापपुर", "चरोदा", "छुईखदान",
  "दल्ली राजहरा", "धमतरी", "डोंगरगढ़", "डोंगरगाओं", "दुर्ग", "गीदम",
  "जगदलपुर", "जयपुर झाड़ी", "कवर्धा", "केशकाल", "खैरागढ़", "खरीयार रोड", "कोंडागाँव ", "कोरबा",
  "लंजोड़ा", "महासमुंद", "मुड़ीपार", "नगरी", "नारायणपुर", "रायपुर", "राजनांदगाँव",
  "सम्बलपुर", "वैशालीनगर"
].sort();

export default HomePage;
