import React, { useState, useEffect } from 'react';
import './MeritListPage.scss';
import axios from 'axios';

const MeritListPage = () => {
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listType, setListType] = useState('');

  useEffect(() => {
    // Fetch areas on component mount
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/cities`)
      .then(response => {
        setAreas(response.data);
      })
      .catch(error => {
        console.error('Error fetching areas:', error);
      });
  }, []);

  const fetchOverallMeritList = () => {
    setLoading(true);
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/meritlist/overall`)
      .then(response => {
        setResults(response.data);
        setLoading(false);
        setListType('छ. ग.');
      })
      .catch(error => {
        console.error('Error fetching overall merit list:', error);
        setLoading(false);
      });
  };

  const fetchAreaMeritList = () => {
    setLoading(true);
    const endpoint = selectedArea 
      ? `${process.env.REACT_APP_API_BASE_URL}/meritlist/area?area_id=${selectedArea}`
      : `${process.env.REACT_APP_API_BASE_URL}/meritlist/overall`;
      
    axios.get(endpoint)
      .then(response => {
        setResults(response.data);
        setLoading(false);
        setListType(selectedArea ? 'area_merit' : 'छत्तीसगढ़');
      })
      .catch(error => {
        console.error('Error fetching merit list:', error);
        setLoading(false);
      });
  };

  const fetchAreaMarksList = () => {
    if (!selectedArea) return;
    setLoading(true);
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/meritlist/area-marks?area_id=${selectedArea}`)
      .then(response => {
        setResults(response.data);
        setLoading(false);
        setListType('area_marks');
      })
      .catch(error => {
        console.error('Error fetching area marks list:', error);
        setLoading(false);
      });
  };

  return (
    <div className="merit-list-page">
      <div className="controls">
        <div className="area-controls">
          <div className="area-selection">
            <select 
              value={selectedArea} 
              onChange={(e) => setSelectedArea(e.target.value)}
            >
              <option value="">छत्तीसगढ़</option>
              {areas.map(area => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
            <div className="area-buttons">
              <button onClick={fetchAreaMeritList} className="merit-button">
                {selectedArea ? `${areas.find(a => a.id.toString() === selectedArea.toString())?.name || 'Area'} मेरिट लिस्ट` : 'छत्तीसगढ़ मेरिट लिस्ट'}
              </button>
              <button onClick={fetchAreaMarksList} className="marks-button">
                {selectedArea ? `${areas.find(a => a.id.toString() === selectedArea.toString())?.name || 'Area'} अंक सूची देखें` : 'छत्तीसगढ़ अंक सूची देखें'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="results">
          <h1>
            {listType === 'छत्तीसगढ़' && 'छत्तीसगढ़ मेरिट लिस्ट'}
            {listType === 'area_merit' && `${areas.find(a => a.id.toString() === selectedArea.toString())?.name || 'Selected Area'} मेरिट लिस्ट`}
            {listType === 'area_marks' && `All Candidate Marks list (${areas.find(a => a.id.toString() === selectedArea.toString())?.name || 'अपना क्षेत्र चुनें'})`}
            {!listType && 'Merit List'}
          </h1>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Marks</th>
                {results[0]?.area_name && <th>Area</th>}
              </tr>
            </thead>
            <tbody>
              {results.map((item, index) => (
                <tr key={index} className={item.rank_type === 'overall_merit' ? 'overall-merit' : ''}>
                  <td className={
                    item.rank === 1 ? 'gold' :
                    item.rank === 2 ? 'silver' :
                    item.rank === 3 ? 'bronze' : ''
                  }>
                    {item.rank}
                  </td>
                  <td>
                    {item.name}
                    {item.rank_type === 'overall_merit' && (
                      <span className={`merit-badge rank-${item.rank}`}>
                        छत्तीसगढ़ मेरिट {item.rank}
                      </span>
                    )}
                  </td>
                  <td>{item.marks}</td>
                  {item.area_name && <td>{item.area_name}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MeritListPage;
