import { useContext, useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import style from "./home.module.css";
// import popoutIcon from '../assets/popout.svg';
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import AuthContext from "../utility/AuthContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const Home = () => {
  let { get_tickers_equity, get_tickers_commodities, get_tickers_reit, get_tickers_t_notes, get_tickers_crypto, get_tickers_data } = useContext(AuthContext);
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
  let [maximum_weight, setMaximumWeight] = useState(1);
  let [show_bucket, setShowBucket] = useState(false);
  let [tmpReload, setTmpReload] = useState(false);
  let [showSettings, setShowSettings] = useState(false);
  let period = localStorage.getItem("period")? localStorage.getItem("period"): "1y";
  let [tperiod, setTperiod] = useState(period);
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
      if (!localStorage.getItem("reits_bucket")) {
        localStorage.setItem("reit_bucket", JSON.stringify([]));
      }
      // crypto bucket
      if (!localStorage.getItem("crypto_bucket")) {
        localStorage.setItem("crypto_bucket", JSON.stringify([]));
      }
    }
    let bucket = JSON.parse(localStorage.getItem(`${current_selection}_bucket`));
    cms.current = 0;
    for (let i = 0; i < bucket.length; i++) {
        cms.current += bucket[i][1];
    }
  }, [currentSelection]);

  const gather_ticker_data = async (ticker) => {
    setSelectedTicker(ticker);
  };
  const get_tickers_table_data = async () => {
    setAdding_loading(true);
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
      // !localStorage.getItem("crypto_list") ||
      // !localStorage.getItem("crypto_list_data") ||
      lastUpdated.toDateString() !== currentTime.toDateString() ||
      (currentTime >= updateTime && lastUpdated < updateTime);
    if (needsUpdate) {
      // Get the list of tickers
      if (!localStorage.getItem("equity_list")) {
        const data = await get_tickers_equity();
        localStorage.setItem("equity_list", JSON.stringify(data.tickers));
      }
      if (!localStorage.getItem("commodities_list")) {
        const data = await get_tickers_commodities();
        localStorage.setItem("commodities_list", JSON.stringify(data.tickers));
      }
      if (!localStorage.getItem("t_notes_list")) {
        const data = await get_tickers_t_notes();
        localStorage.setItem("t_notes_list", JSON.stringify(data.tickers));
      }
      if (!localStorage.getItem("reit_list")) {
        const data = await get_tickers_reit();
        localStorage.setItem("reit_list", JSON.stringify(data.tickers));
      }
      // if (!localStorage.getItem("crypto_list")) {
      //   const data = await get_tickers_crypto();
      //   localStorage.setItem("crypto_list", JSON.stringify(data.tickers));
      // }
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
      // prices_list = await get_tickers_data(Object.keys(JSON.parse(localStorage.getItem("crypto_list"))));
      // localStorage.setItem("crypto_list_data", JSON.stringify(prices_list));
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
  };
  useEffect(() => {
    if (should_get_tickers.current) {
      should_get_tickers.current = false;
      get_tickers_table_data();
    }
  }, [currentSelection]);

  let loadResults = () => {
    navigate("/results");
  };
  const chartData = {
    labels: ["January", "February", "March", "April", "May", "June"],
    datasets: [
      {
        label: "Ticker Price",
        data: [65, 59, 80, 81, 56, 55],
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0,
        pointRadius: 0,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
    maintainAspectRatio: false,
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
    const response = await fetch(
      `http://127.0.0.1:8000/api/search_${current_selection}/?search=${text}`,
    );
    const data = await response.json();
    setSearchedTickers(data.tickers);
  };

  useEffect(() => {
    if (searchText === "") {
      setTickers(JSON.parse(localStorage.getItem(`${current_selection}_list`)));
      setSearching(false);
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
      tmp = [...checkedItems, ticker];
      tmp2[ticker] = name;
      let tmp3 = JSON.parse(localStorage.getItem(`${current_selection}_list_data`));
      const data = await get_tickers_data([ticker]);
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
    setAdding_loading(false);
    setCheckedItems(tmp);
  };

  const handleAddToBucket = (e) => {
    e.preventDefault();
    let bucket = JSON.parse(localStorage.getItem(`${current_selection}_bucket`));
    let tick = selected_ticker;
    let max_weight = parseFloat(maximum_weight),
      min_weight = parseFloat(minimum_weight);
    bucket = [...bucket, [tick, min_weight, max_weight]];
    localStorage.setItem(`${current_selection}_bucket`, JSON.stringify(bucket));
    window.location.reload();
  };

  return (
    <div className={style.home_container}>
      {showSettings && (
        <div
          className={style.bucket_container}
          onClick={() => setShowSettings(false)}
        >
          <div className={style.bucket} onClick={(e) => e.stopPropagation()}>
            <div className={style.settings_header}>
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
                <option value="1d">1 Day</option>
                <option value="5d">5 Days</option>
                <option value="1mo">1 Month</option>
                <option value="3mo">3 Months</option>
                <option value="6mo">6 Months</option>
                <option value="1y">1 Year</option>
                <option value="2y">2 Years</option>
                <option value="5y">5 Years</option>
                <option value="10y">10 Years</option>
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
                  className={style.settings_apply}
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
          className={style.bucket_container}
          onClick={() => setShowBucket(false)}
        >
          <div className={style.bucket} onClick={(e) => e.stopPropagation()}>
            <div className={style.bucket_header}>
              <h2>Bucket</h2>
            </div>
            <span
              className={style.closeButton}
              onClick={() => setShowBucket(false)}
            >
              ⓧ
            </span>
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
            </div>
          </div>
          <div className={style.home_chart}>
            {selected_ticker && <h2 style={{ margin: "0" }}>{selected_ticker[1]}</h2>}
            <div className={style.home_chart_price}>
              <Line data={chartData} options={chartOptions} />
            </div>
            <div className={style.home_chart_price}>
              <Line data={chartData} options={chartOptions} />
            </div>
            <div className={style.home_chart_add_to_bucket}>
              <form onSubmit={handleAddToBucket}>
                <div className={style.home_chart_add_to_bucket_form}>
                  <div className={style.form_input}>
                    <label>Minimum Weight</label>
                    <input
                      type="number"
                      step="0.01"
                      value={minimum_weight}
                      min="0.00"
                      onChange={(e) => setMinimumWeight(e.target.value)}
                      max={1 - cms.current}
                      placeholder="0.00"
                      required={true}
                    />
                  </div>
                  <div className={style.form_input}>
                    <label>Maximum Weight</label>
                    <input
                      type="number"
                      step="0.01"
                      value={maximum_weight}
                      min={minimum_weight}
                      onChange={(e) => setMaximumWeight(e.target.value)}
                      max="1.00"
                      placeholder="1.00"
                      required={true}
                    />
                  </div>
                  <button type="submit">Add to Bucket</button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className={style.controller_buttons}>
          <button className={style.home_chart_next}style={{ width: "100px" }}onClick={() => setShowSettings(true)}>Settings</button>
          <button className={style.home_chart_next} style={{ width: "120px" }} onClick={() => setShowBucket(true)} >View Bucket</button>
          <button className={style.home_chart_next} style={{ width: "150px" }} onClick={() => {localStorage.removeItem(`${current_selection}_list`);window.location.reload();}}>Reset Tickers List</button>
          <button className={style.home_chart_next} style={{ width: "120px" }} onClick={() => {localStorage.setItem(`${current_selection}_bucket`, JSON.stringify([]));window.location.reload();}}>Reset Bucket</button>
          <button className={style.home_chart_next} onClick={loadResults}>Next</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
