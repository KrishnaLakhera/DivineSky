const express = require("express");
const { getJsonFromR2, uploadToR2 } = require("../services/r2.service");
const authenticateAdmin = require("../middleware/auth"); // ✅ FIXED
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Initialize testimonials file if it doesn't exist
 */
async function initializeTestimonialsFile() {
  const jsonKey = "testimonials/testimonials.json";
  const data = await getJsonFromR2(jsonKey);

  if (!data) {
    const initialData = {
      testimonials: {},
      last_updated: new Date().toISOString(),
      total_testimonials: 0,
    };

    await uploadToR2(
      jsonKey,
      Buffer.from(JSON.stringify(initialData, null, 2)),
      "application/json"
    );

    console.log("✅ Created testimonials.json file in R2");
    return initialData;
  }

  return data;
}

/**
 * GET /testimonials (public)
 */
router.get("/", async (req, res) => {
  try {
    const jsonKey = "testimonials/testimonials.json";
    let data = await getJsonFromR2(jsonKey);

    if (!data) {
      data = await initializeTestimonialsFile();
    }

    const testimonialsArray = Object.values(data.testimonials || {}).sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );

    res.json({
      success: true,
      testimonials: testimonialsArray,
      last_updated: data.last_updated,
    });
  } catch (err) {
    console.error("Error fetching testimonials:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch testimonials",
    });
  }
});

/**
 * POST /testimonials (admin)
 */
router.post(
  "/",
  authenticateAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const { name, role, message, order } = req.body;

      if (!name || !role || !message) {
        return res.status(400).json({
          success: false,
          message: "Name, role, and message are required",
        });
      }

      let imageUrl = null;
      if (req.file) {
        const imageKey = `testimonials/images/${uuidv4()}.${req.file.mimetype.split("/")[1]}`;
        imageUrl = await uploadToR2(
          imageKey,
          req.file.buffer,
          req.file.mimetype
        );
      }

      const jsonKey = "testimonials/testimonials.json";
      let data = await getJsonFromR2(jsonKey);

      if (!data) {
        data = await initializeTestimonialsFile();
      }

      const testimonialId = `TESTIMONIAL-${Date.now()}`;
      const newTestimonial = {
        id: testimonialId,
        name,
        role,
        message,
        image: imageUrl,
        order: parseInt(order) || Object.keys(data.testimonials).length,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      data.testimonials[testimonialId] = newTestimonial;
      data.total_testimonials = Object.keys(data.testimonials).length;
      data.last_updated = new Date().toISOString();

      await uploadToR2(
        jsonKey,
        Buffer.from(JSON.stringify(data, null, 2)),
        "application/json"
      );

      res.json({
        success: true,
        message: "Testimonial created successfully",
        testimonial: newTestimonial,
      });
    } catch (err) {
      console.error("Error creating testimonial:", err);
      res.status(500).json({
        success: false,
        message: "Failed to create testimonial",
      });
    }
  }
);

/**
 * PUT /testimonials/:id (admin)
 */
router.put(
  "/:id",
  authenticateAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, role, message, order } = req.body;

      const jsonKey = "testimonials/testimonials.json";
      const data = await getJsonFromR2(jsonKey);

      if (!data || !data.testimonials[id]) {
        return res.status(404).json({
          success: false,
          message: "Testimonial not found",
        });
      }

      let imageUrl = data.testimonials[id].image;
      if (req.file) {
        const imageKey = `testimonials/images/${uuidv4()}.${req.file.mimetype.split("/")[1]}`;
        imageUrl = await uploadToR2(
          imageKey,
          req.file.buffer,
          req.file.mimetype
        );
      }

      data.testimonials[id] = {
        ...data.testimonials[id],
        name: name || data.testimonials[id].name,
        role: role || data.testimonials[id].role,
        message: message || data.testimonials[id].message,
        image: imageUrl,
        order:
          order !== undefined
            ? parseInt(order)
            : data.testimonials[id].order,
        updated_at: new Date().toISOString(),
      };

      data.last_updated = new Date().toISOString();

      await uploadToR2(
        jsonKey,
        Buffer.from(JSON.stringify(data, null, 2)),
        "application/json"
      );

      res.json({
        success: true,
        message: "Testimonial updated successfully",
        testimonial: data.testimonials[id],
      });
    } catch (err) {
      console.error("Error updating testimonial:", err);
      res.status(500).json({
        success: false,
        message: "Failed to update testimonial",
      });
    }
  }
);

/**
 * DELETE /testimonials/:id (admin)
 */
router.delete("/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const jsonKey = "testimonials/testimonials.json";
    const data = await getJsonFromR2(jsonKey);

    if (!data || !data.testimonials[id]) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    delete data.testimonials[id];
    data.total_testimonials = Object.keys(data.testimonials).length;
    data.last_updated = new Date().toISOString();

    await uploadToR2(
      jsonKey,
      Buffer.from(JSON.stringify(data, null, 2)),
      "application/json"
    );

    res.json({
      success: true,
      message: "Testimonial deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting testimonial:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete testimonial",
    });
  }
});

module.exports = router;
