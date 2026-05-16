import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Javari App Builder — Build Monetizable Apps with AI',
  description: 'The most capable AI app builder. Build, monetize, and deploy any app with 300+ AI models. Free to start.',
  keywords: ['app builder', 'AI', 'no-code', 'monetization', 'SaaS'],
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}