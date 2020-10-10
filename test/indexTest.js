process.env.NODE_ENV = 'test';

const chai = require('chai');
const index = require('../index');

// describe('Index', function(){
//     it('return something', function(){
//         let result = index();
//         assert.typeOf(result, 'something');
//     })
// });

describe('/GET main page', function(){
    it('should render index.ejs', function(done){
        chai.get('/')
            .end(function(err, res){
                res.should.have.status(200);
                done();
            });
    });
});