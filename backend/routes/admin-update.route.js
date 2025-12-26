const express = require("express");
const upload = require("../middleware/upload.middleware");
const auth = require("../middleware/auth");
const {
  uploadToR2,
  getJsonFromR2,
  putJsonToR2,
  deleteFromR2,
} = require("../services/r2.service");

const router = express.Router();

/**
 * 🔐 PUT /admin/products/:category/:id
 * Update existing product - flexible, update only what's provided
 * ✅ Supports category changes and subcategories
 */
router.put(
  "/products/:category/:id",
  auth,
  upload.fields([
    { name: "model", maxCount: 1 },
    { name: "images", maxCount: 5 },
    { name: "video", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { category, id } = req.params;
      const { 
        name, 
        price, 
        description, 
        includeModel, 
        removeModel, 
        removeVideo,
        replaceImages,
        newCategory,  // ✅ Target category if changing
        subCategory   // ✅ NEW: Subcategory
      } = req.body;
      
      console.log("Updating product:", id);
      console.log("Request body:", req.body);
      console.log("Files:", req.files);

      // Check if changing category
      const isChangingCategory = newCategory && newCategory !== category;
      
      if (isChangingCategory) {
        console.log(`Moving product from ${category} to ${newCategory}`);
      }

      // Load existing product data
      const jsonKey = `products/${category}.json`;
      let data = await getJsonFromR2(jsonKey);

      if (!data || !data.products[id]) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      const existingProduct = data.products[id];
      const modelFile = req.files?.model?.[0];
      const imageFiles = req.files?.images || [];
      const videoFile = req.files?.video?.[0];

      // ========================================
      // UPDATE TEXT FIELDS (Optional)
      // ========================================
      if (name !== undefined && name !== "") {
        existingProduct.name = name.trim();
      }
      
      if (price !== undefined && price !== "") {
        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice) || parsedPrice < 0) {
          return res.status(400).json({
            success: false,
            message: "Price must be a valid number",
          });
        }
        existingProduct.price = parsedPrice;
      }
      
      if (description !== undefined) {
        existingProduct.description = description.trim();
      }

      // ✅ NEW: Update subcategory
      if (subCategory !== undefined) {
        existingProduct.subCategory = subCategory || null;
        console.log(`Updated subcategory to: ${subCategory || 'null'}`);
      }

      // ========================================
      // HANDLE MODEL (Optional)
      // ========================================
      
      // Remove model
      if (removeModel === "true" && existingProduct.model) {
        console.log("Removing existing model");
        await deleteFromR2(existingProduct.model);
        delete existingProduct.model;
        delete existingProduct.modelSize;
        delete existingProduct.modelType;
        existingProduct.hasModel = false;
      }

      // Upload/Replace model
      if (includeModel === "true" && modelFile) {
        console.log("Uploading new model");
        
        // Delete old model if exists
        if (existingProduct.model) {
          await deleteFromR2(existingProduct.model);
        }

        // Upload to new category if changing
        const uploadCategory = isChangingCategory ? newCategory : category;
        const modelResult = await uploadToR2(modelFile, uploadCategory);
        existingProduct.model = modelResult.url;
        existingProduct.modelSize = modelResult.size;
        existingProduct.modelType = modelResult.mimetype;
        existingProduct.hasModel = true;
      }

      // ========================================
      // HANDLE VIDEO (Optional)
      // ========================================
      
      // Remove video
      if (removeVideo === "true" && existingProduct.video) {
        console.log("Removing existing video");
        await deleteFromR2(existingProduct.video);
        delete existingProduct.video;
        delete existingProduct.videoSize;
        delete existingProduct.videoType;
      }

      // Upload/Replace video
      if (videoFile) {
        console.log("Uploading new video");
        
        // Delete old video if exists
        if (existingProduct.video) {
          await deleteFromR2(existingProduct.video);
        }

        // Upload to new category if changing
        const uploadCategory = isChangingCategory ? newCategory : category;
        const videoResult = await uploadToR2(videoFile, uploadCategory);
        existingProduct.video = videoResult.url;
        existingProduct.videoSize = videoResult.size;
        existingProduct.videoType = videoResult.mimetype;
      }

      // ========================================
      // HANDLE IMAGES (Optional - Two modes)
      // ========================================
      
      if (imageFiles.length > 0) {
        const uploadCategory = isChangingCategory ? newCategory : category;
        
        if (replaceImages === "true") {
          // MODE 1: Replace all images
          console.log("Replacing all images");
          
          // Delete old images
          if (existingProduct.images && Array.isArray(existingProduct.images)) {
            for (const image of existingProduct.images) {
              await deleteFromR2(image.url);
            }
          }

          // Upload new images
          const imageResults = [];
          for (const imageFile of imageFiles) {
            const result = await uploadToR2(imageFile, uploadCategory);
            imageResults.push({
              url: result.url,
              size: result.size,
              mimetype: result.mimetype,
            });
          }
          existingProduct.images = imageResults;
        } else {
          // MODE 2: Add to existing images
          console.log("Adding new images to existing ones");
          
          // Initialize images array if it doesn't exist
          if (!existingProduct.images) {
            existingProduct.images = [];
          }

          // Check total count (limit to 10 images total)
          const totalImages = existingProduct.images.length + imageFiles.length;
          if (totalImages > 10) {
            return res.status(400).json({
              success: false,
              message: `Cannot add ${imageFiles.length} images. Maximum 10 images total (currently ${existingProduct.images.length})`,
            });
          }

          // Upload and append new images
          for (const imageFile of imageFiles) {
            const result = await uploadToR2(imageFile, uploadCategory);
            existingProduct.images.push({
              url: result.url,
              size: result.size,
              mimetype: result.mimetype,
            });
          }
        }
      }

      // ========================================
      // HANDLE CATEGORY CHANGE
      // ========================================
      
      if (isChangingCategory) {
        console.log(`Moving product from ${category} to ${newCategory}`);
        
        // Load target category data
        const newJsonKey = `products/${newCategory}.json`;
        let newCategoryData = await getJsonFromR2(newJsonKey);
        
        // Initialize if doesn't exist
        if (!newCategoryData) {
          newCategoryData = {
            category: newCategory,
            products: {},
            last_updated: new Date().toISOString(),
          };
        }

        // Update category in product object
        existingProduct.category = newCategory;
        
        // Update product timestamp
        existingProduct.updated_at = new Date().toISOString();
        
        // Add to new category
        newCategoryData.products[id] = existingProduct;
        newCategoryData.last_updated = new Date().toISOString();
        await putJsonToR2(newJsonKey, newCategoryData);

        // Remove from old category
        delete data.products[id];
        data.last_updated = new Date().toISOString();
        await putJsonToR2(jsonKey, data);

        console.log(`Product ${id} successfully moved to ${newCategory}`);
        
        res.json({
          success: true,
          message: `Product moved to ${newCategory} and updated successfully`,
          product: existingProduct,
          newCategory: newCategory,
        });
      } else {
        // ========================================
        // SAVE CHANGES (Same Category)
        // ========================================
        
        // Update timestamp
        existingProduct.updated_at = new Date().toISOString();

        // Save updated data
        data.products[id] = existingProduct;
        data.last_updated = new Date().toISOString();
        await putJsonToR2(jsonKey, data);

        res.json({
          success: true,
          message: "Product updated successfully",
          product: existingProduct,
        });
      }
    } catch (err) {
      console.error("Update error:", err);
      res.status(500).json({
        success: false,
        message: err.message || "Failed to update product",
      });
    }
  }
);

