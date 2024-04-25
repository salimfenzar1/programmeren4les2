const chai = require('chai');
const chaiHttp = require('chai-http')
const server = require('../../app')
const database = []

chai.should()
chai.use(chaiHttp)


describe('UC-201 register /api/user',()=>{
    describe('TC-201-1 verplicht veld ontbreekt',()=>{
        beforeEach(()=>{
            database = []
            done()
        })
        it('when required input is missing, a valid error should be returned',(done)=>{
            chai
            .request(server)
            .post('/api/user')
            .send({
                firstName: 'test',
                emailAddress: 'test@hotmail.nl',
                password: 'test'
            })
            .end((err, res)=>{
                res.should.be.an('object')
                let {status,result} = res.body
                status.should.equals(400)
                result.should.be.a('string').that.equals('All fields are required')
                done()
            })
       
        })
    })
})