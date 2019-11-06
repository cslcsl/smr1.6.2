// pages/schedule/scanCode/scanCode.js

/*
  扫码类型为4位 前2位定义为大类   后两位定义为一大类中的各种小类   
  0101  扫码签到
*/

const app = getApp()
const utils = require('../../../utils/util.js')
const QR = require('../../../utils/qrcode.js')

Page({
  data: {
    list: [],
    size: [],
    imagePath: '',
    showSign: false,
    canvasHidden: false,
    isShowQR: true,
    bookId: 0,
    totalNumber: 0,
    isOriginator: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      size: this.setCanvasSize(),
      bookId: options.id
    })
    //获取会议信息
    this.meetingDetail();
    //请求会议签到状态
    this.getSignList();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {},
  userInfo: function() {
    var that = this;
    var sendData = {
      avatarUrl: app.globalData.userInfo.avatarUrl,
      city: app.globalData.userInfo.city,
      country: app.globalData.userInfo.country,
      gender: app.globalData.userInfo.gender,
      language: app.globalData.userInfo.language,
      nickName: app.globalData.userInfo.nickName,
      province: app.globalData.userInfo.province,
      phone: that.data.mobile,
      openId: that.data.openid
    }
    var callBack = {
      success: function(e) {
        if (e.data.code == 0) {
          app.globalData.userInfoState = true;
        }
      },
      fail: function(e) {}
    }
    utils.ajax(utils.setURL('/user/saveWxUserInfo'), sendData, callBack);
  },


  qrClick: function() {
    var that = this;
    //是发起人则显示二维码
    if (that.data.isOriginator) {
      if (that.data.imagePath == '') {
        that.setData({
          size: that.setCanvasSize(),
          showSign: true
        })
		  var qrCode = '{"type":"0101","data":{"id":"' + that.data.bookId + '"}}';
        //生成二维码
        that.createQrCode(qrCode, "mycanvas", that.data.size.w, that.data.size.h);
      } else {
        that.setData({
          isShowQR: false,
          showSign: true
        })
      }
    } else {
      dd.scan({
        success(res) {
          var resultStr = res.result;
          if (resultStr != '' && resultStr != null) {
            var qrCodeDict = JSON.parse(resultStr);

            if (qrCodeDict.type == '0101') {
              console.log(qrCodeDict.data.id);
              var idNumber = qrCodeDict.data.id;
              if (idNumber != '' && idNumber != null) {
				  that.sign(idNumber, qrCodeDict.data.mroomId);
              }
            } else {
              utils.showToast(resultStr,1000)
            }
          }
        }
      })
    }
  },

  stopSign: function() {
    this.setData({
      showSign: false
    })
  },

  setCanvasSize: function() {
    var size = {};
    try {
      var res = dd.getSystemInfoSync();
      //不同屏幕下canvas的适配比例；设计稿是750宽 686是因为样式wxss文件中设置的大小
      var scale = 750 / 686;
      var width = res.windowWidth / scale;
      var height = width; //canvas画布为正方形
      size.w = width;
      size.h = height;
    } catch (e) {
      // Do something when catch error
      console.log("获取设备信息失败" + e);
    }
    return size;
  },
  createQrCode: function(url, canvasId, cavW, cavH) {
    //调用插件中的draw方法，绘制二维码图片
    QR.api.draw(url, canvasId, cavW, cavH);
    setTimeout(() => {
      this.canvasToTempImage();
    }, 500);
  },
  canvasToTempImage: function() {
    var that = this;
    //把当前画布指定区域的内容导出生成指定大小的图片，并返回文件路径。
    dd.canvasToTempFilePath({
      canvasId: 'mycanvas',
      success: function(res) {
        var tempFilePath = res.tempFilePath;
        console.log(tempFilePath);
        that.setData({
          imagePath: tempFilePath,
        });
		
      },
      fail: function(res) {
        console.log(res);
      }
    });
  },

  getSignList: function() {
    var that = this;
    var sendData = {};
    var callBack = {
      success: function(e) {
        if (e.data.status == '0000') {
          var list1 = e.data.res_data;
          that.setData({
            list: list1
          })
        } else {
          utils.showToast(e.data.message,1000);
        }
      },
      fail: function(e) {
          console.log(e)
        utils.showToast(e.errMsg,1000);
      }
    }
    utils.ajax(utils.setURL('/signin/list/' + this.data.bookId), sendData, callBack, 'GET');
  },
  //签到
	sign: function (bookID, mroomId) {
    var that = this;
	  if (mroomId == undefined || mroomId == null || mroomId == '') {
		  mroomId = ''
	  }
    var sendData = {};
    var callBack = {
      success: function(e) {
        if (that.data.bookId != bookID) {
          dd.navigateTo({
            url: '../scanCode/scanCode?id=' + bookID,
          })
          return;
        }

        if (e.data.status == '0000') {
          utils.showToast('签到成功',1000);
          that.getSignList();
        } else if (e.data.status == '5027') { //不是会议参与人
          dd.confirm({
            title: '签到失败',
            content: '您不是此次会议的参与人员，请确认二维码是否正确',
            showCancel: false,
            confirmButtonText: '确认',
            confirmColor: '#1874EC',
          })
        } else {
          utils.showToast(e.data.message,1000);
        }
      },
      fail: function(e) {
        utils.showToast(e.errMsg,1000);
      }
    }
	  utils.ajax(utils.setURL('/signin/signins?bookId=' + bookID + '&mroomId=' + mroomId), sendData, callBack, 'PUT');
  },

  meetingDetail: function(e) {
    var that = this;
    var sendData = {}
    console.log(JSON.stringify(sendData));
    var callBack = {
      success: function(e) {
        if (e.data.status == '0000') {
          var isHost = false;
          if (app.globalData.loginInfo.userId == e.data.res_data.createUserId) {
            isHost = true;
          }
          var meetingCount = e.data.res_data.externalStaff.meetingCount;
          that.setData({
            totalNumber: meetingCount,
            isOriginator: isHost
          })
        //   console.log(e.data);
        } else {
          utils.showToast(e.data.message,1000);
        }
      },
      fail: function(e) {
        utils.showToast(e.errMsg,1000);
      }
    }
    var url = '/conference/findMeetingDetailByBookId?bookId=' + that.data.bookId;
    utils.ajax(utils.setURL(url), sendData, callBack, 'GET');
  }
})