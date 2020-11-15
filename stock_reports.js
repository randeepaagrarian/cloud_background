const async = require('async')
const schedule = require('node-schedule')

const Database = require('./database')
const Func = require('./func')

let sendWeeklyStockReviewsReport = schedule.scheduleJob("0 6 * * 1", function() {
    console.log(Func.getDateTime() + " Scheduling sendWeeklyStockReviewsReport()")
    async.series([
        function(callback) {
            Database.stockReviewsByDealer(7, callback)
        }
    ], function(err, data) {
        if (err) {
            console.log(err)
        }

        let WeeklyStockReviewsHTML = Func.prepareWeeklyStockReviewsHTML(data[0])

        Func.sendMail('allcompany@randeepa.com', 'Weekly Stock Reviews', WeeklyStockReviewsHTML)
    })
})

let sendInterimWeeklyStockReviewsReport = schedule.scheduleJob("30 16 * * 5", function() {
    console.log(Func.getDateTime() + " Scheduling sendInterimWeeklyStockReviewsReport()")
    async.series([
        function(callback) {
            Database.stockReviewsByDealer(4, callback)
        }
    ], function(err, data) {
        if (err) {
            console.log(err)
        }

        let WeeklyStockReviewsHTML = Func.prepareWeeklyStockReviewsHTML(data[0])

        Func.sendMail('allcompany@randeepa.com', 'Interim Weekly Stock Reviews', WeeklyStockReviewsHTML)
    })
})

let sendStocksByAgeReport = schedule.scheduleJob("0 6 * * 1", function() {
    console.log(Func.getDateTime() + " Scheduling sendStocksByAgeReport()")
    async.series([
        function(callback) {
            Database.stocksByAge([1], callback)
        }, function(callback) {
            Database.stocksByAge([2], callback)
        }, function(callback) {
            Database.stocksByAge([3], callback)
        }
    ], function(err, data) {
        if (err) {
            console.log(err)
        }

        let yardsStockByAgeHTML = Func.prepareStocksByAgeHTML(data[0])
        let dealersStockByAgeHTML = Func.prepareStocksByAgeHTML(data[1])
        let showroomsStockByAgeHTML = Func.prepareStocksByAgeHTML(data[2])

        Func.sendMail('allcompany@randeepa.com', 'Stocks by Age [Yards]', yardsStockByAgeHTML)
        Func.sendMail('allcompany@randeepa.com', 'Stocks by Age [Dealers]', dealersStockByAgeHTML)
        Func.sendMail('allcompany@randeepa.com', 'Stocks by Age [Showrooms]', showroomsStockByAgeHTML)
    })
})