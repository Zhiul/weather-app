import countries from "i18n-iso-countries";
import ENLocale from "i18n-iso-countries/langs/en.json";
import USAStates from "us-state-codes";
countries.registerLocale(ENLocale);

class LocationData {
  countryName: string;
  stateName: string;
  cityName: string;
  lat: string;
  lon: string;

  constructor(
    countryName: string,
    stateName: string,
    cityName: string,
    lat: string,
    lon: string
  ) {
    this.countryName = countryName;
    this.stateName = stateName;
    this.cityName = cityName;
    this.lat = lat;
    this.lon = lon;
  }
}

export const geocodeLocation = async (
  locationInput: string
): Promise<LocationData[]> => {
  const locationElements = locationInput
    .split(",")
    .map((locationElement) => locationElement.trim());

  const cityName = locationElements[0];
  let stateName = "";
  let stateCode: string | undefined = "";
  const countryName = locationElements[locationElements.length - 1];
  const countryCode = countries.getAlpha2Code(countryName, "en");

  if (locationElements.length === 3 && countryCode === "US") {
    let stateName = locationElements[1];
    stateCode = USAStates.getStateCodeByStateName(stateName);
    if (stateCode === null) stateCode = "";
  }

  try {
    const geocodedLocation = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${cityName},${stateCode},${countryCode}&limit=5&appid=7145fd9312e95eefabe5a13af2df5b20`
    );

    let geocodedLocationData = await geocodedLocation.json();

    if (Array.isArray(geocodedLocationData)) {
      geocodedLocationData = geocodedLocationData.map(
        (location) =>
          new LocationData(
            countries.getName(location.country, "en"),
            location.state,
            location.name,
            location.lat,
            location.lon
          )
      );
    } else if (geocodedLocationData?.cod === "400") {
      geocodedLocationData = [];
    }

    return geocodedLocationData;
  } catch (error) {
    return [];
  }
};

export const reverseGeocodeLocation = async (
  lat: string | number,
  lon: string | number
): Promise<LocationData> => {
  if (typeof lat === "number") lat = lat.toString();
  if (typeof lon === "number") lon = lon.toString();

  const reverseGeocodedLocation = await fetch(
    `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=7145fd9312e95eefabe5a13af2df5b20`
  );
  const reverseGeocodedLocationData = await reverseGeocodedLocation.json();

  const countryName = countries.getName(
    reverseGeocodedLocationData[0].country,
    "en"
  );
  const stateName = reverseGeocodedLocationData[0].state;
  const cityName = reverseGeocodedLocationData[0].name;

  const location = new LocationData(countryName, stateName, cityName, lat, lon);
  return location;
};
