//logs.js
const app = getApp()
import utils from '../../../utils/util.js';
Page({
  data: {
    mobile: '',
    password: '',
    userInfo: {},
    hasUserInfo: false,
    canIUse: dd.canIUse('button.open-type.getUserInfo'),
    openid: '',
    index: 0,
    countryName: ['+86 中国'],
    countryList: [{country: "中国", dialCode: "+86"}]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    }
    this.countryList()
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
  onReachBottom: function() {

  },
  phoneInput: function(e) {
    this.setData({
      mobile: e.detail.value
    })
  },
  passwordInput: function(e) {
    this.setData({
      password: e.detail.value
    })
  },
  loginBtn: function(e) {
    if (!(this.data.mobile && /^1[3456789]\d{9}$/.test(this.data.mobile))) {
      utils.showToast('请输入正确格式的手机号',1000);
      return;
    }
    if (!this.data.password) {
      utils.showToast('请输入密码',1000);
      return;
    }
    this.requestLogin();
  },
  // 登录
  requestLogin: function(logintype) {
    var that = this;
    var sendData = {
      areaCode: that.data.countryList[that.data.index].dialCode,
      loginType: 0,
      userPhone: that.data.mobile,
      userPwd: that.data.password
    }
    console.log(sendData)
    var callBack = {
      success: function(e) {
        console.log('成功：'+e)
        if (e.data.status == '0000') {
          dd.setStorageSync({key:'loginInfo', data:e.data.res_data});
          app.globalData.loginInfo = e.data.res_data;
        } else {
          utils.showToast(e.data.message,1000);
          return;
        }
        if (e.data.res_data.userStatus == 1) {
          var pages = getCurrentPages();
          if (pages.length > 1) {
            let pages = getCurrentPages();
            let prevPage = pages[pages.length - 2];
            dd.switchTab({
              url: '../../schedule/index',
            })
          } else {
            dd.switchTab({
              url: '../../schedule/index',
            })
          }
        } else if (e.data.res_data.userStatus == null || e.data.res_data.userStatus == "" || e.data.res_data.userStatus == 0) { //新加入
          dd.navigateTo({
            url: '../companyId/companyId',
          })

        } else if (e.data.res_data.userStatus == 2) { //待审核
          dd.redirectTo({
            url: '../loginResult/loginResult',
          })
        } else {
          utils.showToast(e.data.res_message,1000);
        }
      },
      fail: function(e) {
        console.log('失败：'+e)
        utils.showToast( e.errMsg,1000);
      }
    }
    utils.ajax(utils.setURL('/user/appletLogin'), sendData, callBack);
  },
  getUserInfo: function(e) {
    //console.log(e)
    var that = this;
    if (e.detail.userInfo != undefined) {
      app.globalData.userInfo = e.detail.userInfo
      that.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      })
      that.payCode();
    } else {
      dd.openSetting({
        success: function(data) {
          if (data) {
            if (data.authSetting["scope.userInfo"] == true) {
              loginStatus = true;
              dd.getUserInfo({
                withCredentials: false,
                success: function(data) {
                  console.info("2成功获取用户返回数据");
                  console.info(data.userInfo);
                  app.globalData.userInfo = data.userInfo;
                  that.setData({
                    userInfo: e.detail.userInfo,
                    hasUserInfo: true
                  })
                  that.payCode();
                },
                fail: function() {
                  console.info("2授权失败返回数据");
                  that.loginBtn(1);
                }
              });
            }
          }
        },
        fail: function() {
          console.info("设置失败返回数据");
          that.loginBtn(1);
        }
      });
    }
  },
  userInfo: function() {
    var that = this;
    //console.log(app.globalData.userInfo)
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
      fail: function(e) { }
    }
    utils.ajax(utils.setURL('/user/saveWxUserInfo'), sendData, callBack);
  },
  payCode: function(formid) {
    var that = this;
    dd.login({
      success(rescode) {
        var sendData = {

        }
        var url = utils.setURL('/pay/wxopid') + '?wxCode=' + rescode.code;
        dd.request({
          url: url,
          method: 'get',
          data: JSON.stringify(sendData),
          header: {
            "Content-Type": "application/json;charset=utf-8"
          },
          success: function(res) {
            if (res.data.code == 0) {
              that.setData({
                openid: res.data.res_data.openid
              })
              that.loginBtn(1);
            } else {
              utils.showToast('获取openid失败',1000);
              that.loginBtn(1);
            }
          },
          fail: function(res) {
            utils.showToast(res.errMsg,1000);
            that.loginBtn(1);
          }
        })

      },
      fail(res) {
        utils.showToast('获取授权code失败',1000);
        that.loginBtn(1);
      }
    })
  },
  clearClick: function(e) {
    var type = e.currentTarget.dataset.type;
    if (type == 1) {
      this.setData({
        mobile: ''
      })
    } else {
      this.setData({
        password: ''
      })
    }
  },
  bindPickerChange: function(e) {
    this.setData({
      index: e.detail.value
    })
  }, countryList: function(e) {
    var that = this;
    var sendData = {
        ceshi:1
    }
    var callBack = {
      success: function(e) {
        if (e.data.status == '0000') {
          var list = []
          var index = 0
          for (var i = 0; i < e.data.res_data.length; i++) {
            list.push(e.data.res_data[i].dialCode + ' ' + e.data.res_data[i].country)
            if (e.data.res_data[i].dialCode == '+86') {
              index = i
            }
          }
          that.setData({
            countryList: e.data.res_data,
            countryName: list,
            index: index
          })
        } else {
          utils.showToast(e.data.message, 1000)
        }
      },
      fail: function(e) {
        console.log(e.errorMessage)
        utils.showToast(e.errorMessage, 1000)
      }
    }
    var url = '/areaCode/getAll';
    utils.ajax(utils.setURL(url), sendData, callBack, 'GET');
  }
})