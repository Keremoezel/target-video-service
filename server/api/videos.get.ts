const VIDEOS = [
  {
    id: '1',
    title: 'Into the Abyss',
    description: 'A deep-sea exploration documentary following marine biologists into the Mariana Trench.',
    category: 'Documentary',
    duration: '1h 42m',
    year: 2024,
    rating: 8.7,
    thumbnail: 'https://images.unsplash.com/photo-1551244072-5d12893278ab?w=640&h=360&fit=crop',
    views: 142800,
    // Public domain — Big Buck Bunny (Blender Foundation)
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  },
  {
    id: '2',
    title: 'Neon District',
    description: 'Cyberpunk noir thriller set in a rain-soaked megacity where AI controls everything.',
    category: 'Sci-Fi',
    duration: '2h 15m',
    year: 2025,
    rating: 9.1,
    thumbnail: 'https://images.unsplash.com/photo-1515705576963-95cad62945b6?w=640&h=360&fit=crop',
    views: 389200,
    // Elephant Dream
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  },
  {
    id: '3',
    title: 'The Last Frequency',
    description: 'Radio operators discover a signal from an abandoned space station still broadcasting.',
    category: 'Thriller',
    duration: '1h 58m',
    year: 2024,
    rating: 7.9,
    thumbnail: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=640&h=360&fit=crop',
    views: 98500,
    // For Bigger Blazes
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  {
    id: '4',
    title: 'Concrete & Light',
    description: 'Visual essay on brutalist architecture across Eastern European cities.',
    category: 'Art House',
    duration: '1h 12m',
    year: 2023,
    rating: 8.3,
    thumbnail: 'https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a?w=640&h=360&fit=crop',
    views: 54300,
    // For Bigger Escapes
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  },
  {
    id: '5',
    title: 'Zero Gravity',
    description: 'Training footage and personal diaries of astronauts preparing for the Mars mission.',
    category: 'Documentary',
    duration: '2h 05m',
    year: 2025,
    rating: 9.4,
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=640&h=360&fit=crop',
    views: 721000,
    // Subaru Outback
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
  },
  {
    id: '6',
    title: 'Analog Heart',
    description: 'A musician rebuilds vintage synthesizers while processing grief and loss.',
    category: 'Drama',
    duration: '1h 35m',
    year: 2024,
    rating: 8.1,
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=640&h=360&fit=crop',
    views: 67200,
    // Volkswagen Golf
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
  },
  {
    id: '7',
    title: 'Desert Protocol',
    description: 'A lone engineer maintains the last server farm in a post-collapse world.',
    category: 'Sci-Fi',
    duration: '1h 50m',
    year: 2025,
    rating: 8.6,
    thumbnail: 'https://images.unsplash.com/photo-1494778752932-64ee27ba2f37?w=640&h=360&fit=crop',
    views: 212000,
    // WeAreGoing
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
  },
  {
    id: '8',
    title: 'The Archive',
    description: 'Historians digitize the last surviving films of a forgotten silent era director.',
    category: 'Drama',
    duration: '1h 28m',
    year: 2023,
    rating: 7.5,
    thumbnail: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=640&h=360&fit=crop',
    views: 43100,
    // Tears of Steel
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  },
]

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const category = query.category as string | undefined

  let filtered = VIDEOS
  if (category && category !== 'all') {
    filtered = VIDEOS.filter(v => v.category.toLowerCase() === category.toLowerCase())
  }

  return {
    videos: filtered,
    total: filtered.length,
    categories: [...new Set(VIDEOS.map(v => v.category))],
    timestamp: new Date().toISOString(),
  }
})
