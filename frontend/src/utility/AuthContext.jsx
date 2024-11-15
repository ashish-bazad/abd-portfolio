import { createContext } from 'react';
const AuthContext = createContext();
export default AuthContext;

export const AuthProvider = ({children}) => {

    // const api_path = 'https://abd-portfolio.azurewebsites.net/api';
    const api_path = 'http://127.0.0.1:8000/api';

    const get_tickers = async(selection) => {
        const response = await(fetch(`${api_path}/tickers_${selection}/`));
        if(response.status === 200) {
            const data = await response.json();
            return data;
        } else {
            return {error: 'Error', status: response.status};
        }
    }
    const search_tickers = async (text, current_selection) => {
        const response = await fetch(`${api_path}/search_${current_selection}/?search=${text}`);
        if(response.status === 200) {
            const data = await response.json();
            return data;
        } else {
            return {error: 'Error', status: response.status};
        }
    };
    const get_tickers_data = async(tickers) => {
        let period = localStorage.getItem('period');
        if(period === null) {
            period = '1y';
        }
        const response = await(fetch(`${api_path}/tickers_data/?tickers=${tickers.map(ticker => encodeURIComponent(ticker)).join(',')}&period=${period}`));
        if(response.status === 200) {
            const data = await response.json();
            return data;
        } else {
            return {error: 'Error', status: response.status};
        }
    }
    const analyze_data = async(request_data) => {
        const response = await(fetch(`${api_path}/data_analysis/`, {
            method:'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request_data),
        }))
        if(response.status === 200) {
            const data = await response.json()
            localStorage.setItem('results_0', JSON.stringify(data.results_0));
            localStorage.setItem('results_1', JSON.stringify(data.results_1));
            localStorage.setItem('results_2', JSON.stringify(data.results_2));
            return true;
        } else {
            return false
        }
    }

    let contextData = {
        get_tickers_data,
        analyze_data,
        search_tickers,
        get_tickers,
    }
    return (
        <AuthContext.Provider value = {contextData}>
            {children}
        </AuthContext.Provider>
    )
}