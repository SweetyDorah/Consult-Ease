import React, { useState, useEffect } from 'react';
import "./pageStyles.css"
import { Home, LogOut, PlusCircleIcon } from 'lucide-react';
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Typography,
  Container,
  Modal,
  IconButton,
  Fade,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Avatar,
  Divider,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DescriptionIcon from '@mui/icons-material/Description';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import GridOnIcon from '@mui/icons-material/GridOn';

// For PDF generation
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// For Excel generation
import * as XLSX from 'xlsx';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const colors = {
  primary: '#3f51b5',
  secondary: '#f5a425',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#00acc1',
  dark: '#0a1929',
  light: '#f8f9fa',
  cardBg: '#1C1F25'
};

const DownloadMenu = ({ onDownloadPDF, onDownloadExcel, colors }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <IconButton
        aria-label="download options"
        aria-controls={open ? 'download-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        sx={{ color: colors.secondary }}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'download-button',
        }}
        PaperProps={{
          sx: {
            bgcolor: colors.cardBg,
            border: `1px solid ${colors.secondary}`,
            '& .MuiMenuItem-root': {
              color: colors.light,
              '&:hover': {
                bgcolor: 'rgba(255, 171, 0, 0.1)'
              }
            }
          }
        }}
      >
        <MenuItem onClick={() => {
          onDownloadPDF();
          handleClose();
        }}>
          <ListItemIcon>
            <PictureAsPdfIcon sx={{ color: colors.secondary }} />
          </ListItemIcon>
          Download as PDF
        </MenuItem>
        <MenuItem onClick={() => {
          onDownloadExcel();
          handleClose();
        }}>
          <ListItemIcon>
            <GridOnIcon sx={{ color: colors.secondary }} />
          </ListItemIcon>
          Download as Excel
        </MenuItem>
      </Menu>
    </Box>
  );
};

