import React, { useCallback, useEffect, useState } from "react";
import {
  AdvancedMarker,
  APIProvider,
  ControlPosition,
  InfoWindow,
  Map,
  MapControl,
  Marker,
  Pin,
  useAdvancedMarkerRef,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { Button, Container, Grid, TextField, Typography } from "@mui/material";
import axios from "axios";
import MyLocationIcon from '@mui/icons-material/MyLocation';
import PlaceAutocomplete from "./Components/PlaceAutoComplete";
import Directions from "./Components/Directions";

const App = () => {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [infoWindowShown, setInfoWindowShown] = useState(false);
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [markers, setMarkers] = useState([]);
  const [routePath, setRoutePath] = useState([]);
  const [map, setMap] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [startPlace, setStartPlace] = useState(null); 
  const [destinationPlace, setDestinationPlace] = useState(null);
  const [liveLocation, setLiveLocation] = useState(null);
  const [watchId, setWatchId] = useState(null);
  
  // useEffect(() => {
  //   const geoSuccess = (pos) => {
  //     const crd = pos.coords;
  //     console.log('drd',crd);
  //     setLive({
  //       lat: crd.latitude,
  //       lng: crd.longitude,
  //     });
  //   };

  //   const geoError = (err) => {
  //     console.warn(`ERROR(${err.code}): ${err.message}`);
  //     setError(`Geolocation error: ${err.message}`);
  //   };

  //   const watchId = navigator.geolocation.watchPosition(geoSuccess, geoError, {
  //     enableHighAccuracy: true,
  //     timeout: 10000,
  //     maximumAge: 0,
  //   });

  //   // Cleanup the watcher when the component unmounts
  //   return () => {
  //     navigator.geolocation.clearWatch(watchId);
  //   };
  // }, []);

  // const markers = [
  //   { lat: 12.8055648, lng: 80.2129568 },
  //   { lat: 12.81655648, lng: 80.1929568 },
  //   { lat: 12.82855648, lng: 80.1829568 },
  //   { lat: 12.8355648, lng: 80.2030568 },
  //   { lat: 12.8255648, lng: 80.1929568 },
  // ];

  useEffect(() => {
    get();
  }, []);
  

  // https://routes.googleapis.com/directions/v2:computeRoutes?key=YOUR_API_KEY

  const get = async () => {
    try {
      const response = await axios.get(
        "https://data.smartdublin.ie/dlr-parking/parking/dlr_cellnex/geojson"
      );

      const newMarkers = response.data.features.map((feature) => {
        const coordinates = feature.geometry.coordinates;
        return { lat: coordinates[1], lng: coordinates[0] };
      });

      setMarkers(newMarkers);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  // clicking the marker will toggle the infowindow
  const handleMarkerClick = useCallback((position) => {
    console.log('position',position);
    // setInfoWindowShown((isShown) => !isShown);
    setDestinationPlace(position)
   } ,[]
  );

  // if the maps api closes the infowindow, we have to synchronize our state
  const handleClose = useCallback(() => setInfoWindowShown(false), []);

  const markerImage =
    "https://www.shutterstock.com/image-photo/cityscape-residential-area-modern-apartment-260nw-1723278520.jpg";

   const startLiveLocation = () => {
         if (navigator.geolocation) {
          const id = navigator.geolocation.watchPosition(geoSuccess, geoError, {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 0,
          });
          setWatchId(id);
         }     
      else{
        setError('Geolocation is not supported by this browser');
      }
   }

   const geoSuccess = (pos) => {
    const crd = pos.coords;
    setLiveLocation({
      lat: crd.latitude,
      lng: crd.longitude,
    });
     setPosition(null);
  };

  console.log('live location',liveLocation);

  const geoError = (err) => {
    console.warn(`ERROR(${err.code}): ${err.message}`);
    setError(`Geolocation error: ${err.message}`);
  };
   
  const stopLiveLocation = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setLiveLocation(null);
    }
  };
 
  const getCurrentPosition = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition,handleError,{
        enableHighAccuracy: true, // Request high-accuracy mode
        timeout: 10000, // Wait for up to 10 seconds for a more accurate position
        maximumAge: 0 // Do not use cached position data
      });
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  };

  const showPosition = (pos) => {
    const crd = pos.coords;
    console.log("coordi", crd);
    setPosition({
      lat: crd.latitude,
      lng: crd.longitude,
    });
  };

  console.log('markers',markers);
  const handleError = (err) => {
    console.warn(`ERROR(${err.code}): ${err.message}`);
    setError(`Geolocation error: ${err.message}`);
  }

  const apiKey = "AIzaSyDSqdkkz-X5dN9dVfdPw1Ou7Qzjz2wkg38";
  const url = 'https://routes.googleapis.com/directions/v2:computeRoutes'
  const requestBody ={
    "origin": {
      "location": {
        "latLng": {
          "latitude": 37.419734,
          "longitude": -122.0827784
        }
      }
    },
    "destination": {
      "location": {
        "latLng": {
          "latitude": 37.417670,
          "longitude": -122.079595
        }
      }
    },
    "travelMode": "DRIVE",
    "routingPreference": "TRAFFIC_AWARE",
    "computeAlternativeRoutes": false,
    "routeModifiers": {
      "avoidTolls": false,
      "avoidHighways": false,
      "avoidFerries": false
    },
    "languageCode": "en-US",
    "units": "IMPERIAL"
  }

  return (
    <Container >
      <Grid item container spacing={2} display='flex' flexDirection='row'>
    <Grid item md={10}>
    <APIProvider apiKey={apiKey}
     >
        <Map         
          defaultZoom={13}
          defaultCenter={{ lat: 12.8155648, lng: 80.2030568 }}
          style={{ width: "100%", height: "100vh" ,cursor:'default'}}
          mapId="7d2d372f0378469d"
          fullscreenControl={false}
          gestureHandling={"greedy"}
           disableDefaultUI={true}
        >
          <Directions origin={liveLocation} destination={destinationPlace}/>

          {liveLocation && (
            <AdvancedMarker position={liveLocation} >
              <Pin
                background={"orange"}
                borderColor={"orange"}
                glyphColor={"yellow"}
              />
            </AdvancedMarker>
          )}

          {position && (
              <AdvancedMarker position={position} >
              
            </AdvancedMarker>
            )
          }

          {markers?.map((marker, index) => (
            
            <AdvancedMarker key={index} position={marker} ref={markerRef} onClick={()=>handleMarkerClick(marker)}>
              <Pin
                background={"#0f9d58"}
                borderColor={"#006425"}
                glyphColor={"#60d98f"}
              />
            </AdvancedMarker>
          ))}

          <AdvancedMarker
            position={{ lat: 12.7855648, lng: 80.1930568 }}
            onClick={() => handleMarkerClick({ lat: 12.7855648, lng: 80.1930568 })}
            ref={markerRef}
          >
            <img src={markerImage} width={40} height={40} />
          </AdvancedMarker>

          <AdvancedMarker
            position={{ lat: 12.7855648, lng: 80.2330568 }}
            onClick={() => handleMarkerClick({ lat: 12.7855648, lng: 80.2330568 })}
            ref={markerRef}
          >
            <img src={markerImage} width={40} height={40} />
          </AdvancedMarker>

          {infoWindowShown && (
            <InfoWindow anchor={marker} onClose={handleClose}>
              <h2>Government Hospital</h2>
              <p>Government Hsopital ,Kelambakkam</p>
            </InfoWindow>
          )}

          <MapControl position={ControlPosition.TOP_RIGHT} >  
             <Grid  item container flexDirection='column'>  
              <Grid item>
            <Button onClick={startLiveLocation} size='large' color="inherit" startIcon={<MyLocationIcon/>}>Start Live</Button>                 
              </Grid>
              <Grid item>
            <Button onClick={stopLiveLocation} size='large' color="inherit" startIcon={<MyLocationIcon/>}>Stop Live</Button>                         
                </Grid>
            </Grid>  
          </MapControl>

          <MapControl position={ControlPosition.INLINE_END_BLOCK_CENTER} >  
            <Button onClick={getCurrentPosition} size='large' color="inherit" startIcon={<MyLocationIcon/>}></Button>                         
             
          </MapControl>

        </Map>    
        <MapControl position={ControlPosition.TOP}>
         <Grid item container gap={1}>
            <Grid item>
            <PlaceAutocomplete onPlaceSelect={setStartPlace} placeholder="Start Location"/>
            </Grid>
            <Grid item>
            <PlaceAutocomplete onPlaceSelect={setDestinationPlace} placeholder="Destination"/>
            </Grid>
           
         </Grid>

      </MapControl>
      </APIProvider>
    </Grid>
      <Grid item md={2} display='flex' flexDirection='column'>
       <div>
      <h2>Current Position</h2>
      {error ? (
        <p>{error}</p>
      ) : (
        <p>
          Latitude: {liveLocation?.lat} <br />
          Longitude: {liveLocation?.lng}
        </p>
      )}
    </div>
      </Grid> 
    </Grid>
    </Container>
  );
};

