const async = require('async')
const schedule = require('node-schedule')

const Database = require('./database')
const Func = require('./func')

let sendPendingServicesReport = schedule.scheduleJob("0 6 * * *", function() {
    console.log(Func.getDateTime() + " Scheduling sendPendingServicesReport()")
    async.series([
        function(callback) {
            Database.getPendingServices(callback)
        }
    ], function(err, data) {
        if (err) {
            console.log(err)
        }

        let pendingServicesHTML = Func.preparePendingServicesHTML(data[0])
        console.log(pendingServicesHTML)

        Func.sendMail('allcompany@randeepa.com', 'Pending Services', pendingServicesHTML)
    })
})