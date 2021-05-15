const nodemailer = require('nodemailer')
const args = require('yargs').argv

const Func = module.exports = {}

Func.getYesterday = function(splitter) {
    let currentTime = new Date()
    currentTime.setDate(currentTime.getDate() - 1)
    const date = ("0" + currentTime.getDate()).slice(-2)
    const month = ("0" + (currentTime.getMonth() + 1)).slice(-2)
    const year = currentTime.getFullYear()

    const now_date = year + splitter + month + splitter + date

    return now_date
}

Func.getDateTime = function() {
    const currentTime = new Date()
    const date = ("0" + currentTime.getDate()).slice(-2)
    const month = ("0" + (currentTime.getMonth() + 1)).slice(-2)
    const year = currentTime.getFullYear()

    const hour = currentTime.getHours()
    const minutes = currentTime.getMinutes()
    const seconds = currentTime.getSeconds()

    const now_date = year + '-' + month + '-' + date + ' ' + hour + ':' + minutes + ':' + seconds

    return now_date
}

Func.sendMail = function(to, subject, html) {
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
        to,
        subject,
        html,
    }

    transporter.sendMail(mailOptions, function(err) {
        if(err) {
            console.log(err)
            return false
        } else {
            return true
        }
    })
}

Func.prepareIncompleteSalesHTML = function(sales) {
    let HTMLString = "<html><head><style> body { font-family: arial, sans-serif; } table { border-collapse: collapse; width: 100%; } td, th { border: 1px solid #dddddd; text-align: left; padding: 8px; } </style></head><body>";

        HTMLString = HTMLString + "<h2 style='font-family: Arial, Helvetica, sans-serif;'>Incomplete Sales</h2>"
        HTMLString = HTMLString + "<p>There are <b>" + sales.length + "</b> incomplete sales</p>"

        HTMLString = HTMLString +  `
            <table>
                <thead>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Pending For</th>
                    <th>Model</th>
                    <th>Region</th>
                    <th>Product Group</th>
                    <th>Officer</th>
                    <th>Sale Type</th>
                    <th>Dealer</th>
                    <th>Chassis Number</th>
                    <th>Customer Name</th>
                    <th>Customer Contact</th>
                </thead>
                <tbody>`
        
        for(let i = 0; i < sales.length; i++) {
            HTMLString = HTMLString + 
                "<tr><td><a href='https://www.randeepa.cloud/sale/cloudIDInfo?cloudID=" + sales[i].id + "'>" + sales[i].id + "</a>" + "</td>" + 
                "<td>" + sales[i].sys_date + "</td>";

            if(parseInt(sales[i].pending_for) < 30) {
                HTMLString = HTMLString + "<td style='background-color: #0aad33; color: #FFFFFF;'>"
            } else if(parseInt(sales[i].pending_for) < 60) {
                HTMLString = HTMLString + "<td style='background-color: #064a17; color: #FFFFFF;'>"
            } else if(parseInt(sales[i].pending_for) < 90) {
                HTMLString = HTMLString + "<td style='background-color: #731909; color: #FFFFFF;'>"
            } else {
                HTMLString = HTMLString + "<td style='background-color: #e63415; color: #FFFFFF;'>"
            }

            HTMLString = HTMLString + sales[i].pending_for + " days</td>" + 
                "<td>" + sales[i].model_name + "</td>" + 
                "<td>" + sales[i].region + "</td>" + 
                "<td>" + sales[i].model_group + "</td>" + 
                "<td>" + sales[i].officer + "</td>" + 
                "<td>" + sales[i].sale_type + "</td>" + 
                "<td>" + sales[i].dealer_name + "</td>" + 
                "<td>" + sales[i].chassis_no + "</td>" + 
                "<td>" + sales[i].customer_name + "</td>" + 
                "<td>" + sales[i].customer_contact + "</td>" + 
            "</tr>"
        }

        HTMLString = HTMLString + "</tbody></table></body></html>"
        return HTMLString
}

