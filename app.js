const async = require('async')
const fs = require('fs')
const nodemailer = require('nodemailer')
const schedule = require('node-schedule')
const request = require('request')

const Database = require('./database')
const Func = require('./func')

const args = require('yargs').argv

let reportScheduler = new schedule.RecurrenceRule()

reportScheduler.second = 0
reportScheduler.minute = 0
reportScheduler.hour = 6

require('./incomplete_sales')
require('./stock_reports')
require('./services_reports')

let sendTaskReport = schedule.scheduleJob(reportScheduler, function() {
    console.log(Func.getDateTime() + " Scheduling sendTaskReport()")
    async.series([
        function(callback) {
            Database.getOverallOfficerPerformanceSummary(Func.getYesterday('-'), Func.getYesterday('-'), callback)
        }, function(callback) {
            Database.getAllRegions(callback)
        }
    ], function(err, data) {

        const profiles = data[0][0]
        const regions = data[1]

        let HTMLString = "<html><head><style> body { font-family: arial, sans-serif; } table { border-collapse: collapse; width: 100%; } td, th { border: 1px solid #dddddd; text-align: left; padding: 8px; } </style></head><body>"

        HTMLString = HTMLString + "<h4>Daily Task Summary for " + Func.getYesterday('-') + "</h4>"

        HTMLString = HTMLString +  "<table><thead> <th>Officer</th> <th>Region</th> <th>Territory</th> <th>Sales Units</th> <th>Dealer Visits</th> <th>Sales Value</th> <th>Bankings</th> <th>Institute/Other Visits</th> <th>Stock Reports</th> <th>Dealer Inquiries</th> <th>Field Visits</th> <th>Field Visit Inquiries</th> </thead> <tbody>"

        for(let i = 0; i < regions.length; i++) {
            let sales_units = 0, dealer_visits = 0, sales_value = 0, bankings = 0, ins_other_vists = 0, stock_reports = 0, dealer_inquiries = 0, field_visits = 0, field_visit_inquiries = 0
            HTMLString = HTMLString + "<tr style='background-color: #eeeeee;'> <td><b>" + regions[i].name + "</b></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> </tr>"

            for(let j = 0; j < profiles.length; j++) {
                if(profiles[j].region_name == regions[i].name) {
                    sales_units = sales_units + profiles[j].sales_units
                    dealer_visits = dealer_visits + profiles[j].dealer_visits
                    sales_value = sales_value + profiles[j].sales_value
                    bankings = bankings + profiles[j].bankings
                    ins_other_vists = ins_other_vists + profiles[j].institute_and_other_visits
                    stock_reports = stock_reports + profiles[j].stock_reports
                    dealer_inquiries = dealer_inquiries + profiles[j].dealer_inquiries
                    field_visits = field_visits + profiles[j].field_visits
                    field_visit_inquiries = field_visit_inquiries + profiles[j].field_visit_inquiries

                    HTMLString = HTMLString + "<tr> <td> " + profiles[j].name + "</td> <td>" + profiles[j].region_name + "</td> <td>" + profiles[j].territory_name + "</td> <td>" + profiles[j].sales_units + "</td> <td>" + profiles[j].dealer_visits + "</td> <td>" + profiles[j].sales_value + "</td> <td>" + profiles[j].bankings + "</td> <td>" + profiles[j].institute_and_other_visits + "</td> <td>" + profiles[j].stock_reports + "</td> <td>" + profiles[j].dealer_inquiries + "</td> <td>" + profiles[j].field_visits + "</td> <td>" + profiles[j].field_visit_inquiries + "</td> </tr>"

                }
            }

            HTMLString = HTMLString + "<tr> <td>Total</td> <td></td> <td></td> <td><b>" + sales_units + "</b></td> <td><b>" + dealer_visits + "</b></td> <td><b>" + sales_value + "</b></td> <td><b>" +  bankings + "</b></td> <td><b>" + ins_other_vists + "</b></td> <td><b>" + stock_reports + "</b></td> <td><b>" + dealer_inquiries + "</b></td> <td><b>" + field_visits + "</b></td> <td><b>" + field_visit_inquiries + "</b></td> </tr>"

        }

        HTMLString = HTMLString + "</tbody></table></body></html>"

        let transporter = nodemailer.createTransport({
            host: 'smtp.zoho.com',
            port: 465,
            secure: true,
            auth: {
                user: 'admin@randeepa.cloud',
                pass: args.adminEmailPassword
            }
        })

        const mailOptions = {
            from: 'Randeepa Cloud <admin@randeepa.cloud>',
            // to: 'allcompany@randeepa.com, dimuthu@randeepa.com, rukmalpolo@gmail.com, samantha@randeepa.com, erangarandeepa@gmail.com',
            to: 'allcompany@randeepa.com',
            subject: 'Daily Task Summary for ' + Func.getYesterday('-'),
            html: HTMLString
        }

        transporter.sendMail(mailOptions, function(err) {
            if(err) {
                console.log(err)
            } else {
                console.log(Func.getDateTime() + " sendTaskReport() complete")
            }
        })

    })
})

