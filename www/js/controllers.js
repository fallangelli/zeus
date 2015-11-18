angular.module('zeus.controllers', [])

  .controller('DashCtrl', function ($scope, $state, $timeout, $http, $ionicPopup, Positions, ApiEndpoint, HisData) {
    $scope.$on('$ionicView.enter', function (e) {
      $scope.refreshAll();
    });


    $scope.newPosition = function () {
      $ionicPopup.prompt({
        title: '建仓',
        content: '代码',
        inputType: 'number',
        inputPlaceholder: '代码,6位数字'
      }).then(function (positionCode) {
        var code = positionCode.toString();
        if (code.length <= 0)
          return;
        while (code.length < 6) {
          code = '0' + code;
        }

        var newPosition = Positions.newPosition(code);
        if (code.substr(0, 1) == '6')
          newPosition.code = 'sh' + code;
        if (code.substr(0, 1) == '0' || code.substr(0, 1) == '3')
          newPosition.code = 'sz' + code;
        $scope.positions.push(newPosition);
        loadRunTimeData($http, ApiEndpoint, Positions, newPosition);
        updateHisData($scope, HisData, Positions, newPosition);
        Positions.fillPosition(newPosition);

        $timeout(function () {
          $state.go('tab.positions', {}, {reload: true});
        }, 1000);

      });
    };

    $scope.doRefresh = function () {
      this.refreshAll();
    };

    $scope.refreshAll = function () {
      var positions = Positions.all();
      for (var i = 0; i < positions.length; i++) {
        loadRunTimeData($http, ApiEndpoint, Positions, positions[i]);
        updateHisData($scope, HisData, Positions, positions[i]);
        Positions.fillPosition(positions[i]);
      }
      $scope.positions = positions;

      var positions = Positions.all();
      var item = new Object();
      item.currMount = parseFloat(0);
      item.currChangePercent = parseFloat(0);
      item.currChange = parseFloat(0);
      item.currDayMount = parseFloat(0);
      item.currDayPercent = parseFloat(0);
      for (var index in positions) {
        var pos = positions[index];
        if (typeof(pos.currMount) != "undefined")
          item.currMount = parseFloat(item.currMount) + parseFloat(pos.currMount);
        if (typeof(pos.currChangePercent) != "undefined")
          item.currChangePercent = parseFloat(item.currChangePercent) + parseFloat(pos.currChangePercent);
        if (typeof(pos.currChange) != "undefined")
          item.currChange = parseFloat(item.currChange) + parseFloat(pos.currChange);
        if (typeof(pos.currDayChange) != "undefined")
          item.currDayMount = parseFloat(item.currDayMount) + parseFloat(pos.currDayChange);
        if (typeof(pos.currDayChangePercent) != "undefined")
          item.currDayPercent = parseFloat(item.currDayPercent) + parseFloat(pos.currDayChangePercent);
      }
      item.currDayPriceColor = {color: 'blue'};
      if (item.currDayMount <= 0)
        item.currDayPriceColor = {color: 'darkgreen'};
      else
        item.currDayPriceColor = {color: 'darkRed'};

      item.changeColor = {color: 'blue'};
      if (item.currChange <= 0)
        item.changeColor = {color: 'darkgreen'};
      else
        item.changeColor = {color: 'darkRed'};

      item.currMount = item.currMount.toFixed(2);
      item.currChangePercent = item.currChangePercent.toFixed(3);
      item.currChange = item.currChange.toFixed(2);
      item.currDayMount = item.currDayMount.toFixed(2);
      item.currDayPercent = item.currDayPercent.toFixed(3);

      $scope.tranItem = item;
    };


  })

  .controller('PositionsCtrl', function ($scope, $state, $timeout, $http, $ionicPopup, ApiEndpoint, Positions, HisData) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function (e) {
    //$scope.refreshAll();
    //$scope.positions = Positions.all();
    //});
    $scope.positions = Positions.all();


    $scope.delPosition = function (positionID) {
      Positions.delPosition(positionID);
      $scope.positions = Positions.all();
    };


    $scope.refreshAll = function () {
      $timeout(function () {
        var positions = Positions.all();
        for (var i = 0; i < positions.length; i++) {
          loadRunTimeData($http, ApiEndpoint, Positions, positions[i]);
          updateHisData($scope, HisData, Positions, positions[i]);
          Positions.fillPosition(positions[i]);
        }
        $scope.positions = positions;
      }, 500);
    };
  })

  .controller('PositionDetailCtrl', function ($scope, $stateParams, $ionicModal, $timeout, $http, ApiEndpoint, Positions, HisData) {
    $scope.position = Positions.get($stateParams.positionId);

    $scope.openWeekGif = function (code) {
      var imgsrc = ApiEndpoint.img_url + "weekly/n/" + code + ".gif";
      $scope.showBigImage(imgsrc);
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

    $ionicModal.fromTemplateUrl('params.html', function (modal) {
      $scope.taskModal = modal;
    }, {
      scope: $scope
    });
    $scope.saveParams = function (position) {
      if (!position) {
        return;
      }

      if (!position.initialATR || typeof(position.initialATR) == 'undefined')
        position.initialATR = position.currATR;

      // Inefficient, but save all the positions
      Positions.saveOne(position);

      loadRunTimeData($http, ApiEndpoint, Positions, position);
      updateHisData($scope, HisData, Positions, position);
      Positions.fillPosition(position);


      $scope.taskModal.hide();
    };

    $scope.setParams = function () {
      $scope.taskModal.show();
    };

    $scope.closeParams = function () {
      $scope.taskModal.hide();
    }

    $scope.doRefresh = function () {

      $timeout(function () {
        //simulate async response
        var pos = $scope.position;
        loadRunTimeData($http, ApiEndpoint, Positions, pos);
        updateHisData($scope, HisData, Positions, pos);
        Positions.fillPosition(pos);
      }, 500);
    };
  })

  .controller('AccountCtrl', function ($scope, $http, ApiEndpoint) {
    $scope.bigImage = false;    //初始默认大图是隐藏的
    $scope.hideBigImage = function () {
      $scope.bigImage = false;
    };

    $scope.showBigImage = function (imageName) {  //传递一个参数（图片的URl）
      $scope.bigImageUrl = imageName;                   //$scope定义一个变量Url，这里会在大图出现后再次点击隐藏大图使用
      $scope.bigImage = true;                   //显示大图
    };

    $scope.open_sh000001 = function (code) {
      var imgsrc = ApiEndpoint.img_url + "min/n/sh000001.gif";
      $scope.showBigImage(imgsrc);
    };

    $scope.open_sh000001d = function (code) {
      var imgsrc = ApiEndpoint.img_url + "daily/n/sh000001.gif";
      $scope.showBigImage(imgsrc);
    };

    $scope.open_sh000001w = function (code) {
      var imgsrc = ApiEndpoint.img_url + "weekly/n/sh000001.gif";
      $scope.showBigImage(imgsrc);
    };

    $scope.open_sz399001 = function (code) {
      var imgsrc = ApiEndpoint.img_url + "min/n/sz399001.gif";
      $scope.showBigImage(imgsrc);
    };

    $scope.open_sz399001d = function (code) {
      var imgsrc = ApiEndpoint.img_url + "daily/n/sz399001.gif";
      $scope.showBigImage(imgsrc);
    };

    $scope.open_sz399001w = function (code) {
      var imgsrc = ApiEndpoint.img_url + "weekly/n/sz399001.gif";
      $scope.showBigImage(imgsrc);
    };
//300涨
    $scope.open_878002 = function (code) {
      window.open(ApiEndpoint.gf_url + "index_dkgg.jsp?code=878002", "_blank", "location=no,toolbar=no");
    };

//300跌
    $scope.open_878003 = function (code) {
      window.open(ApiEndpoint.gf_url + "index_dkgg.jsp?code=878003", "_blank", "location=no,toolbar=no");
    };


    $scope.open300 = function (code) {
      var imgsrc = ApiEndpoint.img_url + "min/n/sh000300.gif";
      $scope.showBigImage(imgsrc);
    };

    $scope.open300k = function (code) {
      var imgsrc = ApiEndpoint.img_url + "daily/n/sh000300.gif";
      $scope.showBigImage(imgsrc);
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
      var imgsrc = ApiEndpoint.img_url + "min/n/sz399006.gif";
      $scope.showBigImage(imgsrc);
    };

    $scope.openCYk = function (code) {
      var imgsrc = ApiEndpoint.img_url + "daily/n/sz399006.gif";
      $scope.showBigImage(imgsrc);
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
      var imgsrc = ApiEndpoint.img_url + "min/n/sh000016.gif";
      $scope.showBigImage(imgsrc);
    };

    $scope.open50k = function (code) {
      var imgsrc = ApiEndpoint.img_url + "daily/n/sh000016.gif";
      $scope.showBigImage(imgsrc);
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
      var imgsrc = ApiEndpoint.img_url + "min/n/sh000905.gif";
      $scope.showBigImage(imgsrc);
    };

    $scope.open500k = function (code) {
      var imgsrc = ApiEndpoint.img_url + "daily/n/sh000905.gif";
      $scope.showBigImage(imgsrc);
    };
  });

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