Func.prepareVerifiedSalesHTML = function(sales) {
    let HTMLString = "<html><head><style> body { font-family: arial, sans-serif; } table { border-collapse: collapse; width: 100%; } td, th { border: 1px solid #dddddd; text-align: left; padding: 8px; } </style></head><body>";

        HTMLString = HTMLString + "<h2 style='font-family: Arial, Helvetica, sans-serif;'>Unverified Sales</h2>"
        HTMLString = HTMLString + "<p>There are <b>" + sales.length + "</b> unverified sales</p>"

        HTMLString = HTMLString +  `
            <table>
                <thead>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Pending For</th>
                    <th>Model</th>
                    <th>Region</th>
                    <th>Product Group</th>
                    <th>Officer</th>
                    <th>Sale Type</th>
                    <th>Dealer</th>
                    <th>Chassis Number</th>
                    <th>Customer Name</th>
                    <th>Customer Contact</th>
                </thead>
                <tbody>`
        
        for(let i = 0; i < sales.length; i++) {
            HTMLString = HTMLString + 
                "<tr><td><a href='https://www.randeepa.cloud/sale/cloudIDInfo?cloudID=" + sales[i].id + "'>" + sales[i].id + "</a>" + "</td>" + 
                "<td>" + sales[i].sys_date + "</td>";

            if(parseInt(sales[i].pending_for) < 2) {
                HTMLString = HTMLString + "<td style='background-color: #064a17; color: #FFFFFF;'>"
            } else if(parseInt(sales[i].pending_for) < 5) {
                HTMLString = HTMLString + "<td style='background-color: #731909; color: #FFFFFF;'>"
            } else {
                HTMLString = HTMLString + "<td style='background-color: #e63415; color: #FFFFFF;'>"
            }

            HTMLString = HTMLString + sales[i].pending_for + " days</td>" + 
                "<td>" + sales[i].model_name + "</td>" + 
                "<td>" + sales[i].region + "</td>" + 
                "<td>" + sales[i].model_group + "</td>" + 
                "<td>" + sales[i].officer + "</td>" + 
                "<td>" + sales[i].sale_type + "</td>" + 
                "<td>" + sales[i].dealer_name + "</td>" + 
                "<td>" + sales[i].chassis_no + "</td>" + 
                "<td>" + sales[i].customer_name + "</td>" + 
                "<td>" + sales[i].customer_contact + "</td>" + 
            "</tr>"
        }

        HTMLString = HTMLString + "</tbody></table></body></html>"
        return HTMLString
}

Func.prepareWeeklyStockReviewsHTML = function(reviews) {
    let HTMLString = "<html><head><style> body { font-family: arial, sans-serif; } table { border-collapse: collapse; width: 100%; } td, th { border: 1px solid #dddddd; text-align: left; padding: 8px; } </style></head><body>";

        HTMLString = HTMLString + "<h2 style='font-family: Arial, Helvetica, sans-serif;'>Weekly Stock Reviews</h2>"

        HTMLString = HTMLString +  `
            <table>
                <thead>
                    <th>Dealer</th>
                    <th>Region</th>
                    <th>Stock Reviews</th>
                    <th>Items</th>
                    <th>Stock Value</th>
                </thead>
                <tbody>`
        
        for(let i = 0; i < reviews.length; i++) {
            HTMLString = HTMLString + 
                "<tr><td><a href='https://www.randeepa.cloud/stock/viewStock?stockLocation=" + reviews[i].id + "'>" + reviews[i].dealer_name + "</a>" + "</td>" + 
                "<td>" + reviews[i].region + "</td>";

            if(parseInt(reviews[i].stock_reviews) == 0) {
                HTMLString = HTMLString + "<td style='background-color: #e63415; color: #FFFFFF;'>"
            } else {
                HTMLString = HTMLString + "<td>"
            }

            HTMLString = HTMLString + reviews[i].stock_reviews + " reviews</td>" + 
                "<td>" + reviews[i].items + " units</td>" + 
                "<td> " + reviews[i].stock_value.toLocaleString() + "</td>" + 
            "</tr>"
        }

        HTMLString = HTMLString + "</tbody></table></body></html>"
        return HTMLString
}

