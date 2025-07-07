import Image from "next/image";
import MapView from "@/components/MapView";
import { LatLngExpression } from "leaflet";


const warehouse: LatLngExpression = [40.721786, -73.999384]

export default function Home() {
  
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Route Optimization Site</h1>
      <MapView warehouse={warehouse}/>
    </main>
  );
}
