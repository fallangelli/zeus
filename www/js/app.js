var todoApp = angular.module('todoApp', ['ionic']);

todoApp.config(function ($sceDelegateProvider) {
  $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow loading from our assets domain.  Notice the difference between * and **.
    'http://money.finance.sina.com.cn/**']);
});

todoApp.run(function ($ionicPlatform) {
  $ionicPlatform.ready(function () {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});

function getQuarterByMonth(month) {
  if (month <= 2) {
    return 1;
  }
  else if (month <= 5) {
    return 2;
  }
  else if (month <= 8) {
    return 3;
  }
  else {
    return 4;
  }
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
}

todoApp.controller('TodoController', function ($scope, $timeout, $ionicActionSheet, $ionicModal, Positions, $ionicSideMenuDelegate, $http) {


  //300涨
  $scope.open_878002 = function (code) {
    window.open("/gf/match/index_dkgg.jsp?code=878002", "_blank", "location=no,toolbar=no");
  };

  //300跌
  $scope.open_878003 = function (code) {
    window.open("/gf/match/index_dkgg.jsp?code=878003", "_blank", "location=no,toolbar=no");
  };


  $scope.open300 = function (code) {
    window.open("/img/sina/min/n/sh000300.gif", "_blank", "location=no,toolbar=no");
  };

  $scope.open300k = function (code) {
    window.open("/img/sina/daily/n/sh000300.gif", "_blank", "location=no,toolbar=no");
  };


  //创业涨
  $scope.open_878004 = function (code) {
    window.open("/gf/match/index_dkgg.jsp?code=878004", "_blank", "location=no,toolbar=no");
  };

  //创业跌
  $scope.open_878005 = function (code) {
    window.open("/gf/match/index_dkgg.jsp?code=878005", "_blank", "location=no,toolbar=no");
  };


  $scope.openCY = function (code) {
    window.open("/img/sina/min/n/sz399006.gif", "_blank", "location=no,toolbar=no");
  };

  $scope.openCYk = function (code) {
    window.open("/img/sina/daily/n/sz399006.gif", "_blank", "location=no,toolbar=no");
  };

  //50涨
  $scope.open_878006 = function (code) {
    window.open("/gf/match/index_dkgg.jsp?code=878006", "_blank", "location=no,toolbar=no");
  };

  //50跌
  $scope.open_878007 = function (code) {
    window.open("/gf/match/index_dkgg.jsp?code=878007", "_blank", "location=no,toolbar=no");
  };

  $scope.open50 = function (code) {
    window.open("/img/sina/min/n/sh000016.gif", "_blank", "location=no,toolbar=no");
  };

  $scope.open50k = function (code) {
    window.open("/img/sina/daily/n/sh000016.gif", "_blank", "location=no,toolbar=no");
  };


  //500涨
  $scope.open_878008 = function (code) {
    window.open("/gf/match/index_dkgg.jsp?code=878008", "_blank", "location=no,toolbar=no");
  };

  //500跌
  $scope.open_878009 = function (code) {
    window.open("/gf/match/index_dkgg.jsp?code=878009", "_blank", "location=no,toolbar=no");
  };

  $scope.open500 = function (code) {
    window.open("/img/sina/min/n/sh000905.gif", "_blank", "location=no,toolbar=no");
  };

  $scope.open500k = function (code) {
    window.open("/img/sina/daily/n/sh000905.gif", "_blank", "location=no,toolbar=no");
  };

  $scope.openDayGif = function (code) {
    window.open("/img/sina/daily/n/" + code + ".gif", "_blank", "location=no,toolbar=no");
  };

  $scope.openMinGif = function (code) {
    window.open("/img/sina/min/n/" + code + ".gif", "_blank", "location=no,toolbar=no");
  };


  $scope.updateHisData = function (position) {

    var numCode = position.code.replace(/[a-zA-Z]+/, '');
    var now = new Date();
    var quarter = getQuarterByMonth(now.getMonth());
    var myUrl = "/remote/his/" + numCode + ".phtml?year=2015&jidu=" + quarter;
    $http.get(myUrl).success(function (data, status, headers, config) {

      var strExp = "<a target='_blank'\\s+href='http://vip.stock.finance.sina.com.cn/quotes_service/view/vMS_tradehistory.php\\?";
      strExp += "symbol=\\w{8}&date=\\d{4}-\\d{2}-\\d{2}'>\\s*([^\\s]+)\\s+</a>\\s*</div></td>";
      strExp += "\\s*<td[^\\d]*([^<]*)</div></td>\\s+<td[^\\d]*([^<]*)</div></td>\\s+<td[^\\d]*([^<]*)</div></td>\\s+<td[^\\d]*([^<]*)</div></td>\\s";
      var regexp = new RegExp(strExp, "g");
      var temp = data.match(regexp);
      for (item in temp) {
        var pos = Positions.get(position.code);
        if (typeof( pos.hisData ) == "undefined") {
          pos.hisData = new Object();
        }
        var parseData = parseHis(temp[item]);
        pos.hisData[parseData.dateP] = parseData;
        Positions.saveOne(pos);
      }
    }).
      error(function (data, status, headers, config) {
        alert("读取历史信息错误");
      }
    );

    var numCode = position.code.replace(/[a-zA-Z]+/, '');
    var now = new Date();
    var quarter = getQuarterByMonth(now.getMonth()) - 1;
    var myUrl = "/remote/his/" + numCode + ".phtml?year=2015&jidu=" + quarter;
    $http.get(myUrl).success(function (data, status, headers, config) {

      var strExp = "<a target='_blank'\\s+href='http://vip.stock.finance.sina.com.cn/quotes_service/view/vMS_tradehistory.php\\?";
      strExp += "symbol=\\w{8}&date=\\d{4}-\\d{2}-\\d{2}'>\\s*([^\\s]+)\\s+</a>\\s*</div></td>";
      strExp += "\\s*<td[^\\d]*([^<]*)</div></td>\\s+<td[^\\d]*([^<]*)</div></td>\\s+<td[^\\d]*([^<]*)</div></td>\\s+<td[^\\d]*([^<]*)</div></td>\\s";
      var regexp = new RegExp(strExp, "g");
      var temp = data.match(regexp);
      for (item in temp) {
        var pos = Positions.get(position.code);
        if (typeof( pos.hisData ) == "undefined") {
          pos.hisData = new Object();
        }
        var parseData = parseHis(temp[item]);
        pos.hisData[parseData.dateP] = parseData;
        Positions.saveOne(pos);
      }
    }).
      error(function (data, status, headers, config) {
        alert("读取历史信息错误");
      }
    );

    for (var item in position.hisData) {

      //计算tr
      var temDate = new Date(item);
      var baseDate = temDate.getFullYear() + "-" + ( temDate.getMonth() + 1) + "-" + (temDate.getDate() < 10 ? '0' + temDate.getDate() : temDate.getDate());
      var count = 1;
      do {
        var tmpDD = new Date(item);
        tmpDD.setDate(tmpDD.getDate() - count);
        var lastDate = tmpDD.getFullYear() + "-" + ( tmpDD.getMonth() + 1) + "-" + (tmpDD.getDate() < 10 ? '0' + tmpDD.getDate() : tmpDD.getDate());
        var itemLastData = position.hisData[lastDate];
        count = count + 1;
      } while (typeof(itemLastData) == "undefined" && count < 30);

      if (typeof(itemLastData) == "undefined")
        break;

      var itemBaseData = position.hisData[baseDate];
      var tr = Math.max(itemBaseData.maxP - itemBaseData.minP, itemLastData.closingP - itemBaseData.maxP, itemLastData.closingP - itemBaseData.minP);

      itemBaseData['atr'] = tr;
    }


  }
  //
  //$scope.updateRealATR = function (position) {
  //  this.updateHisData(position);
  //  Positions.saveOne(position);
  //
  //  loadRunTimeData(position);
  //  fillPosition(position);
  //
  //  $scope.activePosition = position;
  //
  //  //window.localStorage['positions'] = angular.toJson(positions);
  //
  //
  //};

  $scope.refreshAll = function () {
    $timeout(function () {
      var positions = Positions.all();
      for (var i = 0; i < positions.length; i++) {
        loadRunTimeData(positions[i]);
        $scope.updateHisData(positions[i]);
        $scope.fillPosition(positions[i]);
      }

      $scope.positions = positions;

      $scope.$broadcast('scroll.refreshComplete');
    }, 500);

  };

  $scope.doRefresh = function () {

    $timeout(function () {
      //simulate async response
      Positions.setLastActiveIndex(Positions.getLastActiveIndex());
      var pos = $scope.positions[Positions.getLastActiveIndex()];

      loadRunTimeData(pos);
      $scope.updateHisData(pos);
      $scope.fillPosition(pos);

      $scope.activePosition = pos;

      $scope.$broadcast('scroll.refreshComplete');
    }, 500);

  };

  var loadRunTimeData = function (position) {
    //var data = 'hq_str_sz000913="钱江摩托,8.56,8.32,14.30,9.15,8.48,8.75,8.76,31652880,278885232.67,49100,8.75,10700,8.74,73000,8.73,112500,8.72,4300,8.71,12100,8.76,29500,8.77,28000,8.78,43900,8.79,195100,8.80,2015-10-13,11:35:52,00"';
    var myUrl = "/remote/hq/list=" + position.code;
    $http.get(myUrl).success(function (data, status, headers, config) {
        var temp = data.split(',')[0];
        position.title = temp.substring(temp.indexOf('"') + 1, temp.length);

        position.todayStart = data.split(',')[1];
        position.yestodayEnd = data.split(',')[2];
        position.currPrice = data.split(',')[3];
        position.currMount = position.currPrice * position.initialCount;
        position.currMount = position.currMount.toFixed(2);


        position.currDayPriceColor = {color: 'blue'};
        if (position.currPrice && position.yestodayEnd) {
          if (parseFloat(position.currPrice) < parseFloat(position.yestodayEnd))
            position.currDayPriceColor = {color: 'darkgreen'};
          else if (parseFloat(position.yestodayEnd) <= parseFloat(position.currPrice))
            position.currDayPriceColor = {color: 'darkRed'};

          position.currDayChangePercent = (position.currPrice - position.yestodayEnd) * 100 / position.yestodayEnd;
          position.currDayChange = (position.currPrice - position.yestodayEnd) * position.initialCount;

          position.currDayChangePercent = position.currDayChangePercent.toFixed(3);
          position.currDayChange = position.currDayChange.toFixed(2);
        }


        position.currPriceColor = {color: 'blue'};
        if (position.currPrice) {
          if (parseFloat(position.currPrice) < parseFloat(position.lowStopPrice))
            position.currPriceColor = {color: 'green'};
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

        position.realhighStopPrice = '无';
        position.currHighPriceColor = {color: 'blue'};
        if (position.currPrice) {
          var atr = position.currATR ? position.currATR : position.initialATR;

          if (parseFloat(position.highStopPrice1) <= parseFloat(position.currPrice) && parseFloat(position.currPrice) < parseFloat(position.highStopPrice2)) {
            position.realhighStopPrice = position.currPrice - 4 * atr;
            position.realhighStopPrice = position.realhighStopPrice.toFixed(2);
            position.currHighPriceColor = position.currPriceColor;
          }
          else if (parseFloat(position.highStopPrice2) <= parseFloat(position.currPrice) && parseFloat(position.currPrice) < parseFloat(position.highStopPrice3)) {
            position.realhighStopPrice = position.currPrice - 3 * atr;
            position.realhighStopPrice = position.realhighStopPrice.toFixed(2);
            position.currHighPriceColor = position.currPriceColor;
          }
          else if (parseFloat(position.highStopPrice3) <= parseFloat(position.currPrice)) {
            position.realhighStopPrice = position.currPrice - 2 * atr;
            position.realhighStopPrice = position.realhighStopPrice.toFixed(2);
            position.currHighPriceColor = position.currPriceColor;
          }
        }

        if (position.currPrice && position.initialPrice && position.initialCount) {
          position.currChangePercent = (position.currPrice - position.initialPrice) * 100 / position.initialPrice;
          position.currChange = (position.currPrice - position.initialPrice) * position.initialCount;

          position.currChangePercent = position.currChangePercent.toFixed(3);
          position.currChange = position.currChange.toFixed(2);
        }

      }
    ).
      error(function (data, status, headers, config) {
        alert("读取实时信息错误");
      }
    );


  }
// A utility function for creating a new position
// with the given positionCode
  var createPosition = function (positionCode) {

    var newPosition = Positions.newPosition(positionCode);
    if (positionCode.substr(0, 1) == '6')
      newPosition.code = 'sh' + positionCode;
    if (positionCode.substr(0, 1) == '0' || positionCode.substr(0, 1) == '3')
      newPosition.code = 'sz' + positionCode;

    newPosition.hisDate = new Object();

    $scope.positions.push(newPosition);
    Positions.save($scope.positions);
    $scope.selectPosition(newPosition, $scope.positions.length - 1);
  }


// Load or initialize positions
  $scope.positions = Positions.all();


// Grab the last active, or the first position
  var currPos = $scope.positions[Positions.getLastActiveIndex()];


  $scope.activePosition = currPos;

// Called to create a new position
  $scope.newPosition = function () {
    var positionCode = prompt('代码');
    if (positionCode) {
      createPosition(positionCode);
    }
  };

// Called to select the given position
  $scope.selectPosition = function (position, index) {

    Positions.setLastActiveIndex(index);
    var pos = $scope.positions[Positions.getLastActiveIndex()];

    loadRunTimeData(pos);
    $scope.updateHisData(pos);
    $scope.fillPosition(pos);
    $scope.activePosition = pos;
    $ionicSideMenuDelegate.toggleLeft(false);
  };


  $scope.delPosition = function (position, index) {
    Positions.delPositon(index);
    $scope.positions = Positions.all();
    Positions.setLastActiveIndex(0);
    $scope.activePosition = $scope.positions[Positions.getLastActiveIndex()];
    $ionicSideMenuDelegate.toggleLeft(false);
  };


  $scope.fillPosition = function (position) {
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


      var nowDate = new Date();
      var index = 15;
      while (index > 0) {

        //计算tr
        var currDate = nowDate.getFullYear() + "-" + ( nowDate.getMonth() + 1) + "-" + (nowDate.getDate() < 10 ? '0' + nowDate.getDate() : nowDate.getDate());
        var count = 1;
        do {
          var tmpDD = new Date();
          tmpDD.setDate(tmpDD.getDate() - count);
          var lastDate = tmpDD.getFullYear() + "-" + ( tmpDD.getMonth() + 1) + "-" + (tmpDD.getDate() < 10 ? '0' + tmpDD.getDate() : tmpDD.getDate());
          var itemLastData = position.hisData[lastDate];
          count = count + 1;
        } while (typeof(itemLastData) == "undefined" && count < 30);

        if (typeof(itemLastData) == "undefined")
          continue;

        var itemBaseData = position.hisData[baseDate];
        var tr = Math.max(itemBaseData.maxP - itemBaseData.minP, itemLastData.closingP - itemBaseData.maxP, itemLastData.closingP - itemBaseData.minP);

        itemBaseData['atr'] = tr;
      }

      position.currATR = tr;

      position.advicePosition = position.advicePosition.toFixed(0);
      position.advicePosFund = position.advicePosFund.toFixed(2);
      position.lowStopPrice = position.lowStopPrice.toFixed(2);
      position.stopFund = position.stopFund.toFixed(2);
      position.stopPercent = position.stopPercent.toFixed(3);
      position.highStopPrice1 = position.highStopPrice1.toFixed(2);
      position.highStopPrice2 = position.highStopPrice2.toFixed(2);
      position.highStopPrice3 = position.highStopPrice3.toFixed(2);

      Positions.saveOne(position);
    }
  }
// Create our modal
  $ionicModal.fromTemplateUrl('new-task.html', function (modal) {
    $scope.taskModal = modal;
  }, {
    scope: $scope
  });

  $scope.createTask = function (position) {
    if (!$scope.activePosition || !position) {
      return;
    }

    $scope.activePosition.totalFund = position.totalFund;
    $scope.activePosition.initialCount = position.initialCount;
    $scope.activePosition.initialPrice = position.initialPrice;
    $scope.activePosition.initialATR = position.currATR;
    $scope.activePosition.positionRC = position.positionRC;
    $scope.activePosition.stopAM = position.stopAM;

    loadRunTimeData($scope.activePosition);
    $scope.fillPosition($scope.activePosition);
    //
    //$scope.activePosition.tasks.push({
    //  totalFund: task.totalFund,
    //  initialPrice: task.initialPrice,
    //  initialATR: task.initialATR,
    //  positionRC: task.positionRC,
    //  stopAM: task.stopAM
    //});
    $scope.taskModal.hide();

    // Inefficient, but save all the positions
    Positions.save($scope.positions);

    task.title = "";
  };

  $scope.newTask = function () {
    $scope.taskModal.show();
  };

  $scope.closeNewTask = function () {
    $scope.taskModal.hide();
  }

  $scope.toggleLeft = function () {
    $ionicSideMenuDelegate.toggleLeft();
  };


  $scope.toggleRight = function () {
    $ionicSideMenuDelegate.toggleRight();
  };
// Try to create the first position, make sure to defer
// this by using $timeout so everything is initialized
// properly
  $timeout(function () {
    if ($scope.positions.length == 0) {
      while (true) {
        var positionCode = prompt('名称:');
        if (positionCode) {
          createPosition(positionCode);
          break;
        }
      }
    }
  });

})
;

todoApp.factory('Positions', function () {
  return {
    all: function () {
      var positionString = window.localStorage['positions'];
      if (positionString) {
        var pos = angular.fromJson(positionString);

        return pos;
      }
      return [];
    },
    get: function (code) {
      var positionString = window.localStorage['positions'];
      if (positionString) {
        var pos = angular.fromJson(positionString);
        for (var i = 0; i < pos.length; i++) {
          if (pos[i].code == code) {
            return pos[i];
          }
        }
        return null;
      }
      return [];
    },
    saveOne: function (position) {
      var allPos = this.all();
      for (var i = 0; i < allPos.length; i++) {
        if (allPos[i].code == position.code) {
          allPos[i] = position;
          this.save(allPos);
        }
      }
    },
    save: function (positions) {
      window.localStorage['positions'] = angular.toJson(positions);
    }
    ,
    newPosition: function (positionCode) {
      // Add a new position
      return {
        code: positionCode
      };
    }
    ,
    getLastActiveIndex: function () {
      return parseFloat(window.localStorage['lastActivePosition']) || 0;
    }
    ,
    setLastActiveIndex: function (index) {
      window.localStorage['lastActivePosition'] = index;
    }
    ,
    delPositon: function (index) {

      var positionString = window.localStorage['positions'];
      if (positionString) {
        var pos = angular.fromJson(positionString);


        if (isNaN(index) || index > pos.length) {
          return false;
        }
        for (var i = 0, n = 0; i < pos.length; i++) {
          if (pos[i] != pos[index]) {
            pos[n++] = pos[i];
          }
        }
        pos.length -= 1;
        window.localStorage['positions'] = angular.toJson(pos);
      }
    }
  }
})
