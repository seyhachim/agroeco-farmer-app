export default function WeatherIcon({
  iconCode,
  condition,
}: {
  iconCode: string;
  condition: string;
}) {
  const code = parseInt(iconCode);
  const emoji =
    code === 0
      ? "☀️"
      : code <= 3
      ? "⛅"
      : code <= 67
      ? "🌧️"
      : code <= 77
      ? "❄️"
      : code >= 80
      ? "⛈️"
      : "☀️";

  return (
    <div className="w-16 h-16 text-4xl flex items-center justify-center">
      {emoji}
    </div>
  );
}
