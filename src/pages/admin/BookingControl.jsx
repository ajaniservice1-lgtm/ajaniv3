import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import {
  faCalendarCheck,
  faPlusCircle,
  faTimesCircle,
  faEdit,
  faEye,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";

export default function BookingControl() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["bookings"],
    queryFn: () =>
      axiosInstance.get("/bookings").then((res) => {
        console.log(res.data);
        return res.data;
      }),
  });
  const allBookings = data?.data || [];
  const pendingBookings = allBookings.filter((booking) => booking.status === "pending");
  const confirmedBookings = allBookings.filter((booking) => booking.status === "confirmed");
  const cancelledBookings = allBookings.filter((booking) => booking.status === "cancelled");
  const totalBookings = allBookings.length;

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 pb-4 md:pb-6 border-b">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-0 flex items-center">
          <FontAwesomeIcon icon={faCalendarCheck} className="mr-3" />
          Booking Requests
        </h2>
        <div className="flex flex-wrap gap-2 md:gap-4 w-full md:w-auto">
          <button
            // onClick={() => showModal("createBookingModal")}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all text-sm md:text-base flex-1 md:flex-none"
          >
            <FontAwesomeIcon icon={faPlusCircle} className="mr-2" />
            Create Booking
          </button>
          <button
            // onClick={() => showModal("cancelAllBookingsModal")}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium flex items-center justify-center hover:bg-red-600 hover:text-white hover:border-red-600 transition-all text-sm md:text-base flex-1 md:flex-none"
          >
            <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />
            Cancel All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-md flex flex-col items-center justify-center">
          <div className="text-xl md:text-3xl font-bold text-gray-900">{pendingBookings.length}</div>
          <span className="font-semibold text-gray-600 text-xs md:text-sm">
            Pending
          </span>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-md flex flex-col items-center justify-center">
          <div className="text-xl md:text-3xl font-bold text-gray-900">{confirmedBookings.length}</div>
          <span className="font-semibold text-gray-600 text-xs md:text-sm">
            Confirmed
          </span>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-md flex flex-col items-center justify-center">
          <div className="text-xl md:text-3xl font-bold text-gray-900">{cancelledBookings.length}</div>
          <span className="font-semibold text-gray-600 text-xs md:text-sm">
            Cancelled
          </span>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-md flex flex-col items-center justify-center">
          <div className="text-xl md:text-3xl font-bold text-gray-900">{totalBookings}</div>
          <span className="font-semibold text-gray-600 text-xs md:text-sm">
            Total This Month
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-blue-600 text-white p-4 md:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0">
          <h3 className="text-base md:text-lg font-semibold">
            Recent Booking Requests
          </h3>
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
                <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm">
                  ID
                </th>
                <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm">
                  User
                </th>
                <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm hidden sm:table-cell">
                  Vendor
                </th>
                <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm">
                  Service
                </th>
                <th className="p-3 md:p-4 text-left font-semibold text-gray-900 text-xs md:text-sm hidden md:table-cell">
                  Date
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
              {allBookings.map((booking, index) => (
                <tr
                  key={index}
                  className="hover:bg-blue-50 border-b last:border-b-0"
                >
                  <td className="p-3 md:p-4 text-xs md:text-sm">
                    {booking._id}
                  </td>
                  <td className="p-3 md:p-4 font-medium text-xs md:text-sm">
                    {booking.firstName + " " + booking.lastName}
                  </td>
                  <td className="p-3 md:p-4 text-xs md:text-sm hidden sm:table-cell">
                    {booking.vendor}
                  </td>
                  <td className="p-3 md:p-4 text-xs md:text-sm">
                    {booking.service}
                  </td>
                  <td className="p-3 md:p-4 text-xs md:text-sm hidden md:table-cell">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </td>
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
  );
}
