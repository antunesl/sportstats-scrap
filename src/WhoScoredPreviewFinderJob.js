var nightmare = require('nightmare'),
    tryCount = 0,
    settings = require('./settings'),
    request = require('request'),
    currentTeam = {};

process.on('unhandledRejection', (reason, p) => {
    console.error('Scrap error')
    console.error(reason)
    if (tryCount <= 5) {
        console.log('retry - ' + tryCount)
        tryCount++;
        run(currentTeam, tryCount);
    }
    else {
        //TODO reporting error
    }
});
module.exports = {
    scrapGames: function* run(gamesToScrap) {
        nbot = nightmare({
            switches: { 'ignore-certificate-errors': true },
            show: true,
            width: 1920,
            height: 1080
        });

        console.log('start')
        z = 0;

        results = yield* running(gamesToScrap);

        console.log('final - ' + JSON.stringify(results))



        request.post({
            url: 'http://' + settings.api.hostUrl + settings.api.apiBasePath + 'games/scrap',
            json: true,
            body: results
        }, function (error, response, body) {
            console.log('API - ' + body)
        });

        nbot.end();
        nbot.proc.disconnect();
        nbot.proc.kill();
        nbot.ended = true;
        nbot = null;
        return nbot;
    }


}

function* running(games) {

    var globalMaxRetries = 5;
    var results = [];
    var retries = [];






    console.log(' --- ');
    console.log('Going to start scraping url for league: ' + games.result.league);
    var r = yield* findPreviews(games.result);

    if (r != null) {

        results.push(r);
    }
    else {
        console.log('[' + games.result[i].league + '] Scraping error.');

    }



    var final = {
        docs : r
    };

    return yield final;

}

function* findPreviews(game, retry) {
    tryCount = retry;
    currentTeam = game.league;

    var url = game.league;

    console.log('starting Scrap Url ' + url);
    var value = yield nbot
        .useragent('Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36')

        .goto(url)
        .cookies.clear()
        // .wait(1500)
        .wait('table#tournament-fixture')
        .evaluate(function () {

            var previews = [];

            var rows = $('table#tournament-fixture > tbody > tr.item');

            for (var i = 0, row; row = rows[i]; i++) {

                if ((row.querySelectorAll('a.match-link.preview.rc')[0] != null)) {
                    previews.push({
                        home: row.querySelectorAll('td > a.team-link')[0].innerText,
                        away: row.querySelectorAll('td > a.team-link')[1].innerText,
                        link: row.querySelectorAll('a.match-link.preview.rc')[0].getAttribute('href')
                    })


                }
            }

            return previews;
        })
        .catch(error => {
            var message;
            if (typeof error.details != "undefined" && error.details != "") {
                message = error.details;
            } else if (typeof error == "string") {
                message = error;

                if (error == "Cannot read property 'focus' of null") {
                    message += " (Likely because a non-existent selector was used)";
                }
            } else {
                message = error.message;
            }
            console.log(error);

        })

    console.log('value - ' + JSON.stringify(value));

    return value;

}
