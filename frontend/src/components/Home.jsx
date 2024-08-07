import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import style from "./home.module.css";
import Plot from 'react-plotly.js';
import AuthContext from '../utility/AuthContext';
import { BarLoader } from "react-spinners";

const Home = () => {
    let { get_tickers, get_tickers_data, analyze_data, search_tickers } = useContext(AuthContext);
    let should_get_tickers = useRef(true);
    let should_create_bucket = useRef(true);
    let cms = useRef(0);
    let [tickers, setTickers] = useState({});
    let [tickers_table_data, setTickersTableData] = useState(null);
    let [selected_ticker, setSelectedTicker] = useState(null);
    if(!localStorage.getItem('selection')) {
        localStorage.setItem('selection', 0);
    }
    let [currentSelection, setCurrentSelection] = useState(parseInt(localStorage.getItem('selection')));
    let [searchText, setSearchText] = useState("");
    let [searching, setSearching] = useState(false);
    let [searched_tickers, setSearchedTickers] = useState({});
    let [checkedItems, setCheckedItems] = useState([]);
    let [adding_loading, setAdding_loading] = useState(false);
    let [minimum_weight, setMinimumWeight] = useState(0);
    let [maximum_weight, setMaximumWeight] = useState(100);
    let [show_bucket, setShowBucket] = useState(false);
    let [analysis_options, setAnalysisOptions] = useState(false);
    let [tmpReload, setTmpReload] = useState(false);
    let [showSettings, setShowSettings] = useState(false);
    let period = localStorage.getItem("period")? localStorage.getItem("period"): "1y";
    let [tperiod, setTperiod] = useState(period);
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
    let [data_x, setData_x] = useState(['2013-10-04 22:23:00', '2013-11-04 22:23:00', '2013-12-04 22:23:00']);
    let [data_y, setData_y] = useState([1, 3, 6]);
    let [data_x_v, setData_x_v] = useState(['2013-10-04 22:23:00', '2013-11-04 22:23:00', '2013-12-04 22:23:00']);
    let [data_y_v, setData_y_v] = useState([1, 3, 6]);
    let [analysing, setAnalysing] = useState(false);
    let volatility_chart_parent_div = useRef(null);
    let price_chart_parent_div = useRef(null);
    let should_update_dimensions = useRef(true);
    let [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    let [dimensionsP, setDimensionsP] = useState({ width: 0, height: 0 });
    let should_update_height = useRef(true);
    let [loading, setLoading] = useState(false);
    let [searchLoading, setSearchLoading] = useState(false);
    let [searchError, setSearchError] = useState(false);
    let [search_error_status_code, setSearch_error_status_code] = useState(null);
    let [tickersError, setTickersError] = useState(false);
    let [tickersErrorStatusCode, setTickersErrorStatusCode] = useState(null);
    const navigate = useNavigate();

    var current_selection = "equity";
    switch (currentSelection) {
        case 0:
        current_selection = "equity";
        break;
        case 1:
        current_selection = "commodities";
        break;
        case 2:
        current_selection = "t_notes";
        break;
        case 3:
        current_selection = "reit";
        break;
        default:
        current_selection = "crypto";
    }

    useEffect(() => {
        setTperiod(period);
    }, [period]);

    useEffect(() => {
        if (should_create_bucket.current) {
        should_create_bucket.current = false;
        // equity bucket
        if (!localStorage.getItem("equity_bucket")) {
            localStorage.setItem("equity_bucket", JSON.stringify([]));
        }
        // commodity bucket
        if (!localStorage.getItem("commodities_bucket")) {
            localStorage.setItem("commodities_bucket", JSON.stringify([]));
        }
        // treasury notes bucket
        if (!localStorage.getItem("t_notes_bucket")) {
            localStorage.setItem("t_notes_bucket", JSON.stringify([]));
        }
        // reits bucket
        if (!localStorage.getItem("reit_bucket")) {
            localStorage.setItem("reit_bucket", JSON.stringify([]));
        }
        // crypto bucket
        if (!localStorage.getItem("crypto_bucket")) {
            localStorage.setItem("crypto_bucket", JSON.stringify([]));
        }
        }
        let bucket = JSON.parse(localStorage.getItem(`equity_bucket`));
        cms.current = 0;
        for (let i = 0; i < bucket.length; i++) {
            cms.current += bucket[i][1];
        }
        bucket = JSON.parse(localStorage.getItem(`commodities_bucket`));
        for (let i = 0; i < bucket.length; i++) {
            cms.current += bucket[i][1];
        }
        bucket = JSON.parse(localStorage.getItem(`t_notes_bucket`));
        for (let i = 0; i < bucket.length; i++) {
            cms.current += bucket[i][1];
        }
        bucket = JSON.parse(localStorage.getItem(`reit_bucket`));
        for (let i = 0; i < bucket.length; i++) {
            cms.current += bucket[i][1];
        }
        bucket = JSON.parse(localStorage.getItem(`crypto_bucket`));
        for (let i = 0; i < bucket.length; i++) {
            cms.current += bucket[i][1];
        }
    }, [currentSelection]);
    useEffect(() => {
      if(selected_ticker !== null) {
        let data = JSON.parse(localStorage.getItem(`${current_selection}_list_data`));
        setData_x(data.price_data['DATE']);
        setData_y(data.price_data[selected_ticker[0]]);
        setData_x_v(data.volatility_data['DATE']);
        setData_y_v(data.volatility_data[selected_ticker[0]]);
      }
    }, [selected_ticker])
    const gather_ticker_data = async (ticker) => {
        setSelectedTicker(ticker);
    };
    const get_tickers_table_data = async () => {
        setAdding_loading(true);
        setLoading(true);
        const currentTime = new Date();
        const updateTime = new Date(currentTime);
        updateTime.setHours(15, 30, 0, 0); // Set update time to 3:30 PM

        let lastUpdated = localStorage.getItem("tickers_list_last_updated");
        lastUpdated = lastUpdated ? new Date(lastUpdated) : null;

        // Check if lastUpdated is from a different day or if it is before today's 3:30 PM
        const needsUpdate =
        !lastUpdated ||
        !localStorage.getItem("equity_list") ||
        !localStorage.getItem("equity_list_data") ||
        !localStorage.getItem("commodities_list") ||
        !localStorage.getItem("commodities_list_data") ||
        !localStorage.getItem("t_notes_list") ||
        !localStorage.getItem("t_notes_list_data") ||
        !localStorage.getItem("reit_list") ||
        !localStorage.getItem("reit_list_data") ||
        !localStorage.getItem("crypto_list") ||
        !localStorage.getItem("crypto_list_data") ||
        lastUpdated.toDateString() !== currentTime.toDateString() ||
        (currentTime >= updateTime && lastUpdated < updateTime);
        if (needsUpdate) {
          // Get the list of tickers
          if (!localStorage.getItem("equity_list")) {
              const data = await get_tickers('equity');
              if(data.error) {
                setTickersError(true);
                setTickersErrorStatusCode(data.status);
                } else {
                  localStorage.setItem("equity_list", JSON.stringify(data.tickers));
                }
          }
          if (!localStorage.getItem("commodities_list")) {
              const data = await get_tickers('commodities');
              if(data.error) {
                setTickersError(true);
                setTickersErrorStatusCode(data.status);
              } else {
                localStorage.setItem("commodities_list", JSON.stringify(data.tickers));
              }
          }
          if (!localStorage.getItem("t_notes_list")) {
              const data = await get_tickers('t_notes');
              if(data.error) {
                setTickersError(true);
                setTickersErrorStatusCode(data.status);
              } else {
                localStorage.setItem("t_notes_list", JSON.stringify(data.tickers));
              }
          }
          if (!localStorage.getItem("reit_list")) {
              const data = await get_tickers('reit');
              if(data.error) {
                setTickersError(true);
                setTickersErrorStatusCode(data.status);
              } else {
                localStorage.setItem("reit_list", JSON.stringify(data.tickers));
              }
          }
          if (!localStorage.getItem("crypto_list")) {
            const data = await get_tickers('crypto');
            if(data.error) {
              setTickersError(true);
              setTickersErrorStatusCode(data.status);
            } else {
              localStorage.setItem("crypto_list", JSON.stringify(data.tickers));
            }
          }
          setTickers(JSON.parse(localStorage.getItem(`${current_selection}_list`)));
          
          // Get data for all the tickers
          let prices_list = await get_tickers_data(Object.keys(JSON.parse(localStorage.getItem("equity_list"))));
          localStorage.setItem("equity_list_data", JSON.stringify(prices_list));
          prices_list = await get_tickers_data(Object.keys(JSON.parse(localStorage.getItem("commodities_list"))));
          localStorage.setItem("commodities_list_data", JSON.stringify(prices_list));
          prices_list = await get_tickers_data(Object.keys(JSON.parse(localStorage.getItem("t_notes_list"))));
          localStorage.setItem("t_notes_list_data", JSON.stringify(prices_list));
          prices_list = await get_tickers_data(Object.keys(JSON.parse(localStorage.getItem("reit_list"))));
          localStorage.setItem("reit_list_data", JSON.stringify(prices_list));
          prices_list = await get_tickers_data(Object.keys(JSON.parse(localStorage.getItem("crypto_list"))));
          localStorage.setItem("crypto_list_data", JSON.stringify(prices_list));
          setCheckedItems(Object.keys(JSON.parse(localStorage.getItem(`${current_selection}_list`))));
          setTickersTableData(JSON.parse(localStorage.getItem(`${current_selection}_list_data`)).table_data);
          setSelectedTicker(Object.entries(JSON.parse(localStorage.getItem(`${current_selection}_list`)))[0]);

          localStorage.setItem("tickers_list_last_updated", currentTime.toISOString());
        } else {
          setTickers(JSON.parse(localStorage.getItem(`${current_selection}_list`)));
          setCheckedItems(Object.keys(JSON.parse(localStorage.getItem(`${current_selection}_list`))));
          setTickersTableData(JSON.parse(localStorage.getItem(`${current_selection}_list_data`)).table_data);
          setSelectedTicker(Object.entries(JSON.parse(localStorage.getItem(`${current_selection}_list`)))[0]);
        }
        setAdding_loading(false);
        setLoading(false);
    };
    useEffect(() => {
        if (should_get_tickers.current) {
          should_get_tickers.current = false;
          get_tickers_table_data();
        }
    }, [currentSelection]);
    
    let loadResults = async (e) => {
        e.preventDefault();
        setAnalysing(true);
        let start_date = document.getElementById("start_date").value;
        let end_date = document.getElementById("end_date").value;
        let number_of_simulations = document.getElementById("number_of_simulations").value;
        let initial_amount = document.getElementById("initial_amount").value;
        let benchmark_ticker = document.getElementById("benchmark_ticker").value;
        let market_ticker = document.getElementById("market_ticker").value;
        let equity_bucket = JSON.parse(localStorage.getItem("equity_bucket"));
        let commodities_bucket = JSON.parse(localStorage.getItem("commodities_bucket"));
        let t_notes_bucket = JSON.parse(localStorage.getItem("t_notes_bucket"));
        let reit_bucket = JSON.parse(localStorage.getItem("reit_bucket"));
        let crypto_bucket = JSON.parse(localStorage.getItem("crypto_bucket"));
        let buckets_min_weights = [equity_bucket_min_weight, commodities_bucket_min_weight, t_notes_bucket_min_weight, reit_bucket_min_weight, crypto_bucket_min_weight];
        let buckets_max_weights = [equity_bucket_max_weight, commodities_bucket_max_weight, t_notes_bucket_max_weight, reit_bucket_max_weight, crypto_bucket_max_weight];
        let data = {
            start_date: start_date,
            end_date: end_date,
            number_of_simulations: number_of_simulations,
            initial_amount: initial_amount,
            benchmark_ticker: benchmark_ticker,
            market_ticker: market_ticker,
            equity_bucket: equity_bucket,
            commodities_bucket: commodities_bucket,
            t_notes_bucket: t_notes_bucket,
            reit_bucket: reit_bucket,
            crypto_bucket: crypto_bucket,
            buckets_min_weights: buckets_min_weights,
            buckets_max_weights: buckets_max_weights
        }
        const response = await analyze_data(data);
        if(response) {
            navigate("/results");
        }
        setAnalysing(false);
    };
    const getClassByValue = (value) => {
        if (parseFloat(value) > 0) {
        return style.positive;
        } else if (parseFloat(value) < 0) {
        return style.negative;
        } else {
        return "";
        }
    };
    const changeSelection = (item) => {
        should_get_tickers.current = true;
        localStorage.setItem("selection", parseInt(item.index));
        setCurrentSelection(parseInt(item.index));
    };

    const search_ticker = async (text) => {
        setSearchLoading(true);
        const data = await search_tickers(text, current_selection);
        if(data.error) {
          setSearch_error_status_code(data.status);
          setSearchError(true);
        } else {
          setSearchedTickers(data.tickers);
        }
        setSearchLoading(false);
    };

    useEffect(() => {
        if (searchText === "") {
        setTickers(JSON.parse(localStorage.getItem(`${current_selection}_list`)));
        setSearching(false);
        setSearchError(false);
        } else {
        setSearching(true);
        search_ticker(searchText.toUpperCase());
        }
    }, [searchText]);
    const handleSearch = (e) => {
        setSearchText(e.target.value);
        const clearButton = document.getElementById("clear_button");
        if (e.target.value !== "") {
        clearButton.classList.remove(style.slideOut);
        clearButton.classList.add(style.slideIn);
        } else {
        clearButton.classList.remove(style.slideIn);
        clearButton.classList.add(style.slideOut);
        }
    };
    const clearSearch = () => {
        setSearchText("");
        const clearButton = document.querySelector(`.${style.clear_button}`);
        if (clearButton.classList.contains(style.slideIn)) {
        clearButton.classList.remove(style.slideIn);
        clearButton.classList.add(style.slideOut);
        }
    };
    const handleCheckboxChange = async (ticker, name) => {
        let tmp = [];
        let tmp2 = JSON.parse(localStorage.getItem(`${current_selection}_list`));
        setAdding_loading(true);
        if (checkedItems.includes(ticker)) {
        tmp = checkedItems.filter((item) => item !== ticker);
        delete tmp2[ticker];
        let tmp3 = JSON.parse(localStorage.getItem(`${current_selection}_list_data`));
        delete tmp3.volatility_data[ticker];
        delete tmp3.price_data[ticker];
        let ind = tmp3.table_data.SYMBOLS.indexOf(ticker);
        tmp3.table_data.SYMBOLS.splice(ind, 1);
        tmp3.table_data.PRICE.splice(ind, 1);
        tmp3.table_data.CHANGE.splice(ind, 1);
        tmp3.table_data.PCHANGE.splice(ind, 1);
        tmp3.table_data.LOW.splice(ind, 1);
        tmp3.table_data.HIGH.splice(ind, 1);
        localStorage.setItem(`${current_selection}_list_data`, JSON.stringify(tmp3));
        localStorage.setItem(`${current_selection}_list`, JSON.stringify(tmp2));
        setTickers(tmp2);
        setTickersTableData(tmp3.table_data);
        } else {
          let tmp3 = JSON.parse(localStorage.getItem(`${current_selection}_list_data`));
          const data = await get_tickers_data([ticker]);
          if(data.error) {
            console.log(data.status);
            tmp = [...checkedItems];
          } else {
            tmp = [...checkedItems, ticker];
            tmp2[ticker] = name;
            tmp3.volatility_data[ticker] = data.volatility_data[ticker];
            tmp3.price_data[ticker] = data.price_data[ticker];
            tmp3.table_data.SYMBOLS.push(data.table_data.SYMBOLS[0]);
            tmp3.table_data.PRICE.push(data.table_data.PRICE[0]);
            tmp3.table_data.CHANGE.push(data.table_data.CHANGE[0]);
            tmp3.table_data.PCHANGE.push(data.table_data.PCHANGE[0]);
            tmp3.table_data.LOW.push(data.table_data.LOW[0]);
            tmp3.table_data.HIGH.push(data.table_data.HIGH[0]);
            localStorage.setItem(`${current_selection}_list_data`, JSON.stringify(tmp3));
            localStorage.setItem(`${current_selection}_list`, JSON.stringify(tmp2));
            setTickers(tmp2);
            setTickersTableData(tmp3.table_data);
          }
        }
        setAdding_loading(false);
        setCheckedItems(tmp);
    };

    const handleAddToBucket = (e) => {
        e.preventDefault();
        let bucket = JSON.parse(localStorage.getItem(`${current_selection}_bucket`));
        let tick = selected_ticker;
        let max_weight = parseInt(maximum_weight),
        min_weight = parseInt(minimum_weight);
        bucket = [...bucket, [tick, min_weight, max_weight]];
        localStorage.setItem(`${current_selection}_bucket`, JSON.stringify(bucket));
        window.location.reload();
    };

  useEffect(() => {
    if(analysis_options) {
        cbms.current = 0;
        cabms.current = [0, 0, 0, 0, 0];
        let bucket = JSON.parse(localStorage.getItem(`equity_bucket`));
        if(bucket) {
            if(bucket.length !== 0) {
                for(let i = 0; i < bucket.length; i++) {
                    cabms.current[0] += bucket[i][1];
                }
                setEquityBucketMinWeight(cabms.current[0]);
                cbms.current += cabms.current[0];
            }
        }
        bucket = JSON.parse(localStorage.getItem(`commodities_bucket`));
        if(bucket) {
            if(bucket.length !== 0) {
                for(let i = 0; i < bucket.length; i++) {
                    cabms.current[1] += bucket[i][1];
                }
                setCommoditiesBucketMinWeight(cabms.current[1]);
                cbms.current += cabms.current[1];
            }
        }
        bucket = JSON.parse(localStorage.getItem(`t_notes_bucket`));
        if(bucket) {
            if(bucket.length !== 0) {
                for(let i = 0; i < bucket.length; i++) {
                    cabms.current[2] += bucket[i][1];
                }
                setT_notesBucketMinWeight(cabms.current[2]);
                cbms.current += cabms.current[2];
            }
        }
        bucket = JSON.parse(localStorage.getItem(`reit_bucket`));
        if(bucket) {
            if(bucket.length !== 0) {
                for(let i = 0; i < bucket.length; i++) {
                    cabms.current[3] += bucket[i][1];
                }
                setReitBucketMinWeight(cabms.current[3]);
                cbms.current += cabms.current[3];
            }
        }
        bucket = JSON.parse(localStorage.getItem(`crypto_bucket`));
        if(bucket) {
            if(bucket.length !== 0) {
                for(let i = 0; i < bucket.length; i++) {
                    cabms.current[4] += bucket[i][1];
                }
                setCryptoBucketMinWeight(cabms.current[4]);
                cbms.current += cabms.current[4];
            }
        }
        setCbmse(cbms.current - cabms.current[0]);
        setCbmsc(cbms.current - cabms.current[1]);
        setCbmst(cbms.current - cabms.current[2]);
        setCbmsr(cbms.current - cabms.current[3]);
        setCbmscr(cbms.current - cabms.current[4]);
    }
  }, [analysis_options]);

  useEffect(() => {
    setCbmse(cbms.current - equity_bucket_min_weight);
    setCbmsc(cbms.current - commodities_bucket_min_weight);
    setCbmst(cbms.current - t_notes_bucket_min_weight);
    setCbmsr(cbms.current - reit_bucket_min_weight);
    setCbmscr(cbms.current - crypto_bucket_min_weight);
  }, [equity_bucket_min_weight, commodities_bucket_min_weight, t_notes_bucket_min_weight, reit_bucket_min_weight, crypto_bucket_min_weight])

  var data = [
    {
      x: data_x,
      y: data_y,
      type: 'scatter'
    }
  ];
  var data_v = [
    {
      x: data_x_v,
      y: data_y_v,
      type: 'scatter'
    }
  ]
  useEffect(() => {
    const homeChartContainer = document.getElementById('home_chart');
    const priceChartContainer = document.getElementById('priceChartContainer');
    const volatilityChartContainer = document.getElementById('volatilityChartContainer');

    const stopPropagation = (e) => {
      e.stopPropagation();
    };

    const addScrollListener = () => {
      homeChartContainer.addEventListener('wheel', stopPropagation, { passive: false });
    };

    const removeScrollListener = () => {
      homeChartContainer.removeEventListener('wheel', stopPropagation, { passive: false });
    };

    priceChartContainer.addEventListener('mouseenter', addScrollListener);
    priceChartContainer.addEventListener('mouseleave', removeScrollListener);
    volatilityChartContainer.addEventListener('mouseenter', addScrollListener);
    volatilityChartContainer.addEventListener('mouseleave', removeScrollListener);

    return () => {
      priceChartContainer.removeEventListener('mouseenter', addScrollListener);
      priceChartContainer.removeEventListener('mouseleave', removeScrollListener);
      volatilityChartContainer.removeEventListener('mouseenter', addScrollListener);
      volatilityChartContainer.removeEventListener('mouseleave', removeScrollListener);
    };
  }, []);

  useEffect(() => {
    const updateHeight = () => {
      if(volatility_chart_parent_div.current) {
        const width = volatility_chart_parent_div.current.offsetWidth;
        volatility_chart_parent_div.current.style.height = `${width / 3}px`
      }
      if(price_chart_parent_div.current) {
        const width = price_chart_parent_div.current.offsetWidth;
        price_chart_parent_div.current.style.height = `${width / 2}px`
      }
    };

    if(should_update_height.current) {
      should_update_height.current = false;
      updateHeight();
    }

    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [])
  useEffect(() => {
    const updateDimensions = () => {
      if (volatility_chart_parent_div.current) {
        const rect = volatility_chart_parent_div.current.getBoundingClientRect();
        setDimensions({ width: rect.width - 2, height: rect.height - 2 });
      }
      if(price_chart_parent_div.current) {
        const rect = price_chart_parent_div.current.getBoundingClientRect();
        setDimensionsP({ width: rect.width - 2, height: (rect.height - 2) });
      }
    };

    if(should_update_dimensions.current) {
      should_update_dimensions.current = false;
      updateDimensions();
    }

    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div className={style.home_container}>
      {loading && (
        <div className={style.loading_page}>
          <div className={style.loading_container}>
            <h1>Gathering Latest Data</h1>
            <BarLoader color="rgb(34, 103, 196" width='50%' />
          </div>
        </div>
      )}
      {tickersError && (
        <div className={style.loading_page}>
          <div className={style.loading_container}>
            <h1 style={{color:'red'}}>Error Fetching Data</h1>
            <h2 style={{color:'red'}}>Status Code: {tickersErrorStatusCode}</h2>
          </div>
        </div>
      )}
      {analysing && (
        <div className={style.popup_container} style={{zIndex:'100'}}>
          <div className={style.loading}>
            <h1>Running Simulations...</h1>
            <h2>This may take a while depending on your set parameters</h2>
            <div className={style.barloader}>
              <BarLoader color="rgb(34, 103, 196" width='30%' />
            </div>
          </div>
        </div>
      )}
      {analysis_options && (
            <div className={style.popup_container} onClick={() => setAnalysisOptions(false)}>
                <div className={style.popup} onClick={(e) => e.stopPropagation()}>
                    <div className={style.popup_header}>
                        <h2>Simulation Parameters</h2>
                    </div>
                    <span className={style.closeButton} onClick={() => setAnalysisOptions(false)}>ⓧ</span>
                    <div className={style.analysis_options}>
                        <form onSubmit={loadResults}>
                        <label style={{ fontWeight: "bold", fontSize: "14px", color:'red' }}>Difference between Start Date and End Date must be at least 52 Days for the results to load!</label>
                            <div className={style.analysis_options_input}>
                                <label style={{ fontWeight: "bold", fontSize: "14px" }}>Start Date : </label>
                                <input type="date" id="start_date" required={true} />
                            </div>
                            <div className={style.analysis_options_input}>
                                <label style={{ fontWeight: "bold", fontSize: "14px" }}>End Date : </label>
                                <input type="date" id="end_date" required={true} />
                            </div>
                            <div className={style.analysis_options_input}>
                                <label style={{ fontWeight: "bold", fontSize: "14px" }}>Number of Simulations : </label>
                                <input type="number" id="number_of_simulations" max={20000} placeholder="5000" />
                            </div>
                            <div className={style.analysis_options_input}>
                                <label style={{ fontWeight: "bold", fontSize: "14px" }}>Initial Amount : </label>
                                <input type="number" id="initial_amount" placeholder="10000" />
                            </div>
                            <div className={style.analysis_options_input}>
                                <label style={{ fontWeight: "bold", fontSize: "14px" }}>Benchmark Ticker : </label>
                                <select defaultValue="^NSEI" id="benchmark_ticker" required={true}>
                                    <option value="^GSPC">^GSPC</option>
                                    <option value="^IXIC">^IXIC</option>
                                    <option value="^NSEI">^NSEI</option>
                                    <option value="^NSEMDCP50">^NSEMDCP50</option>
                                    <option value="^BSESN">^BSESN</option>
                                </select>
                            </div>
                            <div className={style.analysis_options_input}>
                                <label style={{ fontWeight: "bold", fontSize: "14px" }}>Market Ticker : </label>
                                <select defaultValue="^NSEI" id="market_ticker" required={true}>
                                    <option value="^GSPC">^GSPC</option>
                                    <option value="^IXIC">^IXIC</option>
                                    <option value="^NSEI">^NSEI</option>
                                    <option value="^NSEMDCP50">^NSEMDCP50</option>
                                    <option value="^BSESN">^BSESN</option>
                                </select>
                            </div>
                            {equity_bucket_min_weight !== null && (
                                <div className={style.analysis_options_input}>
                                    <label style={{ fontWeight: "bold", fontSize: "14px" }}>Equity Bucket Min Weight : </label>
                                    <input style={{width: "40px"}} type="number" value={equity_bucket_min_weight} min={cabms.current[0]} max={100 - cbmse} 
                                    onChange={(e) => {
                                        cbms.current += Math.max(cabms.current[0], Math.min(e.target.value, 100 - cbmse)) - equity_bucket_min_weight;
                                        setEquityBucketMinWeight(Math.max(cabms.current[0], Math.min(e.target.value, 100 - cbmse)));
                                    }}
                                    required={true} />
                                </div>
                            )}
                            {equity_bucket_min_weight !== null && (
                                <div className={style.analysis_options_input}>
                                    <label style={{ fontWeight: "bold", fontSize: "14px" }}>Equity Bucket Max Weight : </label>
                                    <input style={{width: "40px"}} type="number" value={equity_bucket_max_weight} min={equity_bucket_min_weight} max={100} 
                                    onChange={(e) => {
                                        setEquityBucketMaxWeight(e.target.value);
                                    }}
                                    required={true} />
                                </div>
                            )}
                            {commodities_bucket_min_weight !== null && (
                                <div className={style.analysis_options_input}>
                                    <label style={{ fontWeight: "bold", fontSize: "14px" }}>Commodities Bucket Min Weight : </label>
                                    <input style={{width: "40px"}} type="number" value={commodities_bucket_min_weight} min={cabms.current[1]} max={100 - cbmsc} 
                                    onChange={(e) => {
                                        cbms.current += Math.max(cabms.current[0], Math.min(e.target.value, 100 - cbmse)) - commodities_bucket_min_weight;
                                        setCommoditiesBucketMinWeight(Math.max(cabms.current[1], Math.min(e.target.value, 100 - cbmsc)));
                                    }}
                                    required={true} />
                                </div>
                            )}
                            {commodities_bucket_min_weight !== null && (
                                <div className={style.analysis_options_input}>
                                    <label style={{ fontWeight: "bold", fontSize: "14px" }}>Commodities Bucket Max Weight : </label>
                                    <input style={{width: "40px"}} type="number" value={commodities_bucket_max_weight} min={commodities_bucket_min_weight} max={100} 
                                    onChange={(e) => {
                                        setCommoditiesBucketMaxWeight(e.target.value);
                                    }}
                                    required={true} />
                                </div>
                            )}
                            {t_notes_bucket_min_weight !== null && (
                                <div className={style.analysis_options_input}>
                                    <label style={{ fontWeight: "bold", fontSize: "14px" }}>US Treasury Notes Bucket Min Weight : </label>
                                    <input style={{width: "40px"}} type="number" value={t_notes_bucket_min_weight} min={cabms.current[2]} max={100 - cbmst} 
                                    onChange={(e) => {
                                        cbms.current += Math.max(cabms.current[0], Math.min(e.target.value, 100 - cbmse)) - t_notes_bucket_min_weight;
                                        setT_notesBucketMinWeight(Math.max(cabms.current[2], Math.min(e.target.value, 100 - cbmst)));
                                    }}
                                    required={true} />
                                </div>
                            )}
                            {t_notes_bucket_min_weight !== null && (
                                <div className={style.analysis_options_input}>
                                    <label style={{ fontWeight: "bold", fontSize: "14px" }}>US Treasury Notes Bucket Max Weight : </label>
                                    <input style={{width: "40px"}} type="number" value={t_notes_bucket_max_weight} min={t_notes_bucket_min_weight} max={100} 
                                    onChange={(e) => {
                                        setT_notesBucketMaxWeight(e.target.value);
                                    }}
                                    required={true} />
                                </div>
                            )}
                            {reit_bucket_min_weight !== null && (
                                <div className={style.analysis_options_input}>
                                    <label style={{ fontWeight: "bold", fontSize: "14px" }}>REITs Bucket Min Weight : </label>
                                    <input style={{width: "40px"}} type="number" value={reit_bucket_min_weight} min={cabms.current[3]} max={100 - cbmsr} 
                                    onChange={(e) => {
                                        cbms.current += Math.max(cabms.current[0], Math.min(e.target.value, 100 - cbmse)) - reit_bucket_min_weight;
                                        setReitBucketMinWeight(Math.max(cabms.current[3], Math.min(e.target.value, 100 - cbmsr)));
                                    }}
                                    required={true} />
                                </div>
                            )}
                            {reit_bucket_min_weight !== null && (
                                <div className={style.analysis_options_input}>
                                    <label style={{ fontWeight: "bold", fontSize: "14px" }}>REITs Bucket Max Weight : </label>
                                    <input style={{width: "40px"}} type="number" value={reit_bucket_max_weight} min={reit_bucket_min_weight} max={100} 
                                    onChange={(e) => {
                                        setReitBucketMaxWeight(e.target.value);
                                    }}
                                    required={true} />
                                </div>
                            )}
                            {crypto_bucket_min_weight !== null && (
                                <div className={style.analysis_options_input}>
                                    <label style={{ fontWeight: "bold", fontSize: "14px" }}>Crypto Bucket Min Weight : </label>
                                    <input style={{width: "40px"}} type="number" value={crypto_bucket_min_weight} min={cabms.current[4]} max={100 - cbmscr} 
                                    onChange={(e) => {
                                        cbms.current += Math.max(cabms.current[0], Math.min(e.target.value, 100 - cbmse)) - crypto_bucket_min_weight;
                                        setCryptoBucketMinWeight(Math.max(cabms.current[4], Math.min(e.target.value, 100 - cbmscr)));
                                    }}
                                    required={true} />
                                </div>
                            )}
                            {crypto_bucket_min_weight !== null && (
                                <div className={style.analysis_options_input}>
                                    <label style={{ fontWeight: "bold", fontSize: "14px" }}>Crypto Bucket Max Weight : </label>
                                    <input style={{width: "40px"}} type="number" value={crypto_bucket_max_weight} min={crypto_bucket_min_weight} max={100}
                                    onChange={(e) => {
                                        setCryptoBucketMaxWeight(e.target.value);
                                    }}
                                    required={true} />
                                </div>
                            )}
                            <button type="submit" className={style.popup_proceed}>Analyze</button>
                        </form>
                    </div>
                </div>
            </div>
        )}
      {showSettings && (
        <div
          className={style.popup_container}
          onClick={() => setShowSettings(false)}
        >
          <div className={style.popup} onClick={(e) => e.stopPropagation()}>
            <div className={style.popup_header}>
              <h2>Settings</h2>
            </div>
            <div className={style.settings_options}>
              <label style={{ fontWeight: "bold", fontSize: "14px" }}>
                Period :{" "}
              </label>
              <select
                value={tperiod}
                onChange={(e) => setTperiod(e.target.value)}
              >
                <option value="5d">5 Days</option>
                <option value="1mo">1 Month</option>
                <option value="3mo">3 Months</option>
                <option value="6mo">6 Months</option>
                <option value="1y">1 Year</option>
                <option value="2y">2 Years</option>
              </select>
            </div>
            <span
              className={style.closeButton}
              onClick={() => setShowSettings(false)}
            >
              ⓧ
            </span>
            <div className={style.settings_buttons}>
              {tperiod !== period && (
                <button
                  className={style.settings_cancel}
                  onClick={() => {
                    setTperiod(period);
                  }}
                >
                  Cancel
                </button>
              )}
              {tperiod !== period && (
                <button
                  className={style.popup_proceed}
                  onClick={() => {
                    localStorage.setItem("period", tperiod);
                    localStorage.removeItem(`${current_selection}_list_data`);
                    window.location.reload();
                  }}
                >
                  Apply
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {show_bucket && (
        <div
          className={style.popup_container}
          onClick={() => setShowBucket(false)}
        >
          <div className={style.popup} onClick={(e) => e.stopPropagation()}>
            <div className={style.bucket_header}>
              <h2>Bucket</h2>
            </div>
            <span className={style.closeButton} onClick={() => setShowBucket(false)}>ⓧ</span>
            <div className={style.bucket_table}>
              <table>
                <thead>
                  <tr>
                    <th>
                      <center>Delete</center>
                    </th>
                    <th>Element</th>
                    <th>Minimum Weight</th>
                    <th>Maximum Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {JSON.parse(localStorage.getItem(`${current_selection}_bucket`)).map(
                    (item, index) => (
                      <tr key={index}>
                        <td>
                          <center>
                            <svg
                              className={style.deleteIcon}
                              onClick={() => {
                                let bucket = JSON.parse(
                                  localStorage.getItem(`${current_selection}_bucket`),
                                );
                                bucket.splice(index, 1);
                                localStorage.setItem(`${current_selection}_bucket`,JSON.stringify(bucket),);
                                setTmpReload(!tmpReload);
                              }} xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="14" height="14" viewBox="0 0 24 24">{" "}<path d="M 10.806641 2 C 10.289641 2 9.7956875 2.2043125 9.4296875 2.5703125 L 9 3 L 4 3 A 1.0001 1.0001 0 1 0 4 5 L 20 5 A 1.0001 1.0001 0 1 0 20 3 L 15 3 L 14.570312 2.5703125 C 14.205312 2.2043125 13.710359 2 13.193359 2 L 10.806641 2 z M 4.3652344 7 L 5.8925781 20.263672 C 6.0245781 21.253672 6.877 22 7.875 22 L 16.123047 22 C 17.121047 22 17.974422 21.254859 18.107422 20.255859 L 19.634766 7 L 4.3652344 7 z"></path></svg>
                          </center>
                        </td>
                        <td>{item[0][1]}</td>
                        <td>{item[1]}</td>
                        <td>{item[2]}</td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      <div className={style.home}>
        <div className={style.home_table_navbar}>
          {[
            "Equity",
            "Commodities",
            "US Treasury Notes",
            "REITs",
            "Crypto",
          ].map((item, index) => (
            <div
              key={index}
              className={`${style.home_table_navbar_item} ${currentSelection === index ? style.selected : ""}`}
              onClick={() => changeSelection({ index })}
            >
              <h2>{item}</h2>
            </div>
          ))}
        </div>

        <div className={style.home_table_and_chart}>
          <div className={style.home_table}>
            <div className={style.home_table_search}>
              <label>Search for Equity</label>
              <div className={style.search_div}>
                <input type="text" value={searchText} onChange={handleSearch} placeholder="Yahoo Finance Ticker"/>
                <button className={style.clear_button}id="clear_button"onClick={clearSearch}style={{ fontSize: "16px" }}>ⓧ</button>
              </div>
            </div>
            <div className={style.table_container}>
              {searchLoading === false && searchError === false && (
              <table>
                <thead>
                  {searching === false && (
                    <tr>{["","Symbol","Price","Change","% Change","Range",].map((item, index) => (<th key={index}>{item}</th>))}</tr>
                  )}
                  {searching === true && (<tr><th><center>Select</center></th><th>Symbol</th></tr>)}
                </thead>
                <tbody>
                  {searching === false &&
                    tickers &&
                    Object.entries(tickers).map(([ticker, name], index) => (
                      <tr key={index}>
                        <td>
                          <center>
                            <input
                              type="checkbox"
                              disabled={adding_loading}
                              checked={checkedItems.includes(ticker)}
                              onChange={() =>
                                handleCheckboxChange(ticker, name)
                              }
                            />
                          </center>
                        </td>
                        <td
                          className={style.table_symbol}
                          onClick={() => gather_ticker_data([ticker, name])}
                        >
                          {name}
                        </td>
                        {tickers_table_data && (
                          <td>{tickers_table_data.PRICE[index].toFixed(2)}</td>
                        )}
                        {tickers_table_data && (
                          <td
                            id={index.toString() + "price_column"}
                            className={getClassByValue(
                              tickers_table_data.CHANGE[index],
                              index,
                            )}
                          >
                            {tickers_table_data.CHANGE[index].toFixed(2)}
                          </td>
                        )}
                        {tickers_table_data && (
                          <td
                            className={getClassByValue(
                              tickers_table_data.PCHANGE[index],
                            )}
                          >
                            {tickers_table_data.PCHANGE[index].toFixed(2)} %
                          </td>
                        )}
                        {tickers_table_data && (
                          <td>
                            <div className={style.table_range}>
                              <div className={style.table_range_length}>
                                <div
                                  className={style.table_range_fill}
                                  style={{
                                    width: `${((tickers_table_data.PRICE[index] - tickers_table_data.LOW[index]) / (tickers_table_data.HIGH[index] - tickers_table_data.LOW[index])) * 100}%`,
                                  }}
                                ></div>
                                <div className={style.table_range_label}>
                                  <div>
                                    {tickers_table_data.LOW[index].toFixed(2)}
                                  </div>
                                  <div>
                                    {tickers_table_data.HIGH[index].toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  {searching === true &&
                    searched_tickers &&
                    Object.entries(searched_tickers).map(([ticker, name], index) => (
                      <tr key={index}>
                        <td>
                          <center>
                            <input
                              type="checkbox"
                              disabled={adding_loading}
                              checked={checkedItems.includes(ticker)}
                              onChange={() => handleCheckboxChange(ticker, name)}
                            />
                          </center>
                        </td>
                        <td
                          className={style.table_symbol}
                          onClick={() => gather_ticker_data([ticker, name])}
                        >
                          {name}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              )}
              {searchLoading && (
                <div className={style.loading_container_table}>
                  <h2>Searching</h2>
                  <BarLoader color="rgb(34, 103, 196)" width="50%" />
                </div>
              )}
              {searchError && (
                <div className={style.loading_container_table}>
                  <h2 style={{color:'red'}}>Error</h2>
                  <h3 style= {{color:'red'}}>Status Code : {search_error_status_code}</h3>
                </div>
              )}
            </div>
          </div>
          <div className={style.home_chart} id="home_chart">
            {selected_ticker && <h2 style={{ margin: "0" }}>{selected_ticker[1]}</h2>}
            <div className={style.home_chart_add_to_bucket}>
              <form onSubmit={handleAddToBucket}>
                <div className={style.home_chart_add_to_bucket_form}>
                  <div className={style.form_input}>
                    <label>Minimum Weight</label>
                    <input
                      type="number"
                      value={minimum_weight}
                      min="0"
                      onChange={(e) => {
                        setMinimumWeight(parseInt(Math.max(minimum_weight, Math.min(e.target.value, 100 - cms.current))))
                      }}
                      max={100 - cms.current}
                      placeholder="0"
                      required={true}
                    />
                  </div>
                  <div className={style.form_input}>
                    <label>Maximum Weight</label>
                    <input
                      type="number"
                      value={maximum_weight}
                      min={minimum_weight}
                      onChange={(e) => setMaximumWeight(parseInt(e.target.value))}
                      max="100"
                      placeholder="100"
                      required={true}
                    />
                  </div>
                  <button type="submit" style={{width:'150px'}}>Add to Bucket</button>
                </div>
              </form>
            </div>
            <label style={{fontWeight:'bold'}}>Price Chart</label>
            <div className={style.home_chart_price} id="priceChartContainer" ref={price_chart_parent_div}>
              <Plot
                data = {data.map(trace => ({...trace, line: {color: '#1e90ff'}}))}
                layout = {{ 
                  width: dimensionsP.width,
                  height: dimensionsP.height,
                  margin: {
                    l: 40,
                    r: 0,
                    t: 0,
                    b: 20,
                  }
                }}
                config = {{ 
                  displaylogo: false,
                  responsive: true,
                  scrollZoom: true,
                }}
              />
            </div>
            <label style={{fontWeight:'bold'}}>Volatility Chart</label>
            <div className={style.home_chart_volatility} id="volatilityChartContainer" ref={volatility_chart_parent_div}>
              <Plot
                data = {data_v.map(trace => ({ ...trace, line: { color: '#228b22' } }))}
                layout = {{
                  width: dimensions.width, 
                  height: dimensions.height, 
                  margin: {
                    l: 40,
                    r: 0,
                    t: 0,
                    b: 0,
                  },
                }}
                config = {{
                  displaylogo: false,
                  responsive: true,
                  scrollZoom: true,
                }}
              />
            </div>
          </div>
        </div>
        <div className={style.controller_buttons}>
          <button className={style.controller_buttons_buttons} style={{ width: "100px" }} onClick={() => setShowSettings(true)}>Settings</button>
          <button className={style.controller_buttons_buttons} style={{ width: "150px" }} onClick={() => {localStorage.removeItem(`${current_selection}_list`);window.location.reload();}}>Reset Tickers List</button>
          <button className={style.controller_buttons_buttons} style={{ width: "120px" }} onClick={() => {localStorage.setItem(`${current_selection}_bucket`, JSON.stringify([]));window.location.reload();}}>Reset Bucket</button>
          <button className={style.controller_buttons_buttons} style={{ width: "120px" }} onClick={() => setShowBucket(true)} >View Bucket</button>
          <button className={style.controller_buttons_buttons} onClick={() => setAnalysisOptions(true)}>Next</button>
        </div>
        <p>Made by <a href="https://github.com/ashish-dalal">Ashish Dalal</a> and <a href="https://github.com/ashish-bazad">Ashish Bazad</a></p>
      </div>
    </div>
  );
};

export default Home;