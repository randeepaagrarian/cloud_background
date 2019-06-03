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
