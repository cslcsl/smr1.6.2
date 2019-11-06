//logs.js
const app = getApp()
const utils = require('../../../utils/util.js')
Page({
    data: {
        companyID: '',
        loginState: false,
        loginInfo: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {

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
        if (app.globalData.loginInfo != null && app.globalData.loginInfo != '') {
            this.setData({
                loginState: true,
                loginInfo: app.globalData.loginInfo
            })
        } else {
            this.setData({
                loginState: false
            })
        }
        console.log(this.data.loginInfo)
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
    companyIDInput: function(e) {
        this.setData({
            companyID: e.detail.value
        })
    },
    loginBtn: function() {
        var that = this;
        var sendData = {
            companyCode: that.data.companyID,
            userId: that.data.loginInfo.userId
        }
        var callBack = {
            success: function(e) {
                if (e.data.status == '0000') {
                    dd.redirectTo({
                        url: '../loginResult/loginResult',
                    })
                } else {
                    utils.showToast(e.data.message, 1000);
                }
            },
            fail: function(e) {
                utils.showToast(e.data.errMsg,1000);
            }
        }
        utils.ajax(utils.setURL('/companies/apply'), sendData, callBack);
    },
})