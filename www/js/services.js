angular.module('zeus.services', [])
  .factory('HisData', ['$http', '$q', 'ApiEndpoint', function ($http, $q, ApiEndpoint) {
    return {
      query: function (numCode, year, quarter) {
        var deferred = $q.defer(); // 声明延后执行，表示要去监控后面的执行
        var myUrl = ApiEndpoint.his_url + numCode + ".phtml?year=" + year + "&jidu=" + quarter;
        $http({method: 'GET', url: myUrl}).
        success(function (data, status, headers, config) {
          var strExp = "<a target='_blank'\\s+href='http://vip.stock.finance.sina.com.cn/quotes_service/view/vMS_tradehistory.php\\?";
          strExp += "symbol=\\w{8}&date=\\d{4}-\\d{2}-\\d{2}'>\\s*([^\\s]+)\\s+</a>\\s*</div></td>";
          strExp += "\\s*<td[^\\d]*([^<]*)</div></td>\\s+<td[^\\d]*([^<]*)</div></td>\\s+<td[^\\d]*([^<]*)</div></td>\\s+<td[^\\d]*([^<]*)</div></td>\\s";
          var regexp = new RegExp(strExp, "g");
          var temp = data.match(regexp);

          var hisDataIndex = 0;
          var hisData = new Object();
          for (var item in temp) {
            var parseData = parseHis(temp[item]);
            hisData[hisDataIndex] = parseData;
            hisDataIndex++;
          }
          deferred.resolve(hisData);  // 声明执行成功，即http请求数据成功，可以返回数据了
        }).
        error(function (data, status, headers, config) {
          deferred.reject(data);   // 声明执行失败，即服务器返回错误
        });
        return deferred.promise;   // 返回承诺，这里并不是最终数据，而是访问最终数据的API
      }, // end query
      queryDKHis: function (numCode) {
        var deferred = $q.defer(); // 声明延后执行，表示要去监控后面的执行
        var myUrl = ApiEndpoint.gfdk_his_url + "page?product_code=" + numCode;
        $http({method: 'GET', url: myUrl}).
        success(function (data, status, headers, config) {
          var objArray = data.dataList;
          deferred.resolve(objArray);  // 声明执行成功，即http请求数据成功，可以返回数据了
        }).
        error(function (data, status, headers, config) {
          deferred.reject(data);   // 声明执行失败，即服务器返回错误
        });
        return deferred.promise;   // 返回承诺，这里并不是最终数据，而是访问最终数据的API
      } // end query
    };
  }])

  .factory('Positions', ['$http', 'ApiEndpoint', 'HisData', function ($http, ApiEndpoint, HisData) {
    return {
      all: function () {
        var positionString = window.localStorage['positions'];
        if (positionString) {
          var positions = angular.fromJson(positionString);
          for (var pos in positions) {
            positions[pos].imgsrc = ApiEndpoint.img_url + "min/n/" + positions[pos].code + ".gif";

          }
          return positions;
        }
        return [];
      },
      get: function (positionID) {
        var allPos = this.all();
        for (var i = 0; i < allPos.length; i++) {
          if (allPos[i].id == positionID) {
            return allPos[i];
          }
        }
        return null;
      },
      saveOne: function (position) {
        if (position.id == null) {
          var allPos = this.all();
          var tm = new Date();
          var strID = tm.getMilliseconds() + tm.getSeconds() * 60 + tm.getMinutes() * 3600 + tm.getHours() * 60 * 3600 + tm.getDay() * 3600 * 24 + tm.getMonth() * 3600 * 24 * 31 + tm.getYear() * 3600 * 24 * 31 * 12;
          position.id = strID;
          allPos.push(position);
          this.saveAll(allPos);
          return;
        }
        else {
          var allPos = this.all();
          for (var i = 0; i < allPos.length; i++) {
            if (allPos[i].id == position.id) {
              allPos[i] = position;
              this.saveAll(allPos);
              return;
            }
          }
        }
      },
      saveAll: function (positions) {
        window.localStorage['positions'] = angular.toJson(positions);
      }
      ,
      newPosition: function (positionCode) {
        // Add a new position
        return {
          code: positionCode,
          initDate: new Date()
        };
      }
      ,
      delPosition: function (positionID) {
        var allPos = this.all();
        if (isNaN(positionID) || allPos >= allPos.length) {
          return false;
        }
        var currIndex = -1;
        for (var i = 0; i < allPos.length; i++) {
          if (allPos[i].id == positionID) {
            allPos.splice(i, 1);
            break;
          }
        }
        window.localStorage['positions'] = angular.toJson(allPos);
      }
      ,
      fillPosition: function (position) {
        if (position) {

          //建议仓位数量
          position.advicePosition = position.totalFund * position.positionRC / ( position.initialATR * position.stopAM * 100);
          //建议仓位金额
          if (position.initialPrice)
            position.advicePosFund = position.advicePosition * position.initialPrice;
          else
            position.advicePosFund = position.advicePosition * position.currPrice;
          //止损价
          position.stopPercent = position.stopAM * position.initialATR / position.initialPrice;

          position.stopFund = position.stopPercent * position.initialCount * position.initialPrice;

          position.lowStopPrice = position.initialPrice * (1 - position.stopPercent);

          position.highStopPrice1 = position.initialPrice * (1 + position.stopPercent * 2);

          position.highStopPrice2 = position.initialPrice * (1 + position.stopPercent * 4);

          position.highStopPrice3 = position.initialPrice * (1 + position.stopPercent * 6);

          if (position.realhighStopPrice == null)
            position.realhighStopPrice = 0;

          position.currHighPriceColor = {color: 'blue'};

          if (position.currPrice) {
            var atr = position.currATR ? position.currATR : position.initialATR;
            var tmpHighPrice = -1;
            if (parseFloat(position.highStopPrice1) <= parseFloat(position.highestPrice) &&
              parseFloat(position.highestPrice) < parseFloat(position.highStopPrice2)) {
              tmpHighPrice = position.highestPrice - 0.5 * position.stopAM * atr;
              tmpHighPrice = tmpHighPrice.toFixed(2);
              position.realhighStopPrice = tmpHighPrice;
              position.currHighPriceColor = position.currPriceColor;
            }
            else if (parseFloat(position.highStopPrice2) <= parseFloat(position.highestPrice) &&
              parseFloat(position.highestPrice) < parseFloat(position.highStopPrice3)) {
              tmpHighPrice = position.highestPrice - 0.4 * position.stopAM * atr;
              tmpHighPrice = tmpHighPrice.toFixed(2);
              position.realhighStopPrice = tmpHighPrice;
              position.currHighPriceColor = position.currPriceColor;
            }
            else if (parseFloat(position.highStopPrice3) <= parseFloat(position.highestPrice)) {
              tmpHighPrice = position.highestPrice - 0.3 * position.stopAM * atr;
              tmpHighPrice = tmpHighPrice.toFixed(2);
              position.realhighStopPrice = tmpHighPrice;
              position.currHighPriceColor = position.currPriceColor;
            }
          }

          //计算tr
          if (position.hisData && position.hisData.length > 0) {
            var hisIndex = 0;
            while (hisIndex < position.hisData.length - 1) {
              var itemBaseData = position.hisData[hisIndex];
              var itemLastData = position.hisData[hisIndex + 1];

              if (typeof(itemLastData) == "undefined")
                break;

              var tr = Math.max(Math.abs(itemBaseData.maxP - itemBaseData.minP), Math.abs(itemLastData.closingP - itemBaseData.maxP),
                Math.abs(itemLastData.closingP - itemBaseData.minP));

              itemBaseData['tr'] = parseFloat(tr);
              hisIndex++;
            }

            position.hisData[position.hisData.length - 1]['tr'] = Math.abs(itemBaseData.maxP - itemBaseData.minP);

            var sumTR = 0;
            for (var iCount = 0; iCount < 14; iCount++) {
              if (position.hisData[position.hisData.length - 1 - iCount])
                sumTR += position.hisData[position.hisData.length - 1 - iCount].tr;
            }
            if (position.hisData[position.hisData.length - 14])
              position.hisData[position.hisData.length - 14]['atr'] = parseFloat(sumTR) / 14;

            for (var atrCount = position.hisData.length - 15; atrCount >= 0; atrCount--) {
              if (!position.hisData[atrCount + 1]['atr'] || !position.hisData[atrCount]['tr'])
                break;
              var lastATR = parseFloat(position.hisData[atrCount + 1]['atr']);
              var currTR = parseFloat(position.hisData[atrCount]['tr']);
              var currATR = (lastATR * 13 + currTR) / 14;
              position.hisData[atrCount]['atr'] = currATR
            }
            if (position.hisData[0]['atr']) {
              position.currATR = position.hisData[0]['atr'];
              position.currATR = position.currATR.toFixed(3);
            }
            setHighestPrice(position);
          }


          position.advicePosition = position.advicePosition.toFixed(0);
          position.advicePosFund = position.advicePosFund.toFixed(2);
          position.lowStopPrice = position.lowStopPrice.toFixed(2);
          position.stopFund = position.stopFund.toFixed(2);
          position.stopPercent = position.stopPercent.toFixed(3);
          position.highStopPrice1 = position.highStopPrice1.toFixed(2);
          position.highStopPrice2 = position.highStopPrice2.toFixed(2);
          position.highStopPrice3 = position.highStopPrice3.toFixed(2);

          this.saveOne(position);
        }
      }
    }
  }])
  .factory('DKPositions', ['$http', 'ApiEndpoint', 'HisData', function ($http, ApiEndpoint, HisData) {
    return {
      all: function () {
        var positionString = window.localStorage['dkpositions'];
        if (positionString) {
          var positions = angular.fromJson(positionString);
          for (var pos in positions) {
            if (positions[pos].code == '878004')
              positions[pos].title = '创业板看多';
            if (positions[pos].code == '878005')
              positions[pos].title = '创业板看空';
          }
          return positions;
        }
        return [];
      },
      get: function (positionID) {
        var allPos = this.all();
        for (var i = 0; i < allPos.length; i++) {
          if (allPos[i].id == positionID) {
            return allPos[i];
          }
        }
        return null;
      },
      newPosition: function (position) {
        // Add a new position
        return {
          code: position.code,
          initialPrice: position.initialPrice,
          initialCount: position.initialCount,
          realPrice: '',
          initDate: new Date()
        };
      }
      ,
      saveOne: function (position) {
        if (position.id == null) {
          var allPos = this.all();
          var tm = new Date();
          var strID = tm.getMilliseconds() + tm.getSeconds() * 60 + tm.getMinutes() * 3600 + tm.getHours() * 60 * 3600 + tm.getDay() * 3600 * 24 + tm.getMonth() * 3600 * 24 * 31 + tm.getYear() * 3600 * 24 * 31 * 12;
          position.id = strID;
          allPos.push(position);
          this.saveAll(allPos);
          return;
        }
        else {
          var allPos = this.all();
          for (var i = 0; i < allPos.length; i++) {
            if (allPos[i].id == position.id) {
              allPos[i] = position;
              this.saveAll(allPos);
              return;
            }
          }
        }
      },
      saveAll: function (positions) {
        window.localStorage['dkpositions'] = angular.toJson(positions);
      }
      ,
      delPosition: function (positionID) {
        var allPos = this.all();
        if (isNaN(positionID) || allPos >= allPos.length) {
          return false;
        }
        var currIndex = -1;
        for (var i = 0; i < allPos.length; i++) {
          if (allPos[i].id == positionID) {
            allPos.splice(i, 1);
            break;
          }
        }
        window.localStorage['dkpositions'] = angular.toJson(allPos);
      }
    }
  }])
  .factory('Scales', ['$http', '$q', 'ApiEndpoint', 'DKPositions', function ($http, $q, ApiEndpoint, DKPositions) {
    return {
      updatePosition: function (position) {
        var deferred = $q.defer(); // 声明延后执行，表示要去监控后面的执行scales_url/

        var myUrl = ApiEndpoint.scales_url + "service/HighStock878002Domain.go?function=InitData";
        myUrl += "&code=" + position.code + "&name=%25E5%25AE%259E%25E6%2597%25B6%25E8%25BD%25AC%25E6%258D%25A2%25E6%25AF%2594%25E4%25BE%258B";
        $http({method: 'GET', url: myUrl}).
        success(function (data, status, headers, config) {
          var validData;
          if (data[0][1] == null || typeof(data[0][1]) == 'undefined') {
            deferred.reject(data);
            return;
          }
          for (i = 0; i < data.length; i++) {
            var curData = data[i];

            if (curData[1] == null || typeof(curData[1]) == 'undefined') {
              validData = data[i - 1][1];
              break;
            }
            else if (i == data.length - 1) {
              validData = data[i][1];
              break;
            }
          }

          position.realPrice = validData;
          position.currChangePercent = (position.realPrice - position.initialPrice) * 100;
          position.currChangePercent = position.currChangePercent.toFixed(2);
          position.currChange = (position.realPrice - position.initialPrice) * position.initialCount;
          position.currChange = position.currChange.toFixed(1);
          if (position.currChangePercent > 0)
            position.currPriceColor = {color: 'darkred'};
          else
            position.currPriceColor = {color: 'darkgreen'};

          DKPositions.saveOne(position);

          return deferred.promise;
        }).
        error(function (data, status, headers, config) {
          deferred.reject(data);   // 声明执行失败，即服务器返回错误
        });
        return deferred.promise;   // 返回承诺，这里并不是最终数据，而是访问最终数据的API
      },
      query: function (numCode) {
        var deferred = $q.defer(); // 声明延后执行，表示要去监控后面的执行scales_url/

        var myUrl = ApiEndpoint.scales_url + "service/HighStock878002Domain.go?function=InitData";
        myUrl += "&code=" + numCode + "&name=%25E5%25AE%259E%25E6%2597%25B6%25E8%25BD%25AC%25E6%258D%25A2%25E6%25AF%2594%25E4%25BE%258B";
        $http({method: 'GET', url: myUrl}).
        success(function (data, status, headers, config) {
          var validData;
          if (data[0][1] == null || typeof(data[0][1]) == 'undefined') {
            deferred.reject(data);
            return;
          }
          for (i = 0; i < data.length; i++) {
            var curData = data[i];

            if (curData[1] == null || typeof(curData[1]) == 'undefined') {
              validData = data[i - 1][1];
              break;
            }
            else if (i == data.length - 1) {
              validData = data[i][1];
              break;
            }
          }

          deferred.resolve(validData);  // 声明执行成功，即http请求数据成功，可以返回数据了
          return deferred.promise;
        }).
        error(function (data, status, headers, config) {
          deferred.reject(data);   // 声明执行失败，即服务器返回错误
        });
        return deferred.promise;   // 返回承诺，这里并不是最终数据，而是访问最终数据的API
      } // end query
    };
  }])
  .
  factory('Chats', function () {
    // Might use a resource here that returns a JSON array

    // Some fake testing data
    var chats = [{
      id: 0,
      name: 'Ben Sparrow',
      lastText: 'You on your way?',
      face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
    }, {
      id: 1,
      name: 'Max Lynx',
      lastText: 'Hey, it\'s me',
      face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
    }, {
      id: 2,
      name: 'Adam Bradleyson',
      lastText: 'I should buy a boat',
      face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
    }, {
      id: 3,
      name: 'Perry Governor',
      lastText: 'Look at my mukluks!',
      face: 'https://pbs.twimg.com/profile_images/598205061232103424/3j5HUXMY.png'
    }, {
      id: 4,
      name: 'Mike Harrington',
      lastText: 'This is wicked good ice cream.',
      face: 'https://pbs.twimg.com/profile_images/578237281384841216/R3ae1n61.png'
    }];

    return {
      all: function () {
        return chats;
      },
      remove: function (chat) {
        chats.splice(chats.indexOf(chat), 1);
      },
      get: function (chatId) {
        for (var i = 0; i < chats.length; i++) {
          if (chats[i].id === parseInt(chatId)) {
            return chats[i];
          }
        }
        return null;
      }
    };
  });

