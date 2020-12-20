import React, { useRef, useState } from 'react'
import {
  Box,
  Button,
  TextField,
  Container,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  makeStyles,
  CircularProgress,
} from '@material-ui/core'

import {
  getFormatHierarchical,
  getTermsGraphClosure,
  labelToTerm,
} from './utils'

const termAPILimitOptions = [
  { text: '1', value: 1 },
  { text: '3', value: 3 },
  { text: '6', value: 6 },
  { text: '10 Recommend', value: 10 },
  { text: '15', value: 15 },
  { text: '20 Not Fast', value: 20 },
  { text: '30 Slow', value: 30 },
  { text: '40 Very Slow', value: 40 },
  { text: '60 May Cause Error', value: 60 },
  { text: '80 Not Recommend', value: 80 },
]

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    textAlign: 'center',
  },
  formControl: {
    margin: theme.spacing(1),
    width: 330,
    marginTop: 12,
  },
  formWrapper: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 20,
  },
  sizeText: { fontSize: 30, marginBottom: 20 },
  loading: { marginTop: 20 },
  content: { textAlign: 'left' },
}))

function App() {
  const classes = useStyles()
  const [searchTerm, setSearchTerm] = useState('cat')
  const [termAPILimit, setTermAPILimit] = useState(10)
  const [jsonStringResult, setJsonStringResult] = useState('')
  const [termRealSize, setTermRealSize] = useState(0)
  const [loading, setLoading] = useState(false)

  const jsonBox = useRef<HTMLPreElement>(null)
  const onSearchTerm = async () => {
    if (!searchTerm) {
      return
    }
    const lowerCase = searchTerm.toLowerCase()
    setSearchTerm(lowerCase)
    setJsonStringResult('')
    setTermRealSize(0)
    try {
      setLoading(true)
      const termGraph = await getTermsGraphClosure(
        labelToTerm(lowerCase),
        termAPILimit,
      )
      setJsonStringResult(getFormatHierarchical(termGraph.getTailsArray()))
      setTermRealSize(termGraph.size)
      setLoading(false)
    } catch (err) {
      setLoading(false)
      console.log(err)
    }
  }

  const downloadJSON = () => {
    const element = document.createElement('a')
    const file = new Blob([jsonBox!.current?.innerHTML ?? ''], {
      type: 'text/plain',
    })
    element.href = URL.createObjectURL(file)
    element.download = `${searchTerm}.json`
    document.body.appendChild(element)
    element.click()
  }

  return (
    <Container className={classes.container}>
      <Box className={classes.formWrapper}>
        <FormControl className={classes.formControl}>
          <TextField
            label="Enter term for search concept"
            required
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value)
            }}
          />
        </FormControl>
        <FormControl className={classes.formControl + ' ' + classes.content}>
          <InputLabel>Search terms API limit</InputLabel>
          <Select
            value={termAPILimit}
            onChange={e => {
              setTermAPILimit(e.target.value as number)
            }}
          >
            {termAPILimitOptions.map((option, index) => (
              <MenuItem key={index} value={option.value}>
                {option.text}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl className={classes.formControl}>
          <Button
            variant="outlined"
            color="secondary"
            disabled={loading || !searchTerm}
            onClick={onSearchTerm}
          >
            Search Term
          </Button>
        </FormControl>
        {!!termRealSize && (
          <FormControl className={classes.formControl}>
            <Button
              variant="outlined"
              color="primary"
              disabled={loading}
              onClick={downloadJSON}
            >
              Download
            </Button>
          </FormControl>
        )}
      </Box>
      <Box>
        <Box className={classes.sizeText}>Term Graph Size: {termRealSize}</Box>
        <Box className={classes.loading}>{loading && <CircularProgress />}</Box>
        <pre className={classes.content} ref={jsonBox}>
          {jsonStringResult}
        </pre>
      </Box>
    </Container>
  )
}

export default App
