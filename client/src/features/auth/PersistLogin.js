import { Outlet } from "react-router-dom"
import { useEffect, useRef, useState, useContext } from 'react'
import { useRefreshMutation } from "./authApiSlice"
import usePersist from "../../hooks/usePersist"
import { useSelector } from 'react-redux'
import { selectCurrentToken, selectCurrentUser } from "./authSlice"
import dataApplicationsContext from '../../context/dataApplicationsContext';
import { useLazyGetCurrentWMUserQuery } from "../../slices/usersApiSlice"

const PersistLogin = () => {
    const { auth, setAuth, setIsAuthLoading } = useContext(dataApplicationsContext);

    const [persist] = usePersist()

    const token = useSelector(selectCurrentToken);
    const effectRan = useRef(false);
    
    const [refresh, { isUninitialized, isLoading, isSuccess, isError, error }] = useRefreshMutation();
    const [trigger] = useLazyGetCurrentWMUserQuery();
    
    useEffect(() => {
        if (effectRan.current === true || process.env.NODE_ENV !== 'development') { // React 18 Strict Mode
            const verifyRefreshToken = async () => {
                console.log('verifying refresh token')
                try {
                    const response = await refresh();
                    if (response?.error) return;
                    const userWM = await trigger().unwrap();
                    const { 
                        completion_rate, created_at, focus_color, id_roles, is_developper, is_email_verifyed,
                        last_logged, not_share_email, not_share_telephone, notifications,
                        activite, actualite, disabled_news, politique, rappel, remarques, organisateur_infos,
                        pointure, short, short_size, tee_shirt, tee_shirt_size, token_create_event, updated_at, 
                        updated_password,
                        ...rest 
                    } = response?.data?.user;
                    setAuth({ user: { ...rest, ...userWM }, accessToken: response?.data?.accessToken });
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