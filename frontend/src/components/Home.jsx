import React from 'react'
import style from './home.module.css'

const Home = () => {
  return (
    <div className={style.home_container}>

        <div className={style.home}>
            <div className={style.home_table_navbar}>
                <div className={style.home_table_navbar_item}>
                    <h2>Equity</h2>
                </div>
                <div className={style.home_table_navbar_item}>
                    <h2>Commodities</h2>
                </div>
                <div className={style.home_table_navbar_item}>
                    <h2>US Treasury Notes</h2>
                </div>
                <div className={style.home_table_navbar_item}>
                    <h2>REITs</h2>
                </div>
                <div className={style.home_table_navbar_item}>
                    <h2>Currency</h2>
                </div>
                <div className={style.home_table_navbar_item}>
                    <h2>Crypto</h2>
                </div>
            </div>

            <div className={style.home_table_and_chart}>
                <div className={style.home_table}>
                    <table>
                        <tr>
                            <td><input type="checkbox" /></td>
                            <th>Symbol</th>
                            <th>Price</th>
                            <th>52 Week Range</th>
                            <th>Change</th>
                            <th>% Change</th>
                            <th>Volume</th>
                        </tr>
                        <tr>
                            <td><input type="checkbox" /></td>
                            <td>SPY</td>
                            <td>450.00</td>
                            <td>0.00</td>
                            <td>+4.50</td>
                            <td>+1.00%</td>
                            <td>12.34M</td>
                        </tr>
                    </table>
                </div>
                <div className={style.home_chart}>

                </div>
            </div>
        </div>
    </div>
  )
}

export default Home
