var todoApp = angular.module('todoApp', ['ionic']);

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


todoApp.controller('TodoController', function ($scope, $timeout, $ionicModal, Positions, $ionicSideMenuDelegate, $http) {

  $scope.openDayGif = function (code) {
    window.open("http://image.sinajs.cn/newchart/daily/n/" + code + ".gif", "_blank", "location=no,toolbar=no");
  };

  $scope.openMinGif = function (code) {
    window.open("http://image.sinajs.cn/newchart/min/n/" + code + ".gif", "_blank", "location=no,toolbar=no");
  };

  $scope.refreshAll = function () {
    $timeout(function () {
      var positions = Positions.all();
      for (var i = 0; i < positions.length; i++) {
        loadRunTimeData(positions[i]);
        fillPosition(positions[i]);

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
      fillPosition(pos);

      $scope.activePosition = pos;

      $scope.$broadcast('scroll.refreshComplete');
    }, 500);

  };

  var loadRunTimeData = function (position) {
    var data = 'hq_str_sz000913="钱江摩托,8.56,8.32,0.75,9.15,8.48,8.75,8.76,31652880,278885232.67,49100,8.75,10700,8.74,73000,8.73,112500,8.72,4300,8.71,12100,8.76,29500,8.77,28000,8.78,43900,8.79,195100,8.80,2015-10-13,11:35:52,00"';
    //var myUrl = "http://hq.sinajs.cn/list=" + position.code;
    //$http.get(myUrl).success(function (data, status, headers, config) {
    var temp = data.split(',')[0];
    position.title = temp.substring(temp.indexOf('"') + 1, temp.length);

    position.todayStart = data.split(',')[1];
    position.yestodayEnd = data.split(',')[2];
    position.currPrice = data.split(',')[3];

    position.currPriceColor = {color: 'blue'};
    if (position.currPrice) {
      if (position.currPrice < position.lowStopPrice)
        position.currPriceColor = {color: 'green'};
      else if (position.lowStopPrice <= position.currPrice && position.currPrice < position.initialPrice)
        position.currPriceColor = {color: 'darkgreen'};
      else if (position.initialPrice <= position.currPrice && position.currPrice < position.highStopPrice1)
        position.currPriceColor = {color: 'orange'};
      else if (position.highStopPrice1 <= position.currPrice && position.currPrice < position.highStopPrice2)
        position.currPriceColor = {color: 'palevioletred'};
      else if (position.highStopPrice2 <= position.currPrice && position.currPrice < position.highStopPrice3)
        position.currPriceColor = {color: 'darkred'};
      else if (position.highStopPrice3 <= position.currPrice)
        position.currPriceColor = {color: 'red'};
    }

    if (position.currPrice && position.initialPrice && position.initialCount) {
      position.currChangePercent = (position.currPrice - position.initialPrice) * 100 / position.initialPrice;
      position.currChange = (position.currPrice - position.initialPrice) * position.initialCount;

      position.currChangePercent = position.currChangePercent.toFixed(3);
      position.currChange = position.currChange.toFixed(2);
    }
    //  }
    //).error(function (data, status, headers, config) {
    //    alert("读取实时信息错误");
    //  }
    //);

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

    fillPosition(pos);
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
    $scope.activePosition.initialATR = position.initialATR;
    $scope.activePosition.positionRC = position.positionRC;
    $scope.activePosition.positionAm = position.positionAm;
    $scope.activePosition.stopAM = position.stopAM;

    loadRunTimeData($scope.activePosition);
    fillPosition($scope.activePosition);
    //
    //$scope.activePosition.tasks.push({
    //  totalFund: task.totalFund,
    //  initialPrice: task.initialPrice,
    //  initialATR: task.initialATR,
    //  positionRC: task.positionRC,
    //  positionAm: task.positionAm,
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

  $scope.togglePositions = function () {
    $ionicSideMenuDelegate.toggleLeft();
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

function fillPosition(position) {
  if (position) {

    //建议仓位数量
    position.advicePosition = position.totalFund * position.positionRC / ( position.initialATR * position.positionAm * 100);
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


    position.advicePosition = position.advicePosition.toFixed(0);
    position.advicePosFund = position.advicePosFund.toFixed(2);
    position.lowStopPrice = position.lowStopPrice.toFixed(2);
    position.stopFund = position.stopFund.toFixed(2);
    position.stopPercent = position.stopPercent.toFixed(3);
    position.highStopPrice1 = position.highStopPrice1.toFixed(2);
    position.highStopPrice2 = position.highStopPrice2.toFixed(2);
    position.highStopPrice3 = position.highStopPrice3.toFixed(2);
  }
}

todoApp.factory('Positions', function () {
  return {
    all: function () {
      var positionString = window.localStorage['positions'];
      if (positionString) {
        var pos = angular.fromJson(positionString);
        //for (var i = 0; i < pos.length; i++) {
        //  fillPosition(pos[i]);
        //}

        return pos;
      }
      return [];
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
      return parseInt(window.localStorage['lastActivePosition']) || 0;
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
