import React, { useState } from 'react';
import './AdminPage.scss';

const AdminPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [activeTab, setActiveTab] = useState('data');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username,
          password,
          grant_type: 'password'
        })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      setToken(data.access_token);
      localStorage.setItem('adminToken', data.access_token);
      setError('');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('adminToken');
  };

  if (!token) {
    return (
      <div className="login-container">
        <h2>Admin Login</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleLogin}>
          <div>
            <label>Username:</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label>Password:</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="sidebar">
        <h3>Admin Panel</h3>
        <button onClick={handleLogout}>Logout</button>
        <ul>
          <li 
            className={activeTab === 'data' ? 'active' : ''}
            onClick={() => setActiveTab('data')}
          >
            POST /data
          </li>
          <li 
            className={activeTab === 'upload' ? 'active' : ''}
            onClick={() => setActiveTab('upload')}
          >
            /data/upload-csv
          </li>
          <li 
            className={activeTab === 'cities' ? 'active' : ''}
            onClick={() => setActiveTab('cities')}
          >
            /cities
          </li>
        </ul>
      </div>
      <div className="content">
        {activeTab === 'data' && <DataForm token={token} />}
        {activeTab === 'upload' && <UploadForm token={token} />}
        {activeTab === 'cities' && <CitiesManager token={token} />}
      </div>
    </div>
  );
};

const DataForm = ({ token }) => {
  const [formData, setFormData] = useState({
    name: '',
    marks: '',
    area: ''
  });
  const [message, setMessage] = useState('');
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchCities = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/cities`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCitySuggestions(data.map(city => city.name));
      }
    } catch (err) {
      console.error('Failed to fetch cities:', err);
    }
  };

  React.useEffect(() => {
    fetchCities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit data');
      }

      setMessage('Data submitted successfully');
      setFormData({ name: '', marks: '', area: '' });
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  return (
    <div>
      <h2>POST /data</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input 
            type="text" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>
        <div>
          <label>Marks:</label>
          <input 
            type="number" 
            value={formData.marks}
            onChange={(e) => setFormData({...formData, marks: e.target.value})}
            required
          />
        </div>
        <div className="suggestion-container">
          <label>Area:</label>
          <input 
            type="text" 
            value={formData.area}
            onChange={(e) => {
              setFormData({...formData, area: e.target.value});
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            required
          />
          {showSuggestions && citySuggestions.length > 0 && (
            <ul className="suggestions">
              {citySuggestions
                .filter(city => 
                  city.toLowerCase().includes(formData.area.toLowerCase())
                )
                .map((city, index) => (
                  <li 
                    key={index}
                    onClick={() => {
                      setFormData({...formData, area: city});
                      setShowSuggestions(false);
                    }}
                  >
                    {city}
                  </li>
                ))
              }
            </ul>
          )}
        </div>
        <button type="submit">Submit</button>
      </form>
      {message && <div>{message}</div>}
    </div>
  );
};

const UploadForm = ({ token }) => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/data/upload-csv`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      setMessage('CSV uploaded successfully');
      setFile(null);
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  return (
    <div>
      <h2>Upload CSV</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input 
            type="file" 
            accept=".csv"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        </div>
        <button type="submit">Upload</button>
      </form>
      {message && <div>{message}</div>}
    </div>
  );
};

const CitiesManager = ({ token }) => {
  const [cities, setCities] = useState([]);
  const [newCity, setNewCity] = useState('');
  const [message, setMessage] = useState('');

  const fetchCities = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/cities`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cities');
      }

      const data = await response.json();
      setCities(data);
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  const handleAddCity = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/cities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cities: [newCity] })
      });

      if (!response.ok) {
        throw new Error('Failed to add city');
      }

      setMessage('City added successfully');
      setNewCity('');
      fetchCities();
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  React.useEffect(() => {
    fetchCities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h2>Manage Cities</h2>
      <form onSubmit={handleAddCity}>
        <div>
          <input 
            type="text" 
            value={newCity}
            onChange={(e) => setNewCity(e.target.value)}
            placeholder="New city name"
            required
          />
        </div>
        <button type="submit">Add City</button>
      </form>
      {message && <div>{message}</div>}
      <h3>Existing Cities</h3>
      <ul>
        {cities.map(city => (
          <li key={city.id}>{city.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPage;