var loadRunTimeData = function ($http, ApiEndpoint, Positions, position) {
  //var data = 'hq_str_sz000913="钱江摩托,8.56,8.32,14.30,9.15,8.48,8.75,8.76,31652880,278885232.67,49100,8.75,10700,8.74,73000,8.73,112500,8.72,4300,8.71,12100,8.76,29500,8.77,28000,8.78,43900,8.79,195100,8.80,2015-10-13,11:35:52,00"';
  var myUrl = ApiEndpoint.hq_url + "list=" + position.code;
  $http.get(myUrl).success(function (data, status, headers, config) {
      var temp = data.split(',')[0];
      position.title = temp.substring(temp.indexOf('"') + 1, temp.length);

      position.todayStart = data.split(',')[1];
      position.yestodayEnd = data.split(',')[2];
      position.currPrice = data.split(',')[3];


      position.currMount = position.currPrice * position.initialCount;
      position.currMount = position.currMount.toFixed(2);

      var strDate = position.initDate.toString();
      var initDate = new Date(strDate.substring(0, 10).replace(/-/, "/")).getTime();
      var strCurrDate = new Date().toString();
      var currDate = new Date(new Date(strDate.substring(0, 10).replace(/-/, "/"))).getTime();

      position.currDayChangePercent = (position.currPrice - position.yestodayEnd) * 100 / position.yestodayEnd;
      position.currDayChange = (position.currPrice - position.yestodayEnd) * position.initialCount;

      position.currDayChangePercent = position.currDayChangePercent.toFixed(3);
      position.currDayChange = position.currDayChange.toFixed(2);
      position.currDayPriceColor = {color: 'blue'};
      if (position.currDayChange <= 0)
        position.currDayPriceColor = {color: 'darkgreen'};
      else
        position.currDayPriceColor = {color: 'darkRed'};


      position.currPriceColor = {color: 'blue'};
      if (position.currPrice) {
        if (parseFloat(position.currPrice) < parseFloat(position.lowStopPrice))
          position.currPriceColor = {color: 'black', background: 'greenyellow'};
        else if (parseFloat(position.lowStopPrice) <= parseFloat(position.currPrice) && parseFloat(position.currPrice) < parseFloat(position.initialPrice))
          position.currPriceColor = {color: 'darkgreen'};
        else if (parseFloat(position.initialPrice) <= parseFloat(position.currPrice) && parseFloat(position.currPrice) < parseFloat(position.highStopPrice1))
          position.currPriceColor = {color: 'orange'};
        else if (parseFloat(position.highStopPrice1) <= parseFloat(position.currPrice) && parseFloat(position.currPrice) < parseFloat(position.highStopPrice2))
          position.currPriceColor = {color: 'palevioletred'};
        else if (parseFloat(position.highStopPrice2) <= parseFloat(position.currPrice) && parseFloat(position.currPrice) < parseFloat(position.highStopPrice3))
          position.currPriceColor = {color: 'darkred'};
        else if (parseFloat(position.highStopPrice3) <= parseFloat(position.currPrice))
          position.currPriceColor = {color: 'red'};
      }


      if (position.currPrice && position.initialPrice && position.initialCount) {
        position.currChangePercent = (position.currPrice - position.initialPrice) * 100 / position.initialPrice;
        position.currChange = (position.currPrice - position.initialPrice) * position.initialCount;

        position.currChangePercent = position.currChangePercent.toFixed(3);
        position.currChange = position.currChange.toFixed(2);
      }

      Positions.saveOne(position);
    }
  ).
  error(function (data, status, headers, config) {

    }
  )
}

