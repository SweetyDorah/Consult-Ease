import express from 'express';
import { getAllProjects, getFacultyProjects,getProjectById } from '../controllers/project.controller.js';
import { submitForm, editForm, deleteForm } from "../controllers/form.controller.js";
import {sanitizeInput} from "../middleware/sanitizeInput.js";
import {upload} from "../controllers/multer.controller.js"

const projectRouter = express.Router();


projectRouter.get("/get-project/:projectId", getProjectById);
projectRouter.get('/get-all', getAllProjects);
projectRouter.get('/get-faculty', getFacultyProjects);
projectRouter.post("/submit-form", upload.fields([
  { name: 'proof_upload', maxCount: 1 },
  { name: 'settlement_proof', maxCount: 1 }
]),
sanitizeInput, submitForm);

projectRouter.put("/edit/:projectId",upload.fields([
  { name: 'proof_upload', maxCount: 1 },
  { name: 'settlement_proof', maxCount: 1 }
]),
sanitizeInput, editForm);
projectRouter.delete("/delete/:projectId", deleteForm);


export default projectRouter;