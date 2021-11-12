var express = require('express');
var router = express.Router();
var request = require('request');
const {response} = require("express");
const fetch = require('node-fetch');
const redis = require('redis');
const axios = require('axios');

const client = redis.createClient();



router.get('/', function(req, res, next){
    res.render('form');
})

router.post('/', async function(req, res, next){
    const city = req.body.city;
    client.exists(city, async function(err, match){
        if(err){
            throw new Error(err);
        }
        if(match){
            client.get(city, (err, response) => {
                res.send(JSON.stringify(response + ' Cache Hit '))
                res.render('ps4', {data:response, cache:'HIT'})
            })
        }
        else{
            const apiresponse = await fetch(`http://api.weatherapi.com/v1/current.json?key=fc9b91875e76401591e181206212210&q=${city}&aqi=no`)
            const data = await apiresponse.text()
            client.set(city, data, 'EX', 15, (err, response) => { //city = key, data = value
                res.send(JSON.stringify(data + ' The data is not from the Cache '))
                res.render('ps4', {data:data, cache:'MISS'})
        })
        }

    })

})

router.get('/results', async function(req, res, next){
    const response = await fetch('http://api.weatherapi.com/v1/current.json?key=fc9b91875e76401591e181206212210&q=Boston&aqi=no')
    const data = await response.text()
    res.render('ps4', {data:data})
})

router.get('/b', function(req, res, next){
    res.render('index', {title:'ps4'});
})
router.post('/b', function(req, res, next){
    return new Promise((resolve, reject) => {
        const apicall = 'http://api.weatherapi.com/v1/current.json?key=fc9b91875e76401591e181206212210&q=Boston&aqi=no'
        request(apicall, (err, response, body) => {
            if(response.statusCode == 200){
                resolve(body)
            }
            else{
                reject(response)
            }

        });
    }).then ((result) => {
        res.render('index', {result:result});
        console.log(result);
    }, (result) => {
        res.render('index', {result:'error'});
    }
    );
});

router.post('/c', async function(req, res, next){
    const response = await fetch('http://api.weatherapi.com/v1/current.json?key=fc9b91875e76401591e181206212210&q=Boston&aqi=no')
    const data = await response.text()
    res.render('index', {title:data})
    
});

router.post('/d', function(req,res,next){
    api(function(response){
        response.send(result)
    })
})

function api(callback){
    const link = 'http://api.weatherapi.com/v1/current.json?key=fc9b91875e76401591e181206212210&q=Boston&aqi=no'
    request(link, (err, response, body) => {
        return callback(err,response,body)
    })
}


module.exports = router;
