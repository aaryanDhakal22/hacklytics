import axios from "axios";

const getWayCoordinates = async (wayId: number): Promise<[number, number][]> => {
    const overpassQuery = `
        [out:json];
        way(${wayId});
        (._; >;);
        out body;
    `;
    console.log("Querying wayId:", wayId);
    const url = "https://overpass-api.de/api/interpreter";

    try {
        const response = await axios.post(url, `data=${encodeURIComponent(overpassQuery)}`, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        console.log("Overpass API response:", response.data);

        const elements = response.data.elements;
        
        // Extract nodes
        const nodes: Record<number, [number, number]> = {};
        elements.forEach((element: any) => {
            if (element.type === "node") {
                nodes[element.id] = [element.lat, element.lon];
            }
        });

        // Extract way node sequence
        const way = elements.find((el: any) => el.type === "way");
        if (!way) throw new Error("Way not found");

        const wayCoordinates: [number, number][] = way.nodes.map((nodeId: number) => nodes[nodeId]);

        return wayCoordinates;
    } catch (error) {
        console.error("Error fetching OSM data:", error);
        return [];
    }
};

export default getWayCoordinates;