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
            Add/Update Results
          </li>
          <li 
            className={activeTab === 'upload' ? 'active' : ''}
            onClick={() => setActiveTab('upload')}
          >
            Upload Result from CSV
          </li>
          <li 
            className={activeTab === 'cities' ? 'active' : ''}
            onClick={() => setActiveTab('cities')}
          >
            Add City
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
  const [results, setResults] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    id: null,
    name: '',
    marks: '',
    area_id: null
  });

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

  const fetchResults = async (area) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/data?area=${area}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Map response data to ensure consistent structure
        const formattedResults = data.map(item => ({
          id: item.id,
          name: item.name,
          marks: item.marks,
          area: item.area,
          area_id: item.id // Using id as area_id as per endpoint response
        }));
        setResults(formattedResults);
      }
    } catch (err) {
      console.error('Failed to fetch results:', err);
    }
  };

  React.useEffect(() => {
    fetchCities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (formData.area) {
      fetchResults(formData.area);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.area]);

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
      if (formData.area) {
        fetchResults(formData.area);
      }
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  const handleEdit = (result) => {
    setEditingId(result.id);
    setEditData({
      id: result.id,
      name: result.name,
      marks: result.marks,
      area_id: result.area_id
    });
  };

  const handleSaveEdit = async () => {
    try {
      const url = `${process.env.REACT_APP_API_BASE_URL}/data/modify`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          result_id: editData.id,
          name: editData.name,
          marks: parseInt(editData.marks),
          area_id: editData.area_id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update data');
      }

      setEditingId(null);
      fetchResults(formData.area);
      setMessage('Data updated successfully');
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({
      id: null,
      name: '',
      marks: '',
      area_id: null
    });
  };

  const handleDelete = async (resultId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/data/${resultId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete data');
      }

      setMessage('Data deleted successfully');
      fetchResults(formData.area);
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
                  {citySuggestions.map((city, index) => (
                    <li 
                      key={index}
                      onClick={() => {
                        setFormData({...formData, area: city});
                        setShowSuggestions(false);
                      }}
                    >
                      {city}
                    </li>
                  ))}
                </ul>
              )}
        </div>
        <button type="submit">Submit</button>
      </form>
      {message && <div>{message}</div>}
      
      {formData.area && results.length > 0 && (
        <div className="results-table">
          <h3>Results for {formData.area}</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Marks</th>
                <th>Actions</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {results.map(result => (
                <tr key={result.id}>
                  <td>
                    {editingId === result.id ? (
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                      />
                    ) : (
                      result.name
                    )}
                  </td>
                  <td>
                    {editingId === result.id ? (
                      <input
                        type="number"
                        value={editData.marks}
                        onChange={(e) => setEditData({...editData, marks: e.target.value})}
                      />
                    ) : (
                      result.marks
                    )}
                  </td>
                  <td>
                    {editingId === result.id ? (
                      <select
                        value={editData.area_id}
                        onChange={(e) => setEditData({...editData, area_id: parseInt(e.target.value)})}
                      >
                        {citySuggestions.map((city, index) => (
                          <option key={index} value={index + 1}>
                            {city}
                          </option>
                        ))}
                      </select>
                    ) : (
                      result.area
                    )}
                  </td>
                  <td>
                    {editingId === result.id ? (
                      <>
                        <button onClick={handleSaveEdit}>Save</button>
                        <button onClick={handleCancelEdit}>Cancel</button>
                      </>
                    ) : (
                      <button onClick={() => handleEdit(result)}>Edit</button>
                    )}
                  </td>
                  <td>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(result.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
