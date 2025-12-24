import {
  Users,
  Store,
  ListChecks,
  MessageSquare,
  DollarSign,
  TrendingUp,
} from "lucide-react";

import listingVilla from "../../assets/Logos/hotel.jpg";
import listingLoft from "../../assets/Logos/hotel.jpg";
import listingPhotography from "../../assets/Logos/hotel.jpg";
import listingCabin from "../../assets/Logos/hotel.jpg";
import listingChef from "../../assets/Logos/hotel.jpg";
import listingBungalow from "../../assets/Logos/hotel.jpg";

export const mockListings = [
  {
    id: "1",
    title: "Oceanfront Villa with Private Pool",
    description:
      "Experience luxury living in this stunning oceanfront villa featuring panoramic views, a private infinity pool, and direct beach access. Perfect for families or groups seeking a serene getaway.",
    price: 450,
    priceUnit: "night",
    category: "property",
    location: "Malibu, California",
    rating: 4.9,
    reviewCount: 128,
    images: [listingVilla],
    amenities: [
      "Pool",
      "WiFi",
      "Kitchen",
      "Beach Access",
      "Parking",
      "Air Conditioning",
    ],
    vendorId: "v1",
    vendorName: "Coastal Retreats",
    featured: true,
  },
  {
    id: "2",
    title: "Modern Downtown Loft",
    description:
      "Sleek and stylish loft in the heart of downtown. Walking distance to restaurants, galleries, and nightlife. Features floor-to-ceiling windows with city views.",
    price: 185,
    priceUnit: "night",
    category: "property",
    location: "Austin, Texas",
    rating: 4.7,
    reviewCount: 89,
    images: [listingLoft],
    amenities: ["WiFi", "Kitchen", "Gym Access", "Rooftop Terrace"],
    vendorId: "v2",
    vendorName: "Urban Stays",
    featured: true,
  },
  {
    id: "3",
    title: "Professional Photography Session",
    description:
      "Capture your special moments with a professional photographer. Includes 2-hour session, location of your choice, and 50 edited digital photos.",
    price: 299,
    priceUnit: "session",
    category: "service",
    location: "Los Angeles, California",
    rating: 5.0,
    reviewCount: 64,
    images: [listingPhotography],
    amenities: [
      "Professional Equipment",
      "Edited Photos",
      "Multiple Locations",
      "Same-day Preview",
    ],
    vendorId: "v3",
    vendorName: "Studio Moments",
    featured: true,
  },
  {
    id: "4",
    title: "Mountain Cabin Retreat",
    description:
      "Cozy cabin nestled in the mountains. Perfect for skiing in winter or hiking in summer. Features a hot tub, fireplace, and stunning mountain views.",
    price: 225,
    priceUnit: "night",
    category: "property",
    location: "Aspen, Colorado",
    rating: 4.8,
    reviewCount: 156,
    images: [listingCabin],
    amenities: [
      "Hot Tub",
      "Fireplace",
      "WiFi",
      "Mountain Views",
      "Ski Storage",
    ],
    vendorId: "v1",
    vendorName: "Coastal Retreats",
    featured: false,
  },
  {
    id: "5",
    title: "Personal Chef Experience",
    description:
      "Enjoy a gourmet meal prepared in your home by a professional chef. Includes menu consultation, grocery shopping, cooking, and cleanup.",
    price: 175,
    priceUnit: "hour",
    category: "service",
    location: "San Francisco, California",
    rating: 4.9,
    reviewCount: 42,
    images: [listingChef],
    amenities: [
      "Custom Menu",
      "All Ingredients Included",
      "Wine Pairing Available",
      "Dietary Accommodations",
    ],
    vendorId: "v4",
    vendorName: "Culinary Arts Co.",
    featured: true,
  },
  {
    id: "6",
    title: "Beachfront Bungalow",
    description:
      "Charming bungalow steps from the sand. Enjoy stunning sunsets from your private deck. Fully equipped kitchen and outdoor BBQ area.",
    price: 320,
    priceUnit: "night",
    category: "property",
    location: "San Diego, California",
    rating: 4.6,
    reviewCount: 203,
    images: [listingBungalow],
    amenities: ["Beach Access", "WiFi", "Kitchen", "BBQ", "Pet Friendly"],
    vendorId: "v2",
    vendorName: "Urban Stays",
    featured: false,
  },
];

