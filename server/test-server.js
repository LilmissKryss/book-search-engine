import express from "express";
import cors from "cors";

const app = express();
const PORT = 3001;

// Enable CORS
app.use(cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get("/api/test", (_req, res) => {
  res.json({ message: "Server is working!" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
