import React from 'react';
import {Navigate} from 'react-router-dom';
import {useAuth} from '../hooks/useAuth';

const Protected = ({children}) => {
    const {loading, user} = useAuth();

    //If auth status is still loading, show a loading message
    if(loading){
        return(
            <div className='flex items-center justify-center h-screen'>
                <p className='text-2xl font-bold'>Loading...</p>
            </div>
        )
    }

    //If user is not authenticated, redirect to login page
    if(!user){
        return <Navigate to="/login" replace/>
    }

    //If user is authenticated, render the protected content
    return children;
}

export default Protected;