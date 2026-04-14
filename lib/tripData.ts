export type Trip = {
  flight: {
    origin: {
      name: string;
      lat: number;
      lng: number;
    };
    destination: {
      name: string;
      lat: number;
      lng: number;
    };
  };
  stop: {
    id: string;
    name: string;
    lat: number;
    lng: number;
    type: string;
    questions: string[];
  };
};

export const trip: Trip = {
  flight: {
    origin: {
      name: "New York City",
      lat: 40.7128,
      lng: -74.006,
    },
    destination: {
      name: "Rome",
      lat: 41.9028,
      lng: 12.4964,
    },
  },
  stop: {
    id: "stop-1",
    name: "Trevi Fountain",
    lat: 41.9009,
    lng: 12.4833,
    type: "landmark",
    questions: [
      "How crowded did it feel?",
      "Was it worth visiting?",
      "What should another traveler know before going?",
    ],
  },
};
