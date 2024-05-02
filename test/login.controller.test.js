const chai = require('chai');
const chaiHttp = require('chai-http')
const server = require('../app')
let database = []

chai.should()
chai.use(chaiHttp)


describe('UC-201 register /api/user',()=>{
    describe('TC-201-1 verplicht veld ontbreekt',()=>{
        beforeEach((done)=>{
            database = []
            done()
        })
        it('TC-201-1 Verplicht veld ontbreekt', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    // firstName: 'Voornaam', ontbreekt
                    lastName: 'Achternaam',
                    emailAdress: 'v.a@server.nl'
                })
                .end((err, res) => {
                    /**
                     * Voorbeeld uitwerking met chai.expect
                     */
                    chai.expect(res).to.have.status(400)
                    chai.expect(res).not.to.have.status(200)
                    chai.expect(res.body).to.be.a('object')
                    chai.expect(res.body).to.have.property('status').equals(400)
                    chai.expect(res.body)
                        .to.have.property('message')
                        .equals('All fields are required')
                    chai
                        .expect(res.body)
                        .to.have.property('data')
                        .that.is.a('object').that.is.empty
    
                    done()
                })
        })
    });
});