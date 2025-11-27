'use client'
import Topbar from '@/components/topbar/page'
import { usePathname } from 'next/navigation'
import { useToken } from '../hooks/GetToken'
import { useEffect, useState } from 'react'
import axios from 'axios'
import CommonBanner from '../common/commonBanner'

function ClassSchedule () {
  const pathname = usePathname()
  const [token] = useToken()
  const [data, setData] = useState([])
  const [filterStatus, setFilterStatus] = useState('all')

  // Format time to 12-hour AM/PM
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
        setData(response?.data || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [token])

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

  return (
    <section className='edn__sideToLeftSpace'>
      <div className='edn__left__right__space'>
        <Topbar title={formattedPath} />

        {/* Main content */}
        <div className='common_layout '>
          <div className='bg-white rounded-xl  p-5 order_layout_two overflow-x-auto'>
            <div className='flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-5 w-full'>
              <h3 className='edn__section__title'>My Class</h3>

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
                  <option value='complete'>Complete</option>
                </select>
              </div>
            </div>

            {/* Responsive table */}
            <div className=''>
              <table className='min-w-full text-sm text-left'>
                <thead className='border-b-[1px] border-dashed border-black/10 text-black/65'>
                  <tr>
                    <th className='p-2'>#</th>
                    <th className='p-2'>Batch</th>
                    <th className='p-2'>Title</th>
                    <th className='p-2 '>Mentor</th>
                    <th className='p-2 '>Start Time</th>
                    <th className='p-2 '>End Time</th>
                    <th className='p-2'>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td
                        colSpan='10'
                        className='text-center p-4 text-gray-500'
                      >
                        No class found for "{filterStatus}".
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item, index) => (
                      <tr key={item.id} className='border-b border-gray-100'>
                        <td className='p-2'>{index + 1}</td>
                        <td className='p-2 edn__small__text'>
                          {item.batch_name}
                        </td>
                        <td className='p-2 edn__title__heading text-nowrap'>
                          {item.class_title}
                          <p className='edn__small__text'>{item.class_date}</p>
                        </td>
                        <td className=' lg:p-2 '>
                          {item.teachers?.map((teacher, index) => (
                            <div
                              key={index}
                              className='flex items-center gap-2 mb-2 pr-10 xl:pr-2'
                            >
                              <img
                                src={teacher.picture}
                                alt={teacher.full_name}
                                className='w-6 h-6 rounded-full object-cover'
                              />
                              <span>{teacher.full_name}</span>
                            </div>
                          ))}
                        </td>
                        <td className='p-2 edn__small__text '>
                          {formatTime12Hour(item.class_start)}
                        </td>
                        <td className='p-2 edn__small__text '>
                          {formatTime12Hour(item.class_end)}
                        </td>

                        <td
                          className={`p-2 capitalize font-medium text-xs rounded 
                          ${item.status === 'Upcoming' ? ' text-amber-500' : ''}
                          ${item.status === 'Ongoing' ? ' text-orange-200' : ''}
                          ${
                            item.status === 'Complete' ? ' text-green-700' : ''
                          }`}
                        >
                          {item.status}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* End table */}
          </div>
          <div className=' order_layout_first'>
            <CommonBanner />
          </div>
        </div>
      </div>
    </section>
  )
}

export default ClassSchedule
