import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCrown, faUserShield, faTachometerAlt, faUsers, faStore, faListAlt, 
  faCalendarCheck, faComments, faStar, faRobot, faCogs, faShieldAlt, 
  faSyncAlt, faDatabase, faSignOutAlt, faUserSecret, faPowerOff, 
  faBan, faCommentSlash, faSkullCrossbones, faUserPlus, faDownload, 
  faPlusSquare, faEdit, faPlusCircle, faTimesCircle, faSave, faScroll, 
  faBars, faKey, faUserSlash, faTrash, faEye, faTimes, faBrain, 
  faExchangeAlt, faCode, faSlidersH, faVolumeUp, faChartBar, faChartLine, 
  faTasks, faListCheck, faBroom, faTrashAlt, faRedo, faHistory, 
  faTerminal, faCheckCircle, faClipboardList, faChartPie, faUpload, 
  faCloudUploadAlt, faFileCsv, faCloudDownloadAlt, faHdd, faTable, 
  faExclamationTriangle, faMicrochip, faBolt, faRocket, faServer, 
  faInfoCircle, faHeartbeat, faToggleOn, faClock, faGavel, faBoltLightning,
  faUserEdit, faStoreSlash, faCog, faUserSlash as faUserSlashSolid,
  faUtensils, faHotel, faHome, faCamera, faMapMarkerAlt, faPhone, 
  faEnvelope, faCalendarDays, faMoneyBill, faImage,
  faTag, faBed, faUsers as faUsersIcon, faCheck, faTimes as faTimesIcon,
  faChevronLeft, faChevronRight, faSearch, faFilter, faEllipsisV,
  faMobile, faDesktop, faTablet
} from '@fortawesome/free-solid-svg-icons';

// Import brand icons separately
import { faWhatsapp, faOpenai, faGoogle } from '@fortawesome/free-brands-svg-icons';

