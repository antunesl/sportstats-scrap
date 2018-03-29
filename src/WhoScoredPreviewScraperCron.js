var cron = require('node-cron'),
settings = require('./settings'),
    request = require('request');

tryCount = 0;



cron.schedule('*/2 * * * *', function () {
    console.log('Preview Scraper')

    // var objs = [{ away: "Blackpool", home: "Milton Keynes Dons", link: "/Matches/1193046/Preview/England-League-1-2017-2018-Milton-Keynes-Dons-Blackpool" }];

    // if (objs.length > 0) {

    //     request.post({
    //         url: 'http://127.0.0.1:3007/WhoScoredPreviewScraper',
    //         json: true,
    //         body: { games: objs }
    //     }, function (error, response, body) {
    //         console.log(error);
    //     });
    // }
    // else {
    //     console.log('No Previews To Scrap')
    // }

    var t = request.get({
        url: 'http://' +settings.api.hostUrl + settings.api.apiBasePath+ 'teams/previews/scrap/pending',
        json: true,
        headers: { 'User-Agent': 'request' }
    }, (err, res, data) => {

        console.log(JSON.stringify(data));
        // var objs = [{ away: "Blackpool", home: "Milton Keynes Dons", link: "/Matches/1193046/Preview/England-League-1-2017-2018-Milton-Keynes-Dons-Blackpool" }];

        if (err) {
            console.log('Error:', err);
        } else if (res.statusCode !== 200) {
            console.log('Status:', res.statusCode);
        } else {

            if (data!= null && data.result != null && data.result.length > 0) {

                request.post({
                    url: 'http://127.0.0.1:3007/WhoScoredPreviewScraper',
                    json: true,
                    body: { previews: data.result }
                }, function (error, response, body) {
                    console.log(error);
                });
            }
            else {
                console.log('No Previews To Scrap')
            }
        }
    });


}, null, true);
