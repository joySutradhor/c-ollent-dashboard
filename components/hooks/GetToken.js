"use client"
const { useState, useEffect } = require('react')

export const useToken = () => {
  const [token, setToken] = useState(null)
  const [userId, setUserId] = useState(null)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token')
      const storedUserId = localStorage.getItem('userId')
      setToken(storedToken)
      setUserId(storedUserId)
    }
  }, [])

  return [token, userId]
}