const Overview = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [aiProvider, setAiProvider] = useState('deepseek');
  const [systemPrompt, setSystemPrompt] = useState(`You are AJANI Assistant, a helpful AI for the AJANI service marketplace.

Role: You assist users in finding services, booking appointments, and answering questions about the platform.

Guidelines:
1. Be professional and friendly
2. Only discuss services available on AJANI
3. Redirect payment questions to support
4. Help users compare vendors
5. Never share personal vendor contact info
6. Suggest alternatives when services are unavailable

Tone: Helpful, concise, professional.

Response Format: Keep responses under 3 sentences when possible.`);
  const [featureToggles, setFeatureToggles] = useState({
    bookingSystem: true,
    messaging: true,
    reviews: true,
    chatbot: true,
    blogWidgets: false
  });

  // Listing creation state
  const [listingCategory, setListingCategory] = useState('restaurant');
  const [listingForm, setListingForm] = useState({
    name: '',
    vendorId: '',
    about: '',
    whatWeDo: '',
    location: {
      address: '',
      area: '',
      geolocation: {
        lat: null,
        lng: null
      }
    },
    contactInformation: {
      phone: '',
      whatsapp: '',
      email: ''
    },
    status: 'pending',
    details: {},
    images: []
  });

  // Mobile state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const modalRef = useRef(null);

  // Check screen size on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowMobileMenu(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sample data
  const sampleData = {
    users: [
      { id: 8472, name: 'John Smith', email: 'john@example.com', type: 'Customer', status: 'Active', joined: '2024-01-15' },
      { id: 6291, name: 'Sarah Johnson', email: 'sarah@example.com', type: 'Vendor', status: 'Suspended', joined: '2024-02-10' },
      { id: 4953, name: 'Michael Brown', email: 'michael@example.com', type: 'Customer', status: 'Active', joined: '2024-03-05' },
      { id: 3829, name: 'Emma Wilson', email: 'emma@example.com', type: 'Vendor', status: 'Pending', joined: '2024-03-12' }
    ],
    vendors: [
      { id: 'V101', name: 'QuickFix Solutions', owner: 'Sarah Johnson', category: 'Home Services', listings: 0, status: 'Suspended', approved: '2024-01-20' },
      { id: 'V102', name: 'Elite Cleaners', owner: 'Robert Chen', category: 'Cleaning', listings: 0, status: 'Active', approved: '2024-02-15' },
      { id: 'V103', name: 'TechGuru IT', owner: 'Michael Brown', category: 'IT Services', listings: 0, status: 'Pending', approved: '-' }
    ],
    listings: [
      { id: 'L4501', title: 'Emergency Plumbing Service', vendor: 'QuickFix Solutions', category: 'Home Services', price: '$120', status: 'Active', featured: true }
    ],
    bookings: [
      { id: 'B7842', user: 'John Smith', vendor: 'Elite Cleaners', service: 'Deep Cleaning', date: '2024-03-15', status: 'Pending', amount: '$150' }
    ]
  };

  // Navigation
  const navigateToPage = (page) => {
    setCurrentPage(page);
    if (isMobile) {
      setShowMobileMenu(false);
    }
  };

  // Modal functions
  const showModal = (modalId) => {
    setActiveModal(modalId);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  // Toggle functions
  const toggleFeature = (feature) => {
    setFeatureToggles(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  // Action functions
  const executeImpersonation = () => {
    const userId = document.getElementById('userIdInput')?.value;
    if (userId) {
      alert(`Impersonating user: ${userId}`);
      closeModal();
    } else {
      alert('Please enter a User ID or email');
    }
  };

  const executeOverride = (action) => {
    alert(`Executing override: ${action}`);
    closeModal();
  };

  const saveAISettings = () => {
    alert('AI settings saved successfully!');
    console.log('System prompt updated:', systemPrompt);
  };

  const exportUsers = () => {
    alert('Exporting users data...');
  };

  const exportVendors = () => {
    alert('Exporting vendors data...');
  };

  const exportBookings = () => {
    alert('Exporting bookings data...');
  };

  const fullDatabaseExport = () => {
    alert('Exporting full database...');
  };

  const backupSystem = () => {
    alert('Creating system backup...');
  };

  const rotateApiKeys = () => {
    if (confirm('Are you sure you want to rotate all API keys? This will break existing integrations until they update their keys.')) {
      alert('API keys rotated successfully!');
    }
  };

  const logout = () => {
    if (confirm('Are you sure you want to logout?')) {
      alert('Logged out successfully!');
      closeModal();
    }
  };

  const createUser = () => {
    alert('Creating new user...');
    closeModal();
  };

  const exportData = () => {
    alert('Exporting selected data...');
    closeModal();
  };

  const runMaintenance = () => {
    alert('Running system maintenance...');
  };

  const clearCache = () => {
    alert('Clearing system cache...');
  };

  const optimizeDatabase = () => {
    alert('Optimizing database...');
  };

  const updateSystem = () => {
    alert('Checking for system updates...');
  };

  // Listing creation function
  const handleCreateListing = () => {
    // Prepare the final data structure
    const listingData = {
      category: listingCategory,
      name: listingForm.name,
      vendorId: listingForm.vendorId,
      about: listingForm.about,
      whatWeDo: listingForm.whatWeDo,
      location: listingForm.location,
      contactInformation: listingForm.contactInformation,
      status: listingForm.status,
      details: listingForm.details,
      images: listingForm.images
    };

    // Log the data for now
    console.log('Creating listing with data:', listingData);
    
    // Show success message
    alert(`Listing "${listingForm.name}" created successfully!`);
    
    // Reset form
    setListingForm({
      name: '',
      vendorId: '',
      about: '',
      whatWeDo: '',
      location: {
        address: '',
        area: '',
        geolocation: {
          lat: null,
          lng: null
        }
      },
      contactInformation: {
        phone: '',
        whatsapp: '',
        email: ''
      },
      status: 'pending',
      details: {},
      images: []
    });
    
    closeModal();
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target) && event.target.classList.contains('modal')) {
        closeModal();
      }
    };

    if (activeModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeModal]);

  // Navigation items
  const navItems = [
    { id: 'dashboard', icon: faTachometerAlt, label: 'Dashboard' },
    { id: 'users', icon: faUsers, label: 'User Management' },
    { id: 'vendors', icon: faStore, label: 'Vendor Control' },
    { id: 'listings', icon: faListAlt, label: 'Listings' },
    { id: 'bookings', icon: faCalendarCheck, label: 'Booking Requests' },
    { id: 'messages', icon: faComments, label: 'Messages' },
    { id: 'reviews', icon: faStar, label: 'Reviews & Moderation' },
    { id: 'ai-control', icon: faRobot, label: 'AI & Chatbot Control' },
    { id: 'system-control', icon: faCogs, label: 'System Control' },
    { id: 'security', icon: faShieldAlt, label: 'Security & Audit' },
    { id: 'automation', icon: faSyncAlt, label: 'Automation (n8n)' },
    { id: 'data-control', icon: faDatabase, label: 'Data Control' }
  ];

  // Stats cards - ALL RESET TO ZERO
  const statsCards = [
    { title: 'Total Users', value: '0', change: '+0 this week', positive: false, icon: faUsers, page: 'users' },
    { title: 'Total Vendors', value: '0', change: '+0 this week', positive: false, icon: faStore, page: 'vendors' },
    { title: 'Active Listings', value: '0', change: '+0 today', positive: false, icon: faListAlt, page: 'listings' },
    { title: 'Pending Bookings', value: '0', change: '+0 today', positive: false, icon: faCalendarCheck, page: 'bookings' },
    { title: 'Open Conversations', value: '0', change: '+0 today', positive: false, icon: faComments, page: 'messages' },
    { title: 'System Health', value: '0%', change: 'All systems operational', positive: false, icon: faHeartbeat, page: 'system-control' }
  ];

  // Recent activities
  const recentActivities = [
    { type: 'system', icon: faCog, title: 'Feature Toggle Updated', description: 'Disabled vendor registrations temporarily', time: '2 minutes ago' },
    { type: 'user', icon: faUserEdit, title: 'User Profile Edited', description: 'Changed user #8472 subscription plan', time: '15 minutes ago' },
    { type: 'vendor', icon: faStoreSlash, title: 'Vendor Suspended', description: 'Vendor "QuickFix Solutions" suspended for TOS violation', time: '1 hour ago' },
    { type: 'system', icon: faRobot, title: 'AI Prompt Updated', description: 'Modified chatbot system prompt for better responses', time: '3 hours ago' },
    { type: 'user', icon: faUserSecret, title: 'User Impersonation', description: 'Impersonated user #6291 to debug booking issue', time: '5 hours ago' }
  ];

  // Override actions
  const overrideActions = [
    { icon: faBan, label: 'Stop All Bookings', modal: 'stopBookingsModal' },
    { icon: faCommentSlash, label: 'Disable Messaging', modal: 'disableChatModal' },
    { icon: faSignOutAlt, label: 'Force Logout All Users', modal: 'forceLogoutModal' },
    { icon: faSkullCrossbones, label: 'Emergency Shutdown', modal: 'emergencyModal', danger: true }
  ];

  // System status items
  const systemStatusItems = [
    { indicator: 'online', label: 'Database', value: 'Online' },
    { indicator: 'online', label: 'API Server', value: 'Online' },
    { indicator: 'online', label: 'Automation (n8n)', value: 'Running' },
    { indicator: 'warning', label: 'AI Service (DeepSeek)', value: 'High Load' },
    { indicator: 'online', label: 'Backup Schedule', value: 'Last: 2h ago' }
  ];

  // Quick actions
  const quickActions = [
    { icon: faUserPlus, label: 'Create User', page: 'users' },
    { icon: faStore, label: 'Create Vendor', page: 'vendors' },
    { icon: faPlusSquare, label: 'Create Listing', page: 'listings' },
    { icon: faEdit, label: 'Edit AI Prompt', page: 'ai-control' },
    { icon: faScroll, label: 'View Audit Logs', page: 'security' },
    { icon: faDownload, label: 'Export Data', modal: 'exportDataModal' }
  ];

  // AI providers
  const aiProviders = [
    { id: 'deepseek', icon: faBrain, label: 'DeepSeek' },
    { id: 'openai', icon: faOpenai, label: 'OpenAI' },
    { id: 'anthropic', icon: faRobot, label: 'Anthropic' }
  ];

  // AI usage stats - ALL RESET TO ZERO
  const aiUsageStats = [
    { value: '0', label: "Today's Queries" },
    { value: '0%', label: 'Success Rate' },
    { value: '0s', label: 'Avg Response Time' },
    { value: '0', label: 'Blocked Queries' }
  ];

  // System tasks
  const systemTasks = [
    { icon: faBroom, label: 'Run Maintenance', action: runMaintenance },
    { icon: faTrashAlt, label: 'Clear Cache', action: clearCache },
    { icon: faDatabase, label: 'Optimize DB', action: optimizeDatabase },
    { icon: faSyncAlt, label: 'Check Updates', action: updateSystem }
  ];

  // Security status
  const securityStatus = [
    { indicator: 'online', label: 'SSL/TLS', value: 'Valid' },
    { indicator: 'online', label: 'Firewall', value: 'Active' },
    { indicator: 'warning', label: 'Failed Logins', value: '0 attempts', positive: true },
    { indicator: 'online', label: 'Last Security Scan', value: '6h ago' }
  ];

  // Audit summary - ALL RESET TO ZERO
  const auditSummary = [
    { value: '0', label: "Today's Actions" },
    { value: '0', label: 'Security Alerts' },
    { value: '0', label: 'Admin Logins' },
    { value: '0', label: 'Unauthorized' }
  ];

  // Import actions
  const importActions = [
    { icon: faFileCsv, label: 'CSV Import', modal: 'importCSVModal' },
    { icon: faGoogle, label: 'Google Sheets', modal: 'importSheetsModal' },
    { icon: faHistory, label: 'Restore Backup', modal: 'restoreBackupModal' }
  ];

  // Export actions
  const exportActions = [
    { icon: faUsers, label: 'Export Users', action: exportUsers },
    { icon: faStore, label: 'Export Vendors', action: exportVendors },
    { icon: faCalendarCheck, label: 'Export Bookings', action: exportBookings },
    { icon: faDatabase, label: 'Full Database', action: fullDatabaseExport }
  ];

  // Database info - RESET TO ZERO
  const databaseInfo = [
    { icon: faHdd, label: 'Database Size', value: '0 GB' },
    { icon: faTable, label: 'Tables', value: '0 tables' },
    { icon: faHistory, label: 'Last Backup', value: 'Never' },
    { icon: faSyncAlt, label: 'Auto-backup', value: 'Disabled' }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      {/* Mobile Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 bg-blue-900 text-white p-4 flex justify-between items-center z-50 shadow-lg">
          <div className="flex items-center">
            <button onClick={toggleMobileMenu} className="mr-4">
              <FontAwesomeIcon icon={faBars} className="text-xl" />
            </button>
            <h1 className="text-xl font-bold">AJANI</h1>
          </div>
          <div className="flex items-center">
            <div className="bg-blue-800 px-3 py-1 rounded-lg mr-3">
              <span className="text-xs font-semibold">ADMIN</span>
            </div>
            <button 
              onClick={() => showModal('logoutModal')}
              className="p-2 rounded-lg bg-blue-800"
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
            </button>
          </div>
        </div>
      )}

{isMobile && showMobileMenu && (
  <div 
    className="fixed inset-0 bg-white/10 backdrop-blur-md z-40 transition-all duration-300" 
    onClick={toggleMobileMenu}
  ></div>
)}

{/* Sidebar - Mobile Version */}
{isMobile && showMobileMenu && (
  <div className="fixed left-0 top-0 h-full bg-blue-900 text-white w-64 z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out">
    <div className="flex items-center justify-between p-6 pb-8 border-b border-blue-800">
      <div className="flex items-center">
        <FontAwesomeIcon icon={faCrown} className="text-yellow-400 text-2xl mr-3" />
        <h1 className="text-xl font-bold">AJANI</h1>
      </div>
      <button onClick={toggleMobileMenu} className="text-2xl hover:text-yellow-400 transition-colors">
        &times;
      </button>
    </div>
    
    <div className="bg-blue-800 p-4 mx-6 mt-6 rounded-lg flex items-center">
      <FontAwesomeIcon icon={faUserShield} className="text-yellow-400 mr-3" />
      <span className="font-semibold text-sm">SUPER ADMIN</span>
    </div>
    
    <div className="flex-1 mt-6 overflow-y-auto">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => navigateToPage(item.id)}
          className={`flex items-center w-full p-4 transition-all ${currentPage === item.id ? 'bg-blue-800 border-l-4 border-yellow-400' : 'border-l-4 border-transparent hover:bg-blue-800'}`}
        >
          <FontAwesomeIcon icon={item.icon} className="text-lg min-w-6 mr-4" />
          <span className="font-medium">{item.label}</span>
        </button>
      ))}
    </div>
    
    <div className="p-6">
      <button
        onClick={() => {
          showModal('logoutModal');
          toggleMobileMenu();
        }}
        className="bg-blue-800 w-full p-3 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-all"
      >
        <FontAwesomeIcon icon={faSignOutAlt} className="mr-3" />
        <span>Logout</span>
      </button>
    </div>
  </div>
)}

      {/* Sidebar - Desktop Version */}
      {!isMobile && (
        <div className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-blue-900 text-white flex flex-col fixed h-screen overflow-y-auto transition-all duration-300 z-50`}>
          <div className="flex items-center p-6 pb-8 border-b border-blue-800">
            <FontAwesomeIcon icon={faCrown} className="text-yellow-400 text-2xl min-w-8" />
            {!sidebarCollapsed && <h1 className="text-xl font-bold ml-3">AJANI</h1>}
          </div>
          
          <div className="bg-blue-800 p-4 mx-6 mt-6 rounded-lg flex items-center transition-all">
            <FontAwesomeIcon icon={faUserShield} className="text-yellow-400 mr-3" />
            {!sidebarCollapsed && <span className="font-semibold text-sm">SUPER ADMIN</span>}
          </div>
          
          <div className="flex-1 mt-6 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigateToPage(item.id)}
                className={`flex items-center w-full p-4 transition-all ${currentPage === item.id ? 'bg-blue-800 border-l-4 border-yellow-400' : 'border-l-4 border-transparent hover:bg-blue-800'}`}
              >
                <FontAwesomeIcon icon={item.icon} className="text-lg min-w-6 mr-4" />
                {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => showModal('logoutModal')}
            className="bg-blue-800 m-6 p-3 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-all"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="mr-3" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      )}

      {/* Toggle Sidebar Button - Desktop Only */}
      {!isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed bottom-6 left-6 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg z-40"
        >
          <FontAwesomeIcon icon={sidebarCollapsed ? faChevronRight : faChevronLeft} />
        </button>
      )}

      {/* Main Content */}
      <div className={`flex-1 ${!isMobile ? (sidebarCollapsed ? 'ml-20' : 'ml-64') : ''} p-4 md:p-8 transition-all duration-300 ${isMobile ? 'mt-16' : ''}`}>
        
        {/* Dashboard Page */}
        {currentPage === 'dashboard' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 pb-4 md:pb-6 border-b">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-0">Super Admin Dashboard</h2>
              <div className="flex flex-wrap gap-2 md:gap-4 w-full md:w-auto">
                <button
                  onClick={() => showModal('impersonateModal')}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all text-sm md:text-base flex-1 md:flex-none"
                >
                  <FontAwesomeIcon icon={faUserSecret} className="mr-2" />
                  <span className="hidden sm:inline">Impersonate User</span>
                  <span className="sm:hidden">Impersonate</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm('Toggle maintenance mode? This will show a maintenance page to all users.')) {
                      alert('Maintenance mode toggled');
                    }
                  }}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center justify-center hover:bg-red-600 hover:text-white hover:border-red-600 transition-all text-sm md:text-base flex-1 md:flex-none"
                >
                  <FontAwesomeIcon icon={faPowerOff} className="mr-2" />
                  <span className="hidden sm:inline">Maintenance Mode</span>
                  <span className="sm:hidden">Maintenance</span>
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              {statsCards.map((stat, index) => (
                <div
                  key={index}
                  onClick={() => navigateToPage(stat.page)}
                  className="bg-white p-4 md:p-6 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3 md:mb-4">
                    <div>
                      <div className="text-xs md:text-sm text-gray-500 uppercase font-semibold tracking-wide">{stat.title}</div>
                      <div className="text-2xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">{stat.value}</div>
                      <div className={`text-xs md:text-sm font-medium ${stat.positive ? 'text-green-600' : 'text-gray-600'}`}>
                        {stat.change}
                      </div>
                    </div>
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={stat.icon} className="text-lg md:text-2xl" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Control Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
              {/* Feature Toggles */}
              <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-4 md:mb-6 pb-3 md:pb-4 border-b">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center">
                    <FontAwesomeIcon icon={faToggleOn} className="mr-2" />
                    Feature Toggles
                  </h3>
                  <FontAwesomeIcon icon={faSlidersH} className="text-blue-600 text-sm md:text-base" />
                </div>
                <div className="space-y-3 md:space-y-4">
                  {Object.entries(featureToggles).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-2 md:py-3 border-b last:border-b-0">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={
                          key === 'bookingSystem' ? faCalendarCheck :
                          key === 'messaging' ? faComments :
                          key === 'reviews' ? faStar :
                          key === 'chatbot' ? faRobot : faBolt
                        } className="text-gray-500 mr-2 md:mr-3 text-sm md:text-base" />
                        <span className="text-sm md:text-base">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={() => toggleFeature(key)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 md:w-12 md:h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-600 transition-all"></div>
                        <div className={`absolute left-0.5 md:left-1 top-0.5 md:top-1 w-4 h-4 bg-white rounded-full transition-all ${value ? 'translate-x-5 md:translate-x-6' : ''}`}></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-4 md:mb-6 pb-3 md:pb-4 border-b">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center">
                    <FontAwesomeIcon icon={faHistory} className="mr-2" />
                    Recent Admin Activity
                  </h3>
                  <FontAwesomeIcon icon={faClock} className="text-blue-600 text-sm md:text-base" />
                </div>
                <div className="space-y-3 md:space-y-4 max-h-64 md:max-h-80 overflow-y-auto">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start py-2 md:py-3 border-b last:border-b-0">
                      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mr-3 md:mr-4 ${
                        activity.type === 'system' ? 'bg-orange-100 text-orange-600' :
                        activity.type === 'user' ? 'bg-blue-100 text-blue-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        <FontAwesomeIcon icon={activity.icon} className="text-sm md:text-base" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-xs md:text-sm truncate">{activity.title}</h4>
                        <p className="text-xs md:text-sm text-gray-600 mt-1 truncate">{activity.description}</p>
                        <div className="text-xs text-gray-500 mt-1">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Override Actions */}
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-md mb-6 md:mb-8">
              <div className="flex justify-between items-center mb-4 md:mb-6 pb-3 md:pb-4 border-b">
                <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center">
                  <FontAwesomeIcon icon={faGavel} className="mr-2" />
                  Immediate Override Actions
                </h3>
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 text-sm md:text-base" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {overrideActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => showModal(action.modal)}
                    className={`p-3 md:p-4 bg-white border-2 rounded-lg flex flex-col items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all ${action.danger ? 'border-red-300 hover:bg-red-600 hover:border-red-600' : 'border-gray-300'} text-sm md:text-base`}
                  >
                    <FontAwesomeIcon icon={action.icon} className="text-xl md:text-2xl mb-2 md:mb-3" />
                    <span className="font-semibold text-center">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* System Status & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* System Status */}
              <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-4 md:mb-6 pb-3 md:pb-4 border-b">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center">
                    <FontAwesomeIcon icon={faServer} className="mr-2" />
                    System Status
                  </h3>
                  <FontAwesomeIcon icon={faInfoCircle} className="text-blue-600 text-sm md:text-base" />
                </div>
                <div className="space-y-3 md:space-y-4">
                  {systemStatusItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-1 md:py-2 border-b last:border-b-0">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full mr-2 md:mr-3 ${
                          item.indicator === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></div>
                        <span className="text-sm md:text-base">{item.label}</span>
                      </div>
                      <div className="font-semibold text-xs md:text-sm">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-4 md:mb-6 pb-3 md:pb-4 border-b">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center">
                    <FontAwesomeIcon icon={faBolt} className="mr-2" />
                    Quick Actions
                  </h3>
                  <FontAwesomeIcon icon={faRocket} className="text-blue-600 text-sm md:text-base" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => action.page ? navigateToPage(action.page) : showModal(action.modal)}
                      className="p-3 md:p-4 bg-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center justify-center"
                    >
                      <FontAwesomeIcon icon={action.icon} className="text-xl md:text-2xl text-blue-600 mb-1 md:mb-2" />
                      <span className="font-semibold text-xs md:text-sm text-center">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Management Page */}
        {currentPage === 'users' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 pb-4 md:pb-6 border-b">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-0 flex items-center">
                <FontAwesomeIcon icon={faUsers} className="mr-3" />
                User Management
              </h2>
              <div className="flex flex-wrap gap-2 md:gap-4 w-full md:w-auto">
                <button
                  onClick={() => showModal('createUserModal')}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all text-sm md:text-base flex-1 md:flex-none"
                >
                  <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                  Create User
                </button>
                <button
                  onClick={exportUsers}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all text-sm md:text-base flex-1 md:flex-none"
                >
                  <FontAwesomeIcon icon={faDownload} className="mr-2" />
                  Export Users
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 md:mb-8">
              <div className="bg-blue-600 text-white p-4 md:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0">
                <h3 className="text-base md:text-lg font-semibold">All Users (0)</h3>
                <input
                  type="text"
                  placeholder="Search users..."
                  className="px-3 py-2 md:px-4 md:py-2 rounded-lg text-gray-800 w-full md:w-64 text-sm md:text-base"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm">ID</th>
                      <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm">Name</th>
                      <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm hidden md:table-cell">Email</th>
                      <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm">Type</th>
                      <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm">Status</th>
                      <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm hidden sm:table-cell">Joined</th>
                      <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleData.users.map((user, index) => (
                      <tr key={index} className="hover:bg-blue-50 border-b last:border-b-0">
                        <td className="p-3 md:p-4 text-xs md:text-sm">#{user.id}</td>
                        <td className="p-3 md:p-4 font-medium text-xs md:text-sm">{user.name}</td>
                        <td className="p-3 md:p-4 text-gray-600 text-xs md:text-sm hidden md:table-cell">{user.email}</td>
                        <td className="p-3 md:p-4 text-xs md:text-sm">{user.type}</td>
                        <td className="p-3 md:p-4">
                          <span className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs font-semibold ${
                            user.status === 'Active' ? 'bg-green-100 text-green-800' :
                            user.status === 'Suspended' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="p-3 md:p-4 text-xs md:text-sm hidden sm:table-cell">{user.joined}</td>
                        <td className="p-3 md:p-4">
                          <div className="flex gap-1 md:gap-2">
                            <button className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all text-xs md:text-sm">
                              <FontAwesomeIcon icon={faEdit} size="xs" />
                            </button>
                            <button className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all text-xs md:text-sm">
                              <FontAwesomeIcon icon={faUserSecret} size="xs" />
                            </button>
                            <button className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all text-xs md:text-sm">
                              <FontAwesomeIcon icon={faTrash} size="xs" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
              <div className="flex justify-between items-center mb-4 md:mb-6 pb-3 md:pb-4 border-b">
                <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center">
                  <FontAwesomeIcon icon={faCogs} className="mr-2" />
                  Bulk User Actions
                </h3>
                <FontAwesomeIcon icon={faUsers} className="text-blue-600 text-sm md:text-base" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <button className="p-3 md:p-4 bg-white border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
                  <FontAwesomeIcon icon={faKey} className="text-xl md:text-2xl mb-2 md:mb-3" />
                  <span className="font-semibold text-center text-xs md:text-sm">Reset Passwords</span>
                </button>
                <button className="p-3 md:p-4 bg-white border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
                  <FontAwesomeIcon icon={faUserSlashSolid} className="text-xl md:text-2xl mb-2 md:mb-3" />
                  <span className="font-semibold text-center text-xs md:text-sm">Suspend Users</span>
                </button>
                <button className="p-3 md:p-4 bg-white border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
                  <FontAwesomeIcon icon={faDownload} className="text-xl md:text-2xl mb-2 md:mb-3" />
                  <span className="font-semibold text-center text-xs md:text-sm">Export All Data</span>
                </button>
                <button className="p-3 md:p-4 bg-white border-2 border-red-300 rounded-lg flex flex-col items-center justify-center hover:bg-red-600 hover:text-white hover:border-red-600 transition-all">
                  <FontAwesomeIcon icon={faTrash} className="text-xl md:text-2xl mb-2 md:mb-3" />
                  <span className="font-semibold text-center text-xs md:text-sm">Delete Users</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Vendors Control Page */}
        {currentPage === 'vendors' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 pb-4 md:pb-6 border-b">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-0 flex items-center">
                <FontAwesomeIcon icon={faStore} className="mr-3" />
                Vendor Control
              </h2>
              <div className="flex flex-wrap gap-2 md:gap-4 w-full md:w-auto">
                <button
                  onClick={() => showModal('createVendorModal')}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all text-sm md:text-base flex-1 md:flex-none"
                >
                  <FontAwesomeIcon icon={faStore} className="mr-2" />
                  Create Vendor
                </button>
                <button
                  onClick={() => showModal('suspendAllVendorsModal')}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center justify-center hover:bg-red-600 hover:text-white hover:border-red-600 transition-all text-sm md:text-base flex-1 md:flex-none"
                >
                  <FontAwesomeIcon icon={faBan} className="mr-2" />
                  Suspend All
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-blue-600 text-white p-4 md:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0">
                <h3 className="text-base md:text-lg font-semibold">All Vendors (0)</h3>
                <input
                  type="text"
                  placeholder="Search vendors..."
                  className="px-3 py-2 md:px-4 md:py-2 rounded-lg text-gray-800 w-full md:w-64 text-sm md:text-base"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm">ID</th>
                      <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm">Vendor Name</th>
                      <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm hidden sm:table-cell">Owner</th>
                      <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm">Category</th>
                      <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm hidden md:table-cell">Listings</th>
                      <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm">Status</th>
                      <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleData.vendors.map((vendor, index) => (
                      <tr key={index} className="hover:bg-blue-50 border-b last:border-b-0">
                        <td className="p-3 md:p-4 text-xs md:text-sm">{vendor.id}</td>
                        <td className="p-3 md:p-4 font-medium text-xs md:text-sm">{vendor.name}</td>
                        <td className="p-3 md:p-4 text-xs md:text-sm hidden sm:table-cell">{vendor.owner}</td>
                        <td className="p-3 md:p-4 text-xs md:text-sm">{vendor.category}</td>
                        <td className="p-3 md:p-4 text-xs md:text-sm hidden md:table-cell">{vendor.listings}</td>
                        <td className="p-3 md:p-4">
                          <span className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs font-semibold ${
                            vendor.status === 'Active' ? 'bg-green-100 text-green-800' :
                            vendor.status === 'Suspended' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {vendor.status}
                          </span>
                        </td>
                        <td className="p-3 md:p-4">
                          <div className="flex gap-1 md:gap-2">
                            <button className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all text-xs md:text-sm">
                              <FontAwesomeIcon icon={faEdit} size="xs" />
                            </button>
                            <button className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all text-xs md:text-sm">
                              <FontAwesomeIcon icon={faEye} size="xs" />
                            </button>
                            <button className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all text-xs md:text-sm">
                              <FontAwesomeIcon icon={faTrash} size="xs" />
                            </button>
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

        {/* Listings Page */}
        {currentPage === 'listings' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 pb-4 md:pb-6 border-b">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-0 flex items-center">
                <FontAwesomeIcon icon={faListAlt} className="mr-3" />
                Listings Control
              </h2>
              <div className="flex flex-wrap gap-2 md:gap-4 w-full md:w-auto">
                <button
                  onClick={() => showModal('createListingModal')}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all text-sm md:text-base flex-1 md:flex-none"
                >
                  <FontAwesomeIcon icon={faPlusSquare} className="mr-2" />
                  Create Listing
                </button>
                <button
                  onClick={() => showModal('bulkEditModal')}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all text-sm md:text-base flex-1 md:flex-none"
                >
                  <FontAwesomeIcon icon={faEdit} className="mr-2" />
                  Bulk Edit
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-blue-600 text-white p-4 md:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0">
                <h3 className="text-base md:text-lg font-semibold">All Listings (0)</h3>
                <input
                  type="text"
                  placeholder="Search listings..."
                  className="px-3 py-2 md:px-4 md:py-2 rounded-lg text-gray-800 w-full md:w-64 text-sm md:text-base"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm">ID</th>
                      <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm">Title</th>
                      <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm hidden sm:table-cell">Vendor</th>
                      <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm">Category</th>
                      <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm">Price</th>
                      <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm">Status</th>
                      <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleData.listings.map((listing, index) => (
                      <tr key={index} className="hover:bg-blue-50 border-b last:border-b-0">
                        <td className="p-3 md:p-4 text-xs md:text-sm">{listing.id}</td>
                        <td className="p-3 md:p-4 font-medium text-xs md:text-sm">{listing.title}</td>
                        <td className="p-3 md:p-4 text-xs md:text-sm hidden sm:table-cell">{listing.vendor}</td>
                        <td className="p-3 md:p-4 text-xs md:text-sm">{listing.category}</td>
                        <td className="p-3 md:p-4 text-xs md:text-sm">{listing.price}</td>
                        <td className="p-3 md:p-4">
                          <span className="px-2 py-1 md:px-3 md:py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            {listing.status}
                          </span>
                        </td>
                        <td className="p-3 md:p-4">
                          <div className="flex gap-1 md:gap-2">
                            <button className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all text-xs md:text-sm">
                              <FontAwesomeIcon icon={faEdit} size="xs" />
                            </button>
                            <button className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all text-xs md:text-sm">
                              <FontAwesomeIcon icon={faEye} size="xs" />
                            </button>
                            <button className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all text-xs md:text-sm">
                              <FontAwesomeIcon icon={faTrash} size="xs" />
                            </button>
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

        {/* Bookings Page */}
        {currentPage === 'bookings' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 pb-4 md:pb-6 border-b">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-0 flex items-center">
                <FontAwesomeIcon icon={faCalendarCheck} className="mr-3" />
                Booking Requests
              </h2>
              <div className="flex flex-wrap gap-2 md:gap-4 w-full md:w-auto">
                <button
                  onClick={() => showModal('createBookingModal')}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all text-sm md:text-base flex-1 md:flex-none"
                >
                  <FontAwesomeIcon icon={faPlusCircle} className="mr-2" />
                  Create Booking
                </button>
                <button
                  onClick={() => showModal('cancelAllBookingsModal')}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center justify-center hover:bg-red-600 hover:text-white hover:border-red-600 transition-all text-sm md:text-base flex-1 md:flex-none"
                >
                  <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />
                  Cancel All
                </button>
              </div>
            </div>

            {/* Booking Stats - ALL RESET TO ZERO */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
              <div className="bg-white p-4 md:p-6 rounded-xl shadow-md flex flex-col items-center justify-center">
                <div className="text-xl md:text-3xl font-bold text-gray-900">0</div>
                <span className="font-semibold text-gray-600 text-xs md:text-sm">Pending</span>
              </div>
              <div className="bg-white p-4 md:p-6 rounded-xl shadow-md flex flex-col items-center justify-center">
                <div className="text-xl md:text-3xl font-bold text-gray-900">0</div>
                <span className="font-semibold text-gray-600 text-xs md:text-sm">Confirmed</span>
              </div>
              <div className="bg-white p-4 md:p-6 rounded-xl shadow-md flex flex-col items-center justify-center">
                <div className="text-xl md:text-3xl font-bold text-gray-900">0</div>
                <span className="font-semibold text-gray-600 text-xs md:text-sm">Cancelled</span>
              </div>
              <div className="bg-white p-4 md:p-6 rounded-xl shadow-md flex flex-col items-center justify-center">
                <div className="text-xl md:text-3xl font-bold text-gray-900">0</div>
                <span className="font-semibold text-gray-600 text-xs md:text-sm">Total This Month</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-blue-600 text-white p-4 md:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0">
                <h3 className="text-base md:text-lg font-semibold">Recent Booking Requests</h3>
                <input
                  type="text"
                  placeholder="Search bookings..."
                  className="px-3 py-2 md:px-4 md:py-2 rounded-lg text-gray-800 w-full md:w-64 text-sm md:text-base"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm">ID</th>
                      <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm">User</th>
                      <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm hidden sm:table-cell">Vendor</th>
                      <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm">Service</th>
                      <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm hidden md:table-cell">Date</th>
                      <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm">Status</th>
                      <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleData.bookings.map((booking, index) => (
                      <tr key={index} className="hover:bg-blue-50 border-b last:border-b-0">
                        <td className="p-3 md:p-4 text-xs md:text-sm">{booking.id}</td>
                        <td className="p-3 md:p-4 font-medium text-xs md:text-sm">{booking.user}</td>
                        <td className="p-3 md:p-4 text-xs md:text-sm hidden sm:table-cell">{booking.vendor}</td>
                        <td className="p-3 md:p-4 text-xs md:text-sm">{booking.service}</td>
                        <td className="p-3 md:p-4 text-xs md:text-sm hidden md:table-cell">{booking.date}</td>
                        <td className="p-3 md:p-4">
                          <span className="px-2 py-1 md:px-3 md:py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                            {booking.status}
                          </span>
                        </td>
                        <td className="p-3 md:p-4">
                          <div className="flex gap-1 md:gap-2">
                            <button className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all text-xs md:text-sm">
                              <FontAwesomeIcon icon={faEdit} size="xs" />
                            </button>
                            <button className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all text-xs md:text-sm">
                              <FontAwesomeIcon icon={faEye} size="xs" />
                            </button>
                            <button className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all text-xs md:text-sm">
                              <FontAwesomeIcon icon={faTimes} size="xs" />
                            </button>
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

        {/* AI Control Page */}
        {currentPage === 'ai-control' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 pb-4 md:pb-6 border-b">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-0 flex items-center">
                <FontAwesomeIcon icon={faRobot} className="mr-3" />
                AI & Chatbot Control
              </h2>
              <div className="flex flex-wrap gap-2 md:gap-4 w-full md:w-auto">
                <button
                  onClick={saveAISettings}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all text-sm md:text-base flex-1 md:flex-none"
                >
                  <FontAwesomeIcon icon={faSave} className="mr-2" />
                  Save Settings
                </button>
                <button
                  onClick={() => showModal('aiLogsModal')}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all text-sm md:text-base flex-1 md:flex-none"
                >
                  <FontAwesomeIcon icon={faScroll} className="mr-2" />
                  View Logs
                </button>
              </div>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-xl shadow-md mb-4 md:mb-6">
              <div className="flex justify-between items-center mb-4 md:mb-6 pb-3 md:pb-4 border-b">
                <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center">
                  <FontAwesomeIcon icon={faMicrochip} className="mr-2" />
                  AI Provider Selection
                </h3>
                <FontAwesomeIcon icon={faExchangeAlt} className="text-blue-600 text-sm md:text-base" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                {aiProviders.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => setAiProvider(provider.id)}
                    className={`p-3 md:p-4 border-2 rounded-lg flex items-center justify-center gap-2 md:gap-3 transition-all ${aiProvider === provider.id ? 'border-blue-600 bg-blue-50' : 'border-gray-300'} text-sm md:text-base`}
                  >
                    <FontAwesomeIcon icon={provider.icon} className="text-lg md:text-xl" />
                    <span className="font-medium">{provider.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-xl shadow-md mb-6 md:mb-8">
              <div className="flex justify-between items-center mb-4 md:mb-6 pb-3 md:pb-4 border-b">
                <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center">
                  <FontAwesomeIcon icon={faEdit} className="mr-2" />
                  System Prompt
                </h3>
                <FontAwesomeIcon icon={faCode} className="text-blue-600 text-sm md:text-base" />
              </div>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full min-h-32 md:min-h-48 p-3 md:p-4 border border-gray-300 rounded-lg font-mono text-xs md:text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="8"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-4 md:mb-6 pb-3 md:pb-4 border-b">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center">
                    <FontAwesomeIcon icon={faSlidersH} className="mr-2" />
                    AI Settings
                  </h3>
                  <FontAwesomeIcon icon={faCog} className="text-blue-600 text-sm md:text-base" />
                </div>
                <div className="space-y-3 md:space-y-4">
                  <div className="flex justify-between items-center py-1 md:py-2">
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faPowerOff} className="text-gray-500 mr-2 md:mr-3 text-sm md:text-base" />
                      <span className="text-sm md:text-base">Chatbot Enabled</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={featureToggles.chatbot}
                        onChange={() => toggleFeature('chatbot')}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 md:w-12 md:h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-600 transition-all"></div>
                      <div className={`absolute left-0.5 md:left-1 top-0.5 md:top-1 w-4 h-4 bg-white rounded-full transition-all ${featureToggles.chatbot ? 'translate-x-5 md:translate-x-6' : ''}`}></div>
                    </label>
                  </div>
                  <div className="flex justify-between items-center py-1 md:py-2">
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faVolumeUp} className="text-gray-500 mr-2 md:mr-3 text-sm md:text-base" />
                      <span className="text-sm md:text-base">Response Tone</span>
                    </div>
                    <select className="px-2 py-1 md:px-3 md:py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-32 md:w-40 text-xs md:text-sm">
                      <option>Professional</option>
                      <option>Friendly</option>
                      <option>Formal</option>
                      <option>Casual</option>
                    </select>
                  </div>
                  <div className="flex justify-between items-center py-1 md:py-2">
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faBan} className="text-gray-500 mr-2 md:mr-3 text-sm md:text-base" />
                      <span className="text-sm md:text-base">Restricted Topics</span>
                    </div>
                    <input
                      type="text"
                      placeholder="Politics, Religion, etc."
                      className="px-2 py-1 md:px-3 md:py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-32 md:w-40 text-xs md:text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-4 md:mb-6 pb-3 md:pb-4 border-b">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center">
                    <FontAwesomeIcon icon={faChartLine} className="mr-2" />
                    AI Usage Stats
                  </h3>
                  <FontAwesomeIcon icon={faChartBar} className="text-blue-600 text-sm md:text-base" />
                </div>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  {aiUsageStats.map((stat, index) => (
                    <div key={index} className="bg-gray-50 p-3 md:p-4 rounded-lg flex flex-col items-center justify-center">
                      <div className="text-lg md:text-2xl font-bold text-gray-900">{stat.value}</div>
                      <span className="font-semibold text-xs md:text-sm text-gray-600 text-center">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Control Page */}
        {currentPage === 'system-control' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 pb-4 md:pb-6 border-b">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-0 flex items-center">
                <FontAwesomeIcon icon={faCogs} className="mr-3" />
                System Control
              </h2>
              <div className="flex flex-wrap gap-2 md:gap-4 w-full md:w-auto">
                <button
                  onClick={backupSystem}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all text-sm md:text-base flex-1 md:flex-none"
                >
                  <FontAwesomeIcon icon={faSave} className="mr-2" />
                  Backup Now
                </button>
                <button
                  onClick={() => showModal('systemRestartModal')}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center justify-center hover:bg-red-600 hover:text-white hover:border-red-600 transition-all text-sm md:text-base flex-1 md:flex-none"
                >
                  <FontAwesomeIcon icon={faRedo} className="mr-2" />
                  Restart System
                </button>
              </div>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-xl shadow-md mb-6 md:mb-8">
              <div className="flex justify-between items-center mb-4 md:mb-6 pb-3 md:pb-4 border-b">
                <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center">
                  <FontAwesomeIcon icon={faTasks} className="mr-2" />
                  System Tasks
                </h3>
                <FontAwesomeIcon icon={faListCheck} className="text-blue-600 text-sm md:text-base" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {systemTasks.map((task, index) => (
                  <button
                    key={index}
                    onClick={task.action}
                    className="p-3 md:p-4 bg-white border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                  >
                    <FontAwesomeIcon icon={task.icon} className="text-xl md:text-2xl mb-2 md:mb-3" />
                    <span className="font-semibold text-center text-xs md:text-sm">{task.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
              <div className="flex justify-between items-center mb-4 md:mb-6 pb-3 md:pb-4 border-b">
                <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center">
                  <FontAwesomeIcon icon={faHistory} className="mr-2" />
                  System Logs
                </h3>
                <FontAwesomeIcon icon={faTerminal} className="text-blue-600 text-sm md:text-base" />
              </div>
              <div className="space-y-3 md:space-y-4">
                <div className="flex justify-between items-center py-1 md:py-2">
                  <div className="flex items-center">
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500 mr-2 md:mr-3"></div>
                    <span className="text-sm md:text-base">Error Logs</span>
                  </div>
                  <div className="font-semibold text-xs md:text-sm">0 errors</div>
                </div>
                <div className="flex justify-between items-center py-1 md:py-2">
                  <div className="flex items-center">
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500 mr-2 md:mr-3"></div>
                    <span className="text-sm md:text-base">Warning Logs</span>
                  </div>
                  <div className="font-semibold text-xs md:text-sm">0 warnings</div>
                </div>
                <div className="flex justify-between items-center py-1 md:py-2">
                  <div className="flex items-center">
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500 mr-2 md:mr-3"></div>
                    <span className="text-sm md:text-base">API Logs</span>
                  </div>
                  <div className="font-semibold text-xs md:text-sm">0 requests</div>
                </div>
                <div className="flex justify-between items-center py-1 md:py-2">
                  <div className="flex items-center">
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500 mr-2 md:mr-3"></div>
                    <span className="text-sm md:text-base">Backup Logs</span>
                  </div>
                  <div className="font-semibold text-xs md:text-sm">Last: Never</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security & Audit Page */}
        {currentPage === 'security' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 pb-4 md:pb-6 border-b">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-0 flex items-center">
                <FontAwesomeIcon icon={faShieldAlt} className="mr-3" />
                Security & Audit
              </h2>
              <div className="flex flex-wrap gap-2 md:gap-4 w-full md:w-auto">
                <button
                  onClick={rotateApiKeys}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all text-sm md:text-base flex-1 md:flex-none"
                >
                  <FontAwesomeIcon icon={faKey} className="mr-2" />
                  Rotate API Keys
                </button>
                <button
                  onClick={() => showModal('forceLogoutModal')}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center justify-center hover:bg-red-600 hover:text-white hover:border-red-600 transition-all text-sm md:text-base flex-1 md:flex-none"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                  Force Logout All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-4 md:mb-6 pb-3 md:pb-4 border-b">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center">
                    <FontAwesomeIcon icon={faUserShield} className="mr-2" />
                    Security Status
                  </h3>
                  <FontAwesomeIcon icon={faCheckCircle} className="text-blue-600 text-sm md:text-base" />
                </div>
                <div className="space-y-3 md:space-y-4">
                  {securityStatus.map((status, index) => (
                    <div key={index} className="flex justify-between items-center py-1 md:py-2">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full mr-2 md:mr-3 ${status.indicator === 'online' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                        <span className="text-sm md:text-base">{status.label}</span>
                      </div>
                      <div className="font-semibold text-xs md:text-sm">{status.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-4 md:mb-6 pb-3 md:pb-4 border-b">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center">
                    <FontAwesomeIcon icon={faClipboardList} className="mr-2" />
                    Audit Summary
                  </h3>
                  <FontAwesomeIcon icon={faChartPie} className="text-blue-600 text-sm md:text-base" />
                </div>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  {auditSummary.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-3 md:p-4 rounded-lg flex flex-col items-center justify-center">
                      <div className="text-lg md:text-2xl font-bold text-gray-900">{item.value}</div>
                      <span className="font-semibold text-xs md:text-sm text-gray-600 text-center">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-blue-600 text-white p-4 md:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0">
                <h3 className="text-base md:text-lg font-semibold">Recent Audit Logs</h3>
                <input
                  type="text"
                  placeholder="Search audit logs..."
                  className="px-3 py-2 md:px-4 md:py-2 rounded-lg text-gray-800 w-full md:w-64 text-sm md:text-base"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm">Timestamp</th>
                      <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm">User</th>
                      <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm">Action</th>
                      <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm hidden md:table-cell">IP Address</th>
                      <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-blue-50 border-b">
                      <td className="p-3 md:p-4 text-xs md:text-sm">2024-03-15 14:23:12</td>
                      <td className="p-3 md:p-4 font-medium text-xs md:text-sm">Super Admin</td>
                      <td className="p-3 md:p-4 text-xs md:text-sm">User Impersonation</td>
                      <td className="p-3 md:p-4 text-xs md:text-sm hidden md:table-cell">192.168.1.100</td>
                      <td className="p-3 md:p-4 text-xs md:text-sm">Impersonated user #6291</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Data Control Page */}
        {currentPage === 'data-control' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 pb-4 md:pb-6 border-b">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-0 flex items-center">
                <FontAwesomeIcon icon={faDatabase} className="mr-3" />
                Data Control
              </h2>
              <div className="flex flex-wrap gap-2 md:gap-4 w-full md:w-auto">
                <button
                  onClick={() => showModal('importDataModal')}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all text-sm md:text-base flex-1 md:flex-none"
                >
                  <FontAwesomeIcon icon={faDownload} className="mr-2" />
                  Import Data
                </button>
                <button
                  onClick={() => showModal('exportDataModal')}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all text-sm md:text-base flex-1 md:flex-none"
                >
                  <FontAwesomeIcon icon={faUpload} className="mr-2" />
                  Export Data
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-4 md:mb-6 pb-3 md:pb-4 border-b">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center">
                    <FontAwesomeIcon icon={faUpload} className="mr-2" />
                    Import Data
                  </h3>
                  <FontAwesomeIcon icon={faCloudUploadAlt} className="text-blue-600 text-sm md:text-base" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  {importActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => showModal(action.modal)}
                      className="p-3 md:p-4 bg-white border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                    >
                      <FontAwesomeIcon icon={action.icon} className="text-xl md:text-2xl mb-2 md:mb-3" />
                      <span className="font-semibold text-center text-xs md:text-sm">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-4 md:mb-6 pb-3 md:pb-4 border-b">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center">
                    <FontAwesomeIcon icon={faDownload} className="mr-2" />
                    Export Data
                  </h3>
                  <FontAwesomeIcon icon={faCloudDownloadAlt} className="text-blue-600 text-sm md:text-base" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  {exportActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      className="p-3 md:p-4 bg-white border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                    >
                      <FontAwesomeIcon icon={action.icon} className="text-xl md:text-2xl mb-2 md:mb-3" />
                      <span className="font-semibold text-center text-xs md:text-sm">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
              <div className="flex justify-between items-center mb-4 md:mb-6 pb-3 md:pb-4 border-b">
                <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center">
                  <FontAwesomeIcon icon={faServer} className="mr-2" />
                  Database Information
                </h3>
                <FontAwesomeIcon icon={faInfoCircle} className="text-blue-600 text-sm md:text-base" />
              </div>
              <div className="space-y-3 md:space-y-4">
                {databaseInfo.map((info, index) => (
                  <div key={index} className="flex justify-between items-center py-1 md:py-2">
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={info.icon} className="text-gray-500 mr-2 md:mr-3 text-sm md:text-base" />
                      <span className="text-sm md:text-base">{info.label}</span>
                    </div>
                    <div className="font-semibold text-xs md:text-sm">{info.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {activeModal === 'createListingModal' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4 overflow-y-auto">
          <div ref={modalRef} className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] md:max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 md:p-6 border-b sticky top-0 bg-white z-10">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center">
                <FontAwesomeIcon icon={faPlusSquare} className="mr-3" />
                Create New Listing
              </h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            
            <div className="p-4 md:p-6">
              {/* Category Selection */}
              <div className="mb-6 md:mb-8">
                <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4 flex items-center">
                  <FontAwesomeIcon icon={faListAlt} className="mr-2" />
                  Select Listing Category
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <button
                    onClick={() => setListingCategory('restaurant')}
                    className={`p-3 md:p-4 border-2 rounded-lg flex flex-col items-center justify-center transition-all ${listingCategory === 'restaurant' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
                  >
                    <FontAwesomeIcon icon={faUtensils} className="text-xl md:text-2xl mb-2 text-blue-600" />
                    <span className="font-semibold text-sm md:text-base">Restaurant</span>
                  </button>
                  <button
                    onClick={() => setListingCategory('hotel')}
                    className={`p-3 md:p-4 border-2 rounded-lg flex flex-col items-center justify-center transition-all ${listingCategory === 'hotel' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
                  >
                    <FontAwesomeIcon icon={faHotel} className="text-xl md:text-2xl mb-2 text-green-600" />
                    <span className="font-semibold text-sm md:text-base">Hotel</span>
                  </button>
                  <button
                    onClick={() => setListingCategory('shortlet')}
                    className={`p-3 md:p-4 border-2 rounded-lg flex flex-col items-center justify-center transition-all ${listingCategory === 'shortlet' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
                  >
                    <FontAwesomeIcon icon={faHome} className="text-xl md:text-2xl mb-2 text-purple-600" />
                    <span className="font-semibold text-sm md:text-base">Shortlet/Apartment</span>
                  </button>
                </div>
              </div>

              {/* Basic Information (Common to all categories) */}
              <div className="mb-6 md:mb-8">
                <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4 flex items-center">
                  <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
                  Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block font-medium text-gray-700 mb-2 text-sm md:text-base">Listing Name *</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                      placeholder="Enter business name"
                      value={listingForm.name || ''}
                      onChange={(e) => setListingForm({...listingForm, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-2 text-sm md:text-base">Vendor *</label>
                    <select 
                      className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                      value={listingForm.vendorId || ''}
                      onChange={(e) => setListingForm({...listingForm, vendorId: e.target.value})}
                    >
                      <option value="">Select Vendor</option>
                      <option value="69558890c263664d295678ab">Ajani AI (vendor@ajani.ai)</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block font-medium text-gray-700 mb-2 text-sm md:text-base">About Description *</label>
                    <textarea
                      className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base min-h-20 md:min-h-24"
                      placeholder="Describe the business, services, and unique selling points"
                      value={listingForm.about || ''}
                      onChange={(e) => setListingForm({...listingForm, about: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block font-medium text-gray-700 mb-2 text-sm md:text-base">What We Do *</label>
                    <textarea
                      className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base min-h-16 md:min-h-20"
                      placeholder="Brief description of services offered"
                      value={listingForm.whatWeDo || ''}
                      onChange={(e) => setListingForm({...listingForm, whatWeDo: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="mb-6 md:mb-8">
                <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4 flex items-center">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                  Location Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block font-medium text-gray-700 mb-2 text-sm md:text-base">Full Address *</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                      placeholder="e.g., Beside Skye Bank, Bodija Market"
                      value={listingForm.location?.address || ''}
                      onChange={(e) => setListingForm({
                        ...listingForm, 
                        location: {...listingForm.location, address: e.target.value}
                      })}
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-2 text-sm md:text-base">Area/Neighborhood *</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                      placeholder="e.g., Bodija, Akobo, Jericho"
                      value={listingForm.location?.area || ''}
                      onChange={(e) => setListingForm({
                        ...listingForm, 
                        location: {...listingForm.location, area: e.target.value}
                      })}
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-2 text-sm md:text-base">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                      placeholder="e.g., 3.9147"
                      value={listingForm.location?.geolocation?.lat || ''}
                      onChange={(e) => setListingForm({
                        ...listingForm, 
                        location: {
                          ...listingForm.location, 
                          geolocation: {...listingForm.location?.geolocation, lat: parseFloat(e.target.value)}
                        }
                      })}
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-2 text-sm md:text-base">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                      placeholder="e.g., 7.4762"
                      value={listingForm.location?.geolocation?.lng || ''}
                      onChange={(e) => setListingForm({
                        ...listingForm, 
                        location: {
                          ...listingForm.location, 
                          geolocation: {...listingForm.location?.geolocation, lng: parseFloat(e.target.value)}
                        }
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-6 md:mb-8">
                <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4 flex items-center">
                  <FontAwesomeIcon icon={faPhone} className="mr-2" />
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <div>
                    <label className="block font-medium text-gray-700 mb-2 text-sm md:text-base">Phone Number *</label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                      placeholder="e.g., 2349093965346"
                      value={listingForm.contactInformation?.phone || ''}
                      onChange={(e) => setListingForm({
                        ...listingForm, 
                        contactInformation: {...listingForm.contactInformation, phone: e.target.value}
                      })}
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-2 text-sm md:text-base">WhatsApp Number</label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                      placeholder="e.g., 2349093965346"
                      value={listingForm.contactInformation?.whatsapp || ''}
                      onChange={(e) => setListingForm({
                        ...listingForm, 
                        contactInformation: {...listingForm.contactInformation, whatsapp: e.target.value}
                      })}
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-2 text-sm md:text-base">Email Address</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                      placeholder="e.g., amalaskye@example.com"
                      value={listingForm.contactInformation?.email || ''}
                      onChange={(e) => setListingForm({
                        ...listingForm, 
                        contactInformation: {...listingForm.contactInformation, email: e.target.value}
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Category-Specific Details */}
              {listingCategory === 'restaurant' && (
                <div className="mb-6 md:mb-8">
                  <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4 flex items-center">
                    <FontAwesomeIcon icon={faUtensils} className="mr-2" />
                    Restaurant Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className="block font-medium text-gray-700 mb-2 text-sm md:text-base">Years of Operation</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                        placeholder="e.g., 5"
                        value={listingForm.details?.yearsOfOperation || ''}
                        onChange={(e) => setListingForm({
                          ...listingForm, 
                          details: {...listingForm.details, yearsOfOperation: parseInt(e.target.value)}
                        })}
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-gray-700 mb-2 text-sm md:text-base">Seating Capacity</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                        placeholder="e.g., 50"
                        value={listingForm.details?.seatingCapacity || ''}
                        onChange={(e) => setListingForm({
                          ...listingForm, 
                          details: {...listingForm.details, seatingCapacity: parseInt(e.target.value)}
                        })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block font-medium text-gray-700 mb-2 text-sm md:text-base">Cuisine Types *</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {['Nigerian', 'Continental', 'Chinese', 'Italian', 'Indian', 'American', 'Fast Food', 'Vegetarian'].map((cuisine) => (
                          <button
                            key={cuisine}
                            type="button"
                            onClick={() => {
                              const current = listingForm.details?.cuisineType || [];
                              if (current.includes(cuisine)) {
                                setListingForm({
                                  ...listingForm,
                                  details: {...listingForm.details, cuisineType: current.filter(c => c !== cuisine)}
                                });
                              } else {
                                setListingForm({
                                  ...listingForm,
                                  details: {...listingForm.details, cuisineType: [...current, cuisine]}
                                });
                              }
                            }}
                            className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm ${(listingForm.details?.cuisineType || []).includes(cuisine) ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-gray-100 text-gray-800 border border-gray-300'}`}
                          >
                            {cuisine}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                        placeholder="Add custom cuisine type (press Enter to add)"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                            e.preventDefault();
                            const current = listingForm.details?.cuisineType || [];
                            setListingForm({
                              ...listingForm,
                              details: {...listingForm.details, cuisineType: [...current, e.target.value.trim()]}
                            });
                            e.target.value = '';
                          }
                        }}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block font-medium text-gray-700 mb-2 text-sm md:text-base">Operating Days *</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                          <label key={day} className="flex items-center text-sm md:text-base">
                            <input
                              type="checkbox"
                              className="mr-2"
                              checked={(listingForm.details?.operatingDays || []).includes(day)}
                              onChange={(e) => {
                                const current = listingForm.details?.operatingDays || [];
                                if (e.target.checked) {
                                  setListingForm({
                                    ...listingForm,
                                    details: {...listingForm.details, operatingDays: [...current, day]}
                                  });
                                } else {
                                  setListingForm({
                                    ...listingForm,
                                    details: {...listingForm.details, operatingDays: current.filter(d => d !== day)}
                                  });
                                }
                              }}
                            />
                            {day.slice(0, 3)}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2 md:space-y-3 md:col-span-2">
                      <label className="block font-medium text-gray-700 text-sm md:text-base">Services Available</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
                        <label className="flex items-center text-sm md:text-base">
                          <input
                            type="checkbox"
                            className="mr-2"
                            checked={listingForm.details?.dineInService || false}
                            onChange={(e) => setListingForm({
                              ...listingForm,
                              details: {...listingForm.details, dineInService: e.target.checked}
                            })}
                          />
                          Dine-in Service
                        </label>
                        <label className="flex items-center text-sm md:text-base">
                          <input
                            type="checkbox"
                            className="mr-2"
                            checked={listingForm.details?.takeawayService || false}
                            onChange={(e) => setListingForm({
                              ...listingForm,
                              details: {...listingForm.details, takeawayService: e.target.checked}
                            })}
                          />
                          Takeaway Service
                        </label>
                        <label className="flex items-center text-sm md:text-base">
                          <input
                            type="checkbox"
                            className="mr-2"
                            checked={listingForm.details?.deliveryService || false}
                            onChange={(e) => setListingForm({
                              ...listingForm,
                              details: {...listingForm.details, deliveryService: e.target.checked}
                            })}
                          />
                          Delivery Service
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {listingCategory === 'hotel' && (
                <div className="mb-6 md:mb-8">
                  <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4 flex items-center">
                    <FontAwesomeIcon icon={faHotel} className="mr-2" />
                    Hotel Details
                  </h4>
                  <div className="mb-4 md:mb-6">
                    <div className="flex justify-between items-center mb-3 md:mb-4">
                      <h5 className="font-semibold text-gray-800 text-sm md:text-base">Room Types</h5>
                      <button
                        type="button"
                        onClick={() => {
                          const current = listingForm.details?.roomTypes || [];
                          setListingForm({
                            ...listingForm,
                            details: {
                              ...listingForm.details,
                              roomTypes: [...current, {
                                name: '',
                                bedType: '',
                                roomType: '',
                                view: '',
                                pricePerNight: 0,
                                discountedRate: 0,
                                basePrice: 0,
                                salesPrice: 0,
                                breakfastIncluded: false,
                                breakfastCost: 0,
                                amenities: [],
                                maxOccupancy: 2,
                                roomImages: [],
                                status: 'available'
                              }]
                            }
                          });
                        }}
                        className="px-2 py-1 md:px-3 md:py-1 bg-blue-100 text-blue-700 rounded-lg text-xs md:text-sm hover:bg-blue-200 transition-all"
                      >
                        + Add Room Type
                      </button>
                    </div>
                    
                    {(listingForm.details?.roomTypes || []).map((room, index) => (
                      <div key={index} className="bg-gray-50 p-3 md:p-4 rounded-lg mb-3 md:mb-4 border border-gray-200">
                        <div className="flex justify-between items-center mb-2 md:mb-3">
                          <h6 className="font-medium text-gray-800 text-sm md:text-base">Room Type #{index + 1}</h6>
                          <button
                            type="button"
                            onClick={() => {
                              const current = listingForm.details?.roomTypes || [];
                              setListingForm({
                                ...listingForm,
                                details: {
                                  ...listingForm.details,
                                  roomTypes: current.filter((_, i) => i !== index)
                                }
                              });
                            }}
                            className="text-red-600 hover:text-red-800 text-xs md:text-sm"
                          >
                            Remove
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                          <div>
                            <label className="block font-medium text-gray-700 mb-1 text-xs md:text-sm">Room Name *</label>
                            <input
                              type="text"
                              className="w-full px-2 py-1 md:px-3 md:py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs md:text-sm"
                              placeholder="e.g., Standard Room, Deluxe Suite"
                              value={room.name}
                              onChange={(e) => {
                                const current = [...(listingForm.details?.roomTypes || [])];
                                current[index].name = e.target.value;
                                setListingForm({
                                  ...listingForm,
                                  details: {...listingForm.details, roomTypes: current}
                                });
                              }}
                            />
                          </div>
                          <div>
                            <label className="block font-medium text-gray-700 mb-1 text-xs md:text-sm">Bed Type</label>
                            <select
                              className="w-full px-2 py-1 md:px-3 md:py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs md:text-sm"
                              value={room.bedType}
                              onChange={(e) => {
                                const current = [...(listingForm.details?.roomTypes || [])];
                                current[index].bedType = e.target.value;
                                setListingForm({
                                  ...listingForm,
                                  details: {...listingForm.details, roomTypes: current}
                                });
                              }}
                            >
                              <option value="">Select Bed Type</option>
                              <option value="Single">Single</option>
                              <option value="Double">Double</option>
                              <option value="Queen Size">Queen Size</option>
                              <option value="King Size">King Size</option>
                            </select>
                          </div>
                          <div>
                            <label className="block font-medium text-gray-700 mb-1 text-xs md:text-sm">Price Per Night (₦) *</label>
                            <input
                              type="number"
                              className="w-full px-2 py-1 md:px-3 md:py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs md:text-sm"
                              placeholder="e.g., 37000"
                              value={room.pricePerNight}
                              onChange={(e) => {
                                const current = [...(listingForm.details?.roomTypes || [])];
                                const price = parseInt(e.target.value) || 0;
                                current[index].pricePerNight = price;
                                current[index].basePrice = price;
                                current[index].salesPrice = price;
                                setListingForm({
                                  ...listingForm,
                                  details: {...listingForm.details, roomTypes: current}
                                });
                              }}
                            />
                          </div>
                          <div>
                            <label className="block font-medium text-gray-700 mb-1 text-xs md:text-sm">Max Occupancy</label>
                            <input
                              type="number"
                              className="w-full px-2 py-1 md:px-3 md:py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs md:text-sm"
                              placeholder="e.g., 2"
                              value={room.maxOccupancy}
                              onChange={(e) => {
                                const current = [...(listingForm.details?.roomTypes || [])];
                                current[index].maxOccupancy = parseInt(e.target.value) || 2;
                                setListingForm({
                                  ...listingForm,
                                  details: {...listingForm.details, roomTypes: current}
                                });
                              }}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block font-medium text-gray-700 mb-1 text-xs md:text-sm">Amenities</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-1 md:gap-2">
                              {['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Room Service', 'Safe', 'Bathtub', 'Balcony'].map((amenity) => (
                                <label key={amenity} className="flex items-center text-xs md:text-sm">
                                  <input
                                    type="checkbox"
                                    className="mr-1 md:mr-1"
                                    checked={(room.amenities || []).includes(amenity)}
                                    onChange={(e) => {
                                      const current = [...(listingForm.details?.roomTypes || [])];
                                      const roomAmenities = current[index].amenities || [];
                                      if (e.target.checked) {
                                        roomAmenities.push(amenity);
                                      } else {
                                        const indexToRemove = roomAmenities.indexOf(amenity);
                                        if (indexToRemove > -1) {
                                          roomAmenities.splice(indexToRemove, 1);
                                        }
                                      }
                                      current[index].amenities = roomAmenities;
                                      setListingForm({
                                        ...listingForm,
                                        details: {...listingForm.details, roomTypes: current}
                                      });
                                    }}
                                  />
                                  {amenity}
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {listingCategory === 'shortlet' && (
                <div className="mb-6 md:mb-8">
                  <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4 flex items-center">
                    <FontAwesomeIcon icon={faHome} className="mr-2" />
                    Shortlet Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className="block font-medium text-gray-700 mb-2 text-sm md:text-base">Number of Rooms</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                        placeholder="e.g., 1"
                        value={listingForm.details?.numberOfRooms || ''}
                        onChange={(e) => setListingForm({
                          ...listingForm,
                          details: {...listingForm.details, numberOfRooms: parseInt(e.target.value)}
                        })}
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-gray-700 mb-2 text-sm md:text-base">Bed Type</label>
                      <select
                        className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                        value={listingForm.details?.bedType || ''}
                        onChange={(e) => setListingForm({
                          ...listingForm,
                          details: {...listingForm.details, bedType: e.target.value}
                        })}
                      >
                        <option value="">Select Bed Type</option>
                        <option value="Single">Single</option>
                        <option value="Double">Double</option>
                        <option value="Queen Size">Queen Size</option>
                        <option value="King Size">King Size</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium text-gray-700 mb-2 text-sm md:text-base">Price Per Night (₦) *</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                        placeholder="e.g., 1000"
                        value={listingForm.details?.pricePerNight || ''}
                        onChange={(e) => setListingForm({
                          ...listingForm,
                          details: {...listingForm.details, pricePerNight: parseInt(e.target.value)}
                        })}
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-gray-700 mb-2 text-sm md:text-base">Price Per Week (₦)</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                        placeholder="e.g., 7000"
                        value={listingForm.details?.pricePerWeek || ''}
                        onChange={(e) => setListingForm({
                          ...listingForm,
                          details: {...listingForm.details, pricePerWeek: parseInt(e.target.value)}
                        })}
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-gray-700 mb-2 text-sm md:text-base">Minimum Stay Duration</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                        placeholder="e.g., 1 night"
                        value={listingForm.details?.minimumStayDuration || ''}
                        onChange={(e) => setListingForm({
                          ...listingForm,
                          details: {...listingForm.details, minimumStayDuration: e.target.value}
                        })}
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-gray-700 mb-2 text-sm md:text-base">Maximum Guest Capacity</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                        placeholder="e.g., 2"
                        value={listingForm.details?.maximumGuestCapacity || ''}
                        onChange={(e) => setListingForm({
                          ...listingForm,
                          details: {...listingForm.details, maximumGuestCapacity: parseInt(e.target.value)}
                        })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block font-medium text-gray-700 mb-2 text-sm md:text-base">House Rules</label>
                      <textarea
                        className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base min-h-16 md:min-h-20"
                        placeholder="e.g., No smoking, no parties, quiet hours from 10 PM to 7 AM"
                        value={listingForm.details?.houseRules || ''}
                        onChange={(e) => setListingForm({
                          ...listingForm,
                          details: {...listingForm.details, houseRules: e.target.value}
                        })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block font-medium text-gray-700 mb-2 text-sm md:text-base">Refund Policy</label>
                      <textarea
                        className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base min-h-16 md:min-h-20"
                        placeholder="e.g., No refund after check-in, 50% refund if cancelled 48 hours before"
                        value={listingForm.details?.refundPolicy || ''}
                        onChange={(e) => setListingForm({
                          ...listingForm,
                          details: {...listingForm.details, refundPolicy: e.target.value}
                        })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block font-medium text-gray-700 mb-2 text-sm md:text-base">Google Maps Link</label>
                      <input
                        type="url"
                        className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                        placeholder="https://maps.google.com/?q=..."
                        value={listingForm.details?.googleMapsLink || ''}
                        onChange={(e) => setListingForm({
                          ...listingForm,
                          details: {...listingForm.details, googleMapsLink: e.target.value}
                        })}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2 md:space-y-3">
                      <label className="block font-medium text-gray-700 text-sm md:text-base">Available Amenities</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
                        {[
                          { label: 'Bathrooms Available', key: 'bathroomsAvailable' },
                          { label: 'Kitchen Available', key: 'kitchenAvailable' },
                          { label: 'Living Room Available', key: 'livingRoomAvailable' },
                          { label: 'Balcony Available', key: 'balconyAvailable' },
                          { label: 'Air Conditioning', key: 'airConditioning' },
                          { label: 'WiFi Available', key: 'wifiAvailable' },
                          { label: 'Smart TV', key: 'smartTV' },
                          { label: 'Security Available', key: 'securityAvailable' },
                          { label: 'Parking Available', key: 'parkingAvailable' },
                          { label: 'Cleaning Service', key: 'cleaningService' },
                          { label: 'Laundry Service', key: 'laundryService' },
                          { label: 'Swimming Pool', key: 'swimmingPool' },
                          { label: 'Gym', key: 'gym' }
                        ].map((amenity) => (
                          <label key={amenity.key} className="flex items-center text-sm md:text-base">
                            <input
                              type="checkbox"
                              className="mr-2"
                              checked={listingForm.details?.[amenity.key] || false}
                              onChange={(e) => setListingForm({
                                ...listingForm,
                                details: {...listingForm.details, [amenity.key]: e.target.checked}
                              })}
                            />
                            {amenity.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Image Upload Section */}
              <div className="mb-6 md:mb-8">
                <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4 flex items-center">
                  <FontAwesomeIcon icon={faCamera} className="mr-2" />
                  Upload Images
                </h4>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 md:p-8 text-center">
                  <div className="mb-3 md:mb-4">
                    <FontAwesomeIcon icon={faCloudUploadAlt} className="text-3xl md:text-4xl text-blue-500 mb-2 md:mb-3" />
                    <p className="text-gray-600 text-sm md:text-base">Drag & drop images here or click to browse</p>
                    <p className="text-xs md:text-sm text-gray-500 mt-1">Recommended: 1200x800px, max 5MB per image</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    id="imageUpload"
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      // Handle image upload logic here
                      console.log('Uploading images:', files);
                      if (files.length > 0) {
                        const newImages = files.map(file => ({
                          url: URL.createObjectURL(file),
                          name: file.name,
                          size: file.size
                        }));
                        setListingForm({
                          ...listingForm,
                          images: [...listingForm.images, ...newImages]
                        });
                      }
                    }}
                  />
                  <label htmlFor="imageUpload" className="px-4 py-2 md:px-6 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all cursor-pointer inline-block text-sm md:text-base">
                    Select Images
                  </label>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-3 md:mt-4">
                  {listingForm.images.map((image, index) => (
                    <div key={index} className="relative bg-gray-100 rounded-lg overflow-hidden">
                      <img src={image.url} alt={`Upload ${index + 1}`} className="w-full h-24 md:h-32 object-cover" />
                      <button
                        onClick={() => {
                          const newImages = [...listingForm.images];
                          newImages.splice(index, 1);
                          setListingForm({...listingForm, images: newImages});
                        }}
                        className="absolute top-1 right-1 w-5 h-5 md:w-6 md:h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {listingForm.images.length === 0 && (
                    <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-500 md:col-span-4">
                      <FontAwesomeIcon icon={faImage} className="text-xl md:text-2xl mb-2" />
                      <p className="text-xs md:text-sm">No images uploaded</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status & Submission */}
              <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
                  <div>
                    <label className="block font-medium text-gray-700 mb-2 text-sm md:text-base">Listing Status</label>
                    <select 
                      className="px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                      value={listingForm.status || 'pending'}
                      onChange={(e) => setListingForm({...listingForm, status: e.target.value})}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                  <div className="text-xs md:text-sm text-gray-600 max-w-md mt-3 md:mt-0">
                    <p className="mb-1 font-medium">Form will save data in the following structure:</p>
                    <div className="bg-gray-800 text-gray-200 p-2 rounded text-xs overflow-x-auto">
                      <pre>{JSON.stringify({
                        category: listingCategory,
                        name: listingForm.name || 'N/A',
                        vendorId: listingForm.vendorId || 'N/A',
                        status: listingForm.status || 'pending',
                        location: listingForm.location,
                        contactInformation: listingForm.contactInformation,
                        details: listingForm.details || {}
                      }, null, 2)}</pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 md:gap-3 p-4 md:p-6 border-t sticky bottom-0 bg-white z-10">
              <button onClick={closeModal} className="px-3 py-2 md:px-5 md:py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-all text-sm md:text-base">
                Cancel
              </button>
              <button 
                onClick={handleCreateListing}
                className="px-3 py-2 md:px-5 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm md:text-base"
              >
                Create Listing
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'impersonateModal' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div ref={modalRef} className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-4 md:p-6 border-b">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center">
                <FontAwesomeIcon icon={faUserSecret} className="mr-3" />
                Impersonate User
              </h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="p-4 md:p-6">
              <p className="mb-3 md:mb-4 text-sm md:text-base">Enter the User ID or email of the user you want to impersonate:</p>
              <input
                type="text"
                id="userIdInput"
                className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg mb-3 md:mb-4 text-sm md:text-base"
                placeholder="User ID or email"
              />
              <p className="text-yellow-600 text-xs md:text-sm">
                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                <strong>Warning:</strong> You will be logged in as this user with full access to their account. All your actions will be recorded in the audit log.
              </p>
            </div>
            <div className="flex justify-end gap-2 md:gap-3 p-4 md:p-6 border-t">
              <button onClick={closeModal} className="px-3 py-2 md:px-5 md:py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-all text-sm md:text-base">
                Cancel
              </button>
              <button onClick={executeImpersonation} className="px-3 py-2 md:px-5 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm md:text-base">
                Impersonate User
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'stopBookingsModal' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div ref={modalRef} className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-4 md:p-6 border-b">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center">
                <FontAwesomeIcon icon={faBan} className="mr-3" />
                Stop All Bookings
              </h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="p-4 md:p-6">
              <p className="mb-2 md:mb-3 text-sm md:text-base"><strong>Warning:</strong> This action will immediately stop all booking functionality across the entire platform.</p>
              <p className="mb-2 md:mb-3 text-sm md:text-base">Users will not be able to create new bookings, and vendors will not receive booking requests.</p>
              <p className="text-sm md:text-base">Existing bookings will remain in their current state.</p>
            </div>
            <div className="flex justify-end gap-2 md:gap-3 p-4 md:p-6 border-t">
              <button onClick={closeModal} className="px-3 py-2 md:px-5 md:py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-all text-sm md:text-base">
                Cancel
              </button>
              <button onClick={() => executeOverride('stopBookings')} className="px-3 py-2 md:px-5 md:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm md:text-base">
                Stop All Bookings
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'createUserModal' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div ref={modalRef} className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex justify-between items-center p-4 md:p-6 border-b">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center">
                <FontAwesomeIcon icon={faUserPlus} className="mr-3" />
                Create New User
              </h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="p-4 md:p-6 space-y-3 md:space-y-4">
              <div>
                <label className="block font-semibold text-gray-900 mb-2 text-sm md:text-base">Full Name</label>
                <input type="text" className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg text-sm md:text-base" placeholder="Enter full name" />
              </div>
              <div>
                <label className="block font-semibold text-gray-900 mb-2 text-sm md:text-base">Email Address</label>
                <input type="email" className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg text-sm md:text-base" placeholder="Enter email" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block font-semibold text-gray-900 mb-2 text-sm md:text-base">User Type</label>
                  <select className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg text-sm md:text-base">
                    <option>Customer</option>
                    <option>Vendor</option>
                    <option>Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-900 mb-2 text-sm md:text-base">Status</label>
                  <select className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg text-sm md:text-base">
                    <option>Active</option>
                    <option>Pending</option>
                    <option>Suspended</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 md:gap-3 p-4 md:p-6 border-t">
              <button onClick={closeModal} className="px-3 py-2 md:px-5 md:py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-all text-sm md:text-base">
                Cancel
              </button>
              <button onClick={createUser} className="px-3 py-2 md:px-5 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm md:text-base">
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'exportDataModal' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div ref={modalRef} className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex justify-between items-center p-4 md:p-6 border-b">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center">
                <FontAwesomeIcon icon={faDownload} className="mr-3" />
                Export Data
              </h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="p-4 md:p-6">
              <p className="mb-3 md:mb-4 text-sm md:text-base">Select what data you want to export:</p>
              <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                {['Users Data (0 records)', 'Vendors Data (0 records)', 'Listings Data (0 records)', 'Booking History (0 records)', 'Messages (0 records)', 'Audit Logs (0 records)'].map((item, index) => (
                  <label key={index} className="flex items-center text-sm md:text-base">
                    <input type="checkbox" defaultChecked={index < 3} className="mr-2 md:mr-3" />
                    {item}
                  </label>
                ))}
              </div>
              <div>
                <label className="block font-semibold text-gray-900 mb-2 text-sm md:text-base">Export Format</label>
                <select className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg text-sm md:text-base">
                  <option>CSV</option>
                  <option>JSON</option>
                  <option>Excel (XLSX)</option>
                  <option>SQL Dump</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 md:gap-3 p-4 md:p-6 border-t">
              <button onClick={closeModal} className="px-3 py-2 md:px-5 md:py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-all text-sm md:text-base">
                Cancel
              </button>
              <button onClick={exportData} className="px-3 py-2 md:px-5 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm md:text-base">
                Export Data
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'logoutModal' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div ref={modalRef} className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-4 md:p-6 border-b">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center">
                <FontAwesomeIcon icon={faSignOutAlt} className="mr-3" />
                Confirm Logout
              </h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="p-4 md:p-6">
              <p className="mb-2 md:mb-3 text-sm md:text-base">Are you sure you want to logout from the Super Admin dashboard?</p>
              <p className="text-sm md:text-base">You will need to login again to access the system.</p>
            </div>
            <div className="flex justify-end gap-2 md:gap-3 p-4 md:p-6 border-t">
              <button onClick={closeModal} className="px-3 py-2 md:px-5 md:py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-all text-sm md:text-base">
                Cancel
              </button>
              <button onClick={logout} className="px-3 py-2 md:px-5 md:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm md:text-base">
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;