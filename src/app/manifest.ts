import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'My Shelf',
    short_name: 'Shelf',
    description: 'Securely store, access, and share your files with My Shelf.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f0f0f0',
    theme_color: '#0070f3',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}