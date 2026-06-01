import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  Typography,
  Card,
  CardMedia,
  CardContent,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  Button,
} from "@mui/material";
import { Link, useParams, useLocation } from "react-router-dom";

import "./styles.css";
import fetchModel from "../../lib/fetchModelData";
import { AppContext } from "../../AppContext";
import API_BASE_URL, { apiUrl } from "../../lib/api";

function UserPhotos() {
  const { userId } = useParams();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [newComments, setNewComments] = useState({}); // photoId -> commentText
  const { user: currentUser, setAppTitle } = useContext(AppContext);

  const fetchData = useCallback(async () => {
    try {
      const [userData, photosData] = await Promise.all([
        fetchModel(apiUrl(`/api/user/${userId}`)),
        fetchModel(apiUrl(`/api/photo/photosOfUser/${userId}`)),
      ]);

      if (userData) {
        setUser(userData);
        setAppTitle(`Photos of ${userData.first_name} ${userData.last_name}`);
      }
      if (photosData) {
        setPhotos(photosData);
      }
    } catch (error) {
      console.error("Failed to fetch photos:", error);
    }
  }, [setAppTitle, userId]);

  useEffect(() => {
    fetchData();
    return () => setAppTitle("");
  }, [fetchData, location.key, setAppTitle]);

  const handleCommentChange = (photoId, text) => {
    setNewComments((prev) => ({ ...prev, [photoId]: text }));
  };

  const handleAddComment = async (photoId) => {
    const text = newComments[photoId];
    if (!text) return;

    try {
      const response = await fetch(
        apiUrl(`/api/photo/commentsOfPhoto/${photoId}`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ comment: text, user_id: currentUser?._id }),
        },
      );

      if (response.ok) {
        setNewComments((prev) => ({ ...prev, [photoId]: "" }));
        fetchData(); // Refresh photos to show new comment
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!currentUser?._id) return;

    try {
      const response = await fetch(apiUrl(`/api/photo/${photoId}`), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: currentUser._id }),
      });

      if (response.ok) {
        setPhotos((prev) => prev.filter((photo) => photo._id !== photoId));
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (!user) {
    return <Typography variant="body1">User not found.</Typography>;
  }

  const fmt = (dt) => {
    const d = new Date(dt);
    return isNaN(d.getTime()) ? dt : d.toLocaleString();
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Photos of {user.first_name} {user.last_name}
      </Typography>

      {photos.map((photo) => (
        <Card key={photo._id} variant="outlined" sx={{ mb: 3 }}>
          <CardMedia
            component="img"
            sx={{
              maxHeight: 400,
              objectFit: "contain",
            }}
            image={`${API_BASE_URL}/images/${photo.file_name}`}
            alt={photo.file_name}
          />
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
              <Typography variant="subtitle2">
                {fmt(photo.date_time)}
              </Typography>
              {currentUser?._id === String(photo.user_id) ? (
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleDeletePhoto(photo._id)}
                >
                  Delete
                </Button>
              ) : null}
            </Box>

            <Divider sx={{ my: 1 }} />

            <Typography variant="subtitle1">Comments</Typography>
            <List>
              {(photo.comments || []).map((c) => (
                <React.Fragment key={c._id}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={
                        <>
                          <Link to={`/users/${c.user._id}`}>
                            {c.user.first_name} {c.user.last_name}
                          </Link>
                          {` — ${fmt(c.date_time)}`}
                        </>
                      }
                      secondary={c.comment}
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>

            <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Add a comment..."
                value={newComments[photo._id] || ""}
                onChange={(e) => handleCommentChange(photo._id, e.target.value)}
              />
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => handleAddComment(photo._id)}
                disabled={!newComments[photo._id]}
              >
                Post
              </Button>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

export default UserPhotos;
