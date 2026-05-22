export const metadata = {
  title: "Not Found",
};

export default function NotFoundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No RootProviders, no AuthProvider, no ProtectedRoute
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
