const app = getApp()
const utils = require('../../../utils/util.js')
Page({

    /**
     * 页面的初始数据
     */
	data: {
		loginState: false,
		contentNull: false,
		loginInfo: null,
		indexVal: 0,
		tabType: '',
		page: 1,
		pageSize: 10,
		payState: false,
		dataListState: false,
		orderRequestState: true,
		tabList: [{
			name: '进行中',
			id: '0',
			tabtype: ''
		}, {
			name: '已完成',
			id: '1',
			tabtype: '2'
		}],
		dataList: [],
	},

    /**
     * 生命周期函数--监听页面加载
     */
	onLoad: function (options) { },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
	onReady: function () {

	},

    /**
     * 生命周期函数--监听页面显示
     */
	onShow: function () {
		this.setData({
			dataList: null,
			dataState: true,
			orderRequestState: true,
			page: 1
		})
		this.orderRequest();
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
		dd.stopPullDownRefresh();
		
		this.setData({
			dataList: null,
			page: 1,
			orderRequestState: true
		})
		this.orderRequest();
	},

    /**
     * 页面上拉触底事件的处理函数
     */
	onReachBottom: function () {
		if (this.data.orderRequestState) {
			this.orderRequest();
		}
	},
	tabClick: function (e) {
		this.setData({
			indexVal: e.currentTarget.dataset.index,
			tabType: e.currentTarget.dataset.type,
			page: 1,
			dataList: null,
			orderRequestState: true
		})
		this.orderRequest();
	},
	orderDetail: function (e) {
		dd.navigateTo({
			url: '../serviceDetail/serviceDetail?id=' + e.currentTarget.dataset.id,
		})
	},
	orderRequest: function () {
		var that = this;
		if (that.data.orderRequestState) {
			if (that.data.page == 1) { //是否请求的是第一页
				that.setData({
					dataList: [],
					orderRequestState: false,
				})
			} else {
				that.setData({
					orderRequestState: false
				})
			}
			// 请求数据中的加载效果
			dd.showLoading({
				title: '加载中...',
			})
			var sendData = {
				page: that.data.page,
				pageSize: that.data.pageSize,
				serviceStatus: that.data.tabType,
				type: 2
			}
			var callBack = {
				success: function (e) {
					dd.stopPullDownRefresh() //停止下拉刷新
					dd.hideLoading();
					if (e.data.status == '0000') {
						if (e.data.res_data.list.length > 0) {
							for (var i = 0; i < e.data.res_data.list.length; i++) {
								that.data.dataList.push(e.data.res_data.list[i])
							}
							that.setData({
								dataList: that.data.dataList,
								dataListState: true,
							})
						}
						if (e.data.res_data.list.length >= that.data.pageSize) {
							that.setData({
								orderRequestState: true,
								dataListState: true,
								page: ++that.data.page
							})
						}
						that.setData({
							dataListState: true,
						})
					} else {
						that.setData({
							dataListState: true,
							orderRequestState: true
						})
						utils.showToast(e.data.message, 1000);
					}
				},
				fail: function (e) {
					dd.stopPullDownRefresh() //停止下拉刷新
					dd.hideLoading();
					that.setData({
						orderRequestState: true
					})
					utils.showToast(e.errMsg, 1000)
				}
			}
			utils.ajax(utils.setURL('/operate/call/select'), sendData, callBack);
		}
	}
})