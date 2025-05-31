//import React from 'react'
import Nave from '../Pages/Nave'
import UserMainPage from './UserMainPage'
import UserSideBar from './UserSideBar'


const UserDashboard = () => {
  return (
    <>
    <Nave />
    <div className="flex">
    <UserSideBar/>
    <UserMainPage/>
    </div>
    </>
  )
}

export default UserDashboard