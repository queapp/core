app = angular.module("QueGui")
app.controller "BlockController", ($scope, $rootScope, blockService) ->
  root = this
  @blocks = []

  # block information stored here
  # for new block
  @newBlock =
    name: ""
    desc: ""
    tags: []


  # fetch all the blocks
  @fetchBlocks = ->
    blockService.getAllBlocks (blocks) ->
      root.blocks = blocks

      # create devcode (join code together so it can be edited)
      _.each blocks, (block) ->
        block.devCode = block.code.join("\n")

        # also, create space for logs
        block.log = []
        return

      return

    return

  @fetchBlocks()

  # async event handler
  $rootScope.$on "updateBlocks", (event) ->
    root.fetchBlocks()
    return


  # add a new block
  @addBlock = ->

    # make sure tags are formatted correctly tags
    @newBlock.tags = @newBlock.tags.split(" ")  if @newBlock.tags and @newBlock.tags.length is `undefined`

    # add block
    blockService.addBlock @newBlock, ->

      # clear block cache
      blockService.cache = {}

      # refetch blocks
      root.fetchBlocks()
      return


    # reset the new block form
    @newBlock =
      name: ""
      desc: ""
      tags: []

    return


  # delete an old block
  @deleteBlock = (block) ->
    blockService.removeBlock block.id, ->

      # clear cache
      blockService.cache = {}

      # refetch blocks
      root.fetchBlocks()
      return

    return


  # update the code back on the server inside
  # the block
  @updateBlock = (block) ->

    # split up code into its transmitable form
    block.code = block.devCode.split("\n")
    delete block.log


    # send it on its way
    b = angular.fromJson(angular.toJson(block)) # strip out all the angular crap
    blockService.updateBlockData block.id, b, (e) ->
      block.log = []
      return

    return


  # format the log (to display better)
  @formatLogs = (block) ->
    (if block.log and block.log.length then "> " + block.log.join("\n> ") else "")


  # disable a block
  @setBlockDisabled = (block, state) ->
    block.disable = state or not block.disable
    @updateBlock block
    return


  # update block log
  socket.on "block-log", (blk) ->

    # get the correct id
    b = _.filter(root.blocks, (item) ->
      item.id is blk.id
    )

    # append to the log, and update the view
    if b.length and b[0].log

      # convert date
      blk.when = (if typeof blk.when is "string" then new Date(blk.when) else blk.when)

      # log it out
      # console.log blk
      b[0].log.unshift blk
      $scope.$apply()
    return

  return
