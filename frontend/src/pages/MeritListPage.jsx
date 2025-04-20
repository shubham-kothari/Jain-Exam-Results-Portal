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
        setListType('overall');
      })
      .catch(error => {
        console.error('Error fetching overall merit list:', error);
        setLoading(false);
      });
  };

  const fetchAreaMeritList = () => {
    if (!selectedArea) return;
    setLoading(true);
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/meritlist/area?area_id=${selectedArea}`)
      .then(response => {
        setResults(response.data);
        setLoading(false);
        setListType('area_merit');
      })
      .catch(error => {
        console.error('Error fetching area merit list:', error);
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
      <h1>
        {listType === 'overall' && 'Overall Top 3 Candidates'}
        {listType === 'area_merit' && `${areas.find(a => a.id.toString() === selectedArea.toString())?.name || 'Selected Area'} Top 3 Candidates`}
        {listType === 'area_marks' && `All Candidate Marks list (${areas.find(a => a.id.toString() === selectedArea.toString())?.name || 'Selected Area'})`}
        {!listType && 'Merit List'}
      </h1>
      
      <div className="controls">
        <div className="overall-section">
          <button onClick={fetchOverallMeritList}>
            Show Overall Top 3 Candidates
          </button>
        </div>

        <div className="area-controls">
          <h3>Area-Specific Lists</h3>
          <div className="area-selection">
            <select 
              value={selectedArea} 
              onChange={(e) => setSelectedArea(e.target.value)}
            >
              <option value="">Select Area</option>
              {areas.map(area => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
            <div className="area-buttons">
              <button onClick={fetchAreaMeritList}>
                Show Top 3
              </button>
              <button onClick={fetchAreaMarksList}>
                Show Marks Sheet
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="results">
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
                <tr key={index}>
                  <td>{item.rank}</td>
                  <td>{item.name}</td>
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
