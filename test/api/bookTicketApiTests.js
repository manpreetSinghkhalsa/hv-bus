process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const request = require('supertest');

const app = require('../../server');
const db = require('../../app/models');


// var Mongoose = require('mongoose').Mongoose;
// var mockgoose = require('mockgoose');
//
// var mongoose = new Mongoose(db.url);
//
// mockgoose(mongoose);

// var Mongoose = require('mongoose').Mongoose;
// var mongoose = new Mongoose();

// var mockgoose = require('mockgoose');


var mongoose = require('mongoose');
var { Mockgoose } = require('mockgoose');

var mockgoose = new Mockgoose(mongoose);

describe('POST /notes', () => {

    before(function(done) {
        console.log(">>>>>>> BEFORE <<<<<<<<<");
        // mockgoose(mongoose).then(function() {
        mongoose.connect(db.url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, function(err, response) {
            if (err) {
                done(err);
            }
            done(response);
        });
        // });
    });

    // before((done) => {
    //
    //     mongoose.connect('mongodb://example.com/TestingDB', function(err) {
    //         done(err);
    //     });
    //
    // });

    after((done) => {
        db.mongoose.disconnect()
            .then(() => done())
            .catch((err) => done(err));
    });

    it('OK, creating a new note works', (done) => {
        request(app).post('/api/v1/book')
            .send({
                "name": "mera naam 5",
                "phone": "1234567905",
                "seatNumber": 1
            })
            .then((res) => {
                const body = res.body;
                const reso = res;
                console.log("Data: " + JSON.stringify(reso));
                expect(body).to.contain.property('_id');
                expect(body).to.contain.property('name');
                expect(body).to.contain.property('text');
                done();
            })
            .catch((err) => done(err));
    });

    // it('Fail, note requires text', (done) => {
    //     request(app).post('/notes')
    //         .send({ name: 'NOTE' })
    //         .then((res) => {
    //             const body = res.body;
    //             expect(body.errors.text.name)
    //                 .to.equal('ValidatorError')
    //             done();
    //         })
    //         .catch((err) => done(err));
    // });
});