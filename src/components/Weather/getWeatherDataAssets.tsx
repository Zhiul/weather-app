import sunIcon from "../../assets/icons/sun.svg";
import moonIcon from "../../assets/icons/moon.svg";
import partlyCloudyIcon from "../../assets/icons/partly-cloudy.svg";
import nightPartlyCloudyIcon from "../../assets/icons/partly-cloudy-night.svg";
import overcastIcon from "../../assets/icons/overcast.svg";
import mistIcon from "../../assets/icons/mist.svg";
import snowIcon from "../../assets/icons/snowflake.svg";
import rainIcon from "../../assets/icons/drizzle.svg";
import nightRainIcon from "../../assets/icons/drizzle-night.svg";
import strongRainIcon from "../../assets/icons/strong-rain.svg";
import thunderstormIcon from "../../assets/icons/thunderstorm.svg";

import blurredDay from "../../assets/blurred_day.jpg";
import clearSky from "../../assets/clear-sky.jpg";
import nightClearSky from "../../assets/clear-sky-night.jpg";
import partlyCloudy from "../../assets/partly-cloudy.jpg";
import nightPartlyCloudy from "../../assets/partly-cloudy.jpg";
import overcast from "../../assets/overcast.jpg";
import nightOvercast from "../../assets/overcast-night.jpg";
import fog from "../../assets/fog.jpg";
import nightFog from "../../assets/fog-night.jpg";
import snow from "../../assets/snow.jpg";
import nightSnow from "../../assets/snow-night.jpg";
import rain from "../../assets/rain.jpg";
import nightRain from "../../assets/rain-night.jpg";
import thunderstorm from "../../assets/thunderstorm.jpg";
import nightThunderstorm from "../../assets/thunderstorm-night.jpg";

class WeatherDataAssets {
  background: string;
  weatherCodeIcon: string;

  constructor(background: string, weatherCodeIcon: string) {
    this.background = background;
    this.weatherCodeIcon = weatherCodeIcon;
  }
}

export default function getWeatherDataAssets(
  weatherCode: string,
  astro: string
) {
  if (weatherCode === "0" || weatherCode === "1")
    return astro === "sun"
      ? new WeatherDataAssets(clearSky, sunIcon)
      : new WeatherDataAssets(nightClearSky, moonIcon);

  if (weatherCode === "2")
    return astro === "sun"
      ? new WeatherDataAssets(partlyCloudy, partlyCloudyIcon)
      : new WeatherDataAssets(nightPartlyCloudy, nightPartlyCloudyIcon);

  if (weatherCode === "3")
    return astro === "sun"
      ? new WeatherDataAssets(overcast, overcastIcon)
      : new WeatherDataAssets(nightOvercast, overcastIcon);

  if (weatherCode === "45")
    return astro === "sun"
      ? new WeatherDataAssets(fog, mistIcon)
      : new WeatherDataAssets(nightFog, mistIcon);

  if (
    ["48", "56", "57", "66", "67", "71", "73", "75", "77", "85", "86"].includes(
      weatherCode
    )
  )
    return astro === "sun"
      ? new WeatherDataAssets(snow, snowIcon)
      : new WeatherDataAssets(nightSnow, snowIcon);

  if (["51", "53", "55", "61", "80", "81"].includes(weatherCode))
    return astro === "sun"
      ? new WeatherDataAssets(rain, rainIcon)
      : new WeatherDataAssets(nightRain, nightRainIcon);

  if (["65, 82"].includes(weatherCode))
    return astro === "sun"
      ? new WeatherDataAssets(rain, strongRainIcon)
      : new WeatherDataAssets(nightRain, strongRainIcon);

  if (["95", "96", "99"].includes(weatherCode))
    return astro === "sun"
      ? new WeatherDataAssets(thunderstorm, thunderstormIcon)
      : new WeatherDataAssets(nightThunderstorm, thunderstormIcon);

  return new WeatherDataAssets(sunIcon, blurredDay);
}
