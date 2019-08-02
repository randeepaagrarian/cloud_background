const async = require('async')
const fs = require('fs')
const nodemailer = require('nodemailer')
const schedule = require('node-schedule')

const Database = require('./database')
const Func = require('./func')

const args = require('yargs').argv

let taskReportScheduler = new schedule.RecurrenceRule()
let incompleteSalesReportScheduler = new schedule.RecurrenceRule()

taskReportScheduler.second = 0
taskReportScheduler.minute = 0
taskReportScheduler.hour = 6

incompleteSalesReportScheduler.second = 0
incompleteSalesReportScheduler.minute = 0
incompleteSalesReportScheduler.hour = 6

let sendTaskReport = schedule.scheduleJob(taskReportScheduler, function() {
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
            to: 'shamal@randeepa.com, dimuthu@randeepa.com',
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

let sendIncompleteSalesReport = schedule.scheduleJob(incompleteSalesReportScheduler, function() {
    console.log(Func.getDateTime() + " Scheduling sendIncompleteSalesReport()")
    async.series([
        function(callback) {
            Database.getIncompleteSalesFrom201806(callback)
        }
    ], function(err, data) {

        const sales = data[0]

        let HTMLString = "<html><head><style> body { font-family: arial, sans-serif; } table { border-collapse: collapse; width: 100%; } td, th { border: 1px solid #dddddd; text-align: left; padding: 8px; } </style></head><body>";

        HTMLString = HTMLString + "<h4>Incomplete Sales from 2018-06</h4>"
        HTMLString = HTMLString + "<p>There are <b>" + sales.length + "</b> incomplete sales from 2018-06</p>"

        HTMLString = HTMLString +  "<table><thead> <th>ID</th> <th>Officer</th> <th>Date</th> <th>Cloud Date</th> <th>Pending For</th> <th>Dealer Name</th> <th>Chassis No</th> <th>Customer Name</th> <th>Customer Contact</th> <th>Sale Type</th> </thead> <tbody>"
        for(let i = 0; i < sales.length; i++) {
            HTMLString = HTMLString + "<tr><td>" + sales[i].id + "</td><td>" + sales[i].officer + "</td><td>" + sales[i].date + "</td><td>" + sales[i].sys_date + "</td><td>" + sales[i].pending_for + " days</td><td>" + sales[i].dealer_name + "</td><td>" + sales[i].chassis_no + "</td><td>" + sales[i].customer_name + "</td><td>" + sales[i].customer_contact + "</td><td>" + sales[i].sale_type + "</td></tr>"
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
            to: 'shamal@randeepa.com, dimuthu@randeepa.com, berty.randeepa@gmail.com, muditha@randeepa.com, prasad.randeepa@gmail.com, manukarandeepa@gmail.com, madushika.randeepa97@gmail.com',
            subject: 'Incomplete Sales from 2018-09',
            html: HTMLString
        }

        transporter.sendMail(mailOptions, function(err) {
            if(err) {
                console.log(err)
            } else {
                console.log(Func.getDateTime() + " sendIncompleteSalesReport() complete")
            }
        })
    })
})
