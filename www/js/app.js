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


todoApp.controller('TodoController', function ($scope, $timeout, $ionicModal, Positions, $ionicSideMenuDelegate) {

  // A utility function for creating a new position
  // with the given positionTitle
  var createPosition = function (positionTitle) {
    var newPosition = Positions.newPosition(positionTitle);
    $scope.positions.push(newPosition);
    Positions.save($scope.positions);
    $scope.selectPosition(newPosition, $scope.positions.length - 1);
  }


  // Load or initialize positions
  $scope.positions = Positions.all();


  // Grab the last active, or the first position
  $scope.activePosition = $scope.positions[Positions.getLastActiveIndex()];


  // Called to create a new position
  $scope.newPosition = function () {
    var positionTitle = prompt('名称');
    if (positionTitle) {
      createPosition(positionTitle);
    }
  };

  // Called to select the given position
  $scope.selectPosition = function (position, index) {
    Positions.setLastActiveIndex(index);
    $scope.activePosition = $scope.positions[Positions.getLastActiveIndex()];
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
        var positionTitle = prompt('名称:');
        if (positionTitle) {
          createPosition(positionTitle);
          break;
        }
      }
    }
  });

});

function fillPosition(Position) {
  if (Position) {
    //建议仓位数量
    Position.advicePosition = Position.totalFund * Position.positionRC / (100 * Position.initialATR * 3);
    //建议仓位金额
    Position.advicePosFund = Position.advicePosition * Position.initialPrice;
    //止损价
    Position.stopPercent = Position.stopAM * ( Position.initialATR / Position.initialPrice);

    Position.stopFund = Position.stopPercent * Position.initialCount * Position.initialPrice;

    Position.lowStopPrice = Position.initialPrice * (1 - Position.stopPercent);

    Position.highStopPrice1 = Position.initialPrice * (1 + Position.stopPercent * 2);

    Position.highStopPrice2 = Position.initialPrice * (1 + Position.stopPercent * 4);

    Position.highStopPrice3 = Position.initialPrice * (1 + Position.stopPercent * 6);

    Position.advicePosition = Position.advicePosition.toFixed(2);
    Position.advicePosFund = Position.advicePosFund.toFixed(2);
    Position.lowStopPrice = Position.lowStopPrice.toFixed(2);
    Position.stopFund = Position.stopFund.toFixed(2);
    Position.stopPercent = Position.stopPercent.toFixed(2);
    Position.highStopPrice1 = Position.highStopPrice1.toFixed(2);
    Position.highStopPrice2 = Position.highStopPrice2.toFixed(2);
    Position.highStopPrice3 = Position.highStopPrice3.toFixed(2);
  }
}

todoApp.factory('Positions', function () {
  return {
    all: function () {
      var positionString = window.localStorage['positions'];
      if (positionString) {
        var pos = angular.fromJson(positionString);
        for (var i = 0; i < pos.length; i++) {
          fillPosition(pos[i]);
        }

        return pos;
      }
      return [];
    },
    save: function (positions) {
      window.localStorage['positions'] = angular.toJson(positions);
    }
    ,
    newPosition: function (positionTitle) {
      // Add a new position
      return {
        title: positionTitle
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