Func.prepareStocksByAgeHTML = function(stock) {
    let HTMLString = "<html><head><style> body { font-family: arial, sans-serif; } table { border-collapse: collapse; width: 100%; } td, th { border: 1px solid #dddddd; text-align: left; padding: 8px; } </style></head><body>";

        HTMLString = HTMLString + "<h2 style='font-family: Arial, Helvetica, sans-serif;'>Stocks By Age</h2>"

        HTMLString = HTMLString +  `
            <table>
                <thead>
                    <th>Location</th>
                    <th>Product Group</th>
                    <th>Model</th>
                    <th>< 30</th>
                    <th>30 - 60</th>
                    <th>60 - 90</th>
                    <th>90+</th>
                </thead>
                <tbody>`
        
        for(let i = 0; i < stock.length; i++) {
            HTMLString = HTMLString + 
                "<tr><td><a href='https://www.randeepa.cloud/stock/viewStock?stockLocation=" + stock[i].dealer_id + "'>" + stock[i].dealer_name + "</a>" + "</td>" + 
                "<td>" + stock[i].model_group + "</td>" +
                "<td>" + stock[i].model_name + "</td>";

            if(parseInt(stock[i].less_than_30) > 0) {
                HTMLString = HTMLString + "<td style='background-color: #0aad33; color: #FFFFFF;'>" + stock[i].less_than_30 + "</td>"
            } else {
                HTMLString = HTMLString + "<td>" + stock[i].less_than_30 + "</td>"
            } 
            
            if(parseInt(stock[i].less_than_60) > 0) {
                HTMLString = HTMLString + "<td style='background-color: #064a17; color: #FFFFFF;'>" + stock[i].less_than_60 + "</td>"
            } else {
                HTMLString = HTMLString + "<td>" + stock[i].less_than_60 + "</td>"
            } 
            
            if(parseInt(stock[i].less_than_90) > 0) {
                HTMLString = HTMLString + "<td style='background-color: #731909; color: #FFFFFF;'>" + stock[i].less_than_90 + "</td>"
            } else {
                HTMLString = HTMLString + "<td>" + stock[i].less_than_90 + "</td>"
            }
            
            if (parseInt(stock[i].greater_than_90) > 0) {
                HTMLString = HTMLString + "<td style='background-color: #e63415; color: #FFFFFF;'>" + stock[i].greater_than_90 + "</td>"
            } else {
                HTMLString = HTMLString + "<td>" + stock[i].greater_than_90 + "</td>"
            }

            HTMLString = HTMLString + "</tr>"
        }

        HTMLString = HTMLString + "</tbody></table></body></html>"
        return HTMLString
}

Func.preparePendingServicesHTML = function(sales) {
    let HTMLString = "<html><head><style> body { font-family: arial, sans-serif; } table { border-collapse: collapse; width: 100%; } td, th { border: 1px solid #dddddd; text-align: left; padding: 8px; } </style></head><body>";

        HTMLString = HTMLString + "<h2 style='font-family: Arial, Helvetica, sans-serif;'>Pending Services</h2>"
        HTMLString = HTMLString + "<p>There are <b>" + sales.length + "</b> pending services</p>"

        HTMLString = HTMLString +  `<table><thead>
            <th>ID</th> 
            <th>Date</th> 
            <th>Pending For</th> 
            <th>Issue</th> 
            <th>Technician</th> 
            <th>Sale Date</th> 
            <th>Model</th>  
            <th>Region</th>  
            <th>Product Group</th>  
            <th>Chassis No</th> 
            <th>Customer Name</th> 
            <th>Customer Contact</th>
        </thead> <tbody>`
        for(let i = 0; i < sales.length; i++) {
            if(i % 2 == 0) {
                HTMLString = HTMLString + "<tr style='background-color: #f2f2f2;'>"
            } else {
                HTMLString = HTMLString + "<tr style='background: #FFF;'>"
            }
            HTMLString = HTMLString + 
                "<td><a href='https://www.randeepa.cloud/service/serviceInfo?serviceID="+sales[i].id+"'>"+sales[i].id+"</a>" + "</td><td>" 
                + sales[i].date + "</td><td><font color='red'>" + sales[i].days + " days</font></td><td>" + sales[i].issue + "</td><td>" 
                + sales[i].technician_name + "</td><td>" 
                + sales[i].s_sale_date + "</td><td>" 
                + sales[i].s_model_name + "</td><td>" 
                + sales[i].region_name + "</td><td>" 
                + sales[i].model_group + "</td><td>" 
                + sales[i].s_chassis_no + "</td><td>" 
                + sales[i].s_customer_name + "</td><td>" 
                + sales[i].s_customer_contact + "</td></tr>"
        }

        HTMLString = HTMLString + "</tbody></table></body></html>"

        return HTMLString
}