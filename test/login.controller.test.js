
process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal-testdb';


process.env.LOGLEVEL = 'trace';

const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = require('assert');
const jwt = require('jsonwebtoken');
const jwtSecretKey = require('../src/util/config').secretkey;
const db = require('../db/mysql-db');
const server = require('../app');
const logger = require('../src/util/logger');
require('dotenv').config();

chai.should();
chai.use(chaiHttp);

// Database queries
const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;';
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;';
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;';
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;

const INSERT_USER = 'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(1, "first", "last", "name@server.nl", "secret", "street", "city");';

const INSERT_USER2 = 'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(2, "first", "last", "name@server2.nl", "secret", "street", "city");';   


// const INSERT_MEALS = 'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
//     "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
//     "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);";

// Test Setup
describe('UC-101 to UC-206 Testsuite', () => {
    let authToken; 
    beforeEach((done) => {
        db.getConnection((err, connection) => {
            if (err) throw err;
            connection.query(CLEAR_DB + INSERT_USER + INSERT_USER2 , (error, results, fields) => {
                connection.release();
                if (error) throw error;
                done();
            });
        });
    });

    
 // TC-101-1 Verplicht veld ontbreekt
 it('TC-101-1 Verplicht veld ontbreekt', (done) => {
    chai.request(server)
        .post('/api/login')
        .send({ emailAddress: 'name@server.nl' }) // Geen wachtwoord
        .end((err, res) => {
            res.should.have.status(400);
            res.body.should.be.an('object').that.includes.all.keys('status', 'message', 'data');
            res.body.status.should.equal(400);
            res.body.message.should.equal('Missing required fields: emailAddress and/or password');
            res.body.data.should.be.empty;
            done();
        });
});

// TC-101-2 Niet-valide wachtwoord
it('TC-101-2 Niet-valide wachtwoord', (done) => {
    chai.request(server)
        .post('/api/login')
        .send({ emailAddress: 'name@server.nl', password: 'wrongpassword' })
        .end((err, res) => {
            res.should.have.status(401);
            res.body.should.be.an('object').that.includes.all.keys('status', 'message', 'data');
            res.body.status.should.equal(401);
            res.body.data.should.be.empty;
            done();
        });
});

// TC-101-3 Gebruiker bestaat niet
it('TC-101-3 Gebruiker bestaat niet', (done) => {
    chai.request(server)
        .post('/api/login')
        .send({ emailAddress: 'nonexistent@server.nl', password: 'secret' })
        .end((err, res) => {
            res.should.have.status(404);
            res.body.should.be.an('object').that.includes.all.keys('status', 'message', 'data');
            res.body.status.should.equal(404);
            res.body.data.should.be.empty;
            done();
        });
});

// TC-101-4 Gebruiker succesvol ingelogd
it('TC-101-4 Gebruiker succesvol ingelogd', (done) => {
    chai.request(server)
        .post('/api/login')
        .send({ emailAddress: 'name@server.nl', password: 'secret' })
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('object').that.includes.all.keys('token');
            authToken = res.body.token;
            done();
        });
});
    

