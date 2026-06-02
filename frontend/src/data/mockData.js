export const categories = [
  { id: 1, name: "Hotels", icon: "hotel", description: "Stay in luxury and comfort." },
  { id: 2, name: "Restaurants", icon: "restaurant", description: "Taste the local flavors." },
  { id: 3, name: "Tour Guides", icon: "guide", description: "Explore with experts." },
  { id: 4, name: "Vehicle Rentals", icon: "car", description: "Travel at your own pace." },
  { id: 5, name: "Boat Tours", icon: "boat", description: "Discover the ocean." },
  { id: 6, name: "Water Sports", icon: "sport", description: "Thrilling adventures." },
];

export const hotels = [
  {
    id: 1,
    name: "ABC Hotel",
    location: "Nilaveli",
    price: 50,
    rating: 4.8,
    description: "Luxury beachfront hotel offering premium amenities, stunning ocean views, and excellent service for an unforgettable stay.",
    facilities: ["Free Wi-Fi", "Swimming Pool", "Beach Access", "Restaurant", "Air Conditioning"],
    contact: { phone: "+94 77 123 4567", email: "info@abchotel.com" },
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 2,
    name: "XYZ Resort",
    location: "Uppuveli",
    price: 75,
    rating: 4.6,
    description: "A beautiful resort nestled in Uppuveli, perfect for relaxation and exploring the pristine beaches.",
    facilities: ["Spa", "Bar", "Pool", "Free Breakfast", "Wi-Fi"],
    contact: { phone: "+94 77 987 6543", email: "booking@xyzresort.com" },
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 3,
    name: "Trinco Blu by Cinnamon",
    location: "Uppuveli",
    price: 120,
    rating: 4.9,
    description: "A retro-chic hotel designed for the modern explorer, offering unforgettable experiences in Trincomalee.",
    facilities: ["Scuba Diving", "Whale Watching", "Restaurants", "Pool", "Gym"],
    contact: { phone: "+94 26 222 2307", email: "trincoblu@cinnamonhotels.com" },
    image: "https://images.unsplash.com/photo-1542314831-c6a420325142?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  }
];

export const userProfile = {
  name: "John Doe",
  email: "johndoe@example.com",
  phone: "+94 77 111 2222",
  address: "123 Palm Street, Colombo",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
  joinDate: "January 2024"
};

export const userBookings = [
  {
    id: "BKG-001",
    serviceName: "ABC Hotel",
    serviceType: "Hotel",
    checkIn: "2024-06-15",
    checkOut: "2024-06-18",
    guests: 2,
    totalPrice: 150,
    status: "Approved",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "BKG-002",
    serviceName: "Boat Tour Adventure",
    serviceType: "Boat Tour",
    checkIn: "2024-06-20",
    checkOut: "2024-06-20",
    guests: 2,
    totalPrice: 40,
    status: "Pending",
    image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "BKG-003",
    serviceName: "XYZ Resort",
    serviceType: "Hotel",
    checkIn: "2024-05-10",
    checkOut: "2024-05-12",
    guests: 4,
    totalPrice: 150,
    status: "Rejected",
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
  }
];

export const userBookingHistory = [
  {
    id: "BKG-004",
    serviceName: "Seafood Restaurant Table",
    serviceType: "Restaurant",
    checkIn: "2023-12-05",
    checkOut: "2023-12-05",
    guests: 2,
    totalPrice: 35,
    status: "Approved"
  },
  {
    id: "BKG-005",
    serviceName: "Whale Watching Excursion",
    serviceType: "Tour",
    checkIn: "2023-11-20",
    checkOut: "2023-11-20",
    guests: 1,
    totalPrice: 50,
    status: "Approved"
  }
];
