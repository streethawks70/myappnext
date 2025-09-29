'use client';

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

type RoutingProps = {
  start: [number, number];
  end: [number, number];
};

export default function Routing({ start, end }: RoutingProps) {
  const map = useMap();
  const routingControlRef = useRef<any>(null);

  useEffect(() => {
    if (!map) return;

    if (!routingControlRef.current) {
      // Creo il routingControl solo la prima volta
      routingControlRef.current = (L as any).Routing.control({
        waypoints: [L.latLng(start[0], start[1]), L.latLng(end[0], end[1])],
        lineOptions: { styles: [{ color: "blue", weight: 4 }] },
        addWaypoints: false,
        routeWhileDragging: false,
        draggableWaypoints: false,
        show: false,
      }).addTo(map);
    } else {
      // Aggiorno le waypoints senza rimuovere il controllo
      routingControlRef.current.setWaypoints([L.latLng(start[0], start[1]), L.latLng(end[0], end[1])]);
    }

    return () => {
      // Rimuovo solo se esiste
      if (routingControlRef.current && map.hasLayer(routingControlRef.current._container)) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [map, start, end]);

  return null;
}