export const mockBookings = [
  {
    id: "b1",
    listingId: "1",
    listingTitle: "Oceanfront Villa with Private Pool",
    userId: "u1",
    userName: "John Smith",
    userEmail: "john@example.com",
    startDate: "2024-02-15",
    endDate: "2024-02-20",
    status: "confirmed",
    totalPrice: 2250,
    createdAt: "2024-01-20",
  },
  {
    id: "b2",
    listingId: "3",
    listingTitle: "Professional Photography Session",
    userId: "u2",
    userName: "Sarah Johnson",
    userEmail: "sarah@example.com",
    startDate: "2024-02-10",
    endDate: "2024-02-10",
    status: "pending",
    totalPrice: 299,
    createdAt: "2024-01-25",
  },
  {
    id: "b3",
    listingId: "2",
    listingTitle: "Modern Downtown Loft",
    userId: "u3",
    userName: "Mike Wilson",
    userEmail: "mike@example.com",
    startDate: "2024-03-01",
    endDate: "2024-03-05",
    status: "confirmed",
    totalPrice: 740,
    createdAt: "2024-01-28",
  },
];

export const mockUsers = [
  {
    id: "u1",
    name: "John Smith",
    email: "john@example.com",
    role: "user",
    createdAt: "2023-06-15",
  },
  {
    id: "u2",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    role: "user",
    createdAt: "2023-08-22",
  },
  {
    id: "u3",
    name: "Mike Wilson",
    email: "mike@example.com",
    role: "user",
    createdAt: "2023-09-10",
  },
  {
    id: "v1",
    name: "Coastal Retreats",
    email: "contact@coastalretreats.com",
    role: "vendor",
    createdAt: "2023-01-05",
  },
  {
    id: "v2",
    name: "Urban Stays",
    email: "hello@urbanstays.com",
    role: "vendor",
    createdAt: "2023-02-18",
  },
];

export const mockReviews = [
  {
    id: "r1",
    listingId: "1",
    listingTitle: "Oceanfront Villa with Private Pool",
    userId: "u1",
    userName: "John Smith",
    rating: 5,
    comment:
      "Absolutely stunning property! The views were incredible and the pool was perfect. Can't wait to come back.",
    createdAt: "2024-01-10",
  },
  {
    id: "r2",
    listingId: "2",
    listingTitle: "Modern Downtown Loft",
    userId: "u2",
    userName: "Sarah Johnson",
    rating: 4,
    comment:
      "Great location and beautiful space. Very clean and well-maintained. The host was responsive and helpful.",
    createdAt: "2024-01-15",
  },
  {
    id: "r3",
    listingId: "3",
    listingTitle: "Professional Photography Session",
    userId: "u3",
    userName: "Mike Wilson",
    rating: 5,
    comment:
      "Amazing experience! The photographer was professional and creative. The photos exceeded our expectations.",
    createdAt: "2024-01-20",
  },
];

const Overview = () => {
  const totalRevenue = mockBookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const userCount = mockUsers.filter((u) => u.role === "user").length;
  const vendorCount = mockUsers.filter((u) => u.role === "vendor").length;

  const stats = [
    {
      title: "Total Users",
      value: userCount,
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Total Vendors",
      value: vendorCount,
      icon: Store,
      color: "text-green-500",
    },
    {
      title: "Total Listings",
      value: mockListings.length,
      icon: ListChecks,
      color: "text-purple-500",
    },
    {
      title: "Total Reviews",
      value: mockReviews.length,
      icon: MessageSquare,
      color: "text-orange-500",
    },
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-primary",
    },
    {
      title: "Active Bookings",
      value: mockBookings.length,
      icon: TrendingUp,
      color: "text-accent",
    },
  ];

  return (
    <>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Platform overview and management
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <div key={stat.title} className="shadow-card">
              <div className="flex flex-row items-center justify-between pb-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </h3>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <div className="text-3xl font-bold font-display">
                  {stat.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="shadow-card">
            <div>
              <h3 className="font-display">Recent Bookings</h3>
            </div>
            <div>
              <div className="space-y-4">
                {mockBookings.slice(0, 4).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {booking.listingTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {booking.userName}
                      </p>
                    </div>
                    <span className="font-semibold">${booking.totalPrice}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="shadow-card">
            <div>
              <h3 className="font-display">Recent Reviews</h3>
            </div>
            <div>
              <div className="space-y-4">
                {mockReviews.slice(0, 4).map((review) => (
                  <div
                    key={review.id}
                    className="p-3 rounded-lg bg-secondary/50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">{review.userName}</p>
                      <span className="text-sm">⭐ {review.rating}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Overview;
