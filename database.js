const MySql = require('./mySqlCon.js')
const Database = module.exports = {}

Database.getOverallOfficerPerformanceSummary = function(start_date, end_date, callback) {
  MySql.pool.getConnection(function(pool_err, connection) {
    if(pool_err) {
      return callback(pool_err, null)
    }

    connection.query('CALL CompanyOfficerPerformanceSummary(?, ?);', [start_date, end_date], function(err, rows, fields) {
      if(err) {
        return callback(err, null)
      } else {
        callback(err, rows)
      }
    })
  })
}


Database.getAllRegions = function(callback) {
    MySql.pool.getConnection(function(pool_err, connection) {
        if(pool_err) {
            return callback(pool_err, null)
        }

        connection.query('SELECT * FROM region WHERE active = 1', function(err, rows, fields) {
            connection.release()
            if(err) {
                return callback(err, null)
            }
            callback(err, rows)
        })
    })
}

Database.getIncompleteSalesFor20182019 = function(callback) {
    MySql.pool.getConnection(function(pool_err, connection) {
        if(pool_err) {
            return callback(pool_err, null)
        }

        connection.query('SELECT sale.id, user.name as officer, date, sys_date, DATEDIFF(NOW(), sale.sys_date) as pending_for, dealer.name as dealer_name, chassis_no, customer_name, customer_contact, sale_type.name as sale_type FROM sale LEFT JOIN dealer ON sale.location_fk = dealer.id LEFT JOIN user ON sale.officer = user.username LEFT JOIN sale_type ON sale.sale_type = sale_type.id WHERE sale_completed = 0 AND YEAR(sys_date) IN (2018, 2019) ORDER BY id DESC;', function(err, rows, fields) {
            connection.release()
            if(err) {
                return callback(err, null)
            }
            callback(err, rows)
        })
    })
}

Database.getIncompleteSalesFrom201810 = function(callback) {
    MySql.pool.getConnection(function(pool_err, connection) {
        if(pool_err) {
            return callback(pool_err, null)
        }

        connection.query('SELECT sale.id, user.name as officer, date, sys_date, DATEDIFF(NOW(), sale.sys_date) as pending_for, dealer.name as dealer_name, chassis_no, customer_name, customer_contact, sale_type.name as sale_type FROM sale LEFT JOIN dealer ON sale.location_fk = dealer.id LEFT JOIN user ON sale.officer = user.username LEFT JOIN sale_type ON sale.sale_type = sale_type.id WHERE sale_completed = 0 AND DATE(sys_date) >= \'2018-10-01\' ORDER BY id DESC;', function(err, rows, fields) {
            connection.release()
            if(err) {
                return callback(err, null)
            }
            callback(err, rows)
        })
    })
}
