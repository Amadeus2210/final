import React, { useState, useContext } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  Divider,
} from "@mui/material";
import { AppContext } from "../../AppContext";
import { apiUrl } from "../../lib/api";

function LoginRegister() {
  const { login } = useContext(AppContext);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    login_name: "admin",
    password: "123456",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    location: "",
    description: "",
    occupation: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch(apiUrl("/api/admin/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login_name: formData.login_name,
          password: formData.password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("token", data.token);
      login(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(apiUrl("/api/user"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login_name: formData.login_name,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          location: formData.location,
          description: formData.description,
          occupation: formData.occupation,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccess("Registration successful! Please login.");
      setIsLogin(true);
      setFormData({
        ...formData,
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 2,
      }}
    >
      <Paper elevation={3} sx={{ padding: 4, width: "100%", maxWidth: 400 }}>
        <Typography variant="h5" gutterBottom align="center">
          {isLogin ? "Login" : "Register"}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={isLogin ? handleLogin : handleRegister}>
          <TextField
            fullWidth
            label="Login Name"
            name="login_name"
            margin="normal"
            value={formData.login_name}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            margin="normal"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {!isLogin && (
            <>
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                margin="normal"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <TextField
                fullWidth
                label="First Name"
                name="first_name"
                margin="normal"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
              <TextField
                fullWidth
                label="Last Name"
                name="last_name"
                margin="normal"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
              <TextField
                fullWidth
                label="Location"
                name="location"
                margin="normal"
                value={formData.location}
                onChange={handleChange}
              />
              <TextField
                fullWidth
                label="Description"
                name="description"
                margin="normal"
                multiline
                rows={2}
                value={formData.description}
                onChange={handleChange}
              />
              <TextField
                fullWidth
                label="Occupation"
                name="occupation"
                margin="normal"
                value={formData.occupation}
                onChange={handleChange}
              />
            </>
          )}

          <Button
            fullWidth
            variant="contained"
            color="primary"
            type="submit"
            sx={{ mt: 3, mb: 2 }}
          >
            {isLogin ? "Login" : "Register Me"}
          </Button>
        </form>

        <Divider sx={{ my: 2 }} />

        <Box textAlign="center">
          <Button
            variant="text"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setSuccess("");
            }}
          >
            {isLogin
              ? "Don't have an account? Register"
              : "Already have an account? Login"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default LoginRegister;
