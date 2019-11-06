const app = getApp()
function setURL(expendURL) {
    //var baseURl = "http://192.168.31.5:8879";//昌慧环境
    // var baseURl = "http://192.168.31.222:8879"; //黄雨环境
    // var baseURl = "http://192.168.31.38:8879";//文琪环境
    //var baseURl = "http://139.196.210.91:8879";//本地测试环境
    // var baseURl = "http://192.168.31.43:8879";//余俊杰测试环境
    // var baseURl = "http://192.168.31.131:8879";//张晓亮测试环境
    // var baseURl = "https://dsmrapi.distrii.com"; //测试生产环境
    // var baseURl = "https://tsmrapi.distrii.com"; //测试生产环境
      var baseURl = "https://bsmrapi.distrii.com";//预生产环境
    // var baseURl = "https://smrapi.distrii.com";//生产环境
    return (baseURl + expendURL);
};

function showToast(message, time) {
    dd.showToast({
        content: message + '',
        duration: time,
    });
}

function propertyid() {
    return 1;
};

//因为每次调接口都需要在这里签名一下，将接口调用封装到这里。
//第一个参数是请求的url，第二个参数是所传值，第三个是接收回调
function ajax(url, sendData, callback, ajaxType) {
    app.globalData.loginInfo = dd.getStorageSync({ key: 'loginInfo' }).data;
    if (ajaxType != undefined && ajaxType != '') {
        var ajaxType = ajaxType;
        sendData = ''
    } else {
        var ajaxType = 'POST';
        sendData =  JSON.stringify(sendData)
    }
      if (app.globalData.loginInfo != '' && app.globalData.loginInfo != null) {
        var headerList = {
          "Content-Type": "application/json;charset=utf-8",
          "platform": 'APPLET',
          "token": '',
          "userId": app.globalData.loginInfo.userId+'',
          "companyId": app.globalData.loginInfo.companyId+'',
          "propertyId": app.globalData.loginInfo.propertyId+'',
          "weixinType": '1'
        }
      } else {
        var headerList = {
            "Content-Type": "application/json;charset=utf-8",
            "platform": 'APPLET',
            "token": '',
            "userId": '100437',
            "companyId": 'f521b7cafb0849e2be538e62d9dc3995',
            "propertyId": '41',
            "weixinType": '1'
        }
      }
    dd.httpRequest({
        url: url,
        method: ajaxType,
        data: sendData,
        headers: headerList,
        success: function(res) {
            callback.success(res);
        },
        fail: function(res) {
            callback.fail(res);
        }
    })
}

function getNewInboxNumber() {
    //长链接
    var baseUrl = setURL('');
    baseUrl = baseUrl.split('//')[1]
    var url = 'wss://' + baseUrl + '/websocket/' + app.globalData.loginInfo.userId + '/' + app.globalData.loginInfo.companyId;
    //   console.log(url)
    dd.connectSocket({
        url: url,
        success: function(res) {
            console.log('连接成功1:');
        },
        fail: function(res) {
            console.log('连接失败:');
        }
    })
    dd.onSocketOpen(function(res) {
    })
    dd.onSocketError(function(res) {
        console.log('错误：');
    })
    dd.onSocketMessage(function(res) {
        var dataDict = JSON.parse(res.data);
        if (dataDict.code == 1001) {
            var dataDict = dataDict.data;
            var number = dataDict.todoCount;
            if (number > 0) {
                var todoNo = number.toString();
                // dd.setTabBarBadge({
                //     index: 3,
                //     text: todoNo,
                // })
                app.globalData.todoNumber = todoNo;
            } else {
                // dd.removeTabBarBadge({
                //     index: 3,
                // })
                app.globalData.todoNumber = 0;
            }
        } else if (dataDict.code == 1002) {
            var number = dataDict.data;
            if (number > 0) {
                var todoNo = number.toString();
                // dd.setTabBarBadge({
                //     index: 3,
                //     text: todoNo,
                // })
                app.globalData.todoNumber = todoNo;
            } else {
                // dd.removeTabBarBadge({
                //     index: 3,
                // })
                app.globalData.todoNumber = 0;
            }
        }
    })
    dd.onSocketClose(function(res) {
        var baseUrl = setURL('');
        baseUrl = baseUrl.split('//')[1]
        if (app.globalData.loginInfo != null && app.globalData.loginInfo != '') {
            setTimeout(function() {
                // dd.connectSocket({
                //     url: 'wss://' + baseUrl + '/websocket/' + app.globalData.loginInfo.userId + '/' + app.globalData.loginInfo.companyId,
                //     success: function(res) {
                //     },
                //     fail: function(res) {
                //     }
                // })
            }, 1000) //延迟时间 
        }
    })
}

function todoNumber() {
    if (app.globalData.todoNumber != 0) {
        // dd.setTabBarBadge({
        //     index: 3,
        //     text: app.globalData.todoNumber,
        // })
    }
}
module.exports = {
    ajax: ajax,
    setURL: setURL,
    propertyid: propertyid,
    showToast: showToast,
    todoNumber: todoNumber,
    getNewInboxNumber: getNewInboxNumber
}