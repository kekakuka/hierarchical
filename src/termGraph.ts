export enum Status {
  IsTail = 'isTail',
  IsChild = 'isChild',
}

export class Term {
  term: string
  status: string
  children: Term[]
  private childrenHash: { [key: string]: boolean }
  constructor(term: string) {
    this.term = term
    this.status = Status.IsTail
    this.children = []
    this.childrenHash = { [term]: true }
  }

  appendChild(child: Term) {
    this.children.push(child)
    child.status = Status.IsChild
    this.childrenHash[child.term] = true
  }

  checkChildrenDeep(parentTerm: string) {
    let isChildren = this.childrenHash[parentTerm]

    if (isChildren) {
      return isChildren
    }

    const result = this.children.some(child =>
      child.checkChildrenDeep(parentTerm),
    )
    return result
  }
}

export class TermGraph {
  private termsHash: { [termString: string]: Term }
  size: number
  // api limit not size limit
  private limit: number

  constructor(termString: string, limit: number) {
    this.termsHash = { [termString]: new Term(termString) }
    this.size = 1
    this.limit = limit
  }

  findTerm(termString: string) {
    return this.termsHash[termString]
  }

  appendChildAndCheckLimit(termString: string, child: Term) {
    const findTerm = this.termsHash[termString]

    // it's a new term, the child should append
    if (!findTerm) {
      this.termsHash[termString] = new Term(termString)
      this.termsHash[termString].appendChild(child)
      this.size++
      // touch limit wont call api but still append last children
      if (this.size < this.limit) {
        return true
      }
      return false
    }

    // it's a old term, if the child's children graph not contains it.
    const isNotCircle = !child.checkChildrenDeep(findTerm.term)

    if (isNotCircle) {
      findTerm.appendChild(child)
    }

    return false
  }

  getTailsArray() {
    return Object.values(this.termsHash).filter(
      term => term.status === Status.IsTail,
    )
  }
}
