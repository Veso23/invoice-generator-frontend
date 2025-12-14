import React, { useState, useEffect } from 'react';
import { FileText, Download, Plus, Edit, Calculator, Users, Building, LogOut, Eye, Send, CheckCircle, AlertCircle } from 'lucide-react';
import './App.css';


// API Configuration
const API_BASE_URL = 'https://invoice-generator-api-dak7.onrender.com/api';

// API Helper Functions
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 403 && data.error === 'Invalid token') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        window.location.reload(); // Force re-login
        throw new Error('Session expired. Please log in again.');
      }
      
      throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Authentication Hook
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('userData', JSON.stringify(response.user));
    setUser(response.user);
    return response;
  };

  const register = async (email, password, firstName, lastName, companyName) => {
    const response = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, firstName, lastName, companyName }),
    });
    
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('userData', JSON.stringify(response.user));
    setUser(response.user);
    return response;
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
  };

  return { user, login, register, logout, loading };
};

// Login Component
const LoginForm = ({ onLogin, onRegister }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    companyName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await onLogin(formData.email, formData.password);
      } else {
        await onRegister(
          formData.email, 
          formData.password, 
          formData.firstName, 
          formData.lastName, 
          formData.companyName
        );
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Invoice Generator</h1>
          <p className="text-gray-600 mt-2">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
              <input
                type="text"
                name="companyName"
                placeholder="Company Name"
                value={formData.companyName}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </>
          )}
          
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
          
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:text-blue-800 font-medium transition"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Loading Component
const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

