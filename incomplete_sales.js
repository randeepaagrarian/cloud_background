const async = require('async')
const schedule = require('node-schedule')

const Database = require('./database')
const Func = require('./func')

let sendNormalIncompleteSlaesFrom2019 = schedule.scheduleJob("0 6 * * *", function() {
    console.log(Func.getDateTime() + " Scheduling sendNormalIncompleteSlaesFrom2019()")
    async.series([
        function(callback) {
            Database.getIncompleteSalesFrom2019New([1, 2, 3], callback)
        }, function(callback) {
            Database.getIncompleteSalesFrom2019New([4], callback)
        }
    ], function(err, data) {
        if (err) {
            console.log(err)
        }

        const normalSalesHTML = Func.prepareIncompleteSalesHTML(data[0])
        const agrivestSalesHTML = Func.prepareIncompleteSalesHTML(data[1])

        Func.sendMail('allcompany@randeepa.com', 'Incomplete Sales', normalSalesHTML)
        Func.sendMail('allcompany@randeepa.com', 'Incomplete Sales [AGRIVEST]', agrivestSalesHTML)
    })
})