export default App;


// import { Button, Typography } from "@mui/material";

// const { GoogleMap, Marker, useLoadScript } = require("@react-google-maps/api");
// const { useState, useEffect, useMemo } = require("react");

// function App() {
//   const [position, setPosition] = useState(null);
//   const [error, setError] = useState(null);

//   const libraries = ['places'];

//   const markers = [{lat:12.8255648 ,
//     lng:80.2129568 ,},{lat:12.8255648 ,
//       lng:80.1929568 ,},{lat:12.8255648 ,
//         lng:80.1829568 ,},{lat:12.8255648 ,
//           lng:80.2030568 ,},{lat:12.8255648 ,
//             lng:80.1929568 ,}];

//   const mapContainerStyle = {
//     width: '100%',
//     height: '100vh',
//   };

//   const center = useMemo(()=>({lat: 12.8155648,lng: 80.2030568,}),[]);

//   const options = useMemo(()=>({disableDefaultUI:true,enableHighAccuracy: true}),[]);

//   // const options = {
//   //   enableHighAccuracy: true,
//   //   timeout: 5000,
//   //   maximumAge: 0,
//   // };

//   const success = (pos) => {
//     const crd = pos.coords;
//     console.log('coordi',crd);
//     setPosition({
//       lat: crd.latitude,
//       lng: crd.longitude,
//     });
//   };

