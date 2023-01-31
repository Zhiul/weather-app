interface WeatherDataElementProps {
  weatherDataElement:
    | WeatherDataElement<string>
    | WeatherDataElement<{ min: string; max: string }>;
  temperatureUnit?: "celsius" | "fahrenheit";
  setTemperatureUnit?: React.Dispatch<
    React.SetStateAction<"celsius" | "fahrenheit">
  >;
}

const WeatherDataElement = ({
  weatherDataElement,
  temperatureUnit,
  setTemperatureUnit,
}: WeatherDataElementProps) => {
  const getTemperatureInFahrenheit = (value: string) =>
    Math.floor((parseInt(value) * 9) / 5 + 32);
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

        {typeof weatherDataElement.value === "object" ? (
          <>
            <div className="weather-data-element-value">
              <span>
                {" "}
                {temperatureUnit === "fahrenheit"
                  ? getTemperatureInFahrenheit(weatherDataElement.value.max)
                  : weatherDataElement.value.max}
              </span>
              <span className="weather-data-element-value-unit">
                {weatherDataElement.unit}
              </span>
            </div>
            <span className="separator">&nbsp;&nbsp;/&nbsp;</span>
            <div className="weather-data-element-value">
              <span>
                {temperatureUnit === "fahrenheit"
                  ? getTemperatureInFahrenheit(weatherDataElement.value.min)
                  : weatherDataElement.value.min}
              </span>
              <span className="weather-data-element-value-unit">
                {weatherDataElement.unit}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="weather-data-element-value">
              <span>
                {temperatureUnit === "fahrenheit"
                  ? getTemperatureInFahrenheit(weatherDataElement.value)
                  : weatherDataElement.value}
              </span>
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

      {setTemperatureUnit ? (
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
