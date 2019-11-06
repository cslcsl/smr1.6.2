const utils = require('../../../utils/util.js')
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        url: '',
        webType: '',
        bookId: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            webType: options.webType,
            bookId: options.bookId,
			url: options.url + '?random=' + Math.random() + '&length=' + options.length + '&webType=' + options.webType + '&bookId=' + options.bookId + '&userId=' + options.userId + '&companyId=' + options.companyId + '&propertyId=' + options.propertyId + '&fileType=' + options.fileType
        })
		console.log(this.data.url)
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {
        //this.msgHandler();
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
        //this.msgHandler();
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {
        //this.msgHandler();
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
    submitBtn: function() {

    },
    onShareAppMessage: function() {
        //this.msgHandler()
    },
    msgHandler: function(json) { //转发时候先执行（h5像小程序传递参数） 
		var that = this;
		console.log(json)
		if (json != undefined) {
			app.globalData.ceshi = 1;
			var info = (json.detail.data)[((json.detail.data).length) - 1]
			console.log(info);
			var list = [];
			for (var i = 0; i < info.datalist.length; i++) {
				// var array = {
				// 	attachmentName: info.datalist[i].res_data.fileName,
				// 	attachmentSize: info.datalist[i].res_data.size,
				// 	attachmentType: info.datalist[i].res_data.type,
				// 	attachmentUrl: info.datalist[i].res_data.pathUrl,
				// }
				var array = {
					attachmentName: info.datalist[i].fileName,
					attachmentSize: info.datalist[i].size,
					attachmentType: info.datalist[i].type,
					attachmentUrl: info.datalist[i].pathUrl,
				}
				list.push(array);
			}
			this.setData({
				value: list
			});
			if (that.data.webType == 2) {
				dd.setStorageSync({key:'addMeetingAttachmentList', data:list})
			}
		}
    }
})