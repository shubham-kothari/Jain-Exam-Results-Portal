import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import html2pdf from "html2pdf.js";
import Header from "../component/header";

const Result = () => {
    const [area, setArea] = useState("");
    const [data, setData] = useState([]);
    const [areaSelected, setAreaSelected] = useState(false);
    const resultRef = useRef(); // For PDF generation

    const [showPDFHeader, setShowPDFHeader] = useState(false);





    useEffect(() => {
        if (area) {
            setAreaSelected(true);
            axios
                .get(`${process.env.REACT_APP_API_URL}/data?area=${area}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                })
                .then((response) => {
                    const sortedData = response.data.sort((a, b) => b.marks - a.marks); // Descending by marks
                    setData(sortedData);
                })
                .catch((error) => {
                    console.error(error);
                    setData([]);
                });
        }
    }, [area]);
    

    const downloadPDF = () => {
        setShowPDFHeader(true);

        // Wait for DOM update before generating the PDF
        setTimeout(() => {
            const element = resultRef.current;
            const opt = {
                filename: `${area}_Results.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, scrollY: 0 },
                jsPDF: {
                    unit: 'in',
                    format: 'a4',
                    orientation: 'portrait'
                },
                margin: 0.5
            };
            html2pdf().set(opt).from(element).save().then(() => {
                setShowPDFHeader(false);
            });
        }, 100);
    };


    return (
        <div className="container-result">

            <div className="pdf-wrapper" ref={resultRef}>
                <Header />
                <h3 className="select-title">अपना क्षेत्र चुनें</h3>

                <select className="dropdown" onChange={(e) => setArea(e.target.value)}>
                    <option value="">Select Area</option>
                    {areas.map((areaName, index) => (
                        <option key={index} value={areaName}>
                            {areaName}
                        </option>
                    ))}
                </select>
            </div>


            {areaSelected && (
                <div>
                    <div className="pdf-wrapper" ref={resultRef}>
                        {showPDFHeader && (
                            <div className="container-pdf">
                                <p className="main-title-pdf">णमो णाणस्स</p>
                                <h2 className="subtitle">
                                    श्री अखिल भारतीय सुधर्म जैन संस्कृति रक्षक संघ छ. ग. शाखा द्वारा आयोजित महावीर जयंती की परीक्षा के परिणाम
                                </h2>
                            </div>
                        )}


                        {data.length > 0 ? (
                            <table className="result-table">
                                <thead>
                                    <tr>
                                        <th>S. No.</th>
                                        <th>Name</th>
                                        <th>Area</th>

                                        {/* <th>Mobile Number</th> */}
                                        <th>Marks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((item, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{item.name}</td>
                                            <td>{item.area}</td>
                                            {/* <td>{item.moNumber}</td> */}
                                            <td>{item.marks}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="no-data">
                                No Data Found for <b>{area}</b>
                            </div>
                        )}
                    </div>

                    {data.length > 0 && (
                        <button className="download-btn" onClick={downloadPDF}>
                            डाउनलोड करें (Download PDF)
                        </button>
                    )}
                </div>
            )}
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

export default Result;
