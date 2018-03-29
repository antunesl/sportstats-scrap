var teamsJob = require('./WhoScoredPreviewFinderJob');
var vo = require('vo');

function* Job() {
    console.log('hello job')
    var results = yield teamsJob.scrapGames(
        [
           {
               nextGame:{
                   homeTeamName : 'MU',
                   awayTeamName : 'CH',
                   homeTeamLink : 'https://www.whoscored.com/Teams/32/Show/England-Manchester-United'
               }
           } ,
           {
            nextGame:{
                homeTeamName : 'MU',
                awayTeamName : 'CH',
                homeTeamLink : 'https://www.whoscored.com/Teams/162/Show/England-Crystal-Palace'
            }
        } ,
        {
            nextGame:{
                homeTeamName : 'MU',
                awayTeamName : 'CH',
                homeTeamLink : 'https://www.whoscored.com/Teams/15/Show/England-Chelsea'
            }
        }
])

}


vo(Job)(function (err, titles) {

});