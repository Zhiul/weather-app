import { useContext } from "react";
import { FetchingWeatherDataContext } from "../../App";

const WeatherDataElement = ({
  weatherDataElement,
  weatherDataType,
  temperatureUnit,
  setTemperatureUnit,
}) => {
  const fetchingWeatherData = useContext(FetchingWeatherDataContext);
  return (
    <li
      className="weather-data-element"
      data-type={weatherDataElement.description}
    >
      {weatherDataElement.description !== "Temperature" ? (
        <div
          className="weather-data-element-icon"
          style={{
            backgroundImage: `url(${weatherDataElement.icon})`,
          }}
        ></div>
      ) : null}

      <div className="weather-data-element-info">
        <div className="weather-data-element-title">
          {weatherDataElement.description}
        </div>

        {weatherDataElement.description === "Temperature" &&
        weatherDataType === "daily" ? (
          <>
            <div className="weather-data-element-value">
              {weatherDataElement.value.max}
              <span className="weather-data-element-value-unit">
                {weatherDataElement.unit}
              </span>
            </div>
            <span className="separator">&nbsp;&nbsp;/&nbsp;</span>
            <div className="weather-data-element-value">
              {weatherDataElement.value.min}
              <span className="weather-data-element-value-unit">
                {weatherDataElement.unit}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="weather-data-element-value">
              {temperatureUnit === "fahrenheit"
                ? Math.floor((weatherDataElement.value * 9) / 5 + 32)
                : weatherDataElement.value}

              <span className="weather-data-element-value-unit">
                {weatherDataElement.description === "Precipitation" ||
                weatherDataElement.description === "Wind speed"
                  ? " " + weatherDataElement.unit
                  : weatherDataElement.unit}
              </span>
            </div>
          </>
        )}
      </div>

      {weatherDataType === "current" &&
      weatherDataElement.description === "Temperature" ? (
        <div
          className="weather-temperature-toggle-button"
          data-unit={temperatureUnit}
          onClick={() => {
            const unit =
              temperatureUnit === "celsius" ? "fahrenheit" : "celsius";
            setTemperatureUnit(unit);
          }}
        ></div>
      ) : null}
    </li>
  );
};

export { WeatherDataElement as WeatherDataElement };
