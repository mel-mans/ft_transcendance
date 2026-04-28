import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Globe } from 'lucide-react';

// All 42 Network campuses worldwide
const campuses = [
  // Morocco - 1337
  { name: '1337 Ben Guerir', lng: -7.9290, lat: 32.2342, country: 'Morocco' },
  { name: '1337 Khouribga', lng: -6.9063, lat: 32.8793, country: 'Morocco' },
  { name: '1337 Med (Tetouan)', lng: -5.3684, lat: 35.5785, country: 'Morocco' },
  // France
  { name: '42 Paris', lng: 2.3488, lat: 48.8966, country: 'France' },
  { name: '42 Lyon', lng: 4.8357, lat: 45.7640, country: 'France' },
  { name: '42 Nice', lng: 7.2620, lat: 43.7102, country: 'France' },
  { name: '42 Perpignan', lng: 2.8954, lat: 42.6887, country: 'France' },
  { name: '42 Angoulême', lng: 0.1534, lat: 45.6485, country: 'France' },
  { name: '42 Le Havre', lng: 0.1079, lat: 49.4944, country: 'France' },
  { name: '42 Mulhouse', lng: 7.3359, lat: 47.7508, country: 'France' },
  // Europe
  { name: '42 Lisboa', lng: -9.1393, lat: 38.7223, country: 'Portugal' },
  { name: '42 Porto', lng: -8.6291, lat: 41.1579, country: 'Portugal' },
  { name: '42 Madrid', lng: -3.7038, lat: 40.4168, country: 'Spain' },
  { name: '42 Málaga', lng: -4.4214, lat: 36.7213, country: 'Spain' },
  { name: '42 Barcelona', lng: 2.1734, lat: 41.3851, country: 'Spain' },
  { name: '42 Urduliz', lng: -2.9619, lat: 43.3773, country: 'Spain' },
  { name: '42 Roma', lng: 12.4964, lat: 41.9028, country: 'Italy' },
  { name: '42 Firenze', lng: 11.2558, lat: 43.7696, country: 'Italy' },
  { name: '42 Milano', lng: 9.1900, lat: 45.4642, country: 'Italy' },
  { name: '42 Berlin', lng: 13.4050, lat: 52.5200, country: 'Germany' },
  { name: '42 Heilbronn', lng: 9.2189, lat: 49.1427, country: 'Germany' },
  { name: '42 Wolfsburg', lng: 10.7865, lat: 52.4227, country: 'Germany' },
  { name: '42 Vienna', lng: 16.3738, lat: 48.2082, country: 'Austria' },
  { name: '42 Prague', lng: 14.4378, lat: 50.0755, country: 'Czech Republic' },
  { name: '42 Warsaw', lng: 21.0122, lat: 52.2297, country: 'Poland' },
  { name: '42 Lausanne', lng: 6.6323, lat: 46.5197, country: 'Switzerland' },
  { name: '42 Brussels', lng: 4.3517, lat: 50.8503, country: 'Belgium' },
  { name: '42 Amsterdam', lng: 4.9041, lat: 52.3676, country: 'Netherlands' },
  { name: '42 London', lng: -0.1276, lat: 51.5074, country: 'UK' },
  { name: '42 Helsinki', lng: 24.9384, lat: 60.1699, country: 'Finland' },
  // Asia
  { name: '42 Tokyo', lng: 139.6917, lat: 35.6895, country: 'Japan' },
  { name: '42 Seoul', lng: 126.9780, lat: 37.5665, country: 'South Korea' },
  { name: '42 Gyeongsan', lng: 128.7412, lat: 35.8255, country: 'South Korea' },
  { name: '42 Bangkok', lng: 100.5018, lat: 13.7563, country: 'Thailand' },
  { name: '42 Kuala Lumpur', lng: 101.6869, lat: 3.1390, country: 'Malaysia' },
  { name: '42 Singapore', lng: 103.8198, lat: 1.3521, country: 'Singapore' },
  { name: '42 Abu Dhabi', lng: 54.3773, lat: 24.4539, country: 'UAE' },
  { name: '42 Yerevan', lng: 44.5152, lat: 40.1792, country: 'Armenia' },
  { name: '42 Istanbul', lng: 28.9784, lat: 41.0082, country: 'Turkey' },
  { name: '42 Amman', lng: 35.9456, lat: 31.9566, country: 'Jordan' },
  // Americas
  { name: '42 Silicon Valley', lng: -122.0322, lat: 37.4220, country: 'USA' },
  { name: '42 Rio', lng: -43.1729, lat: -22.9068, country: 'Brazil' },
  { name: '42 São Paulo', lng: -46.6333, lat: -23.5505, country: 'Brazil' },
  { name: '42 Belo Horizonte', lng: -43.9378, lat: -19.9167, country: 'Brazil' },
  { name: '42 Quebec', lng: -71.2082, lat: 46.8139, country: 'Canada' },
  // Africa & Oceania
  { name: '42 Adelaide', lng: 138.6007, lat: -34.9285, country: 'Australia' },
  { name: '42 Antananarivo', lng: 47.5079, lat: -18.8792, country: 'Madagascar' },
];

// Sample house listings (placeholder data)
const listings = [
  { name: 'Apartment near Ben Guerir', lng: -7.9150, lat: 32.2400, price: '2500 MAD/month' },
  { name: 'Shared House Khouribga', lng: -6.9200, lat: 32.8850, price: '1800 MAD/month' },
  { name: 'Studio Tetouan Center', lng: -5.3600, lat: 35.5700, price: '3000 MAD/month' },
];

