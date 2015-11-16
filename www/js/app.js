
angular.module('zeus', ['ionic', 'zeus.controllers', 'zeus.services'])
  .constant('ApiEndpoint', {
    his_url: 'http://localhost:8100/his_data/',
    hq_url: 'http://localhost:8100/real_hq/',
    gf_url: 'http://localhost:8100/gf/',
    img_url: 'http://localhost:8100/img_sina/'

    //his_url: 'http://vip.stock.finance.sina.com.cn/corp/go.php/vMS_MarketHistory/stockid/',
    //hq_url: 'http://hq.sinajs.cn/',
    //gf_url: 'http://www.gf.com.cn/match/nxsy/',
    //img_url: 'http://image.sinajs.cn/newchart/'
  })

  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleLightContent();
      }
    });
  })

  .config(function ($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

      // setup an abstract state for the tabs directive
      .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
      })

      // Each tab has its own nav history stack:

      .state('tab.dash', {
        url: '/dash',
        views: {
          'tab-dash': {
            templateUrl: 'templates/tab-dash.html',
            controller: 'DashCtrl'
          }
        }
      })

      .state('tab.positions', {
        url: '/positions',
        views: {
          'tab-positions': {
            templateUrl: 'templates/tab-positions.html',
            controller: 'PositionsCtrl'
          }
        }
      })
      .state('tab.chat-detail', {
        url: '/positions/:positionId',
        views: {
          'tab-positions': {
            templateUrl: 'templates/position-detail.html',
            controller: 'PositionDetailCtrl'
          }
        }
      })

      .state('tab.account', {
        url: '/account',
        views: {
          'tab-account': {
            templateUrl: 'templates/tab-account.html',
            controller: 'AccountCtrl'
          }
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/dash');

    });
