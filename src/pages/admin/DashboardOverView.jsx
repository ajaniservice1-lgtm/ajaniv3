import {
  faBolt,
  faGavel,
  faInfoCircle,
  faPowerOff,
  faRocket,
  faServer,
  faUserSecret,
  faUser,
  faProjectDiagram,
  faDollarSign,
  faExclamationCircle,
  faTicketAlt,
  faToggleOn,
  faSlidersH,
  faCalendarCheck,
  faComments,
  faStar,
  faRobot,
  faHistory,
  faClock,
  faCog,
  faUserEdit,
  faStoreSlash,
  faExclamationTriangle,
  faBan,
  faCommentSlash,
  faSignOutAlt,
  faSkullCrossbones,
  faUserPlus,
  faStore,
  faPlusSquare,
  faEdit,
  faScroll,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";

const statsCards = [
  {
    title: "Total Users",
    value: "1,234",
    change: "+12% from last month",
    positive: true,
    icon: faUser,
  },
  {
    title: "Active Projects",
    value: "45",
    change: "+5% from last month",
    positive: true,
    icon: faProjectDiagram,
  },
  {
    title: "Total Revenue",
    value: "$12,345",
    change: "+8% from last month",
    positive: true,
    icon: faDollarSign,
  },
  {
    title: "Pending Approvals",
    value: "12",
    change: "-3 from last month",
    positive: false,
    icon: faExclamationCircle,
  },
  {
    title: "System Uptime",
    value: "99.9%",
    change: "Stable",
    positive: true,
    icon: faServer,
  },
  {
    title: "Support Tickets",
    value: "8",
    change: "+2 from last month",
    positive: false,
    icon: faTicketAlt,
  },
];

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

const quickActions = [
  { icon: faUserPlus, label: "Create User", page: "users" },
  { icon: faStore, label: "Create Vendor", page: "vendors" },
  { icon: faPlusSquare, label: "Create Listing", page: "listings" },
  { icon: faEdit, label: "Edit AI Prompt", page: "ai-control" },
  { icon: faScroll, label: "View Audit Logs", page: "security" },
  { icon: faDownload, label: "Export Data", modal: "exportDataModal" },
];

export default function DashboardOverView() {
  // const navigate = useNavigate();
  const [featureToggles] = useState({
    bookingSystem: true,
    messaging: true,
    reviews: true,
    chatbot: true,
    blogWidgets: false,
  });

  return (
    <>
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 pb-4 md:pb-6 border-b">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-0">
            Super Admin Dashboard
          </h2>
          <div className="flex flex-wrap gap-2 md:gap-4 w-full md:w-auto">
            <button
              // onClick={() => showModal("impersonateModal")}
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
                      // onChange={() => toggleFeature(key)}
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
                // onClick={() => showModal(action.modal)}
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
                    <span className="text-sm md:text-base">{item.label}</span>
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
                  // onClick={() =>
                  //   action.page
                  //     ? navigateToPage(action.page)
                  //     : showModal(action.modal)
                  // }
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
    </>
  );
}
