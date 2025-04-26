import React, { useState, useEffect } from 'react';
import './CertificatePage.scss';
import { FaCertificate } from 'react-icons/fa';

const CertificatePage = () => {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  // const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch cities on component mount
    const fetchCities = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/cities`);
        const data = await response.json();
        setCities(data);
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    // Fetch candidates when city is selected
    if (selectedCity) {
      const fetchCandidates = async () => {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_API_BASE_URL}/data?area=${encodeURIComponent(selectedCity)}`
          );
          const data = await response.json();
          setCandidates(data);
        } catch (error) {
          console.error('Error fetching candidates:', error);
        }
      };
      fetchCandidates();
    }
  }, [selectedCity]);

  // const handleGenerateCertificate = async () => {
  //   if (!selectedCandidate) return;

  //   setLoading(true);
  //   try {
  //     const response = await fetch(
  //       `${process.env.REACT_APP_API_BASE_URL}/certificate/generate?name=${encodeURIComponent(selectedCandidate.name)}&marks=${selectedCandidate.marks}`,
  //       { method: 'POST' }
  //     );
  //     const blob = await response.blob();
  //     const url = URL.createObjectURL(blob);
  //     setPdfUrl(url);
  //   } catch (error) {
  //     console.error('Error generating certificate:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="certificate-page">
      <div className="header-icon">
        <FaCertificate size={48} />
      </div>
      <h1>णमो णाणस्स</h1>
      <h1>श्री अखिल भारतीय सुधर्म जैन संस्कृति रक्षक संघ छ. ग. शाखा द्वारा आयोजित महावीर जयंती की परीक्षा के परिणाम</h1>

      <div className="form-group">
        <label htmlFor="city">अपना क्षेत्र चुनें</label>
        <select
          id="city"
          value={selectedCity}
          onChange={(e) => {
            setSelectedCity(e.target.value);
            setSelectedCandidate(null);
            setPdfUrl('');
          }}
        >
          <option value="">क्षेत्र</option>
          {cities.map((city) => (
            <option key={city.id} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>
      </div>

      {selectedCity && (
        <div className="form-group">
          <label htmlFor="candidate">अपना नाम चुने</label>
          <select
            id="candidate"
            value={selectedCandidate?.id || ''}
            onChange={(e) => {
              const candidate = candidates.find(c => c.id === parseInt(e.target.value));
              setSelectedCandidate(candidate);
              setPdfUrl(''); // Reset PDF URL when selecting new name
            }}
          >
            <option value="">नाम</option>
            {candidates.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedCandidate && (
        <div className="candidate-info">
          <table className='candidate-table'>
            <thead>
              <th className='candidate-name'>नाम</th>
              <th>अंक</th>
              <th>क्षेत्र</th>
            </thead>
            <tbody>
              <td className='candidate-name'>{selectedCandidate.name}</td>
              <td>{selectedCandidate.marks}</td>
              <td>{selectedCandidate.area}</td>
            </tbody>
          </table>
          {/* {!pdfUrl ? (
            <div className='certificate-button'>
              <button
                onClick={handleGenerateCertificate}
                disabled={loading}
              >
                {loading ? 'प्रमाणपत्र जनरेट हो रहा है ...' : 'प्रमाणपत्र जनरेट करें'}
              </button>
            </div>
          ) : (
            <div className='certificate-button'>

              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = pdfUrl;
                  link.download = `${selectedCandidate.name}_Certificate.pdf`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="download-btn"
                style={{ backgroundColor: '#4285f4', color: 'white' }}
              >
                प्रमाणपत्र डाउनलोड करें
              </button>
            </div>
          )} */}
        </div>
      )}

      {pdfUrl && (
        <div className="pdf-viewer">
          <iframe
            src={`${pdfUrl}#view=FitV`}
            title="Certificate"
            width="100%"
            height="70vh"
            style={{ border: 'none', maxHeight: '100%' }}
          />
        </div>
      )}
    </div>
  );
};

export default CertificatePage;
