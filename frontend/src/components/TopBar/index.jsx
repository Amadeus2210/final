import { useContext, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Snackbar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../AppContext";
import { apiUrl } from "../../lib/api";

import "./styles.css";

function TopBar() {
  const { user, appTitle, logout } = useContext(AppContext);
  const navigate = useNavigate();
  const [uploadMessage, setUploadMessage] = useState("");

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
    formData.append("user_id", user._id);

    try {
      const response = await fetch(apiUrl("/api/photo/new"), {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setUploadMessage("Upload thanh cong");
        navigate(`/photos/${user._id}`);
      } else {
        const data = await response.json();
        setUploadMessage(`Upload failed: ${data.error}`);
      }
    } catch (err) {
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
      <AppBar
        className="topbar-appBar"
        position="absolute"
        color="inherit"
        elevation={0}
      >
        <Toolbar>
          <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
            <Typography variant="h6" color="inherit">
              Ngo Quoc Hieu B23DCCN318
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {user ? (
              <>
                <Button
                  variant="outlined"
                  color="inherit"
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
        message={uploadMessage}
      />
    </>
  );
}

export default TopBar;
