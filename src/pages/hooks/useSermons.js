"use client"

import { useState, useEffect } from "react"
import { getSermons } from "../admin/api/API"

export const useSermons = (limit = null) => {
  const [sermons, setSermons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSermons = async () => {
    try {
      setLoading(true)
      const data = await getSermons()

      // Ensure data is an array
      const sermonsArray = Array.isArray(data) ? data : []

      // Sort by date (newest first) and limit if specified
      const sortedSermons = sermonsArray
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit || sermonsArray.length)

      setSermons(sortedSermons)
      setError(null)
    } catch (err) {
      console.warn("Warning fetching sermons:", err?.message || err)
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch sermons"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSermons()
  }, [limit])

  return { sermons, loading, error, refetch: fetchSermons }
}
