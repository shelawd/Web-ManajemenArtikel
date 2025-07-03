import axios from "axios";

const api = axios.create({
  baseURL: "https://test-fe.mysellerpintar.com/api",
  // Anda bisa menambahkan headers default di sini jika perlu
});

export default api;
