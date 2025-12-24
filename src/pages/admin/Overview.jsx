import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCrown,
  faUserShield,
  faTachometerAlt,
  faUsers,
  faStore,
  faListAlt,
  faCalendarCheck,
  faComments,
  faStar,
  faRobot,
  faCogs,
  faShieldAlt,
  faSyncAlt,
  faDatabase,
  faSignOutAlt,
  faUserSecret,
  faPowerOff,
  faBan,
  faCommentSlash,
  faSkullCrossbones,
  faUserPlus,
  faDownload,
  faPlusSquare,
  faEdit,
  faPlusCircle,
  faTimesCircle,
  faSave,
  faScroll,
  faBars,
  faKey,
  faUserSlash,
  faTrash,
  faEye,
  faTimes,
  faBrain,
  faExchangeAlt,
  faCode,
  faSlidersH,
  faVolumeUp,
  faChartBar,
  faChartLine,
  faTasks,
  faListCheck,
  faBroom,
  faTrashAlt,
  faRedo,
  faHistory,
  faTerminal,
  faCheckCircle,
  faClipboardList,
  faChartPie,
  faUpload,
  faCloudUploadAlt,
  faFileCsv,
  faCloudDownloadAlt,
  faHdd,
  faTable,
  faExclamationTriangle,
  faMicrochip,
  faBolt,
  faRocket,
  faServer,
  faInfoCircle,
  faHeartbeat,
  faToggleOn,
  faClock,
  faGavel,
  faBoltLightning,
  faUserEdit,
  faStoreSlash,
  faCog,
  faUserSlash as faUserSlashSolid,
} from "@fortawesome/free-solid-svg-icons";
import { faOpenai, faGoogle } from "@fortawesome/free-brands-svg-icons";

