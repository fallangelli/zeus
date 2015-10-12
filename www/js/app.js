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
        $ionicSideMenuDelegate.toggleLeft(false);
    };

    // Create our modal
    $ionicModal.fromTemplateUrl('new-task.html', function (modal) {
        $scope.taskModal = modal;
    }, {
        scope: $scope
    });

    $scope.createTask = function (task) {
        if (!$scope.activePosition || !task) {
            return;
        }


        $scope.activePosition.tasks.push({
            totalFund: task.totalFund,
            initialPrice: task.initialPrice,
            initialATR: task.initialATR,
            positionRC: task.positionRC,
            positionAm: task.positionAm,
            stopAM: task.stopAM
        });
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


todoApp.factory('Positions', function () {
    return {
        all: function () {
            var positionString = window.localStorage['positions'];
            if (positionString) {
                var pos = angular.fromJson(positionString);
                for (var i = 0; i < pos.length; i++) {
                    if (pos[i].tasks[0]) {
                        pos[i].tasks[0].advicePosition = pos[i].tasks[0].totalFund * pos[i].tasks[0].positionRC / (100 * pos[i].tasks[0].initialATR * 3);
                        pos[i].tasks[0].stopPercent = pos[i].tasks[0].stopAM * ( pos[i].tasks[0].initialATR / pos[i].tasks[0].initialPrice);
                        pos[i].tasks[0].stopPrice = pos[i].tasks[0].initialPrice * (1 - pos[i].tasks[0].stopPercent);
                    }
                }

                return pos;
            }
            return [];
        },
        save: function (positions) {
            window.localStorage['positions'] = angular.toJson(positions);
        },
        newPosition: function (positionTitle) {
            // Add a new position
            return {
                title: positionTitle,
                tasks: []
            };
        },
        getLastActiveIndex: function () {
            return parseInt(window.localStorage['lastActivePosition']) || 0;
        },
        setLastActiveIndex: function (index) {
            window.localStorage['lastActivePosition'] = index;
        }
    }
})
