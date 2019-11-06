const app = getApp()
const utils = require('../../utils/util.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        alertState: false,
        dataList: [],
        doorList: [],
        index: 0,
        alertType: 0
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
        this.meetingList();
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
    meetingClick: function(e) {
        if (e.currentTarget.dataset.type == 2) {
            dd.navigateTo({
                url: '../schedule/serviceAdd/serviceAdd',
            })
        } else {
            if (e.currentTarget.dataset.type == 0) {
                this.setData({
                    index: e.currentTarget.dataset.index,
                    alertState: true,
                    alertType: e.currentTarget.dataset.type
                })
            }
            if (e.currentTarget.dataset.type == 1) {
                this.doorList(1);
                this.setData({
                    alertType: e.currentTarget.dataset.type
                })
            }
        }
    },
    maskBg: function() {
        this.setData({
            alertState: false
        })
    },
    meetingList: function() {
        var that = this;
        var sendData = {}
        var callBack = {
            success: function(e) {
                if (e.data.status == '0000') {
                    that.setData({
                        dataList: e.data.res_data
                    })
                    // that.doorList();
                }
            },
            fail: function(e) {
                utils.showToast(e.errMsg, 1000)
            }
        }
        var url = '/conference/findMeetingroom';
        utils.ajax(utils.setURL(url), sendData, callBack, 'GET');
    },
    doorList: function(type) {
        var that = this;
        var sendData = {}
        var callBack = {
            success: function(e) {
                if (e.data.status == '0000') {
                    that.setData({
                        doorList: e.data.res_data
                    })
                    if (type == 1) {
                        if (e.data.res_data.length > 0) {
							that.setData({
								alertState: true
							})
                        } else {
                            utils.showToast('暂无可开启的门，请确认会议时间或联系系统管理员', 1000)
                        }
                    }
                }
            },
            fail: function(e) {
                utils.showToast(e.errMsg, 1000)
            }
        }
        var url = '/smrDoorLockPermissions/findPermissions?mroomId=' + that.data.dataList[that.data.index].mroomId;
        utils.ajax(utils.setURL(url), sendData, callBack, 'GET');
    },
    confirm: function() {
        var that = this;
        var sendData = {
            content: that.data.textarea,
            mroomId: that.data.dataList[that.data.index].mroomId,
            mroomName: that.data.dataList[that.data.index].mroomName,
            orderId: that.data.dataList[that.data.index].orderId,
        }
        var callBack = {
            success: function(e) {
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
            },
            fail: function(e) {
                utils.showToast(e.errMsg, 1000)
            }
        }
        var url = '/operate/call/add';
        utils.ajax(utils.setURL(url), sendData, callBack);
    },
    openDoor: function(e) {
        dd.showLoading({
            title: '正在开锁中',
        })
        var that = this;
        var index = e.currentTarget.dataset.index;
        var sendData = {
            gateWayAddress: that.data.doorList[index].macAddress,
            lockAddress: that.data.doorList[index].deviceId
        }
        var callBack = {
            success: function(e) {
                dd.hideLoading();
                if (e.data.status == '0000') {
                    utils.showToast('开锁成功', 1000)
                } else {
                    utils.showToast(e.data.message, 1000)
                }
                that.setData({
                    alertState: false
                })
            },
            fail: function(e) {
                utils.showToast(e.errMsg, 1000)
                dd.hideLoading();
                that.setData({
                    alertState: false
                })
            }
        }
		var url = '/smrDoorLockPermissions/unlocking?gateWayAddress=' + that.data.doorList[index].gateWayAddress + '&lockAddress=' + that.data.doorList[index].lockAddress + '&doorId=' + that.data.doorList[index].doorId + '&doorLockModel=' + that.data.doorList[index].doorLockModel;
        utils.ajax(utils.setURL(url), sendData, callBack, 'GET');
    }
})