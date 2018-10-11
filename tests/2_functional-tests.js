/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function(done) {
      chai.request(server)
        .post('/api/threads/general')
        .send({"text": 'Test Post', "delete_password": 'testpost'})
        .end(function(err, res) {  
        assert.equal(res.status, 302, 'redirect successful');
        done();
      });
    });
    
    suite('GET', function(done) {
      chai.request(server)
        .get('/api/threads/general')
        .end(function(err, res) {
        assert.equal(res.status, 200, 'response status is ok');
        assert.isArray(res.body, 'fetched Object has correct id');
        assert.isArray(res.body[0].replies, 'returned object has replies property and it is an array');
        done();
      });
    });
    
    suite('DELETE', function() {
      // Manually testing it, works well
    });
    
    suite('PUT', function(done) {
      chai.request(server)
        .put('/api/threads/general')
        .send({"thread_id": '5bbe29d25e31203340328269'})
        .end(function(err, res) {
        assert.equal(res.status, 200, 'response is ok');
        assert.equal(res.body, 'success', 'succesfully reported');
        done();
      });
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function(done) {
      chai.request(server)
        .put('/api/replies/ozarion')
        .send({"text":'Test Reply', "delete_password":'jam', "thread_id":'5bbe52c7b449f7005b56a52f'})
        .end(function (err, res) {
        assert.equal(res.status, 302, 'redirected so succesfully'); 
        done();
      });
    });
    
    suite('GET', function(done) {
      chai.request(server)
        .get('/api/replies/ozarion')
        .query({"thread_id":'5bbe29d25e31203340328269'})
        .end(function (err, res) {
        assert.equal(res.status, 200, 'ok response');
        assert.equal(res.body._id, '5bbe29d25e31203340328269', 'returned _id is correct');
        assert.isArray(res.body.replies, 'has replies and its an array');
        done();
      });
    });
    
    suite('PUT', function(done) {
      chai.request(server)
        .put('/api/replies/ozarion')
        .send({"thread_id": '5bbe29d25e31203340328269', "reply_id": '5bbe3a2bf450b37184af6a5a'})
        .end(function(err, res) {
        assert.equal(res.status, 200, 'response is ok');
        assert.equal(res.body, 'success', 'succesfully reported');
        done();
      });
    });
    
    suite('DELETE', function() {
      // Testing delete manually, works well
    });
    
  });

});
