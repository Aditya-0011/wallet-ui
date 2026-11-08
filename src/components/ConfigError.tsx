export function ConfigError({ errors }: { errors: readonly string[] }) {
  return (
    <div
      role="alert"
      className="flex min-h-screen items-center justify-center bg-neutral-950 p-6 text-white"
    >
      <div className="max-w-lg">
        <h1 className="text-xl font-semibold">Configuration error</h1>
        <p className="mt-2 text-sm text-neutral-400">
          This build is missing required environment variables:
        </p>
        <ul className="mt-3 list-inside list-disc text-sm text-red-400">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
