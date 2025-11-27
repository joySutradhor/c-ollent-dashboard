'use client'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { FaHome } from 'react-icons/fa'
import profile from '@/public/logo/profile.jpeg'
import { useToken } from '../hooks/GetToken'
import axios from 'axios'

export default function Topbar ({ title }) {
  const [data, setData] = useState([])
  // const [token ] = useToken()

  // useEffect(() => {
  //   if (!token) return
  //   const fetchData = async () => {
  //     try {
  //       const response = await axios.get(
  //         `https://api.eduden.mrshakil.com/api/profile-update/`,
  //         {
  //           headers: {
  //             Authorization: `Token ${token}`
  //           }
  //         }
  //       )
  //       const profile = response?.data
  //       setData(profile)
  //     } catch (error) {
  //       console.error('Error fetching data:', error)
  //     }
  //   }

  //   fetchData()
  // }, [token])

  // console.log(data , "profile topbar")

  return (
    <div className='edn__tb__wrapper'>
      <div>
        <div className='edn__tb__parent'>
          <span>
            <FaHome className='edn__icon' />
          </span>
          {title}
        </div>
      </div>
      {/* profile */}
      <div>
        <Link href='/dashboard/profile'>
          <img
            src={data?.picture}
            height={100}
            width={100}
            alt='profile image'
            className='object-cover size-10 rounded-full '
            title={data?.full_name}
          />
        </Link>
      </div>
    </div>
  )
}
