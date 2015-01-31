# jshint node: true

###*
# wildcard
Very simple wildcard matching, which is designed to provide the same
functionality that is found in the
[eve](https://github.com/adobe-webplatform/eve) eventing library.
## Usage
It works with strings:
<<< examples/strings.js
Arrays:
<<< examples/arrays.js
Objects (matching against keys):
<<< examples/objects.js
While the library works in Node, if you are are looking for file-based
wildcard matching then you should have a look at:
<https://github.com/isaacs/node-glob>
###
window.WildcardMatcher = (text, separator) ->
  @separator = separator
  @parts = (text or "").split(separator)
  return
"use strict"
window.WildcardMatcher::match = (input) ->
  matches = true
  parts = @parts
  ii = undefined
  partsCount = parts.length
  testParts = undefined
  if typeof input is "string" or input instanceof String
    testParts = (input or "").split(@separator)
    ii = 0
    while matches and ii < partsCount
      matches = parts[ii] is "*" or parts[ii] is testParts[ii]
      ii++

    # If matches, then return the component parts
    matches = matches and testParts
  else if typeof input.splice is "function"
    matches = []
    ii = input.length
    while ii--
      matches[matches.length] = input[ii]  if @match(input[ii])
  else if typeof input is "object"
    matches = {}
    for key of input
      matches[key] = input[key]  if @match(key)
  matches

window.matchWildcard = (text, test, separator) ->
  matcher = new window.WildcardMatcher(text, separator or /[\/\.]/)
  return matcher.match(test)  unless typeof test is "undefined"
  matcher
