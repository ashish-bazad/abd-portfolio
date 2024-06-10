import React, { useEffect, useRef, useState, useContext } from 'react'
import style from './results.module.css'
import { Line, Pie } from 'react-chartjs-2';
import { useNavigate } from "react-router-dom";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, PieController } from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PieController,
  );

const Results = () => {
    let [selectedOption, setSelectedOption] = useState('option1');
    let cbms = useRef(0)
    let [cbmse, setCbmse] = useState(0);
    let [cbmsc, setCbmsc] = useState(0);
    let [cbmst, setCbmst] = useState(0);
    let [cbmsr, setCbmsr] = useState(0);
    let [cbmscr, setCbmscr] = useState(0);
    let cabms = useRef([0, 0, 0, 0, 0]);
    let [equity_bucket_min_weight, setEquityBucketMinWeight] = useState(null);
    let [equity_bucket_max_weight, setEquityBucketMaxWeight] = useState(100);
    let [commodities_bucket_min_weight, setCommoditiesBucketMinWeight] = useState(null);
    let [commodities_bucket_max_weight, setCommoditiesBucketMaxWeight] = useState(100);
    let [t_notes_bucket_min_weight, setT_notesBucketMinWeight] = useState(null);
    let [t_notes_bucket_max_weight, setT_notesBucketMaxWeight] = useState(100);
    let [reit_bucket_min_weight, setReitBucketMinWeight] = useState(null);
    let [reit_bucket_max_weight, setReitBucketMaxWeight] = useState(100);
    let [crypto_bucket_min_weight, setCryptoBucketMinWeight] = useState(null);
    let [crypto_bucket_max_weight, setCryptoBucketMaxWeight] = useState(100);
    
    let [tmp, setTmp] = useState(true);
    const navigate = useNavigate();
    if(!localStorage.getItem('results')) {
        navigate('/');
    }
    let results = JSON.parse(localStorage.getItem('results'));
    if(tmp) {
        setTmp(false);
        // console.log(results);
    }
    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
    };
    const pieChartOptions = {
        plugins: {
            legend: {
                display: false // Disable the legend
            }
        }
    };

    const chartDataPie = {
        labels: ['Red', 'Blue', 'Yellow'],
        datasets: [
            {
                label: 'Demo Pie Chart',
                data: [30, 40, 30],
                backgroundColor: ['red', 'blue', 'yellow']
            }
        ]
    };
    
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
    return (
    <div className={style.results_container}>
        <div className={style.results}>
            <div className={style.results_mode_selector}>
                <label style={{ fontWeight: 'bold' }}>Asset Allocation Strategy:</label>
                    <label>
                        <input
                            type="radio"
                            value="option1"
                            checked={selectedOption === 'option1'}
                            onChange={handleOptionChange}
                        />
                        Markowitz Mean-Variance
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="option2"
                            checked={selectedOption === 'option2'}
                            onChange={handleOptionChange}
                        />
                        Equal Weighting
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="option3"
                            checked={selectedOption === 'option3'}
                            onChange={handleOptionChange}
                        />
                        Risk Parity
                    </label>
            </div>


            <div className={style.results_exposure_limits}>
                <label style={{fontWeight:'bold'}}>Exposure Limits</label>
                <div className={style.results_exposure_limits_items}>
                    <div className={style.results_exposure_limits_item}>
                        <select defaultValue={0} >
                            <option value={0} disabled={true}>Select Bucket</option>
                            <option value="option1">Bucket 1</option>
                            <option value="option2">Bucket 2</option>
                            <option value="option3">Bucket 3</option>
                        </select>
                        <div className={style.results_exposure_limits_item_input}>
                            <input type='number' placeholder = 'Minimum Weight' min={0.00} max={1.00} step={0.01} />
                            <input type='number' placeholder = 'Maximum Weight' min={0.00} max={1.00} step={0.01} />
                        </div>
                    </div>
                    <div className={style.results_exposure_limits_item}>
                        <select defaultValue={0}>
                            <option value={0} disabled={true}>Select Stock</option>
                            <option value="option1">Stock 1</option>
                            <option value="option2">Stock 2</option>
                            <option value="option3">Stock 3</option>
                        </select>
                        <div className={style.results_exposure_limits_item_input}>
                            <input type='number' placeholder = 'Minimum Weight' min={0.00} max={1.00} step={0.01} />
                            <input type='number' placeholder = 'Maximum Weight' min={0.00} max={1.00} step={0.01} />
                        </div>
                    </div>
                </div>
            </div>


            <div className={style.results_portfolio_value}>
                <label style={{fontWeight:'bold'}}>Portfolio Value</label>
                <div className={style.results_portfolio_value_items}>
                    <div className={style.results_portfolio_value_chart}>
                        <Line data={chartData} options={chartOptions} />
                    </div>
                    <div className={style.results_portfolio_value_data_right}>
                        <div className={style.results_portfolio_value_data}>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0'}}>{(results.p_capital_gain).toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0', fontSize:'12px'}}>Capital Gain (%)</label>
                            </div>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0'}}>{(results.p_market_gain).toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0', fontSize:'12px'}}>Market Gain (%)</label>
                            </div>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0'}}>{(results.p_dividend_yield).toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0', fontSize:'12px'}}>Dividend Yield (%)</label>
                            </div>
                        </div>
                        <div className={style.results_portfolio_value_pie_chart}>
                            <Pie data={chartDataPie} options={pieChartOptions} />
                        </div>
                    </div>
                </div>
            </div>


            <div className={style.results_portfolio_value_evaluation_and_parameters}>
                <div className={style.results_portfolio_value_evaluation}>
                    <div className={style.results_portfolio_value_evaluation_item}>
                        <label style={{fontWeight:'bold'}}>Portfolio Evaluation</label>
                        <div className={style.portfolio_value_evaluation_item_data}>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0'}}>{results.sharpe.toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>Sharpe Ratio</label>
                            </div>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0'}}>{results.treynor.toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>Treynor Ratio</label>
                            </div>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0'}}>{results.sortino.toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>Sortino Ratio</label>
                            </div>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0'}}>{results.jenson[0].toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>Jenson's Alpha</label>
                            </div>
                        </div>
                    </div>
                    <div className={style.results_portfolio_value_evaluation_item}>
                        <label style={{fontWeight:'bold'}}>Value-at-Risk (VAR)</label>
                        <div className={style.portfolio_value_evaluation_item_data}>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0'}}>{results.var.ninety_p.toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>90% Confidence Level</label>
                            </div>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0'}}>{results.var.ninety_five_p.toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>95% Confidence Level</label>
                            </div>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0'}}>{results.var.ninety_nine_p.toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>99% Confidence Level</label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={style.results_portfolio_value_evaluation}>
                    <div className={style.results_portfolio_value_evaluation_item}>
                        <label style={{fontWeight:'bold'}}>Portfolio Parameters</label>
                        <div className={style.portfolio_value_evaluation_item_data}>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0'}}>{results.p_capital_gain.toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>Portfolio Returns (%)</label>
                            </div>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0'}}>{results.portfolio_std.toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>Standard Deviation</label>
                            </div>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0'}}>{results.portfolio_beta.toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>Portfolio Beta</label>
                            </div>
                        </div>
                    </div>
                    <div className={style.results_portfolio_value_evaluation_item}>
                        <label style={{fontWeight:'bold'}}>Conditional Value-at-Risk (VAR)</label>
                        <div className={style.portfolio_value_evaluation_item_data}>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0'}}>{results.cvar.ninety_p.toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>90% Confidence Level</label>
                            </div>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0'}}>{results.cvar.ninety_five_p.toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>95% Confidence Level</label>
                            </div>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0'}}>{results.cvar.ninety_nine_p.toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>99% Confidence Level</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={style.split_view}>
                <div className={style.split_view_item}>
                    <label style={{fontWeight:'bold'}}>Value-at-Risk: Monte Carlo Method</label>
                    <div className={style.split_view_item_data}>
                        <div className={style.split_view_chart}>
                            <Line data={chartData} options={chartOptions} />
                        </div>
                        <div className={style.split_view_data}>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0'}}>{results.var_monte_carlo.ninety_p.toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>90% Confidence Level</label>
                            </div>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0'}}>{results.var_monte_carlo.ninety_five_p.toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>95% Confidence Level</label>
                            </div>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0'}}>{results.var_monte_carlo.ninety_nine_p.toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>99% Confidence Level</label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={style.split_view_item}>
                    <label style={{fontWeight:'bold'}}>Benchmark Comparison</label>
                    <div className={style.split_view_item_data}>
                        <div className={style.split_view_chart}>
                            <Line data={chartData} options={chartOptions} />
                        </div>
                        <div className={style.split_view_data}>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0'}}>{results.p_benchmark_returns.toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>Benchmark Returns (%)</label>
                            </div>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0'}}>{results.p_tracking_error.toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>Standard Deviation</label>
                            </div>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0'}}>{results.information_ratio.toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>Tracking Error (%)</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={style.split_view}>
                <div className={style.split_view_item}>
                    <label style={{fontWeight:'bold'}}>Portfolio Correlation</label>
                    <div className={style.split_view_chart_2}>
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </div>

                <div className={style.split_view_item}>
                    <label style={{fontWeight:'bold'}}>Portfolio Heatmap View</label>
                    <div className={style.split_view_chart_2}>
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </div>
            </div>

        </div>
    </div>
);
}

export default Results
