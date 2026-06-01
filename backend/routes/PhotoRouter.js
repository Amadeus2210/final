const express = require("express");
const fs = require("fs");
const path = require("path");
const Photo = require("../db/photoModel");
const User = require("../db/userModel")
const multer = require("multer");
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

router.get("/list", async (request, response) => {
  try {
    const photos = await Photo.find({});
    response.json(photos);
  } catch (error) {
    response.status(500).json({ error: "Failed to fetch photo list" });
  }
});

router.post("/commentsOfPhoto/:photo_id", async (request, response) => {
  const photoId = request.params.photo_id;
  const { comment, user_id } = request.body;

  if (!comment) {
    return response.status(400).json({ error: "Comment text is required" });
  }
  if (!user_id) {
    return response.status(400).json({ error: "User ID is required" });
  }

  try {
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return response.status(400).json({ error: "Photo not found" });
    }

    const newComment = {
      comment: comment,
      user_id: user_id,
      date_time: new Date(),
    };

    photo.comments.push(newComment);
    await photo.save();

    response.json(newComment);
  } catch (error) {
    console.error("Add comment error:", error);
    response.status(500).json({ error: "Internal server error" });
  }
});

router.post("/new", upload.single("photo"), async (request, response) => {
  if (!request.file) {
    return response.status(400).json({ error: "No photo file uploaded" });
  }
  if (!request.body.user_id) {
    return response.status(400).json({ error: "User ID is required" });
  }

  try {
    const newPhoto = new Photo({
      file_name: request.file.filename,
      user_id: request.body.user_id,
      date_time: new Date(),
      comments: [],
    });

    await newPhoto.save();
    response.json(newPhoto);
  } catch (error) {
    console.error("Photo upload error:", error);
    response.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:photo_id", async (request, response) => {
  const photoId = request.params.photo_id;
  const { user_id } = request.body;

  if (!photoId.match(/^[0-9a-fA-F]{24}$/)) {
    return response.status(400).json({ error: "Invalid photo ID format" });
  }
  if (!user_id) {
    return response.status(400).json({ error: "User ID is required" });
  }

  try {
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return response.status(404).json({ error: "Photo not found" });
    }
    if (photo.user_id.toString() !== user_id) {
      return response.status(403).json({ error: "Cannot delete another user's photo" });
    }

    await Photo.deleteOne({ _id: photoId });

    const imagePath = path.join(__dirname, "..", "images", path.basename(photo.file_name));
    try {
      await fs.promises.unlink(imagePath);
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }

    response.json({ message: "Photo deleted successfully" });
  } catch (error) {
    console.error("Delete photo error:", error);
    response.status(500).json({ error: "Internal server error" });
  }
});


router.get("/photosOfUser/:id", async (request, response) => {
  try {
    const userId = request.params.id;
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return response.status(400).json({ error: "Invalid user ID format" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return response.status(400).json({ error: "User not found" });
    }

    const photos = await Photo.find({ user_id: userId });

    const processedPhotos = await Promise.all(
      photos.map(async (photo) => {
        const processedComments = await Promise.all(
          photo.comments.map(async (comment) => {
            const commentUser = await User.findById(comment.user_id).select(
              "_id first_name last_name",
            );
            return {
              _id: comment._id,
              comment: comment.comment,
              date_time: comment.date_time,
              user: commentUser || { _id: comment.user_id },
            };
          }),
        );

        return {
          _id: photo._id,
          user_id: photo.user_id,
          comments: processedComments,
          file_name: photo.file_name,
          date_time: photo.date_time,
        };
      }),
    );

    response.json(processedPhotos);
  } catch (error) {
    console.log(request.params.id);
    response.status(400).json({ error: "Invalid user ID" });
  }
});
module.exports = router;