/**
 * 🔐 PATCH /admin/products/:category/:id/remove-image
 * Remove a specific image by index
 */
router.patch(
  "/products/:category/:id/remove-image",
  auth,
  async (req, res) => {
    try {
      const { category, id } = req.params;
      const { imageIndex } = req.body;

      if (imageIndex === undefined) {
        return res.status(400).json({
          success: false,
          message: "Image index is required",
        });
      }

      console.log(`Removing image at index ${imageIndex} from product ${id}`);

      // Load existing product
      const jsonKey = `products/${category}.json`;
      let data = await getJsonFromR2(jsonKey);

      if (!data || !data.products[id]) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      const product = data.products[id];

      if (!product.images || !Array.isArray(product.images)) {
        return res.status(400).json({
          success: false,
          message: "Product has no images",
        });
      }

      if (imageIndex < 0 || imageIndex >= product.images.length) {
        return res.status(400).json({
          success: false,
          message: "Invalid image index",
        });
      }

      // Delete the image from R2
      const imageToDelete = product.images[imageIndex];
      await deleteFromR2(imageToDelete.url);

      // Remove from array
      product.images.splice(imageIndex, 1);
      product.updated_at = new Date().toISOString();

      // Save
      data.products[id] = product;
      data.last_updated = new Date().toISOString();
      await putJsonToR2(jsonKey, data);

      res.json({
        success: true,
        message: "Image removed successfully",
        product: product,
      });
    } catch (err) {
      console.error("Remove image error:", err);
      res.status(500).json({
        success: false,
        message: err.message || "Failed to remove image",
      });
    }
  }
);

