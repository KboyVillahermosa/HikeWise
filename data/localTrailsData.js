const trailsData = [
  {
    id: '1',
    name: "Osmeña Peak",
    location: "Dalaguete, Cebu",
    difficulty: "Moderate",
    description: "Osmeña Peak is the highest point in Cebu Island at about 1,013 meters above sea level. It's known for its unique jagged hills and breathtaking views of Cebu's southern coastline. The trail is relatively easy and suitable for beginners.",
    distance: 3.5,
    elevationGain: 350,
    estimatedTime: "2-3 hours",
    coordinates: {
      latitude: 9.8296,
      longitude: 123.4097
    },
    averageRating: 4.8,
    ratingCount: 156,
    // Use require for local images
    imageUrl: require('../assets/images/spot1.webp')
  },
  {
    id: '2',
    name: "Casino Peak",
    location: "Dalaguete, Cebu",
    difficulty: "Moderate",
    description: "Casino Peak, also known as Lugsangan Peak, offers panoramic views of the jagged hills of Dalaguete and the surrounding islands. It's a short hike that rewards with stunning 360-degree views, especially at sunrise.",
    distance: 1.5,
    elevationGain: 250,
    estimatedTime: "1-2 hours",
    coordinates: {
      latitude: 9.8397, 
      longitude: 123.4152
    },
    averageRating: 4.6,
    ratingCount: 87,
    imageUrl: require('../assets/images/spot1.webp')
  },
  {
    id: '3',
    name: "Mt. Naupa",
    location: "Naga, Cebu",
    difficulty: "Easy",
    description: "Mt. Naupa is a popular hiking destination in Naga City. It features a small, grassy summit with sweeping views of the surrounding mountains and Cebu City in the distance. This is an ideal spot for camping and stargazing.",
    distance: 2.0,
    elevationGain: 200,
    estimatedTime: "1-1.5 hours",
    coordinates: {
      latitude: 10.2153, 
      longitude: 123.7594
    },
    averageRating: 4.3,
    ratingCount: 112,
    imageUrl: require('../assets/images/spot1.webp')
  },
  {
    id: '4',
    name: "Kandungaw Peak",
    location: "Dalaguete, Cebu",
    difficulty: "Difficult",
    description: "Kandungaw Peak, also known as the 'Crown of Cebu South', offers breathtaking views of rugged limestone formations and verdant valleys. The trail involves steep ascents and requires some rock scrambling, making it suitable for more experienced hikers.",
    distance: 6.0,
    elevationGain: 650,
    estimatedTime: "5-6 hours",
    coordinates: {
      latitude: 9.7752, 
      longitude: 123.4052
    },
    averageRating: 4.7,
    ratingCount: 93,
    imageUrl: require('../assets/images/spot1.webp')
  },
  {
    id: '5',
    name: "Mt. Mago",
    location: "Carmen, Cebu",
    difficulty: "Easy",
    description: "Mt. Mago is known for being the tri-boundary of Danao, Carmen, and Tuburan in northern Cebu. It features a gentle trail through farmlands and forests, making it perfect for beginners. The summit offers scenic views of rolling hills and the surrounding countryside.",
    distance: 3.0,
    elevationGain: 200,
    estimatedTime: "2 hours",
    coordinates: {
      latitude: 10.5913, 
      longitude: 123.9163
    },
    averageRating: 4.1,
    ratingCount: 65,
    imageUrl: require('../assets/images/spot1.webp')
  }
];

export const getLocalTrails = () => {
  return trailsData;
};

export const getLocalTopRatedTrails = (count = 3) => {
  return [...trailsData]
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, count);
};

export default trailsData;