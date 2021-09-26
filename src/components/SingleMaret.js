import React from 'react'
import { useParams } from 'react-router'
import DesBox from '../components/graph/DesBox'
import TimeIndicatorBox from '../components/graph/TimeIndicatorBox'
import NavBar from '../components/NavBar'
import StockChart from './StockChart'
import LineChart from './technicalIndicators/linechart'
import MACDChart from './technicalIndicators/macd'
import StochChart from './technicalIndicators/stochChart'

const SingleMarket = () => {
  const { title } = useParams()

  return (
    <div>
      <NavBar />
      <DesBox title={title} />
      <TimeIndicatorBox />
      <StockChart />
      <LineChart type='obv' />
      <LineChart type='rsi' />

      <MACDChart />
      <StochChart />
    </div>
  )
}

export default SingleMarket
