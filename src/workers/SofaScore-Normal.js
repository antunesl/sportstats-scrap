getData = (league) => {
    var items = [];


            var rows = $('.tab-pane.active > .standings-table > .cell.cell--standings');
            //GET STANDINGS
            for (var i = 0, row; row = rows[i]; i++) {
                var data = row.querySelectorAll('div');

                var position = data[0].innerText.trim();

                var teamName = row.querySelectorAll('.cell__content.standings__team-name')[0].innerText;

                var provider = {
                    name: 'SofaScore',
                    link: row.querySelectorAll('.cell__content.standings__team-name > a.js-link')[0].href
                };


                var gameInfo = row.querySelectorAll('.cell__content.standings__data.standings__columns-32 > span');
                var played = gameInfo[0].innerText;
                var win = gameInfo[1].innerText;
                var draw = gameInfo[2].innerText;
                var defeated = gameInfo[3].innerText;
                var goals = gameInfo[4].innerText.split(':');
                var goalScored = goals[0];
                var goalConceded = goals[1];

                var results = [];
                var lastResults = row.querySelectorAll('.cell__section.standings__last-5.switch-content.js-standings-view-form > div > a > span');
                for (var x = 0, result; result = lastResults[x]; x++) {
                    var className = result.className;
                    if (className.indexOf('win') != -1)
                        results.push('W');
                    else if (className.indexOf('lose') != -1)
                        results.push('L');
                    else if (className.indexOf('draw') != -1)
                        results.push('D');
                }
                var points = row.querySelectorAll('.cell__section.standings__points')[0].innerText.trim();

                var data = {
                    position: position,
                    teamName: teamName,
                    providerInfo: provider,
                    gamesPlayed: played,
                    wins: win,
                    draws: draw,
                    defeateds: defeated,
                    goalScored: goalScored,
                    goalConceded: goalConceded,
                    lastResults: results,
                    points: points
                }

                items.push(data);
                // items.push(teamName);


            }
            var topScores = [];
            //GET TOP SCORES
            rows = $('.bg-container > a.cell.cell--interactive.u-mB4.js-link.js-show-player-details');
            for (var i = 0, row; row = rows[i]; i++) {
                var divs = row.querySelectorAll('div');
                topScores.push({
                    position: divs[0].innerText.trim(),
                    name: divs[5].innerText.trim(),

                    team: divs[6].innerText.trim(),
                    matches: divs[7].innerText.trim(),
                    goals: divs[9].innerText.trim(),
                    rating: (divs.length > 12) ? divs[11].innerText.trim() : null
                })
            }

            var newcomers = [];
            rows = $('div.bg-container > a.cell.cell--interactive.u-mB4.js-link > .cell__section--main.u-mL12');
            if (rows.length > 0)
                for (var i = 0, row; row = rows[i]; i++) {
                    newcomers.push(row.innerText.trim())
                }
            //2018-03-06 18:33:53.384

            rows = $('.js-event-list-tournament.tournament > .js-event-list-tournament-events > a');
            //[0].innerText.split('\n').length
            var nextGame = '';
            var nextPreview = '';

            for (var i = 0, row; row = rows[i]; i++) {
                var time = new Date(row.getAttribute('data-start-timestamp') * 1000);
                nextPreview = new Date(row.getAttribute('data-start-timestamp') * 1000);

                nextPreview.setHours(nextPreview.getHours() - 48);

                // TODO: passar para configuração
                if (time.getTime() > new Date().getTime()) {
                    time.setMinutes(time.getMinutes() + 110)//change league.getTime()
                    nextGame = time;
                    break;
                }
            }
            

            var factsLeague = $('table.table.table--justified > tbody > tr > td.ff-medium');
            var titleHolderSelector = $('a.cell__section--main.u-flex-halves.u-br.u-p4.hover-link-block.js-link');
            var leagueData = {
                provider: league.providers[0],
                standings: items,
                topScores: topScores,
                name: $('h2.page-title > span')[0].innerText.trim(),

                permalink: league.permalink,
                country: league.country,
                nextScrapAt: nextGame,
                nextPreviewScrapAt: nextGame,



                titleHolder: titleHolderSelector[0].innerText.trim().split(/\r?\n/)[0],

                //TODO REFACTORING CHAMPIONCHIP EXAMPLE
                mostTitles: [{
                    name: (titleHolderSelector.length > 1) ? titleHolderSelector[1].innerText.trim().split(/\r?\n/)[0] : titleHolderSelector[0].innerText.trim().split(/\r?\n/)[0],
                    titles:  (titleHolderSelector.length > 1) ? titleHolderSelector[1].innerText.trim().split(/\r?\n/)[1].split('(')[1].replace(')', '') : 0
                }],

                newcomers: newcomers,
                facts: {
                    devisionLevel: (factsLeague.length >= 1) ? factsLeague[0].innerText.trim() : null,
                    numberRounds: (factsLeague.length >= 2) ? factsLeague[1].innerText.trim() : null,
                    averageGoals: (factsLeague.length >= 3) ? factsLeague[2].innerText.trim() : null,
                    homeTeamWins: (factsLeague.length >= 4) ? factsLeague[3].innerText.trim() : null,
                    draws: (factsLeague.length >= 5) ? factsLeague[4].innerText.trim() : null,
                    awayTeamWins: (factsLeague.length >= 6) ? factsLeague[5].innerText.trim() : null,
                    yellowCards: (factsLeague.length >= 7) ? factsLeague[6].innerText.trim() : null,
                    redCards: (factsLeague.length >= 8) ? factsLeague[7].innerText.trim() : null,

                }
            }

            return leagueData;
}