let sendUnauditedStockReviews = schedule.scheduleJob(reportScheduler, function() {
    console.log(Func.getDateTime() + " Scheduling sendUnauditedStockReviews()")
    async.series([
        function(callback) {
            Database.getUnauditedStockReviews(callback)
        }
    ], function(err, data) {

        const sales = data[0]

        let HTMLString = "<html><head><style> body { font-family: arial, sans-serif; } table { border-collapse: collapse; width: 100%; } td, th { border: 1px solid #dddddd; text-align: left; padding: 8px; } </style></head><body>";

        HTMLString = HTMLString + "<h2 style='font-family: Arial, Helvetica, sans-serif;'>Unaudited Stock Reviews</h2>"
        HTMLString = HTMLString + "<p>There are <b>" + sales.length + "</b> unaudited stock reviews</p>"

        HTMLString = HTMLString +  `<table><thead> 
            <th>ID</th> 
            <th>Added</th> 
            <th>User</th> 
            <th>Dealer</th> 
            <th>Picture</th>
            <th>Remark</th>
        </thead> <tbody>`
        for(let i = 0; i < sales.length; i++) {
            if(i % 2 == 0) {
                HTMLString = HTMLString + "<tr style='background-color: #f2f2f2;'>"
            } else {
                HTMLString = HTMLString + "<tr style='background: #FFF;'>"
            }
            HTMLString = HTMLString + 
                "<td>" + sales[i].id + "</td><td>" 
                + sales[i].created + "</td><td>" 
                + sales[i].user + `</td><td><a href="https://www.randeepa.cloud/stock/viewStock?stockLocation=` + sales[i].dealer_id + `">` 
                + sales[i].dealer + `</a></td><td><a href="` + sales[i].picture + `">`
                + "Image</a></td><td>" 
                + sales[i].remark + "</td>" 
                + "</tr>"
        }

        HTMLString = HTMLString + "</tbody></table></body></html>"

        let transporter = nodemailer.createTransport({
            host: 'smtp.zoho.com',
            port: 465,
            secure: true,
            auth: {
                user: 'admin@randeepa.cloud',
                pass: args.adminEmailPassword
            }
        })

        const mailOptions = {
            from: 'Randeepa Cloud <admin@randeepa.cloud>',
            // to: 'allcompany@randeepa.com, Viraj.randeepa@gmail.com, erangarandeepa@gmail.com, samantha@randeepa.com, rukmalpolo@gmail.com',
            to: 'allcompany@randeepa.com',
            subject: 'Unaudited Stock Reviews',
            html: HTMLString
        }

        transporter.sendMail(mailOptions, function(err) {
            if(err) {
                console.log(err)
            } else {
                console.log(Func.getDateTime() + " sendUnauditedStockReviews() complete")
            }
        })
    })
})
