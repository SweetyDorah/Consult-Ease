import React from 'react';
import { useState, useEffect } from 'react';
import { Home } from 'lucide-react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Divider,
  Stack,
  Avatar,
  LinearProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import "./pageStyles.css"

// Enhanced color palette
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

const StatisticsPage = () => {
  const [projectData, setProjectData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/get-all');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setProjectData(data);
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    };
    fetchProjects();
  }, []);

    {console.log(projectData)}
    // Basic stats
    const totalProjects = projectData.length;
    const ongoing = projectData.filter(p => p.project_status === 'ongoing').length;
    const completed = projectData.filter(p => p.project_status === 'completed').length;
    const newProjects = projectData.filter(p => p.project_status === 'new').length;
    
    // Financial stats
    const totalSanctioned = projectData.reduce((sum, p) => sum + parseInt(p.amount_sanctioned), 0);
    const totalReceived = projectData.reduce((sum, p) => parseInt(p.amount_received) + sum, 0);
    const totalSettled = projectData.reduce((sum, p) => sum + parseInt(p.amount_settled), 0);
    const pendingAmount = totalSanctioned - totalSettled;
    const fundUtilization = ((totalSettled / totalSanctioned) * 100).toFixed(1);
    
    // Status stats
    const settlementComplete = projectData.filter(p => p.settlement_status === 'complete').length;
    const settlementPending = projectData.filter(p => p.settlement_status === 'pending').length;
    const settlementPartial = projectData.filter(p => p.settlement_status === 'partial').length;
    
    // Categorization
    const categories = {};
    const industries = {};
    const departments = {};
    const academicYears = {};
    
    projectData.forEach(p => {
      categories[p.project_category] = (categories[p.project_category] || 0) + 1;
      industries[p.industry_name] = (industries[p.industry_name] || 0) + 1;
      academicYears[p.academic_year] = (academicYears[p.academic_year] || 0) + 1;
      const students = JSON.parse(p.student_details);
      students.forEach(student => {
        departments[student.deptartment] = (departments[student.deptartment] || 0) + 1;
      });
    });
  
    // Top projects by funding
    const topProjects = [...projectData]
      .sort((a, b) => parseInt(b.amount_sanctioned) - parseInt(a.amount_sanctioned))
      .slice(0, 3);
  
    return (
      <div className='container-stats'>
      <Box sx={{
        minHeight: '100vh',
        p: { xs: 2, md: 4 },
        color: colors.light,
      }}>
        {/* Header */}
        <Box sx={{ 
          textAlign: 'center',
          mb: 4,
          animation: 'fadeIn 1s ease-in'
        }}>
          <h1 className='header-text'>PROJECT STATISTICS</h1>
          <p className='header-subtext'>Comprehensive overview of all consultancy projects</p>
         
        </Box>
        
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }} justifyContent={'center'}>
          {/* Total Projects Card */}
          <Grid item xs={12} sm={6} md={3} >
            <Card sx={{ 
              backgroundColor: colors.cardBg,
              color: 'white',
              height: '100%',
              borderRadius: '12px',
              boxShadow: `0 8px 16px -4px rgba(0, 0, 0, 0.3)`,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: `0 12px 24px -6px rgba(255, 171, 0, 0.4)`
              }
            }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                  <Avatar sx={{ 
                    bgcolor: colors.secondary,
                    width: 48,
                    height: 48
                  }}>
                    <Typography variant="h6" sx={{ color: colors.dark }}>P</Typography>
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      Total Projects
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {totalProjects}
                    </Typography>
                  </Box>
                </Stack>
                <LinearProgress 
                  variant="determinate" 
                  value={(completed / totalProjects) * 100} 
                  sx={{ 
                    mt: 2, 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4
                    }
                  }}
                  color="success"
                />
                <Typography variant="caption" sx={{ 
                  mt: 1, 
                  display: 'block',
                  color: 'rgba(255, 255, 255, 0.6)'
                }}>
                  {((completed / totalProjects) * 100).toFixed(1)}% completed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
  
          {/* Financial Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              backgroundColor: colors.cardBg,
              color: 'white',
              height: '100%',
              borderRadius: '12px',
              boxShadow: `0 8px 16px -4px rgba(0, 0, 0, 0.3)`,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: `0 12px 24px -6px rgba(0, 172, 193, 0.4)`
              }
            }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                  <Avatar sx={{ 
                    bgcolor: colors.info,
                    width: 48,
                    height: 48
                  }}>
                    <Typography variant="h6">₹</Typography>
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      Total Sanctioned
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      ₹{totalSanctioned.toLocaleString()}
                    </Typography>
                  </Box>
                </Stack>
                <LinearProgress 
                  variant="determinate" 
                  value={fundUtilization} 
                  sx={{ 
                    mt: 2, 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4
                    }
                  }}
                  color="info"
                />
                <Typography variant="caption" sx={{ 
                  mt: 1, 
                  display: 'block',
                  color: 'rgba(255, 255, 255, 0.6)'
                }}>
                  {fundUtilization}% funds utilized
                </Typography>
              </CardContent>
            </Card>
          </Grid>
  
          {/* Project Status Card */}
          <Grid item xs={12} sm={6} md={3} >
            <Card sx={{ 
              backgroundColor: colors.cardBg,
              color: 'white',
              height: '100%',
              borderRadius: '12px',
              boxShadow: `0 8px 16px -4px rgba(0, 0, 0, 0.3)`,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: `0 12px 24px -6px rgba(76, 175, 80, 0.4)`
              }
            }}>
              <CardContent >
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                  <Avatar sx={{ 
                    bgcolor: colors.success,
                    width: 48,
                    height: 48
                  }}>
                    <Typography variant="h6">S</Typography>
                  </Avatar>
                  <Box alignItems={'center'}>
                    <Typography variant="subtitle1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      Project Status
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                      <Chip 
                        label={`${ongoing} Ongoing`} 
                        size="small" 
                        sx={{ 
                          backgroundColor: colors.primary,
                          color: 'white'
                        }} 
                      />
                      <Chip 
                        label={`${completed} Completed`} 
                        size="small" 
                        sx={{ 
                          backgroundColor: colors.success,
                          color: 'white'
                        }} 
                      />
                      <Chip 
                        label={`${newProjects} New`} 
                        size="small" 
                        sx={{ 
                          backgroundColor: colors.warning,
                          color: 'white'
                        }} 
                      />
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
  
          {/* Settlement Status Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              backgroundColor: colors.cardBg,
              color: 'white',
              height: '100%',
              borderRadius: '12px',
              boxShadow: `0 8px 16px -4px rgba(0, 0, 0, 0.3)`,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: `0 12px 24px -6px rgba(244, 67, 54, 0.4)`
              }
            }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                  <Avatar sx={{ 
                    bgcolor: colors.error,
                    width: 48,
                    height: 48
                  }}>
                    <Typography variant="h6">$</Typography>
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      Settlement Status
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                      <Chip 
                        label={`${settlementComplete} Complete`} 
                        size="small" 
                        sx={{ 
                          backgroundColor: colors.success,
                          color: 'white'
                        }} 
                      />
                      <Chip 
                        label={`${settlementPending} Pending`} 
                        size="small" 
                        sx={{ 
                          backgroundColor: colors.error,
                          color: 'white'
                        }} 
                      />
                      <Chip 
                        label={`${settlementPartial} Partial`} 
                        size="small" 
                        sx={{ 
                          backgroundColor: colors.warning,
                          color: 'white'
                        }} 
                      />
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
  
        {/* Financial Breakdown */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              backgroundColor: colors.cardBg,
              color: 'white',
              borderRadius: '12px',
              boxShadow: `0 8px 16px -4px rgba(0, 0, 0, 0.3)`,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: `0 12px 24px -6px rgba(0, 172, 193, 0.4)`
              }
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ 
                  mb: 3, 
                  color: colors.info,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Box component="span" sx={{ 
                    width: '8px',
                    height: '24px',
                    backgroundColor: colors.info,
                    borderRadius: '4px'
                  }} />
                  Financial Overview
                </Typography>
                <Stack spacing={3}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        Total Received
                      </Typography>
                      <Typography variant="subtitle2" sx={{ color: colors.success }}>
                        {((totalReceived / totalSanctioned) * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ color: colors.success, fontWeight: 'bold' }}>
                      ₹{totalReceived.toLocaleString()}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(totalReceived / totalSanctioned) * 100} 
                      sx={{ 
                        mt: 1.5, 
                        height: 6, 
                        borderRadius: 3,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3
                        }
                      }}
                      color="success"
                    />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        Total Settled
                      </Typography>
                      <Typography variant="subtitle2" sx={{ color: colors.info }}>
                        {fundUtilization}%
                      </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ color: colors.info, fontWeight: 'bold' }}>
                      ₹{totalSettled.toLocaleString()}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={fundUtilization} 
                      sx={{ 
                        mt: 1.5, 
                        height: 6, 
                        borderRadius: 3,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3
                        }
                      }}
                      color="info"
                    />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        Pending Settlement
                      </Typography>
                      <Typography variant="subtitle2" sx={{ color: colors.warning }}>
                        {((pendingAmount / totalSanctioned) * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ color: colors.warning, fontWeight: 'bold' }}>
                      ₹{pendingAmount.toLocaleString()}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(pendingAmount / totalSanctioned) * 100} 
                      sx={{ 
                        mt: 1.5, 
                        height: 6, 
                        borderRadius: 3,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3
                        }
                      }}
                      color="warning"
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
  
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              backgroundColor: colors.cardBg,
              color: 'white',
              height: '100%',
              borderRadius: '12px',
              boxShadow: `0 8px 16px -4px rgba(0, 0, 0, 0.3)`,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: `0 12px 24px -6px rgba(255, 171, 0, 0.4)`
              }
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ 
                  mb: 3, 
                  color: colors.secondary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
  
                }}>
                  <Box component="span" sx={{ 
                    width: '8px',
                    height: '24px',
                    backgroundColor: colors.secondary,
                    borderRadius: '4px'
                  }} />
                  Top Funded Projects
                </Typography>
                <Stack spacing={3}>
                  {topProjects.map((project, index) => (
                    <Box key={index} sx={{ 
                      p: 2, 
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                      borderLeft: `4px solid ${
                        index === 0 ? colors.secondary : 
                        index === 1 ? colors.info : 
                        colors.success
                      }`
                    }}>
                      <Typography variant="subtitle1" sx={{ 
                        fontWeight: 'bold',
                        mb: 0.5,
                        maxWidth: '300px', // or whatever width you want
                        whiteSpace: 'normal', // allow wrapping
                        overflowWrap: 'break-word'
                    }}>
                        {project.project_title}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: 'rgba(255, 255, 255, 0.7)',
                        mb: 1
                      }}>
                        {project.industry_name}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ 
                          color: colors.secondary,
                          fontWeight: 'bold'
                        }}>
                          ₹{parseInt(project.amount_sanctioned).toLocaleString()}
                        </Typography>
                        <Chip 
                          label={project.project_status} 
                          size="small" 
                          sx={{ 
                            backgroundColor: 
                              project.project_status === 'completed' ? colors.success : 
                              project.project_status === 'ongoing' ? colors.primary : 
                              colors.warning,
                            color: 'white',
                            fontSize: '0.7rem'
                          }} 
                        />
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
  
          {/* Category Breakdowns */}
        <Grid container spacing={3}>
          {/* Projects by Category */}
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              backgroundColor: colors.cardBg,
              color: 'white',
              borderRadius: '12px',
              boxShadow: `0 8px 16px -4px rgba(0, 0, 0, 0.3)`,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: `0 12px 24px -6px rgba(255, 171, 0, 0.4)`
              }
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ 
                  mb: 3, 
                  color: colors.secondary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Box component="span" sx={{ 
                    width: '8px',
                    height: '24px',
                    backgroundColor: colors.secondary,
                    borderRadius: '4px'
                  }} />
                  Projects by Category
                </Typography>
                <Divider sx={{ 
                  my: 1, 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  mb: 2
                }} />
                <Stack spacing={2}>
                  {Object.entries(categories)
                    .sort((a, b) => b[1] - a[1])
                    .map(([category, count]) => (
                      <Box 
                        key={category} 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 1,
                          borderRadius: '4px',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.05)'
                          }
                        }}
                      >
                        <Typography sx={{ 
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontSize: '0.95rem'
                        }}>
                          {category}
                        </Typography>
                        <Chip 
                          label={count} 
                          size="small" 
                          sx={{ 
                            backgroundColor: colors.secondary,
                            color: colors.dark,
                            fontWeight: 'bold',
                            minWidth: '36px'
                          }} 
                        />
                      </Box>
                    ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
  
          {/* Projects by Industry */}
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              backgroundColor: colors.cardBg,
              color: 'white',
              borderRadius: '12px',
              boxShadow: `0 8px 16px -4px rgba(0, 0, 0, 0.3)`,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: `0 12px 24px -6px rgba(0, 172, 193, 0.4)`
              }
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ 
                  mb: 3, 
                  color: colors.info,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Box component="span" sx={{ 
                    width: '8px',
                    height: '24px',
                    backgroundColor: colors.info,
                    borderRadius: '4px'
                  }} />
                  Projects by Industry
                </Typography>
                <Divider sx={{ 
                  my: 1, 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  mb: 2
                }} />
                <Stack spacing={2}>
                  {Object.entries(industries)
                    .sort((a, b) => b[1] - a[1])
                    .map(([industry, count]) => (
                      <Box 
                        key={industry} 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 1,
                          borderRadius: '4px',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.05)'
                          }
                        }}
                      >
                        <Typography sx={{ 
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontSize: '0.95rem'
                        }}>
                          {industry}
                        </Typography>
                        <Chip 
                          label={count} 
                          size="small" 
                          sx={{ 
                            backgroundColor: colors.info,
                            color: colors.dark,
                            fontWeight: 'bold',
                            minWidth: '36px'
                          }} 
                        />
                      </Box>
                    ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
  
          {/* Projects by Academic Year */}
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              backgroundColor: colors.cardBg,
              color: 'white',
              borderRadius: '12px',
              boxShadow: `0 8px 16px -4px rgba(0, 0, 0, 0.3)`,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: `0 12px 24px -6px rgba(76, 175, 80, 0.4)`
              }
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ 
                  mb: 3, 
                  color: colors.success,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Box component="span" sx={{ 
                    width: '8px',
                    height: '24px',
                    backgroundColor: colors.success,
                    borderRadius: '4px'
                  }} />
                  Projects by Year
                </Typography>
                <Divider sx={{ 
                  my: 1, 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  mb: 2
                }} />
                <Stack spacing={2}>
                  {Object.entries(academicYears)
                    .sort((a, b) => b[0].localeCompare(a[0]))
                    .map(([year, count]) => (
                      <Box 
                        key={year} 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 1,
                          borderRadius: '4px',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.05)'
                          }
                        }}
                      >
                        <Typography sx={{ 
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontSize: '0.95rem'
                        }}>
                          {year}
                        </Typography>
                        <Chip 
                          label={count} 
                          size="small" 
                          sx={{ 
                            backgroundColor: colors.success,
                            color: colors.dark,
                            fontWeight: 'bold',
                            minWidth: '36px'
                          }} 
                        />
                      </Box>
                    ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        </Grid>
  
        
      </Box>
      <div style={{ marginTop: "1rem" }}>
                    <button onClick = {() => navigate('/admin-dashboard')}className="redirect-button">
                      <Home size={24} color="#F5A425" />
                    </button>
                  </div>
      </div>
    );
  };
  

export default StatisticsPage;