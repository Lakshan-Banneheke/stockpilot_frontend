import React, { useEffect, useState } from 'react'
import { createChart, CrosshairMode } from 'lightweight-charts'
import { Typography } from '@material-ui/core'
import { useSelector } from 'react-redux'
import ChartLoader from '../Loading/ChartLoader'
import { TA_BASE_URL } from '../../utils/CONSTANTS'
import {
  updateExternalIndicatorData,
  updateStochTime,
  updateTimeStampStoch
} from '../../redux/ducks/chart'
import { useDispatch } from 'react-redux'
import { removeDuplicates } from '../../utils/functions'

function StochChart ({ mobile }) {
  const ref = React.useRef()
  const dispatch = useDispatch()
  const {
    market,
    marketType,
    timeInterval,
    externalIndicatorData,
    stochTime,
    stochTimeStamp
  } = useSelector(state => state.chart)
  const [loading, setLoading] = useState(true)
  const [visibleRange, setVisibleRange] = useState({})

  const url =
    TA_BASE_URL +
    'stoch' +
    `/${marketType}/${
      marketType === 'crypto' ? market.toUpperCase() : market
    }/${timeInterval}/${stochTimeStamp}000`

  // console.log(market, marketType, timeInterval)

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
    const slowkSeries = chart.addLineSeries({
      lineWidth: 1.5,
      color: '#8E0072'
    })
    const slowdSeries = chart.addLineSeries({
      lineWidth: 1.5,
      color: '#00733E'
    })

    fetch(url)
      .then(res => res.json())
      .then(data => {
        let tempSlowk = []
        let tempSlowd = []
        let tempTimeLine = []

        let dataSlowk = data['slowk']
        let dataSlowd = data['slowd']
        for (let key in dataSlowk) {
          if (dataSlowk.hasOwnProperty(key)) {
            if (dataSlowk.hasOwnProperty(key)) {
              let object = {
                time: key / 1000,
                value: dataSlowk[key]
              }

              tempSlowk.push(object)
              tempTimeLine.push(object.time)
            }
            if (dataSlowd.hasOwnProperty(key)) {
              let object = {
                time: key / 1000,
                value: dataSlowd[key]
              }
              tempSlowd.push(object)
            }
          }
        }
        // console.log(tempSlowk, tempSlowd)
        let tempSlowkData = removeDuplicates([
          ...tempSlowk,
          ...externalIndicatorData.stoch.slowk
        ])
        let tempSlowdData = removeDuplicates([
          ...tempSlowd,
          ...externalIndicatorData.stoch.slowd
        ])

        slowkSeries.setData(tempSlowkData)
        slowdSeries.setData(tempSlowdData)
        // slowkSeries.setData([
        //   ...tempSlowk,
        //   ...externalIndicatorData.stoch.slowk
        // ])
        // slowdSeries.setData([
        //   ...tempSlowd,
        //   ...externalIndicatorData.stoch.slowd
        // ])
        dispatch(
          updateExternalIndicatorData({
            type: 'stoch',
            data: {
              slowk: tempSlowkData,
              slowd: tempSlowdData
            }
          })
        )
        dispatch(updateStochTime(tempTimeLine))
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
  }, [market, marketType, timeInterval, mobile, stochTimeStamp])

  const handleDrag = () => {
    console.log(visibleRange.from)
    if (stochTime[0] === visibleRange.from) {
      dispatch(updateTimeStampStoch(visibleRange.from))
    }
  }

  return (
    <>
      <div>
        <Typography
          style={{
            margin: '0 auto',
            marginTop: '1rem',

            width: 'fit-content'
          }}
          variant='h6'
        >
          STOCH
        </Typography>
      </div>
      {loading ? <ChartLoader /> : null}
      <div
        ref={ref}
        onMouseUpCapture={handleDrag}
        style={{ marginBottom: '1rem' }}
      />
    </>
  )
}

export default StochChart
