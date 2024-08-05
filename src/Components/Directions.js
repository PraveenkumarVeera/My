import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import React, { useEffect, useState } from 'react'

function Directions({ origin, destination }) {
    const map = useMap();
    const routesLibrary = useMapsLibrary('routes');
    const [directionsService,setDirectionsService] = useState();
    const [directionsRenderer,setDirectionsRenderer] = useState();
    const [routes,setRoutes] = useState([]);
    const [routeIndex,setRouteIndex] = useState(0);
    const selected = routes[routeIndex];
    const leg = selected?.legs[0];
  
  console.log('origin',origin);
  console.log('destination',destination);


    useEffect(() => {
     if (!routesLibrary || !map) return;
     setDirectionsService(new routesLibrary.DirectionsService());
     setDirectionsRenderer(new routesLibrary.DirectionsRenderer({map}));
    }, [routesLibrary,map])
  
    useEffect(() => {
      if (!directionsService||!directionsRenderer||!origin||!destination) return;
  
      directionsService.route({
        origin:origin,
        destination:destination,
        travelMode: window.google.maps.TravelMode.WALKING,
        provideRouteAlternatives:true
      }).then(response => {
          directionsRenderer.setDirections(response);
          setRoutes(response.routes)
        }
      )
    }, [directionsService,directionsRenderer,origin,destination])
  
    useEffect(() => {
      if (!directionsRenderer) return;
      directionsRenderer.setRouteIndex(routeIndex);
    }, [routeIndex,directionsRenderer])
    
    console.log(routes);

   if (!leg) return null;
  
   return(
    <div className="directions">
      <h2>{selected?.summary}</h2>
      <p>
      {leg?.start_address.split(',')[0] } to {leg.end_address.split(',')[0]}
       </p>
      <p>Distance: {leg.distance?.text}</p>
      <p>Duration: {leg.duration?.text}</p>
      <h2>Other Routes</h2>
      <ul>
        {routes.map((route,index)=>(
            <li key={route.summary}>
                 <button onClick={()=>setRouteIndex(index)}>
                  {route.summary}
                 </button>
            </li>
          ))}
      </ul>
    </div>
   )
  }

export default Directions;