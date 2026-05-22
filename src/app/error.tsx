// src/app/error.tsx
"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
          <h1 className="text-2xl font-bold text-red-600">
            Something went wrong!
          </h1>
          <p className="mt-2 text-gray-500">{error.message}</p>
          <button
            onClick={() => reset()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
