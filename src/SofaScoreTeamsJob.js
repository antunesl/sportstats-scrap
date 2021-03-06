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
    scrapTeams: function* run(teamsToScrap) {
        nbot = nightmare({
            switches: { 'ignore-certificate-errors': true },
            show: false
        });

        console.log('start')
        z = 0;
        results = yield* running(teamsToScrap);
        //console.log(JSON.stringify(results))
 
        // console.lorekg('before send  ->'.JSON.stringify(results));
        request.post({
            url: 'http://' + settings.api.hostUrl + settings.api.apiBasePath+ 'teams/scrap',
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

function* running(teams) {

    var globalMaxRetries = 5;
    var results = [];
    var retries = [];

    // Initialize retry counters
    teams.forEach(league => {
        retries.push({
            permalink: league.permalink,
            maxRetries: globalMaxRetries,
            retryCount: 0
        });
    });

    for (i = 0; i < teams.length; i++) {
        console.log(' --- ');
        console.log('Running [' + (i + 1) + '] of ' + teams.length)
        console.log('[' + teams[i].name + '] Going to start scraping url ' + teams[i].providers[0].link);
        // results.push(yield* scrapLeagueInfo(teams[i]));
        var r = yield* scrapLeagueInfo(teams[i]);

        if (r != null) {
            console.log('[' + teams[i].name + '] Scraping done.');
            console.log(JSON.stringify(r))
            results.push(r);
        }
        else {
            console.log('[' + teams[i].name + '] Scraping error.');
  
        }

    }
    console.log('results -> ' + JSON.stringify(results))

    return yield results;

}

function* scrapLeagueInfo(team, retry) {
    tryCount = retry;
    currentTeam = team;
    var url = team.providers[0].link;
    console.log('starting Scrap Url ' + url);
    var value = yield nbot
        .useragent('Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36')

        .goto(url)
        .wait(1000)
        .wait('.squad')

        .evaluate(function (team) {
            debugger;
            var nameTeam = $('h2.page-title')[0].innerText.trim();
            var rows = $('.top-scorers-container')[0].querySelectorAll('a');
            var topScores = [];
            for (var i = 0, row; row = rows[i]; i++) {
                console.log('hello 2 ');
                topScores.push({
                    position: row.querySelectorAll('.cell__content')[0].innerText.trim(),
                    name: row.querySelectorAll('.cell__content')[2].innerText.trim(),
                    matches: row.querySelectorAll('.cell__content')[3].innerText.trim(),
                    goals: row.querySelectorAll('.cell__content')[4].innerText.trim()
                    //ratings: row.querySelectorAll('.cell__content')[5].innerText.trim()
                });


            }

            rows = $('.squad > a');
            var squad = [];
            for (var i = 0, row; row = rows[i]; i++) {
                squad.push({
                    name: row.querySelectorAll('.squad-player__name')[0].innerText.trim(),
                    nationality: row.querySelectorAll('.squad-player__info.u-t2 > .cell.cell--justified > div > div.cell__content')[1] ? row.querySelectorAll('.squad-player__info.u-t2 > .cell.cell--justified > div > div.cell__content')[1].innerText.trim() : '',
                    position: row.querySelectorAll('.squad-player__info.u-t2 > .cell.cell--justified > div > div.cell__content')[0] ? row.querySelectorAll('.squad-player__info.u-t2 > .cell.cell--justified > div > div.cell__content')[0].innerText.trim() : '',
                    number: row.querySelectorAll('span.squad-player__shirt-number.theme-background-color')[0] ? row.querySelectorAll('span.squad-player__shirt-number.theme-background-color')[0].innerText.trim() : ''

                })

            }

            rows = $('table.table.table--justified > tbody > tr ');

            var findElements = 0;
            var Manager = '';
            var Stadium = '';
            var Capacity = '';
            var City = '';

            for (var i = 0, row; row = rows[i]; i++) {


                if (row.innerText.startsWith('Manager') == true) {

                    Manager = row.innerText.split('Manager').join('').trim();
                    findElements++;
                }
                else if (row.innerText.startsWith('Stadium') == true) {

                    Stadium = row.innerText.split('Stadium').join('').trim();
                    findElements++;
                }
                else if (row.innerText.startsWith('Capacity') == true) {

                    Capacity = row.innerText.split('Capacity').join('').trim();
                    findElements++;
                }
                else if (row.innerText.startsWith('City') == true) {

                    City = row.innerText.split('City').join('').trim();
                    findElements++;
                }
                if (findElements == 4)
                    break;

            }

            var rows = $('.event-list-table-wrapper.js-event-list-table-wrapper > div > div > a')

            var nextGame = '';
            var homeTeam = '';
            var awayTeam = '';
            var nextGameDate = '';
            for (var i = 0, row; row = rows[i]; i++) {
                var time = new Date(row.getAttribute('data-start-timestamp') * 1000);
                var title = row.querySelectorAll('.cell__section.status')[0].getAttribute('title');
                if ((time.getTime() > new Date().getTime()) && title == '-' )  {
                    time.setMinutes(time.getMinutes() + 110)//change league.getTime()
                    nextGame = time;
                    nextGameDate = new Date(row.getAttribute('data-start-timestamp') * 1000);
                    homeTeam = row.querySelectorAll('.cell__content.event-team')[0].innerText;
                    awayTeam =  row.querySelectorAll('.cell__content.event-team')[1].innerText;
                    break;
                }
            }
     
            var result = {
                provider: team.providers[0],
                name: team.name,
                permalink: team.permalink,
                topScores: topScores,
                squad: squad,
                country: team.country,
                nextScrapAt: nextGame,

                nextGame: {
                    date: nextGameDate,
                    awayTeam: awayTeam,
                    homeTeam: homeTeam,
                    provider: team.providers[0].name
                },

                teamInfo: {
                    manager: Manager,
                    stadium: Stadium,
                    capacity: Capacity,
                    city: City
                }
            }


            return result;

        }, team)



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
