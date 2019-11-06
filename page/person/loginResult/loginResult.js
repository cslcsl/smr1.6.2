//logs.js
const app = getApp()
const utils = require('../../../utils/util.js')
Page({
    data: {
		
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
	cancel: function () {
		var that = this;
		var sendData = {
			userId: app.globalData.loginInfo.userId
		}
		var callBack = {
			success: function (e) {
				if (e.data.status == '0000') {
					dd.redirectTo({
						url: '../companyId/companyId',
					})
				} else {
					utils.showToast(e.data.message,1000);
				}
			},
			fail: function (e) {
				utils.showToast(e.data.errMsg,1000);
			}
		}
		var url = '/companies/apply/' + app.globalData.loginInfo.userId;
		utils.ajax(utils.setURL(url), sendData, callBack, 'DELETE');
	},
})