// src/App.js - Complete Implementation
import React, { useState, useEffect } from 'react';
import './App.css';
import * as api from './api';
import { BookOpen, Users, FileText, BarChart3, Star, Calendar, Search, Download, Menu, X } from 'lucide-react';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('login');
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Rating state
  const [selectedReport, setSelectedReport] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [ratings, setRatings] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    faculty: 'Faculty of ICT',
    className: '',
    week: '',
    date: '',
    courseName: '',
    courseCode: '',
    lecturerName: '',
    present: '',
    registered: '30',
    venue: '',
    time: '',
    topic: '',
    outcomes: '',
    recommendations: ''
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
        setCurrentPage('dashboard');
      } catch (error) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  useEffect(() => {
    if (currentUser && (currentPage === 'dashboard' || currentPage === 'reports')) {
      loadReports();
    }
  }, [currentUser, currentPage]);

  useEffect(() => {
    if (currentUser && currentPage === 'rating') {
      loadRatings();
    }
  }, [currentUser, currentPage]);

  useEffect(() => {
    if (currentUser && currentPage === 'reports') {
      const timeoutId = setTimeout(() => {
        loadReports();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await api.getReports({ search: searchTerm });
      setReports(data);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRatings = async () => {
    try {
      const data = await api.getRatings();
      setRatings(data);
    } catch (error) {
      console.error('Error loading ratings:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    const role = e.target.role.value;

    try {
      setLoading(true);
      const data = await api.login({ email, password, role });
      setCurrentUser(data.user);
      setCurrentPage('dashboard');
    } catch (error) {
      alert(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;
    const name = e.target.name.value;
    const role = e.target.role.value;

    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters!');
      return;
    }

    try {
      setLoading(true);
      await api.register({ email, password, name, role });
      alert('Registration successful! Please login.');
      setShowRegister(false);
    } catch (error) {
      alert(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setCurrentPage('login');
    setReports([]);
    setRatings([]);
  };

  const handleInputChange = React.useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.createReport(formData);
      alert('Report submitted successfully!');
      setCurrentPage('reports');
      setFormData({
        faculty: 'Faculty of ICT',
        className: '',
        week: '',
        date: '',
        courseName: '',
        courseCode: '',
        lecturerName: '',
        present: '',
        registered: '30',
        venue: '',
        time: '',
        topic: '',
        outcomes: '',
        recommendations: ''
      });
      loadReports();
    } catch (error) {
      alert(error.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reportId) => {
    try {
      setLoading(true);
      await api.addFeedback(reportId, { feedback: 'Approved', status: 'approved' });
      alert('Report approved!');
      loadReports();
    } catch (error) {
      alert(error.message || 'Failed to approve report');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (reportId) => {
    try {
      setLoading(true);
      const feedback = prompt('Please provide a reason for rejection:');
      if (feedback) {
        await api.addFeedback(reportId, { feedback, status: 'rejected' });
        alert('Report rejected!');
        loadReports();
      }
    } catch (error) {
      alert(error.message || 'Failed to reject report');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setLoading(true);
      await api.exportToExcel();
    } catch (error) {
      alert(error.message || 'Failed to export');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!selectedReport || rating === 0) {
      alert('Please select a report and provide a rating!');
      return;
    }

    try {
      setLoading(true);
      await api.submitRating({ reportId: selectedReport, rating, comment });
      alert('Rating submitted successfully!');
      setRating(0);
      setComment('');
      setSelectedReport(null);
      loadRatings();
    } catch (error) {
      alert(error.message || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report =>
    (report.course_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (report.course_code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (report.lecturer_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // LOGIN PAGE
  if (!currentUser) {
    if (showRegister) {
      return (
        <div className="login-container">
          <div className="login-box">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-cyan-500 to-purple-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="text-white" size={40} />
              </div>
              <h1 className="text-3xl font-bold mb-2">LUCT</h1>
              <h2>Create New Account</h2>
            </div>
            
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="name" placeholder="John Doe" required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" placeholder="your.email@luct.ac.ls" required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" name="password" placeholder="••••••••" required />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" name="confirmPassword" placeholder="••••••••" required />
              </div>
              <div className="form-group">
                <label>Select Role</label>
                <select name="role" required>
                  <option value="">Choose your role...</option>
                  <option value="student">Student</option>
                  <option value="lecturer">Lecturer</option>
                  <option value="prl">Principal Lecturer</option>
                  <option value="pl">Program Leader</option>
                </select>
              </div>

              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? 'Creating Account...' : 'Register'}
              </button>

              <div className="text-center mt-6">
                <button type="button" onClick={() => setShowRegister(false)} className="text-sm hover:underline" style={{color: 'var(--primary)', background: 'none', padding: 0}}>
                  Already have an account? Login
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    return (
      <div className="login-container">
        <div className="login-box">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-cyan-500 to-purple-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-bold mb-2">LUCT</h1>
            <h2>Faculty Reporting System</h2>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" placeholder="your.email@luct.ac.ls" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" placeholder="••••••••" required />
            </div>
            <div className="form-group">
              <label>Select Role</label>
              <select name="role" required>
                <option value="">Choose your role...</option>
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>
                <option value="prl">Principal Lecturer</option>
                <option value="pl">Program Leader</option>
              </select>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Sign In'}
            </button>

            <div className="text-center mt-6">
              <button type="button" onClick={() => setShowRegister(true)} className="text-sm hover:underline" style={{color: 'var(--primary)', background: 'none', padding: 0}}>
                Register
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
    ...(currentUser.role === 'lecturer' ? [{ id: 'newReport', label: 'New Report', icon: FileText }] : []),
    { id: 'classes', label: 'Classes', icon: Users },
    { id: 'monitoring', label: 'Monitoring', icon: Calendar },
    { id: 'rating', label: 'Rating', icon: Star }
  ];

  const Layout = React.memo(({ children }) => (
    <div className="app-container">
      <nav className="navbar">
        <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{background: 'none', padding: '8px'}}>
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h2>LUCT SYSTEM</h2>
        </div>
        <div className="nav-right">
          <span>{currentUser.role.toUpperCase()}</span>
          <button onClick={handleLogout} className="btn-secondary">Logout</button>
        </div>
      </nav>
      
      <div className="main-content">
        {sidebarOpen && (
          <aside className="sidebar">
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                >
                  <Icon size={20} style={{marginRight: '12px', display: 'inline'}} />
                  {item.label}
                </button>
              );
            })}
          </aside>
        )}
        <main className="content">{children}</main>
      </div>
    </div>
  ));

  // DASHBOARD
  if (currentPage === 'dashboard') {
    return (
      <Layout>
        <h1>Dashboard</h1>
        <div className="stats-container">
          <div className="stat-card blue">
            <h3>{reports.length}</h3>
            <p>Total Reports</p>
          </div>
          <div className="stat-card green">
            <h3>{reports.filter(r => r.status === 'approved').length}</h3>
            <p>Approved</p>
          </div>
          <div className="stat-card yellow">
            <h3>{reports.filter(r => r.status === 'pending').length}</h3>
            <p>Pending</p>
          </div>
          <div className="stat-card red">
            <h3>{reports.filter(r => r.status === 'rejected').length}</h3>
            <p>Rejected</p>
          </div>
        </div>

        <div className="card">
          <h2>Recent Activity</h2>
          {reports.length === 0 ? (
            <p style={{color: 'var(--text-secondary)'}}>No reports yet</p>
          ) : (
            <div>
              {reports.slice(0, 5).map(report => (
                <div key={report.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'var(--card-hover)', borderRadius: '12px', marginBottom: '10px'}}>
                  <div>
                    <p style={{fontWeight: '600', marginBottom: '5px'}}>{report.course_name || 'Unknown'}</p>
                    <p style={{fontSize: '14px', color: 'var(--text-secondary)'}}>{report.lecturer_name || 'N/A'} • {report.date || 'N/A'}</p>
                  </div>
                  <span className={`badge ${report.status || 'pending'}`}>{report.status || 'pending'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Layout>
    );
  }

  // NEW REPORT
  if (currentPage === 'newReport') {
    const NewReportForm = () => (
      <>
        <h1>New Report</h1>
        <div className="card">
          <form onSubmit={handleSubmitReport}>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
              <div className="form-group">
                <label>Faculty Name</label>
                <input type="text" name="faculty" value={formData.faculty} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Class Name</label>
                <select name="className" value={formData.className} onChange={handleInputChange} required>
                  <option value="">Select Class</option>
                  <option value="DIT 1A">DIT 1A</option>
                  <option value="DIT 1B">DIT 1B</option>
                  <option value="DBIT 2A">DBIT 2A</option>
                  <option value="BSc BIT 3A">BSc BIT 3A</option>
                </select>
              </div>
              <div className="form-group">
                <label>Week</label>
                <input type="text" name="week" value={formData.week} onChange={handleInputChange} placeholder="Week 5" required />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Course Name</label>
                <input type="text" name="courseName" value={formData.courseName} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Course Code</label>
                <input type="text" name="courseCode" value={formData.courseCode} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Lecturer Name</label>
                <input type="text" name="lecturerName" value={formData.lecturerName} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Venue</label>
                <input type="text" name="venue" value={formData.venue} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Students Present</label>
                <input type="number" name="present" value={formData.present} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Total Registered</label>
                <input type="number" name="registered" value={formData.registered} readOnly style={{background: 'var(--card-hover)'}} />
              </div>
            </div>
            <div className="form-group">
              <label>Scheduled Time</label>
              <input type="text" name="time" value={formData.time} onChange={handleInputChange} placeholder="08:00 - 10:00" required />
            </div>
            <div className="form-group">
              <label>Topic Taught</label>
              <input type="text" name="topic" value={formData.topic} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Learning Outcomes</label>
              <textarea name="outcomes" value={formData.outcomes} onChange={handleInputChange} rows="3" required />
            </div>
            <div className="form-group">
              <label>Recommendations</label>
              <textarea name="recommendations" value={formData.recommendations} onChange={handleInputChange} rows="3" required />
            </div>
            <div style={{display: 'flex', gap: '15px', marginTop: '30px'}}>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
              <button type="button" onClick={() => setCurrentPage('reports')} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      </>
    );

    return <Layout><NewReportForm /></Layout>;
  }

  // REPORTS
  if (currentPage === 'reports') {
    return (
      <Layout>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px'}}>
          <h1 style={{margin: 0}}>Reports</h1>
          <div style={{display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap'}}>
            <div style={{position: 'relative'}}>
              <Search style={{position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)'}} size={20} />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                style={{paddingLeft: '45px'}}
              />
            </div>
            <button onClick={handleExportExcel} className="btn-success" disabled={loading}>
              <Download size={18} style={{marginRight: '8px', display: 'inline'}} />
              Export
            </button>
            {currentUser.role === 'lecturer' && (
              <button onClick={() => setCurrentPage('newReport')} className="btn-primary">New Report</button>
            )}
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <div className="card">
            <p style={{color: 'var(--text-secondary)'}}>No reports found</p>
          </div>
        ) : (
          filteredReports.map(report => (
            <div key={report.id} className="card report-card">
              <div className="report-header">
                <div>
                  <h3>{report.course_name}</h3>
                  <p>{report.course_code} • {report.class_name}</p>
                </div>
                <span className={`badge ${report.status}`}>{report.status}</span>
              </div>
              <div className="report-details">
                <div className="detail-item"><strong>Week</strong> {report.week}</div>
                <div className="detail-item"><strong>Date</strong> {report.date}</div>
                <div className="detail-item"><strong>Attendance</strong> {report.students_present}/{report.students_registered}</div>
                <div className="detail-item"><strong>Venue</strong> {report.venue}</div>
              </div>
              <div className="report-content">
                <p><strong>Topic:</strong> {report.topic}</p>
                <p><strong>Outcomes:</strong> {report.learning_outcomes}</p>
                <p><strong>Recommendations:</strong> {report.recommendations}</p>
              </div>
              {currentUser.role === 'prl' && report.status === 'pending' && (
                <div style={{display: 'flex', gap: '10px', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--border)'}}>
                  <button onClick={() => handleApprove(report.id)} className="btn-success" disabled={loading}>Approve</button>
                  <button onClick={() => handleReject(report.id)} className="btn-danger" disabled={loading}>Reject</button>
                </div>
              )}
            </div>
          ))
        )}
      </Layout>
    );
  }

  // CLASSES
  if (currentPage === 'classes') {
    const classes = [
      { id: 1, name: 'DIT 1A', program: 'DIT', students: 30, lecturer: 'Mr. Thokoana Tsekiso', room: 'MM5' },
      { id: 2, name: 'DIT 1B', program: 'DIT', students: 28, lecturer: 'Mr. Teboho Talasi', room: 'MM4' },
    ];

    return (
      <Layout>
        <h1>Classes</h1>
        <div className="stats-container">
          <div className="stat-card blue">
            <h3>{classes.length}</h3>
            <p>Total Classes</p>
          </div>
          <div className="stat-card green">
            <h3>{classes.reduce((sum, c) => sum + c.students, 0)}</h3>
            <p>Total Students</p>
          </div>
          <div className="stat-card yellow">
            <h3>{Math.round(classes.reduce((sum, c) => sum + c.students, 0) / classes.length)}</h3>
            <p>Avg Class Size</p>
          </div>
        </div>

        <div className="classes-grid">
          {classes.map(cls => (
            <div key={cls.id} className="class-card">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                <h3 style={{margin: 0}}>{cls.name}</h3>
                <span className="badge pending">{cls.program}</span>
              </div>
              <p style={{marginBottom: '10px', color: 'var(--text-secondary)'}}>👨‍🏫 {cls.lecturer}</p>
              <p style={{marginBottom: '10px', color: 'var(--text-secondary)'}}>👥 {cls.students} Students</p>
              <p style={{marginBottom: '15px', color: 'var(--text-secondary)'}}>🏫 {cls.room}</p>
              <button className="btn-primary" style={{width: '100%'}}>View Details</button>
            </div>
          ))}
        </div>
      </Layout>
    );
  }

  // MONITORING
  if (currentPage === 'monitoring') {
    const activities = [
      { id: 1, user: 'Mr. Thokoana Tsekiso', action: 'Created Report', course: 'Web Application', time: '2 hours ago', type: 'create' },
      { id: 2, user: 'Mr. Teboho Talasi', action: 'Approved Report', course: 'Java OOP', time: '3 hours ago', type: 'approve' },
    ];

    const getIcon = (type) => {
      switch(type) {
        case 'create': return '📝';
        case 'approve': return '✅';
        case 'reject': return '❌';
        case 'feedback': return '💬';
        case 'rating': return '⭐';
        default: return '📋';
      }
    };

    return (
      <Layout>
        <h1>Activity Monitoring</h1>
        <div className="stats-container">
          <div className="stat-card blue">
            <h3>{activities.length}</h3>
            <p>Total Activities</p>
          </div>
          <div className="stat-card green">
            <h3>{activities.filter(a => a.type === 'approve').length}</h3>
            <p>Approvals</p>
          </div>
          <div className="stat-card yellow">
            <h3>{activities.filter(a => a.type === 'create').length}</h3>
            <p>New Reports</p>
          </div>
          <div className="stat-card red">
            <h3>{activities.filter(a => a.type === 'rating').length}</h3>
            <p>Ratings</p>
          </div>
        </div>

        <div className="card">
          <h2>Recent Activity</h2>
          {activities.map(activity => (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon">{getIcon(activity.type)}</div>
              <div style={{flex: 1}}>
                <h4 style={{margin: '0 0 5px 0'}}>{activity.user}</h4>
                <p style={{margin: '0 0 5px 0', color: 'var(--text-secondary)'}}><strong>{activity.action}</strong> - {activity.course}</p>
                <span style={{fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic'}}>{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </Layout>
    );
  }

  // RATING
  if (currentPage === 'rating') {
    const averageRating = ratings.length > 0 
      ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
      : 0;

    return (
      <Layout>
        <h1>Lecture Ratings</h1>
        <div className="stats-container">
          <div className="stat-card yellow">
            <h3>{averageRating} ⭐</h3>
            <p>Average Rating</p>
          </div>
          <div className="stat-card blue">
            <h3>{ratings.length}</h3>
            <p>Total Ratings</p>
          </div>
          <div className="stat-card green">
            <h3>{ratings.filter(r => r.rating >= 4).length}</h3>
            <p>Positive</p>
          </div>
          <div className="stat-card red">
            <h3>{reports.length}</h3>
            <p>Reports</p>
          </div>
        </div>

        <div className="card">
          <h2>Submit Rating</h2>
          <div className="form-group">
            <label>Select Report</label>
            <select value={selectedReport || ''} onChange={(e) => setSelectedReport(e.target.value)}>
              <option value="">Choose a report...</option>
              {reports.map(report => (
                <option key={report.id} value={report.id}>
                  {report.course_name} - {report.week} ({report.date})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Your Rating</label>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  className={`star ${rating >= star ? 'filled' : ''}`}
                  onClick={() => setRating(star)}
                  style={{fontSize: '36px', cursor: 'pointer', color: rating >= star ? 'var(--warning)' : 'var(--border)'}}
                >
                  ★
                </span>
              ))}
              <span style={{marginLeft: '10px', fontSize: '18px', color: 'var(--text-secondary)'}}>
                {rating > 0 ? `${rating} / 5` : 'Click to rate'}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label>Comment (Optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="3"
              placeholder="Share your feedback..."
            />
          </div>

          <button onClick={handleSubmitRating} className="btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>

        <div className="card">
          <h2>All Ratings</h2>
          {ratings.length === 0 ? (
            <p style={{color: 'var(--text-secondary)'}}>No ratings yet</p>
          ) : (
            <div>
              {ratings.map(r => {
                const report = reports.find(rep => rep.id == r.report_id);
                return (
                  <div key={r.id} style={{padding: '20px', background: 'var(--card-hover)', borderRadius: '12px', marginBottom: '15px', borderLeft: '4px solid var(--warning)'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px'}}>
                      <div>
                        <h4 style={{margin: '0 0 5px 0'}}>{report ? report.course_name : r.course_name || 'Unknown Course'}</h4>
                        <p style={{margin: 0, fontSize: '14px', color: 'var(--text-secondary)'}}>by {r.user_name || r.user || 'Anonymous'}</p>
                      </div>
                      <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <span style={{fontSize: '20px', color: 'var(--warning)'}}>
                          {'★'.repeat(Math.floor(r.rating))}{'☆'.repeat(5 - Math.floor(r.rating))}
                        </span>
                        <span style={{color: 'var(--text-secondary)'}}>{r.rating}/5</span>
                      </div>
                    </div>
                    {r.comment && (
                      <p style={{margin: '15px 0 10px 0', padding: '10px', background: 'var(--card-bg)', borderRadius: '8px', fontStyle: 'italic', color: 'var(--text-secondary)'}}>
                        {r.comment}
                      </p>
                    )}
                    <span style={{fontSize: '12px', color: 'var(--text-secondary)'}}>
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1>{currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}</h1>
      <div className="card">
        <p style={{color: 'var(--text-secondary)'}}>This page is under development.</p>
      </div>
    </Layout>
  );
}

export default App;