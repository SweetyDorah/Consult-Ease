import express from "express"

import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser";

import { connectDB } from "./db/connectDB.js";
import { User } from "./db/user.model.js";

import projectRouter from "./routes/project.route.js"
import authRoutes from "./routes/auth.route.js"
import bcryptjs from "bcryptjs";

import { sendReminderEmails } from "./mail/emails.js";

const app = express();
const PORT = 5000;

dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({origin : "http://localhost:5173", credentials : true}))


app.use("/api/auth", authRoutes);
app.use("/api", projectRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

setInterval(sendReminderEmails, 15 * 24 * 60 * 60 * 1000, () => {
  console.log("Sent reminder mails");
}); 


app.listen(PORT, () => {
  connectDB();
  console.log("Server is running on port", PORT);
});

