import {createContext} from "react";
import {useState} from "react";

export const authContext = createContext()

const authProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error,setError] = useState(null)

    return (
        <authContext.Provider value={{user, setUser, loading, setLoading,error, setError}}>
            {children}
        </authContext.Provider>
    )
}
export default authProvider
