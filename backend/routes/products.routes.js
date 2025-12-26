const express = require("express");
const { getJsonFromR2 } = require("../services/r2.service");

const router = express.Router();

/**
 * 🌍 GET /products
 * Fetch all products from all categories
 */
router.get("/", async (req, res) => {
  try {
    const categories = ["altars", "deities", "sculptures", "custom", "furniture"];
    const allProducts = [];

    for (const category of categories) {
      const jsonKey = `products/${category}.json`;
      const data = await getJsonFromR2(jsonKey);

      if (data?.products) {
        allProducts.push(
          ...Object.values(data.products).map((p) => ({
            ...p,
            category: p.category || category,
            // Ensure images is always an array (backward compatibility)
            images: Array.isArray(p.images) 
              ? p.images 
              : (p.image ? [{ url: p.image, size: p.imageSize, mimetype: p.imageType }] : []),
            // Keep model data if it exists
            hasModel: !!p.model,
            // Keep video data if it exists
            hasVideo: !!p.video,
          }))
        );
      }
    }

    res.json({
      success: true,
      products: allProducts,
      total_products: allProducts.length,
    });
  } catch (err) {
    console.error("Error fetching all products:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
});

/**
 * 🌍 GET /products/:category
 * Fetch all products from a specific category
 */
router.get("/:category", async (req, res) => {
  try {
    const { category } = req.params;
    
    // Validate category
    const validCategories = ["altars", "deities", "sculptures", "custom", "furniture"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(", ")}`,
      });
    }

    const jsonKey = `products/${category}.json`;
    const data = await getJsonFromR2(jsonKey);

    if (!data) {
      return res.json({
        success: true,
        category,
        products: [],
        total_products: 0,
      });
    }

    const productsArray = Object.values(data.products || {}).map((p) => ({
      ...p,
      // Ensure images is always an array (backward compatibility)
      images: Array.isArray(p.images) 
        ? p.images 
        : (p.image ? [{ url: p.image, size: p.imageSize, mimetype: p.imageType }] : []),
      // Keep model data if it exists
      hasModel: !!p.model,
      // Keep video data if it exists
      hasVideo: !!p.video,
    }));

    res.json({
      success: true,
      category,
      products: productsArray,
      total_products: productsArray.length,
      last_updated: data.last_updated,
    });
  } catch (err) {
    console.error(`Error fetching products for category ${req.params.category}:`, err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
});

/**
 * 🌍 GET /products/:category/:id
 * Fetch a specific product by category and ID
 */
router.get("/:category/:id", async (req, res) => {
  try {
    const { category, id } = req.params;
    
    // Validate category
    const validCategories = ["altars", "deities", "sculptures", "custom", "furniture"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(", ")}`,
      });
    }

    const jsonKey = `products/${category}.json`;
    const data = await getJsonFromR2(jsonKey);

    if (!data || !data.products[id]) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const product = data.products[id];

    // Transform product data for response
    const productResponse = {
      ...product,
      // Ensure images is always an array (backward compatibility)
      images: Array.isArray(product.images) 
        ? product.images 
        : (product.image 
            ? [{ url: product.image, size: product.imageSize, mimetype: product.imageType }] 
            : []),
      // Keep model data if it exists
      hasModel: !!product.model,
      // Keep video data if it exists
      hasVideo: !!product.video,
      // Add image count for convenience
      imageCount: Array.isArray(product.images) 
        ? product.images.length 
        : (product.image ? 1 : 0),
    };

    res.json({
      success: true,
      product: productResponse,
    });
  } catch (err) {
    console.error(`Error fetching product ${req.params.id}:`, err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
});

module.exports = router;