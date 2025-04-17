import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import html2pdf from "html2pdf.js";
import Header from "../component/header";
import "./Result.scss";

const Result = () => {
    const [area, setArea] = useState("");
    const [name, setName] = useState("");
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [areaSelected, setAreaSelected] = useState(false);
    const resultRef = useRef(); // For PDF generation

    const [showPDFHeader, setShowPDFHeader] = useState(false);
    const [isLoading, setIsLoading] = useState(false);






    useEffect(() => {
        if (area) {
            setAreaSelected(true);
            setName("");
            setIsLoading(true);
            axios
                .get(`${process.env.REACT_APP_API_URL}/data/?area=${area}`)
                .then((response) => {
                    console.log('Full API Response:', response);
                    console.log('Response Data:', response.data);
                    
                    // Handle both array and object response formats
                    const responseData = Array.isArray(response.data) ? 
                        response.data : 
                        (response.data?.data || response.data || []);
                    
                    setData(responseData);
                    setFilteredData(responseData);
                    
                    if (!responseData.length) {
                        console.warn('Empty data received from API');
                    }
                })
                .catch((error) => {
                    console.error('API Error:', error);
                    setData([]);
                    setFilteredData([]);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [area]);

    useEffect(() => {
        if (name) {
            setFilteredData(data.filter(item => item.name === name));
        } else {
            setFilteredData(data);
        }
    }, [name, data]);

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
                <select className="dropdown" onChange={(e) => setArea(e.target.value)}>
                    <option value="">Select Area</option>
                    {areas.map((areaName, index) => (
                        <option key={index} value={areaName}>
                            {areaName}
                        </option>
                    ))}
                </select>

                {areaSelected && (
                    <div className="name-selection">
                        <h3 className="select-title">अपना नाम चुनें</h3>
                        <select 
                            className="dropdown" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        >
                            <option value="">Select Name</option>
                            {data.map((item, index) => (
                                <option key={index} value={item.name}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="result-content">
                    {showPDFHeader && (
                        <div className="container-pdf">
                            <p className="main-title-pdf">णमो णाणस्स</p>
                            <h2 className="subtitle">
                                श्री अखिल भारतीय सुधर्म जैन संस्कृति रक्षक संघ छ. ग. शाखा द्वारा आयोजित महावीर जयंती की परीक्षा के परिणाम
                            </h2>
                        </div>
                    )}

                    {isLoading ? (
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Loading data...</p>
                    </div>
                ) : filteredData.length > 0 ? (
                        <table className="result-table">
                            <thead>
                                <tr>
                                    <th>S. No.</th>
                                    <th>Name</th>
                                    <th>Area</th>
                                    <th>Marks</th>
                                </tr>
                            </thead>
                            <tbody style={{ color: 'black' }}>
                                {filteredData.map((item, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{item.name}</td>
                                        <td>{item.area}</td>
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

                {filteredData.length > 0 && (
                    <button className="download-btn" onClick={downloadPDF}>
                        डाउनलोड करें (Download PDF)
                    </button>
                )}
            </div>
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

export default Result;
