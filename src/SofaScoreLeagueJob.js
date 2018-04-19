var nightmare = require('nightmare'),
    tryCount = 0,
    settings = require('./settings'),
    request = require('request');
process.on('unhandledRejection', (reason, p) => {
    console.log('erro')
    if (tryCount <= 5) {
        console.log('retry - ' + tryCount)
        tryCount++;
        run();
    }
    else {
        //TODO reporting error
    }
});
module.exports = {
    scrapLeagues: function* run(leaguesToScrap) {
        nbot = nightmare({
            switches: { 'ignore-certificate-errors': true },
            show: false
        });

        console.log('start')
        z = 0;
        results = yield* running(leaguesToScrap);
        //console.log(JSON.stringify(results))

        console.log(JSON.stringify('done'));
        request.post({
            url: 'http://' + settings.api.hostUrl + settings.api.apiBasePath + 'leagues/scrap/',
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

function* running(leagues) {

    var globalMaxRetries = 5;
    var results = [];
    var retries = [];

    // Initialize retry counters
    leagues.forEach(league => {
        retries.push({
            permalink: league.permalink,
            maxRetries: globalMaxRetries,
            retryCount: 0
        });
    });

    for (i = 0; i < leagues.length; i++) {
        console.log(' --- ');
        console.log('Running [' + (i + 1) + '] of ' + leagues.length)
        console.log('[' + leagues[i].name + '] Going to start scraping');

        var r = yield* scrapLeagueInfo(leagues[i]);

        if (r != null) {
            console.log('[' + leagues[i].name + '] Scraping done.');
            results.push(r);
        }
        else {
            console.log('[' + leagues[i].name + '] Scraping error.');
            var retriesInfo = {};
            for (var j in retries) {
                if (retries[j].permalink == leagues[i].permalink) {
                    retriesInfo = retries[j];
                    break;
                }
            }
            var retryCount = retriesInfo.retryCount;
            var maxRetries = retriesInfo.maxRetries;

            console.log('[' + leagues[i].name + '] Retry information: RetryCount: ' + retryCount + ' (max: ' + maxRetries + ')');
            if (retriesInfo && retryCount <= maxRetries) {
                // update retry information
                for (var k in retries) {
                    if (retries[k].permalink == leagues[i].permalink) {
                        retries[k].retryCount++;
                        break;
                    }
                }
                console.log('[' + leagues[i].name + '] RetryCount (' + retryCount + ') less the max (' + maxRetries + '), trying one more time. Decremented i: ' + (i - 1));
                i--;
            }
            else {
                console.log('[' + leagues[i].name + '] Max retries reached, going to next league (i: ' + i + ')');
            }
        }

    }
    console.log('finish')
    console.log('results -> ' + JSON.stringify(results))
    return yield results;

}

function* scrapLeagueInfo(league) {

    if(league.type != 'Normal' && league.type != 'GroupsKnockout')
    {
        console.log('Worker ' + league.type + ' not found');
        return null;
    }
    var workerName = league.providers[0].name + '-' + league.type + ".js";
    console.log('Loading Worker - ' + workerName);
    console.log('starting Scrap Url ' + league.providers[0].link);
    var value = yield nbot
        .useragent('Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36')

        .goto(league.providers[0].link)
        .inject('js', './workers/' + workerName)
        .wait(1000)
        .wait('.js-event-list-tournament-events')
        .click('label.js-tournament-page-events-select-round.radio-switch__item')
        .evaluate(function (league) {
            return getData(league);
        }, league)

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


        }
        )



    return value;

}
