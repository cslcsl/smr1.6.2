//logs.js
const app = getApp()
const utils = require('../../../utils/util.js')
Page({
    data: {
        list: [],
		date:'',
		webType:1
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
		// webType: 1:新增 2:编辑
		if (options.webType!=undefined){
			this.setData({
				webType: options.webType
			})
		}
		this.setData({
			date: options.date
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
        this.dataList();
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
    dataList: function() {
        var that = this;
        var sendData = {}
        var callBack = {
            success: function(e) {
                if (e.data.status == '0000') {
                    var list = e.data.res_data;
                    for (var i = 0; i < list.length; i++) {
                        list[i].content = JSON.parse(list[i].content)
						// console.log(list[i].content)
                    }
                    that.setData({
                        list: list
                    })
                    // console.log(that.data.list)

                } else {
                    utils.showToast(e.data.message, 1000);
                }
            },
            fail: function(e) {
                utils.showToast(e.errMsg, 1000);
            }
        }
        utils.ajax(utils.setURL('/template/list/templates/1/20'), sendData, callBack);
    },
    stencilClick: function(e) {
        dd.setStorageSync({key:'selectPeopleList', data:[]});
        dd.setStorageSync({key:'hostPeopleList', data:[]});
        dd.setStorageSync({key:'summaryPeopleList', data:[]});
        dd.setStorageSync({key:'addMeetingProcessList', data:[]});
        dd.navigateTo({
            url: e.currentTarget.dataset.url,
        })
    }
})