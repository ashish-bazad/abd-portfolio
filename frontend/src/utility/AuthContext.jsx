import { createContext, useState, useEffect, useRef } from 'react';
const AuthContext = createContext();
export default AuthContext;

export const AuthProvider = ({children}) => {
    
    const get_nifty50_stocks = async() => {
        const response = await(fetch('http://127.0.0.1:8000/api/nifty50/'));
        const data = await response.json();
        return data;
    }

    let contextData = {
        get_nifty50_stocks,

    }
    return (
        <AuthContext.Provider value = {contextData}>
            {children}
        </AuthContext.Provider>
    )
}