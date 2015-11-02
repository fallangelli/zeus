angular.module('zeus.controllers', [])


  .controller('TodoController', function ($scope, $q, $ionicPopup, $timeout, $ionicActionSheet, $ionicModal, Positions, HisData, ApiEndpoint, $ionicSideMenuDelegate, $http) {
    $scope.updateHisData = function (position, index) {
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
            Positions.saveOne(position, index);


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
              Positions.saveOne(position, index);
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


//300涨
    $scope.open_878002 = function (code) {
      window.open(ApiEndpoint.gf_url + "index_dkgg.jsp?code=878002", "_blank", "location=no,toolbar=no");
    };

//300跌
    $scope.open_878003 = function (code) {
      window.open(ApiEndpoint.gf_url + "index_dkgg.jsp?code=878003", "_blank", "location=no,toolbar=no");
    };


    $scope.open300 = function (code) {
      window.open(ApiEndpoint.img_url + "min/n/sh000300.gif", "_blank", "location=no,toolbar=no");
    };

    $scope.open300k = function (code) {
      window.open(ApiEndpoint.img_url + "daily/n/sh000300.gif", "_blank", "location=no,toolbar=no");
    };


//创业涨
    $scope.open_878004 = function (code) {
      window.open(ApiEndpoint.gf_url + "index_dkgg.jsp?code=878004", "_blank", "location=no,toolbar=no");
    };

//创业跌
    $scope.open_878005 = function (code) {
      window.open(ApiEndpoint.gf_url + "index_dkgg.jsp?code=878005", "_blank", "location=no,toolbar=no");
    };


    $scope.openCY = function (code) {
      window.open(ApiEndpoint.img_url + "min/n/sz399006.gif", "_blank", "location=no,toolbar=no");
    };

    $scope.openCYk = function (code) {
      window.open(ApiEndpoint.img_url + "daily/n/sz399006.gif", "_blank", "location=no,toolbar=no");
    };

//50涨
    $scope.open_878006 = function (code) {
      window.open(ApiEndpoint.gf_url + "index_dkgg.jsp?code=878006", "_blank", "location=no,toolbar=no");
    };

//50跌
    $scope.open_878007 = function (code) {
      window.open(ApiEndpoint.gf_url + "index_dkgg.jsp?code=878007", "_blank", "location=no,toolbar=no");
    };

    $scope.open50 = function (code) {
      window.open(ApiEndpoint.img_url + "min/n/sh000016.gif", "_blank", "location=no,toolbar=no");
    };

    $scope.open50k = function (code) {
      window.open(ApiEndpoint.img_url + "daily/n/sh000016.gif", "_blank", "location=no,toolbar=no");
    };


//500涨
    $scope.open_878008 = function (code) {
      window.open(ApiEndpoint.gf_url + "index_dkgg.jsp?code=878008", "_blank", "location=no,toolbar=no");
    };

//500跌
    $scope.open_878009 = function (code) {
      window.open(ApiEndpoint.gf_url + "index_dkgg.jsp?code=878009", "_blank", "location=no,toolbar=no");
    };

    $scope.open500 = function (code) {
      window.open(ApiEndpoint.img_url + "min/n/sh000905.gif", "_blank", "location=no,toolbar=no");
    };

    $scope.open500k = function (code) {
      window.open(ApiEndpoint.img_url + "daily/n/sh000905.gif", "_blank", "location=no,toolbar=no");
    };

    $scope.openDayGif = function (code) {
      var imgsrc = ApiEndpoint.img_url + "daily/n/" + code + ".gif";
      $scope.showBigImage(imgsrc);
    };

    $scope.openMinGif = function (code) {
      var imgsrc = ApiEndpoint.img_url + "min/n/" + code + ".gif"
      $scope.showBigImage(imgsrc);
    };

    $scope.bigImage = false;    //初始默认大图是隐藏的
    $scope.hideBigImage = function () {
      $scope.bigImage = false;
    };

    $scope.showBigImage = function (imageName) {  //传递一个参数（图片的URl）
      $scope.bigImageUrl = imageName;                   //$scope定义一个变量Url，这里会在大图出现后再次点击隐藏大图使用
      $scope.bigImage = true;                   //显示大图
    };

    $scope.refreshAll = function () {
      $timeout(function () {
        var positions = Positions.all();
        for (var i = 0; i < positions.length; i++) {
          loadRunTimeData(positions[i]);
          $scope.updateHisData(positions[i], i);
          $scope.fillPosition(positions[i], i);
        }

        $scope.positions = positions;


      }, 500);

    };

    $scope.doRefresh = function () {
      $timeout(function () {
        //simulate async response
        Positions.setLastActiveIndex(Positions.getLastActiveIndex());
        var currIndex = Positions.getLastActiveIndex();
        var pos = $scope.positions[currIndex];

        loadRunTimeData(pos);
        $scope.updateHisData(pos, currIndex);
        $scope.fillPosition(pos, currIndex);

        $scope.activePosition = pos;

      }, 500);

    };

    var getQuarterByMonth = function (month) {
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


    var loadRunTimeData = function (position) {
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


      $scope.positions.push(newPosition);
      $scope.updateHisData($scope.positions[$scope.positions.length - 1], $scope.positions.length - 1);

      $scope.selectPosition(newPosition, $scope.positions.length - 1);
    }

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
// Load or initialize positions
    $scope.positions = Positions.all();


// Grab the last active, or the first position
    var currPos = $scope.positions[Positions.getLastActiveIndex()];


    $scope.activePosition = currPos;

// Called to create a new position
    $scope.newPosition = function () {
      $ionicPopup.prompt({
        title: '建仓',
        content: '代码',
        inputType: 'number',
        inputPlaceholder: '代码,6位数字'
      }).then(function (positionCode) {
        var code = positionCode.toString();
        while (code.length < 6) {
          code = '0' + code;
        }

        createPosition(code);
      });
      //var positionCode = prompt('代码，6位数字');
      //if (positionCode) {
      //  createPosition(positionCode);
      //}
    };

// Called to select the given position
    $scope.selectPosition = function (position, index) {

      Positions.setLastActiveIndex(index);
      var pos = $scope.positions[Positions.getLastActiveIndex()];

      loadRunTimeData(pos);
      $scope.updateHisData(pos, Positions.getLastActiveIndex());
      $scope.fillPosition(pos, Positions.getLastActiveIndex());
      $scope.activePosition = pos;
      $ionicSideMenuDelegate.toggleLeft(false);
    };


    $scope.delPosition = function (position, index) {
      Positions.delPosition(index);
      $scope.positions = Positions.all();
      Positions.setLastActiveIndex(0);
      $scope.activePosition = $scope.positions[Positions.getLastActiveIndex()];
      $ionicSideMenuDelegate.toggleLeft(false);
    };


    $scope.fillPosition = function (position, index) {
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

        Positions.saveOne(position, index);
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
      if (!$scope.activePosition.initialATR || typeof($scope.activePosition.initialATR) == 'undefined')
        $scope.activePosition.initialATR = position.currATR;
      $scope.activePosition.positionRC = position.positionRC;
      $scope.activePosition.stopAM = position.stopAM;

      loadRunTimeData($scope.activePosition);
      $scope.updateHisData($scope.activePosition, Positions.getLastActiveIndex());
      $scope.fillPosition($scope.activePosition, Positions.getLastActiveIndex());


      // Inefficient, but save all the positions
      Positions.save($scope.positions);

      $scope.taskModal.hide();


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
          var positionCode = prompt('代码:');
          if (positionCode) {
            createPosition(positionCode);
            break;
          }
        }
      }
    });

  }
)
;
