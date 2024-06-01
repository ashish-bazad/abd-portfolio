import React, {useState, useContext, useEffect, useRef} from 'react'
import style from './home.module.css'
import { Line } from 'react-chartjs-2'
import { Link, useNavigate } from 'react-router-dom';
import popoutIcon from '../assets/popout.svg';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import AuthContext from '../utility/AuthContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Home = () => {
    let { get_nifty50_stocks } = useContext(AuthContext);
    let should_get_nifty50_stocks = useRef(true);
    let [stocks, setStocks] = useState([]);
    const get_nifty50_stocks_data = async() => {
        if(!localStorage.getItem('nifty50_stocks')) {
            const data = await get_nifty50_stocks();
            localStorage.setItem('nifty50_stocks', JSON.stringify(data.stocks));
            setStocks(data.stocks);
        } else {
            setStocks(JSON.parse(localStorage.getItem('nifty50_stocks')));
        }
    }
    useEffect( () => {
        if (should_get_nifty50_stocks.current) {
            should_get_nifty50_stocks.current = false;
            get_nifty50_stocks_data();
        };
    }, [])

    const navigate = useNavigate();
    let loadResults = () => {
        navigate('/results');
    }
    const chartData = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
        datasets: [
            {
                label: 'Stock Price',
                data: [65, 59, 80, 81, 56, 55],
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0,
                pointRadius: 0
            }
        ]
    };

    const chartOptions = {
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                }
            },
            y: {
                grid: {
                    display: false
                }
            }
        },
        maintainAspectRatio: false
    };

    const getClassByValue = (value) => {
        if (parseFloat(value) > 0) {
            return style.positive;
        } else if (parseFloat(value) < 0) {
            return style.negative;
        } else {
            return '';
        }
    };
    let [currentSelection, setCurrentSelection] = useState(0);
    const changeSelection = (item) => {
        setCurrentSelection(item.index);
    }

    const search_stock = async(stock_name) => {
        const response = await(fetch(`http://127.0.0.1:8000/api/search/?search=${stock_name}`));
        const data = await response.json();
        setStocks(data.stocks);
    }
    let [searchText, setSearchText] = useState('');
    useEffect(() => {
        if(searchText === '') {
            setStocks(JSON.parse(localStorage.getItem('nifty50_stocks')));
        } else {
            search_stock(searchText.toUpperCase());
        }
    }, [searchText])
    const handleSearch = (e) => {
        setSearchText((e.target.value).toUpperCase());
        const clearButton = document.getElementById('clear_button');
        if (e.target.value !== '') {
            clearButton.classList.remove(style.slideOut);
            clearButton.classList.add(style.slideIn);
        } else {
            clearButton.classList.remove(style.slideIn);
            clearButton.classList.add(style.slideOut);
        }
    }
    const clearSearch = () => {
        setSearchText('');
        const clearButton = document.querySelector(`.${style.clear_button}`);
        if (clearButton.classList.contains(style.slideIn)) {
            clearButton.classList.remove(style.slideIn);
            clearButton.classList.add(style.slideOut);
        }
    }

  return (
    <div className={style.home_container}>

        <div className={style.home}>
            <div className={style.home_table_navbar}>
            {['Equity', 'Commodities', 'US Treasury Notes', 'REITs', 'Currency', 'Crypto'].map((item, index) => (
                <div key={index} className={`${style.home_table_navbar_item} ${currentSelection === index ? style.selected : ''}`} onClick={() => changeSelection({index})}>
                <h2>{item}</h2>
                </div>
            ))}
            </div>

            <div className={style.home_table_and_chart}>
                <div className={style.home_table}>
                    <div className={style.home_table_search}>
                        <label>Search for Equity</label>
                        <div className={style.search_div}><input type="text" value={searchText} onChange={handleSearch} placeholder="Yahoo Finance Ticker" />
                        <button className={style.clear_button} id='clear_button' onClick={clearSearch} style={{fontSize:'16px'}}>ⓧ</button></div>
                    </div>
                    <div className={style.table_container}>
                        <table>
                            <thead>
                                <tr>
                                    {['', 'Symbol', 'Price', 'Change', '% Change', 'Volume'].map((item, index) => (
                                        <th key={index}>{item}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                            {stocks.map((_, index) => (
                                <tr key={index}>
                                    <td><center><input type="checkbox" /></center></td>
                                    <td className={style.table_symbol}>{stocks[index]}</td>
                                    <td>450.00</td>
                                    <td className={getClassByValue('-4.5')}>-4.50</td>
                                    <td className={getClassByValue('+1.00%')}>+1.00</td>
                                    <td>12.34M</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className={style.home_chart}>
                    <div className={style.home_chart_price}>
                        <Line data = {chartData} options={chartOptions}/>
                    </div>
                    <div className={style.home_chart_volatility}>
                        <Line data = {chartData} options={chartOptions}/>
                    </div>
                    <div className={style.home_chart_add_to_bucket}>
                        <form>
                            <div className={style.home_chart_add_to_bucket_form}>
                                <div className={style.form_input}>
                                    <label>Minimum Weight</label>
                                    <input type='number' step='0.01' min='0.00' max='1.00' placeholder='0.00' />
                                </div>
                                <div className={style.form_input}>
                                    <label>Maximum Weight</label>
                                    <input type='number' step='0.01' min='0.00' max='1.00' placeholder='1.00' />
                                </div>
                            </div>
                            <button type='submit'>Add to Bucket</button>
                        </form>
                    </div>
                </div>
            </div>
            <button className={style.home_chart_next} onClick={loadResults}>Next</button>
        </div>
    </div>
  )
}

export default Home
