/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
const mongoose = require('mongoose');
const threadSchema = require('../models/threadSchema.js');
const boardSchema = require('../models/boardSchema.js');
mongoose.connect(process.env.DB);

const db = mongoose.connection;
const Thread = mongoose.model('thread', threadSchema);
const Board = mongoose.model('board', boardSchema);

module.exports = function (app) {
  
  db.on('error',() => { console.log("Cannot connect to Database"); });
  db.once('open', () => {
    console.log("Successfully connected to database");
    
    app.route('/api/threads/:board')
      .post(handlePostToThread)
      .get(handleGetFromThread)
      .put(handlePutOnThread)
      .delete(handleDeleteOfThread)
    
    app.route('/api/replies/:board')
      .post(handlePostToReplies)
      .get(handleGetFromReplies)
      .put(handlePutOnReplies)
      .delete(handleDeleteOfReplies)
    
    //404 Not Found Middleware
    app.use(function(req, res, next) {
      res.status(404)
        .type('text')
        .send('Not Found');
    });
  });
};


// Post a thread on a board. Create the Board if it doesn't exist
function handlePostToThread(req, res) {
  const boardName = req.params.board;
  
  Board.findOneOrCreate({"boardName": boardName}, {"boardName": boardName, "threadList": []}, (err, board) => { 
    const text = req.body.text;
    const deletePassword = req.body.delete_password;
    
    const newThread = new Thread({text: text, delete_password: deletePassword});
    board.threadList.push(newThread);
    
    board.save((err, savedBoard) => {
      if (err) {
        return res.json(err);
      }
      res.redirect('/b/' + savedBoard.boardName);
    });  
    
  }); 
};

function handlePostToReplies(req, res) {
  const boardName = req.params.board;
  
  Board.findOne({"boardName": boardName})
  .exec((err, board) => {
    if (err) {
      return res.json(err);
    }
    if (!board) {
      return res.json({"success": false, "Message": 'Board Not Found'});
    }
    
    let foundThread = null;
    let passwordCorrect = false;
    board.threadList = board.threadList.map(thread => {
      if (thread._id.toString() === req.body.thread_Id) {
        const currentDate = Date.now();
        
        if (thread.delete_password === req.body.delete_password) {
          thread.replies.push({text: req.body.text, date: currentDate, reported: false});
          thread.bumped_on = currentDate;
          passwordCorrect = true;
        }
        
        foundThread = Object.assign({}, thread);
        return thread;
      }
      return thread;
    });
    
    if (!foundThread) {
      return res.json({"success": false, "Message": 'Thread Not Found'});
    }
    
    if (!passwordCorrect) {
      return res.json({"success": false, "Message": 'Incorrect Password'});
    }
    
    board.save((err, savedBoard) => {
      if (err) {
        return res.json(err);
      }
      res.redirect('/b/' + savedBoard.boardName + '/' + foundThread._id);
    });
  });
};

function handleGetFromThread(req, res) {
  const boardName = req.params.board;
  
  Board.findOne({"boardName": boardName}, { boardName: 1, threadList: 1, _id: 0})
  .exec((err, board) => {
    if (err) {
      return res.json(err);
    }
    if (!board) {
      return res.json({"success": false, "Message": 'Board Not Found'});
    }
    const transformedThreads = board.threadList
                                .sort((a, b) => new Date(a.bumped_on) - new Date(b.bumped_on))
                                .slice(0,10)
                                .map((thread) => {
                                  let newThread = {};
                                  newThread._id = thread._id;
                                  newThread.text = thread.text;
                                  newThread.replies = thread.replies;
                                  newThread.created_on = thread.created_on;
                                  newThread.bumped_on = thread.bumped_on;
                                  return newThread;
                                });
    return res.json(transformedThreads);
  });
};

