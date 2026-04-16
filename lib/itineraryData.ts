export type ItineraryStop = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  questions: string[];
  camera?: {
    zoom?: number;
    pitch?: number;
    bearing?: number;
    durationMs?: number;
  };
};

export type Itinerary = {
  city: {
    name: string;
    lat: number;
    lng: number;
  };
  stops: ItineraryStop[];
};
