import express from "express";
import cors from "cors";
import { loadSalesData } from "./utils/dataLoader.js";
import salesRoutes from "./routes/salesRoutes.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "TruEstate Retail Sales API is running 🚀"
  });
});

let salesData = [];

async function startServer() {
  try {
    // Load CSV data once at startup
    salesData = await loadSalesData();

    // Middleware to attach data to each request
    app.use((req, res, next) => {
      req.salesData = salesData;
      next();
    });

    // Sales routes
    app.use("/api/sales", salesRoutes);

    app.listen(PORT, () => {
      console.log(`✅ Backend server running on http://localhost:${PORT}`);
      console.log(`✅ Loaded ${salesData.length} sales records`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
