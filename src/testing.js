var Nightmare = require('./custom');
var vo = require('vo');
var nightmare;

vo(run)(function (err, result) {
    if (err) console.log(err);
});


function testingStuff(type)
{
    return type + ' done' ;
}


function* run() {
    var team = {
       team : 'MU'
    }
     nightmare = Nightmare({
        show: true,
        width: 1920,
        height: 1080,
        waitTimeout: 100000,
        switches: {
            'ignore-certificate-errors': true
          }
        // paths: {
        //     userData: '/dev/null'
        // }
    });
    console.log('hello')
    var title = yield nightmare
        .inject('testing.js')
        .goto("https://www.sofascore.com/tournament/football/europe/uefa-champions-league/7")
        .wait(1000)
        .wait('table#team-fixtures-summary')
        .evaluate(function (testingStuff) {
            
            return testingStuff('1');
        }, testingStuff)


        .then(function (item) {
            console.log(item)
        })
    yield nightmare.end();

    console.log(title);
}