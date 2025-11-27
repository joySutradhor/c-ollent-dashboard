"use client"
import React from 'react'
import Topbar from '../topbar/page'
import { usePathname } from 'next/navigation'

export default function MyCertificate () {
  const pathname = usePathname()

  const formattedPath = pathname
    .replace(/^\/|\/$/g, '')
    .split('/')
    .map(segment =>
      segment.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
    )
    .join(' / ')

  return (
    <section className=''>
      <div className='edn__left__right__space'>
        <Topbar title={formattedPath} />

        <div className=''>
          <div className='bg-white rounded-xl  p-5 h-[40vh]'>
              <h3 className='edn__section__title'>Certificate</h3>

            <p className='flex justify-center items-center h-full w-full'>
              You have no certificate yet
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
