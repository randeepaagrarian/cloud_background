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
