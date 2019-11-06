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
        bookId: '74',
        page: 1,
        pageSize: 20,
        tabList: [{
            name: '信息',
            title: '会议详情',
        }, {
            name: '议程',
            title: '会议议程'
        }, {
            name: '文件',
            title: '会议文件'
        }, {
            name: '动态',
            title: '会议动态'
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
        operationType: '',
        meetingProcessList: [],
        meetingAddressList: [],
        fileState: false,
        index: '',
        fileType: 1,
        scheduleStatus: 1,
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
        this.setData({
            bookId: options.id,
            page: 1,
            tabType: options.tabType
        })
        if (options.id != undefined && options.id != '') {
            this.setData({
                scheduleStatus: options.scheduleStatus
            })
        }
        if (options.tabType == 2) {
            this.setData({
                fileType: options.fileType
            })
        }
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
        // var url = '/record/findRecordByBookId/2237';
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
        dd.hideLoading();
        var that = this;
        if (that.data.tabType == 0) { //信息
            that.scheduleDetail();
        } else if (that.data.tabType == 1) { //议程
            that.scheduleDetail();
            dd.setNavigationBar({
                title: '议程详情',
            })
        } else if (that.data.tabType == 2) { //文件
            if (that.data.bookId != '') {
                that.fileList();
                that.fileList2();
            } else {
                if (dd.getStorageSync({key:'addMeetingAttachmentList'}).data != undefined && dd.getStorageSync({key:'addMeetingAttachmentList'}).data != '') {
                    var addMeetingAttachmentList = dd.getStorageSync({key:'addMeetingAttachmentList'}).data;
                    if (that.data.fileState) {
                        that.setData({
                            fileList: []
                        })
                    }
                    for (var i = 0; i < addMeetingAttachmentList.length; i++) {
                        addMeetingAttachmentList[i].type = (addMeetingAttachmentList[i].attachmentName).split('.')[1]
                        addMeetingAttachmentList[i].bookId = ''
                        addMeetingAttachmentList[i].id = ''
                        that.data.fileList.push(addMeetingAttachmentList[i]);
                    }
                    that.setData({
                        fileList: that.data.fileList
                    })
                    dd.setStorageSync({key:'addMeetingAttachmentList', data:[]})
                }
            }
            console.log(that.data.fileList)
            dd.setNavigationBar({
                title: '文件详情',
            })
        } else if (that.data.tabType == 3) { //动态
            that.dynamicList();
        } else if (that.data.tabType == 4) { //议程新增
            dd.setNavigationBar({
                title: '议程详情',
            })
            if (dd.getStorageSync({key:'addMeetingProcessList'}).data != undefined && dd.getStorageSync({key:'addMeetingProcessList'}).data != '') { //议程
                that.setData({
                    meetingProcessList: dd.getStorageSync({key:'addMeetingProcessList'}).data
                })
            }
        }
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
        if (this.data.bookId == '' && this.data.tabType == 2) {
            dd.setStorageSync({key:'addMeetingAttachmentList', data:this.data.fileList})
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
    tabClick: function(e) {
        if (e.currentTarget.dataset.type != this.data.tabType) {
            this.setData({
                tabType: e.currentTarget.dataset.type,
                page: 1
            })
            if (this.data.tabType == 0) { //详情
                this.scheduleDetail();
            } else if (this.data.tabType == 1) { //议程
                this.scheduleDetail();
            } else if (this.data.tabType == 2) { //文件
                this.fileList();
            } else if (this.data.tabType == 3) { //动态
                this.dynamicList();
            }
        }
    },
    webBreak: function(e) {
        dd.navigateTo({
            url: e.currentTarget.dataset.url,
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
        var detailList = that.data.detailList;
        var agreeJoinUserInfoList = detailList.externalStaff.externalStaff.confirmMeeting;
        for (var i = 0; i < agreeJoinUserInfoList.length; i++) {
            agreeJoinUserInfoList[i].name = agreeJoinUserInfoList[i].userName;
        }
        var rejectJoinUserInfoList = detailList.externalStaff.externalStaff.noMeeting;
        for (var i = 0; i < rejectJoinUserInfoList.length; i++) {
            rejectJoinUserInfoList[i].name = rejectJoinUserInfoList[i].userName;
        }
        var waitJoinUserInfoList = detailList.externalStaff.externalStaff.unconfirmedMeeting;
        for (var i = 0; i < waitJoinUserInfoList.length; i++) {
            waitJoinUserInfoList[i].name = waitJoinUserInfoList[i].userName;
        }
        dd.setStorageSync({key:'agreePeopleList', data:agreeJoinUserInfoList})
        dd.setStorageSync({key:'reflectPeopleList', data:rejectJoinUserInfoList})
        dd.setStorageSync({key:'waitPeopleList', data:waitJoinUserInfoList})
        dd.navigateTo({
            url: '../personList/personList?type=' + e.currentTarget.dataset.type,
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
                    that.setData({
                        detailList: e.data.res_data,
                        meetingAddressList: meetingAddressList,
                        meetingProcessList: e.data.res_data.meetingProcessList
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
        var item = this.data.fileList[e.currentTarget.dataset.index]
        var disX = this.data.startX - touch.clientX
        if (disX >= 20) {
            if (disX > this.data.delBtnWidth) {
                disX = this.data.delBtnWidth
            }
            item.right = disX
            this.setData({
                isScroll: false,
                fileList: this.data.fileList
            })
        } else {
            item.right = 0
            this.setData({
                isScroll: true,
                fileList: this.data.fileList
            })
        }

    },
    drawEnd: function(e) {
        var item = this.data.fileList[e.currentTarget.dataset.index]
        if (item.right >= this.data.delBtnWidth / 2) {
            item.right = this.data.delBtnWidth
            this.setData({
                isScroll: true,
                fileList: this.data.fileList,
            })
        } else {
            item.right = 0
            this.setData({
                isScroll: true,
                fileList: this.data.fileList,
            })
        }

    },
    drawStart1: function(e) {
        var touch = e.touches[0]
        for (var index in this.data.fileList2) {
            var item = this.data.fileList2[index]
            item.right = 0
        }
        this.setData({
            fileList2: this.data.fileList2,
            startX: touch.clientX,
        })
    },
    drawMove1: function(e) {
        var touch = e.touches[0]
        var item = this.data.fileList2[e.currentTarget.dataset.index]
        var disX = this.data.startX - touch.clientX
        if (disX >= 20) {
            if (disX > this.data.delBtnWidth) {
                disX = this.data.delBtnWidth
            }
            item.right = disX
            this.setData({
                isScroll: false,
                fileList2: this.data.fileList2
            })
        } else {
            item.right = 0
            this.setData({
                isScroll: true,
                fileList2: this.data.fileList2
            })
        }
    },
    drawEnd1: function(e) {
        var item = this.data.fileList2[e.currentTarget.dataset.index]
        if (item.right >= this.data.delBtnWidth / 2) {
            item.right = this.data.delBtnWidth
            this.setData({
                isScroll: true,
                fileList: this.data.fileList2,
            })
        } else {
            item.right = 0
            this.setData({
                isScroll: true,
                fileList2: this.data.fileList2,
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
            agendaAddTitle: '',
            agendaAddTime: '',
            agendaAddName: '',
            pickerIndex: ''
        })
    },
    timeInputClear: function() {
        this.setData({
            agendaAddTime: ''
        })
    },
    agendaAddNameClear: function() {
        this.setData({
            agendaAddName: ''
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
    addFile: function() {
        var that = this;
        if (that.data.bookId != "") {
            dd.navigateTo({
                url: '../addFile/addFile?url=' + utils.setURL('') + '/easyUpload/aliOssUpload.html' + '&webType=1&bookId=' + that.data.bookId + '&userId=' + app.globalData.loginInfo.userId + '&companyId=' + app.globalData.loginInfo.companyId + '&propertyId=' + app.globalData.loginInfo.propertyId + '&length=' + that.data.fileList.length + '&fileType=' + that.data.fileType,
            })
            // dd.navigateTo({
            //     url: '../addFile/addFile?url=http://192.168.31.80:8020/easyUpload/aliOssUpload.html' + '&webType=1&bookId=' + that.data.bookId + '&userId=' + app.globalData.loginInfo.userId + '&companyId=' + app.globalData.loginInfo.companyId + '&propertyId=' + app.globalData.loginInfo.propertyId + '&length=' + that.data.fileList.length + '&fileType=' + that.data.fileType,
            // })
        } else {
            // dd.navigateTo({
            // 	url: '../addFile/addFile?url=' + utils.setURL('') + '/easyUpload/index.html' + '&length=' + that.data.fileList.length + '&webType=2&bookId=null&userId=' + app.globalData.loginInfo.userId + '&companyId=' + app.globalData.loginInfo.companyId + '&propertyId=' + app.globalData.loginInfo.propertyId,
            // })
            dd.navigateTo({
                url: '../addFile/addFile?url=' + utils.setURL('') + '/easyUpload/aliOssUpload.html' + '&length=' + that.data.fileList.length + '&webType=2&bookId=null&userId=' + app.globalData.loginInfo.userId + '&companyId=' + app.globalData.loginInfo.companyId + '&propertyId=' + app.globalData.loginInfo.propertyId + '&fileType=0',
            })
            // dd.navigateTo({
            //     url: '../addFile/addFile?url=http://192.168.31.80:8020/easyUpload/aliOssUpload.html' + '&length=' + that.data.fileList.length + '&webType=2&bookId=null&userId=' + app.globalData.loginInfo.userId + '&companyId=' + app.globalData.loginInfo.companyId + '&propertyId=' + app.globalData.loginInfo.propertyId + '&fileType=0',
            // })
        }
    },
    openFile: function(e) {
        var that = this;
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
                    var filePath = res.tempFilePath
                    dd.openDocument({ //打开附件
                        filePath: filePath,
                        fileType: fileType,
                        success: function(res) {
                            //console.log(res)
                            dd.hideLoading()
                            that.setData({
                                openFile: true
                            })
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
                    var index = e.currentTarget.dataset.index;
                    var type = e.currentTarget.dataset.type;
                    if (id != '') {
                        if (userid != app.globalData.loginInfo.userId) {
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
                                        if (type == 1) {
                                            that.fileList();
                                        } else {
                                            that.fileList2();
                                        }
                                    } else {
                                        utils.showToast(e.data.message, 1000);
                                    }
                                },
                                fail: function(e) {
                                    utils.showToast(e.errMsg,1000);
                                }
                            }
                            if (type == 1) {
                                var url = '/meetingCalendar/file/' + id;
                            } else {
                                var url = '/record/delRecordFile/' + id;
                            }

                            utils.ajax(utils.setURL(url), sendData, callBack, 'DELETE');
                        }
                    } else {
                        var list = [];
                        for (var i = 0; i < that.data.fileList.length; i++) {
                            if (index != i) {
                                list.push(that.data.fileList[i]);
                            }
                        }
                        that.setData({
                            fileList: list
                        })
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
                        operationType: ''
                    })
                    if (type == 2) {
                        dd.setStorageSync({key:'scheduleState', data:2})
                    }
                    if (type == 5) {
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
                confirmColor: '#1874EC',
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
                var url = '/conference/participate?bookId=' + that.data.bookId + '&joinStatus=1';
            } else {
                var url = '/conference/participate?bookId=' + that.data.bookId + '&joinStatus=0';
            }
            utils.ajax(utils.setURL(url), sendData, callBack, 'PUT');
        }
        if (type == 5) { //提前结束
            var url = '/conference/overMeetingTimeDelay?bookId=' + that.data.bookId
            utils.ajax(utils.setURL(url), sendData, callBack);
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
        }
        if (app.globalData.loginInfo.userId != that.data.detailList.createUserId) { //参加人
            if ((date2 - date1) > 0) { //现在时间还未到开始时间
                var operationType = that.data.operationType;
                if (that.data.detailList.attend) {
                    operationType = 3;
                }
                that.setData({
                    operationType: operationType
                })
            }
        }
    },
    meetingAddress: function() {
        var that = this;
        var date = (that.data.detailList.scheduleStartTime).substring(0, 10);
        dd.setStorageSync({key:'meetingAddressList', data:that.data.meetingAddressList})
        // console.log(that.data.meetingAddressList)
        dd.navigateTo({
            url: '../../advance/meetingAddress/meetingAddress?webType=3&mroomName=&bookId=' + that.data.bookId + '&date=' + date,
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
    }
})