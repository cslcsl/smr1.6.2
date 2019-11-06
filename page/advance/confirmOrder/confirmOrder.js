const app = getApp()
import utils from '../../../utils/util.js';
var wxMarkerData = [];
Page({
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
            btnClickState: true,
            stencilId: '',
            currentDate: '',
            timeSelectState: false,
            otherTabState: false
        }
    },
    onLoad: function(options) {
        var that = this;
        that.timeList();
        var orderDataList = dd.getStorageSync({ key: 'orderDataList' }).data;
        if (orderDataList != '' && orderDataList != undefined) {
            that.setData({
                orderDataList: dd.getStorageSync({ key: 'orderDataList' }).data
            })
        } else {
            if (options.webType == 1) { //日程新建 模版新建
                that.data.orderDataList.webType = options.webType;
                that.data.orderDataList.meetingDate = options.date;
                var date = new Date()
                var hour = date.getHours()
                var minute = date.getMinutes()
                var beginTimeIndex = []
                var endTimeIndex = []
                if (app.globalData.meetingType == 1) {
                    if (hour < 23 && minute >= 45) {
                        beginTimeIndex.push(date.getHours() + 1)
                        beginTimeIndex.push('0')
                        endTimeIndex.push(date.getHours() + 2)
                        endTimeIndex.push('0')
                    } else if (hour >= 23) {
                        beginTimeIndex.push(date.getHours())
                        beginTimeIndex.push(Math.ceil(date.getMinutes() / 15))
                        endTimeIndex.push('24')
                        endTimeIndex.push('0')
                    } else {
                        beginTimeIndex.push(date.getHours())
                        beginTimeIndex.push(Math.ceil(date.getMinutes() / 15))
                        endTimeIndex.push(date.getHours() + 1)
                        endTimeIndex.push(Math.ceil(date.getMinutes() / 15))
                    }
                } else {
                    if (hour < 23 && minute >= 30) {
                        beginTimeIndex.push(date.getHours() + 1)
                        beginTimeIndex.push('0')
                        endTimeIndex.push(date.getHours() + 2)
                        endTimeIndex.push('0')
                    } else if (hour >= 23) {
                        beginTimeIndex.push(date.getHours())
                        beginTimeIndex.push(Math.ceil(date.getMinutes() / 30))
                        endTimeIndex.push('24')
                        endTimeIndex.push('0')
                    } else {
                        beginTimeIndex.push(date.getHours())
                        beginTimeIndex.push(Math.ceil(date.getMinutes() / 30))
                        endTimeIndex.push(date.getHours() + 1)
                        endTimeIndex.push(Math.ceil(date.getMinutes() / 30))
                    }
                }
                that.data.orderDataList.beginTimeIndex = beginTimeIndex
                that.data.orderDataList.endTimeIndex = endTimeIndex
                that.data.orderDataList.timeSelectState = false
            } else { //2发起会议
                that.data.orderDataList.meetingDate = options.date;
                that.data.orderDataList.webType = options.webType;
                that.data.orderDataList.beginTimeIndex = that.timeValue(options.begin);
                that.data.orderDataList.endTimeIndex = that.timeValue(options.end);
            }
            that.data.orderDataList.selectPeopleList = [{
                userId: app.globalData.loginInfo.userId,
                name: app.globalData.loginInfo.userName,
                pictureUrl: app.globalData.loginInfo.userIcon,
                state: true
            }]
            dd.setStorageSync({ key: 'selectPeopleList', data: that.data.orderDataList.selectPeopleList })
            that.setData({
                orderDataList: that.data.orderDataList
            })
        }
    },
    onShow: function() {
        if (dd.getStorageSync({ key: 'stencilId' }).data == '' || dd.getStorageSync({ key: 'stencilId' }).data == undefined) {
            if (dd.getStorageSync({ key: 'selectPeopleList' }).data != undefined && dd.getStorageSync({ key: 'selectPeopleList' }).data != '' || dd.getStorageSync({ key: 'selectPeopleList' }).data.length == 0) { //参会人
                this.data.orderDataList.selectPeopleList = dd.getStorageSync({ key: 'selectPeopleList' }).data;
            }
            if (dd.getStorageSync({ key: 'hostPeopleList' }).data != undefined && dd.getStorageSync({ key: 'hostPeopleList' }).data != '' || dd.getStorageSync({ key: 'hostPeopleList' }).data.length == 0) { //主持人
                this.data.orderDataList.hostPeopleList = dd.getStorageSync({ key: 'hostPeopleList' }).data;
            }
            if (dd.getStorageSync({ key: 'summaryPeopleList' }).data != undefined && dd.getStorageSync({ key: 'summaryPeopleList' }).data != '' || dd.getStorageSync({ key: 'summaryPeopleList' }).data.length == 0) { //纪要人
                this.data.orderDataList.summaryPeopleList = dd.getStorageSync({ key: 'summaryPeopleList' }).data;
            }
            if (dd.getStorageSync({ key: 'addExternalUserInfoList' }).data != undefined && dd.getStorageSync({ key: 'addExternalUserInfoList' }).data != '' || dd.getStorageSync({ key: 'addExternalUserInfoList' }).data.length == 0) { //外部人员
                this.data.orderDataList.externalUserInfoList = dd.getStorageSync({ key: 'addExternalUserInfoList' }).data;
            }
            if (dd.getStorageSync({ key: 'addMeetingAttachmentList' }).data != undefined && dd.getStorageSync({ key: 'addMeetingAttachmentList' }).data != '' || dd.getStorageSync({ key: 'addMeetingAttachmentList' }).data.length == 0) { //文件
                this.data.orderDataList.meetingAttachmentList = dd.getStorageSync({ key: 'addMeetingAttachmentList' }).data;
            }
            if (dd.getStorageSync({ key: 'addMeetingProcessList' }).data != undefined && dd.getStorageSync({ key: 'addMeetingProcessList' }).data != '' || dd.getStorageSync({ key: 'addMeetingProcessList' }).data.length == 0) { //议程
                this.data.orderDataList.meetingProcessList = dd.getStorageSync({ key: 'addMeetingProcessList' }).data;
            }
            if (dd.getStorageSync({ key: 'meetingAddressList' }).data != undefined && dd.getStorageSync({ key: 'meetingAddressList' }).data != '' || dd.getStorageSync({ key: 'meetingAddressList' }).data.length == 0) { //会议地点
                this.data.orderDataList.meetingAddressList = dd.getStorageSync({ key: 'meetingAddressList' }).data;
            }
        }
        this.data.orderDataList.currentDate = this.haveSomeMinutesTime();
        this.setData({
            orderDataList: this.data.orderDataList
        })
        console.log(this.data.orderDataList)
        if (dd.getStorageSync({ key: 'stencilId' }).data != '' && dd.getStorageSync({ key: 'stencilId' }).data != undefined) {
            if (this.data.orderDataList.stencilId != dd.getStorageSync({ key: 'stencilId' }).data) {
                this.data.orderDataList.stencilId = dd.getStorageSync({ key: 'stencilId' }).data;
                this.setData({
                    orderDataList: this.data.orderDataList
                })
            }
            this.stencilDetail();
        }
        this.stencilList(); //模版条数
        this.costPrice(); //会议成本
        // console.log(this.data.orderDataList.meetingAddressList)
    },
    onUnload: function() {
        dd.setStorageSync({ key: 'stencilId', data: '' })
        this.data.orderDataList.stencilId = '';
        this.setData({
            orderDataList: this.data.orderDataList
        })
        dd.setStorageSync({ key: 'orderDataList', data: this.data.orderDataList })
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
        dd.setStorageSync({ key: 'stencilId', data: '' })
        dd.setStorageSync({ key: 'selectPeopleList', data: this.data.orderDataList.selectPeopleList })
        dd.setStorageSync({ key: 'addExternalUserInfoList', data: this.data.orderDataList.externalUserInfoList })
        dd.navigateTo({
            url: '../joinList/joinList?type=' + e.currentTarget.dataset.type,
        })
    },
    personOutside: function(e) {
        dd.setStorageSync({ key: 'stencilId', data: '' })
        dd.setStorageSync({ key: 'selectPeopleList', data: this.data.orderDataList.selectPeopleList })
        dd.setStorageSync({ key: 'addExternalUserInfoList', data: this.data.orderDataList.externalUserInfoList })
        dd.navigateTo({
            url: '../outsidePeople/outsidePeople?type=1',
        })
    },
    btnClick: function(e) {
        var that = this;
        if (that.data.orderDataList.btnClickState) {
            that.data.orderDataList.btnClickState = false
            that.setData({
                orderDataList: that.data.orderDataList
            })
            if (that.data.orderDataList.meetingTitle == '') {
                that.data.orderDataList.btnClickState = true
                that.data.orderDataList.meetingTitle = ''
                that.setData({
                    orderDataList: that.data.orderDataList
                })
                utils.showToast('请输入会议主题', 1000)
            } else if (that.data.orderDataList.selectPeopleList.length == 0 && that.data.orderDataList.externalUserInfoList.length == 0) {
                utils.showToast('参会人不能为空', 1000)
                that.data.orderDataList.btnClickState = true
                that.setData({
                    orderDataList: that.data.orderDataList
                })
            } else {

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
                    template = 1;
                } else {
                    template = 0;
                }

                if (that.data.orderDataList.beginTimeIndex.length > 0) {
                    var scheduleStartTime = that.data.orderDataList.meetingDate + ' ' + that.data.orderDataList.timeList[0][that.data.orderDataList.beginTimeIndex[0]] + ':' + that.data.orderDataList.timeList[1][that.data.orderDataList.beginTimeIndex[1]] + ':00';
                } else {
                    utils.showToast('开始时间不能为空', 1000);
                    return;
                }
                if (that.data.orderDataList.endTimeIndex.length > 0) {
                    var scheduleEndTime = that.data.orderDataList.meetingDate + ' ' + that.data.orderDataList.timeList[0][that.data.orderDataList.endTimeIndex[0]] + ':' + that.data.orderDataList.timeList[1][that.data.orderDataList.endTimeIndex[1]] + ':00';
                } else {
                    utils.showToast('结束时间不能为空', 1000);
                    return;
                }
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
                    utils.showToast('无法新建过去时间的会议', 1000);
                    return;
                }
                if (date2 >= date3) {
                    utils.showToast('结束时间必须大于开始时间', 1000);
                    return;
                }
                var orderIds = [];
                var customLocationResponseVos = [];
                for (var i = 0; i < that.data.orderDataList.meetingAddressList.length; i++) {
                    if (that.data.orderDataList.meetingAddressList[i].type == 1) {
                        orderIds.push({
                            bookId: '',
                            endTime: that.data.orderDataList.meetingAddressList[i].bookEndTime,
                            meetingId: that.data.orderDataList.meetingAddressList[i].mroomId,
                            orderId: that.data.orderDataList.meetingAddressList[i].orderId,
                            startTime: that.data.orderDataList.meetingAddressList[i].bookStartTime
                        });
                    } else {
                        customLocationResponseVos.push({
                            bookId: '',
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
                    template: template
                }
                console.log(sendData)
                // return;
                var callBack = {
                    success: function(e) {
                        if (e.data.status == '0000') {
                            dd.setStorageSync({ key: 'selectPeopleList', data: [] });
                            dd.setStorageSync({ key: 'hostPeopleList', data: [] });
                            dd.setStorageSync({ key: 'summaryPeopleList', data: [] });
                            dd.setStorageSync({ key: 'addExternalUserInfoList', data: [] });
                            dd.setStorageSync({ key: 'addMeetingAttachmentList', data: [] });
                            dd.setStorageSync({ key: 'addMeetingProcessList', data: [] });
                            dd.setStorageSync({ key: 'meetingAddressList', data: [] });
                            dd.setStorageSync({ key: 'stencilId', data: '' });
                            dd.setStorageSync({ key: 'orderDataList', data: '' });
                            utils.showToast('新建成功', 1000);
                            dd.setStorageSync({ key: 'scheduleState', data: 2 })
                            dd.redirectTo({
                                url: '../../schedule/scheduleDetail/scheduleDetail?tabType=0&id=' + e.data.res_data.bookId,
                            })
                        } else {
                            utils.showToast(e.data.message, 1000)
                        }
                        that.data.orderDataList.btnClickState = true
                        // that.data.orderDataList.meetingTitle = ''
                        that.setData({
                            orderDataList: that.data.orderDataList
                        })
                    },
                    fail: function(e) {
                        that.data.orderDataList.btnClickState = true
                        that.setData({
                            orderDataList: that.data.orderDataList
                        })
                        utils.showToast(e.errMsg, 1000)
                    }
                }
                utils.ajax(utils.setURL('/conference/saveMeetingroomBookingInfo'), sendData, callBack);
            }
        }
    },
    meetingAgenda: function() {
        dd.setStorageSync({ key: 'stencilId', data: '' })
        dd.navigateTo({
            url: '../../schedule/scheduleDetailBefore/scheduleDetailBefore?tabType=4&id=null',
        })
    },
    meetingFile: function() {
        var that = this;
        dd.setStorageSync({ key: 'addMeetingAttachmentList', data: that.data.orderDataList.meetingAttachmentList })
        dd.setStorageSync({ key: 'stencilId', data: '' })
        dd.navigateTo({
            url: "../../schedule/scheduleDetailBefore/scheduleDetailBefore?id=&tabType=2",
        })
        // dd.navigateTo({
        //     url: '../../schedule/addFile/addFile?url=' + utils.setURL('') + '/easyUpload/index.html' + '&length=' + this.data.orderDataList.meetingAttachmentList.length + '&webType=2&bookId=null&userId=' + app.globalData.loginInfo.userId + '&companyId=' + app.globalData.loginInfo.companyId + '&propertyId=' + app.globalData.loginInfo.propertyId,
        // })
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
        dd.setStorageSync({ key: 'stencilId', data: '' })
        dd.setStorageSync({ key: 'orderDataList', data: that.data.orderDataList });
        var orderSelectTime = {
            date: that.data.orderDataList.meetingDate,
            begin: that.data.orderDataList.timeList[0][that.data.orderDataList.beginTimeIndex[0]] +
                ':' + that.data.orderDataList.timeList[1][that.data.orderDataList.beginTimeIndex[1]],
            end: that.data.orderDataList.timeList[0][that.data.orderDataList.endTimeIndex[0]] +
                ':' + that.data.orderDataList.timeList[1][that.data.orderDataList.endTimeIndex[1]]
        }
        dd.setStorageSync({ key: 'orderSelectTime', data: orderSelectTime })
        dd.navigateTo({
            url: '../meetingAddress/meetingAddress?webType=1&mroomName=&bookId=&date=' + date + timeList,
        })
    },
    switch2Change: function(e) {
        if (e.detail.value && this.data.orderDataList.stencilListLen >= 10) {
            utils.showToast('最多可以建10条模版，您已达上限', 1000);
            this.data.orderDataList.stencilState = false;
        } else {
            this.data.orderDataList.stencilState = e.detail.value;
        }
        this.setData({
            orderDataList: this.data.orderDataList
        })
    },
    switchChange: function(e) {
        this.data.orderDataList.scanState = e.detail.value;
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
        var that = this
        dd.datePicker({
            format: 'yyyy-MM-dd',
            currentDate: that.data.orderDataList.meetingDate,
            success: (res) => {
                that.data.orderDataList.meetingDate = res.date;
                that.setData({
                    orderDataList: that.data.orderDataList
                })
                that.costPrice(); //会议成本
            },
        });
    },
    beginTimeHourChange(e) {
        console.log(e)
    },
    beginTimeMinChange(e) {
        console.log(e)
    },
    beginTimeChange(e) {
        var that = this;
        var timeList = [];
        // console.log('picker发送选择改变，携带值为', e.detail.value)
        if (e.detail.value[0] >= 24) {
            this.data.orderDataList.beginTimeIndex = [24, 0];
        } else {
            this.data.orderDataList.beginTimeIndex = e.detail.value;
        }
        if (!that.data.orderDataList.timeSelectState && e.detail.value[0] < 23) {
            var endTimeIndex = []
            endTimeIndex.push(e.detail.value[0] + 1)
            endTimeIndex.push(e.detail.value[1])
            this.data.orderDataList.endTimeIndex = endTimeIndex;
        }
        timeList.push(that.data.orderDataList.timeList[0])
        if (app.globalData.meetingType == 1) {
            timeList.push(['00', '15', '30', '45']);
        } else {
            timeList.push(['00', '30']);
        }
        that.data.orderDataList.timeList = timeList;
        that.data.orderDataList.timeSelectState = true;
        that.setData({
            orderDataList: that.data.orderDataList
        })
        that.costPrice(); //会议成本
    },
    endTimeHourChange(e) {
        console.log(e)
    },
    endTimeMinChange(e) {
        console.log(e)
    },
    endTimeChange(e) {
        var that = this;
        var timeList = [];
        // console.log('picker发送选择改变，携带值为', e.detail.value)
        if (e.detail.value[0] >= 24) {
            this.data.orderDataList.endTimeIndex = [24, 0];
            this.data.orderDataList.beginTimeIndex = [24, 0];
        } else {
            this.data.orderDataList.endTimeIndex = e.detail.value;
        }
        if (this.data.orderDataList.endTimeIndex[0] <= this.data.orderDataList.beginTimeIndex[0] && this.data.orderDataList.endTimeIndex[1] <= this.data.orderDataList.beginTimeIndex[1]) {
            if (this.data.orderDataList.endTimeIndex[0] < 23) {
                this.data.orderDataList.beginTimeIndex[0] = this.data.orderDataList.endTimeIndex[0] - 1
            }
        }
        timeList.push(that.data.orderDataList.timeList[0])
        if (app.globalData.meetingType == 1) {
            timeList.push(['00', '15', '30', '45']);
        } else {
            timeList.push(['00', '30']);
        }
        that.data.orderDataList.timeList = timeList;
        that.setData({
            orderDataList: that.data.orderDataList
        })
        that.costPrice(); //会议成本
    },
    timeValue: function(value) {
        if (value == '23:59') {
            value = '24:00'
        }
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
            if (valueSplit[1] == timeList[1][i]) {
                list.push(i);
            }
        }
        return list;
    },
    inputStencil: function() {
        var that = this;
        dd.setStorageSync({ key: 'stencilId', data: '' })
        dd.setStorageSync({ key: 'orderDataList', data: that.data.orderDataList });
        dd.navigateTo({
            url: '../stencilList/stencilList?date=' + that.data.orderDataList.meetingDate,
        })
    },
    stencilList: function() {
        var that = this;
        var sendData = {}
        var callBack = {
            success: function(e) {
                if (e.data.status == '0000') {
                    that.data.orderDataList.stencilListLen = e.data.res_data.length;
                    that.setData({
                        orderDataList: that.data.orderDataList
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
                    if (content.meetingProcessList.length > 0) {
                        that.data.orderDataList.meetingProcessList = content.meetingProcessList;
                    } else {
                        that.data.orderDataList.meetingProcessList = [];
                    }

                    that.data.orderDataList.pickerAlertIndex = parseInt(content.remindType) - 1;
                    that.data.orderDataList.scanState = scanState;
                    dd.setStorageSync({ key: 'selectPeopleList', data: meetingStaffList });
                    dd.setStorageSync({ key: 'hostPeopleList', data: hostPeopleList });
                    dd.setStorageSync({ key: 'summaryPeopleList', data: summaryPeopleList });
                    that.setData({
                        orderDataList: that.data.orderDataList
                    })
                    dd.setStorageSync({ key: 'addMeetingProcessList', data: that.data.orderDataList.meetingProcessList });
                    dd.setStorageSync({ key: 'stencilId', data: '' });
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