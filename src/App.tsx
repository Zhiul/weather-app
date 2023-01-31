import { createContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { isEqual } from "lodash";

import { useOnlineStatus } from "./hooks/useOnlineStatus";
import { useLocationHistory } from "./hooks/useLocationHistory";

import Weather from "./components/Weather/Weather";
import { getWeatherDataList } from "./components/Weather/getWeatherDataList";

import {
  geocodeLocation,
  reverseGeocodeLocation,
} from "./components/Weather/geocodingAPI";

import WeatherDataMockup from "./components/Weather/weatherDataMockup.json";
import countriesAndTimezones from "countries-and-timezones";

import errorIcon from "./assets/error.png";

export const FetchingWeatherDataContext = createContext(true);
export const OnlineStatusContext = createContext(false);
export const LocationHistoryContext = createContext<LocationHistory>(
  {} as LocationHistory
);

function App() {
  const [location, setLocation] = useState<LocationData>({} as LocationData);
  const locationHistory = useLocationHistory();

  const [weatherDataList, setWeatherDataList] = useState<WeatherDataList>(
    WeatherDataMockup as unknown as WeatherDataList
  );
  const [previousWeatherData, setPreviousWeatherData] = useState<{
    location: LocationData;
    weatherDataList: WeatherDataList;
  }>();
  const [fetchingWeatherData, setFetchingWeatherData] = useState(true);

  const [temperatureUnit, setTemperatureUnit] = useState<
    "celsius" | "fahrenheit"
  >("celsius");
  const [timeBasis, setTimeBasis] = useState<"daily" | "hourly">("daily");

  const forecastContainer = useRef<HTMLUListElement>(null);
  const onlineStatus = useOnlineStatus();
  const [showOfflineModal, setShowOfflineModal] = useState(false);

  useEffect(() => {
    const previusWeatherDataJSON = localStorage.getItem("previousWeatherData");
    let previousWeatherData;
    if (previusWeatherDataJSON)
      previousWeatherData = JSON.parse(previusWeatherDataJSON);
    if (previousWeatherData) setPreviousWeatherData(previousWeatherData);

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
    };

    async function setLocationFromCoordinates(pos: GeolocationPosition) {
      const coordinates = pos.coords;
      const lat = coordinates.latitude;
      const lon = coordinates.longitude;

      const location = await reverseGeocodeLocation(lat, lon);
      setLocation(location);
    }

    async function setLocationByTimeZone() {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const city = timezone.split("/")[1].replaceAll("_", " ");
      const country = countriesAndTimezones.getTimezone(timezone)?.countries[0];
      const locationData = await geocodeLocation(`${city}, ${country}`);

      let location;
      if (locationData[0]) {
        location = await locationData[0];
      } else {
        location = await reverseGeocodeLocation("40.73", "-73.93");
      }
      setLocation(location);
    }

    navigator.geolocation.getCurrentPosition(
      setLocationFromCoordinates,
      setLocationByTimeZone,
      options
    );
  }, []);

  async function handleWeatherDataChange(
    location: LocationData,
    weatherDataList: WeatherDataList
  ) {
    setWeatherDataList(weatherDataList);

    locationHistory.addLocation(location);

    const currentWeatherData = { location, weatherDataList };
    localStorage.setItem(
      "previousWeatherData",
      JSON.stringify(currentWeatherData)
    );
    setPreviousWeatherData(currentWeatherData);
  }

  useEffect(() => {
    if (location.lat) {
      setFetchingWeatherData(true);

      getWeatherDataList(location.lat, location.lon)
        .then((weatherDataList) => {
          handleWeatherDataChange(location, weatherDataList);
          setFetchingWeatherData(false);
        })
        .catch((error) => {
          if (onlineStatus === false) {
            setShowOfflineModal(true);
            setTimeout(() => {
              setShowOfflineModal(false);
            }, 5500);

            if (previousWeatherData == null) return;

            if (isEqual(previousWeatherData.location, location) === false) {
              setLocation(previousWeatherData.location);
            }
            setWeatherDataList(previousWeatherData.weatherDataList);
            setFetchingWeatherData(false);
          }
        });
    }
  }, [location]);

  function toggleForecastType(timeBasis: "daily" | "hourly") {
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

        forecastContainer.current?.animate(
          forecastContainerAppearingAnimation,
          animationProperties
        );
      }
      return timeBasis;
    });
  }

  return (
    <div className="App">
      {showOfflineModal &&
        createPortal(
          <div className="offline-modal">
            <img src={errorIcon} alt="" /> No internet access
          </div>,
          document.body
        )}
      <OnlineStatusContext.Provider value={onlineStatus}>
        <FetchingWeatherDataContext.Provider value={fetchingWeatherData}>
          <LocationHistoryContext.Provider value={locationHistory}>
            <Weather
              weatherData={weatherDataList.currentData}
              weatherDataType="current"
              dailyWeatherData={weatherDataList.dailyData}
              location={location}
              setLocation={setLocation}
              temperatureUnit={temperatureUnit}
              setTemperatureUnit={setTemperatureUnit}
            />
          </LocationHistoryContext.Provider>
        </FetchingWeatherDataContext.Provider>
      </OnlineStatusContext.Provider>

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

        <OnlineStatusContext.Provider value={onlineStatus}>
          <FetchingWeatherDataContext.Provider value={fetchingWeatherData}>
            <ul
              className="weather-forecast-elements"
              data-timebasis={timeBasis}
              ref={forecastContainer}
            >
              {timeBasis === "daily"
                ? weatherDataList.dailyData.map((dailyWeatherData) => {
                    return (
                      <Weather
                        weatherData={dailyWeatherData}
                        dailyWeatherData={weatherDataList.dailyData}
                        weatherDataType="daily"
                        temperatureUnit={temperatureUnit}
                        key={dailyWeatherData.time || dailyWeatherData.uid}
                      />
                    );
                  })
                : weatherDataList.hourlyData.map((hourlyData) => {
                    return (
                      <Weather
                        weatherData={hourlyData}
                        dailyWeatherData={weatherDataList.dailyData}
                        weatherDataType="hourly"
                        temperatureUnit={temperatureUnit}
                        key={hourlyData.time || hourlyData.uid}
                      />
                    );
                  })}
            </ul>
          </FetchingWeatherDataContext.Provider>
        </OnlineStatusContext.Provider>
      </div>
    </div>
  );
}

export default App;
