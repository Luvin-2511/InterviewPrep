import React, { createContext, useState } from 'react'
export const interviewContext = createContext()

const interviewProvider = ({children}) => {
    const [loading, setloading] = useState(false)
    const [report, setreport] = useState(null)
    const [allreports, setallreports] = useState([])

  return (
    <interviewContext.Provider value={{loading,setloading,report,setreport,allreports,setallreports}}>
      {children}
    </interviewContext.Provider>
  )
}

export default interviewProvider
