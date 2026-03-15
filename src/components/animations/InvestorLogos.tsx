"use client";

const logos = [
  "Desjardins",
  "National Bank",
  "CDPQ",
  "PSP Investments",
  "UBS",
  "RBC",
  "BMO",
  "TD",
  "CIBC",
  "Manulife",
  "Sun Life",
];

export function InvestorLogos() {
  return (
    <div className="w-full overflow-hidden bg-white py-8">
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .marquee-container {
          display: flex;
          animation: marquee 30s linear infinite;
        }

        .marquee-container:hover {
          animation-play-state: paused;
        }

        .logo-item {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 180px;
          padding: 0 20px;
          color: #9ca3af;
          font-weight: 600;
          font-size: 14px;
          letter-spacing: 0.5px;
          transition: color 0.3s ease;
        }

        .logo-item:hover {
          color: #4285f4;
        }
      `}</style>

      <div className="marquee-container">
        {/* First set */}
        {logos.map((logo, idx) => (
          <div key={`logo-1-${idx}`} className="logo-item">
            {logo}
          </div>
        ))}

        {/* Duplicate for seamless loop */}
        {logos.map((logo, idx) => (
          <div key={`logo-2-${idx}`} className="logo-item">
            {logo}
          </div>
        ))}
      </div>
    </div>
  );
}