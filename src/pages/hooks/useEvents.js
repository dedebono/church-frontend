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
      console.log("🔄 Fetching events for homepage...")
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
      console.error("🚨 Fetch error:", err)
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch events"
      setError(errorMessage)
      setEvents([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [limit])

  return { events, loading, error, refetch: fetchEvents }
}