/**
 * 🔐 PATCH /admin/products/:category/:id/add-model
 * Add 3D model to existing product (simplified endpoint)
 */
router.patch(
  "/products/:category/:id/add-model",
  auth,
  upload.single("model"),
  async (req, res) => {
    try {
      const { category, id } = req.params;
      const modelFile = req.file;

      if (!modelFile) {
        return res.status(400).json({
          success: false,
          message: "Model file is required",
        });
      }

      console.log("Adding model to product:", id);

      // Load existing product
      const jsonKey = `products/${category}.json`;
      let data = await getJsonFromR2(jsonKey);

      if (!data || !data.products[id]) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      const product = data.products[id];

      // Delete old model if exists
      if (product.model) {
        console.log("Replacing existing model");
        await deleteFromR2(product.model);
      }

      // Upload new model
      const modelResult = await uploadToR2(modelFile, category);
      product.model = modelResult.url;
      product.modelSize = modelResult.size;
      product.modelType = modelResult.mimetype;
      product.hasModel = true;
      product.updated_at = new Date().toISOString();

      // Save
      data.products[id] = product;
      data.last_updated = new Date().toISOString();
      await putJsonToR2(jsonKey, data);

      res.json({
        success: true,
        message: "3D model added successfully",
        product: product,
      });
    } catch (err) {
      console.error("Add model error:", err);
      res.status(500).json({
        success: false,
        message: err.message || "Failed to add model",
      });
    }
  }
);

/**
 * 🔐 GET /admin/products/:category/:id
 * Get single product for editing
 */
router.get("/products/:category/:id", auth, async (req, res) => {
  try {
    const { category, id } = req.params;
    const jsonKey = `products/${category}.json`;
    const data = await getJsonFromR2(jsonKey);

    if (!data || !data.products[id]) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Ensure hasModel flag is set correctly
    const product = data.products[id];
    if (product.model && !product.hasModel) {
      product.hasModel = true;
    } else if (!product.model && product.hasModel) {
      product.hasModel = false;
    }

    res.json({
      success: true,
      product: product,
    });
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
});

/**
 * 🔐 DELETE /admin/products/:category/:id
 * Delete a product
 */
router.delete("/products/:category/:id", auth, async (req, res) => {
  try {
    const { category, id } = req.params;
    
    console.log("Deleting product:", id);

    // Load existing product data
    const jsonKey = `products/${category}.json`;
    let data = await getJsonFromR2(jsonKey);

    if (!data || !data.products[id]) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const product = data.products[id];

    // Delete all associated files from R2
    // Delete images
    if (product.images && Array.isArray(product.images)) {
      console.log(`Deleting ${product.images.length} images`);
      for (const image of product.images) {
        await deleteFromR2(image.url);
      }
    }

    // Delete model
    if (product.model) {
      console.log("Deleting model");
      await deleteFromR2(product.model);
    }

    // Delete video
    if (product.video) {
      console.log("Deleting video");
      await deleteFromR2(product.video);
    }

    // Remove product from JSON
    delete data.products[id];
    data.last_updated = new Date().toISOString();
    await putJsonToR2(jsonKey, data);

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to delete product",
    });
  }
});

module.exports = router;