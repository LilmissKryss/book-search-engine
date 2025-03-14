import express from "express";
const router = express.Router();
import {
  createUser,
  getSingleUser,
  saveBook,
  deleteBook,
  login,
} from "../../controllers/user-controller.js";

// import middleware
import { authenticateToken } from "../../services/auth.js";

// Wrap route handlers to prevent returning Response objects
router
  .route("/")
  .post((req, res) => {
    createUser(req, res);
  })
  .put(authenticateToken, (req, res) => {
    saveBook(req, res);
  });

router.route("/login").post((req, res) => {
  login(req, res);
});

router.route("/me").get(authenticateToken, (req, res) => {
  getSingleUser(req, res);
});

router.route("/books/:bookId").delete(authenticateToken, (req, res) => {
  deleteBook(req, res);
});

export default router;
