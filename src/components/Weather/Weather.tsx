import { useEffect, useState, useContext } from "react";
import { FetchingWeatherDataContext } from "../../App";

import { SearchBar } from "../SearchBar";
import { ReactComponent as LocationIcon } from "../../assets/icons/location.svg";
import { WeatherDataElement } from "./WeatherElement";

import sunIcon from "../../assets/icons/sun.svg";
import getWeatherDataAssets from "./getWeatherDataAssets";
import weatherDataBackgroundPlaceholder from "../../assets/blurred_day.jpg";

import { DateTime } from "luxon";

interface WeatherProps {
  weatherData: WeatherData<string> | WeatherData<{ min: string; max: string }>;
  dailyWeatherData: WeatherDailyData[];
  weatherDataType: "current" | "daily" | "hourly";
  location?: LocationData;
  setLocation?: React.Dispatch<React.SetStateAction<LocationData>>;
  temperatureUnit: "celsius" | "fahrenheit";
  setTemperatureUnit?: React.Dispatch<
    React.SetStateAction<"celsius" | "fahrenheit">
  >;
}

const Weather = ({
  weatherData,
  dailyWeatherData,
  weatherDataType,
  location,
  setLocation,
  temperatureUnit,
  setTemperatureUnit,
}: WeatherProps) => {
  const [weatherBackground, setWeatherBackground] = useState("");
  const [weatherIcon, setWeatherIcon] = useState("");

  const fetchingWeatherData = useContext(FetchingWeatherDataContext);

  useEffect(() => {
    // Set weather code icon and weather component background

    if (fetchingWeatherData) {
      setWeatherBackground("");
      setWeatherIcon(sunIcon);
      return;
    }

    if (weatherData.type === "daily") {
      const astro = "sun";
      const weatherDataAssets = getWeatherDataAssets(
        weatherData.weatherCode.value,
        astro
      );
      setWeatherBackground(weatherDataAssets.background);
      setWeatherIcon(weatherDataAssets.weatherCodeIcon);
      return;
    }

    const time = DateTime.fromISO(weatherData.time);
    const timeDay = time.startOf("day");
    const today = DateTime.fromISO(dailyWeatherData[0].time).startOf("day");
    const timeIndex = timeDay.diff(today, "days").values.days;

    const sunriseTime = DateTime.fromISO(dailyWeatherData[timeIndex].sunrise);
    const sunsetTime = DateTime.fromISO(dailyWeatherData[timeIndex].sunset);
    const astro = time > sunriseTime && time < sunsetTime ? "sun" : "moon";

    const weatherDataAssets = getWeatherDataAssets(
      weatherData.weatherCode.value,
      astro
    );
    setWeatherBackground(weatherDataAssets.background);
    setWeatherIcon(weatherDataAssets.weatherCodeIcon);
  }, [weatherData]);

  return (
    <div
      className="weather-data-container"
      data-type={weatherDataType}
      data-fetching-weather-data={fetchingWeatherData ? "true" : ""}
    >
      <div
        className="weather-data-container-bg"
        style={{
          backgroundImage: `url('${weatherBackground}')`,
          backgroundPosition: "54% 100%",
        }}
      ></div>

      <div
        className="weather-data-container-bg-placeholder"
        style={{
          backgroundImage: `url('${weatherDataBackgroundPlaceholder}')`,
          backgroundPosition: "54% 100%",
        }}
      ></div>

      {location && setLocation ? (
        <SearchBar currentLocation={location} setLocation={setLocation} />
      ) : null}

      <ul className="weather-data-inner-container">
        <li className="weather-meta-info" key="weather-meta-info">
          {location ? (
            <div className="weather-location">
              <div className="weather-location-city">
                <span className="weather-location-icon">
                  <LocationIcon />
                </span>
                <span>{location.cityName}</span>
              </div>

              {location.stateName ? (
                <div className="weather-location-state">
                  <span>{location.stateName}</span>
                </div>
              ) : null}

              <div className="weather-location-country">
                <span>{location.countryName}</span>
              </div>
            </div>
          ) : null}

          <div className="weather-time">
            <span>
              {fetchingWeatherData
                ? ""
                : weatherData.type === "current" &&
                  `Today, ${DateTime.fromISO(weatherData.time).toFormat(
                    "LLL dd h:mm a"
                  )}`}

              {fetchingWeatherData
                ? ""
                : weatherData.type === "daily" &&
                  DateTime.fromISO(weatherData.time).toFormat("LLL dd")}

              {fetchingWeatherData
                ? ""
                : weatherDataType === "hourly" &&
                  DateTime.fromISO(weatherData.time).toFormat("h a")}
            </span>
          </div>
        </li>

        <div className="weather-data-elements-container">
          <li
            className="weather-data-element"
            data-type="weather-code"
            key="weatherCode"
          >
            <div
              className="weather-data-element-icon"
              style={{
                backgroundImage: `url(${weatherIcon})`,
              }}
            ></div>

            <div className="weather-data-element-info">
              <div className="weather-data-element-title">Weather Code</div>

              <div className="weather-data-element-description">
                {weatherData.weatherCode.description}
              </div>

              <div className="weather-data-element-value">
                {weatherData.weatherCode.value}
              </div>
            </div>
          </li>

          <WeatherDataElement
            key="temperature"
            weatherDataElement={weatherData.temperature}
            temperatureUnit={temperatureUnit}
            setTemperatureUnit={setTemperatureUnit}
          />
        </div>

        <div className="weather-data-elements-container-2">
          <WeatherDataElement
            key="apparentTemperature"
            weatherDataElement={weatherData.apparentTemperature}
            temperatureUnit={temperatureUnit}
          />

          <WeatherDataElement
            key="humidity"
            weatherDataElement={weatherData["humidity"]}
          />

          <WeatherDataElement
            key="precipitation"
            weatherDataElement={weatherData["precipitation"]}
          />

          <WeatherDataElement
            key="windSpeed"
            weatherDataElement={weatherData["windSpeed"]}
          />
        </div>
      </ul>
    </div>
  );
};

export default Weather;
