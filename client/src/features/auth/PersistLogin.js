import { Outlet } from "react-router-dom"
import { useEffect, useRef, useState, useContext } from 'react'
import { useRefreshMutation } from "./authApiSlice"
import usePersist from "../../hooks/usePersist"
import { useSelector } from 'react-redux'
import { selectCurrentToken, selectCurrentUser } from "./authSlice"
import dataApplicationsContext from '../../context/dataApplicationsContext';
import SyncLoader from "react-spinners/SyncLoader";
import { useLocation } from "react-router-dom";
// import useRefreshToken from "../../hooks/useRefreshToken"
import useAuth from "../../hooks/useAuth"
import secureLocalStorage  from  "react-secure-storage";

const PersistLogin = () => {
    const { setAuth, setIsConnected, windowWidth } = useContext(dataApplicationsContext);

    const [persist] = usePersist()

    const token = useSelector(selectCurrentToken);
    const user = useSelector(selectCurrentUser);
    const effectRan = useRef(false)
    
    const [trueSuccess, setTrueSuccess] = useState(false)
    const [refresh, { isUninitialized, isLoading, isSuccess, isError, error }] = useRefreshMutation()

    
    useEffect(() => {
        setTrueSuccess(true);
        if (effectRan.current === true || process.env.NODE_ENV !== 'development') { // React 18 Strict Mode
            const verifyRefreshToken = async () => {
                // console.log('verifying refresh token')
                try {
                    const response = await refresh();
                    setAuth({ user: response?.data?.user, accessToken: response?.data?.accessToken 
                    });
                    setTrueSuccess(true);
                }
                catch (err) {
                    console.error(err)
                }
            }

            if (!token && persist) verifyRefreshToken()
        }

        return () => effectRan.current = true

        // eslint-disable-next-line
    }, [])

    // let content
    // if (!persist) { // persist: no
    //     // console.log('no persist')
    //     content = <Outlet />
    // // } else if (isLoading) { //persist: yes, token: no
    // //     content = 
    // //         <div className="pos-abs-center-x-y w-100p">
    // //             <img src="/images/loader-gif3.gif" alt="scraping-loader" className="w-100p h-250 obj-contain"/>
    // //             <p className={`pl-8p pr-8p fz-28 fw-800 text-align-center mb-16 ${windowWidth >= 800 ? 'mt-40' : ''}`}>
    // //                 WODZONE
    // //             </p>
    // //             <p className="pl-13p pr-13p fz-18 fw-500 text-align-center w-100p">
    // //                 Veuillez patienter... <br/> Le temps de faire un max reps de squat snatch
    // //             </p>
    // //         </div>
    // } else if (isError) { //persist: yes, token: no
    //     // console.log('error : ' + error.data?.message)
    //     content = <Outlet />
    // } else if ((trueSuccess || user === undefined)) { //persist: yes, token: yes
    //     // console.log('success')
    //     content = <Outlet />
    // } else if (token && isUninitialized) { //persist: yes, token: yes
    //     // console.log('token and uninit')
    //     // console.log(isUninitialized)
    //     content = <Outlet />
    // } 


    return <Outlet />
}
export default PersistLogin