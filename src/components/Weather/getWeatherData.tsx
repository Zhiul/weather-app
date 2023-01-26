import { DateTime } from "luxon";
import { getWMOCodeDescription } from "./WMODescriptions";
import apparentTemperatureIcon from "../../assets/icons/apparent_temperature.svg";
import humidityIcon from "../../assets/icons/humidity.svg";
import precipitationIcon from "../../assets/icons/precipitation.svg";
import windSpeedIcon from "../../assets/icons/wind_speed.svg";

export const getWeatherData = async (lat: string, lon: string) => {
  const weatherResponse = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=weathercode,temperature_2m,apparent_temperature,relativehumidity_2m,precipitation,windspeed_10m&timezone=auto&windspeed_unit=mph&daily=weathercode,sunrise,sunset,temperature_2m_min,temperature_2m_max,apparent_temperature_max,precipitation_sum,windspeed_10m_max`
  );
  const weatherData = await weatherResponse.json();

  class WeatherDataElement {
    [property: string]: string | { min: string; max: string };

    constructor(
      value: string | { min: string; max: string },
      description = "",
      unit = "",
      icon = ""
    ) {
      this.value = value;
      this.description = description;
      this.unit = unit;
      this.icon = icon;
    }
  }

  class WeatherData {
    [property: string]: WeatherDataElement | string | undefined;

    constructor(
      time: string,
      weatherCode: string,
      temperature: string | { min: string; max: string },
      apparentTemperature: string,
      humidity: string,
      precipitation: string,
      windSpeed: string,
      type: string,
      sunrise?: string | undefined,
      sunset?: string | undefined
    ) {
      this.time = time;
      this.weatherCode = new WeatherDataElement(
        weatherCode,
        getWMOCodeDescription(weatherCode)
      );
      this.temperature = new WeatherDataElement(
        temperature,
        "Temperature",
        "°C"
      );
      this.apparentTemperature = new WeatherDataElement(
        apparentTemperature,
        "Feels like",
        "°C",
        apparentTemperatureIcon
      );
      this.humidity = new WeatherDataElement(
        humidity,
        "Humidity",
        "%",
        humidityIcon
      );
      this.precipitation = new WeatherDataElement(
        precipitation,
        "Precipitation",
        "mm",
        precipitationIcon
      );
      this.windSpeed = new WeatherDataElement(
        windSpeed,
        "Wind speed",
        "mph",
        windSpeedIcon
      );
      (this.type = type), (this.sunset = sunset), (this.sunrise = sunrise);
    }
  }

  function getCurrentData() {
    const currentData = weatherData.current_weather;
    const hourIndex = parseInt(currentData.time.slice(-5, -3));
    const hourlyData = weatherData.hourly;

    const time = currentData.time;
    const weathercode = currentData.weathercode;
    const temperature = Math.floor(
      hourlyData.temperature_2m[hourIndex]
    ).toString();
    const apparentTemperature = Math.floor(
      hourlyData.apparent_temperature[hourIndex]
    ).toString();
    const humidity = hourlyData.relativehumidity_2m[hourIndex];
    const precipitation = hourlyData.precipitation[hourIndex];
    const windSpeed = Math.floor(currentData.windspeed).toString();

    return new WeatherData(
      time,
      weathercode,
      temperature,
      apparentTemperature,
      humidity,
      precipitation,
      windSpeed,
      "current"
    );
  }

  function getHourlyData() {
    const data = weatherData.hourly;
    const currentData = weatherData.current_weather;
    const hourIndex = parseInt(currentData.time.slice(-5, -3));
    const hourlyData = [];

    for (let i = hourIndex + 1; i <= hourIndex + 24; i++) {
      const time = data.time[i];
      const weatherCode = data.weathercode[i];
      const temperature = Math.floor(data.temperature_2m[i]).toString();
      const apparentTemperature = Math.floor(
        data.apparent_temperature[i]
      ).toString();
      const humidity = data.relativehumidity_2m[i];
      const precipitation = data.precipitation[i];
      const windSpeed = Math.floor(data.windspeed_10m[i]).toString();

      hourlyData.push(
        new WeatherData(
          time,
          weatherCode,
          temperature,
          apparentTemperature,
          humidity,
          precipitation,
          windSpeed,
          "hourly"
        )
      );
    }

    return hourlyData;
  }

  function getDailyData() {
    const data = weatherData.daily;
    const hourlyData = weatherData.hourly;
    const dailyData = [];
    const currentTimeDay = DateTime.fromISO(
      weatherData.current_weather.time
    ).startOf("day");

    for (let i = 0; i < 7; i++) {
      const time = data.time[i];
      const weatherCode = data.weathercode[i];
      const dayTime = DateTime.fromISO(time).startOf("day");
      const daysDifference = dayTime.diff(currentTimeDay, "days").values.days;
      const firstDayIndexInHourlyData = daysDifference * 24;
      const lastDayIndexInHourlyData = firstDayIndexInHourlyData + 23;

      const temperature = {
        min: Math.floor(data.temperature_2m_min[i]).toString() as string,
        max: Math.floor(data.temperature_2m_max[i]).toString() as string,
      };
      const apparentTemperature = Math.floor(
        data.apparent_temperature_max[i]
      ).toString();

      let humidity: string | number = 0;

      for (
        let i = firstDayIndexInHourlyData;
        i <= lastDayIndexInHourlyData;
        i++
      ) {
        humidity += parseFloat(hourlyData.relativehumidity_2m[i]);
      }

      humidity = Math.floor(humidity / 24).toString();

      const precipitation = data.precipitation_sum[i];
      const windSpeed = Math.floor(data.windspeed_10m_max[i]).toString();
      const sunrise = data.sunrise[i];
      const sunset = data.sunset[i];

      dailyData.push(
        new WeatherData(
          time,
          weatherCode,
          temperature,
          apparentTemperature,
          humidity,
          precipitation,
          windSpeed,
          "daily",
          sunrise,
          sunset
        )
      );
    }

    return dailyData;
  }

  const currentData = getCurrentData();
  const hourlyData = getHourlyData();
  const dailyData = getDailyData();

  return { currentData, hourlyData, dailyData };
};
