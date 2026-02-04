// HallSelection.jsx - Component for selecting event halls/venues
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faChevronLeft,
  faChevronRight,
  faStar,
  faMapMarkerAlt,
  faXmark,
  faWifi,
  faTv,
  faCoffee,
  faSnowflake,
  faUsers,
  faClock,
  faVideo,
  faMicrophone,
  faLightbulb,
  faChair,
  faDesktop,
  faRuler,
  faDoorClosed,
  faExpand,
  faMusic,
  faCar,
  faUtensils,
  faGlassCheers,
  faBirthdayCake,
  faPaintBrush,
  faConciergeBell,
  faUser,
  faRulerCombined,
  faCalendarAlt,
  faUsers as faUsersGroup
} from "@fortawesome/free-solid-svg-icons";

// Helper functions
const formatPrice = (price) => {
  if (!price && price !== 0) return "₦ --";
  const num = parseInt(price.toString().replace(/[^\d]/g, ""));
  if (isNaN(num)) return "₦ --";
  return `₦${num.toLocaleString()}`;
};

const getAmenityIcon = (amenityName) => {
  const amenity = amenityName.toLowerCase();
  if (amenity.includes('wifi') || amenity.includes('internet')) return faWifi;
  if (amenity.includes('screen') || amenity.includes('tv') || amenity.includes('projector')) return faTv;
  if (amenity.includes('sound') || amenity.includes('audio') || amenity.includes('microphone')) return faMicrophone;
  if (amenity.includes('light') || amenity.includes('lighting')) return faLightbulb;
  if (amenity.includes('stage') || amenity.includes('platform')) return faVideo;
  if (amenity.includes('ac') || amenity.includes('air conditioning')) return faSnowflake;
  if (amenity.includes('seating') || amenity.includes('chairs') || amenity.includes('tables')) return faChair;
  if (amenity.includes('capacity') || amenity.includes('people') || amenity.includes('guests')) return faUsersGroup;
  if (amenity.includes('size') || amenity.includes('dimension') || amenity.includes('area')) return faRulerCombined;
  if (amenity.includes('parking')) return faCar;
  if (amenity.includes('catering') || amenity.includes('food') || amenity.includes('kitchen')) return faUtensils;
  if (amenity.includes('bar') || amenity.includes('drinks') || amenity.includes('alcohol')) return faGlassCheers;
  if (amenity.includes('decoration') || amenity.includes('decor')) return faPaintBrush;
  if (amenity.includes('coordination') || amenity.includes('planning') || amenity.includes('event manager')) return faConciergeBell;
  if (amenity.includes('music') || amenity.includes('dj') || amenity.includes('entertainment')) return faMusic;
  if (amenity.includes('wedding') || amenity.includes('ceremony')) return faBirthdayCake;
  return faCheck;
};

// Helper function to generate random price between 100,000 and 500,000
const generatePriceInRange = (multiplier = 1) => {
  const min = 100000;
  const max = 500000;
  const basePrice = Math.floor(Math.random() * (max - min + 1)) + min;
  return Math.round(basePrice * multiplier);
};

