import fs from 'fs';
import path from 'path';


const submissionsFilePath = "backend/submissions.json"

const getProjectsFromFile = () => {
  try {
    const data = fs.readFileSync(submissionsFilePath, 'utf8');
    
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading the submissions.json file:", error);
    return [];
  }
};

const projects = getProjectsFromFile();

export const getAllProjects = (req, res) => {
  const projects = getProjectsFromFile();
  res.status(200).json(projects);
};


export const getFacultyProjects = (req, res) => {
  const { email } = req.query;
  
  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  const projects = getProjectsFromFile();
 
  const filteredProjects = projects.filter(
    (project) =>
      project.pi_email === email || project.co_pi_email === email
  );


  res.status(200).json(filteredProjects);
};

export const getProjectById = (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).json({ error: "projectId is required." });
  }

  const projects = getProjectsFromFile();
  const project = projects.find(p => p.id === projectId); 

  if (!project) {
    return res.status(404).json({ error: "Project not found." });
  }

  res.status(200).json(project);
};

