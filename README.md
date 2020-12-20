# Hierarchical

Utilizing [ConceptNet](https://github.com/commonsense/conceptnet5/wiki/API),
create an hierarchical JSON structure with all the term’s English language
parent (IsA) concepts. The parent-child hierarchy should be ordered from the
most general concept to the most specific.

## Limit

- You can make 3600 requests per hour to the ConceptNet API, with bursts of 120
  requests per minute allowed.

## Start

1. `npm install`
2. `npm start`

## Test

1. `npm run test`

# Data structure:

- Using Graph to manage the data structure.

# Algorithm:

- Using Closure and Hash Table to reduce the time complexity.
- Using Recursion to traverse the graph and create Hierarchical Concept.

# API`

- Using Recursion and Promise allSettled to manage api call and promise reject.
