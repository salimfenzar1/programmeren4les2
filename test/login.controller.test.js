
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

const INSERT_MEALS = 'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
    "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
    "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);";

// Test Setup
describe('UC-101 to UC-206 Testsuite', () => {
    let authToken; 
    beforeEach((done) => {
        db.getConnection((err, connection) => {
            if (err) throw err;
            connection.query(CLEAR_DB + INSERT_USER + INSERT_MEALS, (error, results, fields) => {
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
        .send({ emailAddress: '' }) // Geen wachtwoord
        .end((err, res) => {
            res.should.have.status(400);
            res.body.should.be.an('object').that.includes.all.keys('status', 'message', 'data');
            res.body.status.should.equal(400);
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
    


    it('TC-102-1 Opvragen van systeeminformatie', (done) => {
        chai.request(server)
            .get('/api/info')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('object').that.includes.all.keys('StudentName', 'StudentNumber', 'Description');
                done();
            });
    });

    // UC-201 Registreren als nieuwe user
    it('TC-201-1 Registreren als nieuwe user', (done) => {
        chai.request(server)
            .post('/api/user')
            .send({
                firstName: 'John',
                lastName: 'Doe',
                emailAddress: 'johndoe@server.nl',
                password: 'ValidPass123',
                street: 'Main Street',
                city: 'Sample City'
            })
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.have.property('user').that.includes.all.keys('id', 'firstName', 'lastName', 'emailAddress', 'street', 'city');
                done();
            });
    });


    // UC-201 TC-201-2 Niet-valide emailadres
    it('TC-201-2 Niet-valide emailadres', (done) => {
        chai.request(server)
            .post('/api/user')
            .send({
                firstName: 'John',
                lastName: 'Doe',
                emailAddress: 'invalid-email',
                password: 'ValidPass123',
                street: 'Main Street',
                city: 'Sample City'
            })
            .end((err, res) => {
                res.should.have.status(400);
                res.body.should.be.an('object').that.includes.all.keys('status', 'message', 'data');
                res.body.status.should.equal(400);
                res.body.data.should.be.empty;
                done();
            });
    });
        // UC-202 Opvragen van overzicht van users
        it('TC-202-1 Opvragen van overzicht van users', (done) => {
            chai.request(server)
                .get('/api/user')
                .set('Authorization', 'Bearer ' + authToken)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('object').that.includes.all.keys('status', 'message', 'data');
                    res.body.data.should.be.an('array');
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
                res.body.should.be.an('object').that.includes.all.keys('status', 'message', 'data');
                res.body.status.should.equal(404);
                res.body.data.should.be.empty;
                done();
            });
    });
});
