'use client'
import React, { useEffect, useState } from 'react'
import { useToken } from '../hooks/GetToken'
import axios from 'axios'
import CommonBanner from '../common/commonBanner'
import { usePathname } from 'next/navigation'
import Topbar from '../topbar/page'

export default function MyAttendance () {
  const [token] = useToken()
  const [data, setData] = useState([])
  const pathname = usePathname()

  const formattedPath = pathname
    .replace(/^\/|\/$/g, '')
    .split('/')
    .map(segment =>
      segment.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
    )
    .join(' / ')

  // api call for dashboard
  useEffect(() => {
    if (!token) return

    const fetchData = async () => {
      try {
        console.log(token)
        const response = await axios.get(
          `https://api.eduden.mrshakil.com/api/student-attendances/`,
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

  console.log(data, 'for attendace ')

  return (
    <section>
      <section className=''>
        <div className='edn__left__right__space'>
          <Topbar title={formattedPath} />

          {/* Main content */}
          <div className='common_layout '>
            <div className='bg-white rounded-xl  p-5 overflow-auto order_layout_two'>
              <div className='flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-5'>
                <h3 className='edn__section__title'>My Class</h3>
              </div>

              {/* Responsive table */}
              <div className='overflow-x-auto'>
                <table className='min-w-full text-sm text-left'>
                  <thead className='border-b-[1px] border-dashed border-black/10 text-black/65'>
                    <tr>
                      <th className='p-2'>#</th>
                      <th className='p-2'> Sutdent Batch ID</th>
                      <th className='p-2'>Batch Name</th>
                      <th className='p-2'>class No</th>
                      <th className='p-2'>Status</th>
                      <th className='p-2'>Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.length === 0 ? (
                      <tr>
                        <td
                          colSpan='10'
                          className='text-center p-4 text-gray-500'
                        ></td>
                      </tr>
                    ) : (
                      data?.map((item, index) => (
                        <tr key={item.id} className='border-b border-gray-100'>
                          <td className='p-2'>{index + 1}</td>
                          <td className='p-2 edn__small__text text-nowrap'>
                            {item.student_batch_id}
                          </td>
                          <td className='p-2 edn__small__text'>
                            {item.batch_name}
                          </td>
                          <td className='p-2 '>
                            <p className='edn__small__text'>{item.class_no}</p>
                            <p className='edn__xs__text'>{new Date(item.recorded_at).toLocaleDateString()}</p>
                          </td>

                          <td
                            className={`p-2 capitalize edn__card__medium__title 
                              ${
                                item.attendance_status === 'Absent'
                                  ? ' !text-red-500'
                                  : ''
                              }
                              ${
                                item.attendance_status === 'Present'
                                  ? ' !text-green-500'
                                  : ''
                              }`}
                          >
                            {item.attendance_status}
                          </td>

                          <td className='p-2 edn__small__text'>
                            {item.remarks}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {/* End table */}
            </div>
            <div className='order_layout_first'>
              <CommonBanner />
            </div>
          </div>
        </div>
      </section>
    </section>
  )
}
