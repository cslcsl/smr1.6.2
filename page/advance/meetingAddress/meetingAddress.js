const app = getApp()
const utils = require('../../../utils/util.js')
Page({
    data: {
        webType: 1,
        fileList: [],
        delBtnWidth: 240,
        isScroll: true,
        agendaState: false,
        agendaIndex: -1,
        meeting: '',
        address: '',
        date: '',
        bookId: '',
        startTime: '',
        endTime: '',
        scheduleStatus: 1
    },
    onLoad: function(options) {
        this.setData({
            webType: options.webType,
            date: options.date,
            bookId: options.bookId
        })
        if (options.webType == 3) {
            this.setData({
                scheduleStatus: options.scheduleStatus
            })
        }
        if (dd.getStorageSync({ key: 'meetingAddressList' }).data != '' && dd.getStorageSync({ key: 'meetingAddressList' }).data != undefined) {
            this.setData({
                fileList: dd.getStorageSync({ key: 'meetingAddressList' }).data
            })
        }
        if (options.startTime != '' && options.startTime != undefined) {
            this.setData({
                startTime: options.startTime,
                endTime: options.endTime
            })
        }
    },
    onShow: function() {
        if (dd.getStorageSync({ key: 'meetingAddressList' }).data != undefined && dd.getStorageSync({ key: 'meetingAddressList' }).data != '' || dd.getStorageSync({ key: 'meetingAddressList' }).data.length == 0) { //会议地点
            this.setData({
                fileList: dd.getStorageSync({ key: 'meetingAddressList' }).data
            })
        }
        console.log(this.data.fileList)
    },
    drawStart: function(e) {
        var touch = e.touches[0]
        for (var index in this.data.fileList) {
            var item = this.data.fileList[index]
            item.right = 0;
            if (item.type == 1) {
                item.deleteRight = -(this.data.delBtnWidth / 2);
            } else {
                item.deleteRight = -this.data.delBtnWidth;
            }
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
                if (item.type == 1) {
                    disX = this.data.delBtnWidth / 4
                } else {
                    disX = this.data.delBtnWidth
                }
            }
            item.right = disX;
            if (item.type == 1) {
                item.deleteRight = (-this.data.delBtnWidth / 2);
            } else {
                item.deleteRight = (-this.data.delBtnWidth);
            }
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
            if (item.type == 1) {
                item.right = this.data.delBtnWidth / 2
            } else {
                item.right = this.data.delBtnWidth
            }
            this.setData({
                isScroll: true,
                fileList: this.data.fileList,
            })
        } else {
            item.right = 0;
            if (item.type == 1) {
                item.deleteRight = -(this.data.delBtnWidth / 2);
            } else {
                item.deleteRight = -this.data.delBtnWidth;
            }
            this.setData({
                isScroll: true,
                fileList: this.data.fileList,
            })
        }
    },
    delItem: function(delType) {
        var that = this;
        var fileList = that.data.fileList;
        if (delType == 1) {
            var index = that.data.agendaIndex;
        } else {
            var index = delType.currentTarget.dataset.index;
        }
        var list = [];
        var sendData = {
            bookId: that.data.bookId
        }
        var callBack = {
            success: function(e) {
                if (e.data.status == '0000') {
                    for (var i = 0; i < fileList.length; i++) {
                        if (index != i) {
                            list.push(fileList[i]);
                        }
                    }
                    that.setData({
                        fileList: list
                    })
                    if (delType == 1) {
                        that.agendaComplete(1);
                    }
                    dd.setStorageSync({ key: 'meetingAddressList', data: that.data.fileList });
                } else {
                    utils.showToast(e.data.message, 1000)
                }
            },
            fail: function(e) {
                utils.showToast(e.errMsg, 1000)
            }
        }
        if (delType != 1) {
            dd.confirm({
                title: '提示',
                content: '是否确认删除地点？',
                cancelButtonText: '取消',
                cancelColor: '#2B7AFB',
                confirmButtonText: '确认',
                confirmColor: '#2B7AFB',
                success(res) {
                    if (res.confirm) {
                        if (fileList[index].type == 1 && fileList[index].orderId != '') {
                            var url = '/conference/deleteMeeting?orderId=' + fileList[index].orderId
                            utils.ajax(utils.setURL(url), sendData, callBack);
                        } else {
                            if (fileList[index].locationId != '' && fileList[index].locationId != undefined) {
                                var url = '/conference/deleteCustomPlace?locationId=' + fileList[index].locationId
                                utils.ajax(utils.setURL(url), sendData, callBack, 'DELETE');
                            } else {
                                for (var i = 0; i < fileList.length; i++) {
                                    if (index != i) {
                                        list.push(fileList[i]);
                                    }
                                }
                                that.setData({
                                    fileList: list
                                })
                                dd.setStorageSync({ key: 'meetingAddressList', data: that.data.fileList });
                            }
                        }
                    } else if (res.cancel) { }
                }
            })
        } else {
            if (fileList[index].locationId != '') {
                var url = '/conference/deleteCustomPlace?locationId=' + fileList[index].locationId
                utils.ajax(utils.setURL(url), sendData, callBack, 'DELETE');
            } else {
                for (var i = 0; i < fileList.length; i++) {
                    if (index != i) {
                        list.push(fileList[i]);
                    }
                }
                var listAdd = {
                    mroomName: this.data.meeting,
                    mroomAddress: this.data.address,
                    bookStartTime: '',
                    bookEndTime: '',
                    locationId: '',
                    bookId: '',
                    type: 2
                }
                list.push(listAdd);
                that.setData({
                    fileList: list,
                    agendaState: false,
                    meeting: '',
                    address: '',
                    agendaIndex: -1
                })
                dd.setStorageSync({ key: 'meetingAddressList', data: that.data.fileList });
            }
        }
    },
    meetingInput: function(e) {
        this.setData({
            meeting: e.detail.value
        })
    },
    addressInput: function(e) {
        this.setData({
            address: e.detail.value
        })
    },
    agendaAdd: function(e) {
        var type = e.currentTarget.dataset.type;
        if (type == 2) {
            var index = e.currentTarget.dataset.index;
            var fileList = this.data.fileList;
            this.setData({
                agendaIndex: index,
                meeting: fileList[index].mroomName,
                address: fileList[index].mroomAddress,
            })
        }
        this.setData({
            agendaState: true
        })
    },
    agendaCancel: function(e) {
        this.setData({
            agendaState: false,
            meeting: '',
            address: '',
            agendaIndex: -1
        })
    },
    agendaComplete: function(type) {
        var that = this;
        if (that.data.meeting == '') {
            utils.showToast("会议地点不能为空", 1000);
            return;
        }
        if (that.data.address == '') {
            utils.showToast("地址不能为空", 1000);
            return;
        }
        var fileList = that.data.fileList;
        if (that.data.agendaIndex >= 0 && type != 1) {
            that.delItem(1);
            return;
        }
        if ((that.data.webType == 2 || that.data.webType == 3) && that.data.bookId != '') {
            var sendData = {
                address: that.data.meeting,
                bookId: that.data.bookId,
                place: that.data.address
            }
            var callBack = {
                success: function(e) {
                    if (e.data.status == '0000') {
                        var list = {
                            mroomName: that.data.meeting,
                            mroomAddress: that.data.address,
                            bookStartTime: '',
                            bookEndTime: '',
                            locationId: '',
                            bookId: that.data.bookId,
                            type: 2
                        }
                        fileList.push(list);
                        that.setData({
                            fileList: fileList,
                            agendaState: false,
                            meeting: '',
                            address: '',
                            agendaIndex: -1
                        })
                        dd.setStorageSync({ key: 'meetingAddressList', data: that.data.fileList });
                    } else {
                        utils.showToast(e.data.message, 1000)
                    }
                },
                fail: function(e) {
                    utils.showToast(e.errMsg, 1000)
                }
            }
            var url = '/conference/customPlace'
            utils.ajax(utils.setURL(url), sendData, callBack);
        } else {
            var list = {
                mroomName: this.data.meeting,
                mroomAddress: this.data.address,
                bookStartTime: '',
                bookEndTime: '',
                locationId: '',
                bookId: '',
                type: 2
            }
            fileList.push(list);
            this.setData({
                fileList: fileList,
                agendaState: false,
                meeting: '',
                address: '',
                agendaIndex: -1
            })
        }
        dd.setStorageSync({ key: 'meetingAddressList', data: that.data.fileList });
    },
    goMeeting: function(e) {
        console.log(this.data.fileList);
        if (e.currentTarget.dataset.type == 2) { //更换会议室
            var urlValue = '../searchResult/searchResult?webType=1&fromType=2&mroomName=&date=' + this.data.date + '&mroomId=' + e.currentTarget.dataset.id + '&mroomIndex=' + e.currentTarget.dataset.index + '&type=' + this.data.webType + '&bookId=' + this.data.bookId + '&startTime=' + this.data.startTime + '&endTime=' + this.data.endTime;
        } else {
            var urlValue = '../searchResult/searchResult?webType=1&fromType=2&mroomName=&date=' + this.data.date + '&mroomId=&mroomIndex=&type=' + this.data.webType + '&bookId=' + this.data.bookId + '&startTime=' + this.data.startTime + '&endTime=' + this.data.endTime;
        }
        dd.redirectTo({
            url: urlValue,
        })
    }, meetingInputClear: function() {
        this.setData({
            meeting: ''
        })
    }
})