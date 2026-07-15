import "./globals.css";

export const metadata = {
  title: "CasaIA — Tu asistente para cualquier problema del hogar",
  description:
    "Asistente con IA que te ayuda a diagnosticar y resolver problemas del hogar: calefacción, plomería, electricidad, electrodomésticos y más.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@600;700&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