var updateHisData = function ($scope, HisData, Positions, position) {
  var numCode = position.code.replace(/[a-zA-Z]+/, '');

  var now = new Date();
  var quarter = getQuarterByMonth(now.getMonth());
  var year = now.getFullYear();

  var hisData = new Array();
  HisData.query(numCode, year, quarter).then(function (res) {
      if (position.hisData && position.hisData[0].dateP) {
        var oriDateP = position.hisData[0].dateP;
        var oriDate = new Date(oriDateP.replace(/-/, "/"));
        var newDateP = res[0].dateP;
        var newDate = new Date(newDateP.replace(/-/, "/"));
        if (oriDate.getTime() == newDate.getTime() &&
          position.hisData.length > 20) {
          $scope.$broadcast('scroll.refreshComplete');
          return;
        }
      }

      for (item in res) {
        hisData[item] = res[item];
      }

      if (quarter > 1) {
        quarter = quarter - 1;
      }
      else {
        quarter = 4;
        year = year - 1;
      }

      HisData.query(numCode, year, quarter).then(function (res) {
        for (item in res) {
          hisData[hisData.length] = res[item];
        }
        position.hisData = hisData;
        Positions.saveOne(position);

        if (quarter > 1) {
          quarter = quarter - 1;
        }
        else {
          quarter = 4;
          year = year - 1;
        }
        HisData.query(numCode, year, quarter).then(function (res) {
          for (item in res) {
            hisData[hisData.length] = res[item];
          }
          position.hisData = hisData;
          Positions.saveOne(position);
          $scope.$broadcast('scroll.refreshComplete');
        }, function () {
          $scope.$broadcast('scroll.refreshComplete');
        });
      }, function () {
        $scope.$broadcast('scroll.refreshComplete');
      });
    }, function () {
      $scope.$broadcast('scroll.refreshComplete');
    }
  )
  ;
}

