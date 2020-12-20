import { Term, TermGraph } from '../termGraph'
import { generateTermsHierarchical } from '../utils'

test('Test Term', () => {
  const term = new Term('/c/en/term')
  const child = new Term('/c/en/child')
  const grandChild = new Term('/c/en/grandChild')
  expect(term.checkChildrenDeep(child.term)).toBeFalsy()

  term.appendChild(child)
  expect(term.checkChildrenDeep(child.term)).toBeTruthy()
  expect(term.checkChildrenDeep(grandChild.term)).toBeFalsy()

  child.appendChild(grandChild)
  expect(term.checkChildrenDeep(grandChild.term)).toBeTruthy()
})

test('Test TermGraph', () => {
  const termGraph = new TermGraph('/c/en/term', 4)
  const findTerm = termGraph.findTerm('/c/en/term')

  expect(
    termGraph.appendChildAndCheckLimit('/c/en/newTerm', findTerm),
  ).toBeTruthy()
  expect(termGraph.size).toBe(2)

  expect(
    termGraph.appendChildAndCheckLimit('/c/en/newTerm', findTerm),
  ).toBeFalsy()
  expect(termGraph.size).toBe(2)

  const findNewTerm = termGraph.findTerm('/c/en/newTerm')

  expect(
    termGraph.appendChildAndCheckLimit('/c/en/newTerm2', findNewTerm),
  ).toBeTruthy()
  expect(termGraph.size).toBe(3) // new term status is not tail now

  expect(
    termGraph.appendChildAndCheckLimit('/c/en/newTerm3', findTerm),
  ).toBeFalsy() // touch limit
  expect(termGraph.size).toBe(4)

  const tailTerms = termGraph.getTailsArray()

  // newTerm2 and newTerm3  are tails
  expect(tailTerms.map(term => term.term)).toEqual([
    '/c/en/newTerm2',
    '/c/en/newTerm3',
  ])

  expect(generateTermsHierarchical(tailTerms)).toEqual({
    newTerm2: { newTerm: { term: {} } },
    newTerm3: { term: {} },
  })
})
