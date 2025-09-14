import fs from "fs";
import path from "path";
import helmet from "helmet";
import { v4 as uuidv4 } from "uuid";
import { PassThrough } from 'stream';
import { google } from "googleapis";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Constants
const SHEET_ID = process.env.SHEET_ID || "1qB7FLR0lXFT45FnR_5DbzC2Ycgj80EXaL9AvwIubqj0";
const DRIVE_FOLDER_ID = "1cLyQLz2pkbShsL4UemP70o8jHSZ7Id76";
const CREDENTIALS_PATH = "./backend/credentials.json";

// Initialize Google Drive API
async function initDrive(auth) {
  return google.drive({ version: 'v3', auth });
}

// Upload file to Google Drive
async function uploadToDrive(drive, fileBuffer, fileName, mimeType) {
  const bufferStream = new PassThrough();
  bufferStream.end(fileBuffer); 

  const fileMetadata = {
    name: fileName,
    mimeType: mimeType,
    parents: [DRIVE_FOLDER_ID]
  };

  const media = {
    mimeType: mimeType,
    body: bufferStream
  };

  const response = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id,webViewLink'
  });

  return response.data;
}

// Upload file to Google Drive


// Delete file from Google Drive
async function deleteFromDrive(drive, fileUrl) {
  try {
    if (!fileUrl || fileUrl === "Not Provided") return true;
    
    // Extract file ID from URL
    const matches = fileUrl.match(/\/d\/([^\/]+)/);
    if (!matches || !matches[1]) return false;
    
    const fileId = matches[1];
    await drive.files.delete({ fileId });
    return true;
  } catch (error) {
    console.error("Error deleting file from Drive:", error);
    return false;
  }
}

// Get auth client for Google APIs
async function getAuthClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.file"
    ]
  });
  return await auth.getClient();
}

// Load existing data from JSON file
function loadExistingData() {
  const filePath = path.join(__dirname, '../submissions.json');
  return fs.existsSync(filePath) ? 
    JSON.parse(fs.readFileSync(filePath)) : [];
}

// Save data to JSON file
function saveToJson(data) {
  const filePath = path.join(__dirname, '../submissions.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Find row index in Google Sheet by projectId
async function findRowIndexInSheet(sheets, projectId) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Sheet1!A:A"
  });
  
  const rows = response.data.values || [];
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] === projectId) {
      return i + 1; // +1 because sheets are 1-indexed
    }
  }
  return -1;
}

// Parse student details safely
function parseStudentDetails(studentDetailsInput) {
  try {
    if (!studentDetailsInput) return [];
    if (Array.isArray(studentDetailsInput)) return studentDetailsInput;
    if (typeof studentDetailsInput === 'string') {
      return JSON.parse(studentDetailsInput);
    }
    return [];
  } catch (error) {
    console.error("Error parsing student details:", error);
    return [];
  }
}

export const submitForm = async (req, res) => {
  try {
    // Initialize Google APIs
    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });
    const drive = await initDrive(authClient);

    // Handle file uploads
    let proofLink = "Not Provided";
    let settlementProofLink = "Not Provided";
    
    if (req.files['proof_upload'] && req.files['proof_upload'][0]) {
      const proofFile = req.files['proof_upload'][0];
      const fileExtension = path.extname(proofFile.originalname);
      const fileName = `proof_${uuidv4()}${fileExtension}`;
      const uploadedFile = await uploadToDrive(
        drive,
        proofFile.buffer,
        fileName,
        proofFile.mimetype
      );
      proofLink = uploadedFile.webViewLink || `https://drive.google.com/file/d/${uploadedFile.id}/view`;
    }

    if (req.files['settlement_proof'] && req.files['settlement_proof'][0]) {
      const settlementFile = req.files['settlement_proof'][0];
      const fileExtension = path.extname(settlementFile.originalname);
      const fileName = `settlement_${uuidv4()}${fileExtension}`;
      const uploadedFile = await uploadToDrive(
        drive,
        settlementFile.buffer,
        fileName,
        settlementFile.mimetype
      );
      settlementProofLink = uploadedFile.webViewLink || `https://drive.google.com/file/d/${uploadedFile.id}/view`;
    }

    const studentDetails = parseStudentDetails(req.body.student_details);

    const existingData = loadExistingData();
    const nextIdNumber = existingData.length + 1;
    const projectId = `P${String(nextIdNumber).padStart(3, '0')}`;

    // Prepare data for Google Sheets
    const values = [
      projectId,
      req.body.industry_name,
      req.body.project_title,
      req.body.start_date,
      req.body.end_date,
      req.body.academic_year,
      req.body.project_status,
      req.body.project_category,
      req.body.project_summary,
      req.body.pi_name,
      req.body.pi_department,
      req.body.pi_email,
      req.body.pi_phone,
      req.body.co_pi_name,
      req.body.co_pi_department,
      req.body.co_pi_email,
      req.body.co_pi_phone,
      req.body.amount_sanctioned,
      req.body.amount_received,
      req.body.settlement_status,
      req.body.amount_settled,
      proofLink,
      settlementProofLink,
      JSON.stringify(studentDetails)
    ];

    // Append to Google Sheets
    sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A:X",
      valueInputOption: "USER_ENTERED",
      resource: { values: [values] }
    });

    // Store in local JSON
    const jsonData = {
      id: projectId,
      ...req.body,
      proof_link: proofLink,
      settlement_proof_link: settlementProofLink
    };
    
    existingData.push(jsonData);
    saveToJson(existingData);

    res.status(201).json({ 
      success: true, 
      message: "Project submitted successfully",
      data: jsonData
    });
  } catch (error) {
    console.error("Submission error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to submit project"
    });
  }
};

