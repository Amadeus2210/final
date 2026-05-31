import React, { useState, useEffect, useContext } from "react";
import { Typography, Divider, Box } from "@mui/material";
import { Link, useParams } from "react-router-dom";

import "./styles.css";
import fetchModel from "../../lib/fetchModelData";
import { AppContext } from "../../AppContext";
import { apiUrl } from "../../lib/api";

/**
 * Define UserDetail, a React component of Project 4.
 */
function UserDetail() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const { setAppTitle } = useContext(AppContext);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await fetchModel(apiUrl(`/api/user/${userId}`));
        if (data) {
          setUser(data);
          setAppTitle(`${data.first_name} ${data.last_name}`);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    fetchUser();
    return () => setAppTitle("");
  }, [userId, setAppTitle]);

  if (!user) {
    return <Typography variant="body1">User not found.</Typography>;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {user.first_name} {user.last_name}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: "grid", gap: 1 }}>
        <Typography variant="body1">
          <strong>Location: </strong>
          {user.location || "-"}
        </Typography>
        <Typography variant="body1">
          <strong>Description: </strong>
          {user.description || "-"}
        </Typography>
        <Typography variant="body1">
          <strong>Occupation: </strong>
          {user.occupation || "-"}
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="body2">
        <Link to={`/photos/${user._id}`}>View photos of {user.first_name}</Link>
      </Typography>
    </Box>
  );
}

export default UserDetail;
