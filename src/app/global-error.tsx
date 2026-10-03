"use client"

// Replaces the root layout when it fails, so globals.css and fonts are not available here.
export default function GlobalError({
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeContent: "center",
          gap: 16,
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#ffffff",
          color: "#000350",
        }}
      >
        <title>Something went wrong | MicroClub</title>
        <h1>Something went wrong</h1>
        <button
          type="button"
          onClick={() => retry()}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: 0,
            background: "#0006b1",
            color: "#ffffff",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  )
}
