import React from 'react'
import useAuth from '../../Auth/hooks/useAuth'
import Loader from '../../Shared/components/Loader'
import {Navigate} from 'react-router-dom'

const Private = ({children}) => {
   const {user,loading} = useAuth()

   if(loading){
    return <Loader />
   }

   if(!user){
    return <Navigate to='/login' />
   }
   
  return children
}

export default Private
