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
        tabType: 0,
        bookId: '334899954240933888',
        page: 1,
        pageSize: 20,
        tabList: [{
            name: '信息',
            title: '会议详情',
        }, {
            name: '动态',
            title: '会议议程'
        }, {
            name: '签到',
            title: '会议文件'
        }],
        detailList: [],
        dynamicList: [],
        agendaList: [],
        fileList: [],
        fileList2: [],
        delBtnWidth: 150,
        isScroll: true,
        windowHeight: 0,
        agendaState: false,
        agendaState2: false,
        agendaAddPeople: false,
        agendaAddTitle: '',
        agendaAddName: '',
        agendaAddTime: '',
        peopleNum: 0,
        operationType: 10,
        joinState: '',
        meetingProcessList: [],
        meetingAddressList: [],
        meetingPersonList: [],
        index: '',
        messageList: [],
        messageInputState: false,
        messageValue: '',
        statusBarHeight: '',
        saveMessageState: true,
        src: '',
        progress: 0,
        currentTime: 0,
        duration: 0,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        // tabType:0 信息 1:议程 2:文件 3:动态 4:添加议程
        var that = this
        this.setData({
            bookId: options.id,
            page: 1,
            tabType: 0
        })
        dd.getSystemInfo({
            success: function(res) {
                that.setData({
                    statusBarHeight: res.statusBarHeight
                });
            }
        });
    },
    fileList2: function() {
        var that = this;
        var sendData = {}
        var callBack = {
            success: function(e) {
                if (e.data.res_data != null && e.data.status == '0000') {
                    for (var i = 0; i < e.data.res_data.length; i++) {
                        e.data.res_data[i].right = 0;
                        var fileType = e.data.res_data[i].fileName.split('.').pop();
                        e.data.res_data[i].type = fileType
                    }
                    that.setData({
                        fileList2: e.data.res_data
                    })
                } else {
                    that.setData({
                        fileList2: []
                    })
                    // utils.showToast(e.data.message, 2000)
                }
            },
            fail: function(e) {
                // utils.showToast(e.errMsg, 1000)
            }
        }
        var url = '/record/findRecordByBookId/' + that.data.bookId;
        utils.ajax(utils.setURL(url), sendData, callBack, 'GET');
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {
        this.audioCtx = dd.createAudioContext('myAudio')
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        var that = this;
        that.scheduleDetail();
        that.fileList();
        that.dynamicList();
        dd.hideLoading()
        that.setData({
            agendaState: false
        })
        that.fileList2();
        that.findMessage()
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
        if (dd.getStorageSync({key:'scheduleState'}).data != 2) {
            dd.setStorageSync({key:'scheduleState', data:1})
        }
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {},
    onShareAppMessage: function() {},
    tabClick: function(e) {
        var that = this;
        if (e.currentTarget.dataset.type == 2) {
            if (that.data.detailList.isMeetingSign == 1) {
                dd.navigateTo({
                    url: '../scanCode/scanCode?id=' + that.data.bookId,
                })
            } else {
                utils.showToast('此会议暂不支持签到', 1000)
            }
            return;
        }
        if (e.currentTarget.dataset.type != this.data.tabType) {
            this.setData({
                tabType: e.currentTarget.dataset.type,
                page: 1
            })
            // if (this.data.tabType == 0) { //详情
            //     this.scheduleDetail();
            //     this.fileList();
            // } else if (this.data.tabType == 1) {
            //     this.dynamicList();
            // }
        }
    },
    tabDetail(e) {
        var that = this;
        dd.navigateTo({
            url: '../scheduleDetailBefore/scheduleDetailBefore?id=' + that.data.bookId + '&tabType=' + e.currentTarget.dataset.type + '&fileType=' + e.currentTarget.dataset.state + '&scheduleStatus=' + that.data.scheduleStatus,
        })
    },
    bindPickerChange(e) {
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
            pickerIndex: e.detail.value
        })
    },
    personList: function(e) {
        var that = this;
        dd.setStorageSync({key:'meetingPersonList',data: that.data.meetingPersonList})
        if (that.data.detailList.scheduleStatus != 3 && that.data.detailList.scheduleStatus != 3) {
            var bookId = that.data.bookId
        } else {
            var bookId = ''
        }
        dd.navigateTo({
            url: '../personList/personList?type=' + e.currentTarget.dataset.type + '&bookId=' + bookId + '&scheduleStatus=' + that.data.scheduleStatus,
        })
    },
    agendaDelete: function(e) {
        var that = this;
        dd.confirm({
            title: '提示',
            content: '是否删除议程',
            cancelButtonText: '取消',
            cancelColor: '#2B7AFB',
            confirmButtonText: '确认',
            confirmColor: '#2B7AFB',
            success(res) {
                if (res.confirm) {
                    var index = e.currentTarget.dataset.index;
                    if (that.data.tabType == 4) {
                        var list = [];
                        for (var i = 0; i < that.data.meetingProcessList.length; i++) {
                            if (i != index) {
                                list.push(that.data.meetingProcessList[i]);
                            }
                        }
                        that.setData({
                            meetingProcessList: list
                        })
                        dd.setStorageSync({key:'addMeetingProcessList', data:that.data.meetingProcessList})
                    } else {
                        var id = e.currentTarget.dataset.id;
                        var userid = that.data.detailList.userName;
                        if (that.data.detailList.createUserId != app.globalData.loginInfo.userId) {
                            utils.showToast('对不起，暂无删除权限', 1000);
                            return;
                        }
                        var sendData = {
                            bookId: that.data.bookId
                        }
                        var callBack = {
                            success: function(e) {
                                if (e.data.status == '0000') {
                                    utils.showToast('删除成功', 1000);
                                    that.scheduleDetail();
                                } else {
                                    utils.showToast(e.data.message, 1000);
                                }
                            },
                            fail: function(e) {
                                utils.showToast(e.errMsg, 1000)
                            }
                        }
                        var url = '/meetingRoom/deleteMeetingProcessInfo/' + id + '/' + that.data.bookId;
                        utils.ajax(utils.setURL(url), sendData, callBack, 'DELETE');
                    }
                }
            }
        })
    },
    fileList: function(order) {
        var that = this;
        var sendData = {}
        var callBack = {
            success: function(e) {
                if (e.data.res_data != null) {
                    for (var i = 0; i < e.data.res_data.list.length; i++) {
                        e.data.res_data.list[i].right = 0;
                        var fileType = e.data.res_data.list[i].attachmentName.split('.').pop();
                        e.data.res_data.list[i].type = fileType
                    }
                    that.setData({
                        fileList: e.data.res_data.list
                    })
                } else {
                    that.setData({
                        fileList: []
                    })
                }
            },
            fail: function(e) {
                utils.showToast(e.errMsg,1000);
            }
        }
        var url = '/meetingCalendar/file/' + that.data.bookId + '/' + that.data.page + '/' + that.data.pageSize;
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
                    for (var i = 0; i < externalUserInfo.length; i++) {
                        externalUserInfo[i].join = '';
                        externalUserInfo[i].hoster = '';
                        externalUserInfo[i].summary = '';
                        externalUserInfo[i].exter = 1;
                        meetingPersonList.push(externalUserInfo[i]);
                    }
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
                    console.log(meetingPersonList)
                    if (e.data.res_data.scheduleStatus == 3 || e.data.res_data.scheduleStatus == 4) {
                        var scheduleStatus = 0
                    } else {
                        var scheduleStatus = 1
                    }
                    that.setData({
                        detailList: e.data.res_data,
                        meetingAddressList: meetingAddressList,
                        meetingProcessList: e.data.res_data.meetingProcessList,
                        meetingPersonList: meetingPersonList,
                        scheduleStatus: scheduleStatus
                    })

                    that.operationType();
                } else {
                    utils.showToast(e.data.message, 1000)
                }
            },
            fail: function(e) {
                utils.showToast(e.errMsg,1000);
            }
        }
        var url = '/conference/findMeetingDetailByBookId?bookId=' + that.data.bookId;
        utils.ajax(utils.setURL(url), sendData, callBack, 'GET');
    },
    drawStart: function(e) {
        var touch = e.touches[0]
        for (var index in this.data.fileList) {
            var item = this.data.fileList[index]
            item.right = 0
        }
        this.setData({
            fileList: this.data.fileList,
            startX: touch.clientX,
        })

    },
    drawMove: function(e) {
        var touch = e.touches[0]
        var item = this.data.messageList[e.currentTarget.dataset.index]
        var disX = this.data.startX - touch.clientX

        if (disX >= 20) {
            if (disX > this.data.delBtnWidth) {
                disX = this.data.delBtnWidth
            }
            item.right = disX
            this.setData({
                isScroll: false,
                messageList: this.data.messageList
            })
        } else {
            item.right = 0
            this.setData({
                isScroll: true,
                messageList: this.data.messageList
            })
        }
    },
    drawEnd: function(e) {
        var item = this.data.messageList[e.currentTarget.dataset.index]
        if (item.right >= this.data.delBtnWidth / 2) {
            item.right = this.data.delBtnWidth
            this.setData({
                isScroll: true,
                messageList: this.data.messageList,
            })
        } else {
            item.right = 0
            this.setData({
                isScroll: true,
                messageList: this.data.messageList,
            })
        }
    },
    titleInput: function(e) {
        this.setData({
            agendaAddTitle: e.detail.value
        })
    },
    nameInput: function(e) {
        this.setData({
            agendaAddName: e.detail.value
        })
    },
    timeInput: function(e) {
        this.setData({
            agendaAddTime: e.detail.value
        })
    },
    agendaAdd: function() {
        this.setData({
            agendaState: true
        })
    },
    agendaCancel: function(e) {
        this.setData({
            agendaState: false,
            messageInputState: false,
            agendaAddTitle: '',
            agendaAddTime: '',
            pickerIndex: ''
        })
    },
    agendaComplete: function() {
        var that = this;
        if (this.data.agendaAddTitle != '' && this.data.agendaAddTime != '' && this.data.agendaAddName != '') {
            if (that.data.tabType == 1) {
                var sendData = {
                    bookId: that.data.bookId,
                    duration: that.data.agendaAddTime,
                    title: that.data.agendaAddTitle,
                    userName: that.data.agendaAddName
                }
                var callBack = {
                    success: function(e) {
                        if (e.data.status == '0000') {
                            that.setData({
                                agendaState: false,
                                agendaAddTitle: '',
                                agendaAddTime: '',
                                agendaAddName: ''
                            })
                            utils.showToast('新建成功', 1000);
                            that.scheduleDetail();
                        } else {
                            utils.showToast(e.data.message, 1000);
                        }
                    },
                    fail: function(e) {
                        utils.showToast(e.errMsg, 1000);
                    }
                }
                var url = '/meetingRoom/saveMeetingProcessInfo';
                utils.ajax(utils.setURL(url), sendData, callBack);
            } else if (that.data.tabType == 4) {
                var sendData = {
                    duration: that.data.agendaAddTime,
                    title: that.data.agendaAddTitle,
                    userName: that.data.agendaAddName,
                    processId: ''
                }
                that.data.meetingProcessList.push(sendData);
                that.setData({
                    agendaState: false,
                    agendaAddTitle: '',
                    agendaAddTime: '',
                    agendaAddName: '',
                    meetingProcessList: that.data.meetingProcessList
                })
                dd.setStorageSync({key:'addMeetingProcessList', data:that.data.meetingProcessList});
            }
        } else {
            utils.showToast('请完善信息', 1000);
        }
    },
    openFile: function(e) {
        var that = this
        dd.showLoading({
            title: '文件正在加载中',
        })
        if (e == 1) {
            var url = that.data.fileList2[that.data.index].fileUrl;
            var fileType = that.data.fileList2[that.data.index].type;
        } else {
            var url = e.currentTarget.dataset.url;
            var fileType = e.currentTarget.dataset.type;
        }
        if (fileType == 'bmp' || fileType == 'jpg' || fileType == 'jpeg' || fileType == 'png' || fileType == 'gif') {
            var urls = [];
            urls.push(url);
            dd.previewImage({
                current: url, // 当前显示图片的http链接
                urls: urls // 需要预览的图片http链接列表
            })
        } else {
            dd.downloadFile({ //下载预览附件
                url: url,
                fileType: fileType,
                success: function(res) {
                    //console.log(res)
                    console.log(url);
                    console.log(fileType);
                    var filePath = res.tempFilePath
                    dd.openDocument({ //打开附件
                        filePath: filePath,
                        fileType: fileType,
                        success: function(res) {
                            //console.log(res)
                            dd.hideLoading()
                        },
                        fail: function(res) {
                            utils.showToast('暂不支持此文件预览', 1000);
                        }
                    })
                },
                fail: function(res) {
                    utils.showToast('暂不支持此文件预览', 1000);
                }
            })
        }
    },
    fileDelete: function(e) {
        var that = this;
        dd.confirm({
            title: '提示',
            content: '是否删除文件？',
            cancelButtonText: '取消',
            cancelColor: '#2B7AFB',
            confirmButtonText: '确认',
            confirmColor: '#2B7AFB',
            success(res) {
                if (res.confirm) {
                    var userid = e.currentTarget.dataset.userid;
                    var id = e.currentTarget.dataset.id;
                    if (that.data.detailList.createUserId != app.globalData.loginInfo.userId) {
                        utils.showToast('暂无删除权限', 1000);
                    } else {
                        var sendData = {}
                        var callBack = {
                            success: function(e) {
                                if (e.data.status == '0000') {
                                    utils.showToast('删除成功', 1000);
                                    that.setData({
                                        page: 1
                                    })
                                    that.fileList();
                                } else {
                                    utils.showToast(e.data.message, 1000);
                                }
                            },
                            fail: function(e) {
                                utils.showToast(e.errMsg,1000);
                            }
                        }
                        var url = '/meetingCalendar/file/' + id;
                        utils.ajax(utils.setURL(url), sendData, callBack, 'DELETE');
                    }
                }
            }
        })
    },
    dynamicList: function(e) {
        var that = this;
        var sendData = {}
        var callBack = {
            success: function(e) {
                for (var i = 0; i < e.data.res_data.list.length; i++) {
                    e.data.res_data.list[i].right = 0;
                    var fileType = e.data.res_data.list[i].content.split('.').pop();
                    e.data.res_data.list[i].filetype = fileType
                }
                that.setData({
                    dynamicList: e.data.res_data.list
                })
            },
            fail: function(e) {
                utils.showToast(e.errMsg,1000);
            }
        }
        var url = '/meetingRecord/' + that.data.bookId + '/' + that.data.page + '/' + that.data.pageSize;
        utils.ajax(utils.setURL(url), sendData, callBack, 'GET');
    },
    meetingOperation: function(e) {
        var that = this;
        var type = e.currentTarget.dataset.type;
        if (type == 1) { //修改
            dd.setStorageSync({key:'selectPeopleList', data:[]});
            dd.setStorageSync({key:'hostPeopleList', data:[]});
            dd.setStorageSync({key:'summaryPeopleList', data:[]});
            dd.setStorageSync({key:'addExternalUserInfoList', data:[]});
            dd.setStorageSync({key:'addMeetingAttachmentList', data:[]});
            dd.setStorageSync({key:'addMeetingProcessList', data:[]});
            dd.setStorageSync({key:'meetingAddressList', data:[]});
            dd.setStorageSync({key:'stencilId', data:''});
            dd.setStorageSync({key:'orderDataList', data:''});
            dd.navigateTo({
                url: '../../advance/orderEdit/orderEdit?bookId=' + that.data.bookId,
            })
            return;
        }
        if (type == 6) { //延时
            dd.navigateTo({
                url: '../../advance/orderDelay/orderDelay?bookId=' + that.data.bookId + '&startDate=' + that.data.detailList.scheduleStartTime + '&endDate=' + that.data.detailList.scheduleEndTime,
            })
        }
        var sendData = {
            bookId: that.data.bookId
        }
        var callBack = {
            success: function(e) {
                if (e.data.status == '0000') {
                    that.setData({
                        operationType: 10
                    })
                    if (type == 2) {
                        dd.setStorageSync({key:'scheduleState', data:2})
                    }
                    if (type == 5 || type == 3 || type == 4) {
                        that.setData({
                            agendaState: false
                        })
                        that.scheduleDetail();
                    } else {
                        dd.navigateBack({
                            delta: 1,
                        })
                    }
                } else {
                    utils.showToast(e.data.message, 1000)
                }
            },
            fail: function(e) {
                utils.showToast(e.errMsg,1000);
            }
        }
        if (type == 2) { //取消
            dd.confirm({
                title: '提示',
                content: '是否确认取消会议？',
                cancelButtonText: '取消',
                cancelColor: '#2B7AFB',
                confirmButtonText: '确认',
                confirmColor: '#2B7AFB',
                success(res) {
                    if (res.confirm) {
                        var url = '/conference/cancelMeetingTimeDelay?bookId=' + that.data.bookId
                        utils.ajax(utils.setURL(url), sendData, callBack, 'POST');
                    } else if (res.cancel) {

                    }
                }
            })
        }
        if (type == 3 || type == 4) { //参加
            if (type == 3) {
                dd.confirm({
                    title: '提示',
                    content: '确定参加会议？',
                    cancelButtonText: '取消',
                    cancelColor: '#2B7AFB',
                    confirmButtonText: '确认',
                    confirmColor: '#2B7AFB',
                    success(res) {
                        if (res.confirm) {
                            var url = '/conference/participate?bookId=' + that.data.bookId + '&joinStatus=1';
                            utils.ajax(utils.setURL(url), sendData, callBack, 'PUT');
                        } else if (res.cancel) {

                        }
                    }
                })
            } else {
                dd.confirm({
                    title: '提示',
                    content: '拒绝参加会议？',
                    cancelButtonText: '取消',
                    cancelColor: '#2B7AFB',
                    confirmButtonText: '确认',
                    confirmColor: '#2B7AFB',
                    success(res) {
                        if (res.confirm) {
                            var url = '/conference/participate?bookId=' + that.data.bookId + '&joinStatus=0';
                            utils.ajax(utils.setURL(url), sendData, callBack, 'PUT');
                        } else if (res.cancel) {

                        }
                    }
                })

            }

        }
        if (type == 5) { //提前结束
			dd.confirm({
				title: '提示',
				content: '是否确认提前结束会议？',
				cancelButtonText: '取消',
				cancelColor: '#2B7AFB',
				confirmButtonText: '确认',
				confirmColor: '#2B7AFB',
				success(res) {
					if (res.confirm) {
						var url = '/conference/overMeetingTimeDelay?bookId=' + that.data.bookId
						utils.ajax(utils.setURL(url), sendData, callBack);
					}
				}
			})
        }
		if (type==7) {//会议授权
			var that = this;
			dd.setStorageSync({key:'meetingPersonList', data:that.data.meetingPersonList})
			dd.navigateTo({
				url: '../personRole/personRole?type=6&bookId=' + that.data.bookId + '&scheduleStatus=' + that.data.scheduleStatus,
			})
		}
    },
    operationType: function() { //判断详情按钮类型
        var that = this;
        var begin_time = that.data.detailList.scheduleStartTime;
        var end_time = that.data.detailList.scheduleEndTime;
        var begintime_ms = Date.parse(new Date(begin_time.replace(/-/g, "/")));
        var endtime_ms = Date.parse(new Date(end_time.replace(/-/g, "/")));
        var date1 = (new Date()).getTime(); //当前时间
        var date2 = (new Date(begintime_ms)).getTime(); //开始时间
        var date3 = (new Date(endtime_ms)).getTime(); //结束时间
        if (app.globalData.loginInfo.userId == that.data.detailList.createUserId) { //登录人等于发起人
            that.setData({
                loginState: true
            })
        } else {
            that.setData({
                loginState: false
            })
        }
        if ((date2 - date1) > 0) { //现在时间还未到开始时间
            var operationType = 1;
            if (that.data.detailList.joinStatus == 2) {
                operationType = 4;
            }
            for (var i = 0; i < that.data.detailList.externalStaff.externalStaff.unconfirmedMeeting.length; i++) {
                if (app.globalData.loginInfo.userId == that.data.detailList.externalStaff.externalStaff.unconfirmedMeeting[i].userId) {
                    operationType = 4;
                }
            }
            that.setData({
                operationType: operationType
            })
        }
        if ((date1 - date2) > 0 && (date3 - date1) > 0) { //现在时间在开会时间
            that.setData({
                operationType: 2
            })
        }
    },
    meetingAddress: function() {
        var that = this;
        var date = (that.data.detailList.scheduleStartTime).substring(0, 10);
        dd.setStorageSync({key:'meetingAddressList', data:that.data.meetingAddressList})
        var orderSelectTime = {
            date: date,
            begin: (that.data.detailList.scheduleStartTime).substring(11, 16),
            end: (that.data.detailList.scheduleEndTime).substring(11, 16)
        }
        dd.setStorageSync({key:'orderSelectTime', data:orderSelectTime})
        dd.navigateTo({
            url: '../../advance/meetingAddress/meetingAddress?webType=3&mroomName=&bookId=' + that.data.bookId + '&date=' + date + '&startTime=' + that.data.detailList.scheduleStartTime + '&endTime=' + that.data.detailList.scheduleEndTime + '&scheduleStatus=' + that.data.scheduleStatus,
        })
    },
    clickFile: function(e) {
        var index = e.currentTarget.dataset.index;
        var that = this;
        that.setData({
            index: index,
            src: that.data.fileList2[index].fileUrl,
            progress: 0,
            currentTime: 0,
            duration: 0,
        })
        if (that.data.fileList2[index].type == 'mp3' || that.data.fileList2[index].type == 'wav') {
            that.setData({
                agendaState2: true,
            })
            that.audioPlay();
        } else {
            that.openFile(1);
        }
    },
    audioPlay: function(e) {
        var that = this;
        this.audioCtx.play()
    },
    audioSeek: function(number) {
        this.audioCtx.seek(number)
        this.audioCtx.play()
    },
    musicStart: function(e) {
        var progress = parseInt((parseInt(e.detail.currentTime) / parseInt(e.detail.duration)) * 100)
        var that = this
        that.setData({
            currentTime: parseInt(e.detail.currentTime),
            duration: parseInt(e.detail.duration),
            progress: progress
        })
    },
    slider4change: function(e) {
        this.audioSeek(e.detail.value)
    },
    sliderChangeing: function(e) {
        this.audioCtx.pause()
    },
    audioPause: function(e) {
        var that = this;
        that.setData({
            agendaState2: false,
            progress: 0,
            currentTime: 0,
            duration: 0,
        })
        this.audioCtx.pause()
    },
    findMessage: function() {
        var that = this;
        var sendData = {}
        var callBack = {
            success: function(e) {
                if (e.data.status == '0000') {
                    for (var i = 0; i < e.data.res_data.length; i++) {
                        e.data.res_data[i].right = 0
                    }
                    that.setData({
                        messageList: e.data.res_data
                    })
                }
            },
            fail: function(e) {
                utils.showToast(e.errMsg, 1000)
            }
        }
        var url = '/leaveMessages/findAllLeaveMessages/' + that.data.bookId;
        utils.ajax(utils.setURL(url), sendData, callBack, 'POST');
    },
    deleteMessage: function(e) {
        var that = this;
        var id = e.currentTarget.dataset.id
        var userId = e.currentTarget.dataset.userid
        if (app.globalData.loginInfo.userId == userId) {
            var sendData = {}
            var callBack = {
                success: function(e) {
                    if (e.data.status == '0000') {
                        utils.showToast('删除成功', 1000)
                        that.findMessage()
                    } else {
                        utils.showToast(e.data.message, 1000)
                    }
                },
                fail: function(e) {
                    utils.showToast(e.errMsg, 1000)
                }
            }
            var url = '/leaveMessages/deleteLeaveMessages/' + id;
            utils.ajax(utils.setURL(url), sendData, callBack, 'DELETE');
        } else {
            utils.showToast('对不起，暂无删除权限', 1000)
        }
    },
    messageInput: function(e) {
        this.setData({
            messageValue: e.detail.value
        })
    },
    saveMessage: function(e) {
        var that = this;
        if (e.currentTarget.dataset.type == 1) {
            that.setData({
                agendaState: true,
                messageInputState: true
            })
        } else {
            if (that.data.saveMessageState) {
                that.setData({
                    saveMessageState: false
                })
                if (that.data.messageValue == '') {
                    utils.showToast('留言内容不能为空', 1000)
                    that.setData({
                        saveMessageState: true
                    })
                    return
                } else if (that.data.messageValue.length > 50) {
                    utils.showToast('留言内容长度不能超过50', 1000)
                    that.setData({
                        saveMessageState: true
                    })
                    return
                }
                var sendData = {
                    bookingId: that.data.bookId,
                    messages: that.data.messageValue
                }
                var callBack = {
                    success: function(e) {
                        if (e.data.status == '0000') {
                            that.setData({
                                messageValue: '',
                                agendaState: false,
                                messageInputState: false
                            })
                            setTimeout(function() {
                                that.setData({
                                    saveMessageState: true
                                })
                            }, 500)
                            utils.showToast(e.data.message, 1000)
                            that.findMessage()
                        } else {
                            utils.showToast(e.data.message, 1000)
                            that.setData({
                                saveMessageState: true
                            })
                        }
                    },
                    fail: function(e) {
                        utils.showToast(e.errMsg, 1000)
                        setTimeout(function() {
                            that.setData({
                                saveMessageState: true
                            })
                        }, 500)
                    }
                }
                var url = '/leaveMessages/saveMeetingLeaveMessages';
                utils.ajax(utils.setURL(url), sendData, callBack, 'POST');
            }
        }
    },
    navClick: function(e) {
        var type = e.currentTarget.dataset.type
        if (type == 1) {
            dd.navigateBack({
                delta: 1,
            })
        } else {
            dd.switchTab({
                url: '../index',
            })
        }
    },
    closeMessage: function() {
        this.setData({
            agendaState: false,
            messageInputState: false,
            messageValue: ''
        })
    }
})