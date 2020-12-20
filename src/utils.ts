import { AxiosResponse } from 'axios'
import { getTermsAPI } from './api'
import { Term, TermGraph } from './termGraph'

const termToLabel = (term: string) => {
  if (!term.startsWith('/c/en/')) {
    return ''
  }
  return term.substring(6)
}

export const labelToTerm = (label: string) => {
  return `/c/en/${label}`
}

export const getFormatHierarchical = (terms: Term[]) => {
  return JSON.stringify(generateTermsHierarchical(terms), null, 2)
}

export const generateTermsHierarchical = (terms: Term[]) => {
  // hash in closure to reduce the function call stack
  const map = new Map()

  const generateTermBranch: generateTermBranchProps = (term: Term) => {
    const label = termToLabel(term.term)
    if (!term.children.length) {
      return { [label]: {} }
    }

    if (map.has(label)) {
      return map.get(label)
    }

    // not in hash generate the termBranch and save in hash
    const termBranch = term.children.reduce(
      (result, childTerm) => ({ ...result, ...generateTermBranch(childTerm) }),
      {},
    )

    map.set(label, termBranch)

    return { [label]: termBranch }
  }

  return terms.reduce(
    (result, term) => ({ ...result, ...generateTermBranch(term) }),
    {},
  )
}

type generateTermBranchProps = (
  term: Term,
) => {
  [key: string]: {}
}

export const getTermsGraphClosure = (termString: string, limit: number) => {
  // termGraph in closure save in this scope
  const termGraph = new TermGraph(termString, limit)

  return getTermsGraph([getTermsAPI(termString)], termGraph)
}

type Edge = {
  end: {
    term: string
  }
  rel: {
    label: string
  }
  start: {
    term: string
  }
}

export type ConceptData = {
  edges: Edge[]
  error?: { details: string; status: number }
}

type GetTermsGraphProps = (
  queryArr: Promise<AxiosResponse<ConceptData>>[],
  termGraph: TermGraph,
) => Promise<TermGraph>

const getTermsGraph: GetTermsGraphProps = async (queryArr, termGraph) => {
  // no query return termGraph
  if (queryArr.length === 0) {
    return termGraph
  }

  // Promise.allSettled may not support some browsers
  const responses = await Promise.allSettled(queryArr)
  const newArr: Promise<AxiosResponse<ConceptData>>[] = []

  responses.forEach(res => {
    if (res.status === 'fulfilled') {
      // get concept error
      if (res.value.data.error) {
        console.log(
          `Search error Status: ${res.value.data.error.status}`,
          res.value.data.error.details,
        )
        return
      }
      res.value.data.edges.forEach((edge: Edge) => {
        // only solve parent/child relationship
        if (edge.rel.label === 'IsA') {
          const {
            start: { term: childString },
            end: { term: tailString },
          } = edge

          const child = termGraph.findTerm(childString)

          if (!child) {
            return
          }

          const hashStatus = termGraph.appendChildAndCheckLimit(
            tailString,
            child,
          )

          // touch API limit
          if (hashStatus) {
            newArr.push(getTermsAPI(tailString))
          }
        }
      })
    } else {
      console.log('reject', res.reason)
    }
  })

  return getTermsGraph(newArr, termGraph)
}