// Notification Component
const Notification = ({ notification, onClose }) => {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
      notification.type === 'error' 
        ? 'bg-red-500 text-white' 
        : 'bg-green-500 text-white'
    }`}>
      <div className="flex items-start">
        {notification.type === 'success' ? (
          <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-2 flex-shrink-0 text-white hover:text-gray-200 transition"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Simple Form Modal Component
const SimpleModal = ({ isOpen, onClose, title, onSubmit, fields }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
  if (isOpen) {
    const initialData = {};
    fields.forEach(field => {
      // ✅ Initialize checkboxes as false, everything else as empty string
      initialData[field.name] = field.type === 'checkbox' ? false : '';
    });
    setFormData(initialData);
  }
}, [isOpen, fields]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;
const renderField = (field) => {
  if (field.type === 'checkbox') {
    return (
      <div key={field.name} style={{ marginBottom: '15px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={formData[field.name] || false}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.checked })}
          />
          {field.label}
        </label>
      </div>
    );
  }



  if (field.type === 'select') {
    return (
      <div key={field.name} style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          {field.label || field.placeholder}:
        </label>
        <select
          value={formData[field.name] || ''}
          onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
          required={field.required !== false}
          style={{ 
            width: '100%', 
            padding: '8px',
            cursor: 'pointer'
          }}
        >
          <option value="">Select {field.label || field.placeholder}</option>
          {field.options?.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Dynamically disable VAT rate input if VAT is not enabled
  const isDisabled = 
  (field.name === 'vatRate' && !formData.vatEnabled) ||
  (field.name === 'consultantVatRate' && !formData.consultantVatEnabled);

  return (
    <div key={field.name} style={{ marginBottom: '15px' }}>
      {field.label && (
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          {field.label}:
        </label>
      )}
      <input
        type={field.type || 'text'}
        placeholder={field.placeholder}
        value={formData[field.name] || ''}
        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
        disabled={isDisabled}
        required={field.required !== false}
        step={field.step}
        style={{ 
          width: '100%', 
          padding: '8px',
          opacity: isDisabled ? 0.6 : 1,
          cursor: isDisabled ? 'not-allowed' : 'text',
          backgroundColor: isDisabled ? '#f5f5f5' : 'white'
        }}
      />
    </div>
  );
};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(field => renderField(field))}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Change Password Modal Component
const ChangePasswordModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    
    onSubmit({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Change Password</h3>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={() => {
                setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setError('');
                onClose();
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Change Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Settings Modal Component
const SettingsModal = ({ isOpen, onClose, settings, onSubmit }) => {
  const [activeSettingsTab, setActiveSettingsTab] = useState('company');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    representative_name: '',
    timesheet_deadline_day: 15,
    company_vat: '',
    company_email: '',
    default_vat_rate: 21.00,
    bank_name: '',
    bank_iban: '',
    bank_swift: '',
    bank_address: '',
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    smtp_from_email: '',
    smtp_from_name: '',
    smtp_secure: true
  });

  useEffect(() => {
    if (isOpen && settings) {
      setFormData({
        name: settings.name || '',
        address: settings.address || '',
        representative_name: settings.representative_name || '',
        timesheet_deadline_day: settings.timesheet_deadline_day || 15,
        company_vat: settings.company_vat || '',
        company_email: settings.company_email || '',
        default_vat_rate: settings.default_vat_rate || 21.00,
        bank_name: settings.bank_name || '',
        bank_iban: settings.bank_iban || '',
        bank_swift: settings.bank_swift || '',
        bank_address: settings.bank_address || '',
        smtp_host: settings.smtp_host || '',
        smtp_port: settings.smtp_port || 587,
        smtp_username: settings.smtp_username || '',
        smtp_password: settings.smtp_password || '',
        smtp_from_email: settings.smtp_from_email || '',
        smtp_from_name: settings.smtp_from_name || '',
        smtp_secure: settings.smtp_secure !== false
      });
    }
  }, [isOpen, settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Company Settings</h3>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 pt-4 border-b">
          <button
            type="button"
            onClick={() => setActiveSettingsTab('company')}
            className={`px-4 py-2 rounded-t-lg font-medium transition ${
              activeSettingsTab === 'company'
                ? 'bg-blue-100 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            Company & Bank
          </button>
          <button
            type="button"
            onClick={() => setActiveSettingsTab('email')}
            className={`px-4 py-2 rounded-t-lg font-medium transition ${
              activeSettingsTab === 'email'
                ? 'bg-blue-100 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            Email (SMTP)
          </button>
          <button
            type="button"
            onClick={() => setActiveSettingsTab('invoice')}
            className={`px-4 py-2 rounded-t-lg font-medium transition ${
              activeSettingsTab === 'invoice'
                ? 'bg-blue-100 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            Invoice Settings
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto px-6 py-4 flex-1">
            {/* Company & Bank Tab */}
            {activeSettingsTab === 'company' && (
              <div className="space-y-6">
                {/* Company Info Section */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Company Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Address</label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        rows="2"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Street, City, Country"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company VAT</label>
                      <input
                        type="text"
                        value={formData.company_vat}
                        onChange={(e) => setFormData({ ...formData, company_vat: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Email</label>
                      <input
                        type="email"
                        value={formData.company_email}
                        onChange={(e) => setFormData({ ...formData, company_email: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Representative Name</label>
                      <input
                        type="text"
                        value={formData.representative_name}
                        onChange={(e) => setFormData({ ...formData, representative_name: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Person representing the company on invoices
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bank Info Section */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Bank Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={formData.bank_name}
                        onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="e.g., DSK Bank"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SWIFT Code</label>
                      <input
                        type="text"
                        value={formData.bank_swift}
                        onChange={(e) => setFormData({ ...formData, bank_swift: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="e.g., STSABGSF"
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">IBAN</label>
                      <input
                        type="text"
                        value={formData.bank_iban}
                        onChange={(e) => setFormData({ ...formData, bank_iban: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="e.g., BG19STSA93000031081943"
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bank Address</label>
                      <input
                        type="text"
                        value={formData.bank_address}
                        onChange={(e) => setFormData({ ...formData, bank_address: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Bank street, city, country"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Email Settings Tab */}
            {activeSettingsTab === 'email' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Configure your email server to send invoices. Need help? 
                  <button type="button" onClick={() => window.open('https://support.google.com/accounts/answer/185833', '_blank')} className="text-blue-600 hover:text-blue-800 ml-1 underline">View Gmail SMTP guide</button>
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
                    <input
                      type="text"
                      value={formData.smtp_host}
                      onChange={(e) => setFormData({ ...formData, smtp_host: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="e.g., smtp.gmail.com or smtp.office365.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
                    <input
                      type="number"
                      value={formData.smtp_port}
                      onChange={(e) => setFormData({ ...formData, smtp_port: parseInt(e.target.value) })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="587"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Secure Connection</label>
                    <select
                      value={formData.smtp_secure ? 'true' : 'false'}
                      onChange={(e) => setFormData({ ...formData, smtp_secure: e.target.value === 'true' })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="true">TLS/SSL (Port 587 or 465)</option>
                      <option value="false">No Encryption</option>
                    </select>
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Username</label>
                    <input
                      type="text"
                      value={formData.smtp_username}
                      onChange={(e) => setFormData({ ...formData, smtp_username: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="your-email@company.com"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Password</label>
                    <input
                      type="password"
                      value={formData.smtp_password}
                      onChange={(e) => setFormData({ ...formData, smtp_password: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Your email password or app password"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      For Gmail, use an <a href="https://support.google.com/accounts/answer/185833" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">App Password</a>
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From Email</label>
                    <input
                      type="email"
                      value={formData.smtp_from_email}
                      onChange={(e) => setFormData({ ...formData, smtp_from_email: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="invoices@company.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From Name</label>
                    <input
                      type="text"
                      value={formData.smtp_from_name}
                      onChange={(e) => setFormData({ ...formData, smtp_from_name: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Company Name"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Invoice Settings Tab */}
            {activeSettingsTab === 'invoice' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Timesheet Deadline (Day of Month)
                    </label>
                    <select
                      value={formData.timesheet_deadline_day}
                      onChange={(e) => setFormData({ ...formData, timesheet_deadline_day: parseInt(e.target.value) })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Day of the month by which timesheets must be received
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Default VAT Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.default_vat_rate}
                      onChange={(e) => setFormData({ ...formData, default_vat_rate: parseFloat(e.target.value) })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Default VAT percentage applied to new invoices
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="px-6 py-4 border-t bg-gray-50 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

 

// Deadline Modal Component
const DeadlineModal = ({ isOpen, onClose, currentDeadline, onSubmit }) => {
  const [deadline, setDeadline] = useState(15);

  useEffect(() => {
    if (isOpen) {
      setDeadline(currentDeadline || 15);
    }
  }, [isOpen, currentDeadline]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ timesheet_deadline_day: deadline });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Change Timesheet Deadline</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deadline Day of Month
            </label>
            <select
              value={deadline}
              onChange={(e) => setDeadline(parseInt(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">
              Timesheets must be received by this day of each month
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Application
const InvoiceGeneratorApp = () => {
  const { user, login, register, logout, loading } = useAuth();
  const [consultants, setConsultants] = useState([]);
  const [clients, setClients] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [automationLogs, setAutomationLogs] = useState([]);
  const [activeTab, setActiveTab] = useState(() => {
  // Load saved tab from localStorage, default to 'dashboard'
  return localStorage.getItem('activeTab') || 'dashboard';
});
  const [dataLoading, setDataLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({});
  const [timesheets, setTimesheets] = useState([]);
  const [editingDays, setEditingDays] = useState(null);
  const [editDaysValue, setEditDaysValue] = useState('');
  const [editingInvoiceNumber, setEditingInvoiceNumber] = useState(null);  // ← ADD
  const [editInvoiceNumberValue, setEditInvoiceNumberValue] = useState(''); // ← ADD
  const [companySettings, setCompanySettings] = useState(null);
const [settingsModalOpen, setSettingsModalOpen] = useState(false);
const [timesheetStatus, setTimesheetStatus] = useState(null);
const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [deadlineModalOpen, setDeadlineModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

  useEffect(() => {
  localStorage.setItem('activeTab', activeTab);
}, [activeTab]);
  
  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

 // Load data from API
const loadData = async () => {
  if (!user) return;
  
  setDataLoading(true);
  try {
    const [consultantsData, clientsData, contractsData, invoicesData, automationData, timesheetsData] = await Promise.all([
      apiCall('/consultants').catch(err => {
        console.error('Failed to load consultants:', err);
        return [];
      }),
      apiCall('/clients').catch(err => {
        console.error('Failed to load clients:', err);
        return [];
      }),
      apiCall('/contracts').catch(err => {
        console.error('Failed to load contracts:', err);
        return [];
      }),
      apiCall('/invoices').catch(err => {
        console.error('Failed to load invoices:', err);
        return [];
      }),
      apiCall('/automation-logs').catch(err => {
        console.error('Failed to load automation logs:', err);
        return [];
      }),
      apiCall('/timesheets').catch(err => {
        console.error('Failed to load timesheets:', err);
        return [];
      })
    ]);

    setConsultants(consultantsData);
    setClients(clientsData);
    setContracts(contractsData);
    setInvoices(invoicesData);
    setAutomationLogs(automationData);
    setTimesheets(timesheetsData);
    
    // Load company settings and timesheet status
    await loadCompanySettings().catch(err => console.error('Settings load failed:', err));
    await loadTimesheetStatus().catch(err => console.error('Timesheet status load failed:', err));
    
    // ✅ Load users if admin
    if (user.role === 'admin') {
      await loadUsers().catch(err => console.error('Users load failed:', err));
    }
    
  } catch (error) {
    console.error('Failed to load data:', error);
    showNotification('Failed to load some data. Please refresh the page.', 'error');
  }
  setDataLoading(false);
};

useEffect(() => {
  if (user) {
    loadData();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [user]);
  // Generate invoices
  const generateInvoices = async (contractId) => {
    try {
      setDataLoading(true);
      await apiCall(`/invoices/generate/${contractId}`, {
        method: 'POST'
      });
      
      showNotification('Generated invoices successfully!');
      loadData(); // Refresh data
    } catch (error) {
      showNotification('Failed to generate invoices: ' + error.message, 'error');
    }
    setDataLoading(false);
  };

  // Start editing invoice number
  const startEditInvoiceNumber = (invoice) => {
    setEditingInvoiceNumber(invoice.id);
    setEditInvoiceNumberValue(invoice.invoice_number);
  };

  // Update invoice number
  const updateInvoiceNumber = async (invoiceId) => {
    try {
      await apiCall(`/invoices/${invoiceId}/number`, {
        method: 'PUT',
        body: JSON.stringify({ invoiceNumber: editInvoiceNumberValue })
      });
      showNotification('Invoice number updated successfully!');
      setEditingInvoiceNumber(null);
      loadData();
    } catch (error) {
      showNotification('Failed to update invoice number: ' + error.message, 'error');
    }
  };

// View timesheet for invoice - Opens the actual PDF file
const viewTimesheet = async (invoice) => {
  try {
    setDataLoading(true);
    
    // Extract month from invoice period
    const periodDate = new Date(invoice.period_to);
    const month = periodDate.toLocaleDateString('en-US', { month: 'long' });
    
    // Get consultant email from contract
    const contract = contracts.find(c => c.id === invoice.contract_id);
    if (!contract) {
      showNotification('Contract not found', 'error');
      return;
    }
    
    const consultant = consultants.find(c => c.id === contract.consultant_id);
    if (!consultant) {
      showNotification('Consultant not found', 'error');
      return;
    }
    
    // Find matching timesheet - use /all endpoint to get processed timesheets too
    const response = await apiCall('/timesheets/all');
    const allTimesheets = response;
    
    // Find timesheet that matches consultant email and month
    const matchingTimesheet = allTimesheets.find(ts => 
      ts.sender_email === consultant.email && 
      ts.month?.toLowerCase() === month.toLowerCase()
    );
    
    if (matchingTimesheet && matchingTimesheet.timesheet_file_url) {
      // Open the actual PDF file in new tab
      window.open(matchingTimesheet.timesheet_file_url, '_blank');
    } else if (matchingTimesheet) {
      showNotification('No PDF file available for this timesheet', 'error');
    } else {
      showNotification(`No timesheet found for ${consultant.email} in ${month}`, 'error');
    }
  } catch (error) {
    showNotification('Failed to load timesheet: ' + error.message, 'error');
  } finally {
    setDataLoading(false);
  }
};

  // Cancel editing invoice number
  const cancelEditInvoiceNumber = () => {
    setEditingInvoiceNumber(null);
    setEditInvoiceNumberValue('');
  };


// Generate PDF for invoice
const generatePDF = async (invoiceId) => {
  try {
    setDataLoading(true);
    const response = await apiCall(`/invoices/${invoiceId}/generate-pdf`, {
      method: 'POST'
    });
    showNotification('PDF generated successfully!');
    loadData(); // Refresh to get the PDF URL
    return response.pdfUrl;
  } catch (error) {
    showNotification('Failed to generate PDF: ' + error.message, 'error');
  } finally {
    setDataLoading(false);
  }
};

// Download PDF
const downloadPDF = async (invoice) => {
  try {
    // If no PDF exists, generate it first
    if (!invoice.pdf_url) {
      const pdfUrl = await generatePDF(invoice.id);
      if (pdfUrl) {
        window.open(pdfUrl, '_blank');
      }
    } else {
      // PDF already exists, just open it
      window.open(invoice.pdf_url, '_blank');
    }
  } catch (error) {
    showNotification('Failed to download PDF: ' + error.message, 'error');
  }
};

  // Send invoice email
const sendInvoiceEmail = async (invoice) => {
  try {
    setDataLoading(true);
    
    // First, ensure PDF exists
    if (!invoice.pdf_url) {
      const pdfUrl = await generatePDF(invoice.id);
      if (!pdfUrl) {
        showNotification('Failed to generate PDF', 'error');
        return;
      }
    }
    
    // Send email
    await apiCall(`/invoices/${invoice.id}/send-email`, {
      method: 'POST'
    });
    
    showNotification('Invoice email sent successfully!');
    loadData(); // Refresh to update email status
  } catch (error) {
    showNotification('Failed to send email: ' + error.message, 'error');
  } finally {
    setDataLoading(false);
  }
};

  // Load users (admin only)
const loadUsers = async () => {
  try {
    const usersData = await apiCall('/users');
    setUsers(usersData);
  } catch (error) {
    console.error('Failed to load users:', error);
  }
};

// Create operator (admin only)
const createOperator = async (operatorData) => {
  try {
    await apiCall('/users', {
      method: 'POST',
      body: JSON.stringify(operatorData)
    });
    showNotification('Operator created successfully!');
    loadUsers();
  } catch (error) {
    showNotification('Failed to create operator: ' + error.message, 'error');
  }
};

// Toggle user active status (admin only)
const toggleUserActive = async (userId) => {
  try {
    await apiCall(`/users/${userId}/toggle-active`, {
      method: 'PUT'
    });
    showNotification('User status updated successfully!');
    loadUsers();
  } catch (error) {
    showNotification('Failed to update user status: ' + error.message, 'error');
  }
};

// Delete user (admin only)
const deleteUser = async (userId) => {
  if (!window.confirm('Are you sure you want to delete this user?')) return;
  
  try {
    await apiCall(`/users/${userId}`, {
      method: 'DELETE'
    });
    showNotification('User deleted successfully!');
    loadUsers();
  } catch (error) {
    showNotification('Failed to delete user: ' + error.message, 'error');
  }
};

// Change password (both roles)
const changePassword = async (passwordData) => {
  try {
    await apiCall('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData)
    });
    showNotification('Password changed successfully!');
    setChangePasswordModalOpen(false);
  } catch (error) {
    showNotification('Failed to change password: ' + error.message, 'error');
  }
};

  // Add new consultant
  const addConsultant = async (consultantData) => {
    try {
      await apiCall('/consultants', {
        method: 'POST',
        body: JSON.stringify(consultantData)
      });
      showNotification('Consultant added successfully!');
      loadData();
    } catch (error) {
      showNotification('Failed to add consultant: ' + error.message, 'error');
    }
  };

  // Load company settings
const loadCompanySettings = async () => {
  try {
    const settings = await apiCall('/company/settings');
    setCompanySettings(settings);
  } catch (error) {
    console.error('Failed to load company settings:', error);
  }
};

// Update company settings
const updateCompanySettings = async (settingsData) => {
  try {
    await apiCall('/company/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData)
    });
    showNotification('Settings updated successfully!');
    await loadCompanySettings();
    await loadTimesheetStatus(); // ← ADD THIS LINE
    setSettingsModalOpen(false);
    setDeadlineModalOpen(false);
  } catch (error) {
    showNotification('Failed to update settings: ' + error.message, 'error');
  }
};

  
// Load timesheet status
const loadTimesheetStatus = async () => {
  try {
    const status = await apiCall('/timesheets/status');
    setTimesheetStatus(status);
  } catch (error) {
    console.error('Failed to load timesheet status:', error);
  }
};

  // Add new contract
const addContract = async (contractData) => {
  try {
    await apiCall('/contracts', {
      method: 'POST',
      body: JSON.stringify(contractData)
    });
    showNotification('Contract added successfully!');
    loadData();
  } catch (error) {
    showNotification('Failed to add contract: ' + error.message, 'error');
  }
};


  // Add new client
  const addClient = async (clientData) => {
    try {
      await apiCall('/clients', {
        method: 'POST',
        body: JSON.stringify(clientData)
      });
      showNotification('Client added successfully!');
      loadData();
    } catch (error) {
      showNotification('Failed to add client: ' + error.message, 'error');
    }
  };

const updateDays = async (timesheetId, newDays) => {
  try {
    await apiCall(`/timesheets/${timesheetId}/days`, {
      method: 'PUT',
      body: JSON.stringify({ days: parseFloat(newDays) })  // ← CHANGED from parseInt
    });
    showNotification('Days updated successfully!');
    setEditingDays(null);
    setEditDaysValue('');
    loadData();
  } catch (error) {
    showNotification('Failed to update days: ' + error.message, 'error');
  }
};

const startEditDays = (timesheet) => {
  setEditingDays(timesheet.id);
  setEditDaysValue(timesheet.pdf_days || timesheet.email_days || '');
};

const cancelEditDays = () => {
  setEditingDays(null);
  setEditDaysValue('');
};

// Open modal for adding items
const openAddModal = (type) => {
  const configs = {
    consultant: {
      title: 'Add New Consultant',
      fields: [
        { name: 'firstName', placeholder: 'First Name' },
        { name: 'lastName', placeholder: 'Last Name' },
        { name: 'companyName', placeholder: 'Company Name' },
        { name: 'companyAddress', placeholder: 'Company Address' },
        { name: 'companyVAT', placeholder: 'VAT Number' },
        { name: 'consultantContractId', placeholder: 'Consultant Contract ID' },
        { name: 'iban', placeholder: 'IBAN' },
        { name: 'swift', placeholder: 'SWIFT Code' },
        { name: 'email', placeholder: 'Email', type: 'email' },
        { name: 'phone', placeholder: 'Phone' }
      ],
      onSubmit: addConsultant
    },
    client: {
      title: 'Add New Client',
      fields: [
        { name: 'firstName', placeholder: 'First Name' },
        { name: 'lastName', placeholder: 'Last Name' },
        { name: 'companyName', placeholder: 'Company Name' },
        { name: 'companyAddress', placeholder: 'Company Address' },
        { name: 'companyVAT', placeholder: 'VAT Number' },
        { name: 'clientContractId', placeholder: 'Client Contract ID' },
        { name: 'iban', placeholder: 'IBAN' },
        { name: 'swift', placeholder: 'SWIFT Code' },
        { name: 'email', placeholder: 'Email', type: 'email' },
        { name: 'phone', placeholder: 'Phone' }
      ],
      onSubmit: addClient
    },
    contract: {
      title: 'Add New Contract',
      fields: [
        { name: 'contractNumber', placeholder: 'Contract Number (e.g., CNT-2024-001)' },
        { 
          name: 'consultantId', 
          placeholder: 'Select Consultant', 
          type: 'select', 
          options: consultants.map(c => ({ 
            value: c.id, 
            label: `${c.first_name} ${c.last_name} - ${c.company_name}` 
          })) 
        },
        { 
          name: 'clientId', 
          placeholder: 'Select Client', 
          type: 'select', 
          options: clients.map(c => ({ 
            value: c.id, 
            label: `${c.first_name} ${c.last_name} - ${c.company_name}` 
          })) 
        },
        { name: 'fromDate', placeholder: 'Contract Start Date', type: 'date', label: 'Contract Start Date' },
        { name: 'toDate', placeholder: 'Contract End Date', type: 'date', label: 'Contract End Date' },
        { name: 'purchasePrice', placeholder: 'Purchase Price (€)', type: 'number', step: '0.01' },
        { name: 'sellPrice', placeholder: 'Sell Price (€)', type: 'number', step: '0.01' },
        { name: 'consultantVatEnabled', type: 'checkbox', label: 'Enable VAT for Consultant Invoices' },
        { name: 'consultantVatRate', type: 'number', step: '0.01', label: 'Consultant VAT Rate (%)' },
        { name: 'vatEnabled', type: 'checkbox', label: 'Enable VAT for Client Invoices' },
        { name: 'vatRate', type: 'number', step: '0.01', label: 'Client VAT Rate (%)' }
      ],
      onSubmit: addContract
    },
    // ✅ ADD THIS
    operator: {
      title: 'Create Operator Account',
      fields: [
        { name: 'firstName', placeholder: 'First Name' },
        { name: 'lastName', placeholder: 'Last Name' },
        { name: 'email', placeholder: 'Email', type: 'email' },
        { name: 'password', placeholder: 'Password', type: 'password' }
      ],
      onSubmit: createOperator
    }
  };

  setModalConfig(configs[type]);
  setModalOpen(true);
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="Initializing application..." />
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={login} onRegister={register} />;
  }

  const calculateDays = (fromDate, toDate) => {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const timeDiff = end - start;
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
  };

  const formatCurrency = (amount) => `€${parseFloat(amount).toFixed(2)}`;
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      <Notification 
        notification={notification} 
        onClose={() => setNotification(null)} 
      />

      {/* Modal */}
      <SimpleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalConfig.title}
        fields={modalConfig.fields || []}
        onSubmit={modalConfig.onSubmit}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        settings={companySettings}
        onSubmit={updateCompanySettings}
      />
          
          {/* Deadline Modal */}
<DeadlineModal
  isOpen={deadlineModalOpen}
  onClose={() => setDeadlineModalOpen(false)}
  currentDeadline={companySettings?.timesheet_deadline_day}
  onSubmit={(data) => updateCompanySettings({ ...companySettings, ...data })}
/>
    {/* ✅ ADD CHANGE PASSWORD MODAL HERE */}
<ChangePasswordModal
  isOpen={changePasswordModalOpen}
  onClose={() => setChangePasswordModalOpen(false)}
  onSubmit={changePassword}
/>

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center mr-8">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mr-3">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Invoice Generator</h1>
                  <p className="text-sm text-gray-500">Professional Invoice Management</p>
                </div>
              </div>
            </div>
<div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
                >
                  <Users className="h-4 w-4" />
                  Menu
                </button>
                
                {userMenuOpen && (
  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
    <button
      onClick={() => {
        setChangePasswordModalOpen(true);  // ✅ ADD THIS
        setUserMenuOpen(false);
      }}
      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
    >
      <Edit className="h-4 w-4" />
      Change Password
    </button>
    
    {user.role === 'admin' && (  // ✅ Admin only
      <button
        onClick={() => {
          setSettingsModalOpen(true);
          setUserMenuOpen(false);
        }}
        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 border-t"
      >
        <Edit className="h-4 w-4" />
        Company Settings
      </button>
    )}
    
    <button
      onClick={logout}
      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t"
    >
      <LogOut className="h-4 w-4" />
      Logout
    </button>
  </div>
)}
              </div>
            </div>
          </div>
          
          {/* Navigation Tabs */}
<div className="flex gap-1 mt-6 bg-gray-100 p-1 rounded-lg w-fit">
  {['dashboard', 'consultants', 'clients', 'contracts', 'timesheets', 'invoices', 
    ...(user.role === 'admin' ? ['users'] : [])  // ✅ Add 'users' tab for admin only
  ].map((tab) => (
    <button
      key={tab}
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 rounded-md capitalize text-sm font-medium transition ${
        activeTab === tab 
          ? 'bg-white text-blue-600 shadow-sm' 
          : 'text-gray-600 hover:text-gray-800'
      }`}
    >
      {tab}
    </button>
  ))}
</div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {dataLoading && (
          <div className="bg-white rounded-lg border mb-6">
            <LoadingSpinner message="Loading data..." />
          </div>
        )}

       {/* Dashboard Tab */}
{activeTab === 'dashboard' && (
  <div className="space-y-6">
    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[
        { label: 'Consultants', value: consultants.length, icon: Users, color: 'blue' },
        { label: 'Clients', value: clients.length, icon: Building, color: 'green' },
        { label: 'Contracts', value: contracts.length, icon: FileText, color: 'purple' },
        { label: 'Invoices', value: invoices.length, icon: FileText, color: 'orange' }
      ].map((stat, index) => (
        <div key={index} className="bg-white rounded-lg p-6 border shadow-sm">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg bg-${stat.color}-100 mr-4`}>
              <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">{stat.label}</h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Timesheet Status Overview */}
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">Timesheet Status Overview</h2>
        {timesheetStatus && (
          <p className="text-sm text-gray-600 mt-1">
            {timesheetStatus.checking_month} {timesheetStatus.checking_year} 
            <span className="ml-2 text-gray-500">
              (Deadline: {timesheetStatus.deadline_day}th)
            </span>
          </p>
        )}
      </div>
      <div className="p-6">
        {timesheetStatus ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Received */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-green-800">Received</h3>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-600">
                {timesheetStatus.consultants?.filter(c => c.status === 'received').length || 0}
              </p>
              <p className="text-xs text-green-700 mt-1">Timesheets submitted</p>
            </div>

            {/* Waiting */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-yellow-800">Waiting</h3>
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <p className="text-3xl font-bold text-yellow-600">
                {timesheetStatus.consultants?.filter(c => c.status === 'waiting').length || 0}
              </p>
              <p className="text-xs text-yellow-700 mt-1">Before deadline</p>
            </div>

            {/* Overdue */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-red-800">Overdue</h3>
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-3xl font-bold text-red-600">
                {timesheetStatus.consultants?.filter(c => c.status === 'overdue').length || 0}
              </p>
              <p className="text-xs text-red-700 mt-1">Past deadline</p>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>Loading timesheet status...</p>
          </div>
        )}
      </div>
    </div>

    {/* Monthly Revenue Overview */}
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">Monthly Revenue Overview</h2>
      </div>
      <div className="p-6">
        {(() => {
          // Calculate current month revenue
          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();
          
          const currentMonthInvoices = invoices.filter(inv => {
            const invDate = new Date(inv.invoice_date);
            return invDate.getMonth() === currentMonth && 
                   invDate.getFullYear() === currentYear;
          });
          
          const consultantRevenue = currentMonthInvoices
            .filter(inv => inv.invoice_type === 'consultant')
            .reduce((sum, inv) => sum + parseFloat(inv.total_amount), 0);
            
          const clientRevenue = currentMonthInvoices
            .filter(inv => inv.invoice_type === 'client')
            .reduce((sum, inv) => sum + parseFloat(inv.total_amount), 0);
            
          const profit = clientRevenue - consultantRevenue;
          
          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Client Revenue */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Client Invoices</p>
                <p className="text-3xl font-bold text-blue-600">{formatCurrency(clientRevenue)}</p>
                <p className="text-xs text-gray-500 mt-1">{currentMonthInvoices.filter(i => i.invoice_type === 'client').length} invoices</p>
              </div>
              
              {/* Consultant Costs */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Consultant Costs</p>
                <p className="text-3xl font-bold text-orange-600">{formatCurrency(consultantRevenue)}</p>
                <p className="text-xs text-gray-500 mt-1">{currentMonthInvoices.filter(i => i.invoice_type === 'consultant').length} invoices</p>
              </div>
              
              {/* Net Profit */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Net Profit</p>
                <p className={`text-3xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(profit)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  </div>
)}

        {/* Consultants Tab */}
        {activeTab === 'consultants' && (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-bold text-gray-800">Consultants</h2>
      {user.role === 'admin' && (  // ✅ Admin only
        <button
          onClick={() => openAddModal('consultant')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition"
        >
          <Plus className="h-4 w-4" />
          Add Consultant
        </button>
      )}
    </div>
            
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
<thead className="bg-gray-50">
  <tr>
    <th className="text-left p-4 font-medium text-gray-600">Name</th>
    <th className="text-left p-4 font-medium text-gray-600">Company</th>
    <th className="text-left p-4 font-medium text-gray-600">Address</th>
    <th className="text-left p-4 font-medium text-gray-600">VAT</th>
    <th className="text-left p-4 font-medium text-gray-600">Contract ID</th>
    <th className="text-left p-4 font-medium text-gray-600">Phone</th>
    <th className="text-left p-4 font-medium text-gray-600">Email</th>
    <th className="text-left p-4 font-medium text-gray-600">IBAN</th>
    <th className="text-left p-4 font-medium text-gray-600">SWIFT</th>
    <th className="text-left p-4 font-medium text-gray-600">Created</th>
  </tr>
</thead>
<tbody>
  {consultants.map((consultant) => (
    <tr key={consultant.id} className="border-b hover:bg-gray-50">
      <td className="p-4 font-medium">{consultant.first_name} {consultant.last_name}</td>
      <td className="p-4">{consultant.company_name}</td>
      <td className="p-4 text-sm">{consultant.company_address || '-'}</td>
      <td className="p-4 font-mono text-sm">{consultant.company_vat}</td>
      <td className="p-4 font-mono text-sm">{consultant.consultant_contract_id || '-'}</td>
      <td className="p-4">{consultant.phone || '-'}</td>
      <td className="p-4">{consultant.email || '-'}</td>
      <td className="p-4 font-mono text-xs">{consultant.iban || '-'}</td>
      <td className="p-4 font-mono text-xs">{consultant.swift || '-'}</td>
      <td className="p-4 text-sm text-gray-600">{formatDate(consultant.created_at)}</td>
    </tr>
  ))}
</tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-bold text-gray-800">Clients</h2>
      {user.role === 'admin' && (  // ✅ Admin only
        <button
          onClick={() => openAddModal('client')}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition"
        >
          <Plus className="h-4 w-4" />
          Add Client
        </button>
      )}
    </div>
            
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
<thead className="bg-gray-50">
  <tr>
    <th className="text-left p-4 font-medium text-gray-600">Name</th>
    <th className="text-left p-4 font-medium text-gray-600">Company</th>
    <th className="text-left p-4 font-medium text-gray-600">Address</th>
    <th className="text-left p-4 font-medium text-gray-600">VAT</th>
    <th className="text-left p-4 font-medium text-gray-600">Contract ID</th>
    <th className="text-left p-4 font-medium text-gray-600">Phone</th>
    <th className="text-left p-4 font-medium text-gray-600">Email</th>
    <th className="text-left p-4 font-medium text-gray-600">IBAN</th>
    <th className="text-left p-4 font-medium text-gray-600">SWIFT</th>
    <th className="text-left p-4 font-medium text-gray-600">Created</th>
  </tr>
</thead>
<tbody>
  {clients.map((client) => (
    <tr key={client.id} className="border-b hover:bg-gray-50">
      <td className="p-4 font-medium">{client.first_name} {client.last_name}</td>
      <td className="p-4">{client.company_name}</td>
      <td className="p-4 text-sm">{client.company_address || '-'}</td>
      <td className="p-4 font-mono text-sm">{client.company_vat}</td>
      <td className="p-4 font-mono text-sm">{client.client_contract_id || '-'}</td>
      <td className="p-4">{client.phone || '-'}</td>
      <td className="p-4">{client.email || '-'}</td>
      <td className="p-4 font-mono text-xs">{client.iban || '-'}</td>
      <td className="p-4 font-mono text-xs">{client.swift || '-'}</td>
      <td className="p-4 text-sm text-gray-600">{formatDate(client.created_at)}</td>
    </tr>
  ))}
</tbody>
                </table>
              </div>
            </div>
          </div>
        )}

{/* Contracts Tab */}
{activeTab === 'contracts' && (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-bold text-gray-800">Contracts</h2>
      {user.role === 'admin' && (  // ✅ Admin only
        <button
          onClick={() => openAddModal('contract')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition"
        >
          <Plus className="h-4 w-4" />
          Add Contract
        </button>
      )}
    </div>
    
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 font-medium text-gray-600">Contract Number</th>
              <th className="text-left p-4 font-medium text-gray-600">Consultant</th>
              <th className="text-left p-4 font-medium text-gray-600">Client</th>
              <th className="text-left p-4 font-medium text-gray-600">Contract IDs</th>
              <th className="text-left p-4 font-medium text-gray-600">Period</th>
              <th className="text-left p-4 font-medium text-gray-600">Purchase Price</th>
              <th className="text-left p-4 font-medium text-gray-600">Sell Price</th>
              <th className="text-left p-4 font-medium text-gray-600">VAT Rates</th>
              <th className="text-left p-4 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((contract) => {
              // Check if contract is currently active based on dates
              const today = new Date();
              today.setHours(0, 0, 0, 0);

              const startDate = new Date(contract.from_date);
              startDate.setHours(0, 0, 0, 0);

              const endDate = new Date(contract.to_date);
              endDate.setHours(23, 59, 59, 999);

              const isActive = today >= startDate && today <= endDate;
              
              return (
                <tr key={contract.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-mono text-sm font-medium text-blue-600">
                      {contract.contract_number || ''}
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="font-medium">
                        {contract.consultant_first_name} {contract.consultant_last_name}
                      </div>
                      <div className="text-gray-600">
                        {contract.consultant_company_name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        VAT: {contract.consultant_company_vat || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="font-medium">
                        {contract.client_first_name} {contract.client_last_name}
                      </div>
                      <div className="text-gray-600">
                        {contract.client_company_name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        VAT: {contract.client_company_vat || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <div className="font-mono text-xs text-gray-600">
                        <span className="font-medium">Consultant:</span> {contract.consultant_contract_id || 'N/A'}
                      </div>
                      <div className="font-mono text-xs text-gray-600 mt-1">
                        <span className="font-medium">Client:</span> {contract.client_contract_id || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm">
                    {formatDate(contract.from_date)} - {formatDate(contract.to_date)}
                  </td>
                  <td className="p-4">{formatCurrency(contract.purchase_price)}</td>
                  <td className="p-4">{formatCurrency(contract.sell_price)}</td>
                        {/* 8. VAT RATES - ✅ PLACE IT HERE */}
        <td className="p-4">
          <div className="text-sm">
            {/* Consultant VAT */}
            <div className="mb-1">
              <span className="text-xs text-gray-500">Consultant: </span>
              {contract.consultant_vat_enabled ? (
                <span className="text-green-600 font-medium">
                  {parseFloat(contract.consultant_vat_rate || 0).toFixed(0)}%
                </span>
              ) : (
                <span className="text-gray-400 italic">No VAT</span>
              )}
            </div>
            
            {/* Client VAT */}
            <div>
              <span className="text-xs text-gray-500">Client: </span>
              {contract.vat_enabled ? (
                <span className="text-blue-600 font-medium">
                  {parseFloat(contract.vat_rate || 0).toFixed(0)}%
                </span>
              ) : (
                <span className="text-gray-400 italic">No VAT</span>
              )}
            </div>
          </div>
        </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {isActive ? 'active' : 'inactive'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}

{/* Timesheets Tab */}
{activeTab === 'timesheets' && (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Timesheet Management</h2>
        {timesheetStatus && (
          <p className="text-sm text-gray-600 mt-1">
            Checking {timesheetStatus.checking_month} {timesheetStatus.checking_year} timesheets 
            (Deadline: {timesheetStatus.deadline_day}th of each month)
          </p>
        )}
      </div>
    </div>
    
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 font-medium text-gray-600">Date Received</th>
              <th className="text-left p-4 font-medium text-gray-600">Name</th>
              <th className="text-left p-4 font-medium text-gray-600">Email</th>
              <th className="text-left p-4 font-medium text-gray-600">Month</th>
              <th className="text-left p-4 font-medium text-gray-600">Days Worked</th>
              <th className="text-left p-4 font-medium text-gray-600">Match Status</th>
              <th className="text-left p-4 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {timesheetStatus?.consultants?.map((consultant) => {
              // Find matching timesheet
              const timesheet = timesheets.find(ts => 
                ts.sender_email === consultant.email && 
                ts.month?.toLowerCase() === consultant.checking_month?.toLowerCase()
              );
              
              // Determine row background color
              let rowBgColor = '';
              if (consultant.status === 'received') {
                rowBgColor = 'bg-green-50'; // Green
              } else if (consultant.status === 'waiting') {
                rowBgColor = 'bg-yellow-50'; // Yellow
              } else if (consultant.status === 'overdue') {
                rowBgColor = 'bg-red-50'; // Red
              }
              
              // Check if days match
              let matchStatus = '-';
              if (timesheet) {
                const pdfDays = parseFloat(timesheet.pdf_days);
                const emailDays = parseFloat(timesheet.email_days);
                if (pdfDays && emailDays) {
                  matchStatus = pdfDays === emailDays ? 
                    'Days Match ✓' : 
                    `Days Don't Match (PDF: ${pdfDays}, Email: ${emailDays})`;
                }
              }
              
              return (
                <tr key={consultant.id} className={`border-b hover:opacity-80 transition ${rowBgColor}`}>
                  <td className="p-4 text-sm">
                    {timesheet ? new Date(timesheet.created_at).toLocaleDateString('en-GB') : '-'}
                  </td>
                  <td className="p-4">
                    <div className="font-medium">{consultant.first_name} {consultant.last_name}</div>
                    <div className="text-xs text-gray-600">{consultant.company_name}</div>
                  </td>
                  <td className="p-4 text-sm font-mono">{consultant.email}</td>
                  <td className="p-4 text-sm font-medium">
                    {consultant.checking_month} {consultant.checking_year}
                  </td>
                  <td className="p-4">
                    {timesheet ? (
                      editingDays === timesheet.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.5"
                            value={editDaysValue}
                            onChange={(e) => setEditDaysValue(e.target.value)}
                            className="border border-blue-500 rounded px-2 py-1 w-20 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                            autoFocus
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') updateDays(timesheet.id, editDaysValue);
                              if (e.key === 'Escape') cancelEditDays();
                            }}
                          />
                          <button
                            onClick={() => updateDays(timesheet.id, editDaysValue)}
                            className="text-green-600 hover:text-green-800 p-1"
                            title="Save"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={cancelEditDays}
                            className="text-gray-400 hover:text-gray-600 p-1"
                            title="Cancel"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => startEditDays(timesheet)}
                          className="cursor-pointer hover:bg-blue-100 px-2 py-1 rounded transition inline-block"
                          title="Click to edit"
                        >
                          <span className="font-bold text-blue-600">
                            {timesheet.pdf_days || timesheet.email_days || '-'}
                          </span>
                        </div>
                      )
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    {timesheet ? (
                      <span className={`text-sm ${
                        matchStatus.includes('Match ✓') ? 'text-green-600 font-medium' : 'text-red-600'
                      }`}>
                        {matchStatus}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {timesheet?.timesheet_file_url && (
  <button
    onClick={() => window.open(timesheet.timesheet_file_url, '_blank')}
                          className="text-blue-600 hover:text-blue-800 p-1 transition"
                          title="View Timesheet PDF"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      {timesheet && !timesheet.invoice_generated && (
                        <button
                          onClick={async () => {
                            try {
                              await apiCall(`/timesheets/${timesheet.id}/generate-invoice`, {
                                method: 'POST'
                              });
                              showNotification('Invoice generated successfully!');
                              loadData();
                            } catch (error) {
                              showNotification('Failed to generate invoice: ' + error.message, 'error');
                            }
                          }}
                          className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center gap-1"
                          title="Generate Invoice"
                        >
                          <FileText className="h-3 w-3" />
                          Invoice
                        </button>
                      )}
                      {timesheet?.invoice_generated && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Invoiced
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}

 
        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Generated Invoices</h2>
              <p className="text-sm text-gray-600">{invoices.length} invoices total</p>
            </div>
            
            {invoices.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center border shadow-sm">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">No invoices generated yet</h3>
                <p className="text-gray-600">Go to the dashboard to generate invoices from your contracts</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-4 font-medium text-gray-600">Invoice #</th>
                        <th className="text-left p-4 font-medium text-gray-600">Name</th>
                        <th className="text-left p-4 font-medium text-gray-600">Date</th>
                        <th className="text-left p-4 font-medium text-gray-600">Period</th>
                        <th className="text-left p-4 font-medium text-gray-600">Days</th>
                        <th className="text-left p-4 font-medium text-gray-600">Daily Rate</th>
                        <th className="text-left p-4 font-medium text-gray-600">Subtotal</th>
                        <th className="text-left p-4 font-medium text-gray-600">VAT</th>  {/* ← ADD */}
                        <th className="text-left p-4 font-medium text-gray-600">Total</th>
                        <th className="text-left p-4 font-medium text-gray-600">Status</th>
                        <th className="text-left p-4 font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
  {invoices.map((invoice) => {
    // Calculate amounts
    const subtotal = parseFloat(invoice.subtotal);
    const vatRate = parseFloat(invoice.vat_rate);
    const vatEnabled = invoice.vat_enabled !== false; // default true
    const vatAmount = vatEnabled ? (subtotal * vatRate / 100) : 0;
    const total = subtotal + vatAmount;
    
    return (
      <tr key={invoice.id} className="border-b hover:bg-gray-50 group">
        {/* Invoice Number - Editable */}
        <td className="p-4 font-mono text-xs">
          {editingInvoiceNumber === invoice.id ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={editInvoiceNumberValue}
                onChange={(e) => setEditInvoiceNumberValue(e.target.value)}
                className="border border-blue-500 rounded px-2 py-1 text-xs w-40 focus:outline-none focus:ring-2 focus:ring-blue-300"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter') updateInvoiceNumber(invoice.id);
                  if (e.key === 'Escape') cancelEditInvoiceNumber();
                }}
              />
              <button
                onClick={() => updateInvoiceNumber(invoice.id)}
                className="text-green-600 hover:text-green-800 p-1"
                title="Save"
              >
                <CheckCircle className="h-4 w-4" />
              </button>
              <button
                onClick={cancelEditInvoiceNumber}
                className="text-gray-400 hover:text-gray-600 p-1"
                title="Cancel"
              >
                ×
              </button>
            </div>
          ) : (
            <div 
              onClick={() => startEditInvoiceNumber(invoice)}
              className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition inline-block"
              title="Click to edit"
            >
              {invoice.invoice_number}
            </div>
          )}
        </td>


        {/* Name */}
        <td className="p-4 text-sm">
          <div>
            {invoice.invoice_type === 'consultant' ? (
              <>
                <div className="font-medium">
                  {invoice.consultant_first_name} {invoice.consultant_last_name}
                </div>
                <div className="text-gray-600">
                  {invoice.consultant_company_name}
                </div>
              </>
            ) : (
              <>
                <div className="font-medium">
                  {invoice.client_first_name} {invoice.client_last_name}
                </div>
                <div className="text-gray-600">
                  {invoice.client_company_name}
                </div>
              </>
            )}
          </div>
        </td>

        {/* Date */}
        <td className="p-4 text-sm">
          {new Date(invoice.period_to).toLocaleDateString('en-GB')}
        </td>

        {/* Period */}
        <td className="p-4 text-xs">
          {new Date(invoice.period_to).toLocaleDateString('en-US', { month: 'long' })}
        </td>

        {/* Days */}
        <td className="p-4 font-medium">{invoice.days_worked}</td>

        {/* Daily Rate */}
        <td className="p-4">{formatCurrency(invoice.daily_rate)}</td>

        {/* Subtotal */}
        <td className="p-4 font-medium">{formatCurrency(subtotal)}</td>

{/* VAT - Read Only */}
<td className="p-4">
  {invoice.vat_enabled ? (
    <div className="text-sm">
      <div className="text-gray-600">{parseFloat(invoice.vat_rate).toFixed(0)}%</div>
      <div className="font-medium text-gray-700">{formatCurrency(vatAmount)}</div>
    </div>
  ) : (
    <span className="text-xs text-gray-400 italic">No VAT</span>
  )}
</td>

        {/* Total */}
        <td className="p-4 font-bold text-green-600">{formatCurrency(total)}</td>

        {/* Status */}
        <td className="p-4">
          <span className={`px-2 py-1 rounded-full text-xs ${
            invoice.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
            invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
            invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {invoice.status}
          </span>
        </td>

{/* Actions */}
<td className="p-4">
  <div className="flex gap-2">
    {/* View Timesheet */}
    <button
      onClick={() => viewTimesheet(invoice)}
      className="text-blue-600 hover:text-blue-800 p-1 transition"
      title="View Timesheet"
      disabled={dataLoading}
    >
      <Eye className="h-4 w-4" />
    </button>
    
    {/* View/Download PDF */}
    <button
      onClick={() => downloadPDF(invoice)}
      className="text-green-600 hover:text-green-800 p-1 transition"
      title={invoice.pdf_url ? "Download PDF" : "Generate & Download PDF"}
      disabled={dataLoading}
    >
      <Download className="h-4 w-4" />
    </button>
    
{/* Send Email */}
<button
  onClick={() => sendInvoiceEmail(invoice)}
  className={`p-1 transition ${
    invoice.email_sent 
      ? 'text-green-600 hover:text-green-800' 
      : 'text-purple-600 hover:text-purple-800'
  }`}
  title={invoice.email_sent ? `Sent to ${invoice.email_sent_to}` : "Send Invoice Email"}
  disabled={dataLoading}
>
  {invoice.email_sent ? <CheckCircle className="h-4 w-4" /> : <Send className="h-4 w-4" />}
</button>
  </div>
</td>
      </tr>
    );
  })}
</tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
{/* Users Management Tab (Admin Only) */}  {/* ✅ MOVE IT HERE */}
        {activeTab === 'users' && user.role === 'admin' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">User Management</h2>
              <button
                onClick={() => openAddModal('operator')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition"
              >
                <Plus className="h-4 w-4" />
                Create Operator
              </button>
            </div>
            
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-4 font-medium text-gray-600">Name</th>
                      <th className="text-left p-4 font-medium text-gray-600">Email</th>
                      <th className="text-left p-4 font-medium text-gray-600">Role</th>
                      <th className="text-left p-4 font-medium text-gray-600">Status</th>
                      <th className="text-left p-4 font-medium text-gray-600">Created By</th>
                      <th className="text-left p-4 font-medium text-gray-600">Last Login</th>
                      <th className="text-left p-4 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div className="font-medium">{u.first_name} {u.last_name}</div>
                          {u.id === user.id && (
                            <span className="text-xs text-blue-600">(You)</span>
                          )}
                        </td>
                        <td className="p-4 text-sm">{u.email}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            u.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            u.active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {u.active ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="p-4 text-sm">
                          {u.created_by_first_name 
                            ? `${u.created_by_first_name} ${u.created_by_last_name}` 
                            : 'System'}
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {u.last_login ? new Date(u.last_login).toLocaleDateString('en-GB') : 'Never'}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            {u.id !== user.id && (
                              <>
                                <button
                                  onClick={() => toggleUserActive(u.id)}
                                  className={`px-3 py-1 text-xs rounded transition ${
                                    u.active
                                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                                  }`}
                                  title={u.active ? 'Disable User' : 'Enable User'}
                                >
                                  {u.active ? 'Disable' : 'Enable'}
                                </button>
                                <button
                                  onClick={() => deleteUser(u.id)}
                                  className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition"
                                  title="Delete User"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default InvoiceGeneratorApp;
