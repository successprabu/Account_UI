import React from 'react'
import { Outlet } from 'react-router-dom'
import ContactUs from './ContactUs'

const ContactUsLayout = () => {
  return (
    <>
   <ContactUs/>
   <Outlet/>
    </>
  )
}

export default ContactUsLayout