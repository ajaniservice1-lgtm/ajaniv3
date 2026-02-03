import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  CalendarCheck,
  Star,
  Settings,
  Search,
  Menu,
  Eye,
  Trash2,
  Mail,
  MessageSquare,
  User,
  Bell,
  Edit3,
  X,
  Save,
  Camera,
  ChevronDown,
  Check,
  LogOut,
  Award as AwardIcon,
  Heart as HeartIcon,
  MapPin as MapPinIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Users,
  DollarSign,
  Package,
  Building,
  Phone,
  FileText,
  CreditCard as CreditCardIcon,
  Shield,
  HelpCircle,
  Info,
  AlertTriangle,
  CheckCircle,
  PlusCircle,
  MinusCircle,
  Filter,
  Download,
  MoreHorizontal,
  ArrowLeft,
  ExternalLink,
  Copy,
  RefreshCw,
  Share2,
  BookOpen,
  Compass,
  Target,
  TrendingUp,
  Zap,
  Gift,
  Globe,
  LockKeyhole,
  Unlock,
  Headphones,
  Mic,
  Video,
  Send,
  Inbox,
  Archive,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  HeartCrack,
  Volume2,
  VolumeX,
  PhoneCall,
  PhoneOff,
  VideoOff,
  Bed,
  Utensils,
  Briefcase,
  Music,
  Camera as CameraIcon,
  Car,
  Plane,
  Ship,
  Bike,
  Wifi,
  Coffee,
  Dumbbell,
  Tv,
  Wind,
  Thermometer,
  Bath,
  Home as HomeIcon,
  CalendarDays,
  PartyPopper,
  Cake,
  Music2,
  Sparkles,
  Palette,
  Scissors,
  Droplets,
  Leaf,
  Cloud,
  Sun,
  Moon,
  Umbrella,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Percent,
  Gift as GiftIcon,
  Crown,
  Trophy,
  Medal,
  Flag,
  Map,
  Navigation,
  Compass as CompassIcon,
  Globe as GlobeIcon,
  MapPin,
  Navigation2,
  Route,
  Train,
  Bus,
  Taxi,
  Truck,
  Anchor,
  Sailboat,
  Bike as BikeIcon,
  Car as CarIcon,
  Plane as PlaneIcon,
  Ship as ShipIcon,
  Hotel,
  Restaurant,
  Coffee as CoffeeIcon,
  Wine,
  Beer,
  Pizza,
  Hamburger,
  Salad,
  Sandwich,
  Soup,
  Egg,
  Milk,
  Bread,
  Apple,
  Banana,
  Carrot,
  Fish,
  Drumstick,
  EggFried,
  Cookie,
  IceCream,
  CakeSlice,
  Candy,
  Coffee as CoffeeBean,
  ChefHat,
  CookingPot,
  Microwave,
  Refrigerator,
  Blender,
  Toaster,
  Knife,
  CookingPan,
  EggCracked,
  Salt,
  Pepper,
  Citrus,
  Grape,
  Cherry,
  Strawberry,
  Watermelon,
  Pineapple,
  Lemon,
  Coconut,
  Avocado,
  Broccoli,
  Corn,
  Pepper as PepperIcon,
  Mushroom,
  Onion,
  Garlic,
  Potato,
  Pumpkin,
  Eggplant,
  Tomato,
  Cucumber,
  Lettuce,
  Wheat,
  Rice,
  Noodles,
  Donut,
  Croissant,
  Baguette,
  Cheese,
  Bacon,
  Sausage,
  Steak,
  Chicken,
  Turkey,
  Crab,
  Shrimp,
  Octopus,
  Squid,
  Lobster,
  Oyster,
  Mussel,
  FishSimple,
  Snail,
  Bee,
  Honey,
  Cactus,
  TreePine,
  TreeDeciduous,
  Flower2,
  Rose,
  Tulip,
  Cactus as CactusIcon,
  Leaf as LeafIcon,
  Sprout,
  Tree,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Tornado,
  Hurricane,
  Earthquake,
  Volcano,
  Fire,
  Snowflake,
  Wind as WindIcon,
  ThermometerSun,
  ThermometerSnowflake,
  Droplet,
  Waves,
  Beach,
  Mountain,
  Forest,
  Castle,
  Church,
  Mosque,
  Synagogue,
  Temple,
  Monument,
  Tower,
  Bridge,
  Dam,
  Lighthouse,
  Windmill,
  Factory,
  Warehouse,
  Office,
  Bank,
  Hospital,
  School,
  University,
  Library,
  Museum,
  Theater,
  Cinema,
  Stadium,
  Pool,
  Gym,
  Spa,
  Pharmacy,
  Ambulance,
  Police,
  FireExtinguisher,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  ShieldPlus,
  ShieldMinus,
  ShieldQuestion,
  ShieldX,
  Shield as ShieldIcon,
  Lock,
  Unlock as UnlockIcon,
  Key,
  KeyRound,
  KeySquare,
  Fingerprint,
  EyeOff,
  QrCode,
  Barcode,
  Radio,
  Tv as TvIcon,
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Printer,
  Scanner,
  Keyboard,
  Mouse,
  Gamepad2,
  Headphones as HeadphonesIcon,
  Speaker,
  Microphone,
  Webcam,
  Router,
  Cpu,
  HardDrive,
  MemoryStick,
  SdCard,
  Usb,
  Plug,
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  BatteryWarning,
  Power,
  PowerOff,
  Wifi as WifiIcon,
  WifiOff,
  Bluetooth,
  BluetoothConnected,
  BluetoothOff,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  SignalZero,
  Satellite,
  SatelliteDish,
  Antenna,
  Radar,
  Broadcast,
  RadioTower,
  TvMinimal,
  TvMinimalPlay,
  Projector,
  Film,
  FilmStrip,
  Clapperboard,
  Video as VideoIcon,
  VideoOff as VideoOffIcon,
  CameraOff,
  Image,
  ImageOff,
  Images,
  PictureInPicture,
  PictureInPicture2,
  FilmStrip as FilmStripIcon,
  Clapperboard as ClapperboardIcon,
  Ticket,
  TicketCheck,
  TicketPercent,
  TicketPlus,
  TicketSlash,
  TicketStar,
  TicketX,
  Receipt,
  ReceiptCent,
  ReceiptEuro,
  ReceiptPound,
  ReceiptRussianRuble,
  ReceiptSwissFranc,
  ReceiptYen,
  ReceiptIndianRupee,
  ReceiptText,
  File,
  FileArchive,
  FileAudio,
  FileBox,
  FileCheck,
  FileCode,
  FileCog,
  FileDiff,
  FileDigit,
  FileDown,
  FileEdit,
  FileHeart,
  FileImage,
  FileInput,
  FileJson,
  FileKey,
  FileKey2,
  FileLock,
  FileMinus,
  FileMusic,
  FileOutput,
  FilePieChart,
  FilePlus,
  FileQuestion,
  FileScan,
  FileSearch,
  FileSliders,
  FileSpreadsheet,
  FileStack,
  FileSymlink,
  FileTerminal,
  FileText as FileTextIcon,
  FileType,
  FileUp,
  FileVideo,
  FileVolume,
  FileWarning,
  FileX,
  FileZip,
  Folder,
  FolderArchive,
  FolderCheck,
  FolderClock,
  FolderClosed,
  FolderCog,
  FolderDot,
  FolderDown,
  FolderEdit,
  FolderGit,
  FolderGit2,
  FolderHeart,
  FolderInput,
  FolderKanban,
  FolderKey,
  FolderLock,
  FolderMinus,
  FolderOpen,
  FolderOpenDot,
  FolderOutput,
  FolderPlus,
  FolderRoot,
  FolderSearch,
  FolderSymlink,
  FolderSync,
  FolderTree,
  FolderUp,
  FolderX,
  StickyNote,
  Bookmark,
  BookmarkCheck,
  BookmarkMinus,
  BookmarkPlus,
  BookmarkX,
  Notebook,
  NotebookPen,
  NotebookTabs,
  NotepadText,
  NotepadTextDashed,
  PanelLeft,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRight,
  PanelRightClose,
  PanelRightOpen,
  Scroll,
  ScrollText,
  Sheet,
  SheetPlus,
  SquareMenu,
  TextCursor,
  TextCursorInput,
  Type as TypeIcon,
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Code2,
  CodeXml,
  Columns2,
  Columns3,
  Columns4,
  Container,
  Database,
  DatabaseBackup,
  DatabaseZap,
  Divide,
  Equal,
  EqualNot,
  FunctionSquare,
  Infinity,
  Lambda,
  Minus,
  Parentheses,
  Percent as PercentIcon,
  Pi,
  Pilcrow,
  PilcrowSquare,
  Plus,
  PlusMinus,
  Radical,
  Sigma,
  Square,
  SquareAsterisk,
  SquareCode,
  SquareDashed,
  SquareDot,
  SquareEqual,
  SquareFunction,
  SquareKanban,
  SquareM,
  SquareMousePointer,
  SquareParking,
  SquarePen,
  SquarePi,
  SquarePilcrow,
  SquarePlay,
  SquarePlus,
  SquareSigma,
  SquareSlash,
  SquareSplitHorizontal,
  SquareSplitVertical,
  SquareStack,
  SquareTerminal,
  SquareUser,
  SquareUserRound,
  SquareX,
  Subscript,
  Superscript,
  Table,
  Table2,
  TableProperties,
  Text,
  TextQuote,
  TextSelect,
  ThumbsDown,
  ThumbsUp,
  Underline,
  Variable,
  WrapText,
  Omega,
  Alpha,
  Beta,
  Gamma,
  Delta,
  Epsilon,
  Zeta,
  Eta,
  Theta,
  Iota,
  Kappa,
  Lambda as LambdaIcon,
  Mu,
  Nu,
  Xi,
  Omicron,
  Pi as PiIcon,
  Rho,
  Sigma as SigmaIcon,
  Tau,
  Upsilon,
  Phi,
  Chi,
  Psi,
  Omega as OmegaIcon,
  Ampersand,
  Ampersands,
  Asterisk,
  AtSign,
  Backslash,
  CaretDown,
  CaretLeft,
  CaretRight,
  CaretUp,
  Circle,
  CircleAlert,
  CircleArrowDown,
  CircleArrowLeft,
  CircleArrowOutDownLeft,
  CircleArrowOutDownRight,
  CircleArrowOutUpLeft,
  CircleArrowOutUpRight,
  CircleArrowRight,
  CircleArrowUp,
  CircleCheck,
  CircleCheckBig,
  CircleChevronDown,
  CircleChevronLeft,
  CircleChevronRight,
  CircleChevronUp,
  CircleDashed,
  CircleDivide,
  CircleDollarSign,
  CircleDot,
  CircleDotDashed,
  CircleEllipsis,
  CircleEqual,
  CircleFadingPlus,
  CircleGauge,
  CircleHelp,
  CircleMinus,
  CircleOff,
  CircleParking,
  CirclePause,
  CirclePercent,
  CirclePlay,
  CirclePlus,
  CirclePower,
  CircleSlash,
  CircleSlash2,
  CircleStop,
  CircleUser,
  CircleUserRound,
  CircleX,
  Cross,
  Crosshair,
  Ellipsis,
  EllipsisVertical,
  EqualSquare,
  Hash,
  Hexagon,
  Infinity as InfinityIcon,
  Octagon,
  OctagonAlert,
  OctagonPause,
  OctagonX,
  Pentagon,
  PercentSquare,
  PilcrowLeft,
  PilcrowRight,
  PlusSquare,
  RectangleHorizontal,
  RectangleVertical,
  Slash,
  SlashSquare,
  SquareAsterisk as SquareAsteriskIcon,
  SquareBottomDashedScissors,
  SquareChartGantt,
  SquareChevronDown,
  SquareChevronLeft,
  SquareChevronRight,
  SquareChevronUp,
  SquareCode as SquareCodeIcon,
  SquareDashedBottom,
  SquareDashedBottomCode,
  SquareDashedKanban,
  SquareDashedMousePointer,
  SquareDivide,
  SquareDot as SquareDotIcon,
  SquareEqual as SquareEqualIcon,
  SquareGanttChart,
  SquareKanban as SquareKanbanIcon,
  SquareLibrary,
  SquareM as SquareMIcon,
  SquareMenu as SquareMenuIcon,
  SquareMinus,
  SquareMousePointer as SquareMousePointerIcon,
  SquareParking as SquareParkingIcon,
  SquarePen as SquarePenIcon,
  SquarePercent,
  SquarePi as SquarePiIcon,
  SquarePilcrow as SquarePilcrowIcon,
  SquarePlay as SquarePlayIcon,
  SquarePlus as SquarePlusIcon,
  SquareRadical,
  SquareSigma as SquareSigmaIcon,
  SquareSlash as SquareSlashIcon,
  SquareSplitHorizontal as SquareSplitHorizontalIcon,
  SquareSplitVertical as SquareSplitVerticalIcon,
  SquareStack as SquareStackIcon,
  SquareTerminal as SquareTerminalIcon,
  SquareUser as SquareUserIcon,
  SquareUserRound as SquareUserRoundIcon,
  SquareX as SquareXIcon,
  Triangle,
  TriangleAlert,
  TriangleRight,
  Waves as WavesIcon,
  Zap as ZapIcon
} from "lucide-react";
import Logo from "../assets/Logos/logo5.png";
import { motion, AnimatePresence } from "framer-motion";

