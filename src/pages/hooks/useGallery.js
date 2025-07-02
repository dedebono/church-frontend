"use client"

import { useState, useEffect } from "react"
import { getGalleryPhotos } from "../admin/api/API"

export const useGalleryPhotos = (limit = null) => {
  const [GalleryPhotos, setGalleryPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchGalleryPhotos = async () => {
    try {
      setLoading(true)
      console.log("🔄 Fetching GalleryPhotos for homepage...")
      const data = await getGalleryPhotos()

      // Ensure data is an array
      const GalleryPhotosArray = Array.isArray(data) ? data : []

      // Sort by date (newest first) and limit if specified
      const sortedGalleryPhotos = GalleryPhotosArray
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit || GalleryPhotosArray.length)

      setGalleryPhotos(sortedGalleryPhotos)
      setError(null)
    } catch (err) {
      console.error("🚨 Fetch error:", err)
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch GalleryPhotos"
      setError(errorMessage)
      setGalleryPhotos([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGalleryPhotos()
  }, [limit])

  return { GalleryPhotos, loading, error, refetch: fetchGalleryPhotos }
}
