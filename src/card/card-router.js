const express = require('express')
const uuid = require('uuid/v4')
const logger = require('../logger')
const { cards, lists } = require('../store')
const cardRouter = express.Router()
const bodyParser = express.json()

cardRouter
    .route('/card')
    .get((req, res) => {
        res.json(cards);
    })
    .post(bodyParser, (req, res) => {
        const { title, content } = req.body;

        //validate title and content error
        if (!title) {
            logger.error('Title is required');
            return res
                .status(400)
                .send('Invalid data');
        }
        if (!content) {
            logger.error('Content is required')
            return res
                .status(400)
                .send('Invalid data')
        }

        //if data exists, generate an ID and push card object to array
        //get id
        const id = uuid();

        const card = {
            id,
            title,
            content
        }
        cards.push(card);

        //log card creation and send response with location header
        logger.info(`Card with id ${id} created.`);
        res
            .status(201)
            .location(`http://localhost:8000/card/${id}`)
            .json(card);
    });


cardRouter
    .route('/card/:id')
    .get((req, res) => {
        const { id } = req.params
        const card = cards.find(c => c.id == id);

        //make sure card is found
        if (!card) {
            logger.error(`Card with ${id} doesn't exist.`);
            return res
                .status(404)
                .send('Card not found.');
        }
        res.json(card);
    })
    .delete((req, res) => {
        const { id } = req.params;
        const cardIndex = cards.findIndex(c => c.id == id);

        if (cardIndex === -1) {
            logger.error(`Card with id ${id} not found.`);
            return res
                .status(404)
                .send('Not found');
        }

        //remove card from lists
        //assume cardIds are not duplicated in the cardIds array
        lists.forEach(list => {
            const cardIds = list.cardIds.filter(cid => cid !== id);
            list.cardIds = cardIds;
        });
        cards.splice(cardIndex, 1);
        logger.info(`Card with id ${id} deleted.`);
        res
            .status(204)
            .end();
    })


module.exports = cardRouter