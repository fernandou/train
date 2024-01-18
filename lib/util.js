const stationsArr = require('./stations').split('@')
const axios = require('axios')

exports.getStationCode = function (stationKey) {
  let arr
  for (let i = 1, l = stationsArr.length; i < l; i++) {
    arr = stationsArr[i].split('|')
    if (arr.indexOf(stationKey) > -1) {
      return [arr[1], arr[2]]
    }
  }
  return null
}

exports.formatPrice = (fiveNumber) => {
  // 票价读取5位数
  let price = ''
  if (fiveNumber.substr(0, 1) !== '0') {
    price = fiveNumber.substr(0, 4) + '.' + fiveNumber.substr(4, 1)
  } else if (fiveNumber.substr(1, 1) !== '0') {
    price = fiveNumber.substr(1, 3) + '.' + fiveNumber.substr(4, 1)
  } else if (fiveNumber.substr(2, 1) !== '0') {
    price = fiveNumber.substr(2, 2) + '.' + fiveNumber.substr(4, 1)
  } else if (fiveNumber.substr(3, 1) !== '0') {
    price = fiveNumber.substr(3, 1) + '.' + fiveNumber.substr(4, 1)
  }
  return '¥' + price
}

exports.web_request = function (from, to, queryDate, train, options) {
  const url = `https://kyfw.12306.cn/otn/leftTicket/query?leftTicketDTO.train_date=${queryDate}&leftTicketDTO.from_station=${from}&leftTicketDTO.to_station=${to}&purpose_codes=ADULT`
  return axios.get(url, {
    headers: {
      Cookie: '_jc_save_fromDate=' + queryDate
      // 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36'
    }
  })
}

exports.formatRaw = function (data, mapStation) {
  const container = []
  for (let i = 0; i < data.length; i++) {
    const raw = data[i].split('|')
    const info = {}
    info.train_no = raw[2]
    info.station_train_code = raw[3]
    info.start_station_telecode = raw[4]
    info.end_station_telecode = raw[5]
    info.from_station_telecode = raw[6]
    info.to_station_telecode = raw[7]
    info.start_time = raw[8]
    info.arrive_time = raw[9]
    info.lishi = raw[10]
    info.yp_info = raw[12]
    info.start_train_date = raw[13]
    info.train_seat_feature = raw[14]
    info.location_code = raw[15]
    info.from_station_no = raw[16]
    info.to_station_no = raw[17]
    info.is_support_card = raw[18]
    info.gg_num = raw[20] ? raw[20] : '--'
    info.gr_num = raw[21] ? raw[21] : '--'
    info.qt_num = raw[22] ? raw[22] : '--'
    info.rw_num = raw[23] ? raw[23] : '--'
    info.rz_num = raw[24] ? raw[24] : '--'
    info.tz_num = raw[25] ? raw[25] : '--'
    info.wz_num = raw[26] ? raw[26] : '--'
    info.yb_num = raw[27] ? raw[27] : '--'
    info.yw_num = raw[28] ? raw[28] : '--'
    info.yz_num = raw[29] ? raw[29] : '--'
    info.ze_num = raw[30] ? raw[30] : '--'
    info.zy_num = raw[31] ? raw[31] : '--'
    info.swz_num = raw[32] ? raw[32] : '--'
    info.srrb_num = raw[33] ? raw[33] : '--'
    info.yp_ex = raw[34]
    info.seat_types = raw[35]
    info.exchange_train_flag = raw[36]
    info.houbu_train_flag = raw[37]
    info.houbu_seat_limit = raw[38]
    info.yp_info_new = raw[39]
    if (raw.length > 46) {
      info.dw_flag = raw[46]
    }
    if (raw.length > 48) {
      info.stopcheckTime = raw[48]
    }
    info.from_station_name = mapStation[raw[6]]
    info.to_station_name = mapStation[raw[7]]
    container.push(info)
  }
  return container
}
