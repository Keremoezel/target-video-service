/**
 * /api/video-url/:id
 *
 * Bu endpoint chaos middleware'inden GECIYOR!
 * - Kill   → 503 döner, video açılmaz
 * - Delay  → response N ms geç gelir, player loading spinner gösterir
 * - Error  → %rate ihtimalle 500 döner, video hata verir
 */

const VIDEO_URLS: Record<string, string> = {
  '1': 'https://media.w3.org/2010/05/bunny/trailer.mp4',            // Big Buck Bunny trailer — W3C
  '2': 'https://media.w3.org/2010/05/sintel/trailer.mp4',           // Sintel trailer — W3C
  '3': 'https://vjs.zencdn.net/v/oceans.mp4',                       // Oceans — VideoJS CDN
  '4': 'https://media.w3.org/2010/05/video/movie_300.mp4',          // Short film — W3C
  '5': 'https://www.w3schools.com/html/mov_bbb.mp4',                // Big Buck Bunny — W3Schools
  '6': 'https://media.w3.org/2010/05/bunny/movie.mp4',              // Big Buck Bunny full — W3C
  '7': 'https://media.w3.org/2010/05/sintel/movie.mp4',             // Sintel full — W3C
  '8': 'https://media.w3.org/2010/05/video/movie_300.webm',         // WebM test — W3C
}

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  const url = VIDEO_URLS[id ?? '']

  if (!url) {
    setResponseStatus(event, 404)
    return { error: 'Video not found' }
  }

  return {
    id,
    url,
    resolvedAt: new Date().toISOString(),
  }
})
