import express from "express"
import { login, logout, checkAuth} from "../controllers/login.controller.js";
import { signup, verifyEmail } from "../controllers/signup.controller.js";
import { forgotPassword, resetPassword } from "../controllers/password.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";


const router = express.Router();

router.get("/auth-check", verifyToken, checkAuth);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;