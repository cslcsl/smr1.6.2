const app = getApp()
const utils = require('../../../utils/util.js')
Page({

    /**
     * 页面的初始数据
     */
	data: {
		labelList: ['补水', '清洁', '设备使用', '故障维修'],
		alertState: false,
		dataList: [],
		index: 0,
		textarea: '',
		focus: false,
		serviceAdd: true
	},

    /**
     * 生命周期函数--监听页面加载
     */
	onLoad: function (options) {
		this.meetingList();
	},

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
	onReady: function () {

	},

    /**
     * 生命周期函数--监听页面显示
     */
	onShow: function () {

	},

    /**
     * 生命周期函数--监听页面隐藏
     */
	onHide: function () {

	},

    /**
     * 生命周期函数--监听页面卸载
     */
	onUnload: function () {

	},

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
	onPullDownRefresh: function () {

	},

    /**
     * 页面上拉触底事件的处理函数
     */
	onReachBottom: function () {

	},
	meetingClick: function (e) {
		this.setData({
			alertState: true,
			index: e.currentTarget.dataset.index
		})
	},
	maskBg: function () {
		this.setData({
			alertState: false
		})
	},
	meetingList: function () {
		var that = this;
		var sendData = {}
		var callBack = {
			success: function (e) {
				if (e.data.status == '0000') {
					that.setData({
						dataList: e.data.res_data
					})
				}
			},
			fail: function (e) {
				utils.showToast(e.errMsg, 1000)
			}
		}
		var url = '/operate/meetings';
		utils.ajax(utils.setURL(url), sendData, callBack, 'GET');
	},
	labelClick: function (e) {
		var that = this;
		that.setData({
			focus: false
		})
		setTimeout(function () {
			that.setData({
				textarea: that.data.textarea + "" + e.currentTarget.dataset.value
			})
		}, 100)
	},
	textarea: function (e) {
		this.setData({
			textarea: e.detail.value
		})
	},
	confirm: function () {
		var that = this;
		if (that.data.serviceAdd) {
			that.setData({
				serviceAdd: false
			})
			if (that.data.textarea == '' || that.data.textarea.length > 300) {
				utils.showToast('服务内容不能为空', 1000)
				return;
			}
			if (that.data.textarea.length > 300) {
				utils.showToast('服务内容不能超过300个字', 1000)
				return;
			}
			var sendData = {
				content: that.data.textarea,
				mroomId: that.data.dataList[that.data.index].mroomId,
				mroomName: that.data.dataList[that.data.index].mroomName,
				orderId: that.data.dataList[that.data.index].orderId,
			}
			var callBack = {
				success: function (e) {
					if (e.data.status == '0000') {
						that.setData({
							textarea: ''
						})
						dd.navigateTo({
							url: '../serviceSuccess/serviceSuccess?bookId=' + that.data.dataList[that.data.index].bookId,
						})
					} else {
						utils.showToast(e.data.message, 1000)
					}
					that.setData({
						serviceAdd: true
					})
				},
				fail: function (e) {
					utils.showToast(e.errMsg, 1000)
					that.setData({
						serviceAdd: true
					})
				}
			}
			var url = '/operate/call/add';
			utils.ajax(utils.setURL(url), sendData, callBack);
		}
	}
})