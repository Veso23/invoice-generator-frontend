import React, { useState, useEffect } from 'react';
import { FileText, Download, Plus, Edit, Users, Building, LogOut, Eye, Send, CheckCircle, AlertCircle, AlertTriangle, Trash2, Upload } from 'lucide-react';
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
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
      backgroundSize: '20px 20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '48px',
        borderRadius: '32px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        width: '100%',
        maxWidth: '420px',
        border: '1px solid #f1f5f9'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            backgroundColor: '#4f46e5',
            borderRadius: '24px',
            marginBottom: '24px',
            boxShadow: '0 20px 40px rgba(79, 70, 229, 0.3)'
          }}>
            <FileText style={{ width: '40px', height: '40px', color: 'white', strokeWidth: 2.5 }} />
          </div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 900, 
            color: '#0f172a',
            letterSpacing: '-0.025em',
            margin: 0
          }}>
            Invoice<span style={{ color: '#4f46e5' }}>Pro</span>
          </h1>
          <p style={{ 
            color: '#94a3b8', 
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginTop: '8px'
          }}>
            {isLogin ? 'Timesheet & Invoice Platform' : 'Create New Account'}
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fff1f2',
            border: '1px solid #fecdd3',
            color: '#e11d48',
            padding: '16px 20px',
            borderRadius: '16px',
            marginBottom: '24px',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <AlertCircle style={{ width: '18px', height: '18px', flexShrink: 0, marginTop: '1px' }} />
            <div>
              <p style={{ fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Connection Error</p>
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required={!isLogin}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  fontSize: '14px',
                  fontWeight: 600,
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required={!isLogin}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  fontSize: '14px',
                  fontWeight: 600,
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          {!isLogin && (
            <input
              type="text"
              name="companyName"
              placeholder="Company Name"
              value={formData.companyName}
              onChange={handleChange}
              required={!isLogin}
              style={{
                width: '100%',
                padding: '16px 20px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                fontSize: '14px',
                fontWeight: 600,
                outline: 'none',
                marginBottom: '12px',
                boxSizing: 'border-box'
              }}
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '16px 20px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              fontSize: '14px',
              fontWeight: 600,
              outline: 'none',
              marginBottom: '12px',
              boxSizing: 'border-box'
            }}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '16px 20px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              fontSize: '14px',
              fontWeight: 600,
              outline: 'none',
              marginBottom: '20px',
              boxSizing: 'border-box'
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '18px 24px',
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              fontSize: '16px',
              fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 20px 40px rgba(79, 70, 229, 0.3)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid white',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Connecting...
              </>
            ) : (
              isLogin ? 'Login' : 'Create Account'
            )}
          </button>
        </form>

        <div style={{ 
          marginTop: '32px', 
          paddingTop: '24px', 
          borderTop: '1px solid #f1f5f9',
          textAlign: 'center'
        }}>
          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
          >
            {isLogin ? 'Create Account' : 'Back to Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Loading Component
const LoadingSpinner = ({ message = "Loading..." }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '32px',
        height: '32px',
        border: '3px solid #e2e8f0',
        borderTopColor: '#4f46e5',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 12px'
      }} />
      <p style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>{message}</p>
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

  const isError = notification.type === 'error';

  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      right: '24px',
      zIndex: 10000,
      padding: '16px 20px',
      borderRadius: '16px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
      maxWidth: '400px',
      backgroundColor: isError ? '#fef2f2' : '#ecfdf5',
      border: `1px solid ${isError ? '#fecaca' : '#a7f3d0'}`,
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px'
    }}>
      {isError ? (
        <AlertCircle style={{ width: '20px', height: '20px', color: '#ef4444', flexShrink: 0 }} />
      ) : (
        <CheckCircle style={{ width: '20px', height: '20px', color: '#10b981', flexShrink: 0 }} />
      )}
      <div style={{ flex: 1 }}>
        <p style={{ 
          fontSize: '11px', 
          fontWeight: 800, 
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: isError ? '#dc2626' : '#059669',
          marginBottom: '4px'
        }}>
          {isError ? 'Error' : 'Success'}
        </p>
        <p style={{ 
          fontSize: '14px', 
          fontWeight: 500, 
          color: isError ? '#7f1d1d' : '#065f46' 
        }}>
          {notification.message}
        </p>
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          padding: '4px',
          cursor: 'pointer',
          color: isError ? '#ef4444' : '#10b981',
          fontSize: '20px',
          lineHeight: 1
        }}
      >
        ×
      </button>
    </div>
  );
};

// Simple Form Modal Component
const SimpleModal = ({ isOpen, onClose, title, onSubmit, fields, submitButtonText = 'Add' }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (isOpen) {
      const initialData = {};
      fields.forEach(field => {
        initialData[field.name] = field.value !== undefined ? field.value : (field.type === 'checkbox' ? false : '');
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

  // ✅ renderField MUST BE INSIDE SimpleModal
  const renderField = (field) => {
    if (field.type === 'checkbox') {
      return (
        <div key={field.name} style={{ marginBottom: '16px' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            color: '#334155'
          }}>
            <input
              type="checkbox"
              checked={formData[field.name] || false}
              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.checked })}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            {field.label}
          </label>
        </div>
      );
    }

    if (field.type === 'select') {
      return (
        <div key={field.name} style={{ marginBottom: '16px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontSize: '13px',
            fontWeight: 700,
            color: '#475569'
          }}>
            {field.label || field.placeholder}
          </label>
          <select
            value={formData[field.name] || ''}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            required={field.required !== false}
            style={{ 
              width: '100%', 
              padding: '12px 16px',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              backgroundColor: 'white',
              outline: 'none',
              boxSizing: 'border-box'
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
      <div key={field.name} style={{ marginBottom: '16px' }}>
        {field.label && (
          <label style={{ 
            display: 'block', 
            marginBottom: '8px',
            fontSize: '13px',
            fontWeight: 700,
            color: '#475569'
          }}>
            {field.label}
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
            padding: '12px 16px',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 500,
            outline: 'none',
            boxSizing: 'border-box',
            opacity: isDisabled ? 0.6 : 1,
            cursor: isDisabled ? 'not-allowed' : 'text',
            backgroundColor: isDisabled ? '#f8fafc' : 'white'
          }}
        />
      </div>
    );
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '24px'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '24px',
        padding: '32px',
        width: '100%',
        maxWidth: '480px',
        maxHeight: '85vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ 
          fontSize: '22px', 
          fontWeight: 800, 
          color: '#0f172a',
          marginBottom: '24px'
        }}>{title}</h3>
        <form onSubmit={handleSubmit}>
          {fields.map(field => renderField(field))}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '24px', borderTop: '1px solid #f1f5f9', marginTop: '24px' }}>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '14px 24px',
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)'
              }}
            >
              {submitButtonText}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '14px 24px',
                backgroundColor: 'white',
                color: '#64748b',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Default permissions for user roles
const DEFAULT_USER_PERMISSIONS = {
  admin: {
    can_view_dashboard: true, can_view_contracts: true, can_view_consultants: true,
    can_view_clients: true, can_view_timesheets: true, can_view_invoices: true, 
    can_manage_users: true, can_delete_timesheets: true
  },
  operator: {
    can_view_dashboard: false, can_view_contracts: false, can_view_consultants: true,
    can_view_clients: true, can_view_timesheets: true, can_view_invoices: true, 
    can_manage_users: false, can_delete_timesheets: false
  }
};

