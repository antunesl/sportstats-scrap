var Nightmare = require('./custom');
var vo = require('vo');
var nightmare;

vo(run)(function (err, result) {
    if (err) console.log(err);
});



function* run() {
    var team = {
       team : 'MU'
    }
     nightmare = Nightmare({
        show: false,
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
        
        .goto("https://www.whoscored.com/Teams/31/Show/England-Everton")
        .wait(1000)
        .wait('table#team-fixtures-summary')
        .evaluate(function (team) {
            var previews;

            var rows = $('table#team-fixtures-summary > tbody > tr');

            for (var i = 0, row; row = rows[i]; i++) {

                if ((row.querySelectorAll('td.toolbar.right')[0].innerText == 'Preview')) {
                    previews = {
                        home: team.team,
                        
                        link: row.querySelectorAll('td.toolbar.right > a')[0].getAttribute('href')
                    }

                    break;
                }
            }

            return previews;

        }, team)


        .then(function (item) {
            console.log(item)
        })
    yield nightmare.end();

    console.log(title);
}