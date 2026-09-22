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
      console.warn("Warning fetching gallery photos:", err?.message || err)
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch GalleryPhotos"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGalleryPhotos()
  }, [limit])

  return { GalleryPhotos, loading, error, refetch: fetchGalleryPhotos }
}
