const multer = require("multer");
const path = require("path");

// File filter - allow images (including AVIF), videos, AND GLB files
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    // Images
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/avif",              // ✅ Added AVIF support
    // Videos
    "video/mp4",               // ✅ Added video support
    "video/webm",
    "video/ogg",
    "video/quicktime",         // .mov files
    // 3D Models
    "model/gltf-binary",
    "application/octet-stream",
  ];

  const fileExtension = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = [
    // Images
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif',
    // Videos
    '.mp4', '.webm', '.ogg', '.mov',
    // 3D Models
    '.glb', '.gltf'
  ];

  // Check both mimetype and extension
  if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Only images (JPEG, PNG, GIF, WebP, AVIF), videos (MP4, WebM, MOV), and 3D models (.glb, .gltf) are allowed. Received: ${file.mimetype}`
      ),
      false
    );
  }
};

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024, // ✅ Increased to 100MB for videos
  },
  fileFilter: fileFilter,
});

module.exports = upload;