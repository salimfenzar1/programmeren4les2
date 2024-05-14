
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
const INSERT_PARTICIPANTS = `
INSERT INTO \`meal_participants_user\` (\`mealId\`, \`userId\`) VALUES
(1, 1),
(1, 2),
(2, 2);
`;

const INSERT_USER = 'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(1, "first", "last", "name@server.nl", "Secret123", "street", "city");';

    const INSERT_USER2 = 'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(2, "first", "last", "name@server2.nl", "Secret123", "street", "city");';

const INSERT_MEALS = 'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
    "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
    "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 2)," +
    "(3, 'Meal c', 'description', 'image url', NOW(), 1, 6.50, 2);";
    

// Test Setup
describe('UC-300 to UC-305 Testsuite', () => {
    let authToken; 
    beforeEach((done) => {
        db.getConnection((err, connection) => {
            if (err) throw err;
            connection.query(CLEAR_DB + INSERT_USER + INSERT_USER2 + INSERT_MEALS + INSERT_PARTICIPANTS, (error, results, fields) => {
                connection.release();
                if (error) throw error;
                done();
            });
        });
    });

    //inloggen om de functies te gebruiken in de meal database
it('inloggen om de functies te gebruiken in de meal database', (done) => {
    chai.request(server)
        .post('/api/login')
        .send({ emailAddress: 'name@server.nl', password: 'Secret123' })
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('object').that.includes.all.keys('token');
            authToken = res.body.token;
            done();
        });
});

    //UC-301 Toevoegen van maaltijd
     // TC-301-1 Verplicht veld ontbreekt
 it('TC-301-1 Verplicht veld ontbreekt', (done) => {
    chai.request(server)
        .post('/api/meal')
        .set('Authorization', 'Bearer ' + authToken)
        .send({
            //missing isactive
            // isActive:1,
            name: 'meal',
            description: 'my meal',
            imageUrl: 'url',
            dateTime: '2022-05-22 17:30:00',
            maxAmountOfParticipants: 2,
            price: 2.5,
            cookId: 1
        })
        .end((err, res) => {
            res.should.have.status(400);
            res.body.should.be.an('object').that.includes.all.keys('status', 'message');
            res.body.message.should.equal('Missing required fields: isActive');
            done();
        });
});

     // TC-301-2 Niet ingelogd
     it('TC-301-2 Niet ingelogd', (done) => {
        chai.request(server)
            .post('/api/meal')
            // .set('Authorization', 'Bearer ' + authToken)
            .send({
                isActive:1,
                name: 'meal',
                description: 'my meal',
                imageUrl: 'url',
                dateTime: '2022-05-22 17:30:00',
                maxAmountOfParticipants: 2,
                price: 2.5,
                cookId: 1
            })
            .end((err, res) => {
                res.should.have.status(401);
                res.body.should.be.an('object').that.includes.all.keys('status', 'message');
                res.body.message.should.equal('No token provided');
                done();
            });
    });
    

       // TC-301-3 Maaltijd succesvol toegevoegd
       it('TC-301-3 Maaltijd succesvol toegevoegd', (done) => {
        chai.request(server)
            .post('/api/meal')
            .set('Authorization', 'Bearer ' + authToken)
            .send({
                isActive:1,
                name: 'meal',
                description: 'my meal',
                imageUrl: 'url',
                dateTime: '2022-05-22 17:30:00',
                maxAmountOfParticipants: 2,
                price: 2.5,
                cookId: 1
            })
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.an('object').that.includes.all.keys('status', 'message', 'data');
                res.body.message.should.equal('Meal added successfully');
                done();
            });
    });

        //UC-302 Wijzigen van maaltijdsgegevens
     // TC-302-1 Verplicht velden “name” en/of “price”en/of “maxAmountOfParticipants” ontbreken
 it('TC-302-1 Verplicht velden “name” en/of “price”en/of “maxAmountOfParticipants” ontbreken', (done) => {
    chai.request(server)
        .put('/api/meal/1')
        .set('Authorization', 'Bearer ' + authToken)
        .send({
            isActive:1,
            // name: 'meal',
            description: 'my meal',
            imageUrl: 'url',
            dateTime: '2022-05-22 17:30:00',
            // maxAmountOfParticipants: 2,
            // price: 2.5,
            cookId: 1
        })
        .end((err, res) => {
            res.should.have.status(400);
            res.body.should.be.an('object').that.includes.all.keys('status', 'message');
            res.body.message.should.equal('Missing required update fields: name, price, maxAmountOfParticipants');
            done();
        });
});

     // TC-302-2 Niet ingelogd
     it('TC-302-2 Niet ingelogd', (done) => {
        chai.request(server)
            .put('/api/meal/1')
            // .set('Authorization', 'Bearer ' + authToken)
            .send({
                isActive:1,
                name: 'meal',
                description: 'my meal',
                imageUrl: 'url',
                dateTime: '2022-05-22 17:30:00',
                maxAmountOfParticipants: 2,
                price: 2.5,
                cookId: 1
            })
            .end((err, res) => {
                res.should.have.status(401);
                res.body.should.be.an('object').that.includes.all.keys('status', 'message');
                res.body.message.should.equal('No token provided');
                done();
            });
    });

       // TC-302-3 Niet de eigenaar van de data
       it('TC-302-3 Niet de eigenaar van de data', (done) => {
        chai.request(server)
            .put('/api/meal/2')
            .set('Authorization', 'Bearer ' + authToken)
            .send({
                isActive:1,
                name: 'meal',
                description: 'my meal',
                imageUrl: 'url',
                dateTime: '2022-05-22 17:30:00',
                maxAmountOfParticipants: 2,
                price: 2.5,
                cookId: 1
            })
            .end((err, res) => {
                res.should.have.status(403);
                res.body.should.be.an('object').that.includes.all.keys('status', 'message');
                res.body.message.should.equal('Unauthorized to update this meal');
                done();
            });
    });

           // TC-302-4 Maaltijd bestaat niet
           it('TC-302-4 Maaltijd bestaat niet', (done) => {
            chai.request(server)
                .put('/api/meal/100')
                .set('Authorization', 'Bearer ' + authToken)
                .send({
                    isActive:1,
                    name: 'meal',
                    description: 'my meal',
                    imageUrl: 'url',
                    dateTime: '2022-05-22 17:30:00',
                    maxAmountOfParticipants: 2,
                    price: 2.5,
                    cookId: 1
                })
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.an('object').that.includes.all.keys('status', 'message');
                    res.body.message.should.equal('Meal not found');
                    done();
                });
        });

            // TC-302-5 Maaltijd succesvol gewijzigd
           it('TC-302-5 Maaltijd succesvol gewijzigd', (done) => {
            chai.request(server)
                .put('/api/meal/1')
                .set('Authorization', 'Bearer ' + authToken)
                .send({
                    isActive:1,
                    name: 'updated meal',
                    description: 'my meal',
                    imageUrl: 'url',
                    dateTime: '2022-05-22 17:30:00',
                    maxAmountOfParticipants: 2,
                    price: 2.5,
                    cookId: 1
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('object').that.includes.all.keys('status', 'message','data');
                    res.body.message.should.equal('Meal updated successfully');
                    done();
                });
        });

        //UC-303 Opvragen van alle maaltijden
        // TC-303-1 Lijst van maaltijden geretourneerd
           it('TC-303-1 Lijst van maaltijden geretourneerd', (done) => {
            chai.request(server)
                .get('/api/meal')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('object').that.includes.all.keys('status', 'message','data');
                    res.body.message.should.equal('Meals retrieved successfully');
                    done();
                });
        });

            //UC-304 Opvragen van maaltijd bij ID
            //TC-304-1 Maaltijd bestaat niet
          it('TC-304-1 Maaltijd bestaat niet', (done) => {
            chai.request(server)
                .get('/api/meal/100')
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.an('object').that.includes.all.keys('status', 'message');
                    res.body.message.should.equal('Meal not found');
                    done();
                });
        });
            //TC-304-2 Details van maaltijd geretourneerd
          it('TC-304-2 Details van maaltijd geretourneerd', (done) => {
            chai.request(server)
                .get('/api/meal/1')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('object').that.includes.all.keys('status', 'message','data');
                    res.body.message.should.equal('Meal retrieved successfully');
                    done();
                });
        });

        //UC-305 Verwijderen van maaltijd
        // TC-305-1 Niet ingelogd
        it('TC-305-1 Niet ingelogd', (done) => {
            chai.request(server)
                .delete('/api/meal/1')
                // .set('Authorization', 'Bearer ' + authToken)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an('object').that.includes.all.keys('status', 'message');
                    res.body.message.should.equal('No token provided');
                    done();
                });
        });

          // TC-305-2 Niet de eigenaar van de data
          it('TC-305-2 Niet de eigenaar van de data', (done) => {
            chai.request(server)
                .delete('/api/meal/2')
                .set('Authorization', 'Bearer ' + authToken)
                .end((err, res) => {
                    res.should.have.status(403);
                    res.body.should.be.an('object').that.includes.all.keys('status', 'message');
                    res.body.message.should.equal('Unauthorized to delete this meal');
                    done();
                });
        });

              // TC-305-3 Maaltijd bestaat niet
              it('TC-305-3 Maaltijd bestaat niet', (done) => {
                chai.request(server)
                    .delete('/api/meal/100')
                    .set('Authorization', 'Bearer ' + authToken)
                    .end((err, res) => {
                        res.should.have.status(404);
                        res.body.should.be.an('object').that.includes.all.keys('status', 'message');
                        res.body.message.should.equal('Meal not found');
                        done();
                    });
            });

                 // TC-305-4 Maaltijd succesvol verwijderd
                 it('TC-305-4 Maaltijd succesvol verwijderd', (done) => {
                    let id = 1
                    chai.request(server)
                        .delete('/api/meal/' + id)
                        .set('Authorization', 'Bearer ' + authToken)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.an('object').that.includes.all.keys('status', 'message');
                            res.body.message.should.equal('Meal deleted successfully with id:' + id);
                            done();
                        });
                });

                //UC-401 Aanmelden voor maaltijd  
                // TC-401-1 Niet ingelogd
                 it('TC-401-1 Niet ingelogd', (done) => {
                    chai.request(server)
                        .post('/api/meal/1/participate')
                        // .set('Authorization', 'Bearer ' + authToken)
                        .end((err, res) => {
                            res.should.have.status(401);
                            res.body.should.be.an('object').that.includes.all.keys('status', 'message');
                            res.body.message.should.equal('No token provided');
                            done();
                        });
                });

                // TC-401-2 Maaltijd bestaat niet
                it('TC-401-2 Maaltijd bestaat niet', (done) => {
                    chai.request(server)
                        .post('/api/meal/10/participate')
                        .set('Authorization', 'Bearer ' + authToken)
                        .end((err, res) => {
                            res.should.have.status(404);
                            res.body.should.be.an('object').that.includes.all.keys('status', 'message');
                            res.body.message.should.equal('Meal not found');
                            done();
                        });
                });

                  // TC-401-3 Succesvol aangemeld
                  it('TC-401-3 Succesvol aangemeld', (done) => {
                    chai.request(server)
                        .post('/api/meal/2/participate')
                        .set('Authorization', 'Bearer ' + authToken)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.an('object').that.includes.all.keys('status', 'message');
                            res.body.message.should.equal('User with ID 1 is registered for meal with ID 2');
                            done();
                        });
                });

                 // TC-401-4 Maximumaantal aanmeldingen is bereikt.
                it('TC-401-4 Maximumaantal aanmeldingen is bereikt.', (done) => {
                    chai.request(server)
                        .post('/api/meal/3/participate')
                        .set('Authorization', 'Bearer ' + authToken)
                        .end((addErr, addRes) => {
                            chai.request(server)
                                .post('/api/meal/3/participate')
                                .set('Authorization', 'Bearer ' + authToken)
                                .end((err, res) => {
                                    res.should.have.status(400); 
                                    res.body.should.be.an('object').that.includes.all.keys('status', 'message');
                                    res.body.message.should.equal('Maximum number of participants reached');
                                    done();
                                });
                        });
                });

                  //UC-402 Afmelden voor maaltijd
                  // TC-402-1 Niet ingelogd
                  it('TC-402-1 Niet ingelogd', (done) => {
                    chai.request(server)
                        .delete('/api/meal/1/participate')
                        // .set('Authorization', 'Bearer ' + authToken)
                        .end((err, res) => {
                            res.should.have.status(401);
                            res.body.should.be.an('object').that.includes.all.keys('status', 'message');
                            res.body.message.should.equal('No token provided');
                            done();
                        });
                });

                    // TC-402-2 Maaltijd bestaat niet
                    it('TC-402-2 Maaltijd bestaat niet', (done) => {
                        chai.request(server)
                            .delete('/api/meal/10/participate')
                            .set('Authorization', 'Bearer ' + authToken)
                            .end((err, res) => {
                                res.should.have.status(404);
                                res.body.should.be.an('object').that.includes.all.keys('status', 'message');
                                res.body.message.should.equal('Meal not found');
                                done();
                            });
                    });

                      // TC-402-3 Aanmelding bestaat niet
                      it('TC-402-3 Aanmelding bestaat niet', (done) => {
                        chai.request(server)
                            .delete('/api/meal/3/participate')
                            .set('Authorization', 'Bearer ' + authToken)
                            .end((err, res) => {
                                res.should.have.status(404);
                                res.body.should.be.an('object').that.includes.all.keys('status', 'message');
                                res.body.message.should.equal('User not registered for this meal');
                                done();
                            });
                    });

                    //TC-402-4 Succesvol afgemeld
                    it('Gebruiker eerst succesvol aanmelden en dan afmelden', (done) => {
                        chai.request(server)
                            .post('/api/meal/3/participate')
                            .set('Authorization', 'Bearer ' + authToken)
                            .end((err, res) => {
                                res.should.have.status(200);
                                res.body.message.should.equal('User with ID 1 is registered for meal with ID 3');
                    
                                //TC-402-4 Succesvol afgemeld
                                chai.request(server)
                                    .delete('/api/meal/3/participate')
                                    .set('Authorization', 'Bearer ' + authToken)
                                    .end((err, res) => {
                                        res.should.have.status(200);
                                        res.body.message.should.equal('User with ID 1 has been successfully unregistered from meal with ID 3');
                                        done();
                                    });
                            });
                    });

                    
                      // TC-403-1 Opvragen van deelnemers
                      it('TC-403-1 Opvragen van deelnemers', (done) => {
                        chai.request(server)
                            .get('/api/meal/1/participants')
                            .set('Authorization', 'Bearer ' + authToken)
                            .end((err, res) => {
                                res.should.have.status(200);
                                res.body.should.be.an('object').that.includes.all.keys('status', 'message');
                                res.body.message.should.equal('Users retrieved succesfully');
                                done();
                            });
                    });

                       // TC-403-2 Opvragen van deelnemers zonder in te loggen
                       it('TC-403-2 Opvragen van deelnemers zonder in te loggen', (done) => {
                        chai.request(server)
                            .get('/api/meal/1/participants')
                            // .set('Authorization', 'Bearer ' + authToken)
                            .end((err, res) => {
                                res.should.have.status(401);
                                res.body.should.be.an('object').that.includes.all.keys('status', 'message');
                                res.body.message.should.equal('No token provided');
                                done();
                            });
                    });
                    // TC-403-3 Opvragen van deelnemers met niet bestaande meal
                    it('TC-403-3 Opvragen van deelnemers met niet bestaande meal', (done) => {
                        chai.request(server)
                            .get('/api/meal/10/participants')
                            .set('Authorization', 'Bearer ' + authToken)
                            .end((err, res) => {
                                res.should.have.status(404);
                                res.body.should.be.an('object').that.includes.all.keys('status', 'message');
                                res.body.message.should.equal('Meal not found');
                                done();
                            });
                    });

                        // TC-403-3 Opvragen van deelnemers met niet bestaande meal
                        it('TC-403-3 Opvragen van deelnemers met niet bestaande meal', (done) => {
                            chai.request(server)
                                .get('/api/meal/10/participants')
                                .set('Authorization', 'Bearer ' + authToken)
                                .end((err, res) => {
                                    res.should.have.status(404);
                                    res.body.should.be.an('object').that.includes.all.keys('status', 'message');
                                    res.body.message.should.equal('Meal not found');
                                    done();
                                });
                        });

                             // UC-404 Opvragen van details van deelnemer
                             it('TC-404-1 Opvragen van details van deelnemer', (done) => {
                                chai.request(server)
                                    .get('/api/meal/1/participants/1')
                                    .set('Authorization', 'Bearer ' + authToken)
                                    .end((err, res) => {
                                        res.should.have.status(200);
                                        res.body.should.be.an('object').that.includes.all.keys('status', 'message');
                                        res.body.message.should.equal('Participant found');
                                        done();
                                    });
                            });

                              // UC-404 Opvragen van details van deelnemer zonder in te loggen
                              it('TC-404-2 Opvragen van details van deelnemer zonder in te loggen', (done) => {
                                chai.request(server)
                                    .get('/api/meal/1/participants/1')
                                    // .set('Authorization', 'Bearer ' + authToken)
                                    .end((err, res) => {
                                        res.should.have.status(401);
                                        res.body.should.be.an('object').that.includes.all.keys('status', 'message');
                                        res.body.message.should.equal('No token provided');
                                        done();
                                    });
                            });

                               // UC-404 Opvragen van details van deelnemer die niet bestaat
                               it('TC-404-4 Opvragen van details van deelnemer die niet bestaat', (done) => {
                                chai.request(server)
                                    .get('/api/meal/1/participants/10')
                                    .set('Authorization', 'Bearer ' + authToken)
                                    .end((err, res) => {
                                        res.should.have.status(404);
                                        res.body.should.be.an('object').that.includes.all.keys('status', 'message');
                                        res.body.message.should.equal('Participant not found for this meal');
                                        done();
                                    });
                            });

                              // UC-404 Opvragen van details van deelnemer met niet bestaande meal
                               it('TC-404-5 Opvragen van details van deelnemer met niet bestaande meal', (done) => {
                                chai.request(server)
                                    .get('/api/meal/100/participants/1')
                                    .set('Authorization', 'Bearer ' + authToken)
                                    .end((err, res) => {
                                        res.should.have.status(404);
                                        res.body.should.be.an('object').that.includes.all.keys('status', 'message');
                                        res.body.message.should.equal('Meal not found');
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
    

