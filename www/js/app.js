angular.module('zeus', ['ionic', 'zeus.controllers', 'zeus.services'])
  .constant('ApiEndpoint', {
    //his_url: 'http://localhost:8100/his_data/',
    //hq_url: 'http://localhost:8100/real_hq/',
    //gf_url: 'http://localhost:8100/gf/',
    //img_url: 'http://localhost:8100/img_sina/'

    his_url: 'http://vip.stock.finance.sina.com.cn/corp/go.php/vMS_MarketHistory/stockid/',
    hq_url: 'http://hq.sinajs.cn/',
    gf_url: 'http://www.gf.com.cn/match/nxsy/',
    img_url: 'http://image.sinajs.cn/newchart/'
  })

  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
    });
  });
