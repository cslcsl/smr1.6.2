//logs.js
const app = getApp()
const utils = require('../../../utils/util.js')
Page({
    data: {
        mobile: '',
        password: '',
        userInfo: {},
        hasUserInfo: false,
        canIUse: dd.canIUse('button.open-type.getUserInfo'),
        openid: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        console.log(app.globalData.userInfo);
        console.log(app.globalData.loginInfo);
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
    passwordInput: function(e) {
        this.setData({
            password: e.detail.value
        })
    },
    userInfo: function() {
        var that = this;
        if (that.data.password.length > 5 && that.data.password.length < 17) {
            var sendData = {
                countryCode: app.globalData.loginInfo.areaCode,
                openId: app.globalData.loginInfo.openId,
                userGender: app.globalData.userInfo.gender,
                userIconUrl: app.globalData.userInfo.avatarUrl,
                userName: app.globalData.userInfo.nickName,
                userPhone: app.globalData.loginInfo.userPhone,
                userPwd: that.data.password,
				unionid: app.globalData.loginInfo.unionid,
            }
            var callBack = {
                success: function(e) {
                    if (e.data.status == '0000') {
                        that.requestLogin();
                    }
                },
                fail: function(e) {}
            }
            utils.ajax(utils.setURL('/user/appletRegister'), sendData, callBack);
        } else {
            utils.showToast('请输入正确格式的6-16位密码', 1000)
        }
    },

    // 登录
    requestLogin: function(logintype) {
        var that = this;
        var sendData = {
            userPhone: app.globalData.loginInfo.userPhone,
            userPwd: that.data.password
        }
        var callBack = {
            success: function(e) {
                if (e.data.status == '0000') {
					dd.setStorageSync({key:'loginInfo', data:e.data.res_data});
                    app.globalData.loginInfo = e.data.res_data;
                }
                if (e.data.res_data.userStatus == 1) {
                    var pages = getCurrentPages();
                    if (pages.length > 1) {
                        let pages = getCurrentPages();
                        let prevPage = pages[pages.length - 2];
                        // dd.navigateBack({
                        //     delta: 2,
                        // })
                        dd.switchTab({
                            url: '../../schedule/index',
                        })
                    } else {
                        dd.switchTab({
                            url: '../../schedule/index',
                        })
                    }
                } else if (e.data.res_data.userStatus == null || e.data.res_data.userStatus == "" || e.data.res_data.userStatus == 0) { //新加入
                    dd.redirectTo({
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
                utils.showToast(e.errMsg,1000);
            }
        }
        utils.ajax(utils.setURL('/user/appletLogin'), sendData, callBack);
    }
})