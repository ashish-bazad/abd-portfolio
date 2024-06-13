import React, { useEffect, useRef, useState, useContext } from 'react'
import style from './results.module.css'
import { useNavigate } from "react-router-dom";
import Plot from 'react-plotly.js';

const Results = () => {
    let [selectedOption, setSelectedOption] = useState(0);
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
    let [pie_changes, setPie_changes] = useState([1, 2, 3, -1])
    let portfolioRef = useRef(null);
    let benchmarkRef = useRef(null);
    let monteCarloRef = useRef(null);
    let correlationRef = useRef(null);
    let treeRef = useRef(null);
    let pieRef = useRef(null)
    let should_set_dimensions = useRef(true);
    let should_set_height = useRef(true);
    let [pieDim, setPieDim] = useState({width: 0, height: 0});
    let [portfolioDim, setPortfolioDim] = useState({width: 0, height: 0});
    let [benchmarkDim, setBenchmarkDim] = useState({width: 0, height: 0});
    let [monteCarloDim, setMonteCarloDim] = useState({width: 0, height: 0});
    let [correlationDim, setCorrelationDim] = useState({width: 0, height: 0});
    let [treeDim, setTreeDim] = useState({width: 0, height: 0});

    const corr_data = Object.keys(data_corr).map(key => data_corr[key]);
    const labels = Object.keys(data_corr);
    const intext_label = Object.keys(data_corr).map(key => data_corr[key].map(value => value.toFixed(2)));
    const navigate = useNavigate();
    useEffect(() => {
        if(!localStorage.getItem(`results_${selectedOption}`)) {
            navigate('/');
        }
    }, [navigate])
    let results = JSON.parse(localStorage.getItem(`results_${selectedOption}`));
    useEffect(() => {
        setData_p_x(results.date)
        setData_p_y(results.portfolio_value)
        setData_b_y(results.benchmark_value)
        setData_m_y(results.var_monte_carlo_simulated_returns)
        setData_corr(results.correlation_matrix)
        setPie_values(results.optimised_weights)
        setPie_labels(results.tickers_list)
        setPie_changes(results.capital_gain_per)
    }, [selectedOption])
    const handleOptionChange = (event) => {
        setSelectedOption(parseInt(event.target.value));
    };
    var data_portfolio_value = [
        {
          x: data_p_x,
          y: data_p_y,
          type: 'scatter',
          line: { color: '#1e90ff' },
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
            name: results.benchmark_ticker ? results.benchmark_ticker : '!!!'
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
    const getColor = (value) => {
        if(value > 0) return 'green';
        else if(value < 0) return 'red';
        else return 'black';
    }
    var tree_data = [
        {
            type: 'treemap',
            labels: pie_labels,
            parents: Array(pie_labels.length).fill(''),
            values: pie_values,
            text: pie_labels.map((label, index) => `<b>${label}</b><br>Weight: ${pie_values[index].toFixed(3)}<br>Change: ${pie_changes[index].toFixed(3)}%`),
            // textinfo: "label+value+percent parent+percent entry",
            texttemplate: "%{text}",
            hovertemplate: "%{text}",
            marker: {
                colors: pie_changes.map(change => getColor(change))
            }
        }
    ]

    useEffect(() => {
        const updateHeights = () => {
            if(portfolioRef.current) {
                const width = portfolioRef.current.offsetWidth;
                portfolioRef.current.style.height = `${width / 2.64}px`;
            }
            if(benchmarkRef.current) {
                const width = benchmarkRef.current.offsetWidth;
                benchmarkRef.current.style.height = `${width / 1.98}px`;
            }
            if(monteCarloRef.current) {
                const width = monteCarloRef.current.offsetWidth;
                monteCarloRef.current.style.height = `${width / 1.98}px`;
            }
            if(correlationRef.current) {
                const width = correlationRef.current.offsetWidth;
                correlationRef.current.style.height = `${width}px`;
            }
            if(treeRef.current) {
                const width = treeRef.current.offsetWidth;
                treeRef.current.style.height = `${width}px`;
            }
        }

        if(should_set_height.current) {
            should_set_height.current = false;
            updateHeights();
        }

        window.addEventListener('resize', updateHeights);
        return () => window.removeEventListener('resize', updateHeights);
    }, [])
    useEffect(() => {
        const updateDimensions = () => {
            if(portfolioRef.current) {
                const rect = portfolioRef.current.getBoundingClientRect();
                setPortfolioDim({width: rect.width - 2, height: rect.height - 2});
            }
            if(benchmarkRef.current) {
                const rect = benchmarkRef.current.getBoundingClientRect();
                setBenchmarkDim({width: rect.width - 2, height: rect.height - 2});
            }
            if(monteCarloRef.current) {
                const rect = monteCarloRef.current.getBoundingClientRect();
                setMonteCarloDim({width: rect.width - 2, height: rect.height - 2});
            }
            if(correlationRef.current) {
                const rect = correlationRef.current.getBoundingClientRect();
                setCorrelationDim({width: rect.width - 2, height: rect.height - 2});
            }
            if(treeRef.current) {
                const rect = treeRef.current.getBoundingClientRect();
                setTreeDim({width: rect.width - 2, height: rect.height - 2});
            }
            if(pieRef.current) {
                const rect = pieRef.current.getBoundingClientRect();
                setPieDim({width: rect.width - 2, height: rect.height - 2});
            }
        }

        if(should_set_dimensions.current) {
            should_set_dimensions.current = false;
            updateDimensions();
        }

        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, [])

    useEffect(() => {
        const portfolioChartContainer = document.getElementById('portfolioChartDiv');
        const benchmarkChartContainer = document.getElementById('benchmarkChartDiv');
        const monteChartContainer = document.getElementById('monteChartDiv');
        const correlationChartContainer = document.getElementById('correlationChartDiv');

        const stopPropagation = (e) => {
            e.stopPropagation();
        };
      
        const addScrollListener = () => {
            window.addEventListener('wheel', stopPropagation, { passive: false });
        };
      
        const removeScrollListener = () => {
            window.removeEventListener('wheel', stopPropagation, { passive: false });
        };

        portfolioChartContainer.addEventListener('mouseenter', addScrollListener);
        portfolioChartContainer.addEventListener('mouseleave', removeScrollListener);
        benchmarkChartContainer.addEventListener('mouseenter', addScrollListener);
        benchmarkChartContainer.addEventListener('mouseleave', removeScrollListener);
        monteChartContainer.addEventListener('mouseenter', addScrollListener);
        monteChartContainer.addEventListener('mouseleave', removeScrollListener);
        correlationChartContainer.addEventListener('mouseenter', addScrollListener);
        correlationChartContainer.addEventListener('mouseleave', removeScrollListener);

        return () => {
            portfolioChartContainer.removeEventListener('mouseenter', addScrollListener);
            portfolioChartContainer.removeEventListener('mouseleave', removeScrollListener);
            benchmarkChartContainer.removeEventListener('mouseenter', addScrollListener);
            benchmarkChartContainer.removeEventListener('mouseleave', removeScrollListener);
            monteChartContainer.removeEventListener('mouseenter', addScrollListener);
            monteChartContainer.removeEventListener('mouseleave', removeScrollListener);
            correlationChartContainer.removeEventListener('mouseenter', addScrollListener);
            correlationChartContainer.removeEventListener('mouseleave', removeScrollListener);
        }
    }, [])

    return (
    <div className={style.results_container}>
        <div className={style.results}>
            <button style={{margin:'20px 0px 0px 30px', width:'100px', height:'30px', border:'none', borderRadius:'3px', backgroundColor:'rgb(0, 103, 184)', color:'white', fontSize:'14px', fontWeight:'bold'}} onClick={() => navigate('/')}>Back</button>
            <div className={style.results_mode_selector}>
                <label style={{ fontWeight: 'bold' }}>Asset Allocation Strategy:</label>
                    <label>
                        <input
                            type="radio"
                            value={0}
                            checked={selectedOption === 0}
                            onChange={handleOptionChange}
                        />
                        Markowitz Mean-Variance
                    </label>
                    <label>
                        <input
                            type="radio"
                            value={1}
                            checked={selectedOption === 1}
                            onChange={handleOptionChange}
                        />
                        Equal Weighting
                    </label>
                    <label>
                        <input
                            type="radio"
                            value={2}
                            checked={selectedOption === 2}
                            onChange={handleOptionChange}
                        />
                        Risk Parity
                    </label>
            </div>

            <div className={style.split_view2}>
                <div className={style.results_portfolio_value}>
                    <label style={{fontWeight:'bold', fontSize:'20px'}}>Portfolio Value</label>
                    <div className={style.results_portfolio_value_chart} ref={portfolioRef} id='portfolioChartDiv'>
                        <Plot
                            data = {data_portfolio_value}
                            layout={{
                                width: portfolioDim.width,
                                height: portfolioDim.height,
                                margin: {
                                    l: 30,
                                    r: 0,
                                    t: 0,
                                    b: 20,
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
                <div className={style.results_portfolio_value_data}>
                    <div className={style.results_pie_chart_data_item}>
                            <div className={style.portfolio_value_eval_data}>
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{(results.p_capital_gain).toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0', fontSize:'12px'}}>Capital Gain (%)</label>
                            </div>
                            <div className={style.portfolio_value_eval_data}>
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{(results.p_market_gain).toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0', fontSize:'12px'}}>Market Gain (%)</label>
                            </div>
                            <div className={style.portfolio_value_eval_data}>
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{(results.p_dividend_yield).toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0', fontSize:'12px'}}>Dividend Yield (%)</label>
                            </div>
                        </div>
                    </div>
            </div>

            <div className={style.split_view} style={{height:'400px'}}>
                <div className={style.results_pie_chart_data_item2}>
                    <center><label style={{fontWeight:'bold'}}>Asset Allocation</label></center>
                    <div className={style.results_pie_chart} ref={pieRef} id='pieChartDiv'>
                        <Plot
                            data = {pie_data}
                            layout={{
                                width: pieDim.width,
                                height: pieDim.height,
                                margin: {
                                    l: 30,
                                    r: 10,
                                    t: 10,
                                    b: 30,
                                },
                                showlegend: false
                            }}
                            config={{
                                responsive: true,
                                displaylogo: false,
                            }}
                        />
                    </div>
                </div>

                <div className={style.split_view_item}>
                    <div className={style.results_portfolio_value_evaluation_item}>
                        <label style={{fontWeight:'bold'}}>Portfolio Evaluation</label>
                        <div className={style.portfolio_value_evaluation_item_data}>
                            <div className={style.portfolio_value_eval_data}>
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{results.sharpe.toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>Sharpe Ratio</label>
                            </div>
                            <div className={style.portfolio_value_eval_data}>
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{results.treynor.toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>Treynor Ratio</label>
                            </div>
                            <div className={style.portfolio_value_eval_data}>
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{results.sortino.toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>Sortino Ratio</label>
                            </div>
                            <div className={style.portfolio_value_eval_data}>
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{results.jenson[0].toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>Jenson's Alpha</label>
                            </div>
                        </div>
                    </div>
                    <div className={style.results_portfolio_value_evaluation_item}>
                        <label style={{fontWeight:'bold'}}>Portfolio Parameters</label>
                        <div className={style.portfolio_value_evaluation_item_data}>
                            <div className={style.portfolio_value_eval_data}>
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{results.p_portfolio_returns.toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>Annual Returns (%)</label>
                            </div>
                            <div className={style.portfolio_value_eval_data}>
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{results.portfolio_std.toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>Standard Deviation</label>
                            </div>
                            <div className={style.portfolio_value_eval_data}>
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{results.portfolio_beta.toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>Portfolio Beta</label>
                            </div>
                        </div>
                    </div>

                    <div className={style.results_portfolio_value_evaluation_item}>
                        <label style={{fontWeight:'bold'}}>Value-at-Risk (VAR)</label>
                        <div className={style.portfolio_value_evaluation_item_data}>
                            <div className={style.portfolio_value_eval_data}>
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{results.var.ninety_p.toFixed(2)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>90% Confidence Level</label>
                            </div>
                            <div className={style.portfolio_value_eval_data}>
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{results.var.ninety_five_p.toFixed(2)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>95% Confidence Level</label>
                            </div>
                            <div className={style.portfolio_value_eval_data}>
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{results.var.ninety_nine_p.toFixed(2)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>99% Confidence Level</label>
                            </div>
                        </div>
                    </div>
                    <div className={style.results_portfolio_value_evaluation_item}>
                        <label style={{fontWeight:'bold'}}>Conditional Value-at-Risk (VAR)</label>
                        <div className={style.portfolio_value_evaluation_item_data}>
                            <div className={style.portfolio_value_eval_data}>
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{results.cvar.ninety_p.toFixed(2)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>90% Confidence Level</label>
                            </div>
                            <div className={style.portfolio_value_eval_data}>
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{results.cvar.ninety_five_p.toFixed(2)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>95% Confidence Level</label>
                            </div>
                            <div className={style.portfolio_value_eval_data}>
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
                        <div className={style.split_view_chart} ref={benchmarkRef} id='benchmarkChartDiv'>
                            <Plot
                            data = {data_benchmark_value}
                            layout={{
                                width: benchmarkDim.width,
                                height: benchmarkDim.height,
                                margin: {
                                    l: 30,
                                    r: 10,
                                    t: 0,
                                    b: 20,
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
                            <div className={style.portfolio_value_eval_data}>
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{results.p_benchmark_returns.toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>Benchmark Returns (%)</label>
                            </div>
                            <div className={style.portfolio_value_eval_data}>
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{results.p_tracking_error.toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>Tracking Error (%)</label>
                            </div>
                            <div className={style.portfolio_value_eval_data}>
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{results.information_ratio.toFixed(3)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>Information Ratio</label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={style.split_view_item}>
                    <label style={{fontWeight:'bold'}}>Value-at-Risk: Monte Carlo Method</label>
                    <div className={style.split_view_item_data}>
                        <div className={style.split_view_chart} ref={monteCarloRef} id='monteChartDiv'>
                        <Plot
                            data = {data_monte_carlo_value}
                            layout={{
                                width: monteCarloDim.width,
                                height: monteCarloDim.height,
                                bargap: 0.1,
                                margin: {
                                    l: 30,
                                    r: 0,
                                    t: 0,
                                    b: 20,
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
                            <div className={style.portfolio_value_eval_data}>
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{results.var_monte_carlo.ninety_p.toFixed(2)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>90% Confidence Level</label>
                            </div>
                            <div className={style.portfolio_value_eval_data}>
                                <label style={{fontSize:'20px', margin:'0', color:'rgb(34, 103, 196)'}}>{results.var_monte_carlo.ninety_five_p.toFixed(2)}</label>
                                <label style={{fontWeight:'bold', margin:'0'}}>95% Confidence Level</label>
                            </div>
                            <div className={style.portfolio_value_eval_data}>
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
                    <div className={style.split_view_chart_2} ref={correlationRef} id='correlationChartDiv'>
                        <Plot
                            data = {correlation_data}
                            layout={{
                                width: correlationDim.width,
                                height: correlationDim.height,
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
                    <label style={{fontWeight:'bold'}}>Portfolio Treemap View</label>
                    <div className={style.split_view_chart_2} ref={treeRef}>
                    <Plot
                            data = {tree_data}
                            layout={{
                                width: treeDim.width,
                                height: treeDim.height,
                                margin: {
                                    l: 10,
                                    r: 10,
                                    t: 10,
                                    b: 10,
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
            </div>
        </div>
    </div>
);
}

export default Results