// User Modal Component with Permissions
const UserModal = ({ isOpen, onClose, onSubmit, mode, userData }) => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', role: 'operator',
    permissions: { ...DEFAULT_USER_PERMISSIONS.operator }
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && userData) {
        setFormData({
          firstName: userData.first_name || '',
          lastName: userData.last_name || '',
          email: userData.email || '',
          password: '',
          role: userData.role || 'operator',
          permissions: userData.permissions || DEFAULT_USER_PERMISSIONS[userData.role || 'operator']
        });
      } else {
        setFormData({
          firstName: '', lastName: '', email: '', password: '', role: 'operator',
          permissions: { ...DEFAULT_USER_PERMISSIONS.operator }
        });
      }
    }
  }, [isOpen, mode, userData]);

  const handleRoleChange = (newRole) => {
    setFormData({
      ...formData, role: newRole,
      permissions: newRole === 'admin' ? { ...DEFAULT_USER_PERMISSIONS.admin } : formData.permissions
    });
  };

  const handlePermissionChange = (permission) => {
    if (formData.role === 'admin') return;
    setFormData({
      ...formData,
      permissions: { ...formData.permissions, [permission]: !formData.permissions[permission] }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  const permissionLabels = {
    can_view_dashboard: 'View Dashboard',
    can_view_contracts: 'View Contracts',
    can_view_consultants: 'View Consultants',
    can_view_clients: 'View Clients',
    can_view_timesheets: 'View Timesheets',
    can_view_invoices: 'View Invoices',
    can_manage_users: 'Manage Users',
    can_delete_timesheets: 'Delete Problematic Emails'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">{mode === 'edit' ? 'Edit User' : 'Create New User'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="First Name" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Last Name" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="email@example.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {mode === 'edit' ? 'New Password (leave blank to keep current)' : 'Password'}
            </label>
            <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="••••••••" required={mode === 'create'} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="role" value="operator" checked={formData.role === 'operator'}
                  onChange={() => handleRoleChange('operator')} className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Operator</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="role" value="admin" checked={formData.role === 'admin'}
                  onChange={() => handleRoleChange('admin')} className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Admin</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permissions {formData.role === 'admin' && <span className="ml-2 text-xs text-gray-500">(Admins have all permissions)</span>}
            </label>
            <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
              {Object.entries(permissionLabels).map(([key, label]) => (
                <label key={key} className={`flex items-center gap-2 ${formData.role === 'admin' ? 'opacity-60' : 'cursor-pointer'}`}>
                  <input type="checkbox" checked={formData.permissions[key] || false} onChange={() => handlePermissionChange(key)}
                    disabled={formData.role === 'admin'} className="w-4 h-4 text-blue-600 rounded" />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              {mode === 'edit' ? 'Save Changes' : 'Create User'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">
              Cancel
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

// CSV Upload Modal Component
const CsvUploadModal = ({ isOpen, onClose, csvData, onFileUpload, onUpload, uploading }) => {
  if (!isOpen) return null;

  const validCount = csvData.filter(row => row.isValid).length;
  const invalidCount = csvData.filter(row => !row.isValid && !row.isDuplicate).length;
  const duplicateCount = csvData.filter(row => row.isDuplicate).length;

  const downloadTemplate = () => {
    const headers = 'first_name,last_name,company_name,company_address,vat,iban,swift,phone,email,consultant_contract_id';
    const example = 'John,Doe,Acme Ltd,"123 Main St, City",BG123456789,BG12IBAN1234567890,SWIFT123,+1234567890,john@acme.com,CONS-001';
    const template = `${headers}\n${example}`;
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'consultants_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Using inline styles to ensure proper overlay behavior
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '24px'
  };

  const modalStyle = {
    backgroundColor: 'white',
    borderRadius: '24px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    width: '100%',
    maxWidth: '640px',
    maxHeight: '85vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '24px 32px 20px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Bulk Synchronizer</h3>
              <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Import consultant pool via CSV.
                <button 
                  onClick={downloadTemplate} 
                  style={{ 
                    color: '#4f46e5', 
                    fontWeight: 700, 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: 0
                  }}
                >
                  <Download className="h-4 w-4" /> Get Template
                </button>
              </p>
            </div>
            <button 
              onClick={onClose}
              style={{ 
                padding: '8px', 
                color: '#94a3b8', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                borderRadius: '8px'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
          {!csvData.length ? (
            /* Upload Zone */
            <label style={{ 
              display: 'block',
              border: '2px dashed #e2e8f0',
              borderRadius: '16px',
              padding: '48px 32px',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: '#f8fafc',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#818cf8';
              e.currentTarget.style.backgroundColor = '#eef2ff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.backgroundColor = '#f8fafc';
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.style.borderColor = '#4f46e5';
              e.currentTarget.style.backgroundColor = '#eef2ff';
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.style.borderColor = '#4f46e5';
              e.currentTarget.style.backgroundColor = '#eef2ff';
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.backgroundColor = '#f8fafc';
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.backgroundColor = '#f8fafc';
              
              const files = e.dataTransfer.files;
              if (files && files.length > 0) {
                const file = files[0];
                if (file.name.endsWith('.csv') || file.type === 'text/csv') {
                  // Create a synthetic event object that mimics the file input change event
                  onFileUpload({ target: { files: [file] } });
                }
              }
            }}
            >
              <div style={{ 
                width: '64px', 
                height: '64px', 
                backgroundColor: '#e0e7ff', 
                color: '#4f46e5',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Upload style={{ width: '32px', height: '32px' }} />
              </div>
              <p style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px' }}>
                Drop CSV File Here
              </p>
              <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
                or <span style={{ color: '#4f46e5', fontWeight: 600 }}>browse</span> to upload
              </p>
              <input 
                type="file" 
                accept=".csv" 
                onChange={onFileUpload} 
                style={{ display: 'none' }}
              />
            </label>
          ) : (
            /* Preview Table */
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText style={{ width: '18px', height: '18px', color: '#6366f1' }} />
                  Preview 
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#94a3b8' }}>({csvData.length} records)</span>
                </h4>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: 700, 
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#059669',
                    backgroundColor: '#ecfdf5',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #d1fae5'
                  }}>
                    {validCount} Ready
                  </span>
                  {duplicateCount > 0 && (
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: 700, 
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#d97706',
                      backgroundColor: '#fffbeb',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid #fde68a'
                    }}>
                      {duplicateCount} Duplicate
                    </span>
                  )}
                  {invalidCount > 0 && (
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: 700, 
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#e11d48',
                      backgroundColor: '#fff1f2',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid #fecdd3'
                    }}>
                      {invalidCount} Invalid
                    </span>
                  )}
                </div>
              </div>
              
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ maxHeight: '256px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <tr>
                        <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center', width: '48px' }}>Status</th>
                        <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Consultant</th>
                        <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Company</th>
                        <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Tax ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.slice(0, 30).map((row, idx) => (
                        <tr key={idx} style={{ 
                          borderBottom: '1px solid #f1f5f9', 
                          backgroundColor: row.isValid ? 'white' : (row.isDuplicate ? '#fffbeb' : '#fff5f5')
                        }}>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            {row.isValid ? (
                              <CheckCircle style={{ width: '20px', height: '20px', color: '#10b981' }} />
                            ) : row.isDuplicate ? (
                              <AlertTriangle style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
                            ) : (
                              <AlertCircle style={{ width: '20px', height: '20px', color: '#f43f5e' }} />
                            )}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ 
                                width: '36px', 
                                height: '36px', 
                                borderRadius: '10px',
                                backgroundColor: row.isDuplicate ? '#fef3c7' : '#e0e7ff',
                                color: row.isDuplicate ? '#d97706' : '#4f46e5',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: 800
                              }}>
                                {(row.firstName?.[0] || '')}{(row.lastName?.[0] || '')}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '14px' }}>{row.firstName} {row.lastName}</div>
                                <div style={{ fontSize: '12px', color: '#94a3b8' }}>{row.email || 'No email'}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: '#475569' }}>{row.companyName || '-'}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <code style={{ 
                              fontSize: '12px', 
                              fontFamily: 'monospace',
                              color: row.isDuplicate ? '#d97706' : '#64748b',
                              backgroundColor: row.isDuplicate ? '#fef3c7' : '#f1f5f9',
                              padding: '4px 8px',
                              borderRadius: '6px'
                            }}>
                              {row.companyVAT || 'MISSING'}
                            </code>
                            {/* Show error badges */}
                            {row.errors && row.errors.length > 0 && (
                              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {row.errors.slice(0, 2).map((error, errIdx) => (
                                  <span key={errIdx} style={{ 
                                    fontSize: '10px', 
                                    color: row.isDuplicate ? '#92400e' : '#be123c',
                                    backgroundColor: row.isDuplicate ? '#fef3c7' : '#ffe4e6',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    display: 'inline-block'
                                  }}>
                                    {error}
                                  </span>
                                ))}
                                {row.errors.length > 2 && (
                                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                                    +{row.errors.length - 2} more...
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {csvData.length > 30 && (
                <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px', marginTop: '12px' }}>+ {csvData.length - 30} more records</p>
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div style={{ 
          borderTop: '1px solid #f1f5f9', 
          backgroundColor: '#f8fafc', 
          padding: '20px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>
            {csvData.length > 0 
              ? (duplicateCount > 0 
                  ? `${validCount} ready, ${duplicateCount} duplicates will be skipped` 
                  : `${validCount} records ready for import`)
              : 'Select a CSV file to begin'}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              disabled={uploading}
              style={{ 
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 700,
                color: '#64748b',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Cancel
            </button>
            <button
              onClick={onUpload}
              disabled={validCount === 0 || uploading}
              style={{ 
                padding: '10px 24px',
                fontSize: '14px',
                fontWeight: 700,
                color: validCount === 0 || uploading ? '#94a3b8' : 'white',
                backgroundColor: validCount === 0 || uploading ? '#e2e8f0' : '#4f46e5',
                border: 'none',
                borderRadius: '10px',
                cursor: validCount === 0 || uploading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: validCount === 0 || uploading ? 'none' : '0 4px 14px rgba(79, 70, 229, 0.4)'
              }}
            >
              {uploading ? (
                <>
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    border: '2px solid white',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Processing...
                </>
              ) : (
                <>
                  <Upload style={{ width: '16px', height: '16px' }} />
                  Import {validCount} Records
                </>
              )}
            </button>
          </div>
        </div>
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

  <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Timesheet Email</label>
  <input
    type="email"
    value={formData.timesheet_email}
    onChange={(e) => setFormData({ ...formData, timesheet_email: e.target.value })}
    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
    placeholder="timesheets@yourcompany.com"
  />
  <p className="text-xs text-gray-500 mt-1">
    Email address where consultants send timesheets
  </p>
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
  
  // ✅ Helper function to calculate total days (days + hours/8)
  const calculateTotalDays = (timesheet) => {
    if (!timesheet) return null;
    
    // Priority: Use days if available, otherwise convert hours to days
    // Days and hours represent the SAME work, not additional work
    
    // Check for days first (prefer PDF, fallback to email)
    const days = parseFloat(timesheet.pdf_days) || parseFloat(timesheet.email_days) || 0;
    
    if (days > 0) {
      return parseFloat(days.toFixed(2));
    }
    
    // If no days, check hours and convert to days
    const hours = parseFloat(timesheet.pdf_hours) || parseFloat(timesheet.email_hours) || 0;
    
    if (hours > 0) {
      return parseFloat((hours / 8).toFixed(2));
    }
    
    // No data at all
    return null;
  };

  const fixTimesheetUrl = (url) => {
    if (!url) return null;
    
    // Fix 1: Add /public/ if missing
    let fixedUrl = url;
    if (url.includes('/storage/v1/object/timesheets/') && !url.includes('/storage/v1/object/public/')) {
      fixedUrl = url.replace('/storage/v1/object/timesheets/', '/storage/v1/object/public/timesheets/');
    }
    
    // Fix 2: Encode special characters in filename
    const parts = fixedUrl.split('/');
    const filename = parts[parts.length - 1];
    const encodedFilename = encodeURIComponent(filename);
    const encodedUrl = parts.slice(0, -1).join('/') + '/' + encodedFilename;
    
    return encodedUrl;
  };
  const [consultants, setConsultants] = useState([]);
  const [clients, setClients] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [generatingInvoice, setGeneratingInvoice] = useState(null);
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('activeTab') || 'dashboard';
  });
  const [dataLoading, setDataLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({});
  const [timesheets, setTimesheets] = useState([]);
  const [editingDays, setEditingDays] = useState(null);
  const [editDaysValue, setEditDaysValue] = useState('');
  const [editingInvoiceNumber, setEditingInvoiceNumber] = useState(null);
  const [editInvoiceNumberValue, setEditInvoiceNumberValue] = useState('');
  const [companySettings, setCompanySettings] = useState(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [timesheetStatus, setTimesheetStatus] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [deadlineModalOpen, setDeadlineModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [editingMonth, setEditingMonth] = useState(null);
  const [editMonthValue, setEditMonthValue] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userModalMode, setUserModalMode] = useState('create');
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activeTimesheetTab, setActiveTimesheetTab] = useState('current');
  const [csvUploadModalOpen, setCsvUploadModalOpen] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [csvUploading, setCsvUploading] = useState(false);
  const [searchQueries, setSearchQueries] = useState({
    consultants: '',
    clients: '',
    contracts: '',
    invoices: '',
    history: ''
  });
  const [timesheetHistory, setTimesheetHistory] = useState([]);
  const [historyFilters, setHistoryFilters] = useState({
    year: 'all',
    month: 'all',
    consultant: 'all',
    status: 'all'
  });
  const [sortConfig, setSortConfig] = useState({
    consultants: { key: null, direction: 'asc' },
    clients: { key: null, direction: 'asc' },
    contracts: { key: null, direction: 'asc' },
    invoices: { key: null, direction: 'asc' }
  });

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
      const [consultantsData, clientsData, contractsData, invoicesData, timesheetsData, historyData] = await Promise.all([
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
        apiCall('/timesheets').catch(err => {
          console.error('Failed to load timesheets:', err);
          return [];
        }),
        apiCall('/timesheets/history').catch(err => {
          console.error('Failed to load timesheet history:', err);
          return [];
        })
      ]);

      setConsultants(consultantsData);
      setClients(clientsData);
      setContracts(contractsData);
      setInvoices(invoicesData);
      setTimesheets(timesheetsData);
      setTimesheetHistory(historyData);
      
      await loadCompanySettings().catch(err => console.error('Settings load failed:', err));
      await loadTimesheetStatus().catch(err => console.error('Timesheet status load failed:', err));
      
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

  const startEditInvoiceNumber = (invoice) => {
    setEditingInvoiceNumber(invoice.id);
    setEditInvoiceNumberValue(invoice.invoice_number);
  };

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

  const cancelEditInvoiceNumber = () => {
    setEditingInvoiceNumber(null);
    setEditInvoiceNumberValue('');
  };

  const generatePDF = async (invoiceId) => {
    try {
      setDataLoading(true);
      const response = await apiCall(`/invoices/${invoiceId}/generate-pdf`, {
        method: 'POST'
      });
      showNotification('PDF generated successfully!');
      loadData();
      return response.pdfUrl;
    } catch (error) {
      showNotification('Failed to generate PDF: ' + error.message, 'error');
    } finally {
      setDataLoading(false);
    }
  };

  const viewTimesheet = async (invoice) => {
    try {
      setDataLoading(true);
      
      const periodDate = new Date(invoice.period_to);
      const month = periodDate.toLocaleDateString('en-US', { month: 'long' });
      
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
      
      const response = await apiCall('/timesheets/all');
      const allTimesheets = response;
      
      const matchingTimesheet = allTimesheets.find(ts => 
        ts.sender_email === consultant.email && 
        ts.month?.toLowerCase() === month.toLowerCase()
      );
      
      if (matchingTimesheet && matchingTimesheet.timesheet_file_url) {
        const fixedUrl = fixTimesheetUrl(matchingTimesheet.timesheet_file_url);
        window.open(fixedUrl, '_blank');
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
  
  const editItem = (type, item) => {
    const configs = {
      consultant: {
        title: 'Edit Consultant',
        fields: [
          { name: 'firstName', placeholder: 'First Name', value: item.first_name },
          { name: 'lastName', placeholder: 'Last Name', value: item.last_name },
          { name: 'companyName', placeholder: 'Company Name', value: item.company_name },
          { name: 'companyAddress', placeholder: 'Company Address', value: item.company_address },
          { name: 'companyVAT', placeholder: 'VAT Number', value: item.company_vat },
          { name: 'consultantContractId', placeholder: 'Consultant Contract ID', value: item.consultant_contract_id },
          { name: 'iban', placeholder: 'IBAN', value: item.iban },
          { name: 'swift', placeholder: 'SWIFT Code', value: item.swift },
          { name: 'email', placeholder: 'Email', type: 'email', value: item.email },
          { name: 'phone', placeholder: 'Phone', value: item.phone }
        ],
        onSubmit: (data) => updateConsultant(item.id, data)
      },
      client: {
        title: 'Edit Client',
        fields: [
          { name: 'firstName', placeholder: 'First Name', value: item.first_name },
          { name: 'lastName', placeholder: 'Last Name', value: item.last_name },
          { name: 'companyName', placeholder: 'Company Name', value: item.company_name },
          { name: 'companyAddress', placeholder: 'Company Address', value: item.company_address },
          { name: 'companyVAT', placeholder: 'VAT Number', value: item.company_vat },
          { name: 'clientContractId', placeholder: 'Client Contract ID', value: item.client_contract_id },
          { name: 'iban', placeholder: 'IBAN', value: item.iban },
          { name: 'swift', placeholder: 'SWIFT Code', value: item.swift },
          { name: 'email', placeholder: 'Email', type: 'email', value: item.email },
          { name: 'phone', placeholder: 'Phone', value: item.phone }
        ],
        onSubmit: (data) => updateClient(item.id, data)
      },
      contract: {
        title: 'Edit Contract',
        fields: [
          { name: 'contractNumber', placeholder: 'Contract Number', value: item.contract_number },
          { 
            name: 'consultantId', 
            placeholder: 'Select Consultant', 
            type: 'select',
            value: item.consultant_id,
            options: consultants.map(c => ({ 
              value: c.id, 
              label: `${c.first_name} ${c.last_name} - ${c.company_name}` 
            })) 
          },
          { 
            name: 'clientId', 
            placeholder: 'Select Client', 
            type: 'select',
            value: item.client_id,
            options: clients.map(c => ({ 
              value: c.id, 
              label: `${c.first_name} ${c.last_name} - ${c.company_name}` 
            })) 
          },
          { name: 'fromDate', placeholder: 'Contract Start Date', type: 'date', label: 'Contract Start Date', value: item.from_date },
          { name: 'toDate', placeholder: 'Contract End Date', type: 'date', label: 'Contract End Date', value: item.to_date },
          { name: 'purchasePrice', placeholder: 'Purchase Price (€)', type: 'number', step: '0.01', value: item.purchase_price },
          { name: 'sellPrice', placeholder: 'Sell Price (€)', type: 'number', step: '0.01', value: item.sell_price },
          { name: 'consultantVatEnabled', type: 'checkbox', label: 'Enable VAT for Consultant Invoices', value: item.consultant_vat_enabled },
          { name: 'consultantVatRate', type: 'number', step: '0.01', label: 'Consultant VAT Rate (%)', value: item.consultant_vat_rate },
          { name: 'vatEnabled', type: 'checkbox', label: 'Enable VAT for Client Invoices', value: item.vat_enabled },
          { name: 'vatRate', type: 'number', step: '0.01', label: 'Client VAT Rate (%)', value: item.vat_rate }
        ],
        onSubmit: (data) => updateContract(item.id, data)
      }
    };

    setModalConfig(configs[type]);
    setEditModalOpen(true);
  };

  const updateConsultant = async (id, consultantData) => {
    try {
      await apiCall(`/consultants/${id}`, {
        method: 'PUT',
        body: JSON.stringify(consultantData)
      });
      showNotification('Consultant updated successfully!');
      setEditModalOpen(false);
      loadData();
    } catch (error) {
      showNotification('Failed to update consultant: ' + error.message, 'error');
    }
  };

  const updateClient = async (id, clientData) => {
    try {
      await apiCall(`/clients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(clientData)
      });
      showNotification('Client updated successfully!');
      setEditModalOpen(false);
      loadData();
    } catch (error) {
      showNotification('Failed to update client: ' + error.message, 'error');
    }
  };

  const updateContract = async (id, contractData) => {
    try {
      await apiCall(`/contracts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(contractData)
      });
      showNotification('Contract updated successfully!');
      setEditModalOpen(false);
      loadData();
    } catch (error) {
      showNotification('Failed to update contract: ' + error.message, 'error');
    }
  };

  const deleteConsultant = async (id) => {
    if (!window.confirm('Are you sure you want to delete this consultant? This action cannot be undone.')) return;
    
    try {
      await apiCall(`/consultants/${id}`, {
        method: 'DELETE'
      });
      showNotification('Consultant deleted successfully!');
      loadData();
    } catch (error) {
      showNotification('Failed to delete consultant: ' + error.message, 'error');
    }
  };

  const deleteClient = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) return;
    
    try {
      await apiCall(`/clients/${id}`, {
        method: 'DELETE'
      });
      showNotification('Client deleted successfully!');
      loadData();
    } catch (error) {
      showNotification('Failed to delete client: ' + error.message, 'error');
    }
  };

  const deleteContract = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contract? This action cannot be undone.')) return;
    
    try {
      await apiCall(`/contracts/${id}`, {
        method: 'DELETE'
      });
      showNotification('Contract deleted successfully!');
      loadData();
    } catch (error) {
      showNotification('Failed to delete contract: ' + error.message, 'error');
    }
  };

  const handleSearch = (tab, query) => {
    setSearchQueries({ ...searchQueries, [tab]: query });
  };

  const handleSort = (tab, key) => {
    const direction = sortConfig[tab].key === key && sortConfig[tab].direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ ...sortConfig, [tab]: { key, direction } });
  };

  const filterAndSort = (data, tab) => {
    const query = searchQueries[tab].toLowerCase();
    
    let filtered = data.filter(item => {
      return Object.values(item).some(val => 
        String(val).toLowerCase().includes(query)
      );
    });
    
    if (sortConfig[tab].key) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig[tab].key];
        const bVal = b[sortConfig[tab].key];
        
        if (aVal < bVal) return sortConfig[tab].direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig[tab].direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return filtered;
  };

  const downloadPDF = async (invoice) => {
    try {
      if (!invoice.pdf_url) {
        const pdfUrl = await generatePDF(invoice.id);
        if (pdfUrl) {
          window.open(pdfUrl, '_blank');
        }
      } else {
        window.open(invoice.pdf_url, '_blank');
      }
    } catch (error) {
      showNotification('Failed to download PDF: ' + error.message, 'error');
    }
  };

  const sendInvoiceEmail = async (invoice) => {
    try {
      setDataLoading(true);
      
      if (!invoice.pdf_url) {
        const pdfUrl = await generatePDF(invoice.id);
        if (!pdfUrl) {
          showNotification('Failed to generate PDF', 'error');
          return;
        }
      }
      
      await apiCall(`/invoices/${invoice.id}/send-email`, {
        method: 'POST'
      });
      
      showNotification('Invoice email sent successfully!');
      loadData();
    } catch (error) {
      showNotification('Failed to send email: ' + error.message, 'error');
    } finally {
      setDataLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const usersData = await apiCall('/users');
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const createUser = async (userData) => {
    try {
      await apiCall('/users', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      showNotification(`${userData.role === 'admin' ? 'Admin' : 'Operator'} created successfully!`);
      loadUsers();
    } catch (error) {
      showNotification('Failed to create user: ' + error.message, 'error');
    }
  };

  const updateUser = async (userData) => {
    try {
      await apiCall(`/users/${editingUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
      });
      showNotification('User updated successfully!');
      loadUsers();
      setEditingUser(null);
    } catch (error) {
      showNotification('Failed to update user: ' + error.message, 'error');
    }
  };

  const openCreateUserModal = () => {
    setUserModalMode('create');
    setEditingUser(null);
    setUserModalOpen(true);
  };

  const openEditUserModal = (userToEdit) => {
    setUserModalMode('edit');
    setEditingUser(userToEdit);
    setUserModalOpen(true);
  };

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

  // CSV Upload Functions
  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    // Parse header row
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
    
    // Map common header variations to our field names
    const headerMap = {
      'first_name': 'firstName', 'firstname': 'firstName', 'first name': 'firstName',
      'last_name': 'lastName', 'lastname': 'lastName', 'last name': 'lastName',
      'company_name': 'companyName', 'companyname': 'companyName', 'company name': 'companyName', 'company': 'companyName',
      'company_address': 'companyAddress', 'companyaddress': 'companyAddress', 'company address': 'companyAddress', 'address': 'companyAddress',
      'company_vat': 'companyVAT', 'companyvat': 'companyVAT', 'vat': 'companyVAT', 'vat_number': 'companyVAT', 'vat number': 'companyVAT',
      'iban': 'iban',
      'swift': 'swift', 'bic': 'swift',
      'phone': 'phone', 'telephone': 'phone', 'tel': 'phone',
      'email': 'email', 'e-mail': 'email',
      'consultant_contract_id': 'consultantContractId', 'contract_id': 'consultantContractId', 'contract id': 'consultantContractId'
    };
    
    // Parse data rows
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = [];
      let current = '';
      let inQuotes = false;
      
      // Handle quoted values with commas
      for (const char of lines[i]) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      
      const row = {};
      headers.forEach((header, index) => {
        const fieldName = headerMap[header] || header;
        row[fieldName] = values[index]?.replace(/^["']|["']$/g, '') || '';
      });
      
      // Only add if has required fields
      if (row.firstName && row.lastName && row.companyName && row.companyVAT) {
        row.isValid = true;
        row.errors = [];
      } else {
        row.isValid = false;
        row.errors = ['Missing required fields (firstName, lastName, companyName, companyVAT)'];
      }
      
      data.push(row);
    }
    
    return data;
  };

  // Check CSV data for duplicates against existing consultants
  const checkCsvDuplicates = (csvRows) => {
    const checkedRows = csvRows.map(row => {
      if (!row.isValid) return row; // Skip already invalid rows
      
      const duplicateErrors = [];
      
      // Check against existing consultants in database
      consultants.forEach(consultant => {
        // Check VAT (case-insensitive)
        if (row.companyVAT && consultant.company_vat && 
            row.companyVAT.toLowerCase() === consultant.company_vat.toLowerCase()) {
          duplicateErrors.push(`VAT "${row.companyVAT}" already exists (${consultant.first_name} ${consultant.last_name})`);
        }
        
        // Check Email (case-insensitive)
        if (row.email && consultant.email && 
            row.email.toLowerCase() === consultant.email.toLowerCase()) {
          duplicateErrors.push(`Email "${row.email}" already exists`);
        }
        
        // Check IBAN (case-insensitive)
        if (row.iban && consultant.iban && 
            row.iban.toLowerCase() === consultant.iban.toLowerCase()) {
          duplicateErrors.push(`IBAN already exists`);
        }
        
        // Check Phone
        if (row.phone && consultant.phone && 
            row.phone.replace(/\s/g, '') === consultant.phone.replace(/\s/g, '')) {
          duplicateErrors.push(`Phone "${row.phone}" already exists`);
        }
      });
      
      // Also check for duplicates within the CSV itself
      csvRows.forEach((otherRow, otherIdx) => {
        if (otherRow === row) return; // Skip self
        
        if (row.companyVAT && otherRow.companyVAT && 
            row.companyVAT.toLowerCase() === otherRow.companyVAT.toLowerCase()) {
          if (!duplicateErrors.some(e => e.includes('VAT') && e.includes('in CSV'))) {
            duplicateErrors.push(`VAT "${row.companyVAT}" duplicated in CSV`);
          }
        }
        
        if (row.email && otherRow.email && 
            row.email.toLowerCase() === otherRow.email.toLowerCase()) {
          if (!duplicateErrors.some(e => e.includes('Email') && e.includes('in CSV'))) {
            duplicateErrors.push(`Email "${row.email}" duplicated in CSV`);
          }
        }
        
        if (row.iban && otherRow.iban && 
            row.iban.toLowerCase() === otherRow.iban.toLowerCase()) {
          if (!duplicateErrors.some(e => e.includes('IBAN') && e.includes('in CSV'))) {
            duplicateErrors.push(`IBAN duplicated in CSV`);
          }
        }
        
        if (row.phone && otherRow.phone && 
            row.phone.replace(/\s/g, '') === otherRow.phone.replace(/\s/g, '')) {
          if (!duplicateErrors.some(e => e.includes('Phone') && e.includes('in CSV'))) {
            duplicateErrors.push(`Phone "${row.phone}" duplicated in CSV`);
          }
        }
      });
      
      if (duplicateErrors.length > 0) {
        return {
          ...row,
          isValid: false,
          isDuplicate: true,
          errors: [...(row.errors || []), ...duplicateErrors]
        };
      }
      
      return row;
    });
    
    return checkedRows;
  };

  const handleCsvFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const parsed = parseCSV(text);
      // Check for duplicates against existing consultants
      const checkedData = checkCsvDuplicates(parsed);
      setCsvData(checkedData);
    };
    reader.readAsText(file);
  };

  const uploadConsultantsCsv = async () => {
    const validRows = csvData.filter(row => row.isValid);
    if (validRows.length === 0) {
      showNotification('No valid rows to upload', 'error');
      return;
    }
    
    setCsvUploading(true);
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (const row of validRows) {
      try {
        await apiCall('/consultants', {
          method: 'POST',
          body: JSON.stringify({
            firstName: row.firstName,
            lastName: row.lastName,
            companyName: row.companyName,
            companyAddress: row.companyAddress || '',
            companyVAT: row.companyVAT,
            iban: row.iban || '',
            swift: row.swift || '',
            phone: row.phone || '',
            email: row.email || '',
            consultantContractId: row.consultantContractId || ''
          })
        });
        successCount++;
      } catch (error) {
        errorCount++;
        errors.push(`${row.firstName} ${row.lastName}: ${error.message}`);
      }
    }
    
    setCsvUploading(false);
    setCsvUploadModalOpen(false);
    setCsvData([]);
    loadData();
    
    if (errorCount === 0) {
      showNotification(`Successfully imported ${successCount} consultants!`);
    } else {
      showNotification(`Imported ${successCount}, failed ${errorCount}. Errors: ${errors.slice(0, 3).join('; ')}${errors.length > 3 ? '...' : ''}`, 'error');
    }
  };

  const loadCompanySettings = async () => {
    try {
      const settings = await apiCall('/company/settings');
      setCompanySettings(settings);
    } catch (error) {
      console.error('Failed to load company settings:', error);
    }
  };

  const updateCompanySettings = async (settingsData) => {
    try {
      await apiCall('/company/settings', {
        method: 'PUT',
        body: JSON.stringify(settingsData)
      });
      showNotification('Settings updated successfully!');
      await loadCompanySettings();
      await loadTimesheetStatus();
      setSettingsModalOpen(false);
      setDeadlineModalOpen(false);
    } catch (error) {
      showNotification('Failed to update settings: ' + error.message, 'error');
    }
  };

  const loadTimesheetStatus = async () => {
    try {
      const status = await apiCall('/timesheets/status');
      setTimesheetStatus(status);
    } catch (error) {
      console.error('Failed to load timesheet status:', error);
    }
  };

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
        body: JSON.stringify({ days: parseFloat(newDays) })
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
    // Use calculated total days as initial value
    const totalDays = calculateTotalDays(timesheet);
    setEditDaysValue(totalDays || '');
  };

  const cancelEditDays = () => {
    setEditingDays(null);
    setEditDaysValue('');
  };

  const startEditMonth = (timesheet) => {
    setEditingMonth(timesheet.id);
    setEditMonthValue(timesheet.month || '');
  };

  const updateMonth = async (timesheetId, newMonth) => {
    try {
      await apiCall(`/timesheets/${timesheetId}/month`, {
        method: 'PUT',
        body: JSON.stringify({ month: newMonth })
      });
      showNotification('Month updated successfully!');
      setEditingMonth(null);
      setEditMonthValue('');
      loadData();
    } catch (error) {
      showNotification('Failed to update month: ' + error.message, 'error');
    }
  };

  const cancelEditMonth = () => {
    setEditingMonth(null);
    setEditMonthValue('');
  };

  // Flag timesheet for review
  const flagForReview = async (timesheetId) => {
    try {
      await apiCall(`/timesheets/${timesheetId}/flag-review`, {
        method: 'PUT',
        body: JSON.stringify({ flagged: true })
      });
      showNotification('Timesheet flagged for review');
      loadData();
    } catch (error) {
      showNotification('Failed to flag timesheet: ' + error.message, 'error');
    }
  };

  // Remove flag from timesheet
  const unflagForReview = async (timesheetId) => {
    try {
      await apiCall(`/timesheets/${timesheetId}/flag-review`, {
        method: 'PUT',
        body: JSON.stringify({ flagged: false })
      });
      showNotification('Flag removed from timesheet');
      loadData();
    } catch (error) {
      showNotification('Failed to unflag timesheet: ' + error.message, 'error');
    }
  };
  
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

  const formatCurrency = (amount) => `€${parseFloat(amount).toFixed(2)}`;
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      <Notification 
        notification={notification} 
        onClose={() => setNotification(null)} 
      />

      {/* ADD Modal */}
      <SimpleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalConfig.title}
        fields={modalConfig.fields || []}
        onSubmit={modalConfig.onSubmit}
        submitButtonText="Add"  
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        settings={companySettings}
        onSubmit={updateCompanySettings}
      />

      {/* Edit Modal */}
      <SimpleModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
        }}
        title={modalConfig.title}
        fields={modalConfig.fields || []}
        onSubmit={modalConfig.onSubmit}
        submitButtonText="Save" 
      />

      {/* Deadline Modal */}
      <DeadlineModal
        isOpen={deadlineModalOpen}
        onClose={() => setDeadlineModalOpen(false)}
        currentDeadline={companySettings?.timesheet_deadline_day}
        onSubmit={(data) => updateCompanySettings({ ...companySettings, ...data })}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={changePasswordModalOpen}
        onClose={() => setChangePasswordModalOpen(false)}
        onSubmit={changePassword}
      />

      {/* User Modal */}
      <UserModal
        isOpen={userModalOpen}
        onClose={() => {
          setUserModalOpen(false);
          setEditingUser(null);
        }}
        onSubmit={userModalMode === 'edit' ? updateUser : createUser}
        mode={userModalMode}
        userData={editingUser}
      />

      {/* CSV Upload Modal */}
      <CsvUploadModal
        isOpen={csvUploadModalOpen}
        onClose={() => {
          setCsvUploadModalOpen(false);
          setCsvData([]);
        }}
        csvData={csvData}
        onFileUpload={handleCsvFileUpload}
        onUpload={uploadConsultantsCsv}
        uploading={csvUploading}
      />

      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #f1f5f9',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 32px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            height: '80px'
          }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                backgroundColor: '#4f46e5',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FileText style={{ width: '24px', height: '24px', color: 'white', strokeWidth: 2.5 }} />
              </div>
              <div>
                <h1 style={{ 
                  fontSize: '20px', 
                  fontWeight: 900, 
                  color: '#0f172a',
                  letterSpacing: '-0.025em',
                  margin: 0
                }}>
                  Invoice<span style={{ color: '#4f46e5' }}>Pro</span>
                </h1>
                <p style={{ 
                  fontSize: '11px', 
                  color: '#94a3b8',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  margin: 0
                }}>
                  Consultant Management
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { id: 'dashboard', label: 'Dashboard', permission: 'can_view_dashboard' },
                { id: 'consultants', label: 'Consultants', permission: 'can_view_consultants' },
                { id: 'clients', label: 'Clients', permission: 'can_view_clients' },
                { id: 'contracts', label: 'Contracts', permission: 'can_view_contracts' },
                { id: 'timesheets', label: 'Timesheets', permission: 'can_view_timesheets' },
                { id: 'invoices', label: 'Invoices', permission: 'can_view_invoices' },
                { id: 'history', label: 'History', permission: 'can_view_invoices' },
                { id: 'users', label: 'Users', permission: 'can_manage_users' }
              ]
                .filter(tab => {
                  const perms = user?.permissions || (user?.role === 'admin' ? {
                    can_view_dashboard: true, can_view_contracts: true, can_view_consultants: true,
                    can_view_clients: true, can_view_timesheets: true, can_view_invoices: true, can_manage_users: true
                  } : {
                    can_view_dashboard: false, can_view_contracts: false, can_view_consultants: true,
                    can_view_clients: true, can_view_timesheets: true, can_view_invoices: true, can_manage_users: false
                  });
                  return perms[tab.permission];
                })
                .map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: activeTab === tab.id ? '#eef2ff' : 'transparent',
                      color: activeTab === tab.id ? '#4f46e5' : '#64748b'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
            </div>

            {/* User Menu */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  {user.firstName} {user.lastName}
                </p>
                <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                  {user.role === 'admin' ? 'System Admin' : 'Operator'}
                </p>
              </div>
              
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '14px',
                    backgroundColor: '#fef2f2',
                    color: '#ef4444',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <LogOut style={{ width: '20px', height: '20px' }} />
                </button>
                
                {userMenuOpen && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    marginTop: '8px',
                    width: '220px',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                    border: '1px solid #f1f5f9',
                    overflow: 'hidden',
                    zIndex: 50
                  }}>
                    <button
                      onClick={() => {
                        setChangePasswordModalOpen(true);
                        setUserMenuOpen(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '14px 20px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#475569',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Edit style={{ width: '16px', height: '16px' }} />
                      Change Password
                    </button>
                    
                    {user.role === 'admin' && (
                      <button
                        onClick={() => {
                          setSettingsModalOpen(true);
                          setUserMenuOpen(false);
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '14px 20px',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#475569',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderTop: '1px solid #f1f5f9',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Building style={{ width: '16px', height: '16px' }} />
                        Company Settings
                      </button>
                    )}
                    
                    <button
                      onClick={logout}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '14px 20px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#ef4444',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderTop: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <LogOut style={{ width: '16px', height: '16px' }} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px' }}>
        {dataLoading && (
          <div className="bg-white rounded-lg border mb-6">
            <LoadingSpinner message="Loading data..." />
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Page Title */}
            <h1 style={{ 
              fontSize: '48px', 
              fontWeight: 900, 
              color: '#0f172a',
              letterSpacing: '-0.025em',
              margin: 0
            }}>
              Command Center
            </h1>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
              {[
                { label: 'Resources Linked', value: consultants.length, icon: Users, color: '#6366f1', bg: '#eef2ff' },
                { label: 'Partners', value: clients.length, icon: Building, color: '#10b981', bg: '#ecfdf5' },
                { label: 'Active Contracts', value: contracts.length, icon: FileText, color: '#f59e0b', bg: '#fffbeb' },
                { label: 'Total Invoices', value: invoices.length, icon: FileText, color: '#ef4444', bg: '#fef2f2' }
              ].map((stat, index) => (
                <div key={index} style={{
                  backgroundColor: 'white',
                  borderRadius: '24px',
                  padding: '32px',
                  border: '1px solid #f1f5f9',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.3s'
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    backgroundColor: stat.bg,
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px'
                  }}>
                    <stat.icon style={{ width: '28px', height: '28px', color: stat.color }} />
                  </div>
                  <p style={{ 
                    fontSize: '11px', 
                    fontWeight: 700, 
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '8px'
                  }}>
                    {stat.label}
                  </p>
                  <p style={{ 
                    fontSize: '40px', 
                    fontWeight: 900, 
                    color: '#0f172a',
                    letterSpacing: '-0.025em',
                    margin: 0
                  }}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Timesheet Status Overview */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '24px',
              border: '1px solid #f1f5f9',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              overflow: 'hidden'
            }}>
              <div style={{ 
                padding: '24px 32px', 
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <h2 style={{ 
                    fontSize: '20px', 
                    fontWeight: 800, 
                    color: '#0f172a',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <span style={{ fontSize: '24px' }}>📊</span>
                    Live Timesheet Activity
                  </h2>
                  {timesheetStatus && (
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                      {timesheetStatus.checking_month} {timesheetStatus.checking_year} 
                      <span style={{ marginLeft: '8px', color: '#94a3b8' }}>
                        (Deadline: {timesheetStatus.deadline_day}th)
                      </span>
                    </p>
                  )}
                </div>
              </div>
              <div style={{ padding: '32px' }}>
                {timesheetStatus ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                    <div style={{
                      backgroundColor: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      borderRadius: '20px',
                      padding: '28px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Received</span>
                        <CheckCircle style={{ width: '24px', height: '24px', color: '#10b981' }} />
                      </div>
                      <p style={{ fontSize: '48px', fontWeight: 900, color: '#059669', margin: 0 }}>
                        {timesheetStatus.consultants?.filter(c => c.status === 'received').length || 0}
                      </p>
                      <p style={{ fontSize: '12px', color: '#047857', marginTop: '8px', fontWeight: 500 }}>Timesheets submitted</p>
                    </div>

                    <div style={{
                      backgroundColor: '#fffbeb',
                      border: '1px solid #fde68a',
                      borderRadius: '20px',
                      padding: '28px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Waiting</span>
                        <AlertCircle style={{ width: '24px', height: '24px', color: '#f59e0b' }} />
                      </div>
                      <p style={{ fontSize: '48px', fontWeight: 900, color: '#d97706', margin: 0 }}>
                        {timesheetStatus.consultants?.filter(c => c.status === 'waiting').length || 0}
                      </p>
                      <p style={{ fontSize: '12px', color: '#b45309', marginTop: '8px', fontWeight: 500 }}>Before deadline</p>
                    </div>

                    <div style={{
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '20px',
                      padding: '28px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Overdue</span>
                        <AlertCircle style={{ width: '24px', height: '24px', color: '#ef4444' }} />
                      </div>
                      <p style={{ fontSize: '48px', fontWeight: 900, color: '#dc2626', margin: 0 }}>
                        {timesheetStatus.consultants?.filter(c => c.status === 'overdue').length || 0}
                      </p>
                      <p style={{ fontSize: '12px', color: '#b91c1c', marginTop: '8px', fontWeight: 500 }}>Past deadline</p>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: '#94a3b8', padding: '48px' }}>
                    <p>Loading timesheet status...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Monthly Revenue Overview */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '24px',
              border: '1px solid #f1f5f9',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              overflow: 'hidden'
            }}>
              <div style={{ 
                padding: '24px 32px', 
                borderBottom: '1px solid #f1f5f9'
              }}>
                <h2 style={{ 
                  fontSize: '20px', 
                  fontWeight: 800, 
                  color: '#0f172a',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '24px' }}>💰</span>
                  Pipeline Value
                </h2>
              </div>
              <div style={{ padding: '32px' }}>
                {(() => {
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
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Client Invoices</p>
                        <p style={{ fontSize: '36px', fontWeight: 900, color: '#4f46e5', margin: 0 }}>{formatCurrency(clientRevenue)}</p>
                        <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>{currentMonthInvoices.filter(i => i.invoice_type === 'client').length} invoices</p>
                      </div>
                      
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Consultant Costs</p>
                        <p style={{ fontSize: '36px', fontWeight: 900, color: '#f59e0b', margin: 0 }}>{formatCurrency(consultantRevenue)}</p>
                        <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>{currentMonthInvoices.filter(i => i.invoice_type === 'consultant').length} invoices</p>
                      </div>
                      
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Net Profit</p>
                        <p style={{ fontSize: '36px', fontWeight: 900, color: profit >= 0 ? '#10b981' : '#ef4444', margin: 0 }}>
                          {formatCurrency(profit)}
                        </p>
                        <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.025em', margin: 0 }}>Consultants</h2>
              {user.role === 'admin' && (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => setCsvUploadModalOpen(true)}
                    style={{
                      backgroundColor: '#10b981',
                      color: 'white',
                      padding: '12px 20px',
                      borderRadius: '12px',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    <Upload style={{ width: '16px', height: '16px' }} />
                    Bulk Upload
                  </button>
                  <button
                    onClick={() => openAddModal('consultant')}
                    style={{
                      backgroundColor: '#4f46e5',
                      color: 'white',
                      padding: '12px 20px',
                      borderRadius: '12px',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)'
                    }}
                  >
                    <Plus style={{ width: '16px', height: '16px' }} />
                    Add Consultant
                  </button>
                </div>
              )}
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '16px'
            }}>
              <input
                type="text"
                placeholder="Search consultants by name, company, VAT, email..."
                value={searchQueries.consultants}
                onChange={(e) => handleSearch('consultants', e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 500,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <div style={{
              backgroundColor: 'white',
              borderRadius: '24px',
              border: '1px solid #f1f5f9',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              overflow: 'hidden'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer' }} onClick={() => handleSort('consultants', 'first_name')}>
                        Identity {sortConfig.consultants.key === 'first_name' && (sortConfig.consultants.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer' }} onClick={() => handleSort('consultants', 'company_name')}>
                        Legal Entity {sortConfig.consultants.key === 'company_name' && (sortConfig.consultants.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tax ID</th>
                      <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contract ID</th>
                      <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact</th>
                      <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Banking</th>
                      <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Created</th>
                      {user.role === 'admin' && <th style={{ textAlign: 'center', padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Operations</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filterAndSort(consultants, 'consultants').map((consultant) => (
                      <tr key={consultant.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '12px',
                              backgroundColor: '#eef2ff',
                              color: '#4f46e5',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '13px',
                              fontWeight: 800
                            }}>
                              {(consultant.first_name?.[0] || '')}{(consultant.last_name?.[0] || '')}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>{consultant.first_name} {consultant.last_name}</div>
                              <div style={{ fontSize: '12px', color: '#94a3b8' }}>{consultant.email || 'No email'}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: 600, color: '#334155', fontSize: '14px' }}>{consultant.company_name}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Limited Liability</div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <code style={{ fontSize: '12px', fontFamily: 'monospace', color: '#475569', backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '8px' }}>
                            {consultant.company_vat}
                          </code>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          {consultant.consultant_contract_id ? (
                            <code style={{ fontSize: '12px', fontFamily: 'monospace', color: '#4f46e5', backgroundColor: '#eef2ff', padding: '4px 10px', borderRadius: '8px' }}>
                              {consultant.consultant_contract_id}
                            </code>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>-</span>
                          )}
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontSize: '13px', color: '#475569' }}>{consultant.phone || '-'}</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>{consultant.company_address || '-'}</div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748b' }}>{consultant.iban || '-'}</div>
                          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{consultant.swift || '-'}</div>
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '13px', color: '#64748b' }}>{formatDate(consultant.created_at)}</td>
                        {user.role === 'admin' && (
                          <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button 
                                onClick={() => editItem('consultant', consultant)} 
                                style={{
                                  padding: '8px',
                                  borderRadius: '10px',
                                  border: '1px solid #e2e8f0',
                                  backgroundColor: 'white',
                                  color: '#64748b',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                                title="Edit"
                              >
                                <Edit style={{ width: '16px', height: '16px' }} />
                              </button>
                              <button 
                                onClick={() => deleteConsultant(consultant.id)} 
                                style={{
                                  padding: '8px',
                                  borderRadius: '10px',
                                  border: '1px solid #e2e8f0',
                                  backgroundColor: 'white',
                                  color: '#64748b',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                                title="Delete"
                              >
                                <Trash2 style={{ width: '16px', height: '16px' }} />
                              </button>
                            </div>
                          </td>
                        )}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.025em', margin: 0 }}>Clients</h2>
              {user.role === 'admin' && (
                <button
                  onClick={() => openAddModal('client')}
                  style={{
                    backgroundColor: '#4f46e5',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)'
                  }}
                >
                  <Plus style={{ width: '16px', height: '16px' }} />
                  Add Client
                </button>
              )}
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '16px'
            }}>
              <input
                type="text"
                placeholder="Search clients by name, company, VAT, email..."
                value={searchQueries.clients}
                onChange={(e) => handleSearch('clients', e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 500,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <div style={{
              backgroundColor: 'white',
              borderRadius: '24px',
              border: '1px solid #f1f5f9',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              overflow: 'hidden'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer' }} onClick={() => handleSort('clients', 'first_name')}>
                        Identity {sortConfig.clients.key === 'first_name' && (sortConfig.clients.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer' }} onClick={() => handleSort('clients', 'company_name')}>
                        Legal Entity {sortConfig.clients.key === 'company_name' && (sortConfig.clients.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tax ID</th>
                      <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contract ID</th>
                      <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact</th>
                      <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Created</th>
                      {user.role === 'admin' && <th style={{ textAlign: 'center', padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Operations</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filterAndSort(clients, 'clients').map((client) => (
                      <tr key={client.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '12px',
                              backgroundColor: '#ecfdf5',
                              color: '#059669',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '13px',
                              fontWeight: 800
                            }}>
                              {(client.first_name?.[0] || '')}{(client.last_name?.[0] || '')}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>{client.first_name} {client.last_name}</div>
                              <div style={{ fontSize: '12px', color: '#94a3b8' }}>{client.email || 'No email'}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: 600, color: '#334155', fontSize: '14px' }}>{client.company_name}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Partner</div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <code style={{ fontSize: '12px', fontFamily: 'monospace', color: '#475569', backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '8px' }}>
                            {client.company_vat}
                          </code>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          {client.client_contract_id ? (
                            <code style={{ fontSize: '12px', fontFamily: 'monospace', color: '#059669', backgroundColor: '#ecfdf5', padding: '4px 10px', borderRadius: '8px' }}>
                              {client.client_contract_id}
                            </code>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>-</span>
                          )}
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontSize: '13px', color: '#475569' }}>{client.phone || '-'}</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>{client.company_address || '-'}</div>
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '13px', color: '#64748b' }}>{formatDate(client.created_at)}</td>
                        {user.role === 'admin' && (
                          <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button 
                                onClick={() => editItem('client', client)} 
                                style={{
                                  padding: '8px',
                                  borderRadius: '10px',
                                  border: '1px solid #e2e8f0',
                                  backgroundColor: 'white',
                                  color: '#64748b',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                                title="Edit"
                              >
                                <Edit style={{ width: '16px', height: '16px' }} />
                              </button>
                              <button 
                                onClick={() => deleteClient(client.id)} 
                                style={{
                                  padding: '8px',
                                  borderRadius: '10px',
                                  border: '1px solid #e2e8f0',
                                  backgroundColor: 'white',
                                  color: '#64748b',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                                title="Delete"
                              >
                                <Trash2 style={{ width: '16px', height: '16px' }} />
                              </button>
                            </div>
                          </td>
                        )}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.025em', margin: 0 }}>Contracts</h2>
              {user.role === 'admin' && (
                <button
                  onClick={() => openAddModal('contract')}
                  style={{
                    backgroundColor: '#4f46e5',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)'
                  }}
                >
                  <Plus style={{ width: '16px', height: '16px' }} />
                  Add Contract
                </button>
              )}
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '16px'
            }}>
              <input
                type="text"
                placeholder="Search contracts by number, consultant, client..."
                value={searchQueries.contracts}
                onChange={(e) => handleSearch('contracts', e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 500,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <div style={{
              backgroundColor: 'white',
              borderRadius: '24px',
              border: '1px solid #f1f5f9',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              overflow: 'hidden'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer' }} onClick={() => handleSort('contracts', 'contract_number')}>
                        Contract {sortConfig.contracts.key === 'contract_number' && (sortConfig.contracts.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Parties</th>
                      <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Period</th>
                      <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pricing</th>
                      <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                      {user.role === 'admin' && <th style={{ textAlign: 'center', padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Operations</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filterAndSort(contracts, 'contracts').map((contract) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const startDate = new Date(contract.from_date);
                      startDate.setHours(0, 0, 0, 0);
                      const endDate = new Date(contract.to_date);
                      endDate.setHours(23, 59, 59, 999);
                      const isActive = today >= startDate && today <= endDate;
                      
                      return (
                        <tr key={contract.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                          <td style={{ padding: '16px 20px' }}>
                            <code style={{ fontSize: '13px', fontFamily: 'monospace', color: '#4f46e5', fontWeight: 700 }}>{contract.contract_number || ''}</code>
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                              IDs: {contract.consultant_contract_id || 'N/A'} / {contract.client_contract_id || 'N/A'}
                            </div>
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <div>
                                <div style={{ fontSize: '12px', color: '#6366f1', fontWeight: 700, marginBottom: '2px' }}>Consultant</div>
                                <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>{contract.consultant_first_name} {contract.consultant_last_name}</div>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>{contract.consultant_company_name}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 700, marginBottom: '2px' }}>Client</div>
                                <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>{contract.client_first_name} {contract.client_last_name}</div>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>{contract.client_company_name}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ fontSize: '13px', color: '#475569' }}>{formatDate(contract.from_date)}</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>to {formatDate(contract.to_date)}</div>
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div>
                                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Buy: </span>
                                <span style={{ fontSize: '14px', fontWeight: 700, color: '#f59e0b' }}>{formatCurrency(contract.purchase_price)}</span>
                              </div>
                              <div>
                                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Sell: </span>
                                <span style={{ fontSize: '14px', fontWeight: 700, color: '#10b981' }}>{formatCurrency(contract.sell_price)}</span>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <span style={{
                              padding: '6px 12px',
                              borderRadius: '20px',
                              fontSize: '11px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              backgroundColor: isActive ? '#ecfdf5' : '#f1f5f9',
                              color: isActive ? '#059669' : '#64748b',
                              border: isActive ? '1px solid #a7f3d0' : '1px solid #e2e8f0'
                            }}>
                              {isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          {user.role === 'admin' && (
                            <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                <button 
                                  onClick={() => editItem('contract', contract)} 
                                  style={{
                                    padding: '8px',
                                    borderRadius: '10px',
                                    border: '1px solid #e2e8f0',
                                    backgroundColor: 'white',
                                    color: '#64748b',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                  }}
                                  title="Edit"
                                >
                                  <Edit style={{ width: '16px', height: '16px' }} />
                                </button>
                                <button 
                                  onClick={() => deleteContract(contract.id)} 
                                  style={{
                                    padding: '8px',
                                    borderRadius: '10px',
                                    border: '1px solid #e2e8f0',
                                    backgroundColor: 'white',
                                    color: '#64748b',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                  }}
                                  title="Delete"
                                >
                                  <Trash2 style={{ width: '16px', height: '16px' }} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Timesheets Tab - ✅ UPDATED WITH calculateTotalDays */}
        {activeTab === 'timesheets' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.025em', margin: 0 }}>Timesheet Management</h2>
              {timesheetStatus && (
                <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>
                  Checking {timesheetStatus.checking_month} {timesheetStatus.checking_year} timesheets 
                  <span style={{ color: '#94a3b8', marginLeft: '8px' }}>(Deadline: {timesheetStatus.deadline_day}th of each month)</span>
                </p>
              )}
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '24px',
              border: '1px solid #f1f5f9',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              overflow: 'hidden'
            }}>
              {/* Subtab Navigation */}
              <div style={{ display: 'flex', gap: '8px', padding: '20px 24px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
                <button
                  type="button"
                  onClick={() => setActiveTimesheetTab('current')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: activeTimesheetTab === 'current' ? '#4f46e5' : 'white',
                    color: activeTimesheetTab === 'current' ? 'white' : '#64748b',
                    boxShadow: activeTimesheetTab === 'current' ? '0 4px 14px rgba(79, 70, 229, 0.3)' : '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                >
                  Current Month
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor: activeTimesheetTab === 'current' ? 'rgba(255,255,255,0.2)' : '#ecfdf5',
                    color: activeTimesheetTab === 'current' ? 'white' : '#059669'
                  }}>
                    {timesheetStatus?.consultants?.filter(c => c.has_timesheet && c.timesheet_processed).length || 0}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTimesheetTab('older')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: activeTimesheetTab === 'older' ? '#f59e0b' : 'white',
                    color: activeTimesheetTab === 'older' ? 'white' : '#64748b',
                    boxShadow: activeTimesheetTab === 'older' ? '0 4px 14px rgba(245, 158, 11, 0.3)' : '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                >
                  Older Timesheets
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor: activeTimesheetTab === 'older' ? 'rgba(255,255,255,0.2)' : '#fffbeb',
                    color: activeTimesheetTab === 'older' ? 'white' : '#d97706'
                  }}>
                    {timesheets.filter(ts => 
                      ts.month && 
                      ts.month.toLowerCase() !== timesheetStatus?.checking_month?.toLowerCase() &&
                      !ts.invoice_generated &&
                      !ts.flagged_for_review
                    ).length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTimesheetTab('needs-review')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: activeTimesheetTab === 'needs-review' ? '#eab308' : 'white',
                    color: activeTimesheetTab === 'needs-review' ? 'white' : '#64748b',
                    boxShadow: activeTimesheetTab === 'needs-review' ? '0 4px 14px rgba(234, 179, 8, 0.3)' : '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                >
                  Needs Review
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor: activeTimesheetTab === 'needs-review' ? 'rgba(255,255,255,0.2)' : '#fef9c3',
                    color: activeTimesheetTab === 'needs-review' ? 'white' : '#a16207'
                  }}>
                    {timesheets.filter(ts => 
                      (ts.flagged_for_review || 
                       (!ts.month && ts.status !== 'no_pdf' && ts.status !== 'multiple_pdfs')) &&
                      !ts.invoice_generated
                    ).length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTimesheetTab('problematic')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: activeTimesheetTab === 'problematic' ? '#ef4444' : 'white',
                    color: activeTimesheetTab === 'problematic' ? 'white' : '#64748b',
                    boxShadow: activeTimesheetTab === 'problematic' ? '0 4px 14px rgba(239, 68, 68, 0.3)' : '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                >
                  Problematic
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor: activeTimesheetTab === 'problematic' ? 'rgba(255,255,255,0.2)' : '#fef2f2',
                    color: activeTimesheetTab === 'problematic' ? 'white' : '#dc2626'
                  }}>
                    {timesheets.filter(ts => 
                      (ts.status === 'no_pdf' || ts.status === 'multiple_pdfs') &&
                      !ts.flagged_for_review
                    ).length}
                  </span>
                </button>
              </div>

              {/* CURRENT MONTH TAB CONTENT */}
              {activeTimesheetTab === 'current' && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date Received</th>
                        <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                        <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
                        <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Month</th>
                        <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Days Worked</th>
                        <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Match Status</th>
                        <th style={{ textAlign: 'center', padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timesheetStatus?.consultants?.map((consultant) => {
                        // Find matching timesheet - exclude flagged items (they're in Needs Review)
                        const timesheet = timesheets.find(ts => {
                          if (ts.flagged_for_review) return false; // Exclude flagged items
                          if (ts.sender_email?.toLowerCase() !== consultant.email?.toLowerCase()) return false;
                          if (ts.month) {
                            return ts.month.toLowerCase() === consultant.checking_month?.toLowerCase();
                          }
                          const checkingDate = new Date(consultant.checking_year, 
                            ['January', 'February', 'March', 'April', 'May', 'June', 
                             'July', 'August', 'September', 'October', 'November', 'December']
                            .indexOf(consultant.checking_month), 1);
                          const timesheetDate = new Date(ts.created_at);
                          return timesheetDate.getMonth() === checkingDate.getMonth() &&
                                 timesheetDate.getFullYear() === checkingDate.getFullYear();
                        });
                        
                        let rowBgColor = '';
                        // ✅ FIXED: If timesheet found with invoice generated, always green
                        if (timesheet?.invoice_generated || consultant.status === 'received') {
                          rowBgColor = 'bg-green-50';
                        } else if (timesheet) {
                          // Timesheet exists but not invoiced yet - still good (green-ish)
                          rowBgColor = 'bg-green-50';
                        } else if (consultant.status === 'waiting') {
                          rowBgColor = 'bg-yellow-50';
                        } else if (consultant.status === 'overdue') {
                          rowBgColor = 'bg-red-50';
                        }
                        
                        // ✅ Calculate total days using helper function
                        const totalDays = calculateTotalDays(timesheet);
                        
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
                              {timesheet?.month ? (
                                <span>{timesheet.month} {consultant.checking_year}</span>
                              ) : (
                                <span>{consultant.checking_month} {consultant.checking_year}</span>
                              )}
                            </td>
                            <td className="p-4">
                              {timesheet ? (
                                totalDays !== null ? (
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
                                        {totalDays}
                                      </span>
                                    </div>
                                  )
                                ) : (
                                  <span className="text-yellow-600 italic text-sm flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    Processing...
                                  </span>
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
                                    onClick={() => {
                                      const fixedUrl = fixTimesheetUrl(timesheet.timesheet_file_url);
                                      window.open(fixedUrl, '_blank');
                                    }}
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
                                        setGeneratingInvoice(timesheet.id);
                                        await apiCall(`/timesheets/${timesheet.id}/generate-invoice`, {
                                          method: 'POST'
                                        });
                                        showNotification('Invoice generated successfully!');
                                        loadData();
                                      } catch (error) {
                                        showNotification('Failed to generate invoice: ' + error.message, 'error');
                                      } finally {
                                        setGeneratingInvoice(null);
                                      }
                                    }}
                                    disabled={generatingInvoice === timesheet.id}
                                    className={`px-2 py-1 text-xs rounded hover:bg-green-700 transition flex items-center gap-1 ${
                                      generatingInvoice === timesheet.id 
                                        ? 'bg-green-400 cursor-not-allowed' 
                                        : 'bg-green-600 text-white'
                                    }`}
                                    title="Generate Invoice"
                                  >
                                    {generatingInvoice === timesheet.id ? (
                                      <>
                                        <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div>
                                        Generating...
                                      </>
                                    ) : (
                                      <>
                                        <FileText className="h-3 w-3" />
                                        Invoice
                                      </>
                                    )}
                                  </button>
                                )}
                                {timesheet?.invoice_generated && (
                                  <span className="text-xs text-green-600 flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    Invoiced
                                  </span>
                                )}
                                {timesheet && !timesheet.invoice_generated && !timesheet.flagged_for_review && (
                                  <button
                                    onClick={() => flagForReview(timesheet.id)}
                                    className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition flex items-center gap-1"
                                    title="Flag for admin review"
                                  >
                                    <AlertCircle className="h-3 w-3" />
                                    Flag
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* NEEDS REVIEW TAB CONTENT - Includes flagged items and items without month */}
              {activeTimesheetTab === 'needs-review' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-yellow-50">
                      <tr>
                        <th className="text-left p-4 font-medium text-gray-600">Date Received</th>
                        <th className="text-left p-4 font-medium text-gray-600">Name</th>
                        <th className="text-left p-4 font-medium text-gray-600">Email</th>
                        <th className="text-left p-4 font-medium text-gray-600">Month</th>
                        <th className="text-left p-4 font-medium text-gray-600">Days Worked</th>
                        <th className="text-left p-4 font-medium text-gray-600">Reason</th>
                        <th className="text-left p-4 font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timesheets.filter(ts => 
                        // Flagged items ALWAYS show in Needs Review (regardless of status)
                        // OR items without month that aren't problematic
                        (ts.flagged_for_review || 
                         (!ts.month && ts.status !== 'no_pdf' && ts.status !== 'multiple_pdfs')) &&
                        !ts.invoice_generated
                      ).length === 0 ? (
                        <tr>
                          <td colSpan="7" className="p-8 text-center text-gray-500">
                            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-2" />
                            <p className="font-medium">No timesheets need review!</p>
                            <p className="text-sm">All timesheets are ready for processing.</p>
                          </td>
                        </tr>
                      ) : (
                        timesheets.filter(ts => 
                          (ts.flagged_for_review || 
                           (!ts.month && ts.status !== 'no_pdf' && ts.status !== 'multiple_pdfs')) &&
                          !ts.invoice_generated
                        ).map((timesheet) => {
                          const consultant = consultants.find(c => 
                            c.email?.toLowerCase() === timesheet.sender_email?.toLowerCase()
                          );
                          
                          const totalDays = calculateTotalDays(timesheet);
                          
                          return (
                            <tr key={timesheet.id} className="border-b hover:bg-yellow-50 transition">
                              <td className="p-4 text-sm">
                                {new Date(timesheet.created_at).toLocaleDateString('en-GB')}
                              </td>
                              <td className="p-4">
                                {consultant ? (
                                  <>
                                    <div className="font-medium">{consultant.first_name} {consultant.last_name}</div>
                                    <div className="text-xs text-gray-600">{consultant.company_name}</div>
                                  </>
                                ) : (
                                  <div className="text-yellow-600 italic">Unknown Consultant</div>
                                )}
                              </td>
                              <td className="p-4 text-sm font-mono">{timesheet.sender_email}</td>
                              
                              {/* Month - Editable */}
                              <td className="p-4">
                                {editingMonth === timesheet.id ? (
                                  <div className="flex items-center gap-1">
                                    <select
                                      value={editMonthValue}
                                      onChange={(e) => setEditMonthValue(e.target.value)}
                                      className="border border-yellow-500 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
                                      autoFocus
                                    >
                                      <option value="">Select Month</option>
                                      {['January', 'February', 'March', 'April', 'May', 'June', 
                                        'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                        <option key={m} value={m}>{m}</option>
                                      ))}
                                    </select>
                                    <button
                                      onClick={() => updateMonth(timesheet.id, editMonthValue)}
                                      className="text-green-600 hover:text-green-800 p-1"
                                      title="Save"
                                      disabled={!editMonthValue}
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={cancelEditMonth}
                                      className="text-gray-400 hover:text-gray-600 p-1"
                                      title="Cancel"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ) : timesheet.month ? (
                                  <div
                                    onClick={() => startEditMonth(timesheet)}
                                    className="cursor-pointer hover:bg-yellow-100 px-2 py-1 rounded transition inline-flex items-center gap-1"
                                    title="Click to edit month"
                                  >
                                    <span className="font-medium">{timesheet.month}</span>
                                    <Edit className="h-3 w-3 text-gray-400" />
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => startEditMonth(timesheet)}
                                    className="bg-yellow-100 hover:bg-yellow-200 px-2 py-1 rounded transition flex items-center gap-1 border border-yellow-300 text-sm"
                                  >
                                    <AlertCircle className="h-3 w-3 text-yellow-600" />
                                    <span className="text-yellow-700">Set month</span>
                                  </button>
                                )}
                              </td>

                              {/* Days - Editable */}
                              <td className="p-4">
                                {editingDays === timesheet.id ? (
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
                                ) : totalDays !== null ? (
                                  <div
                                    onClick={() => startEditDays(timesheet)}
                                    className="cursor-pointer hover:bg-blue-100 px-2 py-1 rounded transition inline-flex items-center gap-1"
                                    title="Click to edit days"
                                  >
                                    <span className="font-bold text-blue-600">{totalDays}</span>
                                    <Edit className="h-3 w-3 text-gray-400" />
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setEditingDays(timesheet.id);
                                      setEditDaysValue('');
                                    }}
                                    className="bg-yellow-100 hover:bg-yellow-200 px-2 py-1 rounded transition flex items-center gap-1 border border-yellow-300 text-sm cursor-pointer"
                                    title="Click to set days"
                                  >
                                    <AlertCircle className="h-3 w-3 text-yellow-600" />
                                    <span className="text-yellow-700">Set days</span>
                                  </button>
                                )}
                              </td>

                              {/* Reason */}
                              <td className="p-4">
                                {timesheet.flagged_for_review ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                                    <AlertCircle className="h-3 w-3" />
                                    Flagged by operator
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                    Month not detected
                                  </span>
                                )}
                              </td>

                              {/* Actions */}
                              <td className="p-4">
                                <div className="flex gap-2">
                                  {timesheet.timesheet_file_url && (
                                    <button
                                      onClick={() => {
                                        const fixedUrl = fixTimesheetUrl(timesheet.timesheet_file_url);
                                        window.open(fixedUrl, '_blank');
                                      }}
                                      className="text-blue-600 hover:text-blue-800 p-1 transition"
                                      title="View Timesheet PDF"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </button>
                                  )}
                                  {timesheet.flagged_for_review && (
                                    <button
                                      onClick={() => unflagForReview(timesheet.id)}
                                      className="px-2 py-1 text-xs rounded bg-green-100 text-green-700 hover:bg-green-200 transition flex items-center gap-1"
                                      title="Remove flag and return to normal queue"
                                    >
                                      <CheckCircle className="h-3 w-3" />
                                      Unflag
                                    </button>
                                  )}
                                  {timesheet.month && !timesheet.invoice_generated && (
                                    <button
                                      onClick={async () => {
                                        try {
                                          setGeneratingInvoice(timesheet.id);
                                          await apiCall(`/timesheets/${timesheet.id}/generate-invoice`, {
                                            method: 'POST'
                                          });
                                          showNotification('Invoice generated successfully!');
                                          loadData();
                                        } catch (error) {
                                          showNotification('Failed to generate invoice: ' + error.message, 'error');
                                        } finally {
                                          setGeneratingInvoice(null);
                                        }
                                      }}
                                      disabled={generatingInvoice === timesheet.id}
                                      className={`px-2 py-1 text-xs rounded hover:bg-green-700 transition flex items-center gap-1 ${
                                        generatingInvoice === timesheet.id 
                                          ? 'bg-green-400 cursor-not-allowed' 
                                          : 'bg-green-600 text-white'
                                      }`}
                                      title="Generate Invoice"
                                    >
                                      {generatingInvoice === timesheet.id ? (
                                        <>
                                          <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div>
                                          Generating...
                                        </>
                                      ) : (
                                        <>
                                          <FileText className="h-3 w-3" />
                                          Invoice
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* OLDER TIMESHEETS TAB CONTENT */}
              {activeTimesheetTab === 'older' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-4 font-medium text-gray-600">Date Received</th>
                        <th className="text-left p-4 font-medium text-gray-600">Name</th>
                        <th className="text-left p-4 font-medium text-gray-600">Email</th>
                        <th className="text-left p-4 font-medium text-gray-600">Month</th>
                        <th className="text-left p-4 font-medium text-gray-600">Days Worked</th>
                        <th className="text-left p-4 font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timesheets.filter(ts => 
                        ts.month && 
                        ts.month.toLowerCase() !== timesheetStatus?.checking_month?.toLowerCase() &&
                        !ts.invoice_generated &&
                        !ts.flagged_for_review
                      ).length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-gray-500">
                            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-2" />
                            <p className="font-medium">No older timesheets pending!</p>
                            <p className="text-sm">All previous months have been invoiced.</p>
                          </td>
                        </tr>
                      ) : (
                        timesheets.filter(ts => 
                          ts.month && 
                          ts.month.toLowerCase() !== timesheetStatus?.checking_month?.toLowerCase() &&
                          !ts.invoice_generated &&
                          !ts.flagged_for_review
                        ).map((timesheet) => {
                          const consultant = consultants.find(c => 
                            c.email?.toLowerCase() === timesheet.sender_email?.toLowerCase()
                          );
                          
                          const totalDays = calculateTotalDays(timesheet);
                          
                          return (
                            <tr key={timesheet.id} className="border-b hover:bg-orange-50 transition">
                              <td className="p-4 text-sm">
                                {new Date(timesheet.created_at).toLocaleDateString('en-GB')}
                              </td>
                              <td className="p-4">
                                {consultant ? (
                                  <>
                                    <div className="font-medium">{consultant.first_name} {consultant.last_name}</div>
                                    <div className="text-xs text-gray-600">{consultant.company_name}</div>
                                  </>
                                ) : (
                                  <div className="text-orange-600 italic">Unknown Consultant</div>
                                )}
                              </td>
                              <td className="p-4 text-sm font-mono">{timesheet.sender_email}</td>
                              <td className="p-4">
                                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                                  {timesheet.month}
                                </span>
                              </td>
                              <td className="p-4">
                                {totalDays !== null ? (
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
                                        {totalDays}
                                      </span>
                                    </div>
                                  )
                                ) : (
                                  <span className="text-yellow-600 italic text-sm flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    Processing...
                                  </span>
                                )}
                              </td>
                              <td className="p-4">
                                <div className="flex gap-2">
                                  {timesheet.timesheet_file_url && (
                                    <button
                                      onClick={() => {
                                        const fixedUrl = fixTimesheetUrl(timesheet.timesheet_file_url);
                                        window.open(fixedUrl, '_blank');
                                      }}
                                      className="text-blue-600 hover:text-blue-800 p-1 transition"
                                      title="View Timesheet PDF"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </button>
                                  )}
                                  <button
                                    onClick={async () => {
                                      try {
                                        setGeneratingInvoice(timesheet.id);
                                        await apiCall(`/timesheets/${timesheet.id}/generate-invoice`, {
                                          method: 'POST'
                                        });
                                        showNotification('Invoice generated successfully!');
                                        loadData();
                                      } catch (error) {
                                        showNotification('Failed to generate invoice: ' + error.message, 'error');
                                      } finally {
                                        setGeneratingInvoice(null);
                                      }
                                    }}
                                    disabled={generatingInvoice === timesheet.id}
                                    className={`px-2 py-1 text-xs rounded hover:bg-green-700 transition flex items-center gap-1 ${
                                      generatingInvoice === timesheet.id 
                                        ? 'bg-green-400 cursor-not-allowed' 
                                        : 'bg-green-600 text-white'
                                    }`}
                                    title="Generate Invoice"
                                  >
                                    {generatingInvoice === timesheet.id ? (
                                      <>
                                        <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div>
                                        Generating...
                                      </>
                                    ) : (
                                      <>
                                        <FileText className="h-3 w-3" />
                                        Invoice
                                      </>
                                    )}
                                  </button>
                                  {!timesheet.flagged_for_review && (
                                    <button
                                      onClick={() => flagForReview(timesheet.id)}
                                      className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition flex items-center gap-1"
                                      title="Flag for admin review"
                                    >
                                      <AlertCircle className="h-3 w-3" />
                                      Flag
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* PROBLEMATIC EMAILS TAB CONTENT */}
              {activeTimesheetTab === 'problematic' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-red-50">
                      <tr>
                        <th className="text-left p-4 font-medium text-gray-600">Date Received</th>
                        <th className="text-left p-4 font-medium text-gray-600">Name</th>
                        <th className="text-left p-4 font-medium text-gray-600">Email</th>
                        <th className="text-left p-4 font-medium text-gray-600">Phone</th>
                        <th className="text-left p-4 font-medium text-gray-600">Issue</th>
                        <th className="text-left p-4 font-medium text-gray-600">Notes</th>
                        <th className="text-left p-4 font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timesheets.filter(ts => (ts.status === 'no_pdf' || ts.status === 'multiple_pdfs') && !ts.flagged_for_review).length === 0 ? (
                        <tr>
                          <td colSpan="7" className="p-8 text-center text-gray-500">
                            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-2" />
                            <p className="font-medium">No problematic emails!</p>
                            <p className="text-sm">All received emails had proper attachments.</p>
                          </td>
                        </tr>
                      ) : (
                        timesheets.filter(ts => (ts.status === 'no_pdf' || ts.status === 'multiple_pdfs') && !ts.flagged_for_review).map((timesheet) => {
                          const consultant = consultants.find(c => 
                            c.email?.toLowerCase() === timesheet.sender_email?.toLowerCase()
                          );
                          
                          return (
                            <tr key={timesheet.id} className="border-b hover:bg-red-50 transition">
                              <td className="p-4 text-sm">
                                {new Date(timesheet.created_at).toLocaleDateString('en-GB')}
                              </td>
                              <td className="p-4">
                                {consultant ? (
                                  <>
                                    <div className="font-medium">{consultant.first_name} {consultant.last_name}</div>
                                    <div className="text-xs text-gray-600">{consultant.company_name}</div>
                                  </>
                                ) : (
                                  <div className="text-red-600 italic">Unknown Sender</div>
                                )}
                              </td>
                              <td className="p-4 text-sm font-mono">{timesheet.sender_email}</td>
                              <td className="p-4 text-sm">
                                {consultant?.phone ? (
                                  <a href={`tel:${consultant.phone}`} className="text-blue-600 hover:underline">
                                    {consultant.phone}
                                  </a>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="p-4">
                                {timesheet.status === 'no_pdf' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                    <AlertCircle className="h-3 w-3" />
                                    No PDF Attached
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                                    <AlertCircle className="h-3 w-3" />
                                    Multiple PDFs
                                  </span>
                                )}
                              </td>
                              <td className="p-4 text-sm text-gray-600 max-w-xs truncate" title={timesheet.notes}>
                                {timesheet.notes || '-'}
                              </td>
                              <td className="p-4">
                                {(user?.role === 'admin' || user?.permissions?.can_delete_timesheets) ? (
                                  <button
                                    onClick={async () => {
                                      if (window.confirm('Delete this record? The sender will need to resend their email correctly.')) {
                                        try {
                                          const authToken = localStorage.getItem('authToken');
                                          const response = await fetch(`${API_BASE_URL}/timesheets/${timesheet.id}`, {
                                            method: 'DELETE',
                                            headers: { 'Authorization': `Bearer ${authToken}` }
                                          });
                                          if (response.ok) {
                                            loadData();
                                            showNotification('Record deleted', 'success');
                                          } else {
                                            showNotification('Failed to delete', 'error');
                                          }
                                        } catch (error) {
                                          showNotification('Failed to delete', 'error');
                                        }
                                      }
                                    }}
                                    className="text-red-600 hover:text-red-800 p-1 transition"
                                    title="Delete this record"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                ) : (
                                  <span className="text-xs text-gray-400 italic">Admin only</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
 
        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.025em', margin: 0 }}>Generated Invoices</h2>
              <span style={{ 
                fontSize: '13px', 
                color: '#64748b',
                backgroundColor: '#f1f5f9',
                padding: '8px 16px',
                borderRadius: '20px',
                fontWeight: 600
              }}>{invoices.length} invoices total</span>
            </div>

            {invoices.length > 0 && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '16px'
              }}>
                <input
                  type="text"
                  placeholder="Search invoices by number, name, company..."
                  value={searchQueries.invoices}
                  onChange={(e) => handleSearch('invoices', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 500,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            )}
            
            {invoices.length === 0 ? (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '24px',
                padding: '64px 32px',
                textAlign: 'center',
                border: '1px solid #f1f5f9',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
              }}>
                <FileText style={{ width: '64px', height: '64px', color: '#cbd5e1', margin: '0 auto 24px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>No invoices generated yet</h3>
                <p style={{ fontSize: '14px', color: '#64748b' }}>Go to the dashboard to generate invoices from your contracts</p>
              </div>
            ) : (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '24px',
                border: '1px solid #f1f5f9',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden'
              }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer' }} onClick={() => handleSort('invoices', 'invoice_number')}>
                          Invoice # {sortConfig.invoices.key === 'invoice_number' && (sortConfig.invoices.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                        <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer' }} onClick={() => handleSort('invoices', 'invoice_date')}>
                          Date {sortConfig.invoices.key === 'invoice_date' && (sortConfig.invoices.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Period</th>
                        <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Days</th>
                        <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rate</th>
                        <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer' }} onClick={() => handleSort('invoices', 'total_amount')}>
                          Total {sortConfig.invoices.key === 'total_amount' && (sortConfig.invoices.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                        <th style={{ textAlign: 'center', padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filterAndSort(invoices, 'invoices').map((invoice) => {
                        const subtotal = parseFloat(invoice.subtotal);
                        const vatRate = parseFloat(invoice.vat_rate);
                        const vatEnabled = invoice.vat_enabled !== false;
                        const vatAmount = vatEnabled ? (subtotal * vatRate / 100) : 0;
                        const total = subtotal + vatAmount;
                        
                        return (
                          <tr key={invoice.id} className="border-b hover:bg-gray-50 group">
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
                                  <button onClick={() => updateInvoiceNumber(invoice.id)} className="text-green-600 hover:text-green-800 p-1" title="Save">
                                    <CheckCircle className="h-4 w-4" />
                                  </button>
                                  <button onClick={cancelEditInvoiceNumber} className="text-gray-400 hover:text-gray-600 p-1" title="Cancel">×</button>
                                </div>
                              ) : (
                                <div onClick={() => startEditInvoiceNumber(invoice)} className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition inline-block" title="Click to edit">
                                  {invoice.invoice_number}
                                </div>
                              )}
                            </td>
                            <td className="p-4 text-sm">
                              <div>
                                {invoice.invoice_type === 'consultant' ? (
                                  <>
                                    <div className="font-medium">{invoice.consultant_first_name} {invoice.consultant_last_name}</div>
                                    <div className="text-gray-600">{invoice.consultant_company_name}</div>
                                  </>
                                ) : (
                                  <>
                                    <div className="font-medium">{invoice.client_first_name} {invoice.client_last_name}</div>
                                    <div className="text-gray-600">{invoice.client_company_name}</div>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="p-4 text-sm">{new Date(invoice.period_to).toLocaleDateString('en-GB')}</td>
                            <td className="p-4 text-xs">{new Date(invoice.period_to).toLocaleDateString('en-US', { month: 'long' })}</td>
                            <td className="p-4 font-medium">{invoice.days_worked}</td>
                            <td className="p-4">{formatCurrency(invoice.daily_rate)}</td>
                            <td className="p-4 font-medium">{formatCurrency(subtotal)}</td>
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
                            <td className="p-4 font-bold text-green-600">{formatCurrency(total)}</td>
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
                            <td className="p-4">
                              <div className="flex gap-2">
                                <button onClick={() => viewTimesheet(invoice)} className="text-blue-600 hover:text-blue-800 p-1 transition" title="View Timesheet">
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button onClick={() => downloadPDF(invoice)} className="text-green-600 hover:text-green-800 p-1 transition" title={invoice.pdf_url ? "Download PDF" : "Generate & Download PDF"} disabled={dataLoading}>
                                  <Download className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => sendInvoiceEmail(invoice)}
                                  className={`p-1 transition ${invoice.email_sent ? 'text-green-600 hover:text-green-800' : 'text-purple-600 hover:text-purple-800'}`}
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

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Timesheet & Invoice History</h2>
              <p className="text-sm text-gray-600">{timesheetHistory.length} total records</p>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-lg border shadow-sm p-4">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                {/* Search Box */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    placeholder="Search by name, email, invoice..."
                    value={searchQueries.history}
                    onChange={(e) => handleSearch('history', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                
                {/* Year Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <select
                    value={historyFilters.year}
                    onChange={(e) => setHistoryFilters(prev => ({ ...prev, year: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="all">All Years</option>
                    {[...new Set(timesheetHistory.map(ts => new Date(ts.created_at).getFullYear()))]
                      .sort((a, b) => b - a)
                      .map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))
                    }
                  </select>
                </div>

                {/* Month Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                  <select
                    value={historyFilters.month}
                    onChange={(e) => setHistoryFilters(prev => ({ ...prev, month: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="all">All Months</option>
                    {['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>

                {/* Consultant Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Consultant</label>
                  <select
                    value={historyFilters.consultant}
                    onChange={(e) => setHistoryFilters(prev => ({ ...prev, consultant: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="all">All Consultants</option>
                    {consultants.map(c => (
                      <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={historyFilters.status}
                    onChange={(e) => setHistoryFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="all">All Status</option>
                    <option value="invoiced">Invoiced</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              {/* Clear Filters Button */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setHistoryFilters({ year: 'all', month: 'all', consultant: 'all', status: 'all' });
                    handleSearch('history', '');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 transition"
                >
                  Clear all filters
                </button>
              </div>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-4 font-medium text-gray-600">Date</th>
                      <th className="text-left p-4 font-medium text-gray-600">Consultant</th>
                      <th className="text-left p-4 font-medium text-gray-600">Month</th>
                      <th className="text-left p-4 font-medium text-gray-600">Days</th>
                      <th className="text-left p-4 font-medium text-gray-600">Status</th>
                      <th className="text-left p-4 font-medium text-gray-600">Consultant Invoice</th>
                      <th className="text-left p-4 font-medium text-gray-600">Client Invoice</th>
                      <th className="text-left p-4 font-medium text-gray-600">Timesheet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timesheetHistory
                      .filter(ts => {
                        // Apply search filter
                        if (searchQueries.history) {
                          const query = searchQueries.history.toLowerCase();
                          const matchesSearch = 
                            (ts.consultant_first_name?.toLowerCase() || '').includes(query) ||
                            (ts.consultant_last_name?.toLowerCase() || '').includes(query) ||
                            (ts.sender_email?.toLowerCase() || '').includes(query) ||
                            (ts.consultant_invoice_number?.toLowerCase() || '').includes(query) ||
                            (ts.client_invoice_number?.toLowerCase() || '').includes(query) ||
                            (ts.consultant_company_name?.toLowerCase() || '').includes(query);
                          if (!matchesSearch) return false;
                        }
                        
                        // Apply year filter
                        if (historyFilters.year !== 'all') {
                          const tsYear = new Date(ts.created_at).getFullYear();
                          if (tsYear !== parseInt(historyFilters.year)) return false;
                        }
                        
                        // Apply month filter
                        if (historyFilters.month !== 'all') {
                          if (ts.month?.toLowerCase() !== historyFilters.month.toLowerCase()) return false;
                        }
                        
                        // Apply consultant filter
                        if (historyFilters.consultant !== 'all') {
                          if (ts.consultant_id !== parseInt(historyFilters.consultant)) return false;
                        }
                        
                        // Apply status filter
                        if (historyFilters.status !== 'all') {
                          const isInvoiced = ts.invoice_generated;
                          if (historyFilters.status === 'invoiced' && !isInvoiced) return false;
                          if (historyFilters.status === 'pending' && isInvoiced) return false;
                        }
                        
                        return true;
                      })
                      .map((ts) => {
                        const totalDays = calculateTotalDays(ts);
                        
                        return (
                          <tr key={ts.id} className="border-b hover:bg-gray-50 transition">
                            <td className="p-4 text-sm">
                              {new Date(ts.created_at).toLocaleDateString('en-GB')}
                            </td>
                            <td className="p-4">
                              {ts.consultant_first_name ? (
                                <>
                                  <div className="font-medium">{ts.consultant_first_name} {ts.consultant_last_name}</div>
                                  <div className="text-xs text-gray-500">{ts.consultant_company_name}</div>
                                </>
                              ) : (
                                <span className="text-gray-400 italic">{ts.sender_email || 'Unknown'}</span>
                              )}
                            </td>
                            <td className="p-4">
                              {ts.month ? (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                  {ts.month}
                                </span>
                              ) : (
                                <span className="text-gray-400 italic">Not set</span>
                              )}
                            </td>
                            <td className="p-4 font-medium">
                              {totalDays !== null ? totalDays : '-'}
                            </td>
                            <td className="p-4">
                              {ts.invoice_generated ? (
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1 w-fit">
                                  <CheckCircle className="h-3 w-3" />
                                  Invoiced
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm flex items-center gap-1 w-fit">
                                  <AlertCircle className="h-3 w-3" />
                                  Pending
                                </span>
                              )}
                            </td>
                            <td className="p-4">
                              {ts.consultant_invoice_number ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-mono">{ts.consultant_invoice_number}</span>
                                  {ts.consultant_invoice_pdf_url && (
                                    <a
                                      href={ts.consultant_invoice_pdf_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800"
                                      title="View PDF"
                                    >
                                      <FileText className="h-4 w-4" />
                                    </a>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="p-4">
                              {ts.client_invoice_number ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-mono">{ts.client_invoice_number}</span>
                                  {ts.client_invoice_pdf_url && (
                                    <a
                                      href={ts.client_invoice_pdf_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800"
                                      title="View PDF"
                                    >
                                      <FileText className="h-4 w-4" />
                                    </a>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="p-4">
                              {ts.timesheet_file_url && (
                                <button
                                  onClick={() => {
                                    const fixedUrl = fixTimesheetUrl(ts.timesheet_file_url);
                                    window.open(fixedUrl, '_blank');
                                  }}
                                  className="text-blue-600 hover:text-blue-800 transition"
                                  title="View Timesheet PDF"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    }
                    {timesheetHistory.filter(ts => {
                      if (searchQueries.history) {
                        const query = searchQueries.history.toLowerCase();
                        const matchesSearch = 
                          (ts.consultant_first_name?.toLowerCase() || '').includes(query) ||
                          (ts.consultant_last_name?.toLowerCase() || '').includes(query) ||
                          (ts.sender_email?.toLowerCase() || '').includes(query) ||
                          (ts.consultant_invoice_number?.toLowerCase() || '').includes(query) ||
                          (ts.client_invoice_number?.toLowerCase() || '').includes(query) ||
                          (ts.consultant_company_name?.toLowerCase() || '').includes(query);
                        if (!matchesSearch) return false;
                      }
                      if (historyFilters.year !== 'all') {
                        const tsYear = new Date(ts.created_at).getFullYear();
                        if (tsYear !== parseInt(historyFilters.year)) return false;
                      }
                      if (historyFilters.month !== 'all') {
                        if (ts.month?.toLowerCase() !== historyFilters.month.toLowerCase()) return false;
                      }
                      if (historyFilters.consultant !== 'all') {
                        if (ts.consultant_id !== parseInt(historyFilters.consultant)) return false;
                      }
                      if (historyFilters.status !== 'all') {
                        const isInvoiced = ts.invoice_generated;
                        if (historyFilters.status === 'invoiced' && !isInvoiced) return false;
                        if (historyFilters.status === 'pending' && isInvoiced) return false;
                      }
                      return true;
                    }).length === 0 && (
                      <tr>
                        <td colSpan="8" className="p-8 text-center text-gray-500">
                          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                          <p className="font-medium">No records found</p>
                          <p className="text-sm">Try adjusting your filters or search query</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg border p-4">
                <p className="text-sm text-gray-600">Total Timesheets</p>
                <p className="text-2xl font-bold text-gray-800">{timesheetHistory.length}</p>
              </div>
              <div className="bg-white rounded-lg border p-4">
                <p className="text-sm text-gray-600">Invoiced</p>
                <p className="text-2xl font-bold text-green-600">
                  {timesheetHistory.filter(ts => ts.invoice_generated).length}
                </p>
              </div>
              <div className="bg-white rounded-lg border p-4">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {timesheetHistory.filter(ts => !ts.invoice_generated).length}
                </p>
              </div>
              <div className="bg-white rounded-lg border p-4">
                <p className="text-sm text-gray-600">Total Days Worked</p>
                <p className="text-2xl font-bold text-blue-600">
                  {timesheetHistory.reduce((sum, ts) => {
                    const days = calculateTotalDays(ts);
                    return sum + (days || 0);
                  }, 0).toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Users Management Tab (Admin Only) */}
        {activeTab === 'users' && user.role === 'admin' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">User Management</h2>
              <button
                onClick={openCreateUserModal}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition"
              >
                <Plus className="h-4 w-4" />
                Create User
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
                      <th className="text-left p-4 font-medium text-gray-600">Permissions</th>
                      <th className="text-left p-4 font-medium text-gray-600">Status</th>
                      <th className="text-left p-4 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div className="font-medium">{u.name || `${u.first_name || ''} ${u.last_name || ''}`}</div>
                          {u.id === user.id && <span className="text-xs text-blue-600">(You)</span>}
                        </td>
                        <td className="p-4 text-sm">{u.email}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4">
                          {u.role === 'admin' ? (
                            <span className="text-xs text-gray-500 italic">All permissions</span>
                          ) : (
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {u.permissions?.can_view_dashboard && (
                                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">Dashboard</span>
                              )}
                              {u.permissions?.can_view_contracts && (
                                <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">Contracts</span>
                              )}
                              {u.permissions?.can_view_consultants && (
                                <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs">Consultants</span>
                              )}
                              {u.permissions?.can_view_clients && (
                                <span className="px-1.5 py-0.5 bg-teal-100 text-teal-700 rounded text-xs">Clients</span>
                              )}
                              {u.permissions?.can_view_timesheets && (
                                <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">Timesheets</span>
                              )}
                              {u.permissions?.can_view_invoices && (
                                <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">Invoices</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {u.active !== false ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditUserModal(u)}
                              className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition"
                              title="Edit User"
                            >
                              Edit
                            </button>
                            {u.id !== user.id && (
                              <>
                                <button
                                  onClick={() => toggleUserActive(u.id)}
                                  className={`px-3 py-1 text-xs rounded transition ${u.active !== false ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                                  title={u.active !== false ? 'Disable User' : 'Enable User'}
                                >
                                  {u.active !== false ? 'Disable' : 'Enable'}
                                </button>
                                <button onClick={() => deleteUser(u.id)} className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition" title="Delete User">
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
