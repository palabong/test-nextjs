"use client"

import { useState } from "react"

export default function SecureDashboard() {
  const [data, setData] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/secure/data")
      if (res.ok) {
        const json = await res.json()
        setData(json.secret_payload)
      } else {
        const json = await res.json().catch(() => ({}))
        setError(json.error || `Request failed with status ${res.status}`)
      }
    } catch {
      setError("Network error while contacting the secure endpoint.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="p-10 font-sans">
      <h1 className="text-2xl font-bold">Enterprise Secure Dashboard</h1>
      <button
        onClick={fetchData}
        disabled={loading}
        aria-label="Fetch Secure Data"
        className="mt-5 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
      >
        {loading ? "Extracting..." : "Extract Payload"}
      </button>
      {data && (
        <div id="payload-container" className="mt-5 p-4 border border-green-500 bg-green-50 text-green-900 rounded">
          {data}
        </div>
      )}
      {error && (
        <div className="mt-5 p-4 border border-red-500 bg-red-50 text-red-900 rounded" role="alert">
          {error}
        </div>
      )}
    </main>
  )
}