//   const err = (err) => {
//     setError(err.message);
//   };

//   console.log('posit',position);

//   const { isLoaded, loadError } = useLoadScript({
//     googleMapsApiKey: "AIzaSyDSqdkkz-X5dN9dVfdPw1Ou7Qzjz2wkg38",
//   });

//   const click = () => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(success, err, options);
//     } else {
//       setError('Geolocation is not supported by this browser.');
//     }
//   }

//   if (loadError) return 'Error loading maps';
//   if (!isLoaded) return 'Loading maps...';

//   return (
//     <div>
//       <GoogleMap
        
//         mapContainerStyle={mapContainerStyle}
//         center={center||position}
//         zoom={13}
//         options={options}
//       >
//         {position && (
//           <Marker position={position} title="You Location"/>

//         )}

// {/* <Marker position={{lat:12.8155648,lng: 80.2129568}} title="Hotel" />
// <Marker position={{lat:12.8055648,lng: 80.2229568}} title="Hotel" />
// <Marker position={{lat:12.8155648,lng: 80.2329568}} title="Hotel" />
// <Marker position={{lat:12.8155648,lng: 80.1929568}} title="Hotel" /> */}
// <Marker position={{lat:12.8155648,lng: 80.1829568}} title="Hotel" />

//       </GoogleMap>
//       <Button size='large' onClick={click}>Locate Me</Button>
//     </div>
//   );
// }

// export default App;

// import logo from './logo.svg';
// import './App.css';
// import { useState } from 'react';
// import { Button, TextField } from '@mui/material';

// function App() {
//   const[orgin,setOrgin] = useState();
//   const[destination,setDestination] = useState();
//   const [currentLocation,setCurrentLocation] = useState('');
//   const [liveLocation,setLiveLocation] = useState('');
//   const[error,setError] = useState();
//   const[watchId,setWatchId] = useState();



//   const [areaName, setAreaName] = useState('Tamilnadu');

// // const googleMapsUrl = `https://www.google.com/maps/embed/v1/directions?key=AIzaSyDSqdkkz-X5dN9dVfdPw1Ou7Qzjz2wkg38&origin=${encodeURIComponent(orgin)}&destination=${encodeURIComponent(destination)}&avoid=tolls|highways&mode=driving`;
//  const googleMapsUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyDSqdkkz-X5dN9dVfdPw1Ou7Qzjz2wkg38&q=${areaName}`

// const handleGetCurrentLocation = () => {
//   if (navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         const { latitude, longitude } = position.coords;
//         setCurrentLocation(`Lat: ${latitude}, Lng: ${longitude}`);
//          getAddressFromCoords(latitude, longitude);
//       },
//       (error) => {
//         console.error('Error getting location', error);
//         alert('Unable to retrieve your location.');
//       }
//     );
//   } else {
//     alert('Geolocation is not supported by this browser.');
//   }

// };

//    const startLiveLocation = () => {
//          if (navigator.geolocation) {
//           const id = navigator.geolocation.watchPosition(geoSuccess, geoError, {
//             enableHighAccuracy: false,
//             timeout: 10000,
//             maximumAge: 0,
//           });
//           setWatchId(id);
//          }     
//       else{
//         setError('Geolocation is not supported by this browser');
//       }
//    }

//    const geoSuccess = (pos) => {
//     const crd = pos.coords;
//     setLiveLocation({
//       lat: crd.latitude,
//       lng: crd.longitude,
//     });
//     getAddressFromCoords(crd.latitude,crd.longitude)
//      setCurrentLocation(null);
//   };

//   console.log('live location',liveLocation);

//   const geoError = (err) => {
//     console.warn(`ERROR(${err.code}): ${err.message}`);
//     setError(`Geolocation error: ${err.message}`);
//   };
   
//   const stopLiveLocation = () => {
//     if (watchId) {
//       navigator.geolocation.clearWatch(watchId);
//       setWatchId(null);
//       setLiveLocation(null);
//     }
//   };

// const getAddressFromCoords = async (latitude, longitude) => {
//   console.log('giooooo',latitude,longitude);
//   try {
//     const response = await fetch(
//       `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyDSqdkkz-X5dN9dVfdPw1Ou7Qzjz2wkg38`
//     );
//     const data = await response.json();
//     console.log('dataaaa',data);
//     if (data.results.length > 0) {

//       const value = data.results[0]
//       console.log(value);
//       // setAreaName(data.results[0].formatted_address);
//       setAreaName('Pudupakkam+Government+School')
//     } else {
//       setAreaName('No address found');
//     }
//   } catch (error) {
//     console.error('Error fetching address', error);
//     setAreaName('Error fetching address');
//   }
// };

// return (
//    <div>
//     <TextField placeholder='Choose start location' value={orgin} onChange={(e)=>setOrgin(e.target.value)}/>
//     <TextField placeholder='Choose destination' value={destination} onChange={(e)=>setDestination(e.target.value)}/>
//     <Button
//         variant="contained"
//         color="primary"
//         onClick={handleGetCurrentLocation}
//       >
//         Get Current Location
//       </Button>

//       <Button
//         variant="contained"
//         color="primary"
//         onClick={startLiveLocation}
//       >
//         Get Live Location
//       </Button>
//    <iframe
//     width="100%"
//     height="520"
//     frameborder="0" style={{border:0 }}
//     referrerpolicy="no-referrer-when-downgrade"
//     src={googleMapsUrl}
//     allowfullscreen
//     >
//    </iframe>
//    <p>{liveLocation?.lat}</p>
//    <p>{liveLocation?.lng}</p>
//    </div>
//   );
// }

// export default App;
