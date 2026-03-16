'use client';

export function InvestorLogos() {
  const brands = [
    'Blackstone',
    'Apollo',
    'Bridgewater',
    'Two Sigma',
    'Citadel',
    'Millennium',
    'Jane Street',
    'Qiwi Capital',
    'Hexagon Capital',
    'Radcliffe Capital',
  ];

  return (
    <div className="overflow-hidden bg-white py-8 md:py-12">
      <div className="flex overflow-x-hidden">
        <div className="flex gap-12 md:gap-16 animate-marquee">
          {[...brands, ...brands].map((brand, idx) => (
            <div
              key={idx}
              className="whitespace-nowrap text-slate-500 text-sm md:text-base font-medium flex-shrink-0"
            >
              {brand}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}