const Overview = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [aiProvider, setAiProvider] = useState("deepseek");
  const [systemPrompt, setSystemPrompt] =
    useState(`You are AJANI Assistant, a helpful AI for the AJANI service marketplace.

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
    blogWidgets: false,
  });

  const modalRef = useRef(null);

  // Sample data
  const sampleData = {
    users: [
      {
        id: 8472,
        name: "John Smith",
        email: "john@example.com",
        type: "Customer",
        status: "Active",
        joined: "2024-01-15",
      },
      {
        id: 6291,
        name: "Sarah Johnson",
        email: "sarah@example.com",
        type: "Vendor",
        status: "Suspended",
        joined: "2024-02-10",
      },
      {
        id: 4953,
        name: "Michael Brown",
        email: "michael@example.com",
        type: "Customer",
        status: "Active",
        joined: "2024-03-05",
      },
      {
        id: 3829,
        name: "Emma Wilson",
        email: "emma@example.com",
        type: "Vendor",
        status: "Pending",
        joined: "2024-03-12",
      },
    ],
    vendors: [
      {
        id: "V101",
        name: "QuickFix Solutions",
        owner: "Sarah Johnson",
        category: "Home Services",
        listings: 12,
        status: "Suspended",
        approved: "2024-01-20",
      },
      {
        id: "V102",
        name: "Elite Cleaners",
        owner: "Robert Chen",
        category: "Cleaning",
        listings: 8,
        status: "Active",
        approved: "2024-02-15",
      },
      {
        id: "V103",
        name: "TechGuru IT",
        owner: "Michael Brown",
        category: "IT Services",
        listings: 15,
        status: "Pending",
        approved: "-",
      },
    ],
    listings: [
      {
        id: "L4501",
        title: "Emergency Plumbing Service",
        vendor: "QuickFix Solutions",
        category: "Home Services",
        price: "$120",
        status: "Active",
        featured: true,
      },
    ],
    bookings: [
      {
        id: "B7842",
        user: "John Smith",
        vendor: "Elite Cleaners",
        service: "Deep Cleaning",
        date: "2024-03-15",
        status: "Pending",
        amount: "$150",
      },
    ],
  };

  // Navigation
  const navigateToPage = (page) => {
    setCurrentPage(page);
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
    setFeatureToggles((prev) => ({
      ...prev,
      [feature]: !prev[feature],
    }));
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Action functions
  const executeImpersonation = () => {
    const userId = document.getElementById("userIdInput")?.value;
    if (userId) {
      alert(`Impersonating user: ${userId}`);
      closeModal();
    } else {
      alert("Please enter a User ID or email");
    }
  };

  const executeOverride = (action) => {
    alert(`Executing override: ${action}`);
    closeModal();
  };

  const saveAISettings = () => {
    alert("AI settings saved successfully!");
    console.log("System prompt updated:", systemPrompt);
  };

  const exportUsers = () => {
    alert("Exporting users data...");
  };

  const exportVendors = () => {
    alert("Exporting vendors data...");
  };

  const exportBookings = () => {
    alert("Exporting bookings data...");
  };

  const fullDatabaseExport = () => {
    alert("Exporting full database...");
  };

  const backupSystem = () => {
    alert("Creating system backup...");
  };

  const rotateApiKeys = () => {
    if (
      confirm(
        "Are you sure you want to rotate all API keys? This will break existing integrations until they update their keys."
      )
    ) {
      alert("API keys rotated successfully!");
    }
  };

  const logout = () => {
    if (confirm("Are you sure you want to logout?")) {
      alert("Logged out successfully!");
      closeModal();
    }
  };

  const createUser = () => {
    alert("Creating new user...");
    closeModal();
  };

  const exportData = () => {
    alert("Exporting selected data...");
    closeModal();
  };

  const runMaintenance = () => {
    alert("Running system maintenance...");
  };

  const clearCache = () => {
    alert("Clearing system cache...");
  };

  const optimizeDatabase = () => {
    alert("Optimizing database...");
  };

  const updateSystem = () => {
    alert("Checking for system updates...");
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        event.target.classList.contains("modal")
      ) {
        closeModal();
      }
    };

    if (activeModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeModal]);

  // Navigation items
  const navItems = [
    { id: "dashboard", icon: faTachometerAlt, label: "Dashboard" },
    { id: "users", icon: faUsers, label: "User Management" },
    { id: "vendors", icon: faStore, label: "Vendor Control" },
    { id: "listings", icon: faListAlt, label: "Listings" },
    { id: "bookings", icon: faCalendarCheck, label: "Booking Requests" },
    { id: "messages", icon: faComments, label: "Messages" },
    { id: "reviews", icon: faStar, label: "Reviews & Moderation" },
    { id: "ai-control", icon: faRobot, label: "AI & Chatbot Control" },
    { id: "system-control", icon: faCogs, label: "System Control" },
    { id: "security", icon: faShieldAlt, label: "Security & Audit" },
    { id: "automation", icon: faSyncAlt, label: "Automation (n8n)" },
    { id: "data-control", icon: faDatabase, label: "Data Control" },
  ];

  // Stats cards
  const statsCards = [
    {
      title: "Total Users",
      value: "1,847",
      change: "+12 this week",
      positive: true,
      icon: faUsers,
      page: "users",
    },
    {
      title: "Total Vendors",
      value: "324",
      change: "+8 this week",
      positive: true,
      icon: faStore,
      page: "vendors",
    },
    {
      title: "Active Listings",
      value: "1,209",
      change: "-3 today",
      positive: false,
      icon: faListAlt,
      page: "listings",
    },
    {
      title: "Pending Bookings",
      value: "47",
      change: "+12 today",
      positive: true,
      icon: faCalendarCheck,
      page: "bookings",
    },
    {
      title: "Open Conversations",
      value: "89",
      change: "+5 today",
      positive: true,
      icon: faComments,
      page: "messages",
    },
    {
      title: "System Health",
      value: "100%",
      change: "All systems operational",
      positive: true,
      icon: faHeartbeat,
      page: "system-control",
    },
  ];

  // Recent activities
  const recentActivities = [
    {
      type: "system",
      icon: faCog,
      title: "Feature Toggle Updated",
      description: "Disabled vendor registrations temporarily",
      time: "2 minutes ago",
    },
    {
      type: "user",
      icon: faUserEdit,
      title: "User Profile Edited",
      description: "Changed user #8472 subscription plan",
      time: "15 minutes ago",
    },
    {
      type: "vendor",
      icon: faStoreSlash,
      title: "Vendor Suspended",
      description: 'Vendor "QuickFix Solutions" suspended for TOS violation',
      time: "1 hour ago",
    },
    {
      type: "system",
      icon: faRobot,
      title: "AI Prompt Updated",
      description: "Modified chatbot system prompt for better responses",
      time: "3 hours ago",
    },
    {
      type: "user",
      icon: faUserSecret,
      title: "User Impersonation",
      description: "Impersonated user #6291 to debug booking issue",
      time: "5 hours ago",
    },
  ];

  // Override actions
  const overrideActions = [
    { icon: faBan, label: "Stop All Bookings", modal: "stopBookingsModal" },
    {
      icon: faCommentSlash,
      label: "Disable Messaging",
      modal: "disableChatModal",
    },
    {
      icon: faSignOutAlt,
      label: "Force Logout All Users",
      modal: "forceLogoutModal",
    },
    {
      icon: faSkullCrossbones,
      label: "Emergency Shutdown",
      modal: "emergencyModal",
      danger: true,
    },
  ];

  // System status items
  const systemStatusItems = [
    { indicator: "online", label: "Database", value: "Online" },
    { indicator: "online", label: "API Server", value: "Online" },
    { indicator: "online", label: "Automation (n8n)", value: "Running" },
    {
      indicator: "warning",
      label: "AI Service (DeepSeek)",
      value: "High Load",
    },
    { indicator: "online", label: "Backup Schedule", value: "Last: 2h ago" },
  ];

  // Quick actions
  const quickActions = [
    { icon: faUserPlus, label: "Create User", page: "users" },
    { icon: faStore, label: "Create Vendor", page: "vendors" },
    { icon: faPlusSquare, label: "Create Listing", page: "listings" },
    { icon: faEdit, label: "Edit AI Prompt", page: "ai-control" },
    { icon: faScroll, label: "View Audit Logs", page: "security" },
    { icon: faDownload, label: "Export Data", modal: "exportDataModal" },
  ];

  // AI providers
  const aiProviders = [
    { id: "deepseek", icon: faBrain, label: "DeepSeek" },
    { id: "openai", icon: faOpenai, label: "OpenAI" },
    { id: "anthropic", icon: faRobot, label: "Anthropic" },
  ];

  // AI usage stats
  const aiUsageStats = [
    { value: "1,248", label: "Today's Queries" },
    { value: "98.2%", label: "Success Rate" },
    { value: "2.1s", label: "Avg Response Time" },
    { value: "0", label: "Blocked Queries" },
  ];

  // System tasks
  const systemTasks = [
    { icon: faBroom, label: "Run Maintenance", action: runMaintenance },
    { icon: faTrashAlt, label: "Clear Cache", action: clearCache },
    { icon: faDatabase, label: "Optimize DB", action: optimizeDatabase },
    { icon: faSyncAlt, label: "Check Updates", action: updateSystem },
  ];

  // Security status
  const securityStatus = [
    { indicator: "online", label: "SSL/TLS", value: "Valid" },
    { indicator: "online", label: "Firewall", value: "Active" },
    { indicator: "warning", label: "Failed Logins", value: "24 attempts" },
    { indicator: "online", label: "Last Security Scan", value: "6h ago" },
  ];

  // Audit summary
  const auditSummary = [
    { value: "847", label: "Today's Actions" },
    { value: "12", label: "Security Alerts" },
    { value: "5", label: "Admin Logins" },
    { value: "0", label: "Unauthorized" },
  ];

  // Import actions
  const importActions = [
    { icon: faFileCsv, label: "CSV Import", modal: "importCSVModal" },
    { icon: faGoogle, label: "Google Sheets", modal: "importSheetsModal" },
    { icon: faHistory, label: "Restore Backup", modal: "restoreBackupModal" },
  ];

  // Export actions
  const exportActions = [
    { icon: faUsers, label: "Export Users", action: exportUsers },
    { icon: faStore, label: "Export Vendors", action: exportVendors },
    { icon: faCalendarCheck, label: "Export Bookings", action: exportBookings },
    { icon: faDatabase, label: "Full Database", action: fullDatabaseExport },
  ];

  // Database info
  const databaseInfo = [
    { icon: faHdd, label: "Database Size", value: "2.4 GB" },
    { icon: faTable, label: "Tables", value: "42 tables" },
    { icon: faHistory, label: "Last Backup", value: "2 hours ago" },
    { icon: faSyncAlt, label: "Auto-backup", value: "Every 6 hours" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <div
        className={`${
          sidebarCollapsed ? "w-20" : "w-64"
        } bg-blue-900 text-white flex flex-col fixed h-screen overflow-y-auto transition-all duration-300 z-50`}
      >
        <div className="flex items-center p-6 pb-8 border-b border-blue-800">
          <FontAwesomeIcon
            icon={faCrown}
            className="text-yellow-400 text-2xl min-w-8"
          />
          {!sidebarCollapsed && (
            <h1 className="text-xl font-bold ml-3">AJANI</h1>
          )}
        </div>

        <div className="bg-blue-800 p-4 mx-6 mt-6 rounded-lg flex items-center transition-all">
          <FontAwesomeIcon
            icon={faUserShield}
            className="text-yellow-400 mr-3"
          />
          {!sidebarCollapsed && (
            <span className="font-semibold text-sm">SUPER ADMIN</span>
          )}
        </div>

        <div className="flex-1 mt-6 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigateToPage(item.id)}
              className={`flex items-center w-full p-4 transition-all ${
                currentPage === item.id
                  ? "bg-blue-800 border-l-4 border-yellow-400"
                  : "border-l-4 border-transparent hover:bg-blue-800"
              }`}
            >
              <FontAwesomeIcon
                icon={item.icon}
                className="text-lg min-w-6 mr-4"
              />
              {!sidebarCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={() => showModal("logoutModal")}
          className="bg-blue-800 m-6 p-3 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-all"
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="mr-3" />
          {!sidebarCollapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Toggle Sidebar Button */}
      <button
        onClick={toggleSidebar}
        className="fixed bottom-6 left-6 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg z-40"
      >
        <FontAwesomeIcon icon={faBars} />
      </button>

      {/* Main Content */}
      <div
        className={`flex-1 ${
          sidebarCollapsed ? "ml-20" : "ml-64"
        } p-8 transition-all duration-300`}
      >
        {/* Dashboard Page */}
        {currentPage === "dashboard" && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
                Super Admin Dashboard
              </h2>
              <div className="flex gap-4">
                <button
                  onClick={() => showModal("impersonateModal")}
                  className="px-5 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                >
                  <FontAwesomeIcon icon={faUserSecret} className="mr-2" />
                  Impersonate User
                </button>
                <button
                  onClick={() => {
                    if (
                      confirm(
                        "Toggle maintenance mode? This will show a maintenance page to all users."
                      )
                    ) {
                      alert("Maintenance mode toggled");
                    }
                  }}
                  className="px-5 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
                >
                  <FontAwesomeIcon icon={faPowerOff} className="mr-2" />
                  Maintenance Mode
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {statsCards.map((stat, index) => (
                <div
                  key={index}
                  onClick={() => navigateToPage(stat.page)}
                  className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-sm text-gray-500 uppercase font-semibold tracking-wide">
                        {stat.title}
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mt-2">
                        {stat.value}
                      </div>
                      <div
                        className={`text-sm font-medium ${
                          stat.positive ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {stat.change}
                      </div>
                    </div>
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={stat.icon} className="text-2xl" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Control Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Feature Toggles */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-6 pb-4 border-b">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <FontAwesomeIcon icon={faToggleOn} className="mr-2" />
                    Feature Toggles
                  </h3>
                  <FontAwesomeIcon
                    icon={faSlidersH}
                    className="text-blue-600"
                  />
                </div>
                <div className="space-y-4">
                  {Object.entries(featureToggles).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between items-center py-3 border-b last:border-b-0"
                    >
                      <div className="flex items-center">
                        <FontAwesomeIcon
                          icon={
                            key === "bookingSystem"
                              ? faCalendarCheck
                              : key === "messaging"
                              ? faComments
                              : key === "reviews"
                              ? faStar
                              : key === "chatbot"
                              ? faRobot
                              : faBolt
                          }
                          className="text-gray-500 mr-3"
                        />
                        <span>
                          {key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())}
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={() => toggleFeature(key)}
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-600 transition-all"></div>
                        <div
                          className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all ${
                            value ? "translate-x-6" : ""
                          }`}
                        ></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-6 pb-4 border-b">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <FontAwesomeIcon icon={faHistory} className="mr-2" />
                    Recent Admin Activity
                  </h3>
                  <FontAwesomeIcon icon={faClock} className="text-blue-600" />
                </div>
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {recentActivities.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start py-3 border-b last:border-b-0"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                          activity.type === "system"
                            ? "bg-orange-100 text-orange-600"
                            : activity.type === "user"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        <FontAwesomeIcon icon={activity.icon} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">
                          {activity.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {activity.description}
                        </p>
                        <div className="text-xs text-gray-500 mt-1">
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Override Actions */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-8">
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <FontAwesomeIcon icon={faGavel} className="mr-2" />
                  Immediate Override Actions
                </h3>
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="text-red-600"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {overrideActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => showModal(action.modal)}
                    className={`p-4 bg-white border-2 rounded-lg flex flex-col items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all ${
                      action.danger
                        ? "border-red-300 hover:bg-red-600 hover:border-red-600"
                        : "border-gray-300"
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={action.icon}
                      className="text-2xl mb-3"
                    />
                    <span className="font-semibold text-center">
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* System Status & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Status */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-6 pb-4 border-b">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <FontAwesomeIcon icon={faServer} className="mr-2" />
                    System Status
                  </h3>
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    className="text-blue-600"
                  />
                </div>
                <div className="space-y-4">
                  {systemStatusItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b last:border-b-0"
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-3 h-3 rounded-full mr-3 ${
                            item.indicator === "online"
                              ? "bg-green-500"
                              : "bg-yellow-500"
                          }`}
                        ></div>
                        <span>{item.label}</span>
                      </div>
                      <div className="font-semibold text-sm">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-6 pb-4 border-b">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <FontAwesomeIcon icon={faBolt} className="mr-2" />
                    Quick Actions
                  </h3>
                  <FontAwesomeIcon icon={faRocket} className="text-blue-600" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        action.page
                          ? navigateToPage(action.page)
                          : showModal(action.modal)
                      }
                      className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center justify-center"
                    >
                      <FontAwesomeIcon
                        icon={action.icon}
                        className="text-2xl text-blue-600 mb-2"
                      />
                      <span className="font-semibold text-sm text-center">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Management Page */}
        {currentPage === "users" && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0 flex items-center">
                <FontAwesomeIcon icon={faUsers} className="mr-3" />
                User Management
              </h2>
              <div className="flex gap-4">
                <button
                  onClick={() => showModal("createUserModal")}
                  className="px-5 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                >
                  <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                  Create User
                </button>
                <button
                  onClick={exportUsers}
                  className="px-5 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                >
                  <FontAwesomeIcon icon={faDownload} className="mr-2" />
                  Export Users
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="bg-blue-600 text-white p-5 flex flex-col md:flex-row justify-between items-start md:items-center">
                <h3 className="text-lg font-semibold mb-4 md:mb-0">
                  All Users (1,847)
                </h3>
                <input
                  type="text"
                  placeholder="Search users..."
                  className="px-4 py-2 rounded-lg text-gray-800 min-w-64"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-4 text-left font-semibold text-gray-900">
                        ID
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-900">
                        Name
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-900">
                        Email
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-900">
                        Type
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-900">
                        Joined
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleData.users.map((user, index) => (
                      <tr
                        key={index}
                        className="hover:bg-blue-50 border-b last:border-b-0"
                      >
                        <td className="p-4">#{user.id}</td>
                        <td className="p-4 font-medium">{user.name}</td>
                        <td className="p-4 text-gray-600">{user.email}</td>
                        <td className="p-4">{user.type}</td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              user.status === "Active"
                                ? "bg-green-100 text-green-800"
                                : user.status === "Suspended"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="p-4">{user.joined}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
                              <FontAwesomeIcon icon={faEdit} size="sm" />
                            </button>
                            <button className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all">
                              <FontAwesomeIcon icon={faUserSecret} size="sm" />
                            </button>
                            <button className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all">
                              <FontAwesomeIcon icon={faTrash} size="sm" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <FontAwesomeIcon icon={faCogs} className="mr-2" />
                  Bulk User Actions
                </h3>
                <FontAwesomeIcon icon={faUsers} className="text-blue-600" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button className="p-4 bg-white border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
                  <FontAwesomeIcon icon={faKey} className="text-2xl mb-3" />
                  <span className="font-semibold text-center">
                    Reset Passwords
                  </span>
                </button>
                <button className="p-4 bg-white border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
                  <FontAwesomeIcon
                    icon={faUserSlashSolid}
                    className="text-2xl mb-3"
                  />
                  <span className="font-semibold text-center">
                    Suspend Users
                  </span>
                </button>
                <button className="p-4 bg-white border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
                  <FontAwesomeIcon
                    icon={faDownload}
                    className="text-2xl mb-3"
                  />
                  <span className="font-semibold text-center">
                    Export All Data
                  </span>
                </button>
                <button className="p-4 bg-white border-2 border-red-300 rounded-lg flex flex-col items-center justify-center hover:bg-red-600 hover:text-white hover:border-red-600 transition-all">
                  <FontAwesomeIcon icon={faTrash} className="text-2xl mb-3" />
                  <span className="font-semibold text-center">
                    Delete Users
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Vendors Control Page */}
        {currentPage === "vendors" && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0 flex items-center">
                <FontAwesomeIcon icon={faStore} className="mr-3" />
                Vendor Control
              </h2>
              <div className="flex gap-4">
                <button
                  onClick={() => showModal("createVendorModal")}
                  className="px-5 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                >
                  <FontAwesomeIcon icon={faStore} className="mr-2" />
                  Create Vendor
                </button>
                <button
                  onClick={() => showModal("suspendAllVendorsModal")}
                  className="px-5 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
                >
                  <FontAwesomeIcon icon={faBan} className="mr-2" />
                  Suspend All
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-blue-600 text-white p-5 flex flex-col md:flex-row justify-between items-start md:items-center">
                <h3 className="text-lg font-semibold mb-4 md:mb-0">
                  All Vendors (324)
                </h3>
                <input
                  type="text"
                  placeholder="Search vendors..."
                  className="px-4 py-2 rounded-lg text-gray-800 min-w-64"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-4 text-left font-semibold text-gray-900">
                        ID
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-900">
                        Vendor Name
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-900">
                        Owner
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-900">
                        Category
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-900">
                        Listings
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-900">
                        Approved
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleData.vendors.map((vendor, index) => (
                      <tr
                        key={index}
                        className="hover:bg-blue-50 border-b last:border-b-0"
                      >
                        <td className="p-4">{vendor.id}</td>
                        <td className="p-4 font-medium">{vendor.name}</td>
                        <td className="p-4">{vendor.owner}</td>
                        <td className="p-4">{vendor.category}</td>
                        <td className="p-4">{vendor.listings}</td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              vendor.status === "Active"
                                ? "bg-green-100 text-green-800"
                                : vendor.status === "Suspended"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {vendor.status}
                          </span>
                        </td>
                        <td className="p-4">{vendor.approved}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
                              <FontAwesomeIcon icon={faEdit} size="sm" />
                            </button>
                            <button className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all">
                              <FontAwesomeIcon icon={faEye} size="sm" />
                            </button>
                            <button className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all">
                              <FontAwesomeIcon icon={faTrash} size="sm" />
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
        {currentPage === "listings" && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0 flex items-center">
                <FontAwesomeIcon icon={faListAlt} className="mr-3" />
                Listings Control
              </h2>
              <div className="flex gap-4">
                <button
                  onClick={() => showModal("createListingModal")}
                  className="px-5 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                >
                  <FontAwesomeIcon icon={faPlusSquare} className="mr-2" />
                  Create Listing
                </button>
                <button
                  onClick={() => showModal("bulkEditModal")}
                  className="px-5 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                >
                  <FontAwesomeIcon icon={faEdit} className="mr-2" />
                  Bulk Edit
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-blue-600 text-white p-5 flex flex-col md:flex-row justify-between items-start md:items-center">
                <h3 className="text-lg font-semibold mb-4 md:mb-0">
                  All Listings (1,209)
                </h3>
                <input
                  type="text"
                  placeholder="Search listings..."
                  className="px-4 py-2 rounded-lg text-gray-800 min-w-64"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-4 text-left font-semibold text-gray-900">
                        ID
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-900">
                        Title
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-900">
                        Vendor
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-900">
                        Category
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-900">
                        Price
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-900">
                        Featured
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleData.listings.map((listing, index) => (
                      <tr
                        key={index}
                        className="hover:bg-blue-50 border-b last:border-b-0"
                      >
                        <td className="p-4">{listing.id}</td>
                        <td className="p-4 font-medium">{listing.title}</td>
                        <td className="p-4">{listing.vendor}</td>
                        <td className="p-4">{listing.category}</td>
                        <td className="p-4">{listing.price}</td>
                        <td className="p-4">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            {listing.status}
                          </span>
                        </td>
                        <td className="p-4">
                          {listing.featured && (
                            <FontAwesomeIcon
                              icon={faStar}
                              className="text-yellow-400"
                            />
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
                              <FontAwesomeIcon icon={faEdit} size="sm" />
                            </button>
                            <button className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all">
                              <FontAwesomeIcon icon={faEye} size="sm" />
                            </button>
                            <button className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all">
                              <FontAwesomeIcon icon={faTrash} size="sm" />
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
        {currentPage === "bookings" && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0 flex items-center">
                <FontAwesomeIcon icon={faCalendarCheck} className="mr-3" />
                Booking Requests
              </h2>
              <div className="flex gap-4">
                <button
                  onClick={() => showModal("createBookingModal")}
                  className="px-5 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                >
                  <FontAwesomeIcon icon={faPlusCircle} className="mr-2" />
                  Create Booking
                </button>
                <button
                  onClick={() => showModal("cancelAllBookingsModal")}
                  className="px-5 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
                >
                  <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />
                  Cancel All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center justify-center">
                <div className="text-3xl font-bold text-gray-900">47</div>
                <span className="font-semibold text-gray-600">Pending</span>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center justify-center">
                <div className="text-3xl font-bold text-gray-900">128</div>
                <span className="font-semibold text-gray-600">Confirmed</span>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center justify-center">
                <div className="text-3xl font-bold text-gray-900">24</div>
                <span className="font-semibold text-gray-600">Cancelled</span>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center justify-center">
                <div className="text-3xl font-bold text-gray-900">892</div>
                <span className="font-semibold text-gray-600">
                  Total This Month
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-blue-600 text-white p-5 flex flex-col md:flex-row justify-between items-start md:items-center">
                <h3 className="text-lg font-semibold mb-4 md:mb-0">
                  Recent Booking Requests
                </h3>
                <input
                  type="text"
                  placeholder="Search bookings..."
                  className="px-4 py-2 rounded-lg text-gray-800 min-w-64"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-4 text-left font-semibold text-gray-900">
                        ID
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-900">
                        User
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-900">
                        Vendor
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-900">
                        Service
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-900">
                        Date
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-900">
                        Amount
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleData.bookings.map((booking, index) => (
                      <tr
                        key={index}
                        className="hover:bg-blue-50 border-b last:border-b-0"
                      >
                        <td className="p-4">{booking.id}</td>
                        <td className="p-4 font-medium">{booking.user}</td>
                        <td className="p-4">{booking.vendor}</td>
                        <td className="p-4">{booking.service}</td>
                        <td className="p-4">{booking.date}</td>
                        <td className="p-4">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                            {booking.status}
                          </span>
                        </td>
                        <td className="p-4">{booking.amount}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
                              <FontAwesomeIcon icon={faEdit} size="sm" />
                            </button>
                            <button className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all">
                              <FontAwesomeIcon icon={faEye} size="sm" />
                            </button>
                            <button className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all">
                              <FontAwesomeIcon icon={faTimes} size="sm" />
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
        {currentPage === "ai-control" && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0 flex items-center">
                <FontAwesomeIcon icon={faRobot} className="mr-3" />
                AI & Chatbot Control
              </h2>
              <div className="flex gap-4">
                <button
                  onClick={saveAISettings}
                  className="px-5 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                >
                  <FontAwesomeIcon icon={faSave} className="mr-2" />
                  Save Settings
                </button>
                <button
                  onClick={() => showModal("aiLogsModal")}
                  className="px-5 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                >
                  <FontAwesomeIcon icon={faScroll} className="mr-2" />
                  View Logs
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md mb-6">
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <FontAwesomeIcon icon={faMicrochip} className="mr-2" />
                  AI Provider Selection
                </h3>
                <FontAwesomeIcon
                  icon={faExchangeAlt}
                  className="text-blue-600"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiProviders.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => setAiProvider(provider.id)}
                    className={`p-4 border-2 rounded-lg flex items-center justify-center gap-3 transition-all ${
                      aiProvider === provider.id
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-300"
                    }`}
                  >
                    <FontAwesomeIcon icon={provider.icon} className="text-xl" />
                    <span className="font-medium">{provider.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md mb-8">
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <FontAwesomeIcon icon={faEdit} className="mr-2" />
                  System Prompt
                </h3>
                <FontAwesomeIcon icon={faCode} className="text-blue-600" />
              </div>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full min-h-48 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="10"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-6 pb-4 border-b">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <FontAwesomeIcon icon={faSlidersH} className="mr-2" />
                    AI Settings
                  </h3>
                  <FontAwesomeIcon icon={faCog} className="text-blue-600" />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <div className="flex items-center">
                      <FontAwesomeIcon
                        icon={faPowerOff}
                        className="text-gray-500 mr-3"
                      />
                      <span>Chatbot Enabled</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={featureToggles.chatbot}
                        onChange={() => toggleFeature("chatbot")}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-600 transition-all"></div>
                      <div
                        className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all ${
                          featureToggles.chatbot ? "translate-x-6" : ""
                        }`}
                      ></div>
                    </label>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <div className="flex items-center">
                      <FontAwesomeIcon
                        icon={faVolumeUp}
                        className="text-gray-500 mr-3"
                      />
                      <span>Response Tone</span>
                    </div>
                    <select className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-40">
                      <option>Professional</option>
                      <option>Friendly</option>
                      <option>Formal</option>
                      <option>Casual</option>
                    </select>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <div className="flex items-center">
                      <FontAwesomeIcon
                        icon={faBan}
                        className="text-gray-500 mr-3"
                      />
                      <span>Restricted Topics</span>
                    </div>
                    <input
                      type="text"
                      placeholder="Politics, Religion, etc."
                      className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-6 pb-4 border-b">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <FontAwesomeIcon icon={faChartLine} className="mr-2" />
                    AI Usage Stats
                  </h3>
                  <FontAwesomeIcon
                    icon={faChartBar}
                    className="text-blue-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {aiUsageStats.map((stat, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-4 rounded-lg flex flex-col items-center justify-center"
                    >
                      <div className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </div>
                      <span className="font-semibold text-sm text-gray-600 text-center">
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Control Page */}
        {currentPage === "system-control" && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0 flex items-center">
                <FontAwesomeIcon icon={faCogs} className="mr-3" />
                System Control
              </h2>
              <div className="flex gap-4">
                <button
                  onClick={backupSystem}
                  className="px-5 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                >
                  <FontAwesomeIcon icon={faSave} className="mr-2" />
                  Backup Now
                </button>
                <button
                  onClick={() => showModal("systemRestartModal")}
                  className="px-5 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
                >
                  <FontAwesomeIcon icon={faRedo} className="mr-2" />
                  Restart System
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md mb-8">
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <FontAwesomeIcon icon={faTasks} className="mr-2" />
                  System Tasks
                </h3>
                <FontAwesomeIcon icon={faListCheck} className="text-blue-600" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {systemTasks.map((task, index) => (
                  <button
                    key={index}
                    onClick={task.action}
                    className="p-4 bg-white border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                  >
                    <FontAwesomeIcon
                      icon={task.icon}
                      className="text-2xl mb-3"
                    />
                    <span className="font-semibold text-center">
                      {task.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <FontAwesomeIcon icon={faHistory} className="mr-2" />
                  System Logs
                </h3>
                <FontAwesomeIcon icon={faTerminal} className="text-blue-600" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                    <span>Error Logs</span>
                  </div>
                  <div className="font-semibold text-sm">12 errors</div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                    <span>Warning Logs</span>
                  </div>
                  <div className="font-semibold text-sm">45 warnings</div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                    <span>API Logs</span>
                  </div>
                  <div className="font-semibold text-sm">8,942 requests</div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                    <span>Backup Logs</span>
                  </div>
                  <div className="font-semibold text-sm">Last: 2h ago</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security & Audit Page */}
        {currentPage === "security" && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0 flex items-center">
                <FontAwesomeIcon icon={faShieldAlt} className="mr-3" />
                Security & Audit
              </h2>
              <div className="flex gap-4">
                <button
                  onClick={rotateApiKeys}
                  className="px-5 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                >
                  <FontAwesomeIcon icon={faKey} className="mr-2" />
                  Rotate API Keys
                </button>
                <button
                  onClick={() => showModal("forceLogoutModal")}
                  className="px-5 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                  Force Logout All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-6 pb-4 border-b">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <FontAwesomeIcon icon={faUserShield} className="mr-2" />
                    Security Status
                  </h3>
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-blue-600"
                  />
                </div>
                <div className="space-y-4">
                  {securityStatus.map((status, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2"
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-3 h-3 rounded-full mr-3 ${
                            status.indicator === "online"
                              ? "bg-green-500"
                              : "bg-yellow-500"
                          }`}
                        ></div>
                        <span>{status.label}</span>
                      </div>
                      <div className="font-semibold text-sm">
                        {status.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-6 pb-4 border-b">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <FontAwesomeIcon icon={faClipboardList} className="mr-2" />
                    Audit Summary
                  </h3>
                  <FontAwesomeIcon
                    icon={faChartPie}
                    className="text-blue-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {auditSummary.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-4 rounded-lg flex flex-col items-center justify-center"
                    >
                      <div className="text-2xl font-bold text-gray-900">
                        {item.value}
                      </div>
                      <span className="font-semibold text-sm text-gray-600 text-center">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-blue-600 text-white p-5 flex flex-col md:flex-row justify-between items-start md:items-center">
                <h3 className="text-lg font-semibold mb-4 md:mb-0">
                  Recent Audit Logs
                </h3>
                <input
                  type="text"
                  placeholder="Search audit logs..."
                  className="px-4 py-2 rounded-lg text-gray-800 min-w-64"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-4 text-left font-semibold text-gray-900">
                        Timestamp
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-900">
                        User
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-900">
                        Action
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-900">
                        IP Address
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-900">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-blue-50 border-b">
                      <td className="p-4">2024-03-15 14:23:12</td>
                      <td className="p-4 font-medium">Super Admin</td>
                      <td className="p-4">User Impersonation</td>
                      <td className="p-4">192.168.1.100</td>
                      <td className="p-4">Impersonated user #6291</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Data Control Page */}
        {currentPage === "data-control" && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0 flex items-center">
                <FontAwesomeIcon icon={faDatabase} className="mr-3" />
                Data Control
              </h2>
              <div className="flex gap-4">
                <button
                  onClick={() => showModal("importDataModal")}
                  className="px-5 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                >
                  <FontAwesomeIcon icon={faDownload} className="mr-2" />
                  Import Data
                </button>
                <button
                  onClick={() => showModal("exportDataModal")}
                  className="px-5 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                >
                  <FontAwesomeIcon icon={faUpload} className="mr-2" />
                  Export Data
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-6 pb-4 border-b">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <FontAwesomeIcon icon={faUpload} className="mr-2" />
                    Import Data
                  </h3>
                  <FontAwesomeIcon
                    icon={faCloudUploadAlt}
                    className="text-blue-600"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {importActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => showModal(action.modal)}
                      className="p-4 bg-white border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                    >
                      <FontAwesomeIcon
                        icon={action.icon}
                        className="text-2xl mb-3"
                      />
                      <span className="font-semibold text-center">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-6 pb-4 border-b">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <FontAwesomeIcon icon={faDownload} className="mr-2" />
                    Export Data
                  </h3>
                  <FontAwesomeIcon
                    icon={faCloudDownloadAlt}
                    className="text-blue-600"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {exportActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      className="p-4 bg-white border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                    >
                      <FontAwesomeIcon
                        icon={action.icon}
                        className="text-2xl mb-3"
                      />
                      <span className="font-semibold text-center">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <FontAwesomeIcon icon={faServer} className="mr-2" />
                  Database Information
                </h3>
                <FontAwesomeIcon
                  icon={faInfoCircle}
                  className="text-blue-600"
                />
              </div>
              <div className="space-y-4">
                {databaseInfo.map((info, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2"
                  >
                    <div className="flex items-center">
                      <FontAwesomeIcon
                        icon={info.icon}
                        className="text-gray-500 mr-3"
                      />
                      <span>{info.label}</span>
                    </div>
                    <div className="font-semibold text-sm">{info.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {activeModal === "impersonateModal" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            ref={modalRef}
            className="bg-white rounded-xl shadow-xl max-w-md w-full"
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <FontAwesomeIcon icon={faUserSecret} className="mr-3" />
                Impersonate User
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>
            <div className="p-6">
              <p className="mb-4">
                Enter the User ID or email of the user you want to impersonate:
              </p>
              <input
                type="text"
                id="userIdInput"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
                placeholder="User ID or email"
              />
              <p className="text-yellow-600 text-sm">
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="mr-2"
                />
                <strong>Warning:</strong> You will be logged in as this user
                with full access to their account. All your actions will be
                recorded in the audit log.
              </p>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button
                onClick={closeModal}
                className="px-5 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={executeImpersonation}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
              >
                Impersonate User
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === "stopBookingsModal" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            ref={modalRef}
            className="bg-white rounded-xl shadow-xl max-w-md w-full"
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <FontAwesomeIcon icon={faBan} className="mr-3" />
                Stop All Bookings
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>
            <div className="p-6">
              <p className="mb-3">
                <strong>Warning:</strong> This action will immediately stop all
                booking functionality across the entire platform.
              </p>
              <p className="mb-3">
                Users will not be able to create new bookings, and vendors will
                not receive booking requests.
              </p>
              <p>Existing bookings will remain in their current state.</p>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button
                onClick={closeModal}
                className="px-5 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => executeOverride("stopBookings")}
                className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
              >
                Stop All Bookings
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === "createUserModal" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            ref={modalRef}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full"
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <FontAwesomeIcon icon={faUserPlus} className="mr-3" />
                Create New User
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block font-semibold text-gray-900 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-900 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter email"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-900 mb-2">
                    User Type
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    <option>Customer</option>
                    <option>Vendor</option>
                    <option>Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-900 mb-2">
                    Status
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    <option>Active</option>
                    <option>Pending</option>
                    <option>Suspended</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button
                onClick={closeModal}
                className="px-5 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={createUser}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === "exportDataModal" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            ref={modalRef}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full"
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <FontAwesomeIcon icon={faDownload} className="mr-3" />
                Export Data
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>
            <div className="p-6">
              <p className="mb-4">Select what data you want to export:</p>
              <div className="space-y-3 mb-6">
                {[
                  "Users Data (1,847 records)",
                  "Vendors Data (324 records)",
                  "Listings Data (1,209 records)",
                  "Booking History (12,847 records)",
                  "Messages (45,291 records)",
                  "Audit Logs (89,472 records)",
                ].map((item, index) => (
                  <label key={index} className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked={index < 3}
                      className="mr-3"
                    />
                    {item}
                  </label>
                ))}
              </div>
              <div>
                <label className="block font-semibold text-gray-900 mb-2">
                  Export Format
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option>CSV</option>
                  <option>JSON</option>
                  <option>Excel (XLSX)</option>
                  <option>SQL Dump</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button
                onClick={closeModal}
                className="px-5 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={exportData}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
              >
                Export Data
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === "logoutModal" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            ref={modalRef}
            className="bg-white rounded-xl shadow-xl max-w-md w-full"
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <FontAwesomeIcon icon={faSignOutAlt} className="mr-3" />
                Confirm Logout
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>
            <div className="p-6">
              <p className="mb-3">
                Are you sure you want to logout from the Super Admin dashboard?
              </p>
              <p>You will need to login again to access the system.</p>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button
                onClick={closeModal}
                className="px-5 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={logout}
                className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
              >
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