// Custom campus icon - retro style
const createCampusIcon = () => {
  return L.divIcon({
    className: 'custom-campus-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background: #00ff00;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 8px;
        color: #0a0a0a;
        border: 2px solid #00ff00;
        font-family: 'Courier New', monospace;
      ">42</div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

// Custom listing icon - retro style
const createListingIcon = () => {
  return L.divIcon({
    className: 'custom-listing-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background: #ff00ff;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #0a0a0a;
        border: 2px solid #ff00ff;
        font-family: 'Courier New', monospace;
        font-size: 14px;
      ">🏠</div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const MapSection = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const collapseTimer = useRef<number | null>(null);
  const isHovering = useRef(false);
  const isPointerDown = useRef(false);

  const clearCollapseTimer = () => {
    if (collapseTimer.current) {
      window.clearTimeout(collapseTimer.current);
      collapseTimer.current = null;
    }
  };

  const expand = () => {
    clearCollapseTimer();
    setIsExpanded(true);
  };

  const scheduleCollapse = () => {
    clearCollapseTimer();
    collapseTimer.current = window.setTimeout(() => {
      if (!isPointerDown.current) setIsExpanded(false);
    }, 300);
  };

  const handleEnter = () => {
    isHovering.current = true;
    expand();
  };

  const handleLeave = () => {
    isHovering.current = false;
    if (isPointerDown.current) return;
    scheduleCollapse();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isPointerDown.current = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    expand();
  };

  const handlePointerUp = () => {
    isPointerDown.current = false;
    if (!isHovering.current) scheduleCollapse();
  };

  useEffect(() => {
    return () => clearCollapseTimer();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map with dark tiles
    map.current = L.map(mapContainer.current, {
      center: [30, 10],
      zoom: 2,
      zoomControl: false,
    });

    // Add dark tile layer (CartoDB Dark Matter - free, no API key)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map.current);

    // Add zoom control to top right
    L.control.zoom({ position: 'topright' }).addTo(map.current);

    const campusIcon = createCampusIcon();
    const listingIcon = createListingIcon();

    // Add campus markers
    campuses.forEach((campus) => {
      L.marker([campus.lat, campus.lng], { icon: campusIcon })
        .addTo(map.current!)
        .bindPopup(`
          <div style="padding: 8px; background: #0a0a0a; color: #00ff00; font-family: 'Courier New', monospace; border: 2px solid #00ff00;">
            <h3 style="font-weight: bold; font-size: 12px; margin: 0 0 4px 0;">[${campus.name}]</h3>
            <p style="font-size: 10px; color: #00ffff; margin: 0;">> ${campus.country}</p>
          </div>
        `);
    });

    // Add listing markers
    listings.forEach((listing) => {
      L.marker([listing.lat, listing.lng], { icon: listingIcon })
        .addTo(map.current!)
        .bindPopup(`
          <div style="padding: 8px; background: #0a0a0a; color: #ff00ff; font-family: 'Courier New', monospace; border: 2px solid #ff00ff;">
            <h3 style="font-weight: bold; font-size: 12px; margin: 0 0 4px 0;">[${listing.name}]</h3>
            <p style="font-size: 10px; color: #00ff00; font-weight: 600; margin: 0;">$ ${listing.price}</p>
          </div>
        `);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isExpanded || !map.current) return;

    // Leaflet needs a size recalculation after CSS transitions.
    const id1 = window.setTimeout(() => map.current?.invalidateSize(), 60);
    const id2 = window.setTimeout(() => map.current?.invalidateSize(), 520);

    return () => {
      window.clearTimeout(id1);
      window.clearTimeout(id2);
    };
  }, [isExpanded]);

  return (
    <section className="py-12 px-6">
      <div className="container mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-block retro-border bg-card px-6 py-3 mb-6">
            <h2 className="text-2xl md:text-3xl font-bold uppercase flex items-center gap-3">
              <Globe className="w-6 h-6 text-accent" />
              <span>42 World Map</span>
              <Globe className="w-6 h-6 text-accent" />
            </h2>
          </div>
          <p className="text-muted-foreground">
            {">> "}Find available rooms near all 42 Network campuses worldwide
          </p>
        </div>

        {/* Legend - clean style */}
        <div className="flex justify-center gap-4 mb-6">
          <div className="retro-border bg-card px-4 py-2 flex items-center gap-3">
            <div className="w-5 h-5 bg-primary border-2 border-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-[7px]">42</span>
            </div>
            <span className="text-sm text-primary font-mono">Campus</span>
          </div>
          <div className="retro-border bg-card px-4 py-2 flex items-center gap-3">
            <div className="w-5 h-5 bg-secondary border-2 border-secondary flex items-center justify-center">
              <span className="text-xs">🏠</span>
            </div>
            <span className="text-sm text-secondary font-mono">Listing</span>
          </div>
        </div>

        {/* Map container */}
        <div className="w-full flex flex-col items-center gap-3">
          <div className="w-full flex justify-center">
            <div
              className={`
                relative overflow-hidden retro-border bg-card
                transition-all duration-300 ease-out cursor-pointer
                ${isExpanded
                  ? 'w-full max-w-5xl aspect-[16/9]'
                  : 'w-16 sm:w-20 h-16 sm:h-20 [&_.leaflet-control-container]:hidden'
                }
              `}
              onPointerEnter={handleEnter}
              onPointerLeave={handleLeave}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <div ref={mapContainer} className="h-full w-full" />
              {!isExpanded && (
                <>
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-card pointer-events-none">
                    <MapPin className="w-8 h-8 text-primary" />
                    <span className="mt-1 text-[10px] font-bold text-primary">[HOVER]</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {!isExpanded && (
            <p className="text-xs text-secondary">{">>> "}Hover to explore{"<<<"}</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default MapSection;
