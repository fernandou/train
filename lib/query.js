const chalk = require('chalk')
const columnify = require('columnify')
const { getStationCode, formatPrice, web_request, formatRaw } = require('./util.js')

const log = console.log
const chalkTitle = chalk.hex('#f4b14c').bold
const headingTransform = function (heading) {
  return chalkTitle(`${headers[heading]}\n------`)
}

const headers = {
  transCode: '车次',
  fromStation: '出发站',
  toStation: '到达站',
  startTime: '出发时',
  arriveTime: '到达时',
  lishi: '历时',
  swzNum: '商务座',
  ydzNum: '一等座',
  edzNum: '二等座',
  rwNum: '软卧',
  ywNum: '硬卧',
  yzNum: '硬座',
  wzNum: '无座'
}

const printAble = function (num) {
  if (num === '无' || num === '--' || num === '*') {
    return chalk.gray(num)
  } else if (num === '有') {
    return chalk.green(num)
  }
  return num
}

const printPrice = function (num, val) {
  if (num === '无' || num === '--' || num === '*' || !val) {
    return ''
  }
  return ' ' + val
}

const printInfo = function (item) {
  return {
    transCode: item.station_train_code,
    fromStation: item.from_station_name,
    toStation: item.to_station_name,
    startTime: item.start_time,
    arriveTime: item.arrive_time,
    lishi: item.lishi,
    swzNum: printAble(item.swz_num) + printPrice(item.swz_num, item.priceObject.A9),
    ydzNum: printAble(item.zy_num) + printPrice(item.zy_num, item.priceObject.M),
    edzNum: printAble(item.ze_num) + printPrice(item.ze_num, item.priceObject.O),
    rwNum: printAble(item.rw_num) + printPrice(item.rw_num, item.priceObject.A4),
    ywNum: printAble(item.yw_num) + printPrice(item.yw_num, item.priceObject.A3),
    yzNum: printAble(item.yz_num) + printPrice(item.yz_num, item.priceObject.A1),
    wzNum: printAble(item.wz_num)
  }
}

const renderTable = (data) => {
  const columnConfig = {}
  Object.keys(headers).forEach(k => {
    columnConfig[k] = { headingTransform }
  })
  log(columnify(data, {
    columnSplitter: chalk.gray(' | '),
    config: columnConfig
  }) + '\n')
}

const query = function (from, to, time, train, options) {
  const frmCode = getStationCode(from)
  const toCode = getStationCode(to)
  if (!frmCode || !toCode) {
    log(chalk.red('车站输入错误'))
  } else {
    web_request(frmCode[1], toCode[1], time).then((res) => {
      res = res.data
      let resData = formatRaw(res.data.result, res.data.map)
      resData.forEach((item) => {
        const station_train_type = item.station_train_code.substr(0, 1)
        let yp_info_new = item.yp_info_new
        if (station_train_type === 'G' || station_train_type === 'D') {
          if (yp_info_new.length === 10) {
            if (yp_info_new.substr(0, 1) === '9') {
              yp_info_new += '0000000000' + '0000000000'
            } else if (yp_info_new.substr(0, 1) === 'M') {
              yp_info_new = '0000000000' + yp_info_new + '0000000000'
            } else if (yp_info_new.substr(0, 1) === 'M') {
              yp_info_new = '0000000000' + '0000000000' + yp_info_new
            }
          } else if (yp_info_new.length === 30) {
            //
          }
          const A9PriceCode = yp_info_new.substr(0, 10)
          const MPriceCode = yp_info_new.substr(10, 10)
          const OPriceCode = yp_info_new.substr(20, 10)
          item.priceObject = {
            A9: '',
            M: '',
            O: '',
            A4: '',
            A3: '',
            A1: ''
          }
          const priceCodeArray = [A9PriceCode, MPriceCode, OPriceCode]
          priceCodeArray.forEach((_item) => {
            if (_item.substr(0, 1) === '9') {
              item.priceObject.A9 = formatPrice(_item.substr(1, 5))
            }
            if (_item.substr(0, 1) === 'M') {
              item.priceObject.M = formatPrice(_item.substr(1, 5))
            }
            if (_item.substr(0, 1) === 'O') {
              item.priceObject.O = formatPrice(_item.substr(1, 5))
            }
          })
        } else {
          const A1PriceCode = yp_info_new.substr(0, 10)
          const A3PriceCode = yp_info_new.substr(10, 10)
          const A4PriceCode = yp_info_new.substr(20, 10)
          item.priceObject = {
            A9: '',
            M: '',
            O: '',
            A4: '',
            A3: '',
            A1: ''
          }
          const priceCodeArray = [A1PriceCode, A3PriceCode, A4PriceCode]
          priceCodeArray.forEach((_item) => {
            if (_item.substr(0, 1) === '1') {
              item.priceObject.A1 = formatPrice(_item.substr(1, 5))
            }
            if (_item.substr(0, 1) === '3') {
              item.priceObject.M = formatPrice(_item.substr(1, 5))
            }
            if (_item.substr(0, 1) === '4') {
              item.priceObject.O = formatPrice(_item.substr(1, 5))
            }
          })
        }
      })
      resData = resData.filter((item) => {
        return train.indexOf(item.station_train_code.substr(0, 1)) > -1
      })

      if (options.lishi) {
        resData.sort((a, b) => {
          return parseInt(a.lishi.replace(':', '')) - parseInt(b.lishi.replace(':', ''))
        })
      }

      resData = resData.map((item) => {
        return printInfo(item)
      })

      renderTable(resData)
    })
  }
}

module.exports = query
