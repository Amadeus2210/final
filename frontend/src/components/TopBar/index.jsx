import { useContext, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../AppContext";
import { apiUrl } from "../../lib/api";

import "./styles.css";

function TopBar() {
  const { user, appTitle, logout } = useContext(AppContext);
  const navigate = useNavigate();
  const [uploadMessage, setUploadMessage] = useState("");
  const [severity, setSeverity] = useState("success");

  const rightText = user ? appTitle : "";

  const handleUploadButtonClick = (e) => {
    e.preventDefault();
    const fileInput = document.getElementById("photo-upload-input");
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file);

    try {
      const response = await fetch(apiUrl("/api/photo/new"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (response.ok) {
        setSeverity("success");
        setUploadMessage("upload thành công");
        // Redirect to user's photos page
        navigate(`/photos/${user._id}`);
      } else {
        const data = await response.json();
        setSeverity("error");
        setUploadMessage(`Upload failed: ${data.error}`);
      }
    } catch (err) {
      setSeverity("error");
      setUploadMessage(`Upload error: ${err.message}`);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setUploadMessage("");
  };

  return (
    <>
      <AppBar className="topbar-appBar" position="absolute">
        <Toolbar>
          <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
            <Typography variant="h6" color="inherit">
              Ngô Quốc Hiệu B23DCCN318
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {user ? (
              <>
                <Typography variant="subtitle1" color="inherit">
                  Hi {user.first_name}
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  onClick={handleUploadButtonClick}
                >
                  Add Photo
                </Button>
                <input
                  type="file"
                  id="photo-upload-input"
                  style={{ display: "none" }}
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <Button
                  variant="outlined"
                  color="inherit"
                  size="small"
                  onClick={logout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Typography variant="subtitle1" color="inherit">
                Please Login
              </Typography>
            )}
            {rightText ? (
              <Typography variant="subtitle1" color="inherit" sx={{ ml: 2 }}>
                {rightText}
              </Typography>
            ) : null}
          </Box>
        </Toolbar>
      </AppBar>

      <Snackbar
        open={!!uploadMessage}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={severity}
          variant="filled"
          sx={{ width: "100%", boxShadow: 3 }}
        >
          {uploadMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default TopBar;
