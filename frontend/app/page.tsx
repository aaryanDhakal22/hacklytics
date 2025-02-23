'use client';
import { MapProvider } from "@/provider/map_provider";
import { MapComponent } from "@/components/map";
import getWayCoordinates from "@/utils/cords";
import { useState } from "react";
export default function Home() {
  const [osmID,setOsmID] = useState<number>(1075671961)
  const [cords, setCords] = useState<[number, number][]>([])
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOsmID(parseInt(e.target.value))
  }
  const handleClick = async () => {
    const wayCoordinates = await getWayCoordinates(osmID);
    setCords(wayCoordinates);
    console.log("Coordinates:", wayCoordinates.length );
  }
  return (
    <MapProvider>
      <main>
        Map will come here
        <input type="text" className="text-black" value = {osmID} onChange={handleChange} />
        <button className="bg-blue-500 text-white p-2 rounded" onClick={handleClick}>Get Coordinates</button>
        <MapComponent cords={cords} />
      </main>
    </MapProvider>
  );
}
