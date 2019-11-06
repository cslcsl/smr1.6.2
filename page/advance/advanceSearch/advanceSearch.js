const app = getApp()
const utils = require('../../../utils/util.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        searchTitle: '',
        searchList: [],
        selectDate: '',
		fromType:1,
		type:1,
		mroomId:'',
		bookId:''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            selectDate: options.date,
			fromType: options.fromType,
			type: options.type,
			mroomId: options.mroomId,
			bookId: options.bookId,
        })
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
        this.setData({
            searchList: app.globalData.searchTitleList
        })
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

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    },
    searchInput: function(e) {
		var that=this;
		if (that.data.searchList.length > 0) {
			for (var i = 0; i < that.data.searchList.length; i++) {
				if (e.detail.value != that.data.searchList[i]) {
                    app.globalData.searchTitleList.push(e.detail.value)
                }
            }
        } else if (e.detail.value != '') {
            app.globalData.searchTitleList.push(e.detail.value)
        }
        dd.navigateTo({
			url: '../searchResult/searchResult?webType=1&mroomName=' + e.detail.value + '&date=' + that.data.selectDate + '&fromType=' + that.data.fromType + '&type=' + that.data.type + '&bookId=' + that.data.bookId + "&mroomId=" + that.data.mroomId,
        })
    },
    listClick: function(e) {
		var that=this;
        dd.navigateTo({
			url: '../searchResult/searchResult?webType=1&mroomName=' + e.currentTarget.dataset.title + '&date=' + that.data.selectDate + '&fromType=' + that.data.fromType + '&type=' + that.data.type + '&bookId=' + that.data.bookId + "&mroomId=" + that.data.mroomId,
        })
    },
    searchDelete: function() {
        var that = this;
        dd.confirm({
            title: '提示',
            content: '确认删除全部历史记录？',
            cancelButtonText: '取消',
            cancelColor: '#2B7AFB',
            confirmButtonText: '确认',
            confirmColor: '#2B7AFB',
            success(res) {
                if (res.confirm) {
                    app.globalData.searchTitleList = [];
                    that.setData({
                        searchList: []
                    })
                }
            }
        })
    },
    searchCancel: function() {
        dd.navigateBack({
            delta: 1,
        })
    },
    inputClear: function() {
        this.setData({
            searchTitle: ''
        })
    }
})