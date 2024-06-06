import React from 'react'
import AppHeader from './header'
import { Outlet } from 'react-router-dom'

const Rootlayout = () => {
  return (
    <>
   <AppHeader/>
   <Outlet/>
    </>
  )
}

export default Rootlayout