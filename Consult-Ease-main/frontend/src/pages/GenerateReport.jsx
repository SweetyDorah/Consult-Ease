import React, { useState , useEffect} from 'react';
import  {useNavigate} from 'react-router-dom';
import {Home} from "lucide-react"
import "./pageStyles.css"
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
  ListItemIcon,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Stack,
  InputAdornment,
  Toolbar
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
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

// For PDF generation
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// For Excel generation
import * as XLSX from 'xlsx';


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
  if (!project) return null;

  const downloadAsPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.setTextColor(255, 171, 0);
    doc.text(project.project_title, 14, 20);
    
    // Add basic info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
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
    addInfoRow('Amount Sanctioned', project.amount_sanctioned);
    addInfoRow('Amount Received', project.amount_received);
    addInfoRow('Amount Settled', project.amount_settled);
    
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
        fillColor: [255, 171, 0],
        textColor: 0,
        fontStyle: 'bold'
      },
      margin: { top: y }
    });
    
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
          fillColor: [255, 171, 0],
          textColor: 0,
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
    
    doc.save(`${project.project_title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_details.pdf`);
  };

  const downloadAsExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    // Project info sheet
    const projectInfo = [
      ['Project Title', project.project_title],
      ['Academic Year', project.academic_year],
      ['Industry', project.industry_name],
      ['Status', project.project_status],
      ['Amount Sanctioned', project.amount_sanctioned],
      ['Amount Received',project.amount_received],
      ['Amount Settled', project.amount_settled],
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
        student.department
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

            {project.student_details && JSON.parse(project.student_details).length > 0 && (
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

const GenerateReport = () => {
  const [projectData, setProjectData] = useState([]);
  const navigate = useNavigate();
  
    useEffect(() => {
      const fetchProjects = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/get-all');
          if (!response.ok) throw new Error('Network response was not ok');
          const data = await response.json();
          setProjectData(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Error fetching projects:", err);
        }
      };
      fetchProjects();
    }, []);

  const [selectedProject, setSelectedProject] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    academicYear: '',
    department: '',
    amountRange: '',
    projectStatus: '',
    industry: ''
  });

  const handleViewFullInfo = (project) => {
    setSelectedProject(project);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setSelectedProject(null);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      academicYear: '',
      department: '',
      amountRange: '',
      projectStatus: '',
      industry: ''
    });
  };

  // Get unique values for filters
  const academicYears = [...new Set(projectData.map(p => p.academic_year))];
  const departments = [...new Set([
    ...projectData.map(p => p.pi_department),
    ...projectData.map(p => p.co_pi_department),
    ...projectData.flatMap(p => JSON.parse(p.student_details)?.map(s => s.dept))
  ].filter(Boolean))];
  const industries = [...new Set(projectData.map(p => p.industry_name))];
  const projectStatuses = [...new Set(projectData.map(p => p.project_status))];

  // Filter projects based on search and filter criteria
  const filteredProjects = projectData.filter(project => {
    // Search term filter
    const matchesSearch = 
      project.project_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.industry_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.pi_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.co_pi_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.parse(project.student_details).some(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filter criteria
    const matchesAcademicYear = !filters.academicYear || project.academic_year === filters.academicYear;
    const matchesDepartment = !filters.department || 
      project.pi_department === filters.department ||
      project.co_pi_department === filters.department ||
      JSON.parse(project.student_details).some(s => s.department === filters.department);
    const matchesAmountRange = !filters.amountRange || 
      (filters.amountRange === '>100000' && parseInt(project.amount_sanctioned) > 100000) ||
      (filters.amountRange === '>50000' && parseInt(project.amount_sanctioned) > 50000) ||
      (filters.amountRange === '<50000' && parseInt(project.amount_sanctioned) < 50000);
    const matchesProjectStatus = !filters.projectStatus || project.project_status === filters.projectStatus;
    const matchesIndustry = !filters.industry || project.industry_name === filters.industry;

    return matchesSearch && 
           matchesAcademicYear && 
           matchesDepartment && 
           matchesAmountRange && 
           matchesProjectStatus && 
           matchesIndustry;
  });

  const downloadAllFilteredProjectsAsPDF = () => {
    const doc = new jsPDF();
    
    // Set margins and layout
    const leftMargin = 15;
    const rightMargin = 15;
    const topMargin = 20;
    const bottomMargin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - leftMargin - rightMargin;
    
    // Title section with styling (only on first page)
    doc.setFontSize(20);
    doc.setTextColor(40, 53, 147); // Dark blue
    doc.setFont('helvetica', 'bold');
    doc.text('Consultancy Projects Report', leftMargin + contentWidth/2, topMargin, { align: 'center' });
    
    // Decorative line under title
    let y = topMargin + 10;
    doc.setDrawColor(255, 171, 0); // Yellow
    doc.setLineWidth(0.8);
    doc.line(leftMargin, y, pageWidth - rightMargin, y);
    y += 15;

    // Generation info
    doc.setFontSize(11);
    doc.setTextColor(100); // Dark gray
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, leftMargin, y);
    y += 7;
    doc.text(`Total Projects: ${filteredProjects.length}`, leftMargin, y);
    y += 15;

    // Loop through projects
    filteredProjects.forEach((project, index) => {
        // Start each project on a new page (except the first one)
        if (index > 0) {
            doc.addPage();
            y = topMargin;
        }
        
        // Project header with numbered badge
        doc.setFillColor(255, 171, 0); // Yellow
        doc.roundedRect(leftMargin, y - 5, 25, 10, 3, 3, 'F');
        doc.setTextColor(0); // Black
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}`, leftMargin + 12.5, y + 2, { align: 'center' });
        
        doc.setTextColor(40, 53, 147); // Dark blue
        doc.setFontSize(14);
        doc.text(project.project_title, leftMargin + 30, y);
        y += 15;

        // Basic info table - compact version
        const basicInfo = [
            ['Academic Year', project.academic_year || 'N/A'],
            ['Industry', project.industry_name || 'N/A'],
            ['Status', project.project_status || 'N/A'],
            ['Amount', `Sanctioned: ${project.amount_sanctioned || 'N/A'}\nReceived: ${project.amount_received || 'N/A'}\nSettled: ${project.amount_settled || 'N/A'}`],
            ['Settlement', project.settlement_status || 'N/A']
        ];
        
        autoTable(doc, {
            startY: y,
            body: basicInfo,
            theme: 'grid',
            headStyles: {
                fillColor: [255, 171, 0],
                textColor: 0,
                fontStyle: 'bold'
            },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 40 },
                1: { cellWidth: 'auto' }
            },
            margin: { left: leftMargin, right: rightMargin },
            styles: { 
                fontSize: 9,
                minCellHeight: 8,
                lineWidth: 0.1
            }
        });
        
        y = doc.lastAutoTable.finalY + 8;
        
        // Investigators table - compact version
        const investigators = [];
        if (project) {
            investigators.push({
                role: 'PI',
                name: project.pi_name || 'N/A',
                department: project.pi_department || 'N/A',
                email: project.pi_email || 'N/A'
            });
        }
        if (project.co_pi) {
            investigators.push({
                role: 'Co-PI',
                name: project.co_pi_name || 'N/A',
                department: project.co_pi_department || 'N/A',
                email: project.co_pi_email || 'N/A'
            });
        }
        
        if (investigators.length > 0) {
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(40, 53, 147); // Dark blue
            doc.setFontSize(10);
            doc.text('Investigators', leftMargin, y);
            y += 5;
            
            autoTable(doc, {
                startY: y,
                head: [['Role', 'Name', 'Dept', 'Email']],
                body: investigators.map(i => [i.role, i.name, i.department, i.email]),
                theme: 'grid',
                headStyles: {
                    fillColor: [255, 171, 0],
                    textColor: 0,
                    fontStyle: 'bold'
                },
                columnStyles: {
                    0: { fontStyle: 'bold', cellWidth: 20 },
                    1: { cellWidth: 35 },
                    2: { cellWidth: 30 },
                    3: { cellWidth: 'auto' }
                },
                margin: { left: leftMargin, right: rightMargin },
                styles: { 
                    fontSize: 8,
                    minCellHeight: 8,
                    lineWidth: 0.1
                }
            });
            
            y = doc.lastAutoTable.finalY + 8;
        }
        
        // Students table - compact version
        if (project.student_details && JSON.parse(project.student_details).length > 0) {
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(40, 53, 147); // Dark blue
            doc.setFontSize(10);
            doc.text(`Students (${JSON.parse(project.student_details).length})`, leftMargin, y);
            y += 5;
            
            autoTable(doc, {
                startY: y,
                head: [['Name', 'ID', 'Dept']],
                body: JSON.parse(project.student_details).map(s => [
                    s.name || 'N/A',
                    s.id || 'N/A',
                    s.department || 'N/A'
                ]),
                theme: 'grid',
                headStyles: {
                    fillColor: [255, 171, 0],
                    textColor: 0,
                    fontStyle: 'bold'
                },
                columnStyles: {
                    0: { cellWidth: 50 },
                    1: { cellWidth: 30 },
                    2: { cellWidth: 'auto' }
                },
                margin: { left: leftMargin, right: rightMargin },
                styles: { 
                    fontSize: 8,
                    minCellHeight: 8,
                    lineWidth: 0.1
                }
            });
            
            y = doc.lastAutoTable.finalY + 8;
        }
        
        // Project summary - truncated if too long
        if (project.project_summary) {
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(40, 53, 147); // Dark blue
            doc.setFontSize(10);
            doc.text('Project Summary', leftMargin, y);
            y += 5;
            
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(9);
            
            // Calculate remaining space on page
            const remainingSpace = doc.internal.pageSize.getHeight() - y - bottomMargin;
            const maxLines = Math.floor(remainingSpace / 5); // Approximate line height
            
            const splitText = doc.splitTextToSize(project.project_summary, contentWidth);
            
            // If summary is too long, add ellipsis
            if (splitText.length > maxLines) {
                const truncatedText = splitText.slice(0, maxLines - 1);
                doc.text(truncatedText, leftMargin, y);
                doc.text('...', leftMargin, y + (maxLines * 5));
            } else {
                doc.text(splitText, leftMargin, y);
            }
        }
    });
    
    // Footer with page numbers
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - rightMargin - 20, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
    }
    
    // Save PDF
    doc.save(`Consultancy_Projects_Report_${new Date().toISOString().slice(0,10)}.pdf`);
};
  // Add this button just before the closing Container tag, after the TableContainer
  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
    <Button
      variant="contained"
      startIcon={<PictureAsPdfIcon />}
      onClick={downloadAllFilteredProjectsAsPDF}
      sx={{
        bgcolor: colors.secondary,
        color: colors.dark,
        '&:hover': {
          bgcolor: 'rgba(255, 171, 0, 0.8)',
        },
        fontWeight: 'bold'
      }}
      disabled={filteredProjects.length === 0}
    >
      Download All Projects as PDF
    </Button>
  </Box>

  return (
    <div className = "container-stats">
    <Box
      sx={{
        minHeight: '100vh',
        p: { xs: 2, md: 4 },
        color: colors.light,
      }}
    >
      <Container maxWidth="lg">
        <h1 className='header-text'>GENERATE REPORTS</h1>

        {/* Filter Section */}
        <Paper sx={{ 
          mb: 4, 
          p: 3,
          bgcolor: colors.cardBg,
          border: '1px solid rgba(255, 171, 0, 0.2)'
        }}>
          <Typography variant="h6" sx={{ mb: 2, color: colors.secondary, display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterListIcon /> Filters
          </Typography>
          
          <Grid container spacing={2} sx = {{display: 'flex', justifyContent: 'center'}}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth sx={{ minWidth: 1000 }}
                variant="outlined"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: colors.secondary }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setSearchTerm('')} size="small">
                        <ClearIcon fontSize="small" sx={{ color: colors.secondary }} />
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: {
                    color: colors.light,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 171, 0, 0.5)'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.secondary
                    }
                  }
                }}
              />
            </Grid>
            
            {/* Academic Year Filter - Larger */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth sx={{ minWidth: 180 }}>
                <InputLabel sx={{ color: colors.secondary }}>Academic Year</InputLabel>
                <Select
                  name="academicYear"
                  value={filters.academicYear}
                  onChange={handleFilterChange}
                  label="Academic Year"
                  sx={{
                    color: colors.light,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 171, 0, 0.5)'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.secondary
                    },
                    '& .MuiSelect-select': {
                      py: 1.5, // Increased padding
                      fontSize: '0.95rem' // Slightly larger font
                    }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: colors.cardBg,
                        border: `1px solid ${colors.secondary}`,
                        '& .MuiMenuItem-root': {
                          minHeight: 48, // Increased height
                          py: 1.5, // Increased padding
                          fontSize: '0.95rem', // Slightly larger font
                          color: colors.light,
                          '&:hover': {
                            bgcolor: 'rgba(255, 171, 0, 0.1)'
                          }
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value="" sx={{ py: 1.5 }}>All Years</MenuItem>
                  {academicYears.map(year => (
                    <MenuItem key={year} value={year} sx={{ py: 1.5 }}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Department Filter - Larger */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth sx={{ minWidth: 180 }}>
                <InputLabel sx={{ color: colors.secondary }}>Department</InputLabel>
                <Select
                  name="department"
                  value={filters.department}
                  onChange={handleFilterChange}
                  label="Department"
                  sx={{
                    color: colors.light,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 171, 0, 0.5)'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.secondary
                    },
                    '& .MuiSelect-select': {
                      py: 1.5,
                      fontSize: '0.95rem'
                    }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: colors.cardBg,
                        border: `1px solid ${colors.secondary}`,
                        '& .MuiMenuItem-root': {
                          minHeight: 48,
                          py: 1.5,
                          fontSize: '0.95rem',
                          color: colors.light,
                          '&:hover': {
                            bgcolor: 'rgba(255, 171, 0, 0.1)'
                          }
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value="" sx={{ py: 1.5 }}>All Departments</MenuItem>
                  {departments.map(dept => (
                    <MenuItem key={dept} value={dept} sx={{ py: 1.5 }}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Amount Range Filter - Larger */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth sx={{ minWidth: 180 }}>
                <InputLabel sx={{ color: colors.secondary }}>Amount Range</InputLabel>
                <Select
                  name="amountRange"
                  value={filters.amountRange}
                  onChange={handleFilterChange}
                  label="Amount Range"
                  sx={{
                    color: colors.light,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 171, 0, 0.5)'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.secondary
                    },
                    '& .MuiSelect-select': {
                      py: 1.5,
                      fontSize: '0.95rem'
                    }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: colors.cardBg,
                        border: `1px solid ${colors.secondary}`,
                        '& .MuiMenuItem-root': {
                          minHeight: 48,
                          py: 1.5,
                          fontSize: '0.95rem',
                          color: colors.light,
                          '&:hover': {
                            bgcolor: 'rgba(255, 171, 0, 0.1)'
                          }
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value="" sx={{ py: 1.5 }}>All Amounts</MenuItem>
                  <MenuItem value=">100000" sx={{ py: 1.5 }}>Above ₹1,00,000</MenuItem>
                  <MenuItem value=">50000" sx={{ py: 1.5 }}>Above ₹50,000</MenuItem>
                  <MenuItem value="<50000" sx={{ py: 1.5 }}>Below ₹50,000</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Status Filter - Larger */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth sx={{ minWidth: 180 }}>
                <InputLabel sx={{ color: colors.secondary }}>Status</InputLabel>
                <Select
                  name="projectStatus"
                  value={filters.projectStatus}
                  onChange={handleFilterChange}
                  label="Status"
                  sx={{
                    color: colors.light,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 171, 0, 0.5)'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.secondary
                    },
                    '& .MuiSelect-select': {
                      py: 1.5,
                      fontSize: '0.95rem'
                    }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: colors.cardBg,
                        border: `1px solid ${colors.secondary}`,
                        '& .MuiMenuItem-root': {
                          minHeight: 48,
                          py: 1.5,
                          fontSize: '0.95rem',
                          color: colors.light,
                          '&:hover': {
                            bgcolor: 'rgba(255, 171, 0, 0.1)'
                          }
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value="" sx={{ py: 1.5 }}>All Statuses</MenuItem>
                  {projectStatuses.map(status => (
                    <MenuItem key={status} value={status} sx={{ py: 1.5 }}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Industry Filter - Larger */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth sx={{ minWidth: 180 }}>
                <InputLabel sx={{ color: colors.secondary }}>Industry</InputLabel>
                <Select
                  name="industry"
                  value={filters.industry}
                  onChange={handleFilterChange}
                  label="Industry"
                  sx={{
                    color: colors.light,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 171, 0, 0.5)'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.secondary
                    },
                    '& .MuiSelect-select': {
                      py: 1.5,
                      fontSize: '0.95rem'
                    }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: colors.cardBg,
                        border: `1px solid ${colors.secondary}`,
                        '& .MuiMenuItem-root': {
                          minHeight: 48,
                          py: 1.5,
                          fontSize: '0.95rem',
                          color: colors.light,
                          '&:hover': {
                            bgcolor: 'rgba(255, 171, 0, 0.1)'
                          }
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value="" sx={{ py: 1.5 }}>All Industries</MenuItem>
                  {industries.map(industry => (
                    <MenuItem key={industry} value={industry} sx={{ py: 1.5 }}>{industry}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              onClick={clearFilters}
              variant="outlined"
              sx={{
                color: colors.secondary,
                borderColor: colors.secondary,
                '&:hover': {
                  backgroundColor: 'rgba(255, 171, 0, 0.1)',
                  borderColor: colors.secondary
                }
              }}
            >
              Clear Filters
            </Button>
          </Box>
        </Paper>

        {/* Results count */}
        <Typography variant="subtitle1" sx={{ mb: 2, color: colors.secondary }}>
          Showing {filteredProjects.length} of {projectData.length} projects
        </Typography>

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
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project, index) => (
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
                            project.project_status === 'completed' ? "rgba(179, 142, 172)": 
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: colors.secondary }}>
                    No projects found matching your criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
  <Button
    variant="contained"
    startIcon={<PictureAsPdfIcon />}
    onClick={downloadAllFilteredProjectsAsPDF}
    sx={{
      bgcolor: colors.secondary,
      color: colors.dark,
      '&:hover': {
        bgcolor: 'rgba(255, 171, 0, 0.8)',
      },
      fontWeight: 'bold'
    }}
  >
    Download Filtered Projects as PDF
  </Button>
</Box>
      </Container>

      <ProjectDetailsModal 
        project={selectedProject} 
        open={modalOpen} 
        onClose={handleClose}
      />
    </Box>
    <div style={{ marginTop: "1rem" }}>
    <button onClick = {() => navigate('/admin-dashboard')}className="redirect-button">
      <Home size={24} color="#F5A425" />
    </button>
  </div>
</div>
  );
};

export default GenerateReport;