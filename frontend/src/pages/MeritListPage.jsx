import React, { useState, useEffect } from 'react';
import './MeritListPage.scss';
import axios from 'axios';

const MeritListPage = () => {
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

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
      })
      .catch(error => {
        console.error('Error fetching area marks list:', error);
        setLoading(false);
      });
  };

  return (
    <div className="merit-list-page">
      <h1>Merit List</h1>
      
      <div className="controls">
        <button onClick={fetchOverallMeritList}>
          Show Overall Top 3 Candidates
        </button>

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
          <button onClick={fetchAreaMeritList}>
            Show Area Merit List (Top 3)
          </button>
          <button onClick={fetchAreaMarksList}>
            Show Area Marks Sheet
          </button>
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
