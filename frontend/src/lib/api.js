const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

export const apiUrl = (path) => `${API_BASE_URL}${path}`;

export default API_BASE_URL;
