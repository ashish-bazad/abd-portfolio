import { createContext, useState, useEffect, useRef } from 'react';
const AuthContext = createContext();
export default AuthContext;

export const AuthProvider = ({children}) => {

    const get_tickers_equity = async() => {
        const response = await(fetch('http://127.0.0.1:8000/api/tickers_equity/'));
        const data = await response.json();
        return data;
    }
    const get_tickers_commodities = async() => {
        const response = await(fetch('http://127.0.0.1:8000/api/tickers_commodities/'));
        const data = await response.json();
        return data;
    }
    const get_tickers_crypto = async() => {
        const response = await(fetch('http://127.0.0.1:8000/api/tickers_crypto/'));
        const data = await response.json();
        return data;
    }
    const get_tickers_t_notes = async() => {
        const response = await(fetch('http://127.0.0.1:8000/api/tickers_t_notes/'));
        const data = await response.json();
        return data;
    }
    const get_tickers_reit = async() => {
        const response = await(fetch('http://127.0.0.1:8000/api/tickers_reit/'));
        const data = await response.json();
        return data;
    }
    const get_tickers_data = async(tickers) => {
        let period = localStorage.getItem('period');
        if(period === null) {
            period = '1y';
        }
        const response = await(fetch(`http://127.0.0.1:8000/api/tickers_data/?tickers=${tickers.map(ticker => encodeURIComponent(ticker)).join(',')}&period=${period}`));
        const data = await response.json();
        return data;
    }
    const analyze_data = async(request_data) => {
        const response = await(fetch(`http://127.0.0.1:8000/api/data_analysis/`, {
            method:'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request_data),
        }))
        if(response.status === 200) {
            const data = await response.json()
            localStorage.setItem('results', JSON.stringify(data.results));
            return true;
        } else {
            return false
        }
    }

    let contextData = {
        get_tickers_equity,
        get_tickers_commodities,
        get_tickers_crypto,
        get_tickers_t_notes,
        get_tickers_reit,
        get_tickers_data,
        analyze_data,

    }
    return (
        <AuthContext.Provider value = {contextData}>
            {children}
        </AuthContext.Provider>
    )
}