import React, { useState, useEffect } from 'react';

type LatLng = {
  lat: number;
  lng: number;
};

type RoadEndpoints = {
  point_a: LatLng;
  point_b: LatLng;
};

interface RoadResult {
  [roadName: string]: RoadEndpoints;
}

interface Props {
  lat: number;
  lng: number;
}

const OverpassRoadConnector: React.FC<Props> = ({ lat, lng }) => {
  const [roads, setRoads] = useState<RoadResult>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Overpass QL query:
    // 1. Find the reference road(s) near the given coordinate (using a small radius, e.g. 10 meters).
    // 2. Get the nodes for that/these road(s).
    // 3. Find ways connected to those nodes that have highway tag primary, secondary, or residential.
    const query = `
[out:json][timeout:25];
// Find the reference road(s) near the provided coordinate (within 10m)
way(around:10, ${lat}, ${lng})[highway];
out ids geom;

// Get nodes of the reference way(s)
node(w);
out ids;

// Find ways connected to those nodes that are primary, secondary or residential
way(bn)[highway~"^(primary|secondary|residential)$"];
out ids geom;
    `;

    const overpassUrl = 'https://overpass-api.de/api/interpreter';

    fetch(overpassUrl, {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .then(response => response.json())
      .then(data => {
        // Overpass returns a flat list of elements (nodes and ways)
        const ways = data.elements.filter((el: any) => el.type === 'way');
        const nodes = data.elements.filter((el: any) => el.type === 'node');
        console.log(ways, nodes)
        if (ways.length === 0) {
          setError('No roads found near the provided location.');
          setLoading(false);
          return;
        }
        
        // Assume the first way returned is the reference road.
        // (In a more robust solution you might compute the distance from the point to each way’s geometry.)
        const refWay = ways[0];
        const refWayId = refWay.id;
        const refNodeSet = new Set(refWay.nodes);
        console.log(ways)
        // Filter out the reference road and then select connecting ways
        const connectingWays = ways.filter((w: any) => {
          if (w.id === refWayId) return false;
          // Ensure the way has a highway tag and is one of our target types.
          if (!w.tags || !w.tags.highway) return false;
          const type = w.tags.highway;
          if (!['primary', 'secondary', 'residential'].includes(type)) return false;
          // Check for at least one common node with the reference road.
          return w.nodes.some((nodeId: number) => refNodeSet.has(nodeId));
        });

        // For each connecting road, extract the endpoints from its geometry (first and last coordinates)
        const result: RoadResult = {};
        connectingWays.forEach((w: any, index: number) => {
          if (!w.geometry || w.geometry.length < 2) return;
          const first = w.geometry[0];
          const last = w.geometry[w.geometry.length - 1];
          result[`Road${index + 1}`] = {
            point_a: { lat: first.lat, lng: first.lon },
            point_b: { lat: last.lat, lng: last.lon }
          };
        });
        setRoads(result);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error querying Overpass API:', err);
        setError('Error querying Overpass API');
        setLoading(false);
      });
  }, [lat, lng]);

  return (
    <div>
      <h3>Connected Roads</h3>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <ul>
          {Object.entries(roads).map(([roadName, endpoints]) => (
            <li key={roadName}>
              <strong>{roadName}:</strong> 
              Point A: ({endpoints.point_a.lat.toFixed(5)}, {endpoints.point_a.lng.toFixed(5)}),{' '}
              Point B: ({endpoints.point_b.lat.toFixed(5)}, {endpoints.point_b.lng.toFixed(5)})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OverpassRoadConnector;
