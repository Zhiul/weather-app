export {};

declare global {
  interface LocationData {
    countryName: string;
    stateName: string;
    cityName: string;
    lat: string;
    lon: string;
  }

  interface LocationHistory {
    data: LocationData[];
    addLocation: (location: LocationData) => void;
  }

  type assignLocation = (location: LocationData) => void;

  interface WeatherDataList {
    currentData: WeatherData;
    hourlyData: WeatherData[];
    dailyData: WeatherDailyData[];
  }

  interface WeatherData<TemperatureValueUnit> {
    time: string;
    weatherCode: WeatherDataElement<string>;
    temperature: WeatherDataElement<TemperatureValueUnit>;
    apparentTemperature: WeatherDataElement<string>;
    humidity: WeatherDataElement<string>;
    precipitation: WeatherDataElement<string>;
    windSpeed: WeatherDataElement<string>;
    type: "current" | "daily" | "hourly";
    uid?: string;
  }

  interface WeatherDailyData extends WeatherData<{ min: string; max: string }> {
    type: "daily";
    sunrise: string;
    sunset: string;
  }

  interface WeatherDataElement<ValueType = string> {
    value: ValueType;
    description: string;
    unit: string;
    icon: string;
  }
}
