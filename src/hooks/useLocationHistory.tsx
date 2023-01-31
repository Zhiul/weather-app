import { useState, useEffect } from "react";

export function useLocationHistory() {
  const [data, setData] = useState<LocationData[]>([]);

  useEffect(() => {
    const locationHistoryJSON = localStorage.getItem("locationHistory");
    let locationHistory;
    if (locationHistoryJSON) locationHistory = JSON.parse(locationHistoryJSON);
    if (locationHistory) setData(locationHistory);
  }, []);

  function addLocation(location: LocationData) {
    let newLocationHistory;

    const locationIndex = data.findIndex(
      (el) =>
        el.countryName === location.countryName &&
        el.stateName === location.stateName &&
        el.cityName === location.cityName
    );

    if (locationIndex >= 0) {
      const locationHistory = data;
      locationHistory.splice(locationIndex, 1);
      newLocationHistory = [location, ...locationHistory];
    } else {
      newLocationHistory = [location, ...data.slice(0, 4)];
    }

    localStorage.setItem("locationHistory", JSON.stringify(newLocationHistory));
    setData(newLocationHistory);
  }

  return {
    data,
    addLocation,
  };
}
