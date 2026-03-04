import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "@/lib/leaflet-fix";

type MarkerItem = {
  position: [number, number];
  title: string;
  subtitle?: string;
};

type Props = {
  center: [number, number];
  zoom?: number;
  markers: MarkerItem[];
  className?: string;
  scrollWheelZoom?: boolean;
};

export default function MapView({
  center,
  zoom = 12,
  markers,
  className = "rounded-xl overflow-hidden border border-border bg-muted/50 aspect-[16/9]",
  scrollWheelZoom = false,
}: Props) {
  return (
    <div className={className}>
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} scrollWheelZoom={scrollWheelZoom}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((m, i) => (
          <Marker key={i} position={m.position}>
            {m.title || m.subtitle ? (
              <Popup>
                <div className="text-sm font-medium">
                  {m.title}
                  {m.subtitle ? <div className="text-xs text-muted-foreground">{m.subtitle}</div> : null}
                </div>
              </Popup>
            ) : null}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
