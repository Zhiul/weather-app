import { createContext, useEffect, useRef, useState } from "react";
import Weather from "./components/Weather/Weather";
import { getWeatherData } from "./components/Weather/getWeatherData";
import {
  geocodeLocation,
  reverseGeocodeLocation,
} from "./components/Weather/geocodingAPI";
import WeatherDataMockup from "./components/Weather/weatherDataMockup.json";
import countriesAndTimezones from "countries-and-timezones";

export const FetchingWeatherDataContext = createContext(true);

function App() {
  const [location, setLocation] = useState<LocationData>({});
  const [weatherData, setWeatherData] =
    useState<WeatherData>(WeatherDataMockup);
  const [fetchingWeatherData, setFetchingWeatherData] = useState(true);
  const [temperatureUnit, setTemperatureUnit] = useState("celsius");
  const [timeBasis, setTimeBasis] = useState<"daily" | "hourly">("daily");
  const forecastContainer = useRef();

  function toggleTemperatureUnit() {
    if (temperatureUnit === "celsius") {
      setTemperatureUnit("farenheit");
    } else {
      setTemperatureUnit("celsius");
    }
  }

  function setWeatherDataFromLocationCoordinates(lat, lon) {
    setFetchingWeatherData(true);
    getWeatherData(lat, lon)
      .then((weatherData) => {
        setWeatherData(weatherData);
      })
      .then(() => {
        setFetchingWeatherData(false);
      });
  }

  useEffect(() => {
    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };

    async function setLocationFromCoordinates(pos) {
      const coordinates = pos.coords;
      const lat = coordinates.latitude;
      const lon = coordinates.longitude;

      const location = await reverseGeocodeLocation(lat, lon);
      setLocation(location);
    }

    async function setLocationByTimeZone() {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const city = timezone.split("/")[1].replaceAll("_", " ");
      const country = countriesAndTimezones.getTimezone(timezone).countries[0];
      const locationData = await geocodeLocation(`${city}, ${country}`);
      const location =
        (await locationData[0]) || reverseGeocodeLocation("40.73", "-73.93");
      setLocation(location);
    }

    navigator.geolocation.getCurrentPosition(
      setLocationFromCoordinates,
      setLocationByTimeZone,
      options
    );
  }, []);

  useEffect(() => {
    if (location.lat) {
      setFetchingWeatherData(true);
      setWeatherDataFromLocationCoordinates(location.lat, location.lon);
    }
  }, [location]);

  function toggleForecastType(timeBasis) {
    setTimeBasis((previusTimeBasis) => {
      if (previusTimeBasis !== timeBasis) {
        const forecastContainerAppearingAnimation = [
          { opacity: "0" },
          { opacity: "0.9", offset: 0.3 },
          { opacity: "1" },
        ];

        const animationProperties = {
          duration: 250,
          easing: "ease-in-out",
        };

        forecastContainer.current.animate(
          forecastContainerAppearingAnimation,
          animationProperties
        );
      }
      return timeBasis;
    });
  }

  return (
    <div
      className="App"
      data-fetching-weather-data={fetchingWeatherData ? "true" : "false"}
    >
      <FetchingWeatherDataContext.Provider value={fetchingWeatherData}>
        <Weather
          weatherData={weatherData.currentData}
          weatherDataType="current"
          dailyWeatherData={weatherData.dailyData}
          location={location}
          setLocation={setLocation}
          temperatureUnit={temperatureUnit}
          setTemperatureUnit={setTemperatureUnit}
        />
      </FetchingWeatherDataContext.Provider>

      <div className="weather-forecast">
        <div className="weather-basis-switch" data-time-basis={timeBasis}>
          <button
            className="weather-basis-switch-btn"
            onClick={() => toggleForecastType("daily")}
            data-active={timeBasis === "daily" ? "true" : "false"}
          >
            Daily
          </button>
          <button
            className="weather-basis-switch-btn"
            onClick={() => toggleForecastType("hourly")}
            data-active={timeBasis === "hourly" ? "true" : "false"}
          >
            Hourly
          </button>
        </div>

        <FetchingWeatherDataContext.Provider value={fetchingWeatherData}>
          <ul
            className="weather-forecast-elements"
            data-timebasis={timeBasis}
            ref={forecastContainer}
          >
            {timeBasis === "daily"
              ? weatherData.dailyData.map((dailyWeatherData) => {
                  return (
                    <Weather
                      weatherData={dailyWeatherData}
                      weatherDataType={"daily"}
                      location={location}
                      temperatureUnit={temperatureUnit}
                      key={dailyWeatherData.time}
                    />
                  );
                })
              : weatherData.hourlyData.map((hourlyData) => {
                  return (
                    <Weather
                      weatherData={hourlyData}
                      dailyWeatherData={weatherData.dailyData}
                      weatherDataType={"hourly"}
                      location={location}
                      temperatureUnit={temperatureUnit}
                      key={hourlyData.time}
                    />
                  );
                })}
          </ul>
        </FetchingWeatherDataContext.Provider>
      </div>
    </div>
  );
}

export default App;
