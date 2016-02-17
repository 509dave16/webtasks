"use latest";

/**
 * @file A small webtask.io service that exposes two api actions that utilize the "themoviedb" api's "/discover/movie" action.
 * @author David Fall
 */

let Webtask = require('webtask-tools');
let Express = require('express');
let request = require('request@2.56.0');

let app = Express();
let theMovieDbBaseUrl = 'https://api.themoviedb.org/3';
let theMovieDbApiKey=undefined;

app.use(require('body-parser').json());

//Assign secret api key to a global file letiable
app.use(function (req,res,next) {
    theMovieDbApiKey = req.webtaskContext.data.THE_MOVIE_DB_API_KEY;
    next();
});

//Retrieve results for most popular movies of a particular year
app.get('/most-popular/:year', function (req, res) {
    let year = req.params.year;
    let url = discoverMovieBy({
        'primary_release_year': year,
        'sort_by': 'popularity.desc'
    });
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.send(body);
        } else {
            throw error;
        }
    });
});

//Retrieve results for most grossing movies of a particular year
app.get('/most-revenue/:year', function (req, res) {
    let year = req.params.year;
    let url = discoverMovieBy({
        'primary_release_year': year,
        'sort_by': 'revenue.desc'
    });
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.send(body);
        } else {
            throw error;
        }
    });
});

/**
 * Based on the passed in 'params' object a url is built for a discover
 * movie request.
 * 
 * @param {mixed} params - The query string parameters to be used in the discover movie request url.
 */
function discoverMovieBy(params) {
    let url = `${theMovieDbBaseUrl}/discover/movie?`;
    for (let key in params) {
        let value = params[key];
        url += `${key}=${value}&`;
    }
    url += `api_key=${theMovieDbApiKey}`;
    return url;
}

module.exports = Webtask.fromExpress(app);