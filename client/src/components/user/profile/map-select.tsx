import { useEffect, useState, useRef } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import L from "leaflet";


const redIcon = L.icon({
  iconUrl: "https://cdn4.iconfinder.com/data/icons/small-n-flat/24/map-marker-512.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [41, 41],
});
type AddressDetails = {
  houseNumber?: string;
  road?: string;
  suburb?: string;
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
};

export default function MapSelect({
  position,
  onPositionChange,
  onAddressChange,
}: {
  position: [number, number]
  onPositionChange: (position: [number, number]) => void;
  onAddressChange: (address: AddressDetails) => void;
}) {
  const debounceTime = 300;
  const [query, setQuery] = useState("");
  const [centerPosition, setCenterPosition] = useState<[number, number] | null>(null);
  const [searchMarker, setSearchMarker] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<{
    display_name: string;
    lat: number;
    lon: number;
  }[]>([]);
  const debounceTimeoutRef = useRef<number | null>(null);
  const LocationSelector = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        onPositionChange([lat, lng]);
      },
    });
    return null;
  };
  const MapUpdater = ({ center }: { center: [number, number] | null }) => {
    const map = useMap();
    useEffect(() => {
      if (center) {
        map.setView(center, 15);
      }
    }, [center, map]);
    return null;
  };
  const fetchSuggestions = async (searchQuery: string) => {
    const encodedQuery = encodeURIComponent(searchQuery);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&addressdetails=1&limit=5`
    );
    const data = await response.json();
    setSuggestions(data);
  };

  const handleSearchChange = (value: string) => {
    setQuery(value);
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = window.setTimeout(() => {
      fetchSuggestions(value);
    }, debounceTime);
  };
  const handleSearch = async () => {
    setSuggestions([]);
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&addressdetails=1&limit=1`
    );
    const data = await response.json();
    if (data.length > 0) {
      setCenterPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      setQuery(data[0].display_name);
      setSearchMarker([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
    }
  }
  const handleClear = () => {
    setQuery("");
    setCenterPosition(null);
    setSearchMarker(null);
    setSuggestions([]);
  }
  useEffect(() => {
    if (!(position[0] === 0 && position[1] === 0)){
      setIsLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onPositionChange([latitude, longitude]);
      },
      (error) => {
        console.error("Error fetching current position:", error);
        toast.error("Unable to fetch your location. Please check your permissions.");
      }
    );
    return () => {
      setIsLoading(false);
    }
  }, [position]);

  useEffect(() => {
    if (position[0] === 0 && position[1] === 0) return;
    const [lat, lng] = position;
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      .then((response) => response.json())
      .then((data) => {
        const details: AddressDetails = {
          houseNumber: data.address?.house_number,
          road: data.address?.road,
          suburb: data.address?.suburb,
          city: data.address?.city || data.address?.town || data.address?.village,
          state: data.address?.state,
          country: data.address?.country,
          postcode: data.address?.postcode,
        };
        onAddressChange(details);
      })
      .catch((error) => {
        console.error("Error fetching address:", error);
        toast.error("Unable to fetch the address. Please try again.");
      });
  }, [position[0], position[1]]);

  if (isLoading) {
    return <Skeleton className="h-[60vh] w-full" />;
  }
  return (
    <>
      <div className="relative w-full flex flex-row items-center gap-2 z-50">
        <Input
          className="w-[70%] p-2"
          type="text"
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearchChange(e.target.value)}
          placeholder="Search for an address"
        />
        <Button 
          className="bg-sky-300"
          type="button"
          onClick={handleSearch}
        >
          Search        
        </Button>
        <Button 
          className="bg-red-300"
          type="button" 
          onClick={handleClear}
        >
          Clear
        </Button>
        {suggestions.length > 0 && (
          <div className="absolute top-[105%] left-0 w-[70%] shadow-md bg-slate-100 rounded-md p-2">
            <div className="flex flex-col gap-2">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setQuery(suggestion.display_name);
                    setSuggestions([]);
                  }}
                  className="cursor-pointer hover:bg-gray-200 p-1 rounded"
                >
                  {suggestion.display_name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="z-10">
        <MapContainer  center={position} zoom={30} className="h-[60vh] w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationSelector />
          <MapUpdater center={centerPosition} />
          <Marker position={position}>
            <Popup>Your Chosen Position</Popup>
          </Marker>
          {searchMarker && (
            <Marker position={searchMarker} icon={redIcon}>
              <Popup>Search Result</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </>
  );
}
