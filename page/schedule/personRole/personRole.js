const app = getApp()
const utils = require('../../../utils/util.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        list: [],
        bookId: '',
        indexScroll: 0,
        roleIndex: 0,
        roleName: [],
        roleList: ['默认角色', '角色1', '角色2']
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            bookId: options.bookId,
        })
        this.scheduleDetail()
        this.roleList()
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
    bindPickerChange: function(e) {
        var that = this
        var sendData = {
            bookId: that.data.bookId,
            meetingRoleId: that.data.roleList[e.detail.value].id
        }
        var callBack = {
            success: function(e) {
                if (e.data.status == '0000') {
                    utils.showToast(e.data.res_data, 1000)
                    that.scheduleDetail()
                } else {
                    utils.showToast(e.data.message, 1000)
                }
            },
            fail: function(e) {
                utils.showToast(e.errMsg, 1000)
            }
        }
        var url = '/conference/updateConfereeMeetingRole?bookId=' + that.data.bookId + '&meetingRoleId=' + that.data.roleList[e.detail.value].id + '&userId=' + that.data.list[e.currentTarget.dataset.index].userId;
        utils.ajax(utils.setURL(url), sendData, callBack, 'GET');
    },
    scheduleDetail: function(e) {
        var that = this;
        var sendData = {
            bookId: that.data.bookId,
        }
        var callBack = {
            success: function(e) {
                if (e.data.status == '0000') {
                    var hostUser = [];
                    var summaryUser = [];
                    if (e.data.res_data.hostUser != null) {
                        e.data.res_data.hostUser.name = e.data.res_data.hostUser.userName
                        hostUser.push(e.data.res_data.hostUser);
                    }
                    if (e.data.res_data.summaryUser != null) {
                        e.data.res_data.summaryUser.name = e.data.res_data.summaryUser.userName
                        summaryUser.push(e.data.res_data.summaryUser);
                    }
                    e.data.res_data.hostUser = hostUser;
                    e.data.res_data.summaryUser = summaryUser;
                    var externalStaffVal = e.data.res_data.externalStaff.externalStaff;
                    var externalUserInfo = e.data.res_data.externalStaff.externalUserInfo.unconfirmedMeeting;
                    var meetingPersonList = [];
                    for (var i = 0; i < externalStaffVal.confirmMeeting.length; i++) {
                        externalStaffVal.confirmMeeting[i].join = 1;
                        externalStaffVal.confirmMeeting[i].hoster = '';
                        externalStaffVal.confirmMeeting[i].summary = '';
                        externalStaffVal.confirmMeeting[i].exter = '';
                        meetingPersonList.push(externalStaffVal.confirmMeeting[i]);
                        if (app.globalData.loginInfo.userId == externalStaffVal.confirmMeeting[i].userId) {
                            that.setData({
                                joinState: 1
                            })
                        }
                    }
                    for (var i = 0; i < externalStaffVal.noMeeting.length; i++) {
                        externalStaffVal.noMeeting[i].join = 2;
                        externalStaffVal.noMeeting[i].hoster = '';
                        externalStaffVal.noMeeting[i].summary = '';
                        externalStaffVal.noMeeting[i].exter = '';
                        meetingPersonList.push(externalStaffVal.noMeeting[i]);
                        if (app.globalData.loginInfo.userId == externalStaffVal.noMeeting[i].userId) {
                            that.setData({
                                joinState: 2
                            })
                        }
                    }
                    for (var i = 0; i < externalStaffVal.unconfirmedMeeting.length; i++) {
                        externalStaffVal.unconfirmedMeeting[i].join = '';
                        externalStaffVal.unconfirmedMeeting[i].hoster = '';
                        externalStaffVal.unconfirmedMeeting[i].summary = '';
                        externalStaffVal.unconfirmedMeeting[i].exter = '';
                        meetingPersonList.push(externalStaffVal.unconfirmedMeeting[i]);
                    }
                    // for (var i = 0; i < externalUserInfo.length; i++) {
                    // 	externalUserInfo[i].join = '';
                    // 	externalUserInfo[i].hoster = '';
                    // 	externalUserInfo[i].summary = '';
                    // 	externalUserInfo[i].exter = 1;
                    // 	meetingPersonList.push(externalUserInfo[i]);
                    // }
                    if (e.data.res_data.hostUser != null && e.data.res_data.hostUser != "") {
                        var hostUserState = false;
                        for (var i = 0; i < meetingPersonList.length; i++) {
                            if (e.data.res_data.hostUser[0].userId == meetingPersonList[i].userId) {
                                meetingPersonList[i].hoster = 1;
                                hostUserState = true;
                            }
                        }
                        if (hostUserState == false) {
                            e.data.res_data.hostUser[0].join = '';
                            e.data.res_data.hostUser[0].hoster = 1;
                            e.data.res_data.hostUser[0].summary = '';
                            e.data.res_data.hostUser[0].exter = '';
                            meetingPersonList.push(e.data.res_data.hostUser[0])
                        }
                    }
                    if (e.data.res_data.summaryUser != null && e.data.res_data.summaryUser != "") {
                        var summaryUserState = false;
                        for (var i = 0; i < meetingPersonList.length; i++) {
                            if (e.data.res_data.summaryUser[0].userId == meetingPersonList[i].userId) {
                                meetingPersonList[i].summary = 1;
                                summaryUserState = true;
                            }
                        }
                        if (summaryUserState == false) {
                            e.data.res_data.summaryUser[0].join = '';
                            e.data.res_data.summaryUser[0].hoster = '';
                            e.data.res_data.summaryUser[0].summary = 1;
                            e.data.res_data.summaryUser[0].exter = '';
                            meetingPersonList.push(e.data.res_data.summaryUser[0])
                        }
                    }
                    that.setData({
                        list: meetingPersonList
                    })
                } else {
                    utils.showToast(e.data.message, 1000)
                }
            },
            fail: function(e) {
                utils.showToast({
                    title: e.errMsg,
                    icon: 'none',
                    duration: 1000
                });
            }
        }
        var url = '/conference/findMeetingDetailByBookId?bookId=' + that.data.bookId;
        utils.ajax(utils.setURL(url), sendData, callBack, 'GET');
    },
    roleList: function(e) {
        var that = this;
        var sendData = {
            bookId: that.data.bookId,
        }
        var callBack = {
            success: function(e) {
                if (e.data.status == '0000') {
                    var list = []
                    for (var i = 0; i < e.data.res_data.length; i++) {
                        list.push(e.data.res_data[i].role)
                    }
                    that.setData({
                        roleList: e.data.res_data,
                        roleName: list
                    })
                } else {
                    utils.showToast(e.data.message, 1000)
                }
            },
            fail: function(e) {
                utils.showToast(e.errMsg, 1000)
            }
        }
        var url = '/meetingRole/queryRolesByCompanyId';
        utils.ajax(utils.setURL(url), sendData, callBack, 'GET');
    },
    pickerTap: function(e) {
		var index = 0
		for (var i = 0;i<this.data.roleList.length;i++) {
			if (this.data.roleList[i].role == this.data.list[e.currentTarget.dataset.index].meetingRoleName) {
				index = i
			}
		}
        this.setData({
			indexScroll: index
        })
    }
})