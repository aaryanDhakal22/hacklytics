'use client'

import { useEffect, useState } from "react";
import { GoogleMap, Polyline, Marker } from "@react-google-maps/api";
import { getWaySegmentFromOSMID } from "@/utils/get_way_segment";
import { getConnectedRoadEndpoints } from "@/utils/get_nodes";
import { convertWayToSegment } from "@/utils/convertWayToSegment";
import { calculateDistance } from "@/utils/calculateDistance";
import { getPointsOfInterest } from "@/utils/get_points_of_interest";
import type { POI } from "@/utils/get_points_of_interest"; 

const defaultMapContainerStyle = {
  width: "70%",
  height: "70vh",
  borderRadius: "15px 0px 0px 15px",
};
const defaultMapZoom = 17;
const defaultMapOptions = {
  zoomControl: true,
  tilt: 0,
  gestureHandling: "auto",
  mapTypeId: "satellite",
};
const polylineOptionsPrimary = {
  strokeColor: "#00FF00", // Primary road in green
  strokeOpacity: 1.0,
  strokeWeight: 6,
};
const polylineOptionsConnected = {
  strokeColor: "#FF0000", // Connected roads in red
  strokeOpacity: 1.0,
  strokeWeight: 6,
};

interface MapComponentProps {
  osmId: number;
  showDistance: boolean;
  handleDistance : (item: number[])=>void;
}

// Define an interface for the expected return from getConnectedRoadEndpoints.
interface ConnectedRoadsResult {
  ways: OverpassWay[];
  nodeMap: Record<number, LatLng>;
}

const MapComponent = ({ osmId, showDistance, handleDistance }: MapComponentProps) => {
  const [defaultMapCenter, setDefaultMapCenter] = useState<LatLng>({
    lat: 33.4885470867157,
    lng: -84.4326486587524,
  });
  const [primarySegment, setPrimarySegment] = useState<Segment | null>(null);
  const [connectedSegments, setConnectedSegments] = useState<Segment[]>([]);
  const [distances, setDistances] = useState<number[]>([]);
  const [pois, setPOIs] = useState<POI[]>([]); // ------------Added -----------------

  useEffect(() => {
    if (osmId) {
      // 1. Fetch the primary road segment using the provided OSM ID.
      getWaySegmentFromOSMID(osmId)
        .then(({ way, nodeMap }) => {
          const seg = convertWayToSegment(way, nodeMap);
          if (!seg) {
            throw new Error("Conversion to primary segment failed.");
          }
          setPrimarySegment(seg);
          // Compute the center as the midpoint of the primary segment.
          const center: LatLng = {
            lat: (seg.point_a.lat + seg.point_b.lat) / 2,
            lng: (seg.point_a.lng + seg.point_b.lng) / 2,
          };
          setDefaultMapCenter(center);

          getPointsOfInterest(center.lat, center.lng)
            .then((poiResults) => {
              setPOIs(poiResults);
            })
            .catch((error) => {
              console.error("Error fetching POIs:", error);
            });
          // 2. Fetch connected roads using the computed center.
          return getConnectedRoadEndpoints(center.lat, center.lng);
        })
        .then((result) => {
          if (result) {
            // Cast the result to ConnectedRoadsResult.
            const { ways, nodeMap } = result as ConnectedRoadsResult;
            // Exclude the primary road from the connected results.
            const filteredWays = ways.filter((way: OverpassWay) => way.id !== osmId);
            const segments: Segment[] = filteredWays
              .map((way: OverpassWay) => convertWayToSegment(way, nodeMap))
              .filter((seg: Segment | null): seg is Segment => seg !== null);
            setConnectedSegments(segments);
            // If showDistance is true, calculate distances from the primary segment's midpoint
            // to each connected segment's midpoint.
            if (showDistance) {
              calculateDistance(osmId, segments)
                .then((dists) => {
                  setDistances(dists);
                  handleDistance(dists);
                  console.log("Distances (in meters):", dists);
                })
                .catch((error) => {
                  console.error("Error calculating distances:", error);
                });
            } else {
              setDistances([]);
            }
          }
        })
        .catch((error: any) => {
          console.error("Error fetching data for osmId", osmId, error);
        });
    }
  }, [osmId, showDistance]);

  if (!primarySegment) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="w-full">
      <GoogleMap
        mapContainerStyle={defaultMapContainerStyle}
        center={defaultMapCenter}
        zoom={defaultMapZoom}
        options={defaultMapOptions}
      >
        {/* Render the primary road segment */}
        <Polyline
          path={[primarySegment.point_a, primarySegment.point_b]}
          options={polylineOptionsPrimary}
        />
        {/* Render connected road segments */}
        {connectedSegments.map((seg, index) => (
          <Polyline
            key={`connected-road-${index}`}
            path={[seg.point_a, seg.point_b]}
            options={polylineOptionsConnected}
          />
        ))}
        {/* Conditionally render markers for distance if showDistance is true */}
        {showDistance &&
          connectedSegments.map((seg, index) => {
            const midpoint = {
              lat: (seg.point_a.lat + seg.point_b.lat) / 2,
              lng: (seg.point_a.lng + seg.point_b.lng) / 2,
            };
            return (
              <Marker
                key={`marker-${index}`}
                position={midpoint}
                label={{
                  text: distances[index] ? `${Math.round(distances[index])} m` : "",
                  fontSize: "12px",
                  color: "#000",
                }}
              />
            );
          })}
          {pois.map((poi) => (
          <Marker
            key={poi.id}
            position={{ lat: poi.lat, lng: poi.lng }}
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            }}
            title={poi.name ? poi.name : poi.amenity ? poi.amenity : "POI"}
          />
        ))}
      </GoogleMap>
    </div>
  );
};

export { MapComponent };
