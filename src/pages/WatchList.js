import React, { useEffect, useState } from 'react'
import { Paper, TableBody, TableCell, TableRow } from '@material-ui/core'
import useTable from '../components/hooks/useTable'
import NavBar from '../components/NavBar'
import Controls from '../components/controls/Controls'

import { makeStyles } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { removeFromWatchlist, viewWatchlist } from '../redux/ducks/watchlist'

import FullPageLoader from '../components/Loading/FullPageLoader'
import Fade from 'react-reveal/Fade'
import CloseIcon from '@material-ui/icons/Close'
import ConfirmDialog from '../components/controls/ConfirmDialog'

const headCells = [
  //   { id: 'no', label: 'No', disableSorting: true },
  { id: 'symbol', label: 'Symbol' },
  { id: 'price', label: 'Price' },
  { id: 'high', label: 'High' },
  { id: 'low', label: 'Low' },
  { id: 'volume', label: 'Volume' },
  { id: 'actions', label: 'Actions', disableSorting: true }
]

const useStyles = makeStyles({})

const WatchList = () => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const [records, setRecords] = useState([])
  const [records1, setRecords1] = useState(new Map())
  const [highVal, setHighVal] = useState(0)
  const token = useSelector(state => state.auth.token)
  let brands = useSelector(state => state.watchlist.brands)
  const isLoading = useSelector(state => state.watchlist.isLoading)
  const isLoadingDelete = useSelector(state => state.watchlist.isLoadingDelete)
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    subTitle: ''
  })

  if (brands === null) {
    dispatch(viewWatchlist(token))
  }

  useEffect(() => {
    let eventSource = null
    if (brands !== null) {
      for (let i in brands) {
        eventSource = new EventSource(
          'http://localhost:5000/binance/listen/' + brands[i] + '/1d'
        )
        eventSource.addEventListener(
          'message',
          function (e) {
            let parsedData = JSON.parse(e.data)
            let object = {
              id: i,
              symbol: brands[i],
              price: parsedData.k.c,
              high: parsedData.k.h,
              low: parsedData.k.l,
              volume: parsedData.k.v
            }
            setHighVal(parsedData.k.h)
            let tempRecords = records1
            tempRecords.set(brands[i], object)
            setRecords1(tempRecords)
          },
          false
        )
      }
    }
    return function cleanup () {
      if (eventSource !== null) {
        eventSource.close()
      }
    }
  }, [brands])

  useEffect(() => {
    if (brands !== null && records1.size >= brands.length) {
      let temp = []
      for (let i in brands) {
        temp.push(records1.get(brands[i]))
      }
      setRecords(temp)
    }
  }, [highVal])

  const [filterFn, setFilterFn] = useState({
    fn: items => {
      return items
    }
  })

  const {
    TblContainer,
    TblHead,
    TblPagination,
    recordsAfterPagingAndSorting
  } = useTable(records, headCells, filterFn)

  const handleDelete = symbol => {
    dispatch(removeFromWatchlist({ token: token, brands: symbol }))
    let tempRecords1 = records1
    tempRecords1.delete(symbol)
    setRecords1(tempRecords1)
  }

  return (
    <div>
      <Fade top>
        <NavBar />
      </Fade>

      {isLoading || records.length === 0 ? (
        <FullPageLoader />
      ) : (
        <Paper>
          <TblContainer>
            <TblHead />
            <TableBody>
              {recordsAfterPagingAndSorting().map(item => (
                <TableRow key={item.id}>
                  {/* <TableCell>{item.id}</TableCell> */}
                  <TableCell>{item.symbol}</TableCell>
                  <TableCell>{item.price}</TableCell>
                  <TableCell>{item.high}</TableCell>
                  <TableCell>{item.low}</TableCell>
                  <TableCell>{item.volume}</TableCell>
                  <TableCell>
                    <Controls.ActionButton
                      color='secondary'
                      // onClick={() => handleDelete(item.symbol)}
                      onClick={() =>
                        setConfirmDialog({
                          isOpen: true,
                          title: 'Are you sure you want to delete'
                        })
                      }
                    >
                      <CloseIcon fontSize='small' />
                    </Controls.ActionButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TblContainer>
        </Paper>
      )}
      <ConfirmDialog
        confirmDialog={confirmDialog}
        setConfirmDialog={setConfirmDialog}
      />
    </div>
  )
}

export default WatchList
