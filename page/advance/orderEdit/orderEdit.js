const app = getApp()
const utils = require('../../../utils/util.js')
// var bmap = require('../../../utils/bmap-dd.min.js');
var wxMarkerData = [];
Page({

    /**
     * 页面的初始数据
     */
    data: {
        orderDataList: {
            pickerAlertIndex: 0,
            alertarray: ['15', '30'],
            meetingTypeIndex: 0,
            meetingTypearray: ['线下会议', '视频会议', '电话会议'],
            joinPeople: [],
            beginTimeIndex: [],
            endTimeIndex: [],
            timeList: [],
            scanState: true,
            stencilState: false,
            meetingDate: '',
            meetingTitle: '',
            selectPeopleList: [],
            hostPeopleList: [],
            summaryPeopleList: [],
            externalUserInfoList: [], //外部人员
            meetingAttachmentList: [], //文件
            meetingProcessList: [], //议程
            meetingAddressList: [],
            costPrice: 0,
            webType: 1,
            stencilListLen: 0,
            bookId: '101',
            beginTimeState: false,
            endTimeState: false,
            beginTimeInit: '',
            endTimeInit: '',
            otherTabState: false
        },
        page: 1,
        pageSize: 20
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var that = this;
        if (dd.getStorageSync({key:'orderDataList'}).data == '' || dd.getStorageSync({key:'orderDataList'}).data == undefined) {
            that.data.orderDataList.bookId = options.bookId;
            that.setData({
                orderDataList: that.data.orderDataList
            })
            that.timeList();
            that.scheduleDetail();
            that.fileList();
        } else {
            that.setData({
                orderDataList: dd.getStorageSync({key:'orderDataList'}).data
            })
        }
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {},

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        if (dd.getStorageSync({key:'stencilId'}).data == '' || dd.getStorageSync({key:'stencilId'}).data == undefined) {
            if (dd.getStorageSync({key:'selectPeopleList'}).data != undefined && dd.getStorageSync({key:'selectPeopleList'}).data != '' || dd.getStorageSync({key:'selectPeopleList'}).data.length == 0) { //参会人
                this.data.orderDataList.selectPeopleList = dd.getStorageSync({key:'selectPeopleList'}).data;
            }
            if (dd.getStorageSync({key:'hostPeopleList'}).data != undefined && dd.getStorageSync({key:'hostPeopleList'}).data != '' || dd.getStorageSync({key:'hostPeopleList'}).data.length == 0) { //主持人
                this.data.orderDataList.hostPeopleList = dd.getStorageSync({key:'hostPeopleList'}).data;
            }
            if (dd.getStorageSync({key:'summaryPeopleList'}).data != undefined && dd.getStorageSync({key:'summaryPeopleList'}).data != '' || dd.getStorageSync({key:'summaryPeopleList'}).data.length == 0) { //纪要人
                this.data.orderDataList.summaryPeopleList = dd.getStorageSync({key:'summaryPeopleList'}).data;
            }
            if (dd.getStorageSync({key:'addExternalUserInfoList'}).data != undefined && dd.getStorageSync({key:'addExternalUserInfoList'}).data != '' || dd.getStorageSync({key:'addExternalUserInfoList'}).data.length == 0) { //外部人员
                this.data.orderDataList.externalUserInfoList = dd.getStorageSync({key:'addExternalUserInfoList'}).data;
            }
            if (dd.getStorageSync({key:'addMeetingAttachmentList'}).data != undefined && dd.getStorageSync({key:'addMeetingAttachmentList'}).data != '' || dd.getStorageSync({key:'addMeetingAttachmentList'}).data.length == 0) { //文件
                this.data.orderDataList.meetingAttachmentList = dd.getStorageSync({key:'addMeetingAttachmentList'}).data;
            }
            if (dd.getStorageSync({key:'addMeetingProcessList'}).data != undefined && dd.getStorageSync({key:'addMeetingProcessList'}).data != '' || dd.getStorageSync({key:'addMeetingProcessList'}).data.length == 0) { //议程
                this.data.orderDataList.meetingProcessList = dd.getStorageSync({key:'addMeetingProcessList'}).data;
            }
            if (dd.getStorageSync({key:'meetingAddressList'}).data != undefined && dd.getStorageSync({key:'meetingAddressList'}).data != '' || dd.getStorageSync({key:'meetingAddressList'}).data.length == 0) { //会议地点
                this.data.orderDataList.meetingAddressList = dd.getStorageSync({key:'meetingAddressList'}).data;

            }
        }
        this.data.orderDataList.currentDate = this.haveSomeMinutesTime();
        this.setData({
            orderDataList: this.data.orderDataList
        })
        if (dd.getStorageSync({key:'stencilId'}).data != '' && dd.getStorageSync({key:'stencilId'}).data != this.data.orderDataList.stencilId) {
            if (this.data.orderDataList.stencilId != dd.getStorageSync({key:'stencilId'}).data) {
                this.data.orderDataList.stencilId = dd.getStorageSync({key:'stencilId'}).data;
                this.setData({
                    orderDataList: this.data.orderDataList
                })
                this.stencilDetail();
            }
        }
        this.stencilList(); //模版条数
        this.costPrice(); //会议成本
    },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {},

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {
        dd.setStorageSync({key:'stencilId', data:''})
        this.data.orderDataList.stencilId = '';
        this.setData({
            orderDataList: this.data.orderDataList
        })
        dd.setStorageSync({key:'orderDataList', data:this.data.orderDataList})
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
    onShareAppMessage: function() {

    },
    bindAlertChange: function(e) {
        this.data.orderDataList.pickerAlertIndex = e.detail.value;
        this.setData({
            orderDataList: this.data.orderDataList
        })
    },
    bindMeetingTypeChange: function(e) {
        this.data.orderDataList.meetingTypeIndex = e.detail.value;
        this.setData({
            orderDataList: this.data.orderDataList
        })
    },
    titleInput: function(e) {
        this.data.orderDataList.meetingTitle = e.detail.value;
        this.setData({
            orderDataList: this.data.orderDataList
        })
    },
    personList: function(e) {
        dd.setStorageSync('selectPeopleList', this.data.orderDataList.selectPeopleList)
        dd.setStorageSync('addExternalUserInfoList', this.data.orderDataList.externalUserInfoList)
        dd.navigateTo({
            url: '../joinList/joinList?type=' + e.currentTarget.dataset.type,
        })
    },
    personOutside: function(e) {
        dd.setStorageSync('selectPeopleList', this.data.orderDataList.selectPeopleList)
        dd.setStorageSync('addExternalUserInfoList', this.data.orderDataList.externalUserInfoList)
        dd.navigateTo({
            url: '../outsidePeople/outsidePeople?type=1',
        })
    },
    btnClick: function(e) {
        var that = this;
        if (that.data.orderDataList.meetingTitle == '') {
            utils.showToast('请输入会议主题', 1000)
        } else if (that.data.orderDataList.selectPeopleList.length == 0 && that.data.orderDataList.externalUserInfoList.length == 0) {
            utils.showToast('参会人不能为空', 1000)
        } else {
            var that = this;
            var meetingStaffList = [];
            for (var i = 0; i < that.data.orderDataList.selectPeopleList.length; i++) {
                meetingStaffList.push(that.data.orderDataList.selectPeopleList[i].userId)
            }
            if (that.data.orderDataList.hostPeopleList.length > 0) {
                var hostUserId = that.data.orderDataList.hostPeopleList[0].userId;
            } else {
                var hostUserId = '';
            }
            if (that.data.orderDataList.summaryPeopleList.length > 0) {
                var summaryUserId = that.data.orderDataList.summaryPeopleList[0].userId;
            } else {
                var summaryUserId = '';
            }
            var isExternalStaff = 0;
            if (that.data.orderDataList.externalUserInfoList.length > 0) {
                isExternalStaff = 1;
            }
            if (that.data.orderDataList.scanState) {
                var isMeetingSign = 1;
            } else {
                var isMeetingSign = 0;
            }
            var template = 0;
            if (that.data.orderDataList.stencilState) {
                var template = 1;
            } else {
                var template = 0;
            }
            if (that.data.orderDataList.endTimeState) {
                var scheduleEndTime = that.data.orderDataList.meetingDate + ' ' + that.data.orderDataList.timeList[0][that.data.orderDataList.endTimeIndex[0]] + ':' + that.data.orderDataList.timeList[1][that.data.orderDataList.endTimeIndex[1]] + ':00';
            } else {
                var scheduleEndTime = that.data.orderDataList.meetingDate + ' ' + that.data.orderDataList.endTimeInit + ':00';
            }
            if (that.data.orderDataList.beginTimeState) {
                var scheduleStartTime = that.data.orderDataList.meetingDate + ' ' + that.data.orderDataList.timeList[0][that.data.orderDataList.beginTimeIndex[0]] + ':' + that.data.orderDataList.timeList[1][that.data.orderDataList.beginTimeIndex[1]] + ':00';
            } else {
                var scheduleStartTime = that.data.orderDataList.meetingDate + ' ' + that.data.orderDataList.beginTimeInit + ':00';
            }
            var date1 = (new Date()).getTime(); //当前时间
            var date2 = (new Date(scheduleStartTime)).getTime(); //开始时间
            var date3 = (new Date(scheduleEndTime)).getTime(); //结束时间
            if (date1 >= date2) {
                utils.showToast('开始时间必须大于当前时间', 1000);
                return;
            }
            if (date2 >= date3) {
                utils.showToast('开始时间必须大于结束时间', 1000);
                return;
            }
            var orderIds = [];
            var customLocationResponseVos = [];
            for (var i = 0; i < that.data.orderDataList.meetingAddressList.length; i++) {
                if (that.data.orderDataList.meetingAddressList[i].type == 1) {
                    orderIds.push({
                        bookId: that.data.orderDataList.bookId,
                        endTime: that.data.orderDataList.meetingAddressList[i].bookEndTime,
                        meetingId: that.data.orderDataList.meetingAddressList[i].mroomId,
                        orderId: that.data.orderDataList.meetingAddressList[i].orderId,
                        startTime: that.data.orderDataList.meetingAddressList[i].bookStartTime
                    });
                } else {
                    customLocationResponseVos.push({
                        bookId: that.data.orderDataList.bookId,
                        address: that.data.orderDataList.meetingAddressList[i].mroomName,
                        place: that.data.orderDataList.meetingAddressList[i].mroomAddress
                    })
                }
            }
            var sendData = {
                externalUserInfoList: that.data.orderDataList.externalUserInfoList,
                hostUserId: hostUserId, //会议主持人编号
                isExternalStaff: isExternalStaff, //外部人员1存在0无
                isMeetingSign: isMeetingSign, //签到0无1有
                meetingAttachmentList: that.data.orderDataList.meetingAttachmentList,
                meetingProcessList: that.data.orderDataList.meetingProcessList,
                meetingRemind: 0, //0未提醒1已提醒
                meetingStaffList: meetingStaffList,
                meetingSubject: that.data.orderDataList.meetingTitle,
                meetingType: parseInt(that.data.orderDataList.meetingTypeIndex) + 1,
                orderIds: orderIds,
                customLocationResponseVos: customLocationResponseVos,
                remindType: parseInt(that.data.orderDataList.pickerAlertIndex) + 1, //会议提醒类型 1提前15分钟 2 30分钟
                scheduleEndTime: scheduleEndTime,
                scheduleStartTime: scheduleStartTime,
                meetingTypeName: that.data.orderDataList.meetingTypearray[that.data.orderDataList.meetingTypeIndex],
                scheduleStatus: 1,
                summaryUserId: summaryUserId, //会议纪要人编号
                bookId: that.data.orderDataList.bookId,
                template: template
            }
            // console.log(sendData)
            // return;
            var callBack = {
                success: function(e) {
                    if (e.data.status == '0000') {
                        dd.setStorageSync('selectPeopleList', []);
                        dd.setStorageSync('hostPeopleList', []);
                        dd.setStorageSync('summaryPeopleList', []);
                        dd.setStorageSync('addExternalUserInfoList', []);
                        dd.setStorageSync('addMeetingAttachmentList', []);
                        dd.setStorageSync('addMeetingProcessList', []);
                        dd.setStorageSync('meetingAddressList', []);
                        dd.setStorageSync('stencilId', '');
                        dd.setStorageSync('orderDataList', '');
                        utils.showToast('修改成功', 1000);
                        dd.setStorageSync('scheduleState', 2)
                        dd.redirectTo({
                            url: '../../schedule/scheduleDetail/scheduleDetail?tabType=0&id=' + that.data.orderDataList.bookId,
                        })
                    } else {
                        utils.showToast(e.data.message, 1000)
                    }
                },
                fail: function(e) {
                    utils.showToast(e.errMsg, 1000)
                }
            }
            utils.ajax(utils.setURL('/conference/updateMeetingroomBookingInfo'), sendData, callBack, 'PUT');
        }
    },
    meetingAgenda: function() {
        dd.navigateTo({
            url: '../../schedule/scheduleDetailBefore/scheduleDetailBefore?tabType=4&id=null',
        })
    },
    meetingFile: function() {
        var that = this;
        dd.setStorageSync({key:'addMeetingAttachmentList', data:that.data.orderDataList.meetingAttachmentList})
        dd.setStorageSync({key:'stencilId', data:''})
        dd.navigateTo({
            url: "../../schedule/scheduleDetailBefore/scheduleDetailBefore?id=&tabType=2",
        })
    },
    meetingAddress: function() {
        var that = this;
        var date = that.data.orderDataList.meetingDate;
        var timeList = '';
        if (that.data.orderDataList.beginTimeIndex.length > 0 && that.data.orderDataList.endTimeIndex.length > 0) {
            var scheduleStartTime = that.data.orderDataList.meetingDate + ' ' + that.data.orderDataList.timeList[0][that.data.orderDataList.beginTimeIndex[0]] + ':' + that.data.orderDataList.timeList[1][that.data.orderDataList.beginTimeIndex[1]] + ':00';
            var scheduleEndTime = that.data.orderDataList.meetingDate + ' ' + that.data.orderDataList.timeList[0][that.data.orderDataList.endTimeIndex[0]] + ':' + that.data.orderDataList.timeList[1][that.data.orderDataList.endTimeIndex[1]] + ':00';
            if (app.globalData.meetingType == 1) {
                var hourType = -15
            } else {
                var hourType = -30
            }
            var newDate = new Date()
            newDate = newDate.setMinutes(newDate.getMinutes() + hourType);
            var date1 = (new Date(newDate)).getTime(); //当前时间
            var date2 = (new Date(scheduleStartTime.replace(/-/g, "/"))).getTime(); //开始时间
            var date3 = (new Date(scheduleEndTime.replace(/-/g, "/"))).getTime(); //结束时间
            if (date1 >= date2) {
                utils.showToast('无法过去搜索时间的会议地点', 1000);
                return;
            }
            if (date2 >= date3) {
                utils.showToast('结束时间必须大于开始时间', 1000);
                return;
            }
            timeList = '&startTime=' + scheduleStartTime + '&endTime=' + scheduleEndTime
        }
        dd.setStorageSync('stencilId', '')
        dd.setStorageSync('orderDataList', that.data.orderDataList);
        dd.setStorageSync('meetingAddressList', that.data.orderDataList.meetingAddressList)
        //console.log(date)
        dd.navigateTo({
            url: '../meetingAddress/meetingAddress?webType=2&mroomName=&bookId=&date=' + date + timeList,
        })
    },
    switch2Change: function(e) {
        this.data.orderDataList.stencilState = e.detail.value;
        this.setData({
            orderDataList: this.data.orderDataList
        })
    },
    switchChange: function(e) {
        if (e.detail.value && this.data.stencilListLen >= 10) {
            utils.showToast('最多可以建10条模版，您已达上限');
            this.data.orderDataList.scanState = false;
        } else {
            this.data.orderDataList.scanState = e.detail.value;
        }
        this.setData({
            orderDataList: this.data.orderDataList
        })
    },

    timeList: function() {
        var list = [];
        for (var i = 0; i < 24; i++) {
            var valueEnd = (Array(2).join('0') + i).slice(-2);
            list.push(valueEnd);
        }
        list.push('24');
        this.data.orderDataList.timeList.push(list);
        if (app.globalData.meetingType == 1) {
            this.data.orderDataList.timeList.push(['00', '15', '30', '45']);
        } else {
            this.data.orderDataList.timeList.push(['00', '30']);
        }
        this.setData({
            orderDataList: this.data.orderDataList
        })
    },
    bindDateChange: function(e) {
        this.data.orderDataList.meetingDate = e.detail.value;
        this.setData({
            orderDataList: this.data.orderDataList
        })
        that.costPrice(); //会议成本
    },
    beginTimeChange(e) {
        //console.log('picker发送选择改变，携带值为', e.detail.value)
        var that = this
        that.data.orderDataList.beginTimeIndex = e.detail.value;
        that.data.orderDataList.beginTimeState = true
        that.setData({
            orderDataList: that.data.orderDataList
        })
        that.costPrice(); //会议成本
    },
    endTimeChange(e) {
        var that = this;
        var timeList = [];
        // console.log('picker发送选择改变，携带值为', e.detail.value)
        if (e.detail.value[0] >= 24) {
            this.data.orderDataList.endTimeIndex = [24, 0];
        } else {
            this.data.orderDataList.endTimeIndex = e.detail.value;
        }
        timeList.push(that.data.orderDataList.timeList[0])
        if (app.globalData.meetingType == 1) {
            timeList.push(['00', '15', '30', '45']);
        } else {
            timeList.push(['00', '30']);
        }
        that.data.orderDataList.timeList = timeList;
        this.data.orderDataList.endTimeState = true
        that.setData({
            orderDataList: that.data.orderDataList
        })
        that.costPrice(); //会议成本
    },
    timeValue: function(value) {
        var that = this;
        var timeList = that.data.orderDataList.timeList;
        var valueSplit = value.split(':');
        var list = [];
        for (var i = 0; i < timeList[0].length; i++) {
            if (valueSplit[0] == timeList[0][i]) {
                list.push(i);
            }
        }
        for (var i = 0; i < timeList[1].length; i++) {
            if (valueSplit[1] == 59 || valueSplit[0] == 24) {
                list.push(0);
            } else if (valueSplit[1] == timeList[1][i]) {
                list.push(i);
            }
        }
        console.log(list)
        return list;
    },
    inputStencil: function() {
        var that = this;
        dd.setStorageSync('stencilId', '');
        dd.setStorageSync('orderDataList', that.data.orderDataList);
        dd.navigateTo({
            url: '../stencilList/stencilList?date=' + that.data.orderDataList.meetingDate + '&webType=2',
        })
    },
    stencilList: function() {
        var that = this;
        var sendData = {}
        var callBack = {
            success: function(e) {
                if (e.data.status == '0000') {
                    that.setData({
                        stencilListLen: e.data.res_data.length
                    })
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
    scheduleDetail: function(e) {
        var that = this;
        var sendData = {
            bookId: that.data.orderDataList.bookId,
        }
        var callBack = {
            success: function(e) {
                if (e.data.status == '0000') {
                    that.data.orderDataList.meetingDate = e.data.res_data.scheduleStartTime.substring(0, 10);
                    that.data.orderDataList.beginTimeIndex = that.timeValue(e.data.res_data.scheduleStartTime.substring(11, 16));
                    that.data.orderDataList.endTimeIndex = that.timeValue(e.data.res_data.scheduleEndTime.substring(11, 16));
                    that.data.orderDataList.beginTimeInit = (e.data.res_data.scheduleStartTime).substring(11, 16);
                    that.data.orderDataList.endTimeInit = (e.data.res_data.scheduleEndTime).substring(11, 16);
                    that.data.orderDataList.meetingAddressList = [];
                    that.data.orderDataList.meetingTypeIndex = parseInt(e.data.res_data.meetingTypeName) - 1;
                    that.data.orderDataList.meetingTitle = e.data.res_data.meetingSubject;
                    var selectPeopleList = [];
                    for (var i = 0; i < e.data.res_data.externalStaff.externalStaff.confirmMeeting.length; i++) {
                        e.data.res_data.externalStaff.externalStaff.confirmMeeting[i].name = e.data.res_data.externalStaff.externalStaff.confirmMeeting[i].userName
                        selectPeopleList.push(e.data.res_data.externalStaff.externalStaff.confirmMeeting[i]);
                    }
                    for (var i = 0; i < e.data.res_data.externalStaff.externalStaff.noMeeting.length; i++) {
                        e.data.res_data.externalStaff.externalStaff.noMeeting[i].name = e.data.res_data.externalStaff.externalStaff.noMeeting[i].userName
                        selectPeopleList.push(e.data.res_data.externalStaff.externalStaff.noMeeting[i]);
                    }
                    for (var i = 0; i < e.data.res_data.externalStaff.externalStaff.unconfirmedMeeting.length; i++) {
                        e.data.res_data.externalStaff.externalStaff.unconfirmedMeeting[i].name = e.data.res_data.externalStaff.externalStaff.unconfirmedMeeting[i].userName
                        selectPeopleList.push(e.data.res_data.externalStaff.externalStaff.unconfirmedMeeting[i]);
                    }
                    that.data.orderDataList.selectPeopleList = selectPeopleList;
                    that.data.orderDataList.externalUserInfoList = e.data.res_data.externalStaff.externalUserInfo.unconfirmedMeeting;
                    var hostUser = [];
                    if (e.data.res_data.hostUser != '' && e.data.res_data.hostUser != null) {
                        e.data.res_data.hostUser.name = e.data.res_data.hostUser.userName
                        hostUser.push(e.data.res_data.hostUser);
                    }
                    var summaryUser = [];
                    if (e.data.res_data.summaryUser != '' && e.data.res_data.summaryUser != null) {
                        e.data.res_data.summaryUser.name = e.data.res_data.summaryUser.userName
                        summaryUser.push(e.data.res_data.summaryUser);
                    }
                    that.data.orderDataList.hostPeopleList = hostUser;
                    that.data.orderDataList.summaryPeopleList = summaryUser;
                    if (e.data.res_data.meetingProcessList.length > 0) {
                        that.data.orderDataList.meetingProcessList = e.data.res_data.meetingProcessList;
                    } else {
                        that.data.orderDataList.meetingProcessList = [];
                    }
                    that.data.orderDataList.pickerAlertIndex = e.data.res_data.meetingRemindType - 1;

                    if (e.data.res_data.isMeetingSign == 0) {
                        var scanState = false;
                    } else {
                        var scanState = true;
                    }
                    that.data.orderDataList.scanState = scanState;
                    var meetingAddressList = [];
                    for (var i = 0; i < e.data.res_data.meetingRootResponseList.length; i++) {
                        meetingAddressList.push({
                            orderId: e.data.res_data.meetingRootResponseList[i].orderId,
                            mroomName: e.data.res_data.meetingRootResponseList[i].mroomName,
                            bookStartTime: e.data.res_data.meetingRootResponseList[i].rentStartTime,
                            bookEndTime: e.data.res_data.meetingRootResponseList[i].rentEndTime,
                            mroomAddress: e.data.res_data.meetingRootResponseList[i].mroomAccress,
                            mroomId: e.data.res_data.meetingRootResponseList[i].productId,
                            type: 1,
                        })
                    }
                    for (var i = 0; i < e.data.res_data.customLocationResponseVos.length; i++) {
                        meetingAddressList.push({
                            locationId: e.data.res_data.customLocationResponseVos[i].locationId,
                            mroomName: e.data.res_data.customLocationResponseVos[i].address,
                            bookStartTime: '',
                            bookEndTime: '',
                            mroomAddress: e.data.res_data.customLocationResponseVos[i].place,
                            type: 2,
                        })
                    }
                    that.data.orderDataList.meetingAddressList = meetingAddressList;
                    that.setData({
                        orderDataList: that.data.orderDataList
                    })
                    that.costPrice();
                    dd.setStorageSync('selectPeopleList', selectPeopleList)
                    dd.setStorageSync('addExternalUserInfoList', e.data.res_data.externalStaff.externalUserInfo.unconfirmedMeeting)
                    dd.setStorageSync('hostPeopleList', hostUser)
                    dd.setStorageSync('summaryPeopleList', summaryUser)
                    dd.setStorageSync('addMeetingProcessList', that.data.orderDataList.meetingProcessList)
                    dd.setStorageSync('meetingAddressList', meetingAddressList)
                    dd.setStorageSync('stencilId', '')
                } else {
                    utils.showToast(e.data.message, 1000)
                }
            },
            fail: function(e) {
                utils.showToast(e.errMsg, 1000)
            }
        }
        var url = '/conference/findMeetingDetailByBookId?bookId=' + that.data.orderDataList.bookId;
        utils.ajax(utils.setURL(url), sendData, callBack, 'GET');
    },
    stencilList: function() {
        var that = this;
        var sendData = {}
        var callBack = {
            success: function(e) {
                if (e.data.status == '0000') {
                    that.setData({
                        stencilListLen: e.data.res_data.length
                    })
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
    fileList: function(order) {
        var that = this;
        var sendData = {}
        var callBack = {
            success: function(e) {
                if (e.data.res_data != null) {
                    that.data.orderDataList.meetingAttachmentList = e.data.res_data.list;
                    dd.setStorageSync('addMeetingAttachmentList', e.data.res_data.list)
                    that.setData({
                        orderDataList: that.data.orderDataList
                    })
                }
            },
            fail: function(e) {
                utils.showToast(e.errMsg, 1000)
            }
        }
        var url = '/meetingCalendar/file/' + that.data.orderDataList.bookId + '/' + that.data.page + '/' + that.data.pageSize;
        utils.ajax(utils.setURL(url), sendData, callBack, 'GET');
    },
    costPrice: function() {
        var that = this;
        var mroomIds = [];
        var meetingAddressList = that.data.orderDataList.meetingAddressList;
        for (var i = 0; i < meetingAddressList.length; i++) {
            if (meetingAddressList[i].type == 1) {
                mroomIds.push(meetingAddressList[i].mroomId)
            }
        }
        var scheduleStartTime = '';
        var scheduleEndTime = '';
        if (that.data.orderDataList.beginTimeIndex.length > 0) {
            scheduleStartTime = that.data.orderDataList.meetingDate + ' ' + that.data.orderDataList.timeList[0][that.data.orderDataList.beginTimeIndex[0]] + ':' + that.data.orderDataList.timeList[1][that.data.orderDataList.beginTimeIndex[1]]
        }
        if (that.data.orderDataList.endTimeIndex.length > 0) {
            scheduleEndTime = that.data.orderDataList.meetingDate + ' ' + that.data.orderDataList.timeList[0][that.data.orderDataList.endTimeIndex[0]] + ':' + that.data.orderDataList.timeList[1][that.data.orderDataList.endTimeIndex[1]]
        }
        var userIds = [];
        if (that.data.orderDataList.selectPeopleList.length > 0) {
            for (var i = 0; i < that.data.orderDataList.selectPeopleList.length; i++) {
                userIds.push(that.data.orderDataList.selectPeopleList[i].userId)
            }
        }
        if (that.data.orderDataList.hostPeopleList > 0) {
            userIds.push(that.data.orderDataList.hostPeopleList[0].userId)
        }
        if (that.data.orderDataList.summaryPeopleList > 0) {
            userIds.push(that.data.orderDataList.summaryPeopleList[0].userId)
        }
        var sendData = {
            mroomIds: mroomIds,
            scheduleEndTime: scheduleEndTime,
            scheduleStartTime: scheduleStartTime,
            userIds: userIds
        }
        var callBack = {
            success: function(e) {
                if (e.data.status == '0000') {
                    that.data.orderDataList.costPrice = e.data.res_data;
                    that.setData({
                        orderDataList: that.data.orderDataList
                    })
                } else {
                    // utils.showToast(e.data.message, 1000)
                }
            },
            fail: function(e) {
                // utils.showToast(e.errMsg, 1000)
            }
        }
        var url = '/conference/trial'
        utils.ajax(utils.setURL(url), sendData, callBack);
    },
    stencilDetail() {
        var that = this;
        var sendData = {}
        var callBack = {
            success: function(e) {
                if (e.data.status == '0000') {
                    var content = JSON.parse(e.data.res_data.content);
                    // console.log(content);
                    var meetingStaffList = [];
                    if (content.meetingStaffList.length > 0) {
                        for (var i = 0; i < content.meetingStaffList.length; i++) {
                            content.meetingStaffList[i].name = content.meetingStaffList[i].userName;
                            meetingStaffList.push(content.meetingStaffList[i])
                        }
                    }
                    var hostPeopleList = [];
                    if (content.hostUserName != '' && content.hostUserName != null) {
                        hostPeopleList.push({
                            userId: content.hostUserId,
                            name: content.hostUserName
                        })
                    }
                    var summaryPeopleList = [];
                    if (content.summaryUserName != '' && content.summaryUserName != null) {
                        summaryPeopleList.push({
                            userId: content.summaryUserId,
                            name: content.summaryUserName
                        })
                    }
                    var scanState = false;
                    if (content.isMeetingSign == 1) {
                        scanState = true;
                    }
                    that.data.orderDataList.meetingTypeIndex = parseInt(content.meetingType) - 1;
                    that.data.orderDataList.meetingTitle = content.meetingSubject;
                    that.data.orderDataList.selectPeopleList = meetingStaffList;
                    that.data.orderDataList.hostPeopleList = hostPeopleList;
                    that.data.orderDataList.summaryPeopleList = summaryPeopleList;
                    that.data.orderDataList.meetingProcessList = content.meetingProcessList;
                    that.data.orderDataList.pickerAlertIndex = parseInt(content.meetingRemindType) - 1;
                    that.data.orderDataList.scanState = scanState;
                    dd.setStorageSync('selectPeopleList', meetingStaffList);
                    dd.setStorageSync('hostPeopleList', hostPeopleList);
                    dd.setStorageSync('summaryPeopleList', summaryPeopleList);
                    dd.setStorageSync('meetingProcessList', content.meetingProcessList);
                    that.setData({
                        orderDataList: that.data.orderDataList
                    })
                    dd.setStorageSync('stencilId', '');
                } else {
                    utils.showToast(e.data.message, 1000);
                }
            },
            fail: function(e) {
                utils.showToast(e.errMg, 1000);
            }
        }
        var url = utils.setURL('/template/details/') + that.data.orderDataList.stencilId;
        utils.ajax(url, sendData, callBack, 'GET');
    },
    haveSomeMinutesTime: function(n) {
        if (n == null) {
            n = 0;
        }
        // 时间
        var newDate = new Date()
        // var timeStamp = newDate.getTime(); //获取时间戳
        var date = newDate.setMinutes(newDate.getMinutes() + n);
        newDate = new Date(date);
        var year = newDate.getFullYear();
        var month = newDate.getMonth() + 1;
        var day = newDate.getDate();
        var h = newDate.getHours();
        var m = newDate.getMinutes();
        var s = newDate.getSeconds();
        if (month < 10) {
            month = '0' + month;
        };
        if (day < 10) {
            day = '0' + day;
        };
        if (h < 10) {
            h = '0' + h;
        };
        if (m < 10) {
            m = '0' + m;
        };
        if (s < 10) {
            s = '0' + s;
        };
        var time = year + '-' + month + '-' + day;
        return time;
    },
    otherTabClick: function() {
        this.data.orderDataList.otherTabState = !this.data.orderDataList.otherTabState
        this.setData({
            orderDataList: this.data.orderDataList
        })
    },
    personListDelete: function(e) {
        var index = e.currentTarget.dataset.index
        var type = e.currentTarget.dataset.type
        if (type == 1) {
            this.data.orderDataList.selectPeopleList.splice(index, 1)
        } else {
            this.data.orderDataList.externalUserInfoList.splice(index, 1)
        }
        this.setData({
            orderDataList: this.data.orderDataList
        })
    }
})