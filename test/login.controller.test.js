// const chai = require('chai');
// const chaiHttp = require('chai-http')
// const server = require('../app')
// let database = []

// chai.should()
// chai.use(chaiHttp)


// describe('UC-201 register /api/user',()=>{
//     describe('TC-201-1 verplicht veld ontbreekt',()=>{
//         beforeEach((done)=>{
//             database = []
//             done()
//         })
//         it('TC-201-1 Verplicht veld ontbreekt', (done) => {
//             chai.request(server)
//                 .post('/api/user')
//                 .send({
//                     // firstName: 'Voornaam', ontbreekt
//                     lastName: 'Achternaam',
//                     emailAdress: 'v.a@server.nl'
//                 })
//                 .end((err, res) => {
//                     chai.expect(res).to.have.status(400)
//                     chai.expect(res).not.to.have.status(200)
//                     chai.expect(res.body).to.be.a('object')
//                     chai.expect(res.body).to.have.property('status').equals(400)
//                     chai.expect(res.body)
//                         .to.have.property('message')
//                     chai
//                         .expect(res.body)
//                         .to.have.property('data')
//                         .that.is.a('object').that.is.empty
    
//                     done()
//                 })
//         })
//     });
//     describe('TC-201-2 Succesvol registreren', () => {
//         it('TC-201-2 Succesvol registreren', (done) => {
//             chai.request(server)
//                 .post('/api/user')
//                 .send({
//                     firstName: 'Voornaam',
//                     lastName: 'Achternaam',
//                     emailAddress: 'v.a@server.nl',
//                     password: 'wachtwoord123'
//                 })
//                 .end((err, res) => {
//                     chai.expect(res).to.have.status(201);
//                     chai.expect(res.body).to.be.a('object');
//                     chai.expect(res.body).to.have.property('message').equals('User registered successfully');
//                     chai.expect(res.body).to.have.property('user').that.includes({ firstName: 'Voornaam', lastName: 'Achternaam' });
//                     done();
//                 });
//         });
//     });
// });

