const app = getApp()
const utils = require('../../../utils/util.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        id: '',
        searchTitle: '',
        userList: [],
        bookId: '',
        page: 1,
        pageSize: 10,
        begin: '',
        end: '',
        index: -1,
        dataState: true,
        webType: '',
		date: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            id: options.id,
            begin: options.begin,
            end: options.end,
            page: 1,
            webType: options.type,
			date: options.date
        })
        if (options.type == 2) {
            var begin = options.date + ' ' + (options.begin).substring(0, 2) + ':' + (options.begin).substring(2, 4) + ':00';
            var end = options.date + ' ' + (options.end).substring(0, 2) + ':' + (options.end).substring(2, 4) + ':00';
            this.setData({
                begin: begin,
                end: end
            })
        }
        this.dataList();
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
        dd.stopPullDownRefresh();
        
        this.setData({
            userList: null,
            dataState: true,
            page: 1
        })
        this.dataList();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        if (this.data.dataState) {
            this.dataList();
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    },
    searchInput: function(e) {
        var value = e.detail.value;
        this.setData({
            searchTitle: value,
			page:1
        })
        this.dataList();
    },
    dataList: function() {
        var that = this;
        var sendData = {
            param: that.data.searchTitle,
            page: that.data.page,
            pageSize: that.data.pageSize
        }
        if (that.data.page == 1) {
            that.setData({
                userList: []
            })
        }
        that.setData({
            dataState: false
        })
        var callBack = {
            success: function(e) {
                if (e.data.status == '0000') {
                    if (e.data.res_data.length > 0) {
                        for (var i = 0; i < e.data.res_data.length; i++) {
                            e.data.res_data[i].state = false;
                            that.data.userList.push(e.data.res_data[i]);
                        }
                        that.setData({
                            userList: that.data.userList
                        })
                        if (e.data.res_data.length >= that.data.pageSize) {
                            that.setData({
                                page: parseInt(that.data.page) + 1,
                                dataState: true
                            })
                        }
                        // console.log(that.data.userList)
                    }
                } else {
                    utils.showToast(e.data.message, 1000);
                }
				dd.stopPullDownRefresh() //停止下拉刷新
				dd.hideLoading();
            },
            fail: function(e) {
				dd.stopPullDownRefresh() //停止下拉刷新
				dd.hideLoading();
                utils.showToast(e.errMsg, 1000);
            }
        }
        var url = '/order/list/booking';
        utils.ajax(utils.setURL(url), sendData, callBack, 'POST');
    },
    userListClick: function(e) {
        var that = this;
        var state = e.currentTarget.dataset.state;
        var index = e.currentTarget.dataset.index;
        var id = e.currentTarget.dataset.id;
        for (var i = 0; i < that.data.userList.length; i++) {
            if (i == index) {
                that.data.userList[i].state = !state;
                that.setData({
                    bookId: id,
                    index: index
                })
            } else {
                that.data.userList[i].state = false;
            }
        }
        that.setData({
            userList: that.data.userList,
        })
    },
    btnClick: function(e) {
        var that = this;
        var type = e.currentTarget.dataset.type;
        var index = that.data.index;
        var userList = that.data.userList;
        if (type == 1) {
            if (that.data.webType == 1) {
                dd.navigateBack({
                    delta: 1
                })
				// var meetingAddressList = [];
				// meetingAddressList.push({
				// 	orderId: userList[index].orderId,
				// 	mroomName: userList[index].mroomName,
				// 	mroomAddress: userList[index].mroomName,
				// 	bookStartTime: userList[index].rentStartTime,
				// 	bookEndTime: userList[index].rentEndTime,
				// 	mroomId: userList[index].meetingId,
				// 	type: 1
				// })
				// dd.setStorageSync('meetingAddressList', meetingAddressList);
				// dd.redirectTo({
				// 	url: '../confirmOrder/confirmOrder?webType=1&date=' + that.data.date,
				// })
            } else {
                dd.switchTab({
                    url: '../index',
                })
            }
        } else {
            if (that.data.bookId != '') {
                var orderBegin = that.data.begin;
                var orderEnd = that.data.end;
                var bookBegin = userList[index].scheduleStartTime;
                var bookEnd = userList[index].scheduleEndTime;
                orderBegin = Date.parse(new Date(orderBegin.replace(/-/g, "/")));
                orderEnd = Date.parse(new Date(orderEnd.replace(/-/g, "/")));
                bookBegin = Date.parse(new Date(bookBegin.replace(/-/g, "/")));
                bookEnd = Date.parse(new Date(bookEnd.replace(/-/g, "/")));
                orderBegin = (new Date(orderBegin)).getTime();
                orderEnd = (new Date(orderEnd)).getTime();
                bookBegin = (new Date(bookBegin)).getTime();
                bookEnd = (new Date(bookEnd)).getTime();
                if (bookBegin != orderBegin || bookEnd != orderEnd) {
                    dd.confirm({
                        title: '提示',
						content: '日程时间与您会议室预订的时间不符合，仍要绑定？',
                        cancelButtonText: '返回',
                        cancelColor: '#2B7AFB',
                        confirmButtonText: '绑定',
                        confirmColor: '#2B7AFB',
                        success(res) {
                            if (res.confirm) {
                                that.contact();
                            } else if (res.cancel) {
                                // dd.navigateBack({
                                //     delta: 1
                                // })
                            }
                        }
                    })
                } else {
                    that.contact();
                }
            } else {
                utils.showToast('暂无日程绑定', 1000)
            }
        }
    },
    contact: function() {
        var that = this;
		var list = []
		list.push(that.data.id)
        var sendData = {
            bookId: that.data.bookId,
			orderIds: list
        }
        var callBack = {
            success: function(e) {
                if (e.data.status == '0000') {
                    dd.confirm({
                        title: '提示',
                        content: '日程绑定成功',
                        showCancel: false,
                        confirmButtonText: '返回日程',
                        confirmColor: '#2B7AFB',
                        success(res) {
                            if (res.confirm) {
                                dd.switchTab({
                                    url: '../../schedule/index',
                                })
                            }
                        }
                    })
                } else {
                    utils.showToast(e.data.message, 1000);
                }
            },
            fail: function(e) {
                utils.showToast(e.errMsg, 1000);
            }
        }
        var url = '/order/relevancebooking';
        utils.ajax(utils.setURL(url), sendData, callBack, 'PUT');
    },
    searchCancel: function() {
        this.setData({
            searchTitle: ''
        })
    }
})