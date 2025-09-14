import './pageStyles.css';
import React, { useState, useRef } from 'react';
import Input from '../components/Input';
import Select from '../components/Select';
import { TextArea } from '../components/TextArea';
import { Factory,TextCursorInput, CalendarDays,CalendarArrowDown,FolderGit2,Shapes,FileText,Home, User,Building2, Mail, Phone
  ,IndianRupee,Banknote,
  File,
  IdCard
 } from 'lucide-react';
import FormInput from '../components/FormInput';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';


const ProjectForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const {user} = useAuthStore();
  const [formData, setFormData] = useState({
    industry_name: '',
    project_title: '',
    start_date: '',
    end_date: '',
    academic_year: '',
    project_status: '',
    project_category: '',
    project_summary: '',
    settlement_proof : null,
    
    // Step 2
    pi_name: user?.name || '',
    pi_department: user?.department || '',
    pi_email: user?.email || '',
    pi_phone: user?.mobile || '',
    co_pi_name: '',
    co_pi_department : '',
    co_pi_email : '',
    co_pi_phone : '',
    
    // Step 3
    amount_sanctioned: '',
    amount_received: '',
    settlement_status: '',
    amount_settled: '',
    proof_upload: null,
    students: [{ name: '', id: '', department: '' }]
  });
  
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  // Handle Co-PI changes


  // Handle student changes
  const handleStudentChange = (index, e) => {
    const { name, value } = e.target;
    const updatedStudents = [...formData.students];
    updatedStudents[index] = {
      ...updatedStudents[index],
      [name]: value
    };
    setFormData(prev => ({
      ...prev,
      students: updatedStudents
    }));
  };

  // Add new student
  const addStudent = () => {
    setFormData(prev => ({
      ...prev,
      students: [...prev.students, { name: '', id: '', department: '' }]
    }));
  };

  // Remove student
  const removeStudent = (index) => {
    const updatedStudents = [...formData.students];
    updatedStudents.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      students: updatedStudents
    }));
  };

  // Navigation functions
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  // Validation functions
  const validateStep = (step) => {
    const newErrors = {};
    let isValid = true;

    if (step === 1) {
      if (!formData.industry_name.trim()) {
        newErrors.industry_name = 'Industry name is required';
        isValid = false;
      }
      if (!formData.project_title.trim()) {
        newErrors.project_title = 'Project title is required';
        isValid = false;
      }
      if (!formData.start_date) {
        newErrors.start_date = 'Start date is required';
        isValid = false;
      }
      if (!formData.end_date) {
        newErrors.end_date = 'End date is required';
        isValid = false;
      } else if (formData.start_date && new Date(formData.start_date) > new Date(formData.end_date)) {
        newErrors.end_date = 'End date must be after start date';
        isValid = false;
      }
      if (!formData.academic_year) {
        newErrors.academic_year = 'Academic year is required';
        isValid = false;
      }
      if (!formData.project_status) {
        newErrors.project_status = 'Project status is required';
        isValid = false;
      }
      if (!formData.project_category.trim()) {
        newErrors.project_category = 'Project category is required';
        isValid = false;
      }

      if (!formData.settlement_proof) {
        newErrors.proof_upload = 'Signed Agreement is required ';
        isValid = false;
      } else if (formData.settlement_proof && !formData.settlement_proof.name.endsWith('.pdf')) {
        newErrors.proof_upload = 'Only PDF files are allowed';
        isValid = false;
      }
      if (!formData.project_summary.trim()) {
        newErrors.project_summary = 'Project summary is required';
        isValid = false;
      } else if (formData.project_summary.trim().split(/\s+/).length > 100) {
        newErrors.project_summary = 'Summary should be 100 words or less';
        isValid = false;
      }
    } else if (step === 2) {
      if (!formData.pi_name.trim()) {
        newErrors.pi_name = 'PI name is required';
        isValid = false;
      }
      if (!formData.pi_department.trim()) {
        newErrors.pi_department = 'PI department is required';
        isValid = false;
      }
      if (!formData.pi_email.trim()) {
        newErrors.pi_email = 'PI email is required';
        isValid = false;
      } else if (!validateEmail(formData.pi_email)) {
        newErrors.pi_email = 'Please enter a valid email';
        isValid = false;
      }
      if (!formData.pi_phone) {
        newErrors.pi_phone = 'PI phone is required';
        isValid = false;
      } else if (!validatePhone(formData.pi_phone)) {
        newErrors.pi_phone = 'Please enter a valid phone number';
        isValid = false;
      }
      if (!formData.co_pi_name.trim()) {
        newErrors.co_pi_name = 'Co-PI name is required';
        isValid = false;
      }
      if (!formData.co_pi_department.trim()) {
        newErrors.co_pi_department = 'Co-PI department is required';
        isValid = false;
      }
      if (!formData.co_pi_email.trim()) {
        newErrors.co_pi_email = 'Co-PI email is required';
        isValid = false;
      } else if (!validateEmail(formData.co_pi_email)) {
        newErrors.co_pi_email = 'Please enter a valid email';
        isValid = false;
      }
      if (!formData.co_pi_phone.trim()) {
        newErrors.co_pi_phone = 'Co_PI phone is required';
        isValid = false;
      } else if (!validatePhone(formData.co_pi_phone)) {
        newErrors.co_pi_phone = 'Please enter a valid phone number';
        isValid = false;
      }
    } else if (step === 3) {
      if (!formData.amount_sanctioned) {
        newErrors.amount_sanctioned = 'Amount sanctioned is required';
        isValid = false;
      } else if (parseFloat(formData.amount_sanctioned) < 0) {
        newErrors.amount_sanctioned = 'Amount cannot be negative';
        isValid = false;
      }
      if (!formData.amount_received) {
        newErrors.amount_received = 'Amount received is required';
        isValid = false;
      } else if (parseFloat(formData.amount_received) < 0) {
        newErrors.amount_received = 'Amount cannot be negative';
        isValid = false;
      } else if (parseFloat(formData.amount_received) > parseFloat(formData.amount_sanctioned)) {
        newErrors.amount_received = 'Cannot receive more than sanctioned amount';
        isValid = false;
      }
      if (!formData.settlement_status) {
        newErrors.settlement_status = 'Settlement status is required';
        isValid = false;
      }
      if (formData.settlement_status === 'partial' || formData.settlement_status === 'complete') {
        if (!formData.amount_settled) {
          newErrors.amount_settled = 'Amount settled is required for this status';
          isValid = false;
        } else if (parseFloat(formData.amount_settled) < 0) {
          newErrors.amount_settled = 'Amount cannot be negative';
          isValid = false;
        } else if (formData.settlement_status === 'complete' && 
                  parseFloat(formData.amount_settled) !== parseFloat(formData.amount_received)) {
          newErrors.amount_settled = 'Complete settlement requires full amount';
          isValid = false;
        }
      }
      if (formData.settlement_status !== 'pending' && !formData.proof_upload) {
        newErrors.proof_upload = 'Proof of settlement is required for this status';
        isValid = false;
      } else if (formData.proof_upload && !formData.proof_upload.name.endsWith('.pdf')) {
        newErrors.proof_upload = 'Only PDF files are allowed';
        isValid = false;
      }
    } else if (step === 4) {
      formData.students.forEach((student, index) => {
        if (!student.name.trim()) {
          newErrors[`student_name_${index}`] = 'Student name is required';
          isValid = false;
        }
        if (!student.id.trim()) {
          newErrors[`student_id_${index}`] = 'Student ID is required';
          isValid = false;
        }
        if (!student.department.trim()) {
          newErrors[`student_department_${index}`] = 'Department is required';
          isValid = false;
        }
      });
    }

    setErrors(newErrors);
    return isValid;
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    const re = /^[0-9]{10,15}$/;
    return re.test(phone);
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(4)) return;
    
    try {
      const formDataToSend = new FormData();
      
      // Append all form data to FormData object
      formDataToSend.append('industry_name', formData.industry_name);
      formDataToSend.append('project_title', formData.project_title);
      formDataToSend.append('start_date', formData.start_date);
      formDataToSend.append('end_date', formData.end_date);
      formDataToSend.append('academic_year', formData.academic_year);
      formDataToSend.append('project_status', formData.project_status);
      formDataToSend.append('project_category', formData.project_category);
      formDataToSend.append('project_summary', formData.project_summary);
      formDataToSend.append('pi_name', formData.pi_name);
      formDataToSend.append('pi_department', formData.pi_department);
      formDataToSend.append('pi_email', formData.pi_email);
      formDataToSend.append('pi_phone', formData.pi_phone);
      
      // Handle Co-PIs (convert array to JSON string)
      formDataToSend.append('co_pi_name',formData.co_pi_name );
      formDataToSend.append('co_pi_department', formData.co_pi_department);
      formDataToSend.append('co_pi_email', formData.co_pi_email);
      formDataToSend.append('co_pi_phone', formData.co_pi_phone);
      
      // Financial details
      formDataToSend.append('amount_sanctioned', formData.amount_sanctioned);
      formDataToSend.append('amount_received', formData.amount_received);
      formDataToSend.append('settlement_status', formData.settlement_status);
      formDataToSend.append('amount_settled', formData.amount_settled);
      
      // Student details (convert array to JSON string)
      formDataToSend.append('student_details', JSON.stringify(formData.students));
      
      // Append file if exists
      if (formData.proof_upload) {
        formDataToSend.append('proof_upload', formData.proof_upload);
      }
      if (formData.settlement_proof) {
        formDataToSend.append('settlement_proof', formData.settlement_proof);
      }
      
      
      const response = await fetch('http://localhost:5000/api/submit-form', {
        method: 'POST',
        body: formDataToSend
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('Project submitted successfully!');
        // Reset form
        setFormData({
          industry_name: '',
          project_title: '',
          start_date: '',
          end_date: '',
          academic_year: '',
          project_status: '',
          project_category: '',
          settlement_proof : null,
          project_summary: '',
          pi_name: user?.name || '',
          pi_department: user?.department || '',
          pi_email: user?.email || '',
          pi_phone: user?.mobile || '',
          co_pi_name: '',
          co_pi_department : '',
          co_pi_email : '',
          co_pi_phone : '',
          amount_sanctioned: '',
          amount_received: '',
          settlement_status: '',
          amount_settled: '',
          proof_upload: null,
          students: [{ name: '', id: '', department: '' }]
        });
        setCurrentStep(1);
        setErrors({});
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error(result.error || 'Submission failed');
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className='main-container'>
      <h3 className='header-text'>ENTER PROJECT DETAILS</h3>
          {/* Step Indicator */}
          <div className="step-indicator">
            {[1, 2, 3, 4].map(step => (
              <div 
                key={step}
                className={`step ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
              >
                {step}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Project Info */}
            <div className={`form-step ${currentStep === 1 ? 'active' : ''}`} id="step1">
              <div className="form-section">
                <h3>BASIC PROJECT INFORMATION</h3>
                <div className="row">
                  <div className="col">
                    <FormInput
                        icon={Factory}
                        type="text"
                        id="industry_name"
                        name="industry_name"
                        placeholder="Industry Name"
                        value={formData.industry_name}
                        onChange={handleChange}
                        required
                    />
                    {errors.industry_name && <div className="error-text">{errors.industry_name}</div>}
                  </div>
                  <div className="col">
                    <FormInput
                        icon={TextCursorInput}
                        type="text"
                        id="project_title"
                        name="project_title"
                        placeholder="Project Title"
                        value={formData.project_title}
                        onChange={handleChange}
                        required
                      />
                    {errors.project_title && <div className="error-text">{errors.project_title}</div>}
                  </div>
                </div>
                
                <div className="row">
                  <div className="col">
                    <FormInput
                      icon={CalendarDays}
                      type="date"
                      id="start_date"
                      name="start_date"
                      placeholder="Start Date"
                      value={formData.start_date}
                      onChange={handleChange}
                      required
                    />
                    {errors.start_date && <div className="error-text">{errors.start_date}</div>}
                  </div>
                  <div className="col">
                    <FormInput
                      icon={CalendarDays}
                      type="date"
                      id="end_date"
                      name="end_date"
                      placeholder="End Date"
                      value={formData.end_date}
                      onChange={handleChange}
                      required
                    />
                    {errors.end_date && <div className="error-text">{errors.end_date}</div>}
                  </div>
                </div>
                
                <div className="row">
                  <div className="col">
                    <Select
                        icon={CalendarArrowDown}
                        id="academic_year"
                        name="academic_year"
                        value={formData.academic_year}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Academic Year</option>
                        <option value="2025-2026">2025-2026</option>
                        <option value="2024-2025">2024-2025</option>
                        <option value="2023-2024">2023-2024</option>
                        <option value="2022-2023">2022-2023</option>
                        <option value="2021-2022">2021-2022</option>
                        <option value="2020-2021">2020-2021</option>
                      </Select>
                    {errors.academic_year && <div className="error-text">{errors.academic_year}</div>}
                  </div>
                  <div className="col">
                  <Select
                      icon={FolderGit2}
                      id="project_status"
                      name="project_status"
                      value={formData.project_status}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Status</option>
                      <option value="new">New</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                    </Select>
                    {errors.project_status && <div className="error-text">{errors.project_status}</div>}
                  </div>
                </div>
                
                <div className="row">
                  <div className="col">
                    
                  <FormInput
                      icon={Shapes}
                      type="text"
                      id="project_category"
                      name="project_category"
                      placeholder="Project Category"
                      value={formData.project_category}
                      onChange={handleChange}
                      required
                    />
                    {errors.project_category && <div className="error-text">{errors.project_category}</div>}
                  </div>
                  <div className="col">
                    <FormInput 
                      icon = {File}
                      type="file" 
                      id="settlement_proof" 
                      name="settlement_proof" 
                      accept=".pdf" 
                      className="file-input"
                      onChange={handleChange}
                      ref={fileInputRef}
                    />
                    {errors.settlement_proof && <div className="error-text">{errors.settlement_proof}</div>}
                  </div>
                </div>
                
                <div className="row">
                  <div className="col">
                   
                  <TextArea
                      icon={FileText}
                      id="project_summary"
                      name="project_summary"
                      placeholder="Project Summary"
                      maxLength={1000}
                      value={formData.project_summary}
                      onChange={handleChange}
                      required
                    />
                    {errors.project_summary && <div className="error-text">{errors.project_summary}</div>}
                  </div>
                </div>
              </div>
              
              <div className="btn-group">
                <div></div>
                <button type="button" className="btn" onClick={nextStep}>Next</button>
              </div>
            </div>

            {/* Step 2: Investigator Information */}
            <div className={`form-step ${currentStep === 2 ? 'active' : ''}`} id="step2">
              <div className="form-section">
                <h3>PRINCIPAL INVESTIGATOR</h3>
                <div className="row">
                  <div className="col">
                    <FormInput
                      icon={User}
                      type="text"
                      id="pi_name"
                      name="pi_name"
                      placeholder= {user.name}
                      value={user.name}
                      onChange={handleChange}
                      required
                    />
                    {errors.pi_name && <div className="error-text">{errors.pi_name}</div>}
                  </div>
                  <div className="col">
                    <FormInput
                      icon={Building2}
                      type="text"
                      id="pi_department"
                      name="pi_department"
                      placeholder={user.department}
                      value={user.department}
                      onChange={handleChange}
                      required
                    />
                    {errors.pi_department && <div className="error-text">{errors.pi_department}</div>}
                  </div>
                </div>
                
                <div className="row">
                  <div className="col">
                  <FormInput
                    icon={Mail}
                    type="email"
                    id="pi_email"
                    name="pi_email"
                    placeholder={user.email}
                    value={user.email}
                    onChange={handleChange}
                    required
                  />

                    {errors.pi_email && <div className="error-text">{errors.pi_email}</div>}
                  </div>
                  <div className="col">
                    
                    <FormInput
                        icon={Phone}
                        type="tel"
                        id="pi_phone"
                        name="pi_phone"
                        placeholder={user.mobile}
                        value={user.mobile}
                        onChange={handleChange}
                        required
                      />
                    {errors.pi_phone && <div className="error-text">{errors.pi_phone}</div>}
                  </div>
                </div>
              </div>
              
              <div className="form-section">
                <h3>CO-PRINCIPAL INVESTIGATOR</h3>
                <div className="row">
                  <div className="col">
                    <FormInput
                      icon={User}
                      type="text"
                      id="co_pi_name"
                      name="co_pi_name"
                      placeholder="Co-PI Name"
                      value={formData.co_pi_name || ""}
                      onChange={handleChange}
                      required
                    />
                    {errors.co_pi_name && <div className="error-text">{errors.co_pi_name}</div>}
                  </div>
                  <div className="col">
                    <FormInput
                      icon={Building2}
                      type="text"
                      id="co_pi_department"
                      name="co_pi_department"
                      placeholder="Co-PI Department"
                      value={formData.co_pi_department || ""}
                      onChange={handleChange}
                      required
                    />
                    {errors.co_pi_department && <div className="error-text">{errors.co_pi_department}</div>}
                  </div>
                </div>

                <div className="row">
                  <div className="col">
                    <FormInput
                      icon={Mail}
                      type="email"
                      id="co_pi_email"
                      name="co_pi_email"
                      placeholder="Co-PI Email"
                      value={formData.co_pi_email || ""}
                      onChange= {handleChange}
                      required
                    />
                    {errors.co_pi_email && <div className="error-text">{errors.co_pi_email}</div>}
                  </div>
                  <div className="col">
                    <FormInput
                      icon={Phone}
                      type="tel"
                      id="co_pi_phone"
                      name="co_pi_phone"
                      placeholder="Co-PI Phone"
                      value={formData.co_pi_phone|| ""}
                      onChange={handleChange}
                      required
                    />
                    {errors.co_pi_phone && <div className="error-text">{errors.co_pi_phone}</div>}
                  </div>
                </div>
              </div>
              
              <div className="btn-group">
                <button type="button" className="btn btn-secondary" onClick={prevStep}>Previous</button>
                <button type="button" className="btn" onClick={nextStep}>Next</button>
              </div>
            </div>

            {/* Step 3: Financial Details */}
            <div className={`form-step ${currentStep === 3 ? 'active' : ''}`} id="step3">
              <div className="form-section">
                <h3>FINANCIAL INFORMATION</h3>
                <div className="row">
                  <div className="col">
                    <FormInput
                      icon={IndianRupee}
                      type="number"
                      id="amount_sanctioned"
                      name="amount_sanctioned"
                      min="0"
                      step="0.01"
                      placeholder="Amount Sanctioned"
                      value={formData.amount_sanctioned}
                      onChange={handleChange}
                      required
                    />

                    {errors.amount_sanctioned && <div className="error-text">{errors.amount_sanctioned}</div>}
                  </div>
                  <div className="col">
                    <FormInput
                      icon={IndianRupee}
                      type="number"
                      id="amount_received"
                      name="amount_received"
                      min="0"
                      step="0.01"
                      placeholder="Amount Received"
                      value={formData.amount_received}
                      onChange={handleChange}
                      required
                    />
                    {errors.amount_received && <div className="error-text">{errors.amount_received}</div>}
                  </div>
                </div>
                
                <div className="row">
                  <div className="col">
                  <Select
                    icon={Banknote}
                    id="settlement_status"
                    name="settlement_status"
                    value={formData.settlement_status}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="pending">Pending</option>
                    <option value="partial">Partial</option>
                    <option value="complete">Complete</option>
                  </Select>
                    {errors.settlement_status && <div className="error-text">{errors.settlement_status}</div>}
                  </div>
                  <div className="col">
                  <FormInput
                    icon={IndianRupee}
                    type="number"
                    id="amount_settled"
                    name="amount_settled"
                    min="0"
                    step="0.01"
                    placeholder="Amount Settled (₹)"
                    value={formData.amount_settled}
                    onChange={handleChange}
                  />
                    {errors.amount_settled && <div className="error-text">{errors.amount_settled}</div>}
                  </div>
                </div>
                
                <div className="row">
                  <div className="col">
                    <FormInput 
                      icon = {File}
                      type="file" 
                      id="proof_upload" 
                      name="proof_upload" 
                      accept=".pdf" 
                      className="file-input"
                      onChange={handleChange}
                      ref={fileInputRef}
                    />
                    {errors.proof_upload && <div className="error-text">{errors.proof_upload}</div>}
                  </div>
                </div>
              </div>
              
              <div className="btn-group">
                <button type="button" className="btn btn-secondary" onClick={prevStep}>Previous</button>
                <button type="button" className="btn" onClick={nextStep}>Next</button>
              </div>
            </div>

            {/* Step 4: Student Details */}
            <div className={`form-step ${currentStep === 4 ? 'active' : ''}`} id="step4">
              <div className="form-section">
                <h3>STUDENT DETAILS</h3>
                {formData.students.map((student, index) => (
                  <div key={index} className="row-2">
                    <FormInput
                        icon={User}  // You can pass an icon if required
                        type="text"
                        name="name"
                        placeholder="Student Name"
                        value={student.name}
                        onChange={(e) => handleStudentChange(index, e)}
                        required
                      />
                    <FormInput
                      icon={IdCard}  
                      type="text"
                      name="id"
                      placeholder="Student ID"
                      value={student.id}
                      onChange={(e) => handleStudentChange(index, e)}
                      required
                    />
                    <FormInput
                      icon = {Building2} 
                      type="text" 
                      name="department"
                      placeholder="Department" 
                      value={student.department}
                      onChange={(e) => handleStudentChange(index, e)}
                      required 
                    />
                    {index > 0 && (
                      <button 
                        type="button" 
                        className="remove-btn" 
                        onClick={() => removeStudent(index)}
                      >
                        Remove Student
                      </button>
                    )}
                    {errors[`student_name_${index}`] && <div className="error-text">{errors[`student_name_${index}`]}</div>}
                    {errors[`student_id_${index}`] && <div className="error-text">{errors[`student_id_${index}`]}</div>}
                    {errors[`student_department_${index}`] && <div className="error-text">{errors[`student_department_${index}`]}</div>}
                  </div>
                ))}
                <button type="button" className="add-btn" onClick={addStudent}>
                  ➕ ADD STUDENT
                </button>
              </div>
              
              <div className="btn-group">
                <button type="button" className="btn btn-secondary" onClick={prevStep}>Previous</button>
                <button type="submit" className="btn btn-success">Submit</button>
              </div>
            </div>
          </form>

          <div style={{ marginTop: "1rem" }}>
                    <button onClick = {() => navigate('/faculty-dashboard')}className="redirect-button">
                      <Home size={24} color="#F5A425" />
                    </button>
                  </div>
        </div>
  );
};

export default ProjectForm;