const HallSelection = ({ vendorData, category = "event", onHallSelect, onHallBookNow }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [modalHall, setModalHall] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullscreenGallery, setShowFullscreenGallery] = useState(false);
  const [fullscreenGalleryIndex, setFullscreenGalleryIndex] = useState(0);

  if (category !== "event") return null;

  // Get hall types from vendor data
  const getHallTypesFromVendor = () => {
    if (!vendorData) return [];
    
    // If vendor has hallTypes in details
    if (vendorData.details?.hallTypes && Array.isArray(vendorData.details.hallTypes)) {
      return vendorData.details.hallTypes.map((hall, index) => {
        // Get images from hall data
        const hallImages = hall.images?.map(img => img.url) || [];
        const hasImages = hallImages.length > 0;
        
        // Get amenities from hall or vendor
        const hallAmenities = Array.isArray(hall.amenities) ? hall.amenities : [];
        const vendorAmenities = Array.isArray(vendorData.amenities) ? vendorData.amenities : [];
        const allAmenities = [...new Set([...hallAmenities, ...vendorAmenities])];
        
        // If no amenities, use default event hall amenities
        const amenitiesList = allAmenities.length > 0 ? allAmenities : [
          'Stage Setup',
          'Sound System',
          'Lighting System',
          'Projector & Screen',
          'Microphones',
          'Tables & Chairs',
          'Air Conditioning',
          'Parking Space',
          'Catering Kitchen',
          'Decoration Services'
        ];
        
        // Create pricing options with prices between 100,000 and 500,000
        const pricingOptions = [];
        const basePrice = generatePriceInRange();
        const minCapacity = hall.minCapacity || 50;
        const maxCapacity = hall.maxCapacity || 500;
        
        // Create multiple pricing options for different event types
        const eventTypes = [
          { type: 'Wedding', multiplier: 1.2 },
          { type: 'Conference', multiplier: 1.0 },
          { type: 'Birthday Party', multiplier: 0.9 },
          { type: 'Corporate Event', multiplier: 1.1 },
          { type: 'Seminar', multiplier: 0.8 },
          { type: 'Product Launch', multiplier: 1.15 }
        ];
        
        eventTypes.forEach((eventType, i) => {
          // Ensure price stays within 100k-500k range
          let eventPrice = Math.round(basePrice * eventType.multiplier);
          eventPrice = Math.max(100000, Math.min(500000, eventPrice));
          
          const originalPrice = Math.round(eventPrice * 1.25); // 25% discount
          
          pricingOptions.push({
            id: `price-${hall._id || index}-${i}`,
            eventType: eventType.type,
            capacity: `${minCapacity}-${maxCapacity} people`,
            price: eventPrice,
            originalPrice: originalPrice,
            discount: '-25%',
            duration: 'Full day (8 hours)',
            setupTime: '2 hours before event',
            benefits: ['Free setup', 'Basic decoration', 'Event coordination', 'Security'],
            isAvailable: true
          });
        });
        
        // Generate features from amenities
        const features = amenitiesList.slice(0, 6).map(amenity => ({
          name: amenity,
          included: true,
          icon: getAmenityIcon(amenity)
        }));
        
        // Generate specifications
        const specifications = [
          { icon: faRulerCombined, label: 'Hall Size', value: hall.size || '500 m²' },
          { icon: faUsersGroup, label: 'Capacity', value: `${minCapacity}-${maxCapacity} Guests` },
          { icon: faChair, label: 'Seating Style', value: hall.seatingStyle || 'Banquet Style' },
          { icon: faDoorClosed, label: 'Hall Type', value: hall.name || 'Main Hall' },
          { icon: faClock, label: 'Setup Time', value: hall.setupTime || '2 hours before' },
          { icon: faCalendarAlt, label: 'Booking Period', value: hall.bookingPeriod || 'Minimum 1 week' }
        ];
        
        return {
          id: hall._id || `hall-${index + 1}`,
          title: hall.name || `Event Hall ${index + 1}`,
          name: hall.name || `Hall ${index + 1}`,
          description: hall.description || `${hall.name || 'Event hall'} at ${vendorData.name || 'Venue'}. Perfect for weddings, conferences, and special events.`,
          size: hall.size || '500 m²',
          capacity: `${minCapacity}-${maxCapacity}`,
          minCapacity: minCapacity,
          maxCapacity: maxCapacity,
          seatingStyle: hall.seatingStyle || 'Banquet Style',
          mainImage: hasImages ? hallImages[0] : 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80',
          image: hasImages ? hallImages[0] : 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80',
          images: hasImages ? hallImages : [
            'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80',
            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
            'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
            'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80'
          ],
          subImages: hasImages && hallImages.length > 1 ? hallImages.slice(1, 4) : [
            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80',
            'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&q=80',
            'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80'
          ],
          specifications,
          features,
          amenitiesList: amenitiesList,
          pricing: pricingOptions,
          availableDates: hall.availableDates || [],
          rating: vendorData.rating || 4.5,
          reviewCount: vendorData.reviewCount || 120,
          pricePerEvent: basePrice,
          originalData: hall
        };
      });
    }
    
    // Fallback to default halls with prices between 100k-500k
    const defaultHalls = [
      {
        id: 'hall-1',
        title: 'Grand Ballroom',
        name: 'Grand Ballroom',
        description: 'Elegant ballroom perfect for weddings, galas, and large corporate events. Features crystal chandeliers, marble floors, and state-of-the-art audiovisual equipment.',
        size: '500 m²',
        capacity: '200-500',
        minCapacity: 200,
        maxCapacity: 500,
        seatingStyle: 'Banquet Style',
        mainImage: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80',
        image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80',
          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
          'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
          'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80'
        ],
        subImages: [
          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80',
          'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&q=80',
          'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80'
        ],
        specifications: [
          { icon: faRulerCombined, label: 'Hall Size', value: '500 m²' },
          { icon: faUsersGroup, label: 'Capacity', value: '200-500 Guests' },
          { icon: faChair, label: 'Seating Style', value: 'Banquet Style' },
          { icon: faDoorClosed, label: 'Hall Type', value: 'Ballroom' },
          { icon: faClock, label: 'Setup Time', value: '3 hours before' },
          { icon: faCalendarAlt, label: 'Booking Period', value: 'Minimum 2 weeks' }
        ],
        features: [
          { name: 'Stage Setup', included: true, icon: faVideo },
          { name: 'Sound System', included: true, icon: faMicrophone },
          { name: 'Lighting System', included: true, icon: faLightbulb },
          { name: 'Projector & Screen', included: true, icon: faTv },
          { name: 'Air Conditioning', included: true, icon: faSnowflake },
          { name: 'Parking Space', included: true, icon: faCar }
        ],
        amenitiesList: [
          'Stage Setup',
          'Sound System',
          'Lighting System',
          'Projector & Screen',
          'Microphones',
          'Tables & Chairs (500 pax)',
          'Air Conditioning',
          'Parking Space (100 cars)',
          'Catering Kitchen',
          'Bridal Suite',
          'Decoration Services',
          'Event Coordination'
        ],
        pricing: [
          { 
            id: 'price-1-1',
            eventType: 'Wedding',
            capacity: '200-500 people',
            price: generatePriceInRange(1.2),
            originalPrice: 2000000,
            discount: '-25%',
            duration: 'Full day (8 hours)',
            setupTime: '3 hours before event',
            benefits: ['Free setup', 'Basic decoration', 'Event coordination', 'Security', 'Bridal suite'],
            isAvailable: true
          },
          { 
            id: 'price-1-2',
            eventType: 'Conference',
            capacity: '300-500 people',
            price: generatePriceInRange(1.0),
            originalPrice: 1600000,
            discount: '-25%',
            duration: 'Full day (8 hours)',
            setupTime: '2 hours before event',
            benefits: ['Projector & screen', 'Sound system', 'Wireless microphones', 'High-speed WiFi'],
            isAvailable: true
          },
          { 
            id: 'price-1-3',
            eventType: 'Birthday Party',
            capacity: '200-350 people',
            price: generatePriceInRange(0.9),
            originalPrice: 1400000,
            discount: '-25%',
            duration: 'Full day (8 hours)',
            setupTime: '2 hours before event',
            benefits: ['Decoration services', 'Sound system', 'Basic lighting', 'Event coordination'],
            isAvailable: true
          },
          { 
            id: 'price-1-4',
            eventType: 'Corporate Event',
            capacity: '250-400 people',
            price: generatePriceInRange(1.1),
            originalPrice: 1800000,
            discount: '-25%',
            duration: 'Full day (8 hours)',
            setupTime: '3 hours before event',
            benefits: ['Professional AV setup', 'High-speed WiFi', 'Catering space', 'Event coordinator'],
            isAvailable: true
          }
        ],
        availableDates: [],
        rating: 4.5,
        reviewCount: 120,
        pricePerEvent: generatePriceInRange(1.0)
      },
      {
        id: 'hall-2',
        title: 'Executive Conference Hall',
        name: 'Executive Conference Hall',
        description: 'Modern conference hall ideal for corporate meetings, seminars, and workshops. Equipped with advanced audiovisual technology and ergonomic seating.',
        size: '300 m²',
        capacity: '100-250',
        minCapacity: 100,
        maxCapacity: 250,
        seatingStyle: 'Theater Style',
        mainImage: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80',
        image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80',
          'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80',
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
          'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80'
        ],
        subImages: [
          'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=400&q=80',
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80',
          'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80'
        ],
        specifications: [
          { icon: faRulerCombined, label: 'Hall Size', value: '300 m²' },
          { icon: faUsersGroup, label: 'Capacity', value: '100-250 Guests' },
          { icon: faChair, label: 'Seating Style', value: 'Theater Style' },
          { icon: faDoorClosed, label: 'Hall Type', value: 'Conference Hall' },
          { icon: faClock, label: 'Setup Time', value: '2 hours before' },
          { icon: faCalendarAlt, label: 'Booking Period', value: 'Minimum 1 week' }
        ],
        features: [
          { name: 'High-speed WiFi', included: true, icon: faWifi },
          { name: 'Projector & Screen', included: true, icon: faTv },
          { name: 'Audio System', included: true, icon: faMicrophone },
          { name: 'Conference Phone', included: true, icon: faDesktop },
          { name: 'Air Conditioning', included: true, icon: faSnowflake },
          { name: 'Whiteboard', included: true, icon: faPaintBrush }
        ],
        amenitiesList: [
          'High-speed WiFi',
          'Projector & Screen',
          'Sound System',
          'Wireless Microphones',
          'Conference Phones',
          'Tables & Chairs (250 pax)',
          'Air Conditioning',
          'Parking Space (50 cars)',
          'Refreshment Area',
          'Whiteboard',
          'Flip Charts',
          'Event Coordination'
        ],
        pricing: [
          { 
            id: 'price-2-1',
            eventType: 'Conference',
            capacity: '100-250 people',
            price: generatePriceInRange(0.9),
            originalPrice: 1200000,
            discount: '-25%',
            duration: 'Full day (8 hours)',
            setupTime: '2 hours before event',
            benefits: ['Projector & screen', 'Sound system', 'Wireless microphones', 'High-speed WiFi'],
            isAvailable: true
          },
          { 
            id: 'price-2-2',
            eventType: 'Seminar',
            capacity: '150-200 people',
            price: generatePriceInRange(0.8),
            originalPrice: 1000000,
            discount: '-25%',
            duration: 'Full day (8 hours)',
            setupTime: '2 hours before event',
            benefits: ['Basic AV setup', 'Whiteboard', 'Flip charts', 'Event coordination'],
            isAvailable: true
          },
          { 
            id: 'price-2-3',
            eventType: 'Training',
            capacity: '100-150 people',
            price: generatePriceInRange(0.85),
            originalPrice: 1100000,
            discount: '-25%',
            duration: 'Full day (8 hours)',
            setupTime: '2 hours before event',
            benefits: ['Classroom setup', 'Projector', 'Sound system', 'Whiteboard'],
            isAvailable: true
          }
        ],
        availableDates: [],
        rating: 4.3,
        reviewCount: 85,
        pricePerEvent: generatePriceInRange(0.9)
      },
      {
        id: 'hall-3',
        title: 'Intimate Event Space',
        name: 'Intimate Event Space',
        description: 'Cozy and stylish space perfect for small weddings, birthday parties, and intimate gatherings. Features modern decor and flexible seating arrangements.',
        size: '200 m²',
        capacity: '50-150',
        minCapacity: 50,
        maxCapacity: 150,
        seatingStyle: 'Round Table',
        mainImage: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
        image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
          'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80',
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'
        ],
        subImages: [
          'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&q=80',
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80',
          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80'
        ],
        specifications: [
          { icon: faRulerCombined, label: 'Hall Size', value: '200 m²' },
          { icon: faUsersGroup, label: 'Capacity', value: '50-150 Guests' },
          { icon: faChair, label: 'Seating Style', value: 'Round Table' },
          { icon: faDoorClosed, label: 'Hall Type', value: 'Event Space' },
          { icon: faClock, label: 'Setup Time', value: '2 hours before' },
          { icon: faCalendarAlt, label: 'Booking Period', value: 'Minimum 3 days' }
        ],
        features: [
          { name: 'Basic Sound System', included: true, icon: faMusic },
          { name: 'Lighting', included: true, icon: faLightbulb },
          { name: 'Tables & Chairs', included: true, icon: faChair },
          { name: 'Air Conditioning', included: true, icon: faSnowflake },
          { name: 'Kitchen Access', included: true, icon: faUtensils },
          { name: 'Parking Space', included: true, icon: faCar }
        ],
        amenitiesList: [
          'Sound System',
          'Lighting System',
          'Tables & Chairs (150 pax)',
          'Air Conditioning',
          'Parking Space (30 cars)',
          'Kitchen Access',
          'Decoration Services',
          'Event Coordination',
          'Bar Setup Area',
          'Dance Floor'
        ],
        pricing: [
          { 
            id: 'price-3-1',
            eventType: 'Birthday Party',
            capacity: '50-150 people',
            price: generatePriceInRange(0.85),
            originalPrice: 900000,
            discount: '-25%',
            duration: 'Full day (8 hours)',
            setupTime: '2 hours before event',
            benefits: ['Decoration services', 'Sound system', 'Basic lighting', 'Event coordination'],
            isAvailable: true
          },
          { 
            id: 'price-3-2',
            eventType: 'Small Wedding',
            capacity: '50-100 people',
            price: generatePriceInRange(1.1),
            originalPrice: 1200000,
            discount: '-25%',
            duration: 'Full day (8 hours)',
            setupTime: '3 hours before event',
            benefits: ['Bridal dressing room', 'Decoration services', 'Sound system', 'Event coordination'],
            isAvailable: true
          },
          { 
            id: 'price-3-3',
            eventType: 'Baby Shower',
            capacity: '30-80 people',
            price: generatePriceInRange(0.75),
            originalPrice: 800000,
            discount: '-25%',
            duration: '6 hours',
            setupTime: '2 hours before event',
            benefits: ['Decoration services', 'Sound system', 'Tables & chairs', 'Event coordination'],
            isAvailable: true
          }
        ],
        availableDates: [],
        rating: 4.7,
        reviewCount: 65,
        pricePerEvent: generatePriceInRange(0.85)
      }
    ];

    // Ensure all prices are within 100k-500k range
    return defaultHalls.map(hall => {
      const updatedPricing = hall.pricing.map(option => {
        let price = option.price;
        // Ensure price is within range
        price = Math.max(100000, Math.min(500000, price));
        
        // Recalculate original price based on updated price
        const originalPrice = Math.round(price * 1.25);
        
        return {
          ...option,
          price,
          originalPrice
        };
      });
      
      return {
        ...hall,
        pricing: updatedPricing,
        pricePerEvent: Math.max(100000, Math.min(500000, hall.pricePerEvent))
      };
    });
  };

  const hallTypes = getHallTypesFromVendor();
  
  // Format location from vendor data
  const vendorLocation = vendorData?.location?.area || 
                        vendorData?.location?.address || 
                        vendorData?.area || 
                        "Ibadan, Nigeria";

  /* ---------------- MODAL FUNCTIONS ---------------- */
  const openModal = (hall) => {
    setModalHall(hall);
    setCurrentImageIndex(0);
    setShowModal(true);
    document.body.style.overflow = "hidden";
    
    // Notify parent component about hall selection
    if (onHallSelect) {
      onHallSelect(hall);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalHall(null);
    document.body.style.overflow = "auto";
  };

  const openFullscreenGallery = (hall, index = 0) => {
    setModalHall(hall);
    setFullscreenGalleryIndex(index);
    setShowFullscreenGallery(true);
    document.body.style.overflow = "hidden";
  };

  const closeFullscreenGallery = () => {
    setShowFullscreenGallery(false);
    setModalHall(null);
    setFullscreenGalleryIndex(0);
    document.body.style.overflow = "auto";
  };

  const handlePrevImage = (modalType = "fullscreen") => {
    if (modalHall && modalHall.images) {
      if (modalType === "fullscreen") {
        setFullscreenGalleryIndex((prev) => 
          (prev - 1 + modalHall.images.length) % modalHall.images.length
        );
      } else {
        setCurrentImageIndex((prev) => 
          (prev - 1 + modalHall.images.length) % modalHall.images.length
        );
      }
    }
  };

  const handleNextImage = (modalType = "fullscreen") => {
    if (modalHall && modalHall.images) {
      if (modalType === "fullscreen") {
        setFullscreenGalleryIndex((prev) => 
          (prev + 1) % modalHall.images.length
        );
      } else {
        setCurrentImageIndex((prev) => 
          (prev + 1) % modalHall.images.length
        );
      }
    }
  };

  const handleBookNow = (hall, option) => {
    // Prepare booking data with ALL hall details
    const bookingData = {
      hall: {
        ...hall,
        selectedOption: option,
        // Include all hall details for the booking page
        specifications: hall.specifications,
        features: hall.features,
        amenitiesList: hall.amenitiesList,
        size: hall.size,
        capacity: hall.capacity,
        minCapacity: hall.minCapacity,
        maxCapacity: hall.maxCapacity,
        images: hall.images
      },
      venue: {
        id: vendorData._id || vendorData.id,
        name: vendorData.name || vendorData.title,
        location: vendorData.location || vendorData.area,
        rating: vendorData.rating || 4.5,
        image: vendorData.image || vendorData.images?.[0],
        category: category
      },
      booking: {
        eventType: option.eventType,
        capacity: option.capacity,
        duration: option.duration,
        setupTime: option.setupTime,
        price: option.price,
        originalPrice: option.originalPrice,
        discount: option.discount,
        benefits: option.benefits,
        totalPrice: option.price
      }
    };

    // Store booking data
    localStorage.setItem("hallBookingData", JSON.stringify(bookingData));
    
    // Notify parent component
    if (onHallBookNow) {
      onHallBookNow(hall, option);
    } else {
      // Fallback navigation
      navigate("/booking", { state: bookingData });
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showFullscreenGallery) {
        if (e.key === "Escape") {
          closeFullscreenGallery();
        } else if (e.key === "ArrowLeft") {
          handlePrevImage("fullscreen");
        } else if (e.key === "ArrowRight") {
          handleNextImage("fullscreen");
        }
      } else if (showModal) {
        if (e.key === "Escape") {
          closeModal();
        } else if (e.key === "ArrowLeft") {
          handlePrevImage("details");
        } else if (e.key === "ArrowRight") {
          handleNextImage("details");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showFullscreenGallery, showModal]);

  // If no halls available
  if (hallTypes.length === 0) {
    return (
      <div className="max-w-[1250px] mx-auto px-2.5 py-4">
        <h2 className="text-lg font-bold text-[#00065A] mb-4">
          Hall Selection
        </h2>
        <div className="text-center py-8 border border-gray-200 rounded-lg">
          <p className="text-gray-600">No halls available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1250px] mx-auto px-2.5 py-4">
      <h2 className="text-lg font-bold text-[#00065A] mb-4">
        Select Your Event Hall
        <span className="text-sm font-normal text-gray-500 ml-2">
          ({hallTypes.length} hall {hallTypes.length === 1 ? 'type' : 'types'} available)
        </span>
      </h2>

      {/* HALL LIST */}
      <div className="space-y-4">
        {hallTypes.map((hall) => {
          const bestOption = hall.pricing[0];

          return (
            <div
              key={hall.id}
              className="border border-gray-200 rounded-lg p-2.5 lg:p-6 transition hover:shadow-md"
            >
              <div className="flex flex-col lg:flex-row gap-4">
                {/* LEFT CARD - Hall Image & Basic Info */}
                <div className="lg:w-[280px] flex-shrink-0">
                  <div className="relative">
                    <img
                      src={hall.image}
                      alt={hall.title}
                      onClick={() => openFullscreenGallery(hall, 0)}
                      className="w-full h-40 rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    />
                    {/* Image count badge */}
                    <div className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      {hall.images?.length || 1} photos, click on the image to view
                    </div>
                    {/* Capacity badge */}
                    <div className="absolute top-1.5 left-1.5 bg-[#06EAFC] text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                      Capacity: {hall.capacity}
                    </div>
                  </div>

                  <h3 className="font-semibold text-base mt-2">
                    {hall.title}
                  </h3>

                  <div className="flex items-center gap-1 text-xs mt-0.5">
                    <FontAwesomeIcon icon={faStar} className="text-yellow-400 w-3" />
                    <span>{hall.rating?.toFixed(1) || "4.5"}</span>
                    <span className="text-gray-500">
                      ({hall.reviewCount || 0} reviews)
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-600 mt-0.5">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="w-3" />
                    <span className="truncate">{vendorLocation}</span>
                  </div>

                  <div className="mt-1 text-xs text-gray-700">
                    <div className="flex items-center gap-1">
                      <FontAwesomeIcon icon={faUsersGroup} className="w-3" />
                      <span>Capacity: {hall.capacity} guests</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <FontAwesomeIcon icon={faRulerCombined} className="w-3" />
                      <span>Size: {hall.size}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => openModal(hall)}
                    className="mt-2 w-full bg-[#06f49f] py-1.5 rounded text-xs font-medium hover:bg-[#06e495] transition-colors"
                  >
                    Preview Hall
                  </button>
                </div>

                {/* RIGHT OPTIONS - Pricing Options */}
                <div className="flex-1 space-y-3">
                  {hall.pricing.map((option) => (
                    <div
                      key={option.id}
                      className="bg-gray-50 rounded-lg p-3 flex flex-col lg:flex-row justify-between gap-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center border border-purple-200">
                            <FontAwesomeIcon
                              icon={option.eventType === 'Wedding' ? faGlassCheers : 
                                    option.eventType === 'Conference' ? faDesktop :
                                    option.eventType === 'Birthday Party' ? faBirthdayCake :
                                    option.eventType === 'Seminar' ? faDesktop :
                                    option.eventType === 'Training' ? faDesktop :
                                    option.eventType === 'Baby Shower' ? faBirthdayCake :
                                    faCalendarAlt}
                              className="text-purple-600 text-xs"
                            />
                          </div>
                          <p className="font-semibold text-sm">{option.eventType}</p>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {option.capacity} • {option.duration}
                        </p>

                        <div className="mt-1.5 space-y-0.5">
                          {option.benefits.map((b, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-1.5 text-xs"
                            >
                              <FontAwesomeIcon
                                icon={faCheck}
                                className="text-green-500 text-[10px]"
                              />
                              {b}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 lg:w-48">
                        {option.originalPrice && option.originalPrice > option.price && (
                          <>
                            <p className="line-through text-xs text-gray-400">
                              {formatPrice(option.originalPrice)}
                            </p>
                            <p className="text-xs text-red-500">
                              {option.discount}
                            </p>
                          </>
                        )}
                        <p className="text-lg font-bold">
                          {formatPrice(option.price)}
                        </p>
                        <p className="text-xs text-gray-500 mb-1.5">
                          Per event package
                        </p>

                        <button
                          onClick={() => handleBookNow(hall, option)}
                          className="w-full bg-[#06f49f] text-white px-4 py-1.5 rounded-full text-xs font-semibold hover:opacity-90 transition-opacity"
                        >
                          SELECT HALL
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------------- FULLSCREEN IMAGE GALLERY MODAL ---------------- */}
      {showFullscreenGallery && modalHall && (
        <div className="fixed inset-0 z-[9999] bg-black">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3 bg-gradient-to-b from-black/80 to-transparent">
            <div className="text-white">
              <h2 className="text-base font-semibold">{modalHall.title}</h2>
              <p className="text-xs text-white/80">
                {fullscreenGalleryIndex + 1} / {modalHall.images?.length}
              </p>
            </div>
            
            <button
              onClick={closeFullscreenGallery}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
            >
              <FontAwesomeIcon icon={faXmark} className="text-white text-xl" />
            </button>
          </div>

          {/* Main Image */}
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={modalHall.images[fullscreenGalleryIndex]}
              alt={`${modalHall.title} - View ${fullscreenGalleryIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
            
            {/* Navigation Buttons */}
            {modalHall.images.length > 1 && (
              <>
                <button
                  onClick={() => handlePrevImage("fullscreen")}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all md:left-8"
                >
                  <FontAwesomeIcon icon={faChevronLeft} className="text-lg" />
                </button>
                
                <button
                  onClick={() => handleNextImage("fullscreen")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all md:right-8"
                >
                  <FontAwesomeIcon icon={faChevronRight} className="text-lg" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Strip */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex gap-1.5 overflow-x-auto pb-1.5">
              {modalHall.images?.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setFullscreenGalleryIndex(index)}
                  className={`flex-shrink-0 w-12 h-12 rounded overflow-hidden border-2 transition-all ${
                    fullscreenGalleryIndex === index 
                      ? "border-white scale-105" 
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Swipe Instructions */}
          <div className="md:hidden absolute bottom-16 left-0 right-0 text-center text-white/60 text-xs">
            <p>Swipe or use arrows to navigate</p>
          </div>
        </div>
      )}

      {/* ---------------- DETAILS MODAL ---------------- */}
      {showModal && modalHall && (() => {
        const bestOption = modalHall.pricing[0];

        return (
          <div className="fixed inset-0 bg-black/70 z-[1000] flex items-center justify-center p-2.5">
            <div className="bg-white w-full max-w-6xl rounded-xl overflow-y-auto max-h-[90vh]">
              {/* HEADER */}
              <div className="sticky top-0 bg-white border-b border-gray-300 p-3 flex justify-between items-center">
                <h3 className="font-bold text-base">{modalHall.title}</h3>
                <button 
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>

              {/* CONTENT */}
              <div className="p-3 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                {/* LEFT COLUMN - IMAGES & DETAILS */}
                <div className="lg:col-span-2 space-y-4 md:space-y-6">
                  {/* Main Image */}
                  <div className="relative">
                    <img
                      src={modalHall.images[currentImageIndex]}
                      className="w-full h-[200px] md:h-[420px] object-cover rounded-lg md:rounded-xl"
                      alt={modalHall.title}
                    />

                    {/* Navigation Buttons */}
                    {modalHall.images.length > 1 && (
                      <>
                        <button
                          onClick={() => handlePrevImage("details")}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2"
                        >
                          <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleNextImage("details")}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2"
                        >
                          <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnails */}
                  <div className="flex gap-1.5 overflow-x-auto">
                    {modalHall.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        onClick={() => setCurrentImageIndex(i)}
                        className={`w-12 h-12 md:w-20 md:h-20 rounded md:rounded-lg cursor-pointer object-cover border-2 ${
                          currentImageIndex === i
                            ? "border-purple-500"
                            : "border-transparent"
                        }`}
                        alt={`View ${i + 1}`}
                      />
                    ))}
                  </div>

                  {/* Hall Details */}
                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <h4 className="font-semibold text-base md:text-lg mb-1.5">About this hall</h4>
                      <p className="text-gray-600 text-sm md:text-base">{modalHall.description}</p>
                    </div>

                    {/* Specifications */}
                    <div>
                      <h4 className="font-semibold mb-2">Specifications</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {modalHall.specifications?.map((spec, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <FontAwesomeIcon icon={spec.icon} className="text-gray-500 w-4 md:w-5" />
                            <div className="min-w-0">
                              <div className="text-xs md:text-sm text-gray-500 truncate">{spec.label}</div>
                              <div className="font-medium text-xs md:text-sm truncate">{spec.value}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Features */}
                    <div>
                      <h4 className="font-semibold mb-2">Features</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {modalHall.features?.map((feature, index) => (
                          <div key={index} className="flex items-center gap-1.5">
                            <FontAwesomeIcon 
                              icon={feature.icon}
                              className="text-purple-500 text-sm"
                            />
                            <span className="text-xs">{feature.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Amenities */}
                    <div>
                      <h4 className="font-semibold mb-2">Amenities</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {modalHall.amenitiesList?.map((amenity, index) => (
                          <span key={index} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN - PRICE CARD */}
                {bestOption && (
                  <div className="lg:sticky lg:top-6 border border-gray-300 rounded-lg md:rounded-xl p-3 md:p-5 h-fit shadow-sm">
                    <div className="space-y-3 md:space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center border border-purple-200">
                          <FontAwesomeIcon
                            icon={bestOption.eventType === 'Wedding' ? faGlassCheers : 
                                  bestOption.eventType === 'Conference' ? faDesktop :
                                  bestOption.eventType === 'Birthday Party' ? faBirthdayCake :
                                  bestOption.eventType === 'Seminar' ? faDesktop :
                                  bestOption.eventType === 'Training' ? faDesktop :
                                  bestOption.eventType === 'Baby Shower' ? faBirthdayCake :
                                  faCalendarAlt}
                            className="text-purple-600 text-sm"
                          />
                        </div>
                        <p className="font-semibold text-sm md:text-base">{bestOption.eventType}</p>
                      </div>
                      
                      <p className="text-xs md:text-sm text-gray-600">
                        {bestOption.capacity} • {bestOption.duration}
                      </p>

                      <div className="space-y-1.5 md:space-y-2">
                        {bestOption.benefits.map((b, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-1.5 text-xs md:text-sm"
                          >
                            <FontAwesomeIcon
                              icon={faCheck}
                              className="text-green-500 text-[10px] md:text-xs"
                            />
                            {b}
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 md:pt-4 border-t border-gray-300">
                        {bestOption.originalPrice && bestOption.originalPrice > bestOption.price && (
                          <>
                            <p className="line-through text-xs md:text-sm text-gray-400">
                              {formatPrice(bestOption.originalPrice)}
                            </p>
                            <p className="text-red-500 text-xs">
                              {bestOption.discount}
                            </p>
                          </>
                        )}
                        <p className="text-xl md:text-3xl font-bold mt-0.5 md:mt-1">
                          {formatPrice(bestOption.price)}
                        </p>
                        <p className="text-xs text-gray-500 mb-3 md:mb-4">
                          Per event package
                        </p>

                        <button
                          onClick={() => handleBookNow(modalHall, bestOption)}
                          className="w-full bg-[#06f49f] text-white py-2 md:py-3 rounded md:rounded-lg font-semibold hover:opacity-90 transition-opacity text-sm md:text-base"
                        >
                          Select This Hall
                        </button>
                      </div>

                      {/* All Pricing Options */}
                      {modalHall.pricing.length > 1 && (
                        <div className="pt-3 md:pt-4 border-t border-gray-300">
                          <h5 className="font-medium mb-2 text-sm md:text-base">Other Event Types</h5>
                          <div className="space-y-2">
                            {modalHall.pricing
                              .filter(opt => opt.id !== bestOption.id)
                              .map((option) => (
                                <div key={option.id} className="flex justify-between items-center p-1.5 md:p-2 bg-gray-50 rounded">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center border border-purple-200">
                                        <FontAwesomeIcon
                                          icon={option.eventType === 'Wedding' ? faGlassCheers : 
                                                option.eventType === 'Conference' ? faDesktop :
                                                option.eventType === 'Birthday Party' ? faBirthdayCake :
                                                option.eventType === 'Seminar' ? faDesktop :
                                                option.eventType === 'Training' ? faDesktop :
                                                option.eventType === 'Baby Shower' ? faBirthdayCake :
                                                faCalendarAlt}
                                          className="text-purple-600 text-xs"
                                        />
                                      </div>
                                      <p className="text-xs md:text-sm font-medium truncate">{option.eventType}</p>
                                    </div>
                                    <p className="text-xs text-gray-600 truncate">{option.capacity}</p>
                                  </div>
                                  <div className="text-right flex-shrink-0 ml-2">
                                    <p className="font-bold text-sm md:text-base">{formatPrice(option.price)}</p>
                                    <button
                                      onClick={() => handleBookNow(modalHall, option)}
                                      className="text-purple-600 text-xs md:text-sm font-medium hover:text-purple-800"
                                    >
                                      Select
                                    </button>
                                  </div>
                                </div>
                              ))
                            }
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default HallSelection;