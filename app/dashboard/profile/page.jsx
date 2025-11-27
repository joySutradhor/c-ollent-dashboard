import ProfilePage from '@/components/profilePage/page'
import React from 'react'

export const metadata = {
  title: 'Ollent - Profile',
  description:
    'Manage your personal information, update contact details, and customize your student profile easily through your Eduden dashboard.'
}

export default function page () {
  return (
    <section>
      {' '}
      <ProfilePage />{' '}
    </section>
  )
}
