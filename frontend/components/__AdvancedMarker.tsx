// components/AdvancedMarker.tsx
'use client'

import { useEffect } from "react";
import { useGoogleMap } from "@react-google-maps/api";

interface AdvancedMarkerProps {
  position: google.maps.LatLngLiteral;
  label: string;
}

const AdvancedMarker: React.FC<AdvancedMarkerProps> = ({ position, label }) => {
  const map = useGoogleMap();

  useEffect(() => {
    if (!map || !window.google) return;
    // Create a content element for the marker.
    const contentDiv = document.createElement("div");
    contentDiv.innerText = label;
    contentDiv.style.background = "white";
    contentDiv.style.border = "1px solid #ccc";
    contentDiv.style.borderRadius = "4px";
    contentDiv.style.padding = "2px 4px";
    contentDiv.style.fontSize = "12px";

    let marker: google.maps.Marker | google.maps.marker.AdvancedMarkerElement;

    if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
      // Use the new AdvancedMarkerElement API.
      marker = new google.maps.marker.AdvancedMarkerElement({
        position,
        content: contentDiv,
      });
    } else {
      // Fallback to the classic Marker API.
      marker = new google.maps.Marker({
        position,
        label: {
          text: label,
          fontSize: "12px",
          color: "#000",
        },
      });
    }
    marker.setMap(map);

    return () => {
      marker.setMap(null);
    };
  }, [map, position, label]);

  return null;
};

export default AdvancedMarker;