// Edit an existing form
// In form.controller.js
export const editForm = async (req, res) => {
  try {

    const { projectId } = req.params;
    const files = req.files || {};
    
    // Debug: Log all received fields
    console.log('Received fields:', Object.keys(req.body));
    console.log('student_details:', req.body.student_details);
    
    // Parse student details safely
    const studentDetails = req.body.student_details;
    console.log('Parsed students:', studentDetails);
    
    // Initialize Google APIs
    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });
    const drive = await initDrive(authClient);
    
    // Find project in local data
    const existingData = loadExistingData();
    const projectIndex = existingData.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Project not found"
      });
    }
    
    const oldProject = existingData[projectIndex];
    
    // Handle file uploads safely
    let proofLink = req.body.existing_proof_link || oldProject.proof_link || "Not Provided";
    let settlementProofLink = req.body.existing_settlement_proof_link || oldProject.settlement_proof_link || "Not Provided";
    
    // Handle proof upload if new file is provided
    if (files['proof_upload'] && files['proof_upload'][0]) {
      // Delete old file if it exists
      if (proofLink !== "Not Provided") {
        await deleteFromDrive(drive, proofLink);
      }
      
      // Upload new file
      const proofFile = files['proof_upload'][0];
      const uploadedFile = await uploadToDrive(
        drive,
        proofFile.buffer,
        `proof_${uuidv4()}${path.extname(proofFile.originalname)}`,
        proofFile.mimetype,
        oldProject.project_folder_id
      );
      proofLink = uploadedFile.webViewLink || `https://drive.google.com/file/d/${uploadedFile.id}/view`;
    }
    
    // Handle settlement proof upload if new file is provided
    if (files['settlement_proof'] && files['settlement_proof'][0]) {
      // Delete old file if it exists
      if (settlementProofLink !== "Not Provided") {
        await deleteFromDrive(drive, settlementProofLink);
      }
      
      // Upload new file
      const settlementFile = files['settlement_proof'][0];
      const uploadedFile = await uploadToDrive(
        drive,
        settlementFile.buffer,
        `settlement_${uuidv4()}${path.extname(settlementFile.originalname)}`,
        settlementFile.mimetype
      );
      settlementProofLink = uploadedFile.webViewLink || `https://drive.google.com/file/d/${uploadedFile.id}/view`;
    }
  
    
    // Find row in Google Sheet
    const rowIndex = await findRowIndexInSheet(sheets, projectId);
    if (rowIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Project not found in Google Sheet"
      });
    }
    console.log(req.body);
    // Prepare updated values for Google Sheets
    const updatedValues = [
      projectId,
      req.body.industry_name,
      req.body.project_title,
      req.body.start_date,
      req.body.end_date,
      req.body.academic_year,
      req.body.project_status,
      req.body.project_category,
      req.body.project_summary,
      req.body.pi_name,
      req.body.pi_department,
      req.body.pi_email,
      req.body.pi_phone,
      req.body.co_pi_name,
      req.body.co_pi_department,
      req.body.co_pi_email,
      req.body.co_pi_phone,
      req.body.amount_sanctioned,
      req.body.amount_received,
      req.body.settlement_status,
      req.body.amount_settled,
      proofLink,
      settlementProofLink,
      JSON.stringify(studentDetails)
    ];
    
    // Update Google Sheet
    sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Sheet1!A${rowIndex}:X${rowIndex}`,
      valueInputOption: "USER_ENTERED",
      resource: { values: [updatedValues] }
    });
    
    // Update JSON data
    const updatedJsonData = {
      id: projectId,
      ...req.body,
      proof_link: proofLink,
      settlement_proof_link: settlementProofLink,
      student_details: studentDetails
    };
    
    existingData[projectIndex] = updatedJsonData;
    saveToJson(existingData);
    
    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: updatedJsonData
    });
    
  } catch (error) {
    console.error("Edit error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to update project"
    });
  }
};

// Delete an existing form
export const deleteForm = async (req, res) => {
  try {
    const { projectId } = req.params;
    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: "Project ID is required"
      });
    }
    
    // Initialize Google APIs
    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });
    const drive = await initDrive(authClient);
    
    // Find project in local data
    const existingData = loadExistingData();
    const projectIndex = existingData.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Project not found"
      });
    }
    
    const project = existingData[projectIndex];
    
    // Delete files from Google Drive
    if (project.proof_link && project.proof_link !== "Not Provided") {
      await deleteFromDrive(drive, project.proof_link);
    }
    
    if (project.settlement_proof_link && project.settlement_proof_link !== "Not Provided") {
      await deleteFromDrive(drive, project.settlement_proof_link);
    }
    
    // Find row in Google Sheet
    const rowIndex = await findRowIndexInSheet(sheets, projectId);
    if (rowIndex !== -1) {
      // Delete row from Google Sheet (by clearing content)
      await sheets.spreadsheets.values.clear({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!A${rowIndex}:X${rowIndex}`
      });
    }
    
    // Remove from JSON file
    existingData.splice(projectIndex, 1);
    saveToJson(existingData);
    
    res.status(200).json({
      success: true,
      message: "Project deleted successfully"
    });
    
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to delete project"
    });
  }
};