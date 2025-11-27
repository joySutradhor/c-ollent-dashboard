'use client'
import React, { useEffect, useState } from 'react'
import { useToken } from '../hooks/GetToken'
import axios from 'axios'
import CommonBanner from '../common/commonBanner'
import Topbar from '../topbar/page'
import { usePathname } from 'next/navigation'
import { FaChevronRight } from 'react-icons/fa'

export default function AdmittedCourse () {
  const [token, userName] = useToken()
  const [data, setData] = useState([])
  const [filterStatus, setFilterStatus] = useState('all')
  const pathname = usePathname()
  console.log(userName)

  const formattedPath = pathname
    .replace(/^\/|\/$/g, '')
    .split('/')
    .map(segment =>
      segment.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
    )
    .join(' / ')

  // Filter data by status
  const filteredData = data?.filter(item => {
    if (filterStatus === 'all') return true
    return item.status.toLowerCase() === filterStatus
  })

  // api call for dashboard
  useEffect(() => {
    if (!token) return

    const fetchData = async () => {
      try {
        console.log(token)
        const response = await axios.get(
          `https://api.eduden.mrshakil.com/api/admitted-courses/`,
          {
            headers: {
              Authorization: `Token ${token}`
            }
          }
        )
        setData(response?.data)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [token])

  console.log(data, 'for addmited course')

  return (
    <section className=''>
      <div className='edn__left__right__space'>
        <Topbar title={formattedPath} />

        {/* Main content */}
        <div className='common_layout '>
          <div className='bg-white rounded-xl  p-5 order_layout_two'>
            <div className='flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-5'>
              <h3 className='edn__section__title'>My Course</h3>

              {/* Select status */}
              <div>
                <select
                  className='border border-black/20 rounded p-2 outline-none'
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value.toLowerCase())}
                >
                  <option value='all'>All</option>
                  <option value='ongoing'>Ongoing</option>
                  <option value='upcoming'>Upcoming</option>
                  <option value='completed'>Complete</option>
                </select>
              </div>
            </div>

            {/* lattest admitted course  */}
            <div className='edn__acp__courses__container'>
              {/* <h3 className='edn__section__title'>Latest admitted course</h3> */}
              <div className='edn__h__course__card__wrapper'>
                {filteredData?.map((course, i) => (
                  <div key={i} className='edn__h__course__item'>
                    <img
                      src={course?.course_thumbnail}
                      className='rounded mb-3 w-full'
                    ></img>
                    <button className='edn__tooltip'>{course?.status}</button>
                    <h3 className='edn__title__heading'>
                      {course?.course_name}
                    </h3>

                    {/* teachers */}
                    <div className='my-5'>
                      {course?.teachers.map((t, i) => (
                        <div key={i}>
                          <div className='flex gap-x-2 items-center mb-2'>
                            {' '}
                            <img
                              src={t.picture}
                              className='size-6 rounded-full'
                            ></img>
                            <h5 className='edn__card__medium__title'>
                              {t?.full_name}
                            </h5>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* button  */}
                    <button className='edn__course__btn'>
                      {' '}
                      View Details{' '}
                      <span>
                        {' '}
                        <FaChevronRight />{' '}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className='order_layout_first'>
            <CommonBanner />
          </div>
        </div>
      </div>
    </section>
  )
}
