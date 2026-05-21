import { Outlet } from "react-router-dom"
import { useEffect, useRef, useState, useContext } from 'react'
import { useRefreshMutation } from "./authApiSlice"
import usePersist from "../../hooks/usePersist"
import { useSelector } from 'react-redux'
import { selectCurrentToken, selectCurrentUser } from "./authSlice"
import dataApplicationsContext from '../../context/dataApplicationsContext';

const PersistLogin = () => {
    const { setAuth, setIsAuthLoading } = useContext(dataApplicationsContext);

    const [persist] = usePersist()

    const token = useSelector(selectCurrentToken);
    const effectRan = useRef(false)
    
    const [refresh, { isUninitialized, isLoading, isSuccess, isError, error }] = useRefreshMutation()

    
    useEffect(() => {
        if (effectRan.current === true || process.env.NODE_ENV !== 'development') { // React 18 Strict Mode
            const verifyRefreshToken = async () => {
                // console.log('verifying refresh token')
                try {
                    const response = await refresh();
                        setAuth({ user: response?.data?.user, accessToken: response?.data?.accessToken 
                    });
                }
                catch (err) {
                    console.error(err)
                } finally {
                    setIsAuthLoading(false);
                }
            }

            if (!token && persist) {
                verifyRefreshToken();
            } else {
                setIsAuthLoading(false); // pas de refresh nécessaire, on débloque direct
            }
        }

        return () => effectRan.current = true

        // eslint-disable-next-line
    }, [])

    return <Outlet />
}
export default PersistLogin