var cron = require('node-cron'), 
settings = require('./settings'),   
    request = require('request');

tryCount = 0;



cron.schedule('*/1 * * * *', function () {
    console.log('start Games')

    var t = request.get({
        url: 'http://' + settings.api.apiBasePath + settings.api.hostUrl + 'teams/games/scrap/pending',
        json: true, 
        headers: { 'User-Agent': 'request' }
    }, (err, res, data) => {
        if (err) {
            console.log('Error:', err);
        } else if (res.statusCode !== 200) {
            console.log('Status:', res.statusCode);
        } else {

            if (data.result.docs.length > 0) {
                console.log(data.result.docs.length + ' games pending...')
                request.post({
                    url: 'http://127.0.0.1:3007/WhoScoredPreviewFinder',
                    json: true,
                    body: { games: data.result.docs }
                }, function (error, response, body) {
                    console.log(error);
                });
            }
            else {
                console.log('No Previews found to Scrap')
            }
        }
    });


}, null, true);
