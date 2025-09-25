import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { deleteMessage, editMessage, getMessages, getUsersForSidebar, sendMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessage);

router.delete("/:id", protectRoute, deleteMessage)
router.put("/:id", protectRoute, editMessage);

export default router;
