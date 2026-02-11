import {
  faCalendarCheck,
  faChevronLeft,
  faChevronRight,
  faCogs,
  faComments,
  faCrown,
  faDatabase,
  faListAlt,
  faRobot,
  faShieldAlt,
  faSignOutAlt,
  faStar,
  faStore,
  faSyncAlt,
  faTachometerAlt,
  faUserShield,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { FaBars } from "react-icons/fa";
import { Outlet, useLocation, useNavigate } from "react-router";
import { tokenStorage } from "../../lib/axios";

const navItems = [
  { id: "dashboard", icon: faTachometerAlt, label: "Dashboard", path: "/admincpanel" },
  { id: "users", icon: faUsers, label: "User Management", path: "/admincpanel/users" },
  { id: "vendors", icon: faStore, label: "Vendor Control", path: "/admincpanel/vendors" },
  { id: "listings", icon: faListAlt, label: "Listings", path: "/admincpanel/listings" },
  { id: "bookings", icon: faCalendarCheck, label: "Booking Requests", path: "/admincpanel/bookings" },
  { id: "messages", icon: faComments, label: "Messages", path: "/admincpanel/messages" },
  { id: "reviews", icon: faStar, label: "Reviews & Moderation", path: "/admincpanel/reviews" },
  { id: "ai-control", icon: faRobot, label: "AI & Chatbot Control", path: "/admincpanel/ai-control" },
  { id: "system-control", icon: faCogs, label: "System Control", path: "/admincpanel/system-control" },
  { id: "security", icon: faShieldAlt, label: "Security & Audit", path: "/admincpanel/security" },
  { id: "automation", icon: faSyncAlt, label: "Automation (n8n)", path: "/admincpanel/automation" },
  { id: "data-control", icon: faDatabase, label: "Data Control", path: "/admincpanel/data-control" },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const showModal = (modalId) => {
    setActiveModal(modalId);
  };

  const navigateToPage = (page) => {
    setCurrentPage(page);
    if (isMobile) {
      setShowMobileMenu(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 bg-blue-900 text-white p-4 flex justify-between items-center z-50 shadow-lg">
          <div className="flex items-center">
            <button onClick={toggleMobileMenu} className="mr-4">
              <FaBars className="text-xl" />
            </button>
            <h1 className="text-xl font-bold">AJANI</h1>
          </div>
          <div className="flex items-center">
            <div className="bg-blue-800 px-3 py-1 rounded-lg mr-3">
              <span className="text-xs font-semibold">ADMIN</span>
            </div>
            <button
              onClick={() => showModal("logoutModal")}
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

      {isMobile && showMobileMenu && (
        <div className="fixed left-0 top-0 h-full bg-blue-900 text-white w-64 z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out">
          <div className="flex items-center justify-between p-6 pb-8 border-b border-blue-800">
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faCrown}
                className="text-yellow-400 text-2xl mr-3"
              />
              <h1 className="text-xl font-bold">AJANI</h1>
            </div>
            <button
              onClick={toggleMobileMenu}
              className="text-2xl hover:text-yellow-400 transition-colors"
            >
              &times;
            </button>
          </div>

          <div className="bg-blue-800 p-4 mx-6 mt-6 rounded-lg flex items-center">
            <FontAwesomeIcon
              icon={faUserShield}
              className="text-yellow-400 mr-3"
            />
            <span className="font-semibold text-sm">SUPER ADMIN</span>
          </div>

          <div className="flex-1 mt-6 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`flex items-center w-full p-4 transition-all ${pathname === item.path ? "bg-blue-800 border-l-4 border-yellow-400" : "border-l-4 border-transparent hover:bg-blue-800"}`}
              >
                <FontAwesomeIcon
                  icon={item.icon}
                  className="text-lg min-w-6 mr-4"
                />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="p-6">
            <button
              onClick={() => {
                showModal("logoutModal");
                toggleMobileMenu();
                tokenStorage.remove();
              }}
              className="bg-blue-800 w-full p-3 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-all"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {!isMobile && (
        <div
          className={`${sidebarCollapsed ? "w-20" : "w-64"} bg-blue-900 text-white flex flex-col fixed h-screen overflow-y-auto transition-all duration-300 z-50`}
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
                onClick={() => navigate(item.path)}
                className={`flex items-center w-full p-4 transition-all ${pathname === item.path ? "bg-blue-800 border-l-4 border-yellow-400" : "border-l-4 border-transparent hover:bg-blue-800"}`}
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
      )}

      {!isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed bottom-6 left-6 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg z-40"
        >
          <FontAwesomeIcon
            icon={sidebarCollapsed ? faChevronRight : faChevronLeft}
          />
        </button>
      )}

      <div
        className={`flex-1 ${!isMobile ? (sidebarCollapsed ? "ml-20" : "ml-64") : ""} p-4 md:p-8 transition-all duration-300 ${isMobile ? "mt-16" : ""}`}
      >
        {/* {currentPage === "dashboard" && (
             <div>
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 pb-4 md:pb-6 border-b">
                 <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-0">
                   Super Admin Dashboard
                 </h2>
                 <div className="flex flex-wrap gap-2 md:gap-4 w-full md:w-auto">
                   <button
                     onClick={() => showModal("impersonateModal")}
                     className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all text-sm md:text-base flex-1 md:flex-none"
                   >
                     <FontAwesomeIcon icon={faUserSecret} className="mr-2" />
                     <span className="hidden sm:inline">Impersonate User</span>
                     <span className="sm:hidden">Impersonate</span>
                   </button>
                   <button
                     onClick={() => {
                       if (
                         confirm(
                           "Toggle maintenance mode? This will show a maintenance page to all users.",
                         )
                       ) {
                         alert("Maintenance mode toggled");
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
   
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                 {statsCards.map((stat, index) => (
                   <div
                     key={index}
                     onClick={() => navigateToPage(stat.page)}
                     className="bg-white p-4 md:p-6 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
                   >
                     <div className="flex justify-between items-start mb-3 md:mb-4">
                       <div>
                         <div className="text-xs md:text-sm text-gray-500 uppercase font-semibold tracking-wide">
                           {stat.title}
                         </div>
                         <div className="text-2xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">
                           {stat.value}
                         </div>
                         <div
                           className={`text-xs md:text-sm font-medium ${stat.positive ? "text-green-600" : "text-gray-600"}`}
                         >
                           {stat.change}
                         </div>
                       </div>
                       <div className="w-10 h-10 md:w-14 md:h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                         <FontAwesomeIcon
                           icon={stat.icon}
                           className="text-lg md:text-2xl"
                         />
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
   
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                 <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
                   <div className="flex justify-between items-center mb-4 md:mb-6 pb-3 md:pb-4 border-b">
                     <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center">
                       <FontAwesomeIcon icon={faToggleOn} className="mr-2" />
                       Feature Toggles
                     </h3>
                     <FontAwesomeIcon
                       icon={faSlidersH}
                       className="text-blue-600 text-sm md:text-base"
                     />
                   </div>
                   <div className="space-y-3 md:space-y-4">
                     {Object.entries(featureToggles).map(([key, value]) => (
                       <div
                         key={key}
                         className="flex justify-between items-center py-2 md:py-3 border-b last:border-b-0"
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
                             className="text-gray-500 mr-2 md:mr-3 text-sm md:text-base"
                           />
                           <span className="text-sm md:text-base">
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
                           <div className="w-10 h-5 md:w-12 md:h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-600 transition-all"></div>
                           <div
                             className={`absolute left-0.5 md:left-1 top-0.5 md:top-1 w-4 h-4 bg-white rounded-full transition-all ${value ? "translate-x-5 md:translate-x-6" : ""}`}
                           ></div>
                         </label>
                       </div>
                     ))}
                   </div>
                 </div>
   
                 <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
                   <div className="flex justify-between items-center mb-4 md:mb-6 pb-3 md:pb-4 border-b">
                     <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center">
                       <FontAwesomeIcon icon={faHistory} className="mr-2" />
                       Recent Admin Activity
                     </h3>
                     <FontAwesomeIcon
                       icon={faClock}
                       className="text-blue-600 text-sm md:text-base"
                     />
                   </div>
                   <div className="space-y-3 md:space-y-4 max-h-64 md:max-h-80 overflow-y-auto">
                     {recentActivities.map((activity, index) => (
                       <div
                         key={index}
                         className="flex items-start py-2 md:py-3 border-b last:border-b-0"
                       >
                         <div
                           className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mr-3 md:mr-4 ${
                             activity.type === "system"
                               ? "bg-orange-100 text-orange-600"
                               : activity.type === "user"
                                 ? "bg-blue-100 text-blue-600"
                                 : "bg-green-100 text-green-600"
                           }`}
                         >
                           <FontAwesomeIcon
                             icon={activity.icon}
                             className="text-sm md:text-base"
                           />
                         </div>
                         <div className="flex-1 min-w-0">
                           <h4 className="font-semibold text-xs md:text-sm truncate">
                             {activity.title}
                           </h4>
                           <p className="text-xs md:text-sm text-gray-600 mt-1 truncate">
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
   
               <div className="bg-white p-4 md:p-6 rounded-xl shadow-md mb-6 md:mb-8">
                 <div className="flex justify-between items-center mb-4 md:mb-6 pb-3 md:pb-4 border-b">
                   <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center">
                     <FontAwesomeIcon icon={faGavel} className="mr-2" />
                     Immediate Override Actions
                   </h3>
                   <FontAwesomeIcon
                     icon={faExclamationTriangle}
                     className="text-red-600 text-sm md:text-base"
                   />
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                   {overrideActions.map((action, index) => (
                     <button
                       key={index}
                       onClick={() => showModal(action.modal)}
                       className={`p-3 md:p-4 bg-white border-2 rounded-lg flex flex-col items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all ${action.danger ? "border-red-300 hover:bg-red-600 hover:border-red-600" : "border-gray-300"} text-sm md:text-base`}
                     >
                       <FontAwesomeIcon
                         icon={action.icon}
                         className="text-xl md:text-2xl mb-2 md:mb-3"
                       />
                       <span className="font-semibold text-center">
                         {action.label}
                       </span>
                     </button>
                   ))}
                 </div>
               </div>
   
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                 <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
                   <div className="flex justify-between items-center mb-4 md:mb-6 pb-3 md:pb-4 border-b">
                     <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center">
                       <FontAwesomeIcon icon={faServer} className="mr-2" />
                       System Status
                     </h3>
                     <FontAwesomeIcon
                       icon={faInfoCircle}
                       className="text-blue-600 text-sm md:text-base"
                     />
                   </div>
                   <div className="space-y-3 md:space-y-4">
                     {systemStatusItems.map((item, index) => (
                       <div
                         key={index}
                         className="flex justify-between items-center py-1 md:py-2 border-b last:border-b-0"
                       >
                         <div className="flex items-center">
                           <div
                             className={`w-2 h-2 md:w-3 md:h-3 rounded-full mr-2 md:mr-3 ${item.indicator === "online" ? "bg-green-500" : "bg-yellow-500"}`}
                           ></div>
                           <span className="text-sm md:text-base">
                             {item.label}
                           </span>
                         </div>
                         <div className="font-semibold text-xs md:text-sm">
                           {item.value}
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
   
                 <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
                   <div className="flex justify-between items-center mb-4 md:mb-6 pb-3 md:pb-4 border-b">
                     <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center">
                       <FontAwesomeIcon icon={faBolt} className="mr-2" />
                       Quick Actions
                     </h3>
                     <FontAwesomeIcon
                       icon={faRocket}
                       className="text-blue-600 text-sm md:text-base"
                     />
                   </div>
                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                     {quickActions.map((action, index) => (
                       <button
                         key={index}
                         onClick={() =>
                           action.page
                             ? navigateToPage(action.page)
                             : showModal(action.modal)
                         }
                         className="p-3 md:p-4 bg-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center justify-center"
                       >
                         <FontAwesomeIcon
                           icon={action.icon}
                           className="text-xl md:text-2xl text-blue-600 mb-1 md:mb-2"
                         />
                         <span className="font-semibold text-xs md:text-sm text-center">
                           {action.label}
                         </span>
                       </button>
                     ))}
                   </div>
                 </div>
               </div>
             </div>
           )}
   
           {currentPage === "users" && (
             <div>
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 pb-4 md:pb-6 border-b">
                 <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-0 flex items-center">
                   <FontAwesomeIcon icon={faUsers} className="mr-3" />
                   User Management
                 </h2>
                 <div className="flex flex-wrap gap-2 md:gap-4 w-full md:w-auto">
                   <button
                     onClick={() => showModal("createUserModal")}
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
                   <h3 className="text-base md:text-lg font-semibold">
                     All Users (0)
                   </h3>
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
                         <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm">
                           ID
                         </th>
                         <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm">
                           Name
                         </th>
                         <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm hidden md:table-cell">
                           Email
                         </th>
                         <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm">
                           Type
                         </th>
                         <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm">
                           Status
                         </th>
                         <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm hidden sm:table-cell">
                           Joined
                         </th>
                         <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm">
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
                           <td className="p-3 md:p-4 text-xs md:text-sm">
                             #{user.id}
                           </td>
                           <td className="p-3 md:p-4 font-medium text-xs md:text-sm">
                             {user.name}
                           </td>
                           <td className="p-3 md:p-4 text-gray-600 text-xs md:text-sm hidden md:table-cell">
                             {user.email}
                           </td>
                           <td className="p-3 md:p-4 text-xs md:text-sm">
                             {user.type}
                           </td>
                           <td className="p-3 md:p-4">
                             <span
                               className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs font-semibold ${
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
                           <td className="p-3 md:p-4 text-xs md:text-sm hidden sm:table-cell">
                             {user.joined}
                           </td>
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
                   <FontAwesomeIcon
                     icon={faUsers}
                     className="text-blue-600 text-sm md:text-base"
                   />
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                   <button className="p-3 md:p-4 bg-white border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
                     <FontAwesomeIcon
                       icon={faKey}
                       className="text-xl md:text-2xl mb-2 md:mb-3"
                     />
                     <span className="font-semibold text-center text-xs md:text-sm">
                       Reset Passwords
                     </span>
                   </button>
                   <button className="p-3 md:p-4 bg-white border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
                     <FontAwesomeIcon
                       icon={faUserSlashSolid}
                       className="text-xl md:text-2xl mb-2 md:mb-3"
                     />
                     <span className="font-semibold text-center text-xs md:text-sm">
                       Suspend Users
                     </span>
                   </button>
                   <button className="p-3 md:p-4 bg-white border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
                     <FontAwesomeIcon
                       icon={faDownload}
                       className="text-xl md:text-2xl mb-2 md:mb-3"
                     />
                     <span className="font-semibold text-center text-xs md:text-sm">
                       Export All Data
                     </span>
                   </button>
                   <button className="p-3 md:p-4 bg-white border-2 border-red-300 rounded-lg flex flex-col items-center justify-center hover:bg-red-600 hover:text-white hover:border-red-600 transition-all">
                     <FontAwesomeIcon
                       icon={faTrash}
                       className="text-xl md:text-2xl mb-2 md:mb-3"
                     />
                     <span className="font-semibold text-center text-xs md:text-sm">
                       Delete Users
                     </span>
                   </button>
                 </div>
               </div>
             </div>
           )}
   
           {currentPage === "vendors" && (
             <div>
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 pb-4 md:pb-6 border-b">
                 <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-0 flex items-center">
                   <FontAwesomeIcon icon={faStore} className="mr-3" />
                   Vendor Control
                 </h2>
                 <div className="flex flex-wrap gap-2 md:gap-4 w-full md:w-auto">
                   <button
                     onClick={() => showModal("createVendorModal")}
                     className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all text-sm md:text-base flex-1 md:flex-none"
                   >
                     <FontAwesomeIcon icon={faStore} className="mr-2" />
                     Create Vendor
                   </button>
                   <button
                     onClick={() => showModal("suspendAllVendorsModal")}
                     className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center justify-center hover:bg-red-600 hover:text-white hover:border-red-600 transition-all text-sm md:text-base flex-1 md:flex-none"
                   >
                     <FontAwesomeIcon icon={faBan} className="mr-2" />
                     Suspend All
                   </button>
                 </div>
               </div>
   
               <div className="bg-white rounded-xl shadow-md overflow-hidden">
                 <div className="bg-blue-600 text-white p-4 md:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0">
                   <h3 className="text-base md:text-lg font-semibold">
                     All Vendors (0)
                   </h3>
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
                         <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm">
                           ID
                         </th>
                         <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm">
                           Vendor Name
                         </th>
                         <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm hidden sm:table-cell">
                           Owner
                         </th>
                         <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm">
                           Category
                         </th>
                         <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm hidden md:table-cell">
                           Listings
                         </th>
                         <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm">
                           Status
                         </th>
                         <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm">
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
                           <td className="p-3 md:p-4 text-xs md:text-sm">
                             {vendor.id}
                           </td>
                           <td className="p-3 md:p-4 font-medium text-xs md:text-sm">
                             {vendor.name}
                           </td>
                           <td className="p-3 md:p-4 text-xs md:text-sm hidden sm:table-cell">
                             {vendor.owner}
                           </td>
                           <td className="p-3 md:p-4 text-xs md:text-sm">
                             {vendor.category}
                           </td>
                           <td className="p-3 md:p-4 text-xs md:text-sm hidden md:table-cell">
                             {vendor.listings}
                           </td>
                           <td className="p-3 md:p-4">
                             <span
                               className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs font-semibold ${
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
           )} */}
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
