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
        tabType: 255,
        page: 1,
        pageSize: 10,
        payState: false,
        dataListState: false,
        orderRequestState: true,
        tabList: [{
            name: '未结束',
            id: '0',
            tabtype: '1'
        }, {
            name: '已结束',
            id: '1',
            tabtype: '2'
        }],
        // dataList: null,
        dataList: [{
            id: 1,
            orderNum: '1550715263487174864',
            meetingName: '宜山路会议室',
            time: '2019-03-15 12:30-15:30',
            type: 1,
        }, {
            id: 2,
            orderNum: '1550715263487174864',
            meetingName: '宜山路会议室',
            time: '2019-03-15 12:30-15:30',
            type: 2,
        }],
        timeDown: false,
        setInter: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {},

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        // this.setData({
        //     dataList: null,
        //     dataState: true,
        //     page: 1
        // })
        this.orderRequest();
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
        clearInterval(this.data.setInter);
        this.setData({
            setInter: ''
        })
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        dd.stopPullDownRefresh();
        
        this.setData({
            dataList: null,
            page: 1,
			orderRequestState:true
        })
        this.orderRequest();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        if (this.data.orderRequestState) {
            this.orderRequest();
        }
    },
    tabClick: function(e) {
        this.setData({
            indexVal: e.currentTarget.dataset.index,
            tabType: e.currentTarget.dataset.type,
            page: 1,
            orderRequestState: true
        })
        this.orderRequest();
    },
    orderDetail: function(e) {
        dd.navigateTo({
            url: '../orderDetail/orderDetail?order=' + e.currentTarget.dataset.order + "&status=" + e.currentTarget.dataset.status,
        })
    },
    orderRequest: function() {
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
                orderBy: parseInt(that.data.indexVal) + 1
            }
            var callBack = {
                success: function(e) {
                    dd.stopPullDownRefresh() //停止下拉刷新
                    dd.hideLoading();
                    if (e.data.status == '0000') {
						if (e.data.res_data.list.length > 0) {
							for (var i = 0; i < e.data.res_data.list.length; i++) {
								that.data.dataList.push(e.data.res_data.list[i])
                            }
                            that.setData({
                                dataList: that.data.dataList,
                            })
                        }
						if (e.data.res_data.list.length == 0 && that.data.page == 1) {
							that.setData({
								dataListState: true,
							})
						}
						if (e.data.res_data.list.length >= that.data.pageSize) {
                            that.setData({
                                orderRequestState: true,
                                page: ++that.data.page
                            })
                        }
                    } else {
                        that.setData({
                            dataListState: true,
                            orderRequestState: true
                        })
                        utils.showToast(e.data.message, 1000);
                    }
					if (that.data.dataList.length >= e.data.res_data.total) {
						that.setData({
							orderRequestState: false
						})
					}
                },
                fail: function(e) {
                    dd.stopPullDownRefresh() //停止下拉刷新
                    dd.hideLoading();
                    that.setData({
                        orderRequestState: true
                    })
                    utils.showToast(e.errMsg, 1000)
                }
            }
            utils.ajax(utils.setURL('/order/list/appletorders'), sendData, callBack);
        }
    },
    contact: function(e) {
        var that = this;
        var type = e.currentTarget.dataset.type;
		var state = e.currentTarget.dataset.state;
        var index = e.currentTarget.dataset.index;
        var dataList = that.data.dataList;
        if (type == 1) {
			if (state == 1) {
				dd.navigateTo({
					url: '../../advance/scheduleContact/scheduleContact?type=1&id=' + dataList[index].orderId + '&begin=' + dataList[index].rentStartTime + '&end=' + dataList[index].rentEndTime,
				})
			} else {
				dd.setStorageSync({key:'orderDataList', data:''})
				dd.setStorageSync({key:'stencilId', data:''});
				dd.setStorageSync({key:'selectPeopleList', data:[]});
				dd.setStorageSync({key:'hostPeopleList', data:[]});
				dd.setStorageSync({key:'summaryPeopleList', data:[]});
				dd.setStorageSync({key:'addExternalUserInfoList', data:[]});
				dd.setStorageSync({key:'addMeetingAttachmentList', data:[]});
				dd.setStorageSync({key:'addMeetingProcessList', data:[]});
				var date = dataList[index].rentStartTime.split(" ")[0];
				var rentStartTime = dataList[index].rentStartTime.substring(11, 16)
				var rentEndTime = dataList[index].rentEndTime.substring(11, 16)
				var meetingAddressList = [];
				meetingAddressList.push({
					orderId: dataList[index].orderId,
					mroomName: dataList[index].mroomName,
					mroomAddress: dataList[index].mroomAddress,
					bookStartTime: dataList[index].rentStartTime,
					bookEndTime: dataList[index].rentEndTime,
					mroomId: dataList[index].mroomId,
					type: 1
				})
				dd.setStorageSync({key:'meetingAddressList', data:meetingAddressList});
				dd.navigateTo({
					url: '../../advance/confirmOrder/confirmOrder?webType=2&date=' + date + '&begin=' + rentStartTime + '&end=' + rentEndTime,
				})
			}
        } else {
            return;
        }
    }
})