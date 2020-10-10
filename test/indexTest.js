//During the test the env variable is set to test
process.env.NODE_ENV = 'test';
// ===========================
// Chai Setting ==============
// ===========================
const chai = require('chai');
const chai_http = require('chai-http');
const should = chai.should();
chai.use(chai_http);

const index = require('../index');

describe('GET /', () => {
    it("it should report Status 200", (done) => {
        chai.request(index)
            .get('/')
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
    });
});

describe('Get /about', () => {
    it('it should report Status 200', (done) => {
        chai.request(index)
            .get('/about')
            .end( (err, res) => {
                res.should.have.status(200);
                done();
            });
    });
});
