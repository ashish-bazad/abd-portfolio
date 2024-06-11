import React, { useEffect, useRef, useState, useContext } from 'react'
import style from './results.module.css'
import { useNavigate } from "react-router-dom";
import Plot from 'react-plotly.js';

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
    let [data_p_x, setData_p_x] = useState(['2013-10-04 22:23:00', '2013-11-04 22:23:00', '2013-12-04 22:23:00']);
    let [data_p_y, setData_p_y] = useState([1, 3, 6]);
    let [data_b_y, setData_b_y] = useState([1, 3, 6]);
    let [data_m_y, setData_m_y] = useState([1, 3, 6]);
    let [data_corr, setData_corr] = useState({
            "CANBK.NS": [1, 0.060724837670530794],
            "GC=F": [0.060724837670530794, 1]
    });
    let [pie_values, setPie_values] = useState([10, 20, 30, 40]);
    let [pie_labels, setPie_labels] = useState(['Equity', 'Commodities', 'T-Notes', 'REIT']);
    const corr_data = Object.keys(data_corr).map(key => data_corr[key]);
    const labels = Object.keys(data_corr);
    const intext_label = Object.keys(data_corr).map(key => data_corr[key].map(value => value.toFixed(2)));
    const navigate = useNavigate();
    useEffect(() => {
        if(!localStorage.getItem('results')) {
            navigate('/');
        }
    }, [navigate])
    let results = JSON.parse(localStorage.getItem('results'));
    let should_set_data = useRef(true);
    useEffect(() => {
        if(should_set_data.current) {
            should_set_data.current = false;
            console.log(results)
            setData_p_x(results.date)
            setData_p_y(results.portfolio_value)
            setData_b_y(results.benchmark_value)
            setData_m_y(results.var_monte_carlo_simulated_returns)
            setData_corr(results.correlation_matrix)
            setPie_values(results.optimised_weights)
            setPie_labels(results.tickers_list)
        }
    }, [])
    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
    };
    var data_portfolio_value = [
        {
          x: data_p_x,
          y: data_p_y,
          type: 'scatter',
          line: { color: '#1e90ff' },
        //   xbins: {size: 0.02},
        }
    ];
    var data_benchmark_value = [
        {
            x: data_p_x,
            y: data_p_y,
            type: 'scatter',
            line: { color: '#1e90ff' },
            name: 'Portfolio'
        },
        {
            x: data_p_x,
            y: data_b_y,
            type: 'scatter',
            line: { color: '#228b22' },
            name: '^NSEI'
        }
    ]
    var data_monte_carlo_value = [
        {
          x: data_m_y,
          type: 'histogram',
          marker: { color: '#1e90ff' },
        }
    ];
    var correlation_data = [
        {
            x: labels,
            y: labels,
            z: corr_data,
            type: 'heatmap',
            colorscale: 'Viridis',
            text: intext_label,
            texttemplate: '%{text}',
            textfont: {
                size: '12',
                color: 'white',
            }
        }
    ]
    var pie_data = [
        {
            values: pie_values,
            labels: pie_labels,
            type: 'pie',
        }
    ]

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
                        <Plot
                            data = {data_portfolio_value}
                            layout={{
                                width: 950,
                                height: 220,
                                margin: {
                                    l: 30,
                                    r: 10,
                                    t: 10,
                                    b: 30,
                                  },
                            }}
                            config={{
                                scrollZoom: true,
                                responsive: true,
                                displaylogo: false,
                            }}
                        />
                    </div>
                    <div className={style.results_portfolio_value_data_right}>
                        <div className={style.results_portfolio_value_data}>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{(results.p_capital_gain).toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0', fontSize:'12px'}}>Capital Gain (%)</label>
                            </div>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{(results.p_market_gain).toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0', fontSize:'12px'}}>Market Gain (%)</label>
                            </div>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{(results.p_dividend_yield).toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0', fontSize:'12px'}}>Dividend Yield (%)</label>
                            </div>
                        </div>
                        <div className={style.results_portfolio_value_pie_chart}>
                            <Plot
                            data = {pie_data}
                            layout={{
                                width: 265,
                                height: 220,
                                margin: {
                                    l: 30,
                                    r: 10,
                                    t: 10,
                                    b: 30,
                                  },
                                showlegend: false
                            }}
                            config={{
                                scrollZoom: true,
                                responsive: true,
                                displaylogo: false,
                            }}
                        />
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
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{results.sharpe.toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>Sharpe Ratio</label>
                            </div>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{results.treynor.toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>Treynor Ratio</label>
                            </div>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{results.sortino.toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>Sortino Ratio</label>
                            </div>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{results.jenson[0].toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>Jenson's Alpha</label>
                            </div>
                        </div>
                    </div>
                    <div className={style.results_portfolio_value_evaluation_item}>
                        <label style={{fontWeight:'bold'}}>Portfolio Parameters</label>
                        <div className={style.portfolio_value_evaluation_item_data}>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{results.p_capital_gain.toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>Portfolio Returns (%)</label>
                            </div>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{results.portfolio_std.toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>Standard Deviation</label>
                            </div>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{results.portfolio_beta.toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>Portfolio Beta</label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={style.results_portfolio_value_evaluation}>
                    <div className={style.results_portfolio_value_evaluation_item}>
                        <label style={{fontWeight:'bold'}}>Value-at-Risk (VAR)</label>
                        <div className={style.portfolio_value_evaluation_item_data}>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{results.var.ninety_p.toFixed(2)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>90% Confidence Level</label>
                            </div>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{results.var.ninety_five_p.toFixed(2)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>95% Confidence Level</label>
                            </div>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{results.var.ninety_nine_p.toFixed(2)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>99% Confidence Level</label>
                            </div>
                        </div>
                    </div>
                    <div className={style.results_portfolio_value_evaluation_item}>
                        <label style={{fontWeight:'bold'}}>Conditional Value-at-Risk (VAR)</label>
                        <div className={style.portfolio_value_evaluation_item_data}>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{results.cvar.ninety_p.toFixed(2)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>90% Confidence Level</label>
                            </div>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{results.cvar.ninety_five_p.toFixed(2)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>95% Confidence Level</label>
                            </div>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{results.cvar.ninety_nine_p.toFixed(2)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>99% Confidence Level</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={style.split_view}>
                <div className={style.split_view_item}>
                    <label style={{fontWeight:'bold'}}>Benchmark Comparison</label>
                    <div className={style.split_view_item_data}>
                        <div className={style.split_view_chart}>
                            <Plot
                            data = {data_benchmark_value}
                            layout={{
                                width: 480,
                                height: 180,
                                margin: {
                                    l: 30,
                                    r: 10,
                                    t: 10,
                                    b: 30,
                                  },
                            }}
                            config={{
                                scrollZoom: true,
                                responsive: true,
                                displaylogo: false,
                            }}
                        />
                        </div>
                        <div className={style.split_view_data}>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{results.p_benchmark_returns.toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>Benchmark Returns (%)</label>
                            </div>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{results.p_tracking_error.toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>Tracking Error (%)</label>
                            </div>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{results.information_ratio.toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>Information Ratio</label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={style.split_view_item}>
                    <label style={{fontWeight:'bold'}}>Value-at-Risk: Monte Carlo Method</label>
                    <div className={style.split_view_item_data}>
                        <div className={style.split_view_chart}>
                        <Plot
                            data = {data_monte_carlo_value}
                            layout={{
                                width: 480,
                                height: 180,
                                margin: {
                                    l: 30,
                                    r: 10,
                                    t: 10,
                                    b: 30,
                                  },
                            }}
                            config={{
                                scrollZoom: true,
                                responsive: true,
                                displaylogo: false,
                            }}
                        />
                        </div>
                        <div className={style.split_view_data}>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{results.var_monte_carlo.ninety_p.toFixed(2)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>90% Confidence Level</label>
                            </div>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{results.var_monte_carlo.ninety_five_p.toFixed(2)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>95% Confidence Level</label>
                            </div>
                            <div className={style.portfolio_value_evaluation_item_data_item}>
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{results.var_monte_carlo.ninety_nine_p.toFixed(2)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>99% Confidence Level</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={style.split_view}>
                <div className={style.split_view_item}>
                    <label style={{fontWeight:'bold'}}>Portfolio Correlation</label>
                    <div className={style.split_view_chart_2}>
                        <Plot
                            data = {correlation_data}
                            layout={{
                                width: 630,
                                height: 585,
                                margin: {
                                    l: 100,
                                    r: 10,
                                    t: 10,
                                    b: 30,
                                  },
                            }}
                            config={{
                                scrollZoom: true,
                                responsive: true,
                                displaylogo: false,
                            }}
                        />
                    </div>
                </div>

                <div className={style.split_view_item}>
                    <label style={{fontWeight:'bold'}}>Portfolio Heatmap View</label>
                    <div className={style.split_view_chart_2}>
                        {/* <Line data={chartData} options={chartOptions} /> */}
                    </div>
                </div>
            </div>

        </div>
    </div>
);
}

export default Results
