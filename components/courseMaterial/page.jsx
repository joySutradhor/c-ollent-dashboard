'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useToken } from '../hooks/GetToken'
import Topbar from '../topbar/page'
import { FaDownload } from 'react-icons/fa6'
import { usePathname } from 'next/navigation'
import {
  FaFilePdf,
  FaFileImage,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaFileAlt
} from 'react-icons/fa'

export default function CourseMaterial () {
  const pathname = usePathname()
  const [token] = useToken()
  const [data, setData] = useState([])
  const [filterCourse, setFilterCourse] = useState('all')

  const getFileIcon = fileType => {
    const ext = fileType.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'svg', 'webp', 'gif'].includes(ext))
      return <FaFileImage className='text-blue-500 text-2xl' />
    if (['pdf'].includes(ext))
      return <FaFilePdf className='text-red-500 text-2xl' />
    if (['doc', 'docx'].includes(ext))
      return <FaFileWord className='text-amber-300 text-2xl' />
    if (['xls', 'xlsx'].includes(ext))
      return <FaFileExcel className='text-green-600 text-2xl' />
    if (['ppt', 'pptx'].includes(ext))
      return <FaFilePowerpoint className='text-orange-500 text-2xl' />
    return <FaFileAlt className='text-gray-500 text-2xl' />
  }

  useEffect(() => {
    if (!token) return

    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://api.eduden.mrshakil.com/api/class-materials/`,
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

  const formattedPath = pathname
    .replace(/^\/|\/$/g, '')
    .split('/')
    .map(segment =>
      segment.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
    )
    .join(' / ')

  const handleDownload = async (fileUrl, filename) => {
    try {
      const response = await fetch(fileUrl, { mode: 'cors' })
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename || 'download'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const courseOptions = ['all', ...new Set(data.map(item => item.course_name))]

  const filteredData = data?.filter(item => {
    if (filterCourse === 'all') return true
    return item.course_name === filterCourse
  })

  return (
    <section className=''>
      <div className='pr-6 xl:pr-[2vw] pt-[2vh]'>
        <Topbar title={formattedPath} />

        <div className=' '>
          <div className='bg-white rounded-xl  p-5'>
            <div className='flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-5'>
              <h3 className='edn__section__title'>Course Material</h3>

              {/* Course Name Filter Dropdown */}
              <div className='overflow-hidden'>
                <select
                  className='border border-black/20 rounded p-2 outline-none'
                  value={filterCourse}
                  onChange={e => setFilterCourse(e.target.value)}
                >
                  {courseOptions.map((course, idx) => (
                    <option key={idx} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Course Materials List */}
            <div className=''>
              {filteredData.length > 0 ? (
                <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-10 mb-10'>
                  {filteredData.map((d, i) => (
                    <div
                      key={i}
                      className='border border-black/10 rounded-xl p-4  '
                    >
                      <div>
                        <p className=' mt-2 mb-3 edn__small__text'>
                          {new Date(d.uploaded_at).toLocaleDateString()}
                        </p>
                        <div>
                          <h2 className='edn__title__heading'>{d.title}</h2>
                          <h2 className='edn__small__text'>{d.course_name}</h2>

                          {/* {d?.files.map((f, i) => (
                            <div
                              key={i}
                              onClick={() =>
                                handleDownload(
                                  f.file,
                                  `${f.filename}.${f.file_type}`
                                )
                              }
                              className='flex justify-between p-5 rounded-lg bg-gray-100 mt-5 gap-3 mb-2 items-center cursor-pointer hover:bg-gray-50 transition'
                            >
                              <div>
                                <p className='edn__small__text'>
                                  {f?.filename}
                                </p>
                                <p className='edn__xs__text'>{f?.file_type}</p>
                              </div>
                              <div>
                                <FaDownload className='text-xl text-[#FBBD08]' />
                              </div>
                            </div>
                          ))} */}

                          {d?.files.map((f, i) => (
                            <div
                              key={i}
                              onClick={() =>
                                handleDownload(
                                  f.file,
                                  `${f.filename}.${f.file_type}`
                                )
                              }
                              className='flex justify-between p-5 rounded-lg bg-gray-100 mt-5 gap-3 mb-2 items-center cursor-pointer hover:bg-gray-50 transition'
                            >
                              <div className='flex items-center gap-3 flex-wrap overflow-hidden'>
                                {getFileIcon(f.file_type)}
                                <div>
                                  <p className='edn__small__text '>
                                    {f?.filename}
                                  </p>
                                  <p className='edn__xs__text uppercase'>
                                    {f?.file_type}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <FaDownload className='text-xl text-[#FBBD08]' />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-gray-500 mt-10'>No course material found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
