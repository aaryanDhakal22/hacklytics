
interface LatLng {
    lat: number;
    lng: number;
  }
  
interface Segment {
    point_a: LatLng;
    point_b: LatLng;
  }

interface OverpassWay {
    id: number;
    nodes: number[];
    // other properties can be added if needed
  }

  interface MapComponentProps {
    osmId: number;
    showConnected: boolean;
    showDistance: boolean;
  }
  
  // Define an interface for the expected return from getConnectedRoadEndpoints.
  interface ConnectedRoadsResult {
    ways: OverpassWay[];
    nodeMap: Record<number, LatLng>;
  }