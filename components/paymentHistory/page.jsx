'use client'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useToken } from '../hooks/GetToken'
import CommonBanner from '../common/commonBanner'
import Topbar from '../topbar/page'
import axios from 'axios'

export default function PaymentHistory () {
  const pathname = usePathname()
  const [token , userId] = useToken()
  const [data, setData] = useState([])

  const formattedPath = pathname
    .replace(/^\/|\/$/g, '')
    .split('/')
    .map(segment =>
      segment.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
    )
    .join(' / ')

  // API call for payment history
  useEffect(() => {
    if (!token) return
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://api.eduden.mrshakil.com/api/payment/`,
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
  }, [token ])

  console.log(data,  'payment')

  return (
    <section className=''>
      <div className='edn__left__right__space'>
        <Topbar title={formattedPath} />

        {/* Main content */}
        <div className='common_layout '>
          <div className='bg-white rounded-xl order_layout_two p-5 overflow-auto'>
            <div className='flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-5'>
              <h3 className='edn__section__title'>Payment History</h3>
            </div>

            {/* Responsive table */}
            <div className='overflow-x-auto'>
              <table className='min-w-full text-sm text-left'>
                <thead className='border-b-[1px] border-dashed border-black/10 text-black/65'>
                  <tr>
                    <th className='p-2'>#</th>
                    <th className='p-2'>Date</th>
                    <th className='p-2'>Student Batch ID</th>
                    <th className='p-2'>Student Name</th>
                    <th className='p-2'>Course Name</th>
                    <th className='p-2'>(₹) Payment Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td
                        colSpan='10'
                        className='text-center p-4 text-gray-500'
                      >
                        No payment history found
                      </td>
                    </tr>
                  ) : (
                    data?.map((item, index) => (
                      <tr key={item.id} className='border-b border-gray-100'>
                        <td className='p-2'>{index + 1}</td>
                        <td className='p-2 edn__title__heading'>
                          <p className='edn__small__text'>
                            {new Date(item?.created_at).toLocaleDateString()}
                          </p>
                        </td>
                        <td className='p-2 edn__small__text'>
                          {item?.student_batch_id}
                        </td>

                        <td className='p-2 edn__small__text'>{item?.student_name}</td>
                        <td className='p-2 edn__small__text'>{item?.course_name}</td>
                        <td className='p-2 edn__small__text'> ₹ {item?.payment_amount} </td>

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
  )
}
