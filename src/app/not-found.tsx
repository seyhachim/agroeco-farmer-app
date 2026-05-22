// app/not-found.js
"use client";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      <p className="text-gray-500 mt-2">Sorry, we couldn’t find this page.</p>
      <a href="/" className="mt-4 text-blue-600 underline">
        Go back home
      </a>
    </div>
  );
}
