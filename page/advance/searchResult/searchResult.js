const app = getApp()
const utils = require('../../../utils/util.js')
var bmap = require('../../../utils/bmap-dd.min.js');
var wxMarkerData = [];

'use strict';
let choose_year = null,
    choose_month = null;
Page({
    /**
     * 页面的初始数据
     */
    data: {
        loginState: false,
        loginInfo: null,
        scrollId: 0,
        timeList: [],
        advanceList: [],
        dateList: [],
        dateIndex: 0,
        roomIndex: -1,
        currentFormat: '',
        selectTimeList: [],
        page: 1,
        pageSize: 20,
        dataList: [],
        dataListState: false,
        viewType: 0,
        latitude: '',
        longitude: '',
        rgcData: {},
        searchList: '',
        searchContent: false,
        webType: 1,
        mroomName: '',
        selectDate: '',
        fromType: 1,
        meetingAddressList: [],
        mroomId: '',
        searchContentState: false,
        searchList2: ''
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        //webType 1:名字搜索 2:高级搜索
        //fromType 1:预定 2:选择地点
        //type 1:会议新增添加地点 2:会议修改添加地点 3详情修改地点:
        this.setData({
            webType: options.webType,
            mroomName: options.mroomName,
            selectDate: options.date,
            mroomId: options.mroomId,
            fromType: options.fromType,
            type: options.type,
            bookId: options.bookId
        })
        if (options.startTime != '' && options.startTime != undefined) {
            var list = {
                startTime: options.startTime,
                endTime: options.endTime,
                searchTime: options.date,
                searchStatus: 1
            }
            this.setData({
                searchList2: list,
                searchList: list,
                searchContentState: true,
            })
        }
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
        
        dd.showLoading({
            title: '加载中...',
        })
        var searchContent = false;
        if (dd.getStorageSync({key:'searchList'}).data != undefined && dd.getStorageSync({key:'searchList'}).data != '' && this.data.webType != 1) {
            searchContent = true;
            if (dd.getStorageSync({key:'searchList'}).data.startTime != '') {
                var list = {
                    startTime: dd.getStorageSync({key:'searchList'}).data.startTime,
                    endTime: dd.getStorageSync({key:'searchList'}).data.endTime
                }
                this.setData({
                    searchContentState: true,
                    searchList2: dd.getStorageSync({key:'searchList'}).data
                })
            }
            this.setData({
                searchList: dd.getStorageSync({key:'searchList'}).data
            })
        }
        if (dd.getStorageSync({key:'meetingAddressList'}).data != undefined && dd.getStorageSync({key:'meetingAddressList'}).data != '' && this.data.fromType == 2) {
            this.setData({
                meetingAddressList: dd.getStorageSync({key:'meetingAddressList'}).data
            })
        }
        if (searchContent && this.data.searchList2 == '') {
            var selectDate = dd.getStorageSync({key:'searchList'}).data.searchTime
        } else {
            if (this.data.selectDate == '' || this.data.selectDate == undefined) {
                var selectDate = this.haveSomeMinutesTime(1);
            } else {
                var selectDate = this.data.selectDate;
            }
        }
        if (app.globalData.meetingType == 1) {
            var hourType = -15
        } else {
            var hourType = -30
        }
        this.setData({
            page: 1,
            selectTimeList: [],
            roomIndex: -1,
            dateIndex: 0,
            dataList: [],
            dataListState: false,
            selectDate: selectDate,
            currentFormat: this.haveSomeMinutesTime(2, hourType),
            searchContent: searchContent,
        });
        this.roomRequest();
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
        // dd.switchTab({
        //     url: '../index',
        // })
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        dd.stopPullDownRefresh();
        
        if (app.globalData.meetingType == 1) {
            var hourType = -15
        } else {
            var hourType = -30
        }
        this.setData({
            page: 1,
            selectTimeList: [],
            roomIndex: -1,
            dataListState: false,
            currentFormat: this.haveSomeMinutesTime(2, hourType),
        });
        this.roomRequest();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },
    onPageScroll(e) {
        var scrollTop = e.scrollTop;
        // if (!this.data.caldenlarWeek && scrollTop > 100) {
        //     this.setData({
        //         caldenlarWeek: true,
        //         swiperHeight: 45,
        //     })
        // }
    },
    roomRequest: function() {
        var that = this;
        // 请求数据中的加载效果
        if (that.data.page == 1) {
            that.setData({
                dataList: [],
                dataListState: false
            })
        }
        var currentTime = that.data.selectDate;
        if (that.data.webType == 1 && that.data.searchList2 == '') {
            var sendData = {
                mroomName: that.data.mroomName,
                searchStatus: 0,
                page: that.data.page,
                pageSize: that.data.pageSize,
                searchTime: that.data.selectDate,
                mroomId: that.data.mroomId
            }
        } else {
            var sendData = that.data.searchList
        }
        var callBack = {
            success: function(e) {
                dd.stopPullDownRefresh() //停止下拉刷新
                dd.hideLoading();
                if (e.data.status == '0000') {
                    if (that.data.page == 1) {
                        that.setData({
                            dataList: [],
                        })
                    }
                    if (e.data.res_data != null) {
                        for (var i = 0; i < e.data.res_data.length; i++) {
                            if (e.data.res_data[i].bookInfos != null) {
                                var advanceList = that.advanceList(1, e.data.res_data[i].bookInfos);

                            } else {
                                var advanceList = that.advanceList(2, '', '');
                            }
                            e.data.res_data[i].timeList = that.timeList(advanceList, e.data.res_data[i].startPermitTime, e.data.res_data[i].endPermitTime, e.data.res_data[i].permitDate, e.data.res_data[i].maxDurtionDay);
                            e.data.res_data[i].selectTimeList = that.selectTimeList(e.data.res_data[i].timeList)
                            that.data.dataList.push(e.data.res_data[i])
                        }
                        if (e.data.res_data.length < that.data.pageSize) {
                            that.setData({
                                dataState: false
                            })
                        }
                        that.setData({
                            dataList: that.data.dataList,
                            dataListState: true,
                            page: ++that.data.page
                        })
                    } else if (that.data.page == 1) {
                        that.setData({
                            dataListState: true,
                        })
                    }
                    console.log(that.data.dataList)
                } else {
                    utils.showToast(e.data.message, 1000)
                }
            },
            fail: function(e) {
                dd.stopPullDownRefresh() //停止下拉刷新
                utils.showToast(e.errMsg, 1000)
            }
        }
		utils.ajax(utils.setURL('/meetingroom/resertionDetails'), sendData, callBack);
    },
    advanceList: function(timeType, datalist) {
        var that = this;
        var list = [];
        var date = that.data.selectDate;
        if (timeType == 1) {
            for (var j = 0; j < datalist.length; j++) {
                var timeBegin = datalist[j].bookStartTime.substring((datalist[j].bookStartTime.length) - 8, datalist[j].bookStartTime.length - 3);
                var timeEnd = datalist[j].bookEndTime.substring((datalist[j].bookEndTime.length) - 8, datalist[j].bookEndTime.length - 3);
                if (timeEnd == '23:59' || timeEnd == '00:00') {
                    timeEnd = '24:00'
                }
                var secondsBegin = timeBegin.split(':')[0] * 3600 + timeBegin.split(':')[1] * 60;
                var secondsEnd = timeEnd.split(':')[0] * 3600 + timeEnd.split(':')[1] * 60;
                var seconds = secondsEnd - secondsBegin;
                var hours = parseInt(seconds / 3600);
                var minutes = parseInt((seconds % 3600) / 60);
                var listSeconds = secondsBegin;
                for (var i = 0; i < hours * 2 + Math.ceil(minutes / 30); i++) {
                    var listBegin = parseInt(listSeconds / 3600);
                    if (listBegin <= 9) {
                        listBegin = '0' + listBegin;
                    }
                    if ((listSeconds % 3600) / 60 == 0) {
                        listBegin = listBegin + ':' + '00';
                    } else {
                        listBegin = listBegin + ':' + '30';
                    }
                    listSeconds = listSeconds + 1800;
                    var listEnd = parseInt(listSeconds / 3600);
                    if (listEnd <= 9) {
                        listEnd = '0' + listEnd;
                    }
                    if ((listSeconds % 3600) / 60 == 0) {
                        listEnd = listEnd + ':' + '00';
                    } else {
                        listEnd = listEnd + ':' + '30';
                    }
                    list.push(listBegin + '-' + listEnd);
                }
            }

        }
        if (timeType == 2) {
            var arrayList = [{
                date: date,
                list: []
            }]
        } else {
            var arrayList = [{
                date: date,
                list: list
            }]
        }
        return arrayList;
    },
    confirmBtn: function(e) { //时间段点击效果
        var that = this;
        var date = that.data.selectDate;
        var index = e.currentTarget.dataset.index;
        var type = e.currentTarget.dataset.type;
        var selectTimeList = that.data.dataList[index].selectTimeList;
        var begintime = selectTimeList.begin;
        var endtime = selectTimeList.end;
        var hourTotal = selectTimeList.hour * 60 + selectTimeList.min;
        if (hourTotal > that.data.dataList[index].maxDurtionMinute && that.data.dataList[index].maxDurtionMinute > 0) {
            utils.showToast('最大预订时长不能超过' + that.data.dataList[index].maxDurtionMinute + '分钟', 1000)
            return;
        }
        if (type == 3) { //发起会议
            dd.setStorageSync({key:'stencilId', data:''});
            dd.setStorageSync({key:'selectPeopleList', data:[]});
            dd.setStorageSync({key:'hostPeopleList', data:[]});
            dd.setStorageSync({key:'summaryPeopleList', data:[]});
            dd.setStorageSync({key:'addExternalUserInfoList', data:[]});
            dd.setStorageSync({key:'addMeetingAttachmentList', data:[]});
            dd.setStorageSync({key:'addMeetingProcessList', data:[]});
            dd.setStorageSync({key:'orderDataList', data:''})
            dd.setStorageSync({key:'meetingAddressList', data:[]})
            that.setData({
                meetingAddressList: []
            })
            that.confirmMeeting(e.currentTarget.dataset.id, 2, index)
        } else if (type == 2) { //只定会议室
            that.setData({
                meetingAddressList: []
            })
            that.confirmMeeting(e.currentTarget.dataset.id, '', index)
        } else if (type == 1) { //选择会议
            var meetingAddressList = that.data.meetingAddressList;
            var list = [];
            for (var i = 0; i < that.data.meetingAddressList.length; i++) {
                if (that.data.meetingAddressList[i].type == 1) {
                    if (that.data.mroomId > 0) {
                        if (that.data.dataList[index].mroomId == that.data.meetingAddressList[i].mroomId) {
                            utils.showToast('您已经选择过当前会议室，请重新选择', 1000);
                            return;
                        } else if (that.data.mroomId != that.data.meetingAddressList[i].mroomId) {
                            list.push(that.data.meetingAddressList[i]);
                        }
                    } else {
                        if (that.data.dataList[index].mroomId == that.data.meetingAddressList[i].mroomId) {
                            utils.showToast('您已经选择过当前会议室', 1000);
                            return;
                        } else {
                            list.push(that.data.meetingAddressList[i])
                        }
                    }
                } else {
                    list.push(that.data.meetingAddressList[i])
                }
            }
            that.setData({
                meetingAddressList: list
            })
            that.confirmMeeting(that.data.dataList[index].mroomId, 2, index)
        }
    },
    confirmMeeting: function(meetingId, postType, index) {
        var that = this;
        var date = that.data.selectDate;
        var begintime = that.data.dataList[index].selectTimeList.begin;
        var endtime = that.data.dataList[index].selectTimeList.end;
        var begintimeVal = date + ' ' + begintime + ':00';
        if (endtime.split(':')[0] == 24) {
            var endtimeVal = date + ' 23:59:00';
        } else {
            var endtimeVal = date + ' ' + endtime + ':00';
        }
        var sendData = {
            endTime: endtimeVal,
            meetingId: meetingId,
            startTime: begintimeVal,
            bookId: that.data.bookId
        }
        let pages = getCurrentPages();
        if (postType == 2 && that.data.bookId == '' || that.data.type == 2) {
            var meetingAddressList = that.data.meetingAddressList;
            meetingAddressList.push({
                orderId: '',
                mroomName: that.data.dataList[index].mroomName,
                mroomAddress: that.data.dataList[index].mroomAddress,
                bookStartTime: begintimeVal,
                bookEndTime: endtimeVal,
                mroomId: meetingId,
                type: 1
            })
            dd.setStorageSync({key:'meetingAddressList', data:meetingAddressList});
            if (that.data.type == 1) {
                var pageState = true
                for (var i = 0; i < pages.length; i++) {
                    if (pages[i].route == "pages/advance/confirmOrder/confirmOrder") {
                        pageState = false
                        dd.navigateBack({
                            delta: pages.length - i - 1,
                        })
                    }
                }
                if (pageState) {
                    dd.navigateTo({
                        url: '../confirmOrder/confirmOrder?webType=2&date=' + date + '&begin=' + begintime + '&end=' + endtime
                    })
                }
            } else if (that.data.type == 2) {
                for (var i = 0; i < pages.length; i++) {
                    if (pages[i].route == "pages/advance/orderEdit/orderEdit") {
                        dd.navigateBack({
                            delta: pages.length - i - 1,
                        })
                    }
                }
            }
        } else {
            var callBack = {
                success: function(e) {
                    if (e.data.status == '0000') {
                        if (postType != 2) {
                            var meetingAddressList = [];
                            meetingAddressList.push({
                                orderId: e.data.res_data.orderId,
                                mroomName: e.data.res_data.mroomName,
                                mroomAddress: e.data.res_data.mroomAddress,
                                bookStartTime: e.data.res_data.bookStartTime,
                                bookEndTime: e.data.res_data.bookEndTime,
                                mroomId: meetingId,
                                type: 1
                            })
                            dd.setStorageSync({key:'meetingAddressList', data:meetingAddressList});
                            dd.navigateTo({
                                url: '../advanceResult/advanceResult?type=2&id=' + e.data.res_data.orderId + '&begin=' + begintime + '&end=' + endtime + '&date=' + date,
                            })
                        } else { //修改添加地点
                            var meetingAddressList = that.data.meetingAddressList;
                            meetingAddressList.push({
                                orderId: e.data.res_data.orderId,
                                mroomName: e.data.res_data.mroomName,
                                mroomAddress: e.data.res_data.mroomAddress,
                                bookStartTime: e.data.res_data.bookStartTime,
                                bookEndTime: e.data.res_data.bookEndTime,
                                mroomId: meetingId,
                                type: 1
                            })
                            dd.setStorageSync('meetingAddressList', meetingAddressList);
                            if (that.data.type == 3) {
                                dd.redirectTo({
                                    url: '../meetingAddress/meetingAddress?webType=3&mroomName=&bookId=' + that.data.bookId + '&date=' + that.data.selectDate,
                                })
                            }
                        }
                    } else {
                        utils.showToast(e.data.message, 1000)
                    }
                },
                fail: function(e) {
                    utils.showToast(e.errMsg, 1000)
                }
            }
            utils.ajax(utils.setURL('/conference/add/mroomequipmentsReserve'), sendData, callBack);
        }
    },
    scaleListClick: function(e) { // 日期段点击效果
        var that = this;
        var beforeStatus = false;
        var beforeStatusVal = '';
        var afterStatus = false;
        var afterStatusVal = '';
        var preSelectStatus = false;
        var preSelectStatusVal = [];
        var status = e.currentTarget.dataset.status;
        var index = e.currentTarget.dataset.index;
        var indexf = e.currentTarget.dataset.indexf;
        var dataList = this.data.dataList[indexf].timeList;
        var changeList = that.data.dataList[indexf].timeList;
        var valueBeginVal = e.currentTarget.dataset.valueBeginVal;
        var valueEndVal = e.currentTarget.dataset.valueEndVal;
        if (indexf != that.data.roomIndex || that.data.roomIndex < 0) {
            if (that.data.roomIndex >= 0) {
                for (var k = 0; k < that.data.dataList[that.data.roomIndex].timeList.length; k++) {
                    if (that.data.dataList[that.data.roomIndex].timeList[k].statusVal == 2) {
                        that.data.dataList[that.data.roomIndex].timeList[k].statusVal = 3;
                    }
                }
            }
            that.setData({
                dataList: that.data.dataList,
                selectTimeList: []
            })
        }
        if (status == 0 || status == 1) {
            utils.showToast('该时间段不可预订',1000);
            return;
        }

        if (status != 0 && status != 1) {
            for (var j = 0; j < dataList.length; j++) {
                if (j < index && beforeStatus == false && dataList[j].statusVal == 2) {
                    beforeStatus = true;
                    beforeStatusVal = j
                } else if (j > index && dataList[j].statusVal == 2) {
                    afterStatus = true;
                    afterStatusVal = j;
                }
                if (dataList[j].statusVal == 1 && (index > j)) { //当前选择的时间段之后有先前预定的时间段
                    preSelectStatusVal.push({
                        value: j
                    });
                }
            }
            if (status == 2) { //已经选择过的时间段
                if (beforeStatusVal == '' || afterStatusVal == '') {
                    changeList[index].statusVal = 3;
                }
                if (beforeStatusVal != '' && afterStatusVal != '') {
                    for (var e = beforeStatusVal; e < afterStatusVal + 1; e++) {
                        if (index != e && dataList[e].statusVal == 2) {
                            changeList[e].statusVal = 3;
                        }
                    }
                }

            } else { //未选择的可选时间段
                if (beforeStatusVal == '' && afterStatusVal == '') {
                    changeList[index].statusVal = 2;
                } else if (beforeStatusVal == '') {
                    for (var e = index; e < afterStatusVal + 1; e++) {
                        if (index != afterStatusVal && dataList[e].statusVal == 1) {
                            utils.showToast('该时间段不可预订',1000);
                            return;
                        }
                    }
                    for (var e = index; e < afterStatusVal + 1; e++) {
                        changeList[e].statusVal = 2;
                    }
                } else if (afterStatusVal == '') {
                    for (var e = beforeStatusVal; e < index + 1; e++) {
                        if (index != beforeStatusVal && dataList[e].statusVal == 1) {
                            utils.showToast('该时间段不可预订',1000);
                            return;
                        }
                    }
                    for (var e = beforeStatusVal; e < index + 1; e++) {
                        changeList[e].statusVal = 2;
                    }
                }
            }
            that.data.dataList[indexf].timeList = changeList;
            that.data.dataList[indexf].selectTimeList = that.selectTimeList(changeList)
            this.setData({
                dataList: that.data.dataList,
                roomIndex: indexf
            })
            // this.selectTimeList();
        }
        // }
    },
    selectTimeList: function(list) {
        var indexMin = -1;
        var indexMax = '';
        var allNum = 0;
        var listVal = [];
        var timeList = list;
        for (var i = 0; i < timeList.length; i++) {
            if (timeList[i].statusVal == 2) {
                if (indexMin == -1) {
                    indexMin = i;
                    indexMax = i;
                }
                if (i > indexMax) {
                    indexMax = i;
                }
                allNum++;
            }
        }
        if (indexMin >= 0) {
            if (app.globalData.meetingType == 1) {
                var list = {
                    begin: timeList[indexMin].valueBeginVal,
                    end: timeList[indexMax].valueEndVal,
                    hour: allNum == 1 ? 0 : parseInt(allNum / 4),
                    min: (allNum % 4) * 15
                }
            } else {
                var list = {
                    begin: timeList[indexMin].valueBeginVal,
                    end: timeList[indexMax].valueEndVal,
                    hour: allNum == 1 ? 0 : parseInt(allNum / 2),
                    min: (allNum % 2) ? 30 : 0
                }
            }
        } else {
            var list = []
        }
        listVal.push(list);
        // this.setData({
        //     selectTimeList: list
        // })
        return list;
    },
    timeList: function(advanceList, permitTimeStart, permitTimeEnd, permitDate, maxDurtionDay) {
        var that = this;
        var list = [];
        var status = '';
        var valueBegin = '';
        var valueEnd = '';
        var current = 0;
        var timeYear = that.data.currentFormat.split('-')[0];
        var timeMouth = that.data.currentFormat.split('-')[1];
        var timeDay = that.data.currentFormat.split('-')[2];
        var timeHour = that.data.currentFormat.split('-')[3];
        var timeMin = that.data.currentFormat.split('-')[4];
        var timeSecond = that.data.currentFormat.split('-')[5];
        //console.log("时：" + timeHour + "分：" + timeMin + '秒' + timeSecond);
        // 判断选择的是否是当前日期 显示刻度的当前位置

        var selectDaleList = this.data.selectDate;
        var scaleScrollId = '';
        if (app.globalData.meetingType == 1) {
            var hourType = 15
            var hourNumber = 4
        } else {
            var hourType = 30
            var hourNumber = 2
        }
        if (selectDaleList == (timeYear + '-' + timeMouth + '-' + timeDay)) {
            scaleScrollId = Number(timeHour) * hourNumber + Number(Math.ceil(timeMin / hourType));
        } else {
            scaleScrollId = Number(timeHour) * hourNumber + Number(Math.ceil(timeMin / hourType));
        }
        for (var i = 0; i < 24; i++) {
            for (var j = 0; j < hourNumber; j++) {
                if (i < timeHour) {
                    if (selectDaleList == timeYear + '-' + timeMouth + '-' + timeDay) {
                        status = 0;
                    } else {
                        status = 3;
                    }
                } else {
                    status = 3;
                }
                if (i == timeHour) {
                    if (status == 3 && selectDaleList == timeYear + '-' + timeMouth + '-' + timeDay) {
                        if (parseInt(timeMin) >= j * hourType) {
                            status = 0;
                        }
                    }
                }
                valueBegin = (Array(2).join('0') + i).slice(-2) + ':' + (Array(2).join('0') + parseInt((j)) * hourType).slice(-2);
                if (app.globalData.meetingType == 1) {
                    if (j == 3) {
                        valueEnd = (Array(2).join('0') + parseInt((i) + 1)).slice(-2) + ':' + '00';
                    } else {
                        valueEnd = (Array(2).join('0') + i).slice(-2) + ':' + (Array(2).join('0') + parseInt((j) + 1) * hourType).slice(-2);
                    }
                } else {
                    if (j == 1) {
                        valueEnd = (Array(2).join('0') + parseInt((i) + 1)).slice(-2) + ':' + '00';
                    } else {
                        valueEnd = (Array(2).join('0') + i).slice(-2) + ':' + (Array(2).join('0') + parseInt((j) + 1) * hourType).slice(-2);
                    }
                }
                if (advanceList[0].date == selectDaleList) { //判断当前选择的是哪一天和这天的预定时间段数据

                    for (var f = 0; f < advanceList[0].list.length; f++) {
                        var advanceListNum = advanceList[0].list[f]
                        var reg = new RegExp(":", "g");
                        advanceListNum = advanceListNum.replace(reg, "")
                        var advanceListBegin = advanceListNum.split('-')[0]
                        var advanceListEnd = advanceListNum.split('-')[1]
                        var valueBeginNum = valueBegin.replace(reg, "")
                        var valueEndNum = valueEnd.replace(reg, "")
                        if (valueBeginNum >= advanceListBegin && valueEndNum <= advanceListEnd) {
                            //生成的时间段已经被预定过
                            status = 1;
                        }
                    }
                };
                // advanceList: 已被预订 permitTimeStart:开始时间 permitTimeEnd结束时间 permitDate:开放日期 maxDurtionDay:最大天数
                if (status == 3) { //判断是否在开始结束时间内
                    if (permitTimeStart != null && permitTimeStart != '' && permitTimeEnd != null && permitTimeEnd != '') {
                        var advanceBeginVal = valueBegin.split(':');
                        var advanceEndVal = valueEnd.split(':');
                        var stationBeginVal = permitTimeStart.split(':');
                        var stationEndVal = permitTimeEnd.split(':');
                        advanceBeginVal = advanceBeginVal[0] + "" + advanceBeginVal[1];
                        advanceEndVal = advanceEndVal[0] + "" + advanceEndVal[1];
                        stationBeginVal = stationBeginVal[0] + "" + stationBeginVal[1];
                        stationEndVal = stationEndVal[0] + "" + stationEndVal[1];
                        if (advanceEndVal <= stationBeginVal || advanceEndVal > stationEndVal && stationEndVal != '2359') {
                            status = 0;
                        }
                    }
                }
                if (status == 3 && permitDate != null) { //判断是否再开放日期
                    if (!that.weekSelect(selectDaleList, permitDate)) {
                        status = 0;
                    }
                }
                if (status == 3 && maxDurtionDay > 0) { //判断最大天数
                    if (that.maxDurtionDay(selectDaleList, maxDurtionDay) == false) {
                        status = 0;
                    }
                }
                if (status == 3 && that.data.searchContentState) { //判断已选时间段
                    var advanceBeginVal = valueBegin.split(':');
                    var advanceEndVal = valueEnd.split(':');
                    var stationBeginVal = that.data.searchList2.startTime;
                    var stationEndVal = that.data.searchList2.endTime;
                    advanceBeginVal = advanceBeginVal[0] + "" + advanceBeginVal[1];
                    advanceEndVal = advanceEndVal[0] + "" + advanceEndVal[1];
                    stationBeginVal = stationBeginVal.substring(11, 13) + "" + stationBeginVal.substring(14, 16);
                    stationEndVal = stationEndVal.substring(11, 13) + "" + stationEndVal.substring(14, 16);
                    if (advanceBeginVal >= stationBeginVal && advanceEndVal <= stationEndVal) {
                        status = 2;
                    }
                }
                var data = {
                    statusVal: status, //0:过去时间段 1:已经预定的时间段 2：当前选择的时间段 3:可预订时间段
                    valueBeginVal: valueBegin,
                    valueEndVal: valueEnd
                }
                list.push(data);
            }
        }
        this.setData({
            timeList: list,
            scrollId: 'scaleScrollId' + scaleScrollId
        })
        return list;
    },
    haveSomeMinutesTime: function(type, n) {
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
        if (type == 1) {
            var time = year + '-' + month + '-' + day;
        } else {
            var time = year + '-' + month + '-' + day + '-' + h + '-' + m + '-' + s;
        }
        console.log(time)
        return time;
    },
    nameInputConfirm: function(e) {
        var that = this;
        dd.navigateTo({
            url: '../advanceSearch/advanceSearch?fromType=' + that.data.fromType + '&date=' + that.data.selectDate + '&bookId=' + that.data.bookId + '&mroomId=' + that.data.mroomId + '&type=' + that.data.type,
        })
    },
    webBreak: function(e) {
        dd.navigateTo({
            url: e.currentTarget.dataset.url,
        })
    },
    weekSelect: function(date, openDateWeek) {
        var that = this;
        var stationList = openDateWeek.split(',');
        var myDate = new Date(Date.parse(date.replace(/-/g, "/")));
        var getDay = myDate.getDay();
        var state = false;
        for (var i = 0; i < stationList.length; i++) {
            if (getDay == stationList[i]) {
                state = true;
                return state;
            }
            if (getDay == 0 && stationList[i] == 7) {
                state = true;
                return state;
            }
        }
        return state;
    },
    maxDurtionDay: function(date, maxDurtionDay) {
        var state = false;
        var that = this;
        var separator = "-"; //日期分隔符
        var timeYear = that.data.currentFormat.split('-')[0];
        var timeMouth = that.data.currentFormat.split('-')[1];
        var timeDay = that.data.currentFormat.split('-')[2];
        var timeHour = that.data.currentFormat.split('-')[3];
        var timeMin = that.data.currentFormat.split('-')[4];
        var timeSecond = that.data.currentFormat.split('-')[5];
        var startDateString = timeYear + "-" + timeMouth + "-" + timeDay
        var startDates = startDateString.split(separator);
        var endDates = date.split(separator);
        var startDate = new Date(startDates[0], startDates[1] - 1, startDates[2]);
        var endDate = new Date(endDates[0], endDates[1] - 1, endDates[2]);
        var day = parseInt(Math.abs(endDate - startDate) / 1000 / 60 / 60 / 24);
        if (day <= maxDurtionDay) {
            state = true;
        }
        return state;
    },
    orderSelect: function() {
        var that = this
        dd.navigateTo({
            url: '../orderSelect/orderSelect?webType=' + that.data.type + '&bookId=' + that.data.bookId,
        })
    }
})