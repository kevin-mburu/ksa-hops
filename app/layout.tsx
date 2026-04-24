import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'KSA Hops Programme — CS Visit Registration',
  description: 'Kenya School of Agriculture — Register for Cabinet Secretary visit to the UK',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "'Segoe UI', system-ui, sans-serif", background: '#f5f3ef' }}>
        {children}
      </body>
    </html>
  )
}
