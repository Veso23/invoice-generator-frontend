import React, { useState, useEffect } from 'react';
import { FileText, Download, Plus, Edit, Trash2, Calculator, Users, Building, LogIn, LogOut, Eye, Send, CheckCircle, AlertCircle } from 'lucide-react';
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
        initialData[field.name] = '';
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
  if (field.type === 'select') {
    return (
      <div key={field.name}>
        {field.label && <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>}
        <select
          value={formData[field.name] || ''}
          onChange={(e) => setFormData({
            ...formData,
            [field.name]: e.target.value
          })}
          required={field.required !== false}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="">{field.placeholder}</option>
          {field.options?.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div key={field.name}>
      {field.label && <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>}
      <input
        type={field.type || 'text'}
        placeholder={field.placeholder}
        value={formData[field.name] || ''}
        onChange={(e) => setFormData({
          ...formData,
          [field.name]: e.target.value
        })}
        required={field.required !== false}
        step={field.step}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
// Main Application
const InvoiceGeneratorApp = () => {
  const { user, login, register, logout, loading } = useAuth();
  const [consultants, setConsultants] = useState([]);
  const [clients, setClients] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [automationLogs, setAutomationLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dataLoading, setDataLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({});
  const [timesheets, setTimesheets] = useState([]);
  const [matchingTimesheet, setMatchingTimesheet] = useState(null);
  
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
  apiCall('/consultants').catch(() => []),
  apiCall('/clients').catch(() => []),
  apiCall('/contracts').catch(() => []),
  apiCall('/invoices').catch(() => []),
  apiCall('/automation-logs').catch(() => []),
  apiCall('/timesheets').catch(() => [])
]);

      setConsultants(consultantsData);
      setClients(clientsData);
      setContracts(contractsData);
      setInvoices(invoicesData);
      setAutomationLogs(automationData);
      setTimesheets(timesheetsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      showNotification('Failed to load some data. Please refresh the page.', 'error');
    }
    setDataLoading(false);
  };

  useEffect(() => {
    loadData();
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

  // View timesheet function
const viewTimesheet = (fileUrl) => {
  if (fileUrl) {
    window.open(fileUrl, '_blank');
  } else {
    showNotification('No timesheet file available', 'error');
  }
};

  const matchConsultant = async (timesheetId, consultantId) => {
  try {
    await apiCall(`/timesheets/${timesheetId}/match`, {
      method: 'PUT',
      body: JSON.stringify({ consultantId })
    });
    showNotification('Consultant matched successfully!');
    setMatchingTimesheet(null);
    loadData(); // Refresh data
  } catch (error) {
    showNotification('Failed to match consultant: ' + error.message, 'error');
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
    { name: 'sellPrice', placeholder: 'Sell Price (€)', type: 'number', step: '0.01' }
  ],
  onSubmit: addContract
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
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex gap-1 mt-6 bg-gray-100 p-1 rounded-lg w-fit">
            {['dashboard', 'consultants', 'clients', 'contracts', 'timesheets', 'invoices'].map((tab) => (
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

            {/* N8N Automation Data */}
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-800">N8N Automation Data</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-4 font-medium text-gray-600">Person Name</th>
                      <th className="text-left p-4 font-medium text-gray-600">Month</th>
                      <th className="text-left p-4 font-medium text-gray-600">Days</th>
                      <th className="text-left p-4 font-medium text-gray-600">Status</th>
                      <th className="text-left p-4 font-medium text-gray-600">Processed</th>
                      <th className="text-left p-4 font-medium text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {automationLogs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-medium">{log.person_name}</td>
                        <td className="p-4">{log.month}</td>
                        <td className="p-4">{log.email_days}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            log.status === 'match' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            log.processed ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {log.processed ? 'Yes' : 'Pending'}
                          </span>
                        </td>
                        <td className="p-4">
                          {!log.processed && (
                            <button
                              onClick={() => {
                                const matchingContract = contracts.find(c => {
                                  return c.client_company_name && 
                                    c.client_company_name.toLowerCase().includes(log.person_name.toLowerCase());
                                });
                                if (matchingContract) {
                                  generateInvoices(matchingContract.id);
                                } else {
                                  showNotification('No matching contract found', 'error');
                                }
                              }}
                              className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs hover:bg-blue-700 transition"
                            >
                              Generate Invoices
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Active Contracts */}
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-800">Active Contracts</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contracts.filter(c => c.status === 'active').map((contract) => {
                    const days = calculateDays(contract.from_date, contract.to_date);
                    
                    return (
                      <div key={contract.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-gray-800">{contract.consultant_company_name} → {contract.client_company_name}</h3>
                            <p className="text-sm text-gray-600">
                              {formatDate(contract.from_date)} to {formatDate(contract.to_date)} ({days} days)
                            </p>
                          </div>
                          <button
                            onClick={() => generateInvoices(contract.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700 flex items-center gap-1 transition"
                          >
                            <Calculator className="h-4 w-4" />
                            Generate
                          </button>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Consultant: {formatCurrency(contract.purchase_price)}/day × {days} = {formatCurrency(contract.purchase_price * days)}</p>
                          <p>Client: {formatCurrency(contract.sell_price)}/day × {days} = {formatCurrency(contract.sell_price * days)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Consultants Tab */}
        {activeTab === 'consultants' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Consultants</h2>
              <button
                onClick={() => openAddModal('consultant')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition"
              >
                <Plus className="h-4 w-4" />
                Add Consultant
              </button>
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
              <button
                onClick={() => openAddModal('client')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition"
              >
                <Plus className="h-4 w-4" />
                Add Client
              </button>
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
      <button
        onClick={() => openAddModal('contract')}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition"
      >
        <Plus className="h-4 w-4" />
        Add Contract
      </button>
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
              <th className="text-left p-4 font-medium text-gray-600">Status</th>
              <th className="text-left p-4 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((contract) => {
              // Check if contract is currently active based on dates
const today = new Date();
today.setHours(0, 0, 0, 0); // Reset time to start of day

const startDate = new Date(contract.from_date);
startDate.setHours(0, 0, 0, 0);

const endDate = new Date(contract.to_date);
endDate.setHours(23, 59, 59, 999); // Set to end of day

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
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {isActive ? 'active' : 'inactive'}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => generateInvoices(contract.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs hover:bg-blue-700 flex items-center gap-1 transition"
                    >
                      <Calculator className="h-3 w-3" />
                      Generate
                    </button>
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
      <h2 className="text-xl font-bold text-gray-800">Timesheets</h2>
      <p className="text-sm text-gray-600">{timesheets.length} pending timesheets</p>
    </div>
    
    {timesheets.length === 0 ? (
      <div className="bg-white rounded-lg p-12 text-center border shadow-sm">
        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-800 mb-2">No pending timesheets</h3>
        <p className="text-gray-600">Timesheets will appear here when consultants submit them via email</p>
      </div>
    ) : (
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-medium text-gray-600">Consultant</th>
                <th className="text-left p-4 font-medium text-gray-600">Date Received</th>
                <th className="text-left p-4 font-medium text-gray-600">Period</th>
                <th className="text-left p-4 font-medium text-gray-600">Approved Working Days</th>
                <th className="text-left p-4 font-medium text-gray-600">Status</th>
                <th className="text-left p-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {timesheets.map((timesheet) => (
                <tr key={timesheet.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div>
                      {timesheet.consultant_matched ? (
                        <>
                          <div className="font-medium">
                            {timesheet.consultant_first_name} {timesheet.consultant_last_name}
                          </div>
                          <div className="text-gray-600">
                            {timesheet.consultant_company_name}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="font-medium text-red-600">Unknown Consultant</div>
                          <div className="text-gray-600 text-sm">{timesheet.sender_email}</div>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-sm">
                    {formatDate(timesheet.created_at)}
                  </td>
                  <td className="p-4 text-sm font-medium">
                    {timesheet.month || 'N/A'}
                  </td>
                  <td className="p-4">
                    <div className="text-center">
                      <span className="text-lg font-bold text-blue-600">
                        {timesheet.pdf_days || timesheet.email_days || 'N/A'}
                      </span>
                      <div className="text-xs text-gray-500">days</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        timesheet.consultant_matched 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {timesheet.consultant_matched ? 'Matched' : 'Unmatched'}
                      </span>
                      {timesheet.status && (
                        <div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            timesheet.status === 'match' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            Data: {timesheet.status}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
<td className="p-4">
  <div className="flex gap-2">
    <button
      onClick={() => viewTimesheet(timesheet.timesheet_file_url)}
      className="text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-200 rounded-md text-xs hover:bg-blue-50 transition flex items-center gap-1"
      title="View Timesheet"
    >
      <Eye className="h-3 w-3" />
      View
    </button>
    
    {timesheet.consultant_matched ? (
      <button
        onClick={() => {
          showNotification('Invoice generation from timesheets coming soon!');
        }}
        className="bg-green-600 text-white px-3 py-1 rounded-md text-xs hover:bg-green-700 flex items-center gap-1 transition"
        title="Generate Invoice"
      >
        <Calculator className="h-3 w-3" />
        Generate
      </button>
    ) : (
      <div className="relative">
        {matchingTimesheet === timesheet.id ? (
          <div className="flex gap-1">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  matchConsultant(timesheet.id, e.target.value);
                }
              }}
              className="text-xs border border-gray-300 rounded px-2 py-1"
              defaultValue=""
            >
              <option value="">Select Consultant</option>
              {consultants.map(consultant => (
                <option key={consultant.id} value={consultant.id}>
                  {consultant.first_name} {consultant.last_name} - {consultant.company_name}
                </option>
              ))}
            </select>
            <button
              onClick={() => setMatchingTimesheet(null)}
              className="text-gray-400 hover:text-gray-600 px-1"
              title="Cancel"
            >
              ×
            </button>
          </div>
        ) : (
          <button
            onClick={() => setMatchingTimesheet(timesheet.id)}
            className="bg-orange-600 text-white px-3 py-1 rounded-md text-xs hover:bg-orange-700 flex items-center gap-1 transition"
            title="Match Consultant"
          >
            <Users className="h-3 w-3" />
            Match
          </button>
        )}
      </div>
    )}
  </div>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
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
                        <th className="text-left p-4 font-medium text-gray-600">Total</th>
                        <th className="text-left p-4 font-medium text-gray-600">Status</th>
                        <th className="text-left p-4 font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="border-b hover:bg-gray-50">
<td className="p-4 font-mono text-xs">{invoice.invoice_number}</td>
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
<td className="p-4 text-sm">{formatDate(invoice.invoice_date)}</td>
<td className="p-4 text-sm">
  {formatDate(invoice.period_from)} - {formatDate(invoice.period_to)}
</td>
<td className="p-4 font-medium">{invoice.days_worked}</td>

                          <td className="p-4">{formatCurrency(invoice.daily_rate)}</td>
                          <td className="p-4 font-bold">{formatCurrency(invoice.total_amount)}</td>
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
                              <button
                                className="text-blue-600 hover:text-blue-800 p-1 transition"
                                title="View Invoice"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                className="text-green-600 hover:text-green-800 p-1 transition"
                                title="Download PDF"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                              <button
                                className="text-purple-600 hover:text-purple-800 p-1 transition"
                                title="Send Email"
                              >
                                <Send className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}


      </div>
    </div>
  );
};

export default InvoiceGeneratorApp;
