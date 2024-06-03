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
    let { get_nifty50_stocks, get_stock_data } = useContext(AuthContext);
    let should_get_nifty50_stocks = useRef(true);
    let should_create_equity_bucket = useRef(true);
    let current_minimum_sums = useRef(0);
    let [stocks, setStocks] = useState([]);
    let [stocks_table_data, setStocksTableData] = useState(null);
    let [currentSelection, setCurrentSelection] = useState(0);
    let [searchText, setSearchText] = useState('');
    let [searching, setSearching] = useState(false);
    let [searchedStocks, setSearchedStocks] = useState([]);
    let [checkedItems, setCheckedItems] = useState([]);
    let [adding_loading, setAdding_loading] = useState(false);
    let [selectedStock, setSelectedStock] = useState(null);
    let [minimum_weight, setMinimumWeight] = useState(0);
    let [maximum_weight, setMaximumWeight] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        if(should_create_equity_bucket.current) {
            should_create_equity_bucket.current = false;
            if(!localStorage.getItem('equity_bucket')) {
                localStorage.setItem('equity_bucket', JSON.stringify([]));
            } else {
                let bucket = JSON.parse(localStorage.getItem('equity_bucket'));
                if(bucket.length === 0) {
                    current_minimum_sums.current = 0;
                } else {
                    for(let i=0; i<bucket.length; i++) {
                        current_minimum_sums.current += bucket[i][1];
                    }
                }
            }
        }
    }, [])

    const gather_stock_data = async (stock) => {
        setSelectedStock(stock);
    }
    const get_nifty50_stocks_data = async() => {
        setAdding_loading(true);
        const currentTime = new Date();
        const updateTime = new Date(currentTime);
        updateTime.setHours(15, 30, 0, 0); // Set update time to 3:30 PM

        let lastUpdated = localStorage.getItem('stocks_list_last_updated');
        lastUpdated = lastUpdated ? new Date(lastUpdated) : null;

        // Check if lastUpdated is from a different day or if it is before today's 3:30 PM
        const needsUpdate = !lastUpdated 
                            || !localStorage.getItem('stocks_list') 
                            || !localStorage.getItem('stocks_list_data') 
                            || lastUpdated.toDateString() !== currentTime.toDateString() 
                            || (currentTime >= updateTime && lastUpdated < updateTime);
        if (needsUpdate) {
            // const data = await get_nifty50_stocks();
            // localStorage.setItem('nifty50_stocks', JSON.stringify(data.stocks));
            if(!localStorage.getItem('stocks_list')) {
                const data = await get_nifty50_stocks();
                localStorage.setItem('stocks_list', JSON.stringify(data.stocks));
                setStocks(JSON.parse(localStorage.getItem('stocks_list')));
            }
            localStorage.setItem('stocks_list_last_updated', currentTime.toISOString());
            const prices_list = await get_stock_data(JSON.parse(localStorage.getItem('stocks_list')));
            localStorage.setItem('stocks_list_data', JSON.stringify(prices_list));
            setCheckedItems(JSON.parse(localStorage.getItem('stocks_list')));
            setStocksTableData(prices_list.table);
            setSelectedStock(JSON.parse(localStorage.getItem('stocks_list'))[0]);
        } else {
            setStocks(JSON.parse(localStorage.getItem('stocks_list')));
            setStocksTableData(JSON.parse(localStorage.getItem('stocks_list_data')).table);
            setCheckedItems(JSON.parse(localStorage.getItem('stocks_list')));
            setSelectedStock(JSON.parse(localStorage.getItem('stocks_list'))[0]);
        }
        setAdding_loading(false);
    };
    useEffect( () => {
        if (should_get_nifty50_stocks.current) {
            should_get_nifty50_stocks.current = false;
            get_nifty50_stocks_data();
        };
    }, [])

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

    const getClassByValue = (value, index) => {
        if (parseFloat(value) > 0) {
            return style.positive;
        } else if (parseFloat(value) < 0) {
            return style.negative;
        } else {
            return '';
        }
    };
    const changeSelection = (item) => {
        setCurrentSelection(item.index);
    }

    const search_stock = async(stock_name) => {
        const response = await(fetch(`http://127.0.0.1:8000/api/search/?search=${stock_name}`));
        const data = await response.json();
        setSearchedStocks(data.stocks);
    }
    useEffect(() => {
        if(searchText === '') {
            setStocks(JSON.parse(localStorage.getItem('stocks_list')));
            setSearching(false);
        } else {
            setSearching(true);
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
    const handleCheckboxChange = async (stock) => {
        let tmp = []
        let tmp2 = JSON.parse(localStorage.getItem('stocks_list'));
        setAdding_loading(true);
        if(checkedItems.includes(stock)) {
            tmp = checkedItems.filter(item => item !== stock);
            var ind = tmp2.indexOf(stock);
            tmp2.splice(ind, 1);
            let tmp3 = JSON.parse(localStorage.getItem('stocks_list_data'));
            delete tmp3.volatility_data[stock+'.NS']
            delete tmp3.price_data[stock+'.NS']
            tmp3.table.SYMBOLS.splice(ind, 1);
            tmp3.table.PRICE.splice(ind, 1);
            tmp3.table.CHANGE.splice(ind, 1);
            tmp3.table.PCHANGE.splice(ind, 1);
            tmp3.table.LOW.splice(ind, 1);
            tmp3.table.HIGH.splice(ind, 1);
            localStorage.setItem('stocks_list_data', JSON.stringify(tmp3));
            localStorage.setItem('stocks_list', JSON.stringify(tmp2));
            setStocks(tmp2);
            setStocksTableData(tmp3.table);
        } else {
            tmp = [...checkedItems, stock];
            tmp2.push(stock);
            let tmp3 = JSON.parse(localStorage.getItem('stocks_list_data'));
            const data = await get_stock_data([stock]);
            tmp3.volatility_data[stock+'.NS'] = data.volatility_data[stock+'.NS'];
            tmp3.price_data[stock+'.NS'] = data.price_data[stock+'.NS'];
            tmp3.table.SYMBOLS.push(data.table.SYMBOLS[0]);
            tmp3.table.PRICE.push(data.table.PRICE[0]);
            tmp3.table.CHANGE.push(data.table.CHANGE[0]);
            tmp3.table.PCHANGE.push(data.table.PCHANGE[0]);
            tmp3.table.LOW.push(data.table.LOW[0]);
            tmp3.table.HIGH.push(data.table.HIGH[0]);
            localStorage.setItem('stocks_list_data', JSON.stringify(tmp3));
            localStorage.setItem('stocks_list', JSON.stringify(tmp2));
            setStocks(tmp2);
            setStocksTableData(tmp3.table);
        }
        setAdding_loading(false);
        setCheckedItems(tmp);
    }

    const handleAddToBucket = (e) => {
        e.preventDefault();
        let bucket = JSON.parse(localStorage.getItem('equity_bucket'));
        let stock = selectedStock;
        let max_weight = parseFloat(maximum_weight), min_weight = parseFloat(minimum_weight);
        bucket = [...bucket, [stock, min_weight, max_weight]];
        localStorage.setItem('equity_bucket', JSON.stringify(bucket));
        console.log(bucket);j
        window.location.reload();
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
                                {searching === false && 
                                <tr>
                                    {['', 'Symbol', 'Price', 'Change', '% Change', 'Range'].map((item, index) => (
                                        <th key={index} >{item}</th>
                                    ))}
                                </tr>}
                                {searching === true && 
                                <tr>
                                    <th><center>Select</center></th>
                                    <th>Symbol</th>
                                </tr>
                                }
                            </thead>
                            <tbody>
                            {searching === false && stocks && stocks.map((_, index) => (
                                <tr key={index}>
                                    <td><center><input type="checkbox" disabled={adding_loading} checked={checkedItems.includes(stocks[index])} onChange={() => handleCheckboxChange(stocks[index])} /></center></td>
                                    <td className={style.table_symbol} onClick={() => gather_stock_data([stocks[index]])}>{stocks[index]}</td>
                                    {stocks_table_data && <td>{stocks_table_data.PRICE[index].toFixed(2)}</td>}
                                    {stocks_table_data && <td id={index.toString()+"price_column"} className={getClassByValue(stocks_table_data.CHANGE[index], index)}>{stocks_table_data.CHANGE[index].toFixed(2)}</td>}
                                    {stocks_table_data && <td className={getClassByValue(stocks_table_data.PCHANGE[index])}>{stocks_table_data.PCHANGE[index].toFixed(2)} %</td>}
                                    {stocks_table_data && 
                                    <td>
                                        <div className={style.table_range}>
                                            <div className={style.table_range_length}>
                                                <div className={style.table_range_fill} style={{width: `${((stocks_table_data.PRICE[index] - stocks_table_data.LOW[index])/(stocks_table_data.HIGH[index] - stocks_table_data.LOW[index]))*100}%`}}></div>
                                                <div className={style.table_range_label}>
                                                    <div>{stocks_table_data.LOW[index].toFixed(2)}</div>
                                                    <div>{stocks_table_data.HIGH[index].toFixed(2)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>}
                                </tr>
                            ))}
                            {searching === true && searchedStocks && searchedStocks.map((stock, index) => (
                                <tr key = {index}>
                                    <td><center><input type='checkbox' disabled = {adding_loading} checked={checkedItems.includes(stock)} onChange={() => handleCheckboxChange(stock)} /></center></td>
                                    <td className={style.table_symbol} onClick={() => gather_stock_data([stock])}>{stock}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className={style.home_chart}>
                    {selectedStock && <h2 style={{margin:'0'}}>{selectedStock}</h2>}
                    <div className={style.home_chart_price}>
                        <Line data = {chartData} options={chartOptions}/>
                    </div>
                    <div className={style.home_chart_price}>
                        <Line data = {chartData} options={chartOptions}/>
                    </div>
                    <div className={style.home_chart_add_to_bucket}>
                        <form onSubmit={handleAddToBucket}>
                            <div className={style.home_chart_add_to_bucket_form}>
                                <div className={style.form_input}>
                                    <label>Minimum Weight</label>
                                    <input type='number' step='0.01' value={minimum_weight} min='0.00' onChange={(e) => setMinimumWeight(e.target.value)} max={(1 - current_minimum_sums.current)} placeholder='0.00' required={true} />
                                </div>
                                <div className={style.form_input}>
                                    <label>Maximum Weight</label>
                                    <input type='number' step='0.01' value={maximum_weight} min={minimum_weight} onChange={(e) => setMaximumWeight(e.target.value)} max='1.00' placeholder='1.00' required={true} />
                                </div>
                            <button type='submit'>Add to Bucket</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div className={style.controller_buttons}>
                <button className={style.home_chart_next} style={{width:'100px'}} onClick={loadResults}>Settings</button>
                <button className={style.home_chart_next} style={{width:'150px'}} onClick={() => {
                    localStorage.removeItem('stocks_list');
                    window.location.reload();
                }}>Reset Stocks List</button>
                <button className={style.home_chart_next} style={{width:'120px'}} onClick={loadResults}>View Buckets</button>
                <button className={style.home_chart_next} style={{width:'120px'}} onClick={localStorage.setItem('equity_bucket', JSON.stringify([]))}>Reset Bucket</button>
                <button className={style.home_chart_next} onClick={loadResults}>Next</button>
            </div>
        </div>
    </div>
  )
}

export default Home
