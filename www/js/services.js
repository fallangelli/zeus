angular.module('zeus.services', [])

  .factory('Positions', function () {
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
      saveOne: function (position, index) {
        var allPos = this.all();
        allPos[index] = position;
        this.save(allPos);
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
      delPosition: function (index) {

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


  .factory('HisData', ['$http', '$q', function ($http, $q) {
    return {

      query: function (numCode, year, quarter) {
        var deferred = $q.defer(); // 声明延后执行，表示要去监控后面的执行
        var myUrl = "http://vip.stock.finance.sina.com.cn/corp/go.php/vMS_MarketHistory/stockid/" + numCode + ".phtml?year=" + year + "&jidu=" + quarter;
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
      } // end query
    };
  }])

  .factory('Chats', function () {
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
