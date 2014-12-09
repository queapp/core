var app = angular.module("QueGui");

app.controller("BlockController", function($scope, blockService) {
  var root = this;
  this.blocks = [];

  // block information stored here
  // for new block
  this.newBlock = {
    name: "",
    desc: "",
    tags: []
  }

  // fetch all the blocks
  this.fetchBlocks = function() {
    blockService.getAllBlocks(function(blocks) {
      root.blocks = blocks;

      // create devcode (join code together so it can be edited)
      _.each(blocks, function(block) {
        block.devCode = block.code.join("\n");

        // also, create space for logs
        block.log = [];
      });
    });
  }
  this.fetchBlocks();

  // async event handler
  $scope.$on('updateBlocks', function(event) {
    console.log("fetch");
    root.fetchBlocks();
  });

  // add a new block
  this.addBlock = function() {

    // make sure tags are formatted correctly tags
    if (this.newBlock.tags && this.newBlock.tags.length === undefined) {
      this.newBlock.tags = this.newBlock.tags.split(" ");
    }

    // add block
    blockService.addBlock(this.newBlock, function() {
      // refetch blocks
      root.fetchBlocks();
    });

    // reset the new block form
    this.newBlock = {
      name: "",
      desc: "",
      tags: []
    }
  }

  // delete an old block
  this.deleteBlock = function(block) {

    blockService.removeBlock(block.id, function() {
      // refetch blocks
      root.fetchBlocks();
    });

  }

  // update the code back on the server inside
  // the block
  this.updateBlock = function(block) {
    // split up code into its transmitable form
    block.code = block.devCode.split("\n");
    delete block.log;

    // send it on its way
    b = angular.fromJson(angular.toJson(block)); // strip out all the angular crap
    blockService.updateBlockData(block.id, b, function(e){
      block.log = [];
    });
  }

  // format the log (to display better)
  this.formatLogs = function(block) {
    return block.log && block.log.length ? "> " + block.log.join("\n> ") : "";
  }

  // disable a block
  this.setBlockDisabled = function(block, state) {
    block.disable = state || !block.disable;
    this.updateBlock(block);
  }

  // update block log
  socket.on('block-log', function(blk) {

    // get the correct id
    b = _.filter(root.blocks, function(item) {
      return item.id == blk.id;
    });

    // append to the log, and update the view
    if (b.length && b[0].log) {
      console.log(blk.msg)
      b[0].log.push(blk.msg && blk.msg.toString() || blk.msg);
      $scope.$apply();
    };
  });


});
