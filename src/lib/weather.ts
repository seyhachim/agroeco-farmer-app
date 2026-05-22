export type WeatherData = {
  temperature: number;
  high: number;
  low: number;
  condition: string;
  icon: string;
  error: string | null;
  loading: boolean;
};

// Responsibility: fetch weather by coordinates.

export async function getWeather(
  lat: number,
  lon: number
): Promise<WeatherData> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,apparent_temperature&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
    const res = await fetch(url);
    const data = await res.json();

    const code = data.current.weather_code;
    const getCondition = (code: number) => {
      if (code === 0) return "Clear";
      if (code <= 3) return "Cloudy";
      if (code >= 45 && code <= 48) return "Fog";
      if (code >= 51 && code <= 67) return "Rain";
      if (code >= 80) return "Thunderstorm";
      return "Unknown";
    };

    return {
      temperature: Math.round(data.current.temperature_2m),
      high: Math.round(data.daily.temperature_2m_max[0]),
      low: Math.round(data.daily.temperature_2m_min[0]),
      condition: getCondition(code),
      icon: code.toString(),
      error: null,
      loading: false,
    };
  } catch (err) {
    return {
      temperature: 0,
      high: 0,
      low: 0,
      condition: "Unknown",
      icon: "",
      error: "Failed to fetch weather",
      loading: false,
    };
  }
}
