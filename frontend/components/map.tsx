/*Since the map was loaded on client side, 
we need to make this component client rendered as well*/
'use client'

//Map component Component from library
import { GoogleMap } from "@react-google-maps/api";
import { useEffect, useState } from "react";
// import { default } from '../tailwind.config';

//Map's styling
const defaultMapContainerStyle = {
    width: '70%',
    height: '70vh',
    borderRadius: '15px 0px 0px 15px',
};

//Default zoom level, can be adjusted
const defaultMapZoom = 17

//Map options
const defaultMapOptions = {
    zoomControl: true,
    tilt: 0,
    gestureHandling: 'auto',
    mapTypeId: 'satellite',
};

const MapComponent = ({cords}:{cords : [number, number][]}) => {
    const [defaultMapCenter, setDefaultMapCenter] = useState({
        lat: 33.4885470867157,
        lng: -84.4326486587524
    });
    useEffect(() => {
        //if cords is not empty, set the center to the first coordinate
        if(cords.length > 0){
            console.log("cords changed",cords)
            setDefaultMapCenter({
                lat: cords[0][0],
                lng: cords[0][1]
            });
        }
    }, [cords]);

    console.log("Map center", defaultMapCenter)
    return (
        <div className="w-full">
            <GoogleMap
                mapContainerStyle={defaultMapContainerStyle}
                center={defaultMapCenter}
                zoom={defaultMapZoom}
                options={defaultMapOptions}
            >
            </GoogleMap>
        </div>
    )
};

export { MapComponent };