function handleGetFromReplies(req, res) {
  const boardName = req.params.board;
  
  if (!("thread_id" in req.query)) {
    return res.json({"success": false, "Message": 'thread_id property missing'});
  }
  
  const thread_id = req.query.thread_id;
  Board.findOne({"boardName": boardName, "threadList._id": thread_id}, { boardName: 1, "threadList.$": 1, _id: 0})
  .exec((err, board) => {
    if (err) {
      return res.json(err);
    }
    if (!board) {
      return res.json({"success": false, "Message": 'Not Found'});
    }
    let threadToReturn = {};
    threadToReturn._id = board.threadList[0]._id;
    threadToReturn.text = board.threadList[0].text;
    threadToReturn.created_on = board.threadList[0].created_on;
    threadToReturn.bumped_on = board.threadList[0].bumped_on;
    threadToReturn.replies = board.threadList[0].replies;
    res.json(threadToReturn);
  });
};

function handlePutOnThread(req, res) {
  const boardName = req.params.board;
  
  if (!("thread_id" in req.body)) {
    return res.json({"success": false, "Message": 'thread_id property missing'});
  }
  
  const thread_id = req.body.thread_id;
  Board.findOneAndUpdate({"boardName": boardName, "threadList._id": thread_id}, 
                         {"$set": {"threadList.$.reported": true}})
  .exec((err, board) => {
    if (err) {
      return res.send('failed');
    }
    return res.send('success');
  });
};

function handlePutOnReplies(req, res) {
  const boardName = req.params.board;
  
  if (!("thread_id" in req.body)) {
    return res.json({"success": false, "Message": 'thread_id property missing'});
  }
  
  if (!("reply_id" in req.body)) {
    return res.json({"success": false, "Message": 'reply_id property missing'});
  }
  
  const replyId = req.body.reply_id;
  const threadId = req.body.thread_id;
  
  Board.findOne({"boardName": boardName, "threadList._id": threadId, "threadList.replies._id": replyId})
  .exec((err, board) => {
    if (err) {
      return res.send(err);
    }
    if (!board) {
      return res.send('failed');
    }
    
    const threadIndex = board.threadList.findIndex(thread => thread._id.toString() === threadId);
    const replyIndex = board.threadList[threadIndex].replies.findIndex(reply => reply._id.toString() === replyId);
    
    board.threadList[threadIndex].replies[replyIndex].reported = true;
    
    board.save((err, savedBoard) => {
      if (err) {
        res.send('failed');
      }
      res.json('success');
    });
  });
};

function handleDeleteOfThread(req, res) {
  const boardName = req.params.board;
  
  if (!("thread_id" in req.query)) {
    return res.json({"success": false, "Message": 'thread_id property missing'});
  }
  
  if (!("delete_password" in req.query)) {
    return res.json({"success": false, "Message": 'delete_password property missing'});
  }
  
  const threadId = req.query.thread_id;
  const deletePassword = req.query.delete_password;
  
  Board.findOne({"boardName": boardName, "threadList._id": threadId})
  .exec((err, board) => {
    if (err) {
      return res.send('incorrect password');
    }
    if (!board) {
      return res.send('incorrect password');
    }
    const threadIndex = board.threadList.findIndex(thread => thread._id.toString() === threadId);
    board.threadList.splice(threadIndex,1);
    board.save((err) => {
      if (err) {
        res.send(err);
      }
      res.send('success');
    });
  });
};

function handleDeleteOfReplies(req, res) {
  const boardName = req.params.board;
  
  if (!("thread_id" in req.query)) {
    return res.json({"success": false, "Message": 'thread_id property missing'});
  }
  
  if (!("delete_password" in req.query)) {
    return res.json({"success": false, "Message": 'delete_password property missing'});
  }
  
  if (!("reply_id" in req.query)) {
    return res.json({"success": false, "Message": 'reply_id property missing'});
  }
  
  const threadId = req.query.thread_id;
  const replyId = req.query.reply_id;
  const deletePassword = req.query.delete_password;
  
  Board.findOne({"boardName": boardName, "threadList._id": threadId, "threadList.replies._id": replyId})
  .exec((err, board) => {
    if (err) {
      return res.send(err);
    }
    if (!board) {
      return res.send('failed');
    }
    
    const threadIndex = board.threadList.findIndex(thread => thread._id.toString() === threadId);
    const replyIndex = board.threadList[threadIndex].replies.findIndex(reply => reply._id.toString() === replyId);
    
    board.threadList[threadIndex].replies.splice(replyIndex, 1);
    
    board.save((err, savedBoard) => {
      if (err) {
        res.send('failed');
      }
      res.json('success');
    });
  });
};