// TC-102-1  Opvragen van systeeminformatie
    it('TC-102-1 Opvragen van systeeminformatie', (done) => {
        chai.request(server)
            .get('/api/info')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('object').that.includes.all.keys('StudentName', 'StudentNumber', 'Description');
                done();
            });
    });
      // TC-201 TC-201-1 Verplicht veld ontbreekt
      it('TC-201-1 Verplicht veld ontbreekt', (done) => {
        chai.request(server)
            .post('/api/user')
            .send({
                // firstName: 'John',
                lastName: 'Doe',
                emailAddress: 'johndoe@gmail.nl',
                password: 'ValidPass123',
                street: 'Main Street',
                city: 'Sample City',
                phoneNumber: '0648746746'
            })
            .end((err, res) => {
                res.should.have.status(400);
                res.body.should.be.an('object').that.includes.all.keys('status', 'message', 'data');
                res.body.status.should.equal(400);
                res.body.message.should.equal('Missing required fields: First name');
                res.body.data.should.be.empty;
                done();
            });
    });

      // TC-201 TC-201-2 Niet-valide emailadres
      it('TC-201-2 Niet-valide emailadres', (done) => {
        chai.request(server)
            .post('/api/user')
            .send({
                firstName: 'John',
                lastName: 'Doe',
                emailAddress: 'invalid-email',
                password: 'ValidPass123',
                street: 'Main Street',
                city: 'Sample City',
                phoneNumber: '0648746746'
            })
            .end((err, res) => {
                res.should.have.status(400);
                res.body.should.be.an('object').that.includes.all.keys('status', 'message', 'data');
                res.body.status.should.equal(400);
                res.body.message.should.equal('Invalid email address format');
                res.body.data.should.be.empty;
                done();
            });
    });

      // TC-201 TC-201-3 Niet-valide wachtwoord
      it('TC-201-3 Niet-valide wachtwoord', (done) => {
        chai.request(server)
            .post('/api/user')
            .send({
                firstName: 'John',
                lastName: 'Doe',
                emailAddress: 'johndoe@gmail.nl',
                password: 'nvalid',
                street: 'Main Street',
                city: 'Sample City',
                phoneNumber: '0648746746'
            })
            .end((err, res) => {
                res.should.have.status(400);
                res.body.should.be.an('object').that.includes.all.keys('status', 'message', 'data');
                res.body.status.should.equal(400);
                res.body.message.should.equal('Invalid password');
                res.body.data.should.be.empty;
                done();
            });
    });

      // TC-201 TC-201-4 Gebruiker bestaat al
      it('TC-201-4 Gebruiker bestaat al', (done) => {
        chai.request(server)
            .post('/api/user')
            .send({
                firstName: 'John',
                lastName: 'Doe',
                emailAddress: 'name@server.nl',
                password: 'ValidPass123', 
                street: 'Main Street',
                city: 'Sample City',
                phoneNumber: '0648746746'
            })
            .end((err, res) => {
                res.should.have.status(403);
                res.body.should.be.an('object').that.includes.all.keys('status', 'message', 'data');
                res.body.status.should.equal(403);
                res.body.message.should.equal('User already exists');
                res.body.data.should.be.empty;
                done();
            });
    });

    // TC-201-5 Registreren als nieuwe user
    it('TC-201-5 Gebruiker succesvol geregistreerd', (done) => {
        chai.request(server)
            .post('/api/user')
            .send({
                firstName: 'John',
                lastName: 'Doe',
                emailAddress : 'johndoe@server.nl',
                password: 'ValidPass123',
                street: 'Main Street',
                city: 'Sample City',
                phoneNumber: '0648640646'
            })
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.have.property('user').that.includes.all.keys('id', 'firstName', 'lastName', 'emailAddress', 'street', 'city','phoneNumber');
                done();
            });
    });


  
        // TC-202-1 Toon alle gebruikers (minimaal 2)
        it('TC-202-1 Toon alle gebruikers (minimaal 2)', (done) => {
            chai.request(server)
                .get('/api/user')
                .set('Authorization', 'Bearer ' + authToken)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('object').that.includes.all.keys('status', 'message', 'data');
                    res.body.data.should.be.an('array').that.has.lengthOf.at.least(2);
                    done();
                });
        });

              // TC-202-2 Toon gebruikers met zoekterm op niet-bestaande velden.
              it('TC-202-2 Toon gebruikers met zoekterm op niet-bestaande velden.', (done) => {
                chai.request(server)
                    .get('/api/user/?testfilter=nothing')
                    .set('Authorization', 'Bearer ' + authToken)
                    .end((err, res) => {
                        res.should.have.status(400);
                        res.body.should.be.an('object').that.includes.all.keys('status', 'message', 'data');
                        res.body.message.should.equal('Invalid filter(s): testfilter');
                        res.body.data.should.be.empty;
                        done();
                    });
            });
          
         // TC-202-3 Toon gebruikers met gebruik van de zoekterm op het veld ‘isActive’=false
         it('TC-202-3 Toon gebruikers met gebruik van de zoekterm op het veld isActive=false.', (done) => {
            chai.request(server)
                .get('/api/user/?isActive=false')
                .set('Authorization', 'Bearer ' + authToken)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('object').that.includes.all.keys('status', 'message', 'data');
                    res.body.message.should.equal('Users retrieved successfully');
                    done();
                });
        });

           // TC-202-4 Toon gebruikers met gebruik van de zoekterm op het veld ‘isActive’=true
           it('TC-202-4 Toon gebruikers met gebruik van de zoekterm op het veld isActive=true', (done) => {
            chai.request(server)
                .get('/api/user/?isActive=true')
                .set('Authorization', 'Bearer ' + authToken)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('object').that.includes.all.keys('status', 'message', 'data');
                    res.body.message.should.equal('Users retrieved successfully');
                    done();
                });
        });

                 
        // TC-202-5 Toon gebruikers met zoektermen op bestaande velden (max op 2 velden filteren)
        it('TC-202-5 Toon gebruikers met zoektermen op bestaande velden (max op 2 velden filteren)', (done) => {
            chai.request(server)
                .get('/api/user/?isActive=true&firstName=John')
                .set('Authorization', 'Bearer ' + authToken)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('object').that.includes.all.keys('status', 'message', 'data');
                    res.body.message.should.equal('Users retrieved successfully');
                    done();
                });
        });
    
        //UC-203 Opvragen van gebruikersprofiel

      // TC-203-1 Ongeldig token
      it('TC-203-1 Ongeldig token', (done) => {
        chai.request(server)
            .get('/api/profile')
            // Een opzettelijk ongeldig token instellen
            .set('Authorization', 'Bearer ' + authToken + 'not working')
            .end((err, res) => {
                res.should.have.status(403);
                res.body.should.be.an('object').that.includes.keys('status', 'message');
                res.body.message.should.equal('Invalid token');
                done();
            });
    });
          // TC-203-2 Gebruiker is ingelogd met geldig token.
      it('TC-203-2 Gebruiker is ingelogd met geldig token.', (done) => {
        chai.request(server)
            .get('/api/profile')
            .set('Authorization', 'Bearer ' + authToken)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('object').that.includes.all.keys('status', 'message', 'data');
                res.body.message.should.equal('User retrieved successfully');
                done();
            });
    });
        
        //UC-204 Opvragen van usergegevens bij ID
        // TC-204-1 Ongeldig token
      it('TC-204-1 Ongeldig token', (done) => {
        chai.request(server)
            .get('/api/user/1')
            // Een opzettelijk ongeldig token instellen
            .set('Authorization', 'Bearer ' + authToken + 'not working')
            .end((err, res) => {
                res.should.have.status(403);
                res.body.should.be.an('object').that.includes.keys('status', 'message');
                res.body.message.should.equal('Invalid token');
                done();
            });
    });
        // TC-204-2 Gebruiker-ID bestaat niet
      it('TC-204-2 Gebruiker-ID bestaat niet', (done) => {
        chai.request(server)
            .get('/api/user/50')
            .set('Authorization', 'Bearer ' + authToken )
            .end((err, res) => {
                res.should.have.status(404);
                res.body.should.be.an('object').that.includes.keys('status', 'message');
                res.body.message.should.equal('User not found');
                done();
            });
    });

            // TC-204-3 Gebruiker-ID bestaat
            it('TC-204-3 Gebruiker-ID bestaat', (done) => {
                chai.request(server)
                    .get('/api/user/1')
                    .set('Authorization', 'Bearer ' + authToken )
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.an('object').that.includes.keys('status', 'message');
                        res.body.message.should.equal('User retrieved successfully');
                        done();
                    });
            });

      //UC-205 Updaten van usergegevens    
                  // TC-205-1 Verplicht veld “emailAddress” ontbreek
            it('TC-205-1 Verplicht veld “emailAddress” ontbreek', (done) => {
                chai.request(server)
                    .put('/api/user/1')
                    .set('Authorization', 'Bearer ' + authToken )
                    .send({
                        firstName: 'John',
                        lastName: 'Doe',
                        password: 'ValidPass123',
                        street: 'Main Street',
                        city: 'Sample City',
                        phoneNumber: '0648640646'
                    })
                    .end((err, res) => {
                        res.should.have.status(400);
                        res.body.should.be.an('object').that.includes.keys('status', 'message');
                        res.body.message.should.equal('Email address is required');
                        done();
                    });
            });  
                  // TC-205-2 De gebruiker is niet de eigenaar van de data
                  it('TC-205-2 De gebruiker is niet de eigenaar van de data', (done) => {
                    chai.request(server)
                        .put('/api/user/2')
                        .set('Authorization', 'Bearer ' + authToken )
                        .send({
                            firstName: 'John',
                            lastName: 'Doe',
                            emailAddress:'name@server2.nl',
                            password: 'ValidPass123',
                            street: 'Main Street',
                            city: 'Sample City',
                            phoneNumber: '0648640646'
                        })
                        .end((err, res) => {
                            res.should.have.status(403);
                            res.body.should.be.an('object').that.includes.keys('status', 'message');
                            res.body.message.should.equal('Unauthorized to update these details');
                            done();
                        });
                });  
                      // TC-205-3 Niet-valide telefoonnummer
                      it('TC-205-3 Niet-valide telefoonnummer', (done) => {
                        chai.request(server)
                            .put('/api/user/1')
                            .set('Authorization', 'Bearer ' + authToken )
                            .send({
                                firstName: 'John',
                                lastName: 'Doe',
                                emailAddress:'name@server.nl',
                                password: 'ValidPass123',
                                street: 'Main Street',
                                city: 'Sample City',
                                //niet valide telefoonnummer
                                phoneNumber: '88283833'
                            })
                            .end((err, res) => {
                                res.should.have.status(400);
                                res.body.should.be.an('object').that.includes.keys('status', 'message');
                                res.body.message.should.equal('Invalid phone number. Phone number must be 10 digits and start with 06');
                                done();
                            });
                    });  

                 // TC-205-4 Gebruiker bestaat niet
                 it('TC-205-4 Gebruiker bestaat niet', (done) => {
                    chai.request(server)
                        .put('/api/user/20')
                        .set('Authorization', 'Bearer ' + authToken )
                        .send({
                            firstName: 'John',
                            lastName: 'Doe',
                            emailAddress:'name@server.nl',
                            password: 'ValidPass123',
                            street: 'Main Street',
                            city: 'Sample City',
                            phoneNumber: '0648648748'
                        })
                        .end((err, res) => {
                            res.should.have.status(404);
                            res.body.should.be.an('object').that.includes.keys('status', 'message');
                            res.body.message.should.equal('User not found');
                            done();
                        });
                });

                 // TC-205-5 Niet ingelogd
                 it('TC-205-5 Niet ingelogd', (done) => {
                    chai.request(server)
                        .put('/api/user/1')
                        //niet ingelogd
                        // .set('Authorization', 'Bearer ' + authToken )
                        .send({
                            firstName: 'John',
                            lastName: 'Doe',
                            emailAddress:'name@server.nl',
                            password: 'ValidPass123',
                            street: 'Main Street',
                            city: 'Sample City',
                            phoneNumber: '0648648748'
                        })
                        .end((err, res) => {
                            res.should.have.status(401);
                            res.body.should.be.an('object').that.includes.keys('status', 'message');
                            res.body.message.should.equal('No token provided');
                            done();
                        });
                });

                    // TC-205-6 Gebruiker succesvol gewijzigd
                    it('TC-205-6 Gebruiker succesvol gewijzigd', (done) => {
                        chai.request(server)
                            .put('/api/user/1')
                            .set('Authorization', 'Bearer ' + authToken )
                            .send({
                                firstName: 'Mister',
                                lastName: 'Doe',
                                emailAddress:'name@server.nl',
                                password: 'ValidPass123',
                                street: 'Main Street',
                                city: 'Sample City',
                                phoneNumber: '0648648748'
                            })
                            .end((err, res) => {
                                res.should.have.status(200);
                                res.body.should.be.an('object').that.includes.all.keys('status', 'message','data');
                                res.body.message.should.equal('User updated successfully');
                                done();
                            });
                    });

                    // UC-206 TC-206-1 Gebruiker bestaat niet
                    it('TC-206-1 Gebruiker bestaat niet', (done) => {
                        chai.request(server)
                            .delete('/api/user/999') 
                            .set('Authorization', 'Bearer ' + authToken) 
                            .end((err, res) => {
                                res.should.have.status(404);
                                res.body.should.be.an('object').that.includes.keys('status', 'message');
                                res.body.status.should.equal(404);
                                res.body.message.should.equal('User not found');
                                done();
                            });
                    });

                    
                    //TC-206-2 Gebruiker is niet ingelogd
                    it('TC-206-2 Gebruiker is niet ingelogd', (done) => {
                        chai.request(server)
                            .delete('/api/user/1') 
                            //niet ingelogd
                            // .set('Authorization', 'Bearer ' + authToken) 
                            .end((err, res) => {
                                res.should.have.status(401);
                                res.body.should.be.an('object').that.includes.keys('status', 'message');
                                res.body.message.should.equal('No token provided');
                                done();
                            });
                    });

                    //TC-206-3 De gebruiker is niet de eigenaar van de data
                    it('TC-206-3 De gebruiker is niet de eigenaar van de data', (done) => {
                        chai.request(server)
                            .delete('/api/user/2') 
                            .set('Authorization', 'Bearer ' + authToken) 
                            .end((err, res) => {
                                res.should.have.status(403);
                                res.body.should.be.an('object').that.includes.keys('status', 'message');
                                res.body.message.should.equal('Unauthorized to delete this user');
                                done();
                            });
                    });

                     //TC-206-4 Gebruiker succesvol verwijderd
                     it('TC-206-4 Gebruiker succesvol verwijderd', (done) => {
                        chai.request(server)
                            .delete('/api/user/1') 
                            .set('Authorization', 'Bearer ' + authToken) 
                            .end((err, res) => {
                                res.should.have.status(200);
                                res.body.should.be.an('object').that.includes.keys('status', 'message');
                                res.body.message.should.equal('User deleted successfully');
                                done();
                            });
                    });


    after((done) => {
        db.getConnection((err, connection) => {
            if (err) throw err;
            connection.query(CLEAR_DB, (error, results, fields) => {
                connection.release();
                if (error) throw error;
                done();
            });
        });
    });
});
    

