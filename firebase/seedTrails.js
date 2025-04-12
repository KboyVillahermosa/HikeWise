import { collection, addDoc } from 'firebase/firestore';
import { db } from './config';
import { Alert } from 'react-native';

// Function to add a set of initial trails
export const seedTrails = async () => {
  try {
    const trailsCollection = collection(db, 'trails');
    
    const cebuTrails = [
      {
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
        imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/17/f8/61/85/received-2413139085598046.jpg?w=1200&h=1200&s=1"
      },
      {
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
        imageUrl: "https://steemitimages.com/DQmWvrxEyGBCvYrssGAc2AGfgkWJwTvJ9tpvYRQU4Ku1MMo/IMG_20180127_053224.jpg"
      },
      {
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
        imageUrl: "https://live.staticflickr.com/4500/37695261906_7337e6c1f8_b.jpg"
      },
      {
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
        imageUrl: "https://i.pinimg.com/originals/7e/a0/73/7ea0731c0041387c0c59f33faeecb225.jpg"
      },
      {
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
        imageUrl: "https://i0.wp.com/escapesanddiaries.com/wp-content/uploads/2018/01/IMG_9048.jpg?resize=1080%2C720&ssl=1"
      },
      {
        name: "Spartan Trail",
        location: "Cebu City",
        difficulty: "Moderate",
        description: "Spartan Trail is a popular hiking destination located in the hills of Cebu City. It offers a relatively challenging trek with beautiful views of the city skyline. The trail winds through lush forests and features interesting rock formations.",
        distance: 4.5,
        elevationGain: 400,
        estimatedTime: "3-4 hours",
        coordinates: {
          latitude: 10.3548, 
          longitude: 123.8895
        },
        averageRating: 4.4,
        ratingCount: 138,
        imageUrl: "https://i0.wp.com/www.followyouroad.com/wp-content/uploads/2017/07/Spartan-Trail-Cebu-15.jpg?ssl=1"
      },
      {
        name: "Sirao Peak",
        location: "Cebu City",
        difficulty: "Difficult",
        description: "Sirao Peak, also known as Mt. Kan-Irag, is one of the highest points in Cebu City. The trek offers challenging sections and diverse terrain, including dense forests and rocky paths. From the summit, hikers can enjoy spectacular views of the city and the sea.",
        distance: 8.0,
        elevationGain: 700,
        estimatedTime: "6-7 hours",
        coordinates: {
          latitude: 10.3928, 
          longitude: 123.9175
        },
        averageRating: 4.9,
        ratingCount: 76,
        imageUrl: "https://pbs.twimg.com/media/CV3zHPDU4AANgS2.jpg"
      },
      {
        name: "Bocaue Peak",
        location: "Badian, Cebu",
        difficulty: "Moderate",
        description: "Bocaue Peak offers stunning views of the southwestern coast of Cebu, including the famous Kawasan Falls. The trail passes through local villages and forested areas before reaching the scenic summit. It's a less crowded alternative to nearby peaks.",
        distance: 5.0,
        elevationGain: 450,
        estimatedTime: "4 hours",
        coordinates: {
          latitude: 9.7921, 
          longitude: 123.3755
        },
        averageRating: 4.2,
        ratingCount: 43,
        imageUrl: "https://1.bp.blogspot.com/-7hYkWVpNxUM/Wk-kBpMu-8I/AAAAAAAABHE/TndO03IrIQwAv5f6GqMPJUcI1GwmFJLlQCLcBGAs/s1600/bocaue%2Bpeak%2B%252812%2529.jpg"
      }
    ];
    
    // Add each trail to Firestore
    for (const trail of cebuTrails) {
      await addDoc(trailsCollection, trail);
    }
    
    console.log('Initial trails added successfully!');
    return true;
  } catch (error) {
    console.error('Error adding initial trails:', error);
    throw error;
  }
};