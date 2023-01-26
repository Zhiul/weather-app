declare interface WeatherDataElement {
  value: string | { min: string; max: string };
  description: string;
  unit: string;
  icon: string;
}

declare interface WeatherData {
  time: string;
  weatherCode: WeatherDataElement;
  temperature: WeatherDataElement;
  apparentTemperature: WeatherDataElement;
  humidity: WeatherDataElement;
  precipitation: WeatherDataElement;
  windSpeed: WeatherDataElement;
  type: string;
  sunrise?: string | undefined;
  sunset?: string | undefined;
}
