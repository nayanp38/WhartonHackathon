import { tripConfigSchema, type TripConfig } from "@/lib/tripSchema";

export type TripPreset = {
  id: string;
  title: string;
  tagline: string;
  routeLabel: string;
  config: TripConfig;
};

const ROME_RAW = {
  flight: {
    origin: { name: "New York City", lat: 40.7128, lng: -74.006 },
    destination: { name: "Rome", lat: 41.9028, lng: 12.4964 },
  },
  stops: [
    {
      id: "rome-classic-1",
      name: "Trevi Fountain",
      lat: 41.9009,
      lng: 12.4833,
      type: "landmark",
      questions: [
        "How crowded did it feel?",
        "Was it worth visiting?",
        "What should another traveler know before going?",
      ],
      camera: { zoom: 14.35, bearing: -12, durationMs: 2100 },
    },
    {
      id: "rome-classic-2",
      name: "Pantheon",
      lat: 41.8986,
      lng: 12.4769,
      type: "landmark",
      questions: [
        "How impressive was it in person?",
        "Did it feel rushed or easy to explore?",
        "Would you recommend it to a first-time visitor?",
      ],
    },
    {
      id: "rome-classic-3",
      name: "Trastevere Dinner",
      lat: 41.8897,
      lng: 12.4708,
      type: "restaurant",
      questions: [
        "How was the food overall?",
        "Did the area feel touristy or authentic?",
        "Would you go back or recommend a reservation?",
      ],
    },
    {
      id: "rome-classic-4",
      name: "Colosseum",
      lat: 41.8902,
      lng: 12.4922,
      type: "historic-site",
      questions: [
        "Did it live up to expectations?",
        "Was the crowd level manageable?",
        "What is one tip for future travelers?",
      ],
      camera: { zoom: 14.55, pitch: 58, bearing: 25, durationMs: 2600 },
    },
  ],
} as const;

const PARIS_RAW = {
  flight: {
    origin: { name: "San Francisco", lat: 37.7749, lng: -122.4194 },
    destination: { name: "Paris", lat: 48.8566, lng: 2.3522 },
  },
  stops: [
    {
      id: "paris-lights-1",
      name: "Eiffel Tower",
      lat: 48.8584,
      lng: 2.2945,
      type: "landmark",
      questions: [
        "How did the scale feel up close?",
        "Was the wait or crowds worth it?",
        "Best time of day you would suggest?",
      ],
      camera: { zoom: 14.65, pitch: 52, bearing: -38, durationMs: 2400 },
    },
    {
      id: "paris-lights-2",
      name: "Louvre Museum",
      lat: 48.8606,
      lng: 2.3376,
      type: "museum",
      questions: [
        "What stood out most in the collection?",
        "Did you need more time or was half a day enough?",
        "One tip for someone visiting for the first time?",
      ],
    },
    {
      id: "paris-lights-3",
      name: "Seine Riverside Walk",
      lat: 48.8534,
      lng: 2.3488,
      type: "walk",
      questions: [
        "How did the atmosphere feel along the water?",
        "Any favorite bridge or viewpoint?",
        "Would you do this walk again at night?",
      ],
    },
    {
      id: "paris-lights-4",
      name: "Sacré-Cœur & Montmartre",
      lat: 48.8867,
      lng: 2.3431,
      type: "landmark",
      questions: [
        "How was the view from the steps?",
        "Did the neighborhood feel authentic or touristy?",
        "Worth the climb for future travelers?",
      ],
      camera: { zoom: 14.4, bearing: 15, durationMs: 2200 },
    },
  ],
} as const;

const TOKYO_RAW = {
  flight: {
    origin: { name: "Los Angeles", lat: 34.0522, lng: -118.2437 },
    destination: { name: "Tokyo", lat: 35.6762, lng: 139.6503 },
  },
  stops: [
    {
      id: "tokyo-nights-1",
      name: "Shibuya Crossing",
      lat: 35.6595,
      lng: 139.7004,
      type: "district",
      questions: [
        "How intense was the energy compared to what you expected?",
        "Was it easy to navigate the station area?",
        "Best moment to visit for photos or people-watching?",
      ],
    },
    {
      id: "tokyo-nights-2",
      name: "Senso-ji Temple",
      lat: 35.7148,
      lng: 139.7967,
      type: "temple",
      questions: [
        "How peaceful did it feel despite the crowds?",
        "Did you try any street snacks nearby?",
        "Would you go back at a different time of day?",
      ],
      camera: { zoom: 14.5, pitch: 56, bearing: -28, durationMs: 2300 },
    },
    {
      id: "tokyo-nights-3",
      name: "Tsukiji Outer Market",
      lat: 35.6654,
      lng: 139.7706,
      type: "market",
      questions: [
        "What was the best bite you had?",
        "How busy did it feel when you visited?",
        "Cash-only tips or timing advice for others?",
      ],
    },
    {
      id: "tokyo-nights-4",
      name: "Tokyo Skytree",
      lat: 35.7101,
      lng: 139.8107,
      type: "landmark",
      questions: [
        "Was the view worth the ticket?",
        "How long did you spend at the top?",
        "Clear-day vs evening — what would you recommend?",
      ],
      camera: { zoom: 14.7, pitch: 50, bearing: 40, durationMs: 2500 },
    },
  ],
} as const;

export const ROME_TRIP_CONFIG: TripConfig = tripConfigSchema.parse(ROME_RAW);
export const PARIS_TRIP_CONFIG: TripConfig = tripConfigSchema.parse(PARIS_RAW);
export const TOKYO_TRIP_CONFIG: TripConfig = tripConfigSchema.parse(TOKYO_RAW);

/** Seeded Rome demo — use `structuredClone(DEFAULT_DEMO_TRIP_CONFIG)` when mutating. */
export const DEFAULT_DEMO_TRIP_CONFIG: TripConfig = ROME_TRIP_CONFIG;

export const TRIP_PRESETS: TripPreset[] = [
  {
    id: "rome-classic",
    title: "Rome Classic",
    tagline: "Ancient streets, fountains, and golden-hour trattorias.",
    routeLabel: "New York → Rome",
    config: ROME_TRIP_CONFIG,
  },
  {
    id: "paris-lights",
    title: "Paris Lights",
    tagline: "Rooftops, river light, and museum mornings.",
    routeLabel: "San Francisco → Paris",
    config: PARIS_TRIP_CONFIG,
  },
  {
    id: "tokyo-nights",
    title: "Tokyo Nights",
    tagline: "Neon crossings, temples at dawn, and skyline views.",
    routeLabel: "Los Angeles → Tokyo",
    config: TOKYO_TRIP_CONFIG,
  },
];
