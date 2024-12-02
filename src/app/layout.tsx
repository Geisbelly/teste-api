// app/layout.tsx (ou app/layout.js)
import React from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>My Next.js App</title>
        {/* Adicione outras tags <head> conforme necessário */}
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
