import React, { useState } from "react";
import axios from "axios";
import './CreatePage.scss';

const CreatePage = () => {
  const [formData, setFormData] = useState({
    name: "",
    // moNumber: "",
    marks: "",
    area: "",
  });

  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = () => {
    const adminPassword = "mahavir123";
    if (password === adminPassword) {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/data`, {
        ...formData,
        marks: Number(formData.marks),
      });
      if (response.status !== 200) {
        throw new Error('Failed to submit data');
      }
      alert("Data added successfully!");
      setFormData({ name: "", marks: "", area: "" });
    } catch (error) {
      console.error("Error adding data:", error);
      alert("Failed to add data.");
    }
  };

  return (
    <div className="container">
      {!isAuthenticated ? (
        <div className="login-box">
          <h2>🔒 Admin Access Required</h2>
          <div className="admin-login-button">
            <input
              type="password"
              placeholder="Enter Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="dropdown"
            />
            <button onClick={handleLogin} className="submit-btn">Login</button></div>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      ) : (
        <div>
          <h2>✅ Welcome, Admin</h2>
          <div className="form-container">
            <h2>Add New Entry</h2>
            <form onSubmit={handleSubmit} className="form">
              <input
                type="text"
                name="name"
                placeholder="Name"
                required
                value={formData.name}
                onChange={handleChange}
              />
              {/* <input
                type="text"
                name="moNumber"
                placeholder="Mobile Number"
                required
                value={formData.moNumber}
                onChange={handleChange}
              /> */}
              <input
                type="number"
                name="marks"
                placeholder="Marks"
                required
                value={formData.marks}
                onChange={handleChange}
              />
              <input
                type="text"
                name="area"
                placeholder="Area"
                required
                value={formData.area}
                onChange={handleChange}
              />
              <button type="submit">Add Data</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePage;
