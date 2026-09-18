import React from 'react'
import useAuth from "../hooks/useAuth.jsx";
import Loader from "../../Shared/components/Loader.jsx";
import {Navigate} from "react-router-dom";

const Public = ({children}) => {
    const {loading,user} = useAuth()

    if (loading){
        return <Loader/>
    }

    if (user){
        return <Navigate to={'/'}/>
    }

    return children
}
export default Public
