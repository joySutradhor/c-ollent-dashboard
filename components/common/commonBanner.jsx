'use client'
import React, { useEffect, useState } from 'react'
import { useToken } from '../hooks/GetToken'
import axios from 'axios'

export default function CommonBanner () {
  const [token] = useToken()
  const [data, setData] = useState([])

  const formatTime12Hour = timeStr => {
    if (!timeStr) return ''
    const [hour, minute] = timeStr.split(':')
    const h = parseInt(hour)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const hour12 = h % 12 || 12
    return `${hour12}:${minute} ${ampm}`
  }

  // API call for class schedule
  useEffect(() => {
    if (!token) return
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://api.eduden.mrshakil.com/api/class-schedules/`,
          {
            headers: {
              Authorization: `Token ${token}`
            }
          }
        )
        setData(response?.data[0] || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [token])

  console.log(data, 'data for class ')

  return (
    <div className='bg-[url("https://ik.imagekit.io/0lnr4mwox/eduden-lattest/hero/Hero%20Banner/header.jpg?updatedAt=1747737193499")] edn__cb__wrapper'>
      <div className='edn__cb__content__parent'>
        <div>
          <img
            src="https://ik.imagekit.io/0lnr4mwox/Ethical%20den%20-%20gsap/Frame.png?updatedAt=1748177978556"
            width={100}
            height={100}
            alt='calender icon sidebar'
            className='object-cover size-12 md:size-20 lg:size-20 xl:size-16 2xl:size-20 h-full w-full'
          />
        </div>
        <div className='space-y-1'>
          <h2 className='edn__cb__heading__text'>Your Upcoming Class</h2>
          <p className='edn__cb__title'>{data?.class_title}</p>
          <p className='edn__cb__date'>
            {data?.class_date}- - {formatTime12Hour(data.class_start)}
          </p>
        </div>
      </div>
    </div>
  )
}
