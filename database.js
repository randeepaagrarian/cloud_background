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

Database.getIncompleteSalesFrom201806 = function(callback) {
    MySql.pool.getConnection(function(pool_err, connection) {
        if(pool_err) {
            return callback(pool_err, null)
        }

        connection.query('SELECT sale.id, user.name as officer, date, sys_date, DATEDIFF(NOW(), sale.sys_date) as pending_for, dealer.name as dealer_name, chassis_no, customer_name, customer_contact, sale_type.name as sale_type FROM sale LEFT JOIN dealer ON sale.location_fk = dealer.id LEFT JOIN user ON sale.officer = user.username LEFT JOIN sale_type ON sale.sale_type = sale_type.id WHERE sale_completed = 0 AND DATE(sys_date) >= \'2018-06-01\' AND DATE(sys_date) <= \'2020-10-18\' AND sale.deleted = 0 ORDER BY id ASC;', function(err, rows, fields) {
            connection.release()
            if(err) {
                return callback(err, null)
            }
            callback(err, rows)
        })
    })
}

Database.getIncompleteSalesNewManagement = function(callback) {
    MySql.pool.getConnection(function(pool_err, connection) {
        if(pool_err) {
            return callback(pool_err, null)
        }

        connection.query('SELECT sale.id, user.name as officer, date, sys_date, DATEDIFF(NOW(), sale.sys_date) as pending_for, dealer.name as dealer_name, chassis_no, customer_name, customer_contact, sale_type.name as sale_type FROM sale LEFT JOIN dealer ON sale.location_fk = dealer.id LEFT JOIN user ON sale.officer = user.username LEFT JOIN sale_type ON sale.sale_type = sale_type.id WHERE sale_completed = 0 AND DATE(sys_date) >= \'2020-10-19\' AND sale.deleted = 0 ORDER BY id ASC;', function(err, rows, fields) {
            connection.release()
            if(err) {
                return callback(err, null)
            }
            callback(err, rows)
        })
    })
}

Database.getPendingServices = function(callback) {
    MySql.pool.getConnection(function(pool_err, connection) {
        if(pool_err) {
            return callback(pool_err, null)
        }

        connection.query('SELECT SR.id, SR.date, SR.issue, SR.sale_id, SR.sale_date, S.sys_date as s_sale_date, SR.chassis_no, S.chassis_no as s_chassis_no, SR_M.name as model_name, S_M.name as s_model_name, SR.meter, SR.meter_type, SR.customer_name, S.customer_name as s_customer_name, SR.customer_contact, S.customer_contact as s_customer_contact, SR.current_address, S.customer_address as s_customer_address, SR_D.name as dealer_name, S_D.name as s_dealer_name, U.name as technician_name, SR.work_sheet, SR.technician_allocated, SR.service_completed, SR.service_completed_on, IF(SR.service_completed = 0, DATEDIFF(NOW(), SR.date), DATEDIFF(SR.service_completed_on, SR.date)) as days FROM service SR LEFT JOIN sale S ON S.id = SR.sale_id LEFT JOIN dealer SR_D ON SR.dealer_id = SR_D.id LEFT JOIN dealer S_D ON S.location_fk = S_D.id LEFT JOIN model SR_M ON SR.model_id = SR_M.id LEFT JOIN model S_M on S.model = S_M.id LEFT JOIN user U ON SR.technician_id = U.username WHERE DATE(SR.date) > \'2019-06-01\' AND service_completed = 0 ORDER BY SR.date ASC;', function(err, rows, fields) {
            connection.release()
            if(err) {
                return callback(err, null)
            }
            callback(err, rows)
        })
    })
}

Database.getPendingServicesByTechnician = function(callback) {
    MySql.pool.getConnection(function(pool_err, connection) {
        if(pool_err) {
            return callback(pool_err, null)
        }

        connection.query('SELECT U.name as technician_name, U.telephone, GROUP_CONCAT(S.id) service_ids FROM service S LEFT JOIN user U ON S.technician_id = U.username WHERE DATE(S.date) > \'2019-06-01\' AND S.service_completed = 0 AND U.name IS NOT NULL AND U.telephone IS NOT NULL GROUP BY technician_name, U.telephone', function(err, rows, fields) {
            connection.release()
            if(err) {
                return callback(err, null)
            }
            callback(err, rows)
        })
    })
}

Database.getUnauditedStockReviews = function(callback) {
    MySql.pool.getConnection(function(pool_err, connection) {
        if(pool_err) {
            return callback(pool_err, null)
        }

        connection.query('SELECT SR.id, SR.created, U.name AS user, SR.dealer_id, D.name AS dealer, SR.remark, SR.picture, SR.audited FROM stock_review SR LEFT JOIN user U ON U.username = SR.username LEFT JOIN dealer D ON D.id = SR.dealer_id WHERE audited = 0 ORDER BY SR.created DESC', function(err, rows, fields) {
            connection.release()
            if(err) {
                return callback(err, null)
            }
            callback(err, rows)
        })
    })
}