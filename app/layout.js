import './globals.css';

export const metadata = {
  title: 'Boko Digital — AI Social Script Generator',
  description:
    'Analyze 3 Instagram competitors and generate 10 ready-to-shoot social video scripts. By Boko Digital — Strategize. Execute. Deliver.',
};

// Boko icon mark (green arrow) — used in the header, brand-correct colours only.
function BokoMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect width="48" height="48" rx="10" fill="#000000" />
      <path
        d="M14 34V14h9.5c4.4 0 7.2 2.3 7.2 5.9 0 2.4-1.3 4-3.3 4.7 2.5.6 4.1 2.4 4.1 5.1 0 3.9-3 6.3-7.8 6.3H14Z"
        fill="#BFFC00"
      />
      <path d="M30 14l4 6-4 6" stroke="#BFFC00" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="wrap brand">
            <BokoMark />
            <span className="brand-name">boko<span className="dot">.</span></span>
          </div>
        </header>
        {children}
        <footer className="site-footer">
          <div className="wrap">
            <p><span className="lime">Strategize. Execute. Deliver.</span></p>
            <p style={{ marginTop: 6 }}>© {new Date().getFullYear()} Boko Digital. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
