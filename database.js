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

Database.getPendingServices = function(callback) {
    MySql.pool.getConnection(function(pool_err, connection) {
        if(pool_err) {
            return callback(pool_err, null)
        }

        connection.query(`SELECT SR.id, SR.date, SR.issue, SR.sale_id, COALESCE(S.sys_date, SR.sale_date) as s_sale_date, SR.chassis_no, COALESCE(S.chassis_no, 'N/A') as s_chassis_no, SR_M.name as model_name, COALESCE(S_M.name, SR_M.name) as s_model_name, R.name as region_name, MG.name AS model_group, SR.meter, SR.meter_type, SR.customer_name, S.customer_name as s_customer_name, SR.customer_contact, S.customer_contact as s_customer_contact, SR.current_address, S.customer_address as s_customer_address, SR_D.name as dealer_name, S_D.name as s_dealer_name, COALESCE(U.name, 'N/A') as technician_name, SR.work_sheet, SR.technician_allocated, SR.service_completed, IF(SR.service_completed = 0, DATEDIFF(NOW(), SR.date), DATEDIFF(SR.service_completed_on, SR.date)) as days 
        FROM service SR 
        LEFT JOIN sale S ON S.id = SR.sale_id 
        LEFT JOIN region R ON R.id = S.region
        LEFT JOIN dealer SR_D ON SR.dealer_id = SR_D.id 
        LEFT JOIN dealer S_D ON S.location_fk = S_D.id 
        LEFT JOIN model SR_M ON SR.model_id = SR_M.id 
        LEFT JOIN model S_M on S.model = S_M.id 
        LEFT JOIN model_group MG ON MG.id = S_M.model_group_id
        LEFT JOIN user U ON SR.technician_id = U.username 
        WHERE DATE(SR.date) > '2019-06-01' AND service_completed = 0 
        ORDER BY SR.date ASC`, function(err, rows, fields) {
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

Database.getIncompleteSalesFrom2019New = function(types, callback) {
    MySql.pool.getConnection(function(pool_err, connection) {
        if(pool_err) {
            return callback(pool_err, null)
        }

        connection.query(`
            SELECT sale.id, sys_date, DATEDIFF(NOW(), sale.sys_date) as pending_for, M.name AS model_name, R.name as region, MG.name AS model_group, user.name as officer, sale_type.name as sale_type, dealer.name as dealer_name, chassis_no, customer_name, customer_contact 
            FROM sale 
            LEFT JOIN dealer ON sale.location_fk = dealer.id 
            LEFT JOIN model M ON M.id = sale.model
            LEFT JOIN model_group MG ON MG.id = M.model_group_id
            LEFT JOIN region R ON R.id = sale.region
            LEFT JOIN user ON sale.officer = user.username 
            LEFT JOIN sale_type ON sale.sale_type = sale_type.id 
            WHERE sale_completed = 0 AND DATE(sys_date) >= '2019-01-01' AND sale.deleted = 0 AND sale.sale_type IN (?)
            ORDER BY region ASC, model_group ASC;
        `, [types], function(err, rows, fields) {
            connection.release()
            if(err) {
                return callback(err, null)
            }
            callback(err, rows)
        })
    })
}

Database.stockReviewsByDealer = function(back_days, callback) {
    MySql.pool.getConnection(function(pool_err, connection) {
        if(pool_err) {
            return callback(pool_err, null)
        }

        connection.query(`
            SELECT D.id, D.name AS dealer_name, R.name AS region, COALESCE(SR.stock_reviews, 0) AS stock_reviews, COUNT(model.name) AS items, SUM(price) AS stock_value
            FROM main_stock 
            LEFT JOIN model ON main_stock.model_id = model.id 
            LEFT JOIN delivery_document ON main_stock.delivery_document_id = delivery_document.id 
            LEFT JOIN dealer D ON D.id = delivery_document.dealer_id
            LEFT JOIN territory T ON T.id = D.territory_id
            LEFT JOIN region R ON R.id = T.region_id
            LEFT JOIN (SELECT SR.dealer_id, COUNT(id) AS stock_reviews
            FROM stock_review SR
            WHERE DATE(created) BETWEEN DATE_SUB(CURDATE(), INTERVAL ? DAY) AND CURDATE()
            GROUP BY SR.dealer_id) SR ON SR.dealer_id = D.id
            WHERE sold = 0
            GROUP BY D.id, dealer_name, region, SR.stock_reviews
            ORDER BY region ASC, stock_reviews ASC;
        `, [back_days], function(err, rows, fields) {
            connection.release()
            if(err) {
                return callback(err, null)
            }
            callback(err, rows)
        })
    })
}

Database.stocksByAge = function(location_type, callback) {
    MySql.pool.getConnection(function(pool_err, connection) {
        if(pool_err) {
            return callback(pool_err, null)
        }

        connection.query(`
            SELECT dealer.id AS dealer_id, dealer.name AS dealer_name, MG.name as model_group, model.name AS model_name, COUNT(IF(DATEDIFF(CURDATE(), DATE(DD.date)) < 30, 1, NULL)) AS less_than_30, COUNT(IF(DATEDIFF(CURDATE(), DATE(DD.date)) >= 30 AND DATEDIFF(CURDATE(), DATE(DD.date)) < 60, 1, NULL)) AS less_than_60, COUNT(IF(DATEDIFF(CURDATE(), DATE(DD.date)) >= 60 AND DATEDIFF(CURDATE(), DATE(DD.date)) < 90, 1, NULL)) AS less_than_90, COUNT(IF(DATEDIFF(CURDATE(), DATE(DD.date)) >= 90, 1, NULL)) AS greater_than_90
            FROM main_stock 
            LEFT JOIN model ON main_stock.model_id = model.id 
            LEFT JOIN model_group MG ON MG.id = model.model_group_id
            LEFT JOIN delivery_document DD ON main_stock.delivery_document_id = DD.id 
            LEFT JOIN dealer ON dealer.id = DD.dealer_id
            WHERE sold = 0 AND dealer.dealer_type_id IN (?)
            GROUP BY model_name, dealer_id, model_group
            ORDER BY model_group ASC;
        `, [location_type], function(err, rows, fields) {
            connection.release()
            if(err) {
                return callback(err, null)
            }
            callback(err, rows)
        })
    })
}