// Helper function to format location
const formatLocation = (location) => {
  if (!location) return "Location available";
  
  if (typeof location === 'string') {
    return location;
  }
  
  if (typeof location === 'object') {
    const parts = [];
    if (location.address) parts.push(location.address);
    if (location.area) parts.push(location.area);
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    if (location.country) parts.push(location.country);
    
    if (parts.length > 0) {
      return parts.join(', ');
    }
    
    try {
      return Object.values(location)
        .filter(value => typeof value === 'string' && value.trim().length > 0)
        .join(', ');
    } catch {
      return "Location available";
    }
  }
  
  return String(location);
};

const BuyerProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
  });

  // Settings state
  const [profileData, setProfileData] = useState({
    name: "",
    username: "",
    email: "",
    city: "",
    bio: ""
  });
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    whatsapp: true,
    promotionalEmail: false,
    promotionalWhatsapp: false
  });
  const [profileImage, setProfileImage] = useState("");

  // Tab configuration for buyer profile
  const tabs = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "bookings", label: "My Bookings", icon: CalendarCheck },
    { id: "saved", label: "Saved", icon: HeartIcon },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  // Booking categories with icons
  const bookingCategories = [
    { id: "hotel", label: "Hotels", icon: Bed, color: "blue" },
    { id: "shortlet", label: "Shortlets", icon: HomeIcon, color: "purple" },
    { id: "restaurant", label: "Restaurants", icon: Utensils, color: "green" },
    { id: "event", label: "Events", icon: CalendarDays, color: "orange" },
    { id: "service", label: "Services", icon: Briefcase, color: "indigo" }
  ];

  useEffect(() => {
    fetchUserData();
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchUserData = () => {
    try {
      const token = localStorage.getItem("auth_token");
      const dummyLogin = localStorage.getItem("ajani_dummy_login");
      const storedProfile = localStorage.getItem("userProfile");

      if (!token && dummyLogin !== "true") {
        navigate("/login");
        return;
      }

      let profile;
      if (storedProfile) {
        profile = JSON.parse(storedProfile);
      } else {
        profile = {
          firstName: localStorage.getItem("user_firstName") || "User",
          lastName: localStorage.getItem("user_lastName") || "",
          email: localStorage.getItem("user_email") || "",
          phone: localStorage.getItem("user_phone") || "",
          address: "",
          role: "user",
          registrationDate: new Date().toISOString(),
          bookings: JSON.parse(localStorage.getItem("userBookings") || "[]"),
          savedListings: JSON.parse(localStorage.getItem("userSavedListings") || "[]"),
          isVerified: false
        };
        localStorage.setItem("userProfile", JSON.stringify(profile));
      }
      
      if (dummyLogin === "true" || token) {
        const guestBookings = JSON.parse(localStorage.getItem("guestBookings") || "[]");
        if (guestBookings.length > 0) {
          const existingIds = new Set(profile.bookings?.map(b => b.id) || []);
          const newBookings = guestBookings.filter(b => !existingIds.has(b.id));
          profile.bookings = [...newBookings, ...(profile.bookings || [])];
          
          localStorage.setItem("userProfile", JSON.stringify(profile));
          localStorage.removeItem("guestBookings");
        }
      }

      setUserProfile(profile);
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        phone: profile.phone || "",
        address: profile.address || "",
      });

      const fullName = profile.firstName && profile.lastName
        ? `${profile.firstName} ${profile.lastName}`
        : profile.username || profile.email || "";
      setProfileData({
        name: fullName,
        username: profile.username || profile.email || "",
        email: profile.email || "",
        city: profile.city || "",
        bio: profile.bio || "I enjoy exploring new destinations and experiencing local hospitality."
      });

      setProfileImage(profile.profileImage || 
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80");

    } catch (error) {
      console.error("Error fetching user data:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const getBookingIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'hotel':
        return <Bed className="text-blue-500 w-4 h-4" />;
      case 'shortlet':
        return <HomeIcon className="text-purple-500 w-4 h-4" />;
      case 'restaurant':
        return <Utensils className="text-green-500 w-4 h-4" />;
      case 'event':
      case 'event center':
        return <CalendarDays className="text-orange-500 w-4 h-4" />;
      case 'service':
        return <Briefcase className="text-indigo-500 w-4 h-4" />;
      default:
        return <CalendarCheck className="text-gray-500 w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return "N/A";
    }
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return "₦ --";
    try {
      const num = typeof price === 'number' ? price : parseInt(price.toString().replace(/[^\d]/g, ""));
      if (isNaN(num)) return "₦ --";
      return `₦${num.toLocaleString()}`;
    } catch {
      return "₦ --";
    }
  };

  // Calculate stats
  const memberSince = userProfile?.registrationDate 
    ? new Date(userProfile.registrationDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      })
    : "Recently";

  const bookings = userProfile?.bookings || [];
  const savedListings = userProfile?.savedListings || JSON.parse(localStorage.getItem("userSavedListings") || "[]");
  
  // Categorize bookings
  const hotelBookings = bookings.filter(b => b.type?.toLowerCase() === 'hotel');
  const shortletBookings = bookings.filter(b => b.type?.toLowerCase() === 'shortlet');
  const restaurantBookings = bookings.filter(b => b.type?.toLowerCase() === 'restaurant');
  const eventBookings = bookings.filter(b => b.type?.toLowerCase() === 'event' || b.type?.toLowerCase() === 'event center');
  const serviceBookings = bookings.filter(b => b.type?.toLowerCase() === 'service');
  
  // Get recent bookings
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
    .slice(0, 5);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const updatedProfile = {
        ...userProfile,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        username: profileData.username,
        city: profileData.city,
        bio: profileData.bio,
        profileImage: profileImage
      };
      
      localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
      setUserProfile(updatedProfile);
      window.dispatchEvent(new Event("storage"));
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  const handleCancelBooking = (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        const updatedProfile = {
          ...userProfile,
          bookings: userProfile.bookings.map(booking => 
            booking.id === bookingId 
              ? { ...booking, status: "cancelled", cancelledDate: new Date().toISOString() }
              : booking
          )
        };
        
        setUserProfile(updatedProfile);
        localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
        
        const allBookings = JSON.parse(localStorage.getItem("userBookings") || "[]");
        const updatedAllBookings = allBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: "cancelled", cancelledDate: new Date().toISOString() }
            : booking
        );
        localStorage.setItem("userBookings", JSON.stringify(updatedAllBookings));
        
        alert("Booking cancelled successfully!");
      } catch (error) {
        console.error("Error cancelling booking:", error);
        alert("Failed to cancel booking");
      }
    }
  };

  const handleNotificationToggle = (type) => {
    setNotificationSettings(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleProfileImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      if (!file.type.match('image.*')) {
        alert("Please select an image file");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_email");
    localStorage.removeItem("userProfile");
    localStorage.removeItem("auth-storage");
    localStorage.removeItem("ajani_dummy_login");
    
    window.dispatchEvent(new Event("storage"));
    navigate("/");
    window.location.reload();
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNameClick = () => {
    alert("Contact support to change your name or email");
  };

  const handleEmailClick = () => {
    alert("Contact support to change your name or email");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex-grow flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d37f] mx-auto"></div>
            <p className="mt-4 text-gray-600 font-manrope">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-manrope relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-blue-500 shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            {isSidebarOpen ? (
              <X size={20} strokeWidth={2.5} className="text-blue-600" />
            ) : (
              <Menu size={20} strokeWidth={2.5} className="text-blue-600" />
            )}
          </button>
          
          <img 
            src={Logo} 
            alt="Ajani" 
            className="h-8 w-auto cursor-pointer hover:scale-105 transition-transform"
            onClick={handleLogoClick}
          />
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative hidden md:block">
            <Search 
              size={16} 
              strokeWidth={2.5} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            />
            <input
              type="text"
              placeholder="Search for something"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-manrope"
              style={{ width: '250px' }}
            />
          </div>

          <button 
            onClick={() => setActiveTab("settings")}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Settings"
          >
            <Settings size={20} strokeWidth={2.5} className="text-gray-600" />
          </button>

          <button 
            onClick={() => {
              setActiveTab("notifications");
              if (window.innerWidth < 768) setIsSidebarOpen(false);
            }}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
            title="Notifications"
          >
            <Bell size={20} strokeWidth={2.5} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="w-10 h-10 rounded-full overflow-hidden cursor-pointer border-2 border-blue-500">
            <img
              src={profileImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <main className="flex-grow pt-0">
        <div className="flex h-[calc(100vh-65px)]">
          {/* Sidebar */}
          <motion.aside
            initial={false}
            animate={{ 
              x: isSidebarOpen ? 0 : '-100%',
              width: isSidebarOpen ? '256px' : '0px'
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed md:relative top-0 left-0 h-full z-50 md:translate-x-0 md:w-64 bg-white border-r border-gray-200 overflow-hidden"
          >
            <div className="p-4 flex items-center md:hidden justify-between border-b border-gray-200">
              <div className="ml-0">
                <img 
                  src={Logo} 
                  alt="Ajani" 
                  className="h-8 w-auto cursor-pointer hover:scale-105 transition-transform"
                  onClick={handleLogoClick}
                />
              </div>
              
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={16} strokeWidth={2.5} className="text-gray-600" />
              </button>
            </div>
            
            <nav className="mt-4 md:mt-8 px-4">
              <div className="space-y-3 md:space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        if (window.innerWidth < 768) setIsSidebarOpen(false);
                      }}
                      className={`flex items-center w-full px-3 md:px-4 py-3 md:py-3 rounded-lg transition-all duration-200 ${
                        activeTab === tab.id
                          ? "bg-blue-50 text-blue-600 border-l-4 border-blue-500 shadow-sm"
                          : "text-gray-700 hover:bg-gray-50 hover:border-l-4 hover:border-gray-200"
                      }`}
                    >
                      <Icon size={16} strokeWidth={2.5} className="mr-3 flex-shrink-0" />
                      <span className="text-sm md:text-base font-manrope">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>
            
            <div className="mt-6 px-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3 font-manrope">Quick Book</h3>
              <div className="space-y-2">
                {bookingCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => navigate(`/category/${category.id}`)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 text-sm font-manrope flex items-center gap-2`}
                  >
                    <category.icon size={16} strokeWidth={2.5} className={`text-${category.color}-500`} />
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
            
            {isSidebarOpen && (
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover sidebar-avatar"
                    />
                  </div>
                  <div className="overflow-hidden">
                    <p 
                      onClick={handleNameClick}
                      className="font-medium text-gray-900 text-sm truncate font-manrope cursor-pointer hover:text-blue-600 transition-colors"
                    >
                      {userProfile?.firstName} {userProfile?.lastName}
                    </p>
                    <p 
                      onClick={handleEmailClick}
                      className="text-xs text-gray-500 truncate font-manrope cursor-pointer hover:text-blue-600 transition-colors"
                    >
                      {userProfile?.email}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.aside>

          {/* Main Content */}
          <div className="flex-grow overflow-y-auto w-full">
            {!isSidebarOpen && (
              <div className="md:hidden p-4 border-b border-gray-200">
                <div className="relative">
                  <Search 
                    size={16} 
                    strokeWidth={2.5} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                  />
                  <input
                    type="text"
                    placeholder="Search for something"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-manrope"
                  />
                </div>
              </div>
            )}
            
            <div className="max-w-7xl mx-auto px-3 md:px-4 md:px-6 py-4 md:py-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Overview Tab */}
                  {activeTab === "overview" && (
                    <div className="space-y-6">
                      {/* Welcome Header */}
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <h1 className="text-2xl md:text-3xl font-bold mb-2 font-manrope">
                              Welcome back, {userProfile.firstName}!
                            </h1>
                            <p className="text-blue-100 font-manrope">Your personalized booking dashboard</p>
                          </div>
                          <button
                            onClick={() => setActiveTab("settings")}
                            className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors font-manrope"
                          >
                            <Edit3 size={16} strokeWidth={2.5} />
                            Edit Profile
                          </button>
                        </div>
                      </div>

                      {/* Stats Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {/* Total Bookings Card */}
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 }}
                          className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-3 mb-3 md:mb-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <CalendarCheck size={20} strokeWidth={2.5} className="text-blue-600" />
                            </div>
                            <h3 className="text-gray-500 font-medium text-sm md:text-base font-manrope">Total Bookings</h3>
                          </div>
                          <div className="text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2 font-manrope">{bookings.length}</div>
                        </motion.div>
                        
                        {/* Hotel Bookings Card */}
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.15 }}
                          className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-3 mb-3 md:mb-4">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Bed size={20} strokeWidth={2.5} className="text-green-600" />
                            </div>
                            <h3 className="text-gray-500 font-medium text-sm md:text-base font-manrope">Hotel Stays</h3>
                          </div>
                          <div className="text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2 font-manrope">{hotelBookings.length}</div>
                        </motion.div>
                        
                        {/* Shortlet Bookings Card */}
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 }}
                          className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-3 mb-3 md:mb-4">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <HomeIcon size={20} strokeWidth={2.5} className="text-purple-600" />
                            </div>
                            <h3 className="text-gray-500 font-medium text-sm md:text-base font-manrope">Shortlet Stays</h3>
                          </div>
                          <div className="text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2 font-manrope">{shortletBookings.length}</div>
                        </motion.div>
                        
                        {/* Member Since Card */}
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.25 }}
                          className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-3 mb-3 md:mb-4">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                              <AwardIcon size={20} strokeWidth={2.5} className="text-yellow-600" />
                            </div>
                            <h3 className="text-gray-500 font-medium text-sm md:text-base font-manrope">Member Since</h3>
                          </div>
                          <div className="text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2 font-manrope">{memberSince}</div>
                        </motion.div>
                      </div>

                      {/* Recent Bookings Section */}
                      {recentBookings.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
                        >
                          <div className="p-4 md:p-6 border-b border-gray-200">
                            <h2 className="text-lg md:text-xl font-bold text-gray-900 font-manrope">Recent Bookings</h2>
                          </div>
                          <div className="overflow-x-auto">
                            <div className="min-w-[600px] md:min-w-0">
                              <table className="w-full">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-gray-600 font-manrope">Booking</th>
                                    <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-gray-600 font-manrope">Type</th>
                                    <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-gray-600 font-manrope hidden md:table-cell">Date</th>
                                    <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-gray-600 font-manrope">Status</th>
                                    <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-gray-600 font-manrope">Amount</th>
                                    <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-gray-600 font-manrope">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {recentBookings.map((booking, index) => (
                                    <motion.tr 
                                      key={booking.id}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: 0.1 * index }}
                                      className="hover:bg-gray-50"
                                    >
                                      <td className="p-3 md:p-4">
                                        <div className="flex items-center gap-2 md:gap-3">
                                          <img 
                                            src={booking.vendor?.image || "https://images.unsplash.com/photo-1552566626-52f8b828add9"} 
                                            alt={booking.vendor?.name} 
                                            className="w-8 h-8 md:w-10 md:h-10 rounded-md object-cover" 
                                          />
                                          <div>
                                            <div className="font-medium text-gray-900 text-sm md:text-base font-manrope truncate max-w-[150px]">
                                              {booking.vendor?.name || "Unknown Vendor"}
                                            </div>
                                            <div className="text-xs text-gray-500 md:hidden font-manrope">
                                              {formatDate(booking.date)}
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="p-3 md:p-4">
                                        <div className="flex items-center gap-1">
                                          {getBookingIcon(booking.type)}
                                          <span className="text-gray-900 text-sm font-manrope capitalize">
                                            {booking.type || "N/A"}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="p-3 md:p-4 text-gray-900 hidden md:table-cell font-manrope">
                                        {formatDate(booking.details?.checkIn || booking.date)}
                                      </td>
                                      <td className="p-3 md:p-4">
                                        <span className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-manrope ${getStatusColor(booking.status)}`}>
                                          {booking.status || "N/A"}
                                        </span>
                                      </td>
                                      <td className="p-3 md:p-4 text-gray-900 font-medium font-manrope">
                                        {formatPrice(booking.details?.totalAmount)}
                                      </td>
                                      <td className="p-3 md:p-4">
                                        <div className="flex items-center gap-2">
                                          <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => navigate(`/booking/confirmation/${booking.type}?ref=${booking.id}`)}
                                            className="text-blue-400 hover:text-blue-600 p-1 transition-colors"
                                            title="View Details"
                                          >
                                            <Eye size={16} strokeWidth={2.5} />
                                          </motion.button>
                                          {booking.status === 'confirmed' && (
                                            <motion.button
                                              whileHover={{ scale: 1.1 }}
                                              whileTap={{ scale: 0.9 }}
                                              onClick={() => handleCancelBooking(booking.id)}
                                              className="text-red-400 hover:text-red-600 p-1 transition-colors"
                                              title="Cancel Booking"
                                            >
                                              <X size={16} strokeWidth={2.5} />
                                            </motion.button>
                                          )}
                                        </div>
                                      </td>
                                    </motion.tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                          {bookings.length > 5 && (
                            <div className="p-4 border-t border-gray-200">
                              <button
                                onClick={() => setActiveTab("bookings")}
                                className="w-full text-center text-blue-600 hover:text-blue-800 text-sm font-manrope"
                              >
                                View All {bookings.length} Bookings →
                              </button>
                            </div>
                          )}
                        </motion.div>
                      )}

                      {/* Quick Booking Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {bookingCategories.map((category, index) => (
                          <motion.button
                            key={category.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(`/category/${category.id}`)}
                            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all text-left"
                          >
                            <div className="flex items-center gap-3 mb-4">
                              <div className={`p-2 bg-${category.color}-100 rounded-lg`}>
                                <category.icon size={24} strokeWidth={2.5} className={`text-${category.color}-600`} />
                              </div>
                              <h3 className="font-bold text-gray-900 font-manrope">{category.label}</h3>
                            </div>
                            <p className="text-gray-600 text-sm font-manrope">
                              {category.id === 'hotel' && "Find and book the perfect hotel for your stay"}
                              {category.id === 'shortlet' && "Discover amazing short-term rental properties"}
                              {category.id === 'restaurant' && "Reserve tables at top restaurants"}
                              {category.id === 'event' && "Book venues and plan your events"}
                              {category.id === 'service' && "Find professional services for your needs"}
                            </p>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bookings Tab */}
                  {activeTab === "bookings" && (
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <h2 className="text-lg md:text-xl font-bold text-gray-900 font-manrope">My Bookings</h2>
                            <p className="text-gray-600 text-sm font-manrope">Manage and track all your bookings</p>
                          </div>
                          <div className="flex gap-2">
                            <motion.button 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => navigate("/")}
                              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium font-manrope transition-colors"
                            >
                              Book Now
                            </motion.button>
                          </div>
                        </div>
                      </div>

                      {/* Bookings by Category */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {bookingCategories.map((category) => {
                          const categoryBookings = bookings.filter(b => 
                            b.type?.toLowerCase() === category.id || 
                            (category.id === 'event' && b.type?.toLowerCase() === 'event center')
                          );
                          
                          return (
                            <motion.div 
                              key={category.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 bg-${category.color}-100 rounded-lg`}>
                                    <category.icon size={20} strokeWidth={2.5} className={`text-${category.color}-600`} />
                                  </div>
                                  <h3 className="font-bold text-gray-900 font-manrope">{category.label}</h3>
                                </div>
                                <span className="text-xl font-bold text-gray-900 font-manrope">{categoryBookings.length}</span>
                              </div>
                              {categoryBookings.length > 0 ? (
                                <div className="space-y-3">
                                  {categoryBookings.slice(0, 3).map((booking) => (
                                    <div key={booking.id} className="p-3 border border-gray-200 rounded-lg">
                                      <div className="flex items-center justify-between">
                                        <div className="min-w-0">
                                          <p className="font-medium text-gray-900 text-sm truncate font-manrope">
                                            {booking.vendor?.name || "Unknown Vendor"}
                                          </p>
                                          <p className="text-xs text-gray-500 font-manrope">
                                            {formatDate(booking.date)}
                                          </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-manrope ${getStatusColor(booking.status)}`}>
                                          {booking.status}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                  {categoryBookings.length > 3 && (
                                    <button className="w-full text-center text-blue-600 hover:text-blue-800 text-sm font-manrope">
                                      View {categoryBookings.length - 3} more →
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div className="text-center py-4">
                                  <p className="text-gray-500 text-sm font-manrope">No {category.label.toLowerCase()} bookings yet</p>
                                  <button
                                    onClick={() => navigate(`/category/${category.id}`)}
                                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-manrope"
                                  >
                                    Book {category.label} →
                                  </button>
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* All Bookings Table */}
                      {bookings.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                          <div className="p-4 md:p-6 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 font-manrope">All Bookings ({bookings.length})</h3>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-gray-600 font-manrope">Vendor</th>
                                  <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-gray-600 font-manrope">Type</th>
                                  <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-gray-600 font-manrope hidden md:table-cell">Date</th>
                                  <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-gray-600 font-manrope">Status</th>
                                  <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-gray-600 font-manrope">Amount</th>
                                  <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-gray-600 font-manrope">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {bookings.map((booking, index) => (
                                  <tr key={booking.id} className="hover:bg-gray-50">
                                    <td className="p-3 md:p-4">
                                      <div className="flex items-center gap-3">
                                        <img 
                                          src={booking.vendor?.image || "https://images.unsplash.com/photo-1552566626-52f8b828add9"} 
                                          alt={booking.vendor?.name}
                                          className="w-10 h-10 rounded-md object-cover"
                                        />
                                        <div className="min-w-0">
                                          <p className="font-medium text-gray-900 text-sm truncate font-manrope">
                                            {booking.vendor?.name || "Unknown Vendor"}
                                          </p>
                                          <p className="text-xs text-gray-500 font-manrope truncate">
                                            {formatLocation(booking.vendor?.location)}
                                          </p>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="p-3 md:p-4">
                                      <div className="flex items-center gap-1">
                                        {getBookingIcon(booking.type)}
                                        <span className="text-gray-900 text-sm font-manrope capitalize">
                                          {booking.type || "N/A"}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="p-3 md:p-4 text-gray-900 hidden md:table-cell font-manrope">
                                      {formatDate(booking.details?.checkIn || booking.date)}
                                    </td>
                                    <td className="p-3 md:p-4">
                                      <span className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-manrope ${getStatusColor(booking.status)}`}>
                                        {booking.status || "N/A"}
                                      </span>
                                    </td>
                                    <td className="p-3 md:p-4 text-gray-900 font-medium font-manrope">
                                      {formatPrice(booking.details?.totalAmount)}
                                    </td>
                                    <td className="p-3 md:p-4">
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => navigate(`/booking/confirmation/${booking.type}?ref=${booking.id}`)}
                                          className="text-blue-400 hover:text-blue-600 p-1 transition-colors"
                                          title="View Details"
                                        >
                                          <Eye size={16} strokeWidth={2.5} />
                                        </button>
                                        {booking.status === 'confirmed' && (
                                          <button
                                            onClick={() => handleCancelBooking(booking.id)}
                                            className="text-red-400 hover:text-red-600 p-1 transition-colors"
                                            title="Cancel Booking"
                                          >
                                            <X size={16} strokeWidth={2.5} />
                                          </button>
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

                  {/* Saved Tab */}
                  {activeTab === "saved" && (
                    <div className="space-y-6">
                      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <h2 className="text-lg md:text-xl font-bold text-gray-900 font-manrope">Saved Listings</h2>
                            <p className="text-gray-600 text-sm font-manrope">Your favorite hotels, restaurants, and services</p>
                          </div>
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate("/")}
                            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium font-manrope transition-colors"
                          >
                            Explore More
                          </motion.button>
                        </div>
                      </div>

                      {savedListings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                          {savedListings.map((listing, index) => (
                            <motion.div 
                              key={index}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.1 * index }}
                              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                            >
                              <div className="relative h-48 overflow-hidden">
                                <img 
                                  src={listing.image || "https://images.unsplash.com/photo-1552566626-52f8b828add9"} 
                                  alt={listing.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                                  <HeartIcon size={20} strokeWidth={2.5} className="text-red-500" fill="#EF4444" />
                                </button>
                              </div>
                              <div className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h4 className="font-bold text-gray-900 font-manrope truncate">{listing.name}</h4>
                                    <p className="text-sm text-gray-600 font-manrope capitalize">{listing.type}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3 font-manrope">
                                  <MapPinIcon size={14} strokeWidth={2.5} />
                                  <span className="truncate">{listing.location || "Location not specified"}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="font-bold text-gray-900 font-manrope">
                                    {formatPrice(listing.price)}
                                  </div>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate(`/listing/${listing.id}`)}
                                    className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-manrope"
                                  >
                                    View Details
                                  </motion.button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                          <HeartIcon size={48} strokeWidth={1.5} className="mx-auto text-gray-300 mb-4" />
                          <h3 className="text-lg font-bold text-gray-900 mb-2 font-manrope">No Saved Listings</h3>
                          <p className="text-gray-600 mb-6 font-manrope">You haven't saved any listings yet.</p>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate("/")}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium font-manrope transition-colors"
                          >
                            Explore Listings
                          </motion.button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notifications Tab - Same as before */}
                  {activeTab === "notifications" && (
                    <div className="space-y-6">
                      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <h2 className="text-lg md:text-xl font-bold text-gray-900 font-manrope">Notifications</h2>
                            <p className="text-gray-600 text-sm font-manrope">Manage your notifications and alerts</p>
                          </div>
                          <div className="flex gap-2">
                            <motion.button 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium font-manrope transition-colors"
                            >
                              Mark All as Read
                            </motion.button>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="divide-y divide-gray-200">
                          <div className="p-4 md:p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start gap-3 md:gap-4">
                              <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                                <Bell size={20} strokeWidth={2.5} />
                              </div>
                              <div className="flex-grow min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                  <h3 className="font-medium text-gray-900 text-sm md:text-base font-manrope">Welcome to Ajani!</h3>
                                  <span className="text-xs text-gray-500 font-manrope whitespace-nowrap">Just now</span>
                                </div>
                                <p className="text-gray-600 text-sm font-manrope mb-2">
                                  We're glad to have you on board. Start exploring amazing listings and book your next experience.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Settings Tab - Same as before */}
                  {activeTab === "settings" && (
                    <div className="space-y-6">
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
                      >
                        <div className="border-b border-gray-200 pb-4 mb-6">
                          <h2 className="text-lg font-bold text-gray-900 font-manrope">Edit Profile</h2>
                          <p className="text-sm text-gray-600 mt-1 font-manrope">Manage your account and preferences</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="flex items-center gap-4">
                            <div className="relative group">
                              <img 
                                src={profileImage} 
                                alt="Profile" 
                                className="w-20 h-20 rounded-full object-cover cursor-pointer group-hover:scale-105 transition-transform"
                              />
                              <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer group-hover:scale-110 transition-transform shadow-lg">
                                <Camera size={16} strokeWidth={2.5} />
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  onChange={handleProfileImageUpload}
                                  className="hidden"
                                />
                              </label>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 font-manrope">Click the camera icon to upload a new profile picture</p>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 font-manrope">First Name</label>
                                <input 
                                  type="text" 
                                  name="firstName"
                                  value={formData.firstName}
                                  onChange={handleInputChange}
                                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-manrope"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 font-manrope">Last Name</label>
                                <input 
                                  type="text" 
                                  name="lastName"
                                  value={formData.lastName}
                                  onChange={handleInputChange}
                                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-manrope"
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 font-manrope">Email</label>
                                <input 
                                  type="email" 
                                  value={profileData.email}
                                  readOnly
                                  onClick={handleEmailClick}
                                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-manrope bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 font-manrope">Phone</label>
                                <input 
                                  type="tel" 
                                  name="phone"
                                  value={formData.phone}
                                  onChange={handleInputChange}
                                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-manrope"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2 font-manrope">Address</label>
                              <input 
                                type="text" 
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-manrope"
                                placeholder="Enter your address"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-6 flex justify-end gap-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium font-manrope transition-colors"
                          >
                            Cancel
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSaveProfile}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2 font-manrope transition-colors"
                          >
                            <Save size={16} strokeWidth={2.5} /> Save Changes
                          </motion.button>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
                      >
                        <h2 className="text-lg font-bold text-gray-900 font-manrope mb-4">Notification Preferences</h2>
                        <p className="text-gray-600 mb-4 font-manrope">Choose how you want to receive notifications</p>
                        
                        <div className="space-y-4">
                          <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="text-md font-medium text-gray-900 mb-3 font-manrope">Email</h3>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Mail size={16} strokeWidth={2.5} className="text-gray-500" />
                                <span className="text-gray-900 font-manrope">Email Notifications</span>
                              </div>
                              <div className="relative inline-block w-12 align-middle select-none transition duration-200 ease-in">
                                <input 
                                  type="checkbox" 
                                  id="email-toggle" 
                                  checked={notificationSettings.email}
                                  onChange={() => handleNotificationToggle('email')}
                                  className="sr-only"
                                />
                                <label 
                                  htmlFor="email-toggle"
                                  className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                                    notificationSettings.email ? 'bg-blue-600' : 'bg-gray-300'
                                  }`}
                                >
                                  <span 
                                    className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${
                                      notificationSettings.email ? 'translate-x-6' : 'translate-x-0'
                                    }`}
                                  ></span>
                                </label>
                              </div>
                            </div>
                          </div>
                          
                          <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="text-md font-medium text-gray-900 mb-3 font-manrope">WhatsApp</h3>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <MessageSquare size={16} strokeWidth={2.5} className="text-gray-500" />
                                <span className="text-gray-900 font-manrope">WhatsApp Notifications</span>
                              </div>
                              <div className="relative inline-block w-12 align-middle select-none transition duration-200 ease-in">
                                <input 
                                  type="checkbox" 
                                  id="whatsapp-toggle" 
                                  checked={notificationSettings.whatsapp}
                                  onChange={() => handleNotificationToggle('whatsapp')}
                                  className="sr-only"
                                />
                                <label 
                                  htmlFor="whatsapp-toggle"
                                  className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                                    notificationSettings.whatsapp ? 'bg-blue-600' : 'bg-gray-300'
                                  }`}
                                >
                                  <span 
                                    className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${
                                      notificationSettings.whatsapp ? 'translate-x-6' : 'translate-x-0'
                                    }`}
                                  ></span>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
                      >
                        <h2 className="text-lg font-bold text-gray-900 font-manrope mb-4">Account Actions</h2>
                        <div className="space-y-3">
                          <button
                            onClick={() => alert("Password reset email sent!")}
                            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 border border-gray-200 font-manrope"
                          >
                            Reset Password
                          </button>
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors text-blue-600 border border-blue-200 font-manrope"
                          >
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BuyerProfilePage;