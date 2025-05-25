export default function NotFoundPage() {
  console.log("Custom 404 loaded");
  return (
    <div className="p-8 text-center">
      <h1 className="text-4xl font-bold text-red-500">404 - Page Not Found</h1>
      <p className="mt-4">Sorry, we couldnt find what you were looking for.</p>
    </div>
  );
}
