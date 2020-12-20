import axiosInit, { AxiosResponse } from 'axios'
import { ConceptData } from './utils'

const baseURL = 'http://api.conceptnet.io'

const axios = axiosInit.create({
  baseURL: baseURL,
  headers: { 'X-Requested-With': 'XMLHttpRequest' },
})

type getTermsFunc = (value: string) => Promise<AxiosResponse<ConceptData>>

export const getTermsAPI: getTermsFunc = value => {
  return axios.get(value + '?offset=0&limit=200')
}
