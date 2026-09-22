"use client"

import { useState, useEffect } from "react"
import { getEvents } from "../admin/api/API"

export const useEvents = (limit = null) => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const data = await getEvents()

      // Ensure data is an array
      const eventsArray = Array.isArray(data) ? data : []

      // Sort by date (newest first) and limit if specified
      const sortedEvents = eventsArray
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit || eventsArray.length)

      setEvents(sortedEvents)
      setError(null)
    } catch (err) {
      console.warn("Warning fetching events:", err?.message || err)
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch events"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [limit])

  return { events, loading, error, refetch: fetchEvents }
}
