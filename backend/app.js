const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const adminUploadRoutes = require("./routes/admin.upload.routes");
const productRoutes = require("./routes/products.routes");
const adminUpdateRoutes = require("./routes/admin-update.route");
// In your main server file (e.g., server.js or app.js)
const readyStockAdminRoutes = require('./routes/ready-stock.admin.routes');
const readyStockPublicRoutes = require('./routes/ready-stock.public.routes');


const app = express();

app.use(cors());
app.use(express.json());

// health check
app.get("/", (req, res) => {
  res.send("Backend + Cloudflare R2 is running 🚀");
});

// routes
app.use("/auth", authRoutes);            // 🔐 login
app.use("/admin", adminUploadRoutes);    // 🔐 admin protected
app.use("/products", productRoutes);     // 🌍 public
app.use("/admin", adminUpdateRoutes);
// Add routes
app.use('/api/admin', readyStockAdminRoutes);
app.use('/api/products', readyStockPublicRoutes);
module.exports = app;
