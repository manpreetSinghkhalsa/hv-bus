//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let Ticket = require('../app/models/ticket.model');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();


chai.use(chaiHttp);

//Our parent block
describe('Tickets', () => {
    beforeEach((done) => { //Before each test we empty the database
        Ticket.remove({}, (err) => {
            done();
        });
    });

    afterEach((done) => {
       done();
    });
    /*
      * Test the /GET route
      */
    describe('/GET Ticket details', () => {
        it('it should fail for seat number 1', (done) => {
            chai.request(server.serverInstance)
                .get('/api/v1/1')
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.a('object');
                    res.body.should.have.property("message");
                    should.equal(res.body.message, "Ticket not found with seat number: 1");
                   return done();
                });
        });
        it('it should fail for seat number 0', (done) => {
            chai.request(server.serverInstance)
                .get('/api/v1/0')
                .end((err, res) => {
                    res.should.have.status(500);
                    return done();
                });
        });
        it('it should fail for seat number 41', (done) => {
            chai.request(server.serverInstance)
                .get('/api/v1/41')
                .end((err, res) => {
                    res.should.have.status(500);
                    return done();
                });
        });
    });

});