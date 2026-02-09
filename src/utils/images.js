// src/utils/images.js
export const fallbackImages = {
  hotel: {
    main: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
    room: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80",
    shortlet: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w-800&q=80"
  }
};

export const getSafeImage = (imageUrl, type = 'hotel') => {
  if (!imageUrl || imageUrl === 'null' || imageUrl === 'undefined') {
    return fallbackImages.hotel[type] || fallbackImages.hotel.main;
  }
  
  // Check if URL is valid
  try {
    new URL(imageUrl);
    return imageUrl;
  } catch {
    return fallbackImages.hotel[type] || fallbackImages.hotel.main;
  }
};

export const ensureImageUrls = (data) => {
  if (!data) return data;
  
  // Deep copy to avoid mutation
  const processed = JSON.parse(JSON.stringify(data));
  
  // Process hotel image
  if (processed.hotel) {
    processed.hotel.image = getSafeImage(processed.hotel.image, 'main');
  }
  
  // Process room image
  if (processed.room) {
    processed.room.image = getSafeImage(processed.room.image, 'room');
    
    // Process room images array if exists
    if (processed.room.images && Array.isArray(processed.room.images)) {
      processed.room.images = processed.room.images.map(img => getSafeImage(img, 'room'));
    }
  }
  
  // Process vendor data if exists
  if (processed.vendorData) {
    processed.vendorData.image = getSafeImage(processed.vendorData.image, 'main');
    
    if (processed.vendorData.selectedRoom?.image) {
      processed.vendorData.selectedRoom.image = getSafeImage(
        processed.vendorData.selectedRoom.image, 
        'room'
      );
    }
  }
  
  return processed;
};