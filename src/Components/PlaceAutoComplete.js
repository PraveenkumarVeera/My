import { Grid, TextField } from "@mui/material";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { useEffect, useRef, useState } from "react";

const PlaceAutocomplete = ({ onPlaceSelect, placeholder }) => {
  const [placeAutocomplete, setPlaceAutocomplete] = useState(null);
  const inputRef = useRef(null);
  const places = useMapsLibrary("places");

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options = {
      fields: ["geometry", "name", "formatted_address"],
    };

    setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options));
  }, [places]);

  useEffect(() => {
    if (!placeAutocomplete) return;

    placeAutocomplete.addListener("place_changed", () => {
      onPlaceSelect(placeAutocomplete.getPlace());
    });
  }, [onPlaceSelect, placeAutocomplete]);

  return (
    <Grid marginTop={2}>
      <input
        ref={inputRef}
        placeholder={placeholder}
        style={{
          width: "200px",
          height: "35px",
          borderRadius: 10,
          opacity: 0.9,
        }}
      />
    </Grid>
  );
};

export default PlaceAutocomplete;
