import { JourneyHeader } from '@/components/JourneyHeader'
import React from 'react'

function layout({children}: {children: React.ReactNode}) {
  return (
    <div>
        <JourneyHeader />
        {children}
    </div>
  )
}

export default layout