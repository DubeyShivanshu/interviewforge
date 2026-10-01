import React from 'react';
import {Navigate} from 'react-router-dom';
import {useAuth} from '../hooks/useAuth';
import Loader from '../../../components/Loader';

const Protected = ({children}) => {
    const {loading, user} = useAuth();

    //If auth status is still loading, show a spinner
    // if(loading){
    //     return(
    //         <div className='spinner-overlay'>
    //             <div className='spinner'></div>
    //         </div>
    //     )
    // }

    if(loading){
        return <Loader />
    }

    //If user is not authenticated, redirect to login page
    if(!user){
        return <Navigate to="/login" replace/>
    }

    //If user is authenticated, render the protected content
    return children;
}

export default Protected;