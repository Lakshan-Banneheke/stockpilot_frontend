import React, { useEffect, useState } from 'react'
import { createChart, CrosshairMode } from 'lightweight-charts'
import { Typography } from '@material-ui/core'
import { useSelector } from 'react-redux'
import ChartLoader from '../Loading/ChartLoader'
import { TA_BASE_URL } from '../../utils/CONSTANTS'
import { useDispatch } from 'react-redux'
import {
  updateExternalIndicatorData,
  updateMacdTime,
  updateTimeStampMacd
} from '../../redux/ducks/chart'

function MACDChart ({ mobile }) {
  const ref = React.useRef()
  const dispatch = useDispatch()
  const [visibleRange, setVisibleRange] = useState({})

  const {
    market,
    marketType,
    timeInterval,
    macdTimeStamp,
    macdTime,
    externalIndicatorData
  } = useSelector(state => state.chart)
  const [loading, setLoading] = useState(true)

  const url =
    TA_BASE_URL +
    'macd' +
    `/${marketType}/${
      marketType === 'crypto' ? market.toUpperCase() : market
    }/${timeInterval}/${macdTimeStamp}000`

  useEffect(() => {
    setLoading(true)
    const chart = createChart(ref.current, {
      width: 0,
      height: 0,
      crosshair: {
        mode: CrosshairMode.Normal
      }
    })

    chart.applyOptions({
      timeScale: {
        visible: true,
        timeVisible: true,
        secondsVisible: true
      }
    })
    const macdSeries = chart.addLineSeries({ lineWidth: 1.5, color: '#22568E' })
    const macdSignalSeries = chart.addLineSeries({
      lineWidth: 1.5,
      color: '#973A80'
    })
    const macdHistSeries = chart.addHistogramSeries({
      base: 0
    })

    fetch(url)
      .then(res => res.json())
      .then(data => {
        let tempMacd = []
        let tempMacdSignal = []
        let tempMacdHist = []
        let tempTimeLine = []

        let dataMacd = data['macd']
        let dataMacdSignal = data['macdsignal']
        let dataMacdHist = data['macdhist']

        for (let key in dataMacd) {
          if (dataMacd.hasOwnProperty(key)) {
            if (dataMacd.hasOwnProperty(key)) {
              let object = {
                time: key / 1000,
                value: dataMacd[key]
              }
              tempMacd.push(object)
              tempTimeLine.push(object.time)
            }
            if (dataMacdSignal.hasOwnProperty(key)) {
              let object = {
                time: key / 1000,
                value: dataMacdSignal[key]
              }
              tempMacdSignal.push(object)
            }
            if (dataMacdHist.hasOwnProperty(key)) {
              let color
              if (dataMacdHist[key] > 0) {
                color = '#00733E'
              } else {
                color = '#BB2E2D'
              }

              let object = {
                time: key / 1000,
                value: dataMacdHist[key],
                color
              }
              tempMacdHist.push(object)
            }
          }
        }
        macdSeries.setData(tempMacd)
        macdSignalSeries.setData(tempMacdSignal)
        macdHistSeries.setData(tempMacdHist)
        dispatch(
          updateExternalIndicatorData({
            type: 'macd',
            data: {
              series: [...tempMacd, ...externalIndicatorData.macd.series],
              signalSeries: [
                ...tempMacdSignal,
                ...externalIndicatorData.macd.signalSeries
              ],
              histSeries: [
                ...tempMacdHist,
                ...externalIndicatorData.macd.histSeries
              ]
            }
          })
        )
        dispatch(updateMacdTime(tempTimeLine))
        if (mobile) {
          chart.resize(325, 150)
        } else {
          chart.resize(1067, 200)
        }
        function onVisibleTimeRangeChanged (newVisibleTimeRange) {
          setVisibleRange(newVisibleTimeRange)
        }

        chart
          .timeScale()
          .subscribeVisibleTimeRangeChange(onVisibleTimeRangeChanged)

        setLoading(false)
      })
      .catch()

    return () => {
      chart.remove()
    }
  }, [market, marketType, timeInterval, mobile, macdTimeStamp])

  const handleDrag = () => {
    if (macdTime[0] === visibleRange.from) {
      dispatch(updateTimeStampMacd(visibleRange.from))
    }
  }

  return (
    <>
      <div>
        <Typography
          style={{
            margin: '0 auto',

            width: 'fit-content'
          }}
          variant='h6'
        >
          MACD
        </Typography>
      </div>
      {loading ? <ChartLoader /> : null}
      <div ref={ref} onMouseUpCapture={handleDrag} />
    </>
  )
}

export default MACDChart