function parseHis(content) {
  var result = new Object();
  var tmpStr = new String(content);
  var tmpStart = tmpStr.indexOf("&date=");
  tmpStr = tmpStr.substr(tmpStart + 6);
  result.dateP = tmpStr.substring(0, tmpStr.indexOf("'>"));

  tmpStr = tmpStr.substr(tmpStr.indexOf("'>") + 2);
  tmpStart = tmpStr.indexOf('align="center">');
  tmpStr = tmpStr.substr(tmpStart + 15);
  result.openingP = tmpStr.substring(0, tmpStr.indexOf("</"));

  tmpStr = tmpStr.substr(tmpStr.indexOf("'>") + 2);
  tmpStart = tmpStr.indexOf('align="center">');
  tmpStr = tmpStr.substr(tmpStart + 15);
  result.maxP = tmpStr.substring(0, tmpStr.indexOf("</"));

  tmpStr = tmpStr.substr(tmpStr.indexOf("'>") + 2);
  tmpStart = tmpStr.indexOf('align="center">');
  tmpStr = tmpStr.substr(tmpStart + 15);
  result.closingP = tmpStr.substring(0, tmpStr.indexOf("</"));

  tmpStr = tmpStr.substr(tmpStr.indexOf("'>") + 2);
  tmpStart = tmpStr.indexOf('align="center">');
  tmpStr = tmpStr.substr(tmpStart + 15);
  result.minP = tmpStr.substring(0, tmpStr.indexOf("</"));

  return result;
};


var setHighestPrice = function (position) {
  var highestPrice = position.currPrice;
  var strDate = position.initDate.toString();
  var initDate = new Date(strDate.substring(0, 10).replace(/-/, "/"));
  for (item in position.hisData) {
    var itemDate = new Date(position.hisData[item].dateP.replace(/-/, "/"));
    if (itemDate < initDate)
      break;
    if (position.hisData[item].maxP > highestPrice)
      highestPrice = position.hisData[item].maxP;
  }
  position.highestPrice = highestPrice;
}