const ProjectDetailsModal = ({ project, open, onClose }) => {
  const navigate = useNavigate();
  
  // Add state for delete confirmation dialog
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  if (!project) return null;
  // Handle edit button click
  const handleEdit = () => {
    navigate(`/edit-project/${project.id}`);
    onClose(); // Close the modal
  };

  // Handle delete button click
  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/delete/${project.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete project');
      }
      
      // Close confirmation dialog and main modal
      setConfirmDeleteOpen(false);
      onClose();
      
      // You might want to add some feedback or refresh the project list
      // This depends on your app structure
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  // Function to open delete confirmation
  const openDeleteConfirm = () => {
    setConfirmDeleteOpen(true);
  };

  // Function to close delete confirmation
  const closeDeleteConfirm = () => {
    setConfirmDeleteOpen(false);
  };

  // Download as PDF
const downloadAsPDF = () => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.setTextColor(255, 171, 0); // Yellow color
  doc.text(project.project_title, 14, 20);
  
  // Add basic info
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0); // Black color
  let y = 30;
  
  const addInfoRow = (label, value) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 60, y);
    y += 7;
  };
  
  addInfoRow('Academic Year', project.academic_year);
  addInfoRow('Industry', project.industry_name);
  addInfoRow('Status', project.project_status);
  addInfoRow('Amount Sanctioned',project.amount_sanctioned);
  addInfoRow('Amount Received',project.amount_received);
  addInfoRow('Amount Settled',project.amount_settled);
  
  // Add team members
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Investigators', 14, y);
  y += 7;
  
  const teamMembers = [
    ['Role', 'Name', 'Department', 'Email'],
    ['Principal Investigator', project.pi_name, project.pi_department, project.pi_email || 'N/A'],
    ['Co-Principal Investigator', project.co_pi_name || 'N/A', project.co_pi_department || 'N/A', project.co_pi_email || 'N/A']
  ];
  
  autoTable(doc, {
    startY: y,
    head: [teamMembers[0]],
    body: teamMembers.slice(1),
    theme: 'grid',
    headStyles: {
      fillColor: [255, 171, 0], // Yellow
      textColor: 0, // Black
      fontStyle: 'bold'
    },
    margin: { top: y }
  });
  
  // Add students if available
  if (project.student_details && JSON.parse(project.student_details).length > 0) {
    y = doc.lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.text(`Students (${JSON.parse(project.student_details).length})`, 14, y);
    y += 7;
    
    const studentsData = JSON.parse(project.student_details).map(student => [
      student.name,
      student.id,
      student.department
    ]);
    
    autoTable(doc, {
      startY: y,
      head: [['Name', 'ID', 'Department']],
      body: studentsData,
      theme: 'grid',
      headStyles: {
        fillColor: [255, 171, 0], // Yellow
        textColor: 0, // Black
        fontStyle: 'bold'
      },
      margin: { top: y }
    });
  }
  
  // Add project summary if available
  if (project.project_summary) {
    y = doc.lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Project Summary', 14, y);
    y += 7;
    
    doc.setFont('helvetica', 'normal');
    const splitText = doc.splitTextToSize(project.project_summary, 180);
    doc.text(splitText, 14, y);
  }

  if (project.proof_link &&project.settlement_proof_link ) {
    y = doc.lastAutoTable.finalY + 30;
    doc.setFont('helvetica', 'bold');
    doc.text('Uploaded Documents(Drive Links)', 14, y);
    y += 7;
    
    doc.setFont('helvetica', 'normal');
    const splitText1 = doc.splitTextToSize(project.proof_link, 180);
    doc.text(splitText1, 14, y);
    y += 7;
    const splitText2 = doc.splitTextToSize(project.settlement_proof_link, 180);
    doc.text(splitText2, 14, y);

  }
  
  doc.save(`${project.project_title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_details.pdf`);
};

  // Download as Excel
  const downloadAsExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    // Project info sheet
    const projectInfo = [
      ['Project Title', project.project_title],
      ['Academic Year', project.academic_year],
      ['Industry', project.industry_name],
      ['Status', project.project_status],
      ['Amount Sanctioned', `₹${parseInt(project.amount_sanctioned).toLocaleString('en-IN')}`],
      ['Amount Received', `₹${parseInt(project.amount_received).toLocaleString('en-IN')}`],
      ['Amount Settled', `₹${parseInt(project.amount_settled).toLocaleString('en-IN')}`],
      ['Settlement Status', project.settlement_status],
      ['Start Date', project.start_date],
      ['End Date', project.end_date]
    ];
    
    const infoSheet = XLSX.utils.aoa_to_sheet(projectInfo);
    XLSX.utils.book_append_sheet(workbook, infoSheet, 'Project Info');
    
    // Team members sheet
    const teamMembers = [
      ['Role', 'Name', 'Department', 'Email'],
      ['Principal Investigator', project.pi_name, project.pi_department, project.pi_email || 'N/A'],
      ['Co-Principal Investigator', project.co_pi_name || 'N/A', project.co_pi_department || 'N/A', project.co_pi_email || 'N/A']
    ];
    
    const teamSheet = XLSX.utils.aoa_to_sheet(teamMembers);
    XLSX.utils.book_append_sheet(workbook, teamSheet, 'Team Members');
    
    // Students sheet if available
    if (project.student_details && JSON.parse(project.student_details).length > 0) {
      const studentsHeader = ['Name', 'ID', 'Department'];
      const studentsData = JSON.parse(project.student_details).map(student => [
        student.name,
        student.id,
        student.deptartment
      ]);
      
      const studentsSheet = XLSX.utils.aoa_to_sheet([studentsHeader, ...studentsData]);
      XLSX.utils.book_append_sheet(workbook, studentsSheet, 'Students');
    }
    
    // Summary sheet if available
    if (project.project_summary) {
      const summarySheet = XLSX.utils.aoa_to_sheet([
        ['Project Summary'],
        [project.project_summary]
      ]);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    }
    
    XLSX.writeFile(workbook, `${project.project_title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_details.xlsx`);
  };

  return (
    <>
    <Modal open={open} onClose={onClose} closeAfterTransition>
      <Fade in={open} timeout={300}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 900,
          bgcolor: colors.cardBg,
          boxShadow: 24,
          borderRadius: 2,
          maxHeight: '90vh',
          overflowY: 'auto',
          p: 0,
          outline: 'none',
          border: `1px solid rgba(255, 171, 0, 0.3)`
        }}>
          {/* Header */}
          <Box sx={{
            bgcolor: colors.cardBg,
            color: colors.secondary,
            p: 3,
            borderTopLeftRadius: 2,
            borderTopRightRadius: 2,
            position: 'relative',
            borderBottom: `1px solid rgba(255, 171, 0, 0.2)`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: colors.secondary }}>
                {project.project_title}
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                <Chip 
                  icon={<BusinessIcon sx={{ color: colors.secondary }} />} 
                  label={project.industry_name} 
                  sx={{ 
                    bgcolor: 'rgba(255, 171, 0, 0.1)', 
                    color: colors.secondary,
                    border: `1px solid ${colors.secondary}`
                  }} 
                />
                <Chip 
                  icon={<CalendarTodayIcon sx={{ color: colors.secondary }} />} 
                  label={`${project.start_date} to ${project.end_date}`} 
                  sx={{ 
                    bgcolor: 'rgba(255, 171, 0, 0.1)', 
                    color: colors.secondary,
                    border: `1px solid ${colors.secondary}`
                  }} 
                />
        <Chip 
        label={project.project_status} 
        sx={{ 
          bgcolor: 
            project.project_status === 'completed' ? 'rgba(179, 142, 172, 0.2)': 
            project.project_status === 'ongoing' ? 'rgba(63, 81, 181, 0.2)' : 
            'rgba(76, 175, 80, 0.2)',
          color: 
            project.project_status === 'completed' ? 'rgba(179, 142, 172)' : 
            project.project_status === 'ongoing' ? '#3f51b5' : 
            '#4caf50',
          border: `1px solid ${
            project.project_status === 'completed' ? 'rgba(179, 142, 172)' :
            project.project_status === 'ongoing' ? '#3f51b5' : 
           '#4caf50'
          }`,
          fontWeight: 'bold'
        }} 
        size="small"
      />
              </Box>
          </Box>
          <Button 
                  variant="outlined" 
                  startIcon={<EditIcon />} 
                  onClick={handleEdit}
                  sx={{ 
                    borderColor: colors.secondary,
                    color: colors.secondary,
                    '&:hover': {
                      borderColor: colors.secondary,
                      backgroundColor: 'rgba(255, 171, 0, 0.1)'
                    }
                  }}
                >
                  Edit
                </Button>
                
                <Button 
                  variant="outlined" 
                  startIcon={<DeleteIcon />} 
                  onClick={openDeleteConfirm}
                  sx={{ 
                    borderColor: '#f44336',
                    color: '#f44336',
                    '&:hover': {
                      borderColor: '#f44336',
                      backgroundColor: 'rgba(244, 67, 54, 0.1)'
                    }
                  }}
                >
                  Delete
                </Button>
            <DownloadMenu 
              onDownloadPDF={downloadAsPDF}
              onDownloadExcel={downloadAsExcel}
              colors={colors}
            />
          </Box>

          {/* Content */}
          <Box sx={{ p: 3 }}>
            {/* Project Info */}
            <Section title="Project Information" colors={colors}>
              <InfoItem icon={<CalendarTodayIcon sx={{ color: colors.secondary }} />} 
                label="Academic Year" value={project.academic_year} colors={colors} />
              <InfoItem icon={<AttachMoneyIcon sx={{ color: colors.secondary }} />} 
                label="Amount Sanctioned" 
                value={`₹${parseInt(project.amount_sanctioned).toLocaleString('en-IN')}`} 
                colors={colors} />
              <InfoItem icon={<AttachMoneyIcon sx={{ color: colors.secondary }} />} 
                label="Amount Received" 
                value={`₹${parseInt(project.amount_received).toLocaleString('en-IN')}`} 
                colors={colors} />
              <InfoItem icon={<AttachMoneyIcon sx={{ color: colors.secondary }} />} 
                label="Amount Settled" 
                value={`₹${parseInt(project.amount_settled).toLocaleString('en-IN')}`} 
                colors={colors} />
              <InfoItem label="Settlement Status" value={project.settlement_status} colors={colors} />
            </Section>

            <Divider sx={{ my: 3, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />

            {/* Team Members */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Section title="Principal Investigator" colors={colors}>
                  <TeamMember 
                    name={project.pi_name} 
                    department={project.pi_department} 
                    email={project.pi_email} 
                    colors={colors}
                  />
                </Section>
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <Section title="Co-Principal Investigator" colors={colors}>
                  <TeamMember 
                    name={project.co_pi_name} 
                    department={project.co_pi_department} 
                    email={project.co_pi_email} 
                    colors={colors}
                  />
                </Section>
              </Box>
            </Box>

            {project.student_details && Array.isArray(JSON.parse(project.student_details)) && (
              <>
                <Divider sx={{ my: 3, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
                <Section title={`Students (${JSON.parse(project.student_details).length})`} colors={colors}>
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
                    gap: 2 
                  }}>
                    {JSON.parse(project.student_details).map((student, i) => (
                      <Box key={i} sx={{ 
                        p: 2, 
                        borderRadius: 1, 
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        border: '1px solid rgba(255, 171, 0, 0.1)'
                      }}>
                        <Avatar sx={{ bgcolor: colors.secondary, color: colors.dark }}>
                          {getInitial(student.name)}
                        </Avatar>
                        <Box>
                          <Typography fontWeight="bold" sx={{ color: colors.light }}>
                            {student.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            {student.id} • {student.department}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Section>
              </>
            )}

            {project.project_summary && (
              <>
                <Divider sx={{ my: 3, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
                <Section title="Project Summary" icon={<DescriptionIcon sx={{ color: colors.secondary }} />} colors={colors}>
                  <Paper elevation={0} sx={{ 
                    p: 2, 
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 171, 0, 0.1)'
                  }}>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      {project.project_summary}
                    </Typography>
                  </Paper>
                </Section>
              </>
            )}
          </Box>
        </Box>
      </Fade>
    </Modal>
    <Dialog
    open={confirmDeleteOpen}
    onClose={closeDeleteConfirm}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
    <DialogTitle id="alert-dialog-title">
      {"Delete Project"}
    </DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        Are you sure you want to delete the project "{project.project_title}"? This action cannot be undone.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={closeDeleteConfirm} sx={{ color: 'text.secondary' }}>
        Cancel
      </Button>
      <Button onClick={handleDelete} color="error" autoFocus>
        Delete
      </Button>
    </DialogActions>
  </Dialog>
  </>
  );
};


const Section = ({ title, children, icon, colors }) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="h6" sx={{ 
      mb: 2, 
      display: 'flex', 
      alignItems: 'center',
      gap: 1,
      color: colors.secondary
    }}>
      {icon}
      {title}
    </Typography>
    {children}
  </Box>
);

const InfoItem = ({ label, value, icon, colors }) => (
  <Box sx={{ display: 'flex', mb: 1.5 }}>
    <Box sx={{ width: 180, display: 'flex', alignItems: 'center', gap: 1 }}>
      {icon}
      <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
        {label}:
      </Typography>
    </Box>
    <Typography sx={{ color: colors.light }}>{value || 'N/A'}</Typography>
  </Box>
);

const TeamMember = ({ name, department, email, colors }) => (
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center', 
    gap: 2,
    p: 2,
    borderRadius: 1,
    bgcolor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 171, 0, 0.1)'
  }}>
    <Avatar sx={{ bgcolor: colors.secondary, color: colors.dark }}>
      {getInitial(name)}
    </Avatar>
    <Box>
      <Typography fontWeight="bold" sx={{ color: colors.light }}>
        {name || 'N/A'}
      </Typography>
      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
        {department || 'N/A'}
      </Typography>
      {email && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
          <EmailIcon fontSize="small" sx={{ color: colors.secondary }} />
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            {email}
          </Typography>
        </Box>
      )}
    </Box>
  </Box>
);

const getInitial = (name) => name?.charAt(0)?.toUpperCase() || '?';

const FacultyDashboard = () => {
  const [projectData, setProjectData] = useState([]);
  const {user, logout} = useAuthStore();
  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    // Initial fetch
    let fetchProjects = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/get-faculty?email=${user.email}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setProjectData(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    };
    
    // Fetch on initial mount
    fetchProjects();
    
    // Refetch when window gets focus
    const handleFocus = () => {
      console.log("Window focused - fetching fresh data");
      fetchProjects();
    };
    
    // Add event listener for when the window regains focus
    window.addEventListener('focus', handleFocus);
    
    // Cleanup
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }); 

  const [selectedProject, setSelectedProject] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleViewFullInfo = (project) => {
    setSelectedProject(project);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setSelectedProject(null);
  };

  return (
  <div className='container-stats'>
    <Box
      sx={{
        minHeight: '100vh',
        p: { xs: 2, md: 4 },
        color: colors.light,
      }}
    >
      <Container maxWidth="lg">
        <h1 className='header-text'>PROJECT INFORMATION</h1>

        <TableContainer 
          component={Paper} 
          sx={{ 
            mb: 4,
            bgcolor: colors.cardBg,
            border: '1px solid rgba(255, 171, 0, 0.2)',
            boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.5)'
          }}
        >
          <Table sx={{ minWidth: 650 }} aria-label="projects table">
            <TableHead sx={{ bgcolor: colors.secondary }}>
              <TableRow>
                <TableCell sx={{ color: "black", fontWeight: 'bold' }}>Project Title</TableCell>
                <TableCell sx={{ color: "black", fontWeight: 'bold' }}>Industry</TableCell>
                <TableCell sx={{ color: "black", fontWeight: 'bold' }}>Principal Investigator</TableCell>
                <TableCell sx={{ color: "black", fontWeight: 'bold' }}>Amount Sanctioned</TableCell>
                <TableCell sx={{ color: "black", fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: "black", fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projectData.map((project, index) => (
                <TableRow 
                  key={index}
                  hover
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 171, 0, 0.05)'
                    }
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: 'rgba(255, 171, 0, 0.1)', 
                        color: colors.secondary,
                        border: `1px solid ${colors.secondary}`
                      }}>
                        {getInitial(project.industry_name)}
                      </Avatar>
                      <Typography sx={{ color: colors.light }}>{project.project_title}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: colors.light }}>{project.industry_name}</TableCell>
                  <TableCell sx={{ color: colors.light }}>{project.pi_name || 'N/A'}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: colors.secondary }}>
                    ₹{parseInt(project.amount_sanctioned).toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell>
                  <Chip 
              label={project.project_status} 
              sx={{ 
                bgcolor: 
                project.project_status === 'completed' ? 'rgba(179, 142, 172, 0.2)': 
                project.project_status === 'ongoing' ? 'rgba(63, 81, 181, 0.2)' : 
                'rgba(76, 175, 80, 0.2)',
                color: 
                  project.project_status === 'completed' ? 'rgba(179, 142, 172)' : 
                  project.project_status === 'ongoing' ? '#3F51B5' : 
                  '#4CAF50',
                border: `1px solid ${
                  project.project_status === 'completed' ? 'rgba(179, 142, 172)': 
                  project.project_status === 'ongoing' ? '#3F51B5' : 
                  '#4CAF50'
                }`,
                fontWeight: 'bold'
              }} 
              />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      sx={{
                        color: colors.secondary,
                        borderColor: colors.secondary,
                        '&:hover': {
                          backgroundColor: 'rgba(255, 171, 0, 0.1)',
                          borderColor: colors.secondary
                        }
                      }}
                      onClick={() => handleViewFullInfo(project)}
                      size="small"
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      <ProjectDetailsModal 
        project={selectedProject} 
        open={modalOpen} 
        onClose={handleClose}
      />
    </Box>
    <div style={{ marginTop: "1rem" }}>
      <button onClick={handleLogout} className="redirect-button">
        <LogOut size={24} color="#F5A425" />
      </button>
    </div>

    <div style={{ marginTop: "1rem" }}>
      <button onClick={() => navigate("/new-form")} className="redirect-button-1">
        <PlusCircleIcon size={24} color="#F5A425" />
        <p className='header-subtext'>Add New Project</p>
      </button>
    </div>
    </div>
    
  );
};

export default FacultyDashboard;