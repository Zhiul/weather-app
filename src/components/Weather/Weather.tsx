import { DateTime } from "luxon";
import { useEffect, useState, useContext } from "react";
import { FetchingWeatherDataContext } from "../../App";
import { ReactComponent as LocationIcon } from "../../assets/icons/location.svg";
import { SearchBar } from "../SearchBar";
import { WeatherDataElement } from "./WeatherElement";
import sunIcon from "../../assets/icons/sun.svg";
import getWeatherDataAssets from "./getWeatherDataAssets";
import weatherDataBackgroundPlaceholder from "../../assets/blurred_day.jpg";

const Weather = ({
  weatherData,
  dailyWeatherData,
  weatherDataType,
  location,
  setLocation,
  temperatureUnit,
  setTemperatureUnit,
}) => {
  const [weatherBackground, setWeatherBackground] = useState("");
  const [weatherIcon, setWeatherIcon] = useState("");
  const fetchingWeatherData = useContext(FetchingWeatherDataContext);

  useEffect(() => {
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
    <div className="weather-data-container" data-type={weatherDataType}>
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

      {weatherDataType === "current" ? (
        <SearchBar currentLocation={location} setLocation={setLocation} />
      ) : null}

      <ul className="weather-data-inner-container">
        <li className="weather-meta-info" key="weather-meta-info">
          {weatherDataType === "current" ? (
            <div className="weather-location">
              <div className="weather-location-city">
                <span className="weather-location-icon">
                  <LocationIcon />
                </span>
                {location?.cityName}
              </div>

              {location?.stateName ? (
                <div className="weather-location-state">
                  {location?.stateName}
                </div>
              ) : null}

              <div className="weather-location-country">
                {location?.countryName}
              </div>
            </div>
          ) : null}

          <div className="weather-time">
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
            weatherDataType={weatherData.type}
            temperatureUnit={temperatureUnit}
            setTemperatureUnit={setTemperatureUnit}
          />
        </div>

        <div className="weather-data-elements-container-2">
          <WeatherDataElement
            key="apparentTemperature"
            weatherDataElement={weatherData.apparentTemperature}
            weatherDataType={weatherData.type}
            temperatureUnit={temperatureUnit}
            setTemperatureUnit={setTemperatureUnit}
          />

          {["humidity", "precipitation", "windSpeed"].map((element) => {
            return (
              <WeatherDataElement
                key={element}
                weatherDataElement={weatherData[element]}
                weatherDataType={weatherData.type}
              />
            );
          })}
        </div>
      </ul>
    </div>
  );
};

export default Weather;
