import WeatherIcon from "./WeatherIcon";

export default function WeatherCard({
  weather,
  location,
}: {
  weather: any;
  location: any;
}) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-5xl font-bold text-white">
            {weather.loading ? "Loading..." : `${weather.temperature}°C`}
          </h1>
          <p className="text-white/80 mt-1">
            H:{weather.high}° L:{weather.low}° — {weather.condition}
          </p>
          <p className="text-white/70 text-sm">{location.address}</p>
        </div>
        <WeatherIcon iconCode={weather.icon} condition={weather.condition} />
      </div>
    </div>
  );
}
