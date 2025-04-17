import React, { useEffect, useState } from "react";
import axios from "axios";
import './CreatePage.scss';

const CreatePage = () => {
  const [mode, setMode] = useState("create");
  const [formData, setFormData] = useState({
    name: "",
    marks: "",
    area: "",
  });
  const [file, setFile] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [allData, setAllData] = useState([]);
  const [areaList, setAreaList] = useState([]);
  const [nameList, setNameList] = useState([]);
  const [showNewFields, setShowNewFields] = useState(false);
  const [cityName, setCityName] = useState("");
  const [cities, setCities] = useState([]);

  // Login with token auth
  const handleLogin = async () => {
    try {
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/token`,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      localStorage.setItem('token', response.data.token);
      setIsAuthenticated(true);
      setError("");
      loadData();
    } catch (error) {
      setError("Invalid credentials");
    }
  };

  // Load initial data and cities
  const loadData = async () => {
    try {
      const citiesRes = await axios.get(`${process.env.REACT_APP_API_URL}/cities`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setCities(citiesRes.data);
    } catch (error) {
      console.error("Error loading cities:", error);
    }

    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/data`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setAllData(res.data);
      const areas = [...new Set(res.data.map(item => item.area))];
      setAreaList(areas);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  // Handle CSV upload
  const handleFileUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/data/upload-csv`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      alert("CSV uploaded successfully!");
      loadData();
    } catch (error) {
      alert("Error uploading CSV");
    }
  };

  // Rest of the component code...
  // [Previous implementation of handleChange, handleSubmit etc.]

  return (
    <div className="container">
      {!isAuthenticated ? (
        <div className="login-box">
          <h2>Admin Login</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>Login</button>
          {error && <p className="error">{error}</p>}
        </div>
      ) : (
        <div>
          {/* Existing form components */}
          
          {/* Cities Section */}
          <div className="cities-section">
            <h3>Cities</h3>
            <div className="city-list">
              {cities.map(city => (
                <div key={city.id} className="city-item">
                  {city.name}
                </div>
              ))}
            </div>
            <div className="add-city">
              <input
                type="text"
                placeholder="New city name"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
              />
              <button onClick={async () => {
                try {
                  await axios.post(`${process.env.REACT_APP_API_URL}/cities`, 
                    { name: cityName },
                    {
                      headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                      }
                    }
                  );
                  setCityName("");
                  loadData();
                } catch (error) {
                  alert("Error adding city");
                }
              }}>Add City</button>
            </div>
          </div>

          {/* CSV Upload Section */}
          <div className="csv-upload">
            <h3>Upload CSV</h3>
            <form onSubmit={handleFileUpload}>
              <input 
                type="file" 
                accept=".csv"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <button type="submit">Upload</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePage;
