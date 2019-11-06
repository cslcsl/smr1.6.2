'use strict';
let choose_year = null,
    choose_month = null;
const app = getApp()
const utils = require('../../utils/util.js')
Page({
    data: {
        day: '',
        year: '',
        month: '',
        date: '2017-01',
        today: '',
        week: ['日', '一', '二', '三', '四', '五', '六'],
        calendar: {
            first: [],
            second: [],
            third: [],
            fourth: [],
            weeklist: []
        },
        swiperMap: ['first', 'second', 'third', 'fourth'],
        swiperIndex: 1,
        swiperWeekIndex: 1,
        showCaldenlar: false,
        caldenlarWeek: true,
        isScroll: true,
        selectDate: '',
        windowHeight: 0,
        scheduleList: [],
        loginInfo: null,
        status: 0,
        statusState: false,
        alertState: false,
        swiperScheduleHeight: '',
        swiperScheduleIndex: '',
        MikeBox: [],
        scrollDate: {
            begin: '',
            end: '',
        },
        bindScrollState: false
    },
    onLoad() {
        var that = this;
        dd.getSystemInfo({
            success: function(res) {
                that.setData({
                    windowHeight: res.windowHeight
                });
            }
        })
        if (dd.getStorageSync({ key: 'loginInfo' }).data != '' && dd.getStorageSync({ key: 'loginInfo' }).data != undefined) {
            this.setData({
                loginInfo: dd.getStorageSync({ key: 'loginInfo' }).data
            })
            if (dd.getStorageSync({ key: 'loginInfo' }).data.userStatus != 1) {
                dd.redirectTo({
                    url: '../person/login/login',
                })
            }
        } else {
            dd.redirectTo({
                url: '../person/login/login',
            })
        }
    },
    wrapperClick: function() {
        this.setData({
            statusState: false
        })
    },
    onShow: function() {
        if (dd.getStorageSync({ key: 'loginInfo' }).data != '' && dd.getStorageSync({ key: 'loginInfo' }).data != undefined) {
            this.init();
            dd.setStorageSync({ key: 'scheduleState', data: '' })
            utils.getNewInboxNumber();
            this.meetingConfig()
        } else {
            dd.redirectTo({
                url: '../person/login/login',
            })
        }
    },
    init: function(type) {
        if (type == 1) {
            this.scheduleList();
            this.selectDateList();
            this.weeklist();
        } else {
            const date = new Date(),
                month = this.formatMonth(date.getMonth() + 1),
                year = date.getFullYear(),
                day = this.formatDay(date.getDate()),
                today = `${year}-${month}-${day}`
            this.setData({
                calendar: this.generateThreeMonths(year, month),
                month: month,
                year: year,
                day: day,
                today: today,
                beSelectDate: today,
                selectDate: today,
                date: `${year}-${month}`
            })
            if (this.data.caldenlarWeek) {
                this.swiperWeekIndex();
            }
            this.scheduleList();
            this.selectDateList();
        }
    },
    onHide: function() { },
    onPullDownRefresh: function() {
        dd.stopPullDownRefresh();
        this.scheduleList();
        this.selectDateList();
    },
    onShareAppMessage: function() {
        return {
            imageUrl: '../../images/common/sharepic.png'
        }
    },
    showCaldenlar() {
        this.setData({
            showCaldenlar: !this.data.showCaldenlar
        })
    },
    // 左右滑动
    swiperChange(e) {
        if (this.data.caldenlarWeek == false) {
            //console.log('滑动了')
            const lastIndex = this.data.swiperIndex,
                currentIndex = e.detail.current
            let flag = false,
                {
                    year,
                    month,
                    day,
                    today,
                    date,
                    calendar,
                    swiperMap
                } = this.data,
                change = swiperMap[(lastIndex + 2) % 4],
                time = this.countMonth(year, month),
                key = 'lastMonth'

            if (lastIndex > currentIndex) {
                lastIndex === 3 && currentIndex === 0 ?
                    flag = true :
                    null
            } else {
                lastIndex === 0 && currentIndex === 3 ?
                    null :
                    flag = true
            }
            if (flag) {
                key = 'nextMonth'
            }

            year = time[key].year
            month = time[key].month
            date = `${year}-${month}`
            day = ''
            if (today.indexOf(date) !== -1) {
                day = today.slice(-2)
            }

            time = this.countMonth(year, month)
            calendar[change] = null
            calendar[change] = this.generateAllDays(time[key].year, time[key].month);
            let swiperMapIndex = swiperMap[currentIndex];
            if (this.data.caldenlarWeek) {
                var swiperHeight = 45;
            } else {
                var swiperHeight = (((calendar[swiperMapIndex].length) / 7) * 50) - 5
            }
            this.setData({
                swiperIndex: currentIndex,
                //文档上不推荐这么做，但是滑动并不会改变current的值，所以随之而来的计算会出错
                year,
                month,
                date,
                day,
                calendar,
                swiperHeight: swiperHeight,
                swiperScheduleHeight: this.data.windowHeight - swiperHeight - 130

            })
            this.weeklist();
            this.selectDateList();
            //console.log(this.data.calendar)
        }
    },
    // 点击切换月份，生成本月视图以及临近两个月的视图
    generateThreeMonths(year, month) {
        let {
            swiperIndex,
            swiperMap,
            calendar
        } = this.data, thisKey = swiperMap[swiperIndex], lastKey = swiperMap[swiperIndex - 1 === -1 ? 3 : swiperIndex - 1], nextKey = swiperMap[swiperIndex + 1 === 4 ? 0 : swiperIndex + 1], time = this.countMonth(year, month)
        delete calendar[lastKey]
        calendar[lastKey] = this.generateAllDays(time.lastMonth.year, time.lastMonth.month)
        delete calendar[thisKey]
        calendar[thisKey] = this.generateAllDays(time.thisMonth.year, time.thisMonth.month)
        delete calendar[nextKey]
        calendar[nextKey] = this.generateAllDays(time.nextMonth.year, time.nextMonth.month);
        var weekListPush = [];
        var list = [];
        for (var i = 0; i < calendar[thisKey].length; i++) {
            if (parseInt((i + 1) % 7) == 0) {
                list.push(calendar[thisKey][i]);
                weekListPush.push(list);
                list = [];
            } else {
                list.push(calendar[thisKey][i]);
            }
        }
        calendar.weeklist = weekListPush;
        if (this.data.caldenlarWeek) {
            var swiperHeight = 45;
        } else {
            var swiperHeight = (((calendar[thisKey].length) / 7) * 50) - 5
        }
        this.setData({
            swiperHeight: swiperHeight,
            swiperScheduleHeight: this.data.windowHeight - swiperHeight - 130
        })
        return calendar
    },
    // 判断周轮播是第几个index
    swiperWeekIndex: function(scroll) {
        var that = this
        var calendar = this.data.calendar.weeklist;
        var weekIndex;
        for (var i = 0; i < calendar.length; i++) {
            for (var j = 0; j < calendar[i].length; j++) {
                var value = this.data.year + '-' + this.data.month + '-' + this.data.day;
                if (scroll == 1) {
                    if (calendar[i][j].date == that.data.selectDate) {
                        weekIndex = parseInt((i + 1) % 7) - 1
                    }
                } else {
                    if (value == calendar[i][j].date) {
                        weekIndex = parseInt((i + 1) % 7) - 1
                    }
                }
            }
        }
        // console.log(weekIndex);
        that.setData({
            swiperWeekIndex: weekIndex
        })
    },
    // 生成当前月的周数据
    weeklist: function() {
        var calendar = this.data.calendar;
        var weeklist = calendar[this.data.swiperMap[this.data.swiperIndex]];
        var weekListPush = [];
        var list = [];
        for (var i = 0; i < weeklist.length; i++) {
            if (parseInt((i + 1) % 7) == 0) {
                list.push(weeklist[i]);
                weekListPush.push(list);
                list = [];
            } else {
                list.push(weeklist[i]);
            }
        }
        calendar.weeklist = weekListPush;
        this.setData({
            calendar
        })
        //this.selectDateList();
        // console.log(this.data.calendar)
    },
    bindDayTap(e) {
        var that = this;
        that.setData({
            statusState: false,
            bindScrollState: false
        })
        if (e.currentTarget.dataset.type != 1) {
            let {
                month,
                year
            } = this.data, time = this.countMonth(year, month), tapMon = e.currentTarget.dataset.month, day = e.currentTarget.dataset.day
            if (tapMon == time.lastMonth.month) {
                this.changeDate(time.lastMonth.year, time.lastMonth.month)
            } else if (tapMon == time.nextMonth.month) {
                this.changeDate(time.nextMonth.year, time.nextMonth.month)
            } else {
                this.setData({
                    day
                })
            }
        }
        let beSelectDate = e.currentTarget.dataset.date;
        that.setData({
            beSelectDate,
            selectDate: beSelectDate,
            swiperScheduleIndex: 'date' + beSelectDate,
            showCaldenlar: false,
        })
        if (that.data.scheduleList.length > 0) {
            var beginDate = that.data.scrollDate.begin.replace(/-/g, '')
            var endDate = that.data.scrollDate.end.replace(/-/g, '')
            beSelectDate = beSelectDate.replace(/-/g, '')
            if (beSelectDate < beginDate || beSelectDate > endDate) {
                that.scheduleList();
            } else {
                that.setData({
                    swiperScheduleIndex: 'date' + beSelectDate
                })
            }
        } else {
            that.scheduleList();
            that.setData({
                swiperScheduleIndex: 'date' + beSelectDate,
            })
        }
        that.selectDateList()
    },
    bindDateChange(e) {
        var that = this
        dd.datePicker({
            format: 'yyyy-MM',
            currentDate: that.data.selectDate,
            success: (res) => {
                that.setData({
                    statusState: false
                })
                if (res.date === that.data.date) {
                    return
                }
                const month = res.date.slice(-2),
                    year = res.date.slice(0, 4)

                that.changeDate(year, month);
                that.selectDateList();
            },
        });
    },
    prevMonth(e, yearValue, monthValue) {
        let {
            year,
            month
        } = this.data, time = this.countMonth(year, month)
        if (e == 1) {
            this.changeDate(yearValue, monthValue);
        } else {
            this.changeDate(time.lastMonth.year, time.lastMonth.month);
        }
        this.selectDateList();
    },
    nextMonth(e, yearValue, monthValue) {
        let {
            year,
            month
        } = this.data, time = this.countMonth(year, month)
        if (e == 1) {
            this.changeDate(yearValue, monthValue);
        } else {
            this.changeDate(time.lastMonth.year, time.lastMonth.month);
        }
        this.selectDateList();
    },
    // 直接改变日期
    changeDate(year, month) {
        let {
            day,
            today
        } = this.data, calendar = this.generateThreeMonths(year, month), date = `${year}-${month}`
        date.indexOf(today) === -1 ?
            day = '01' :
            day = today.slice(-2)
        // console.log(calendar)
        this.setData({
            calendar,
            day,
            date,
            month,
            year,
        })
    },
    // 月份处理
    countMonth(year, month) {
        let lastMonth = {
            month: this.formatMonth(parseInt(month) - 1)
        },
            thisMonth = {
                year,
                month,
                num: this.getNumOfDays(year, month)
            },
            nextMonth = {
                month: this.formatMonth(parseInt(month) + 1)
            }

        lastMonth.year = parseInt(month) === 1 && parseInt(lastMonth.month) === 12 ?
            `${parseInt(year) - 1}` :
            year + ''
        lastMonth.num = this.getNumOfDays(lastMonth.year, lastMonth.month)
        nextMonth.year = parseInt(month) === 12 && parseInt(nextMonth.month) === 1 ?
            `${parseInt(year) + 1}` :
            year + ''
        nextMonth.num = this.getNumOfDays(nextMonth.year, nextMonth.month)
        return {
            lastMonth,
            thisMonth,
            nextMonth
        }
    },
    currentMonthDays(year, month) {
        const numOfDays = this.getNumOfDays(year, month)
        return this.generateDays(year, month, numOfDays)
    },
    // 生成上个月应显示的天
    lastMonthDays(year, month) {
        const lastMonth = this.formatMonth(parseInt(month) - 1),
            lastMonthYear = parseInt(month) === 1 && parseInt(lastMonth) === 12 ?
                `${parseInt(year) - 1}` :
                year,
            lastNum = this.getNumOfDays(lastMonthYear, lastMonth) //上月天数
        let startWeek = this.getWeekOfDate(year, month - 1, 1) //本月1号是周几
            ,
            days = []
        if (startWeek == 7) {
            return days
        }

        const startDay = lastNum - startWeek

        return this.generateDays(lastMonthYear, lastMonth, lastNum, {
            startNum: startDay,
            notCurrent: true
        })
    },
    // 生成下个月应显示天
    nextMonthDays(year, month) {
        const nextMonth = this.formatMonth(parseInt(month) + 1),
            nextMonthYear = parseInt(month) === 12 && parseInt(nextMonth) === 1 ?
                `${parseInt(year) + 1}` :
                year,
            nextNum = this.getNumOfDays(nextMonthYear, nextMonth) //下月天数
        let endWeek = this.getWeekOfDate(year, month) //本月最后一天是周几
            ,
            days = [],
            daysNum = 0
        if (endWeek == 6) {
            return days
        } else if (endWeek == 7) {
            daysNum = 6
        } else {
            daysNum = 6 - endWeek
        }
        return this.generateDays(nextMonthYear, nextMonth, daysNum, {
            startNum: 1,
            notCurrent: true
        })
    },
    // 生成一个月的日历
    generateAllDays(year, month) {
        let lastMonth = this.lastMonthDays(year, month),
            thisMonth = this.currentMonthDays(year, month),
            nextMonth = this.nextMonthDays(year, month),
            days = [].concat(lastMonth, thisMonth, nextMonth)
        return days
    },
    // 生成日详情
    generateDays(year, month, daysNum, option = {
        startNum: 1,
        notCurrent: false
    }) {
        const weekMap = ['一', '二', '三', '四', '五', '六', '日']
        let days = []
        for (let i = option.startNum; i <= daysNum; i++) {
            let week = weekMap[new Date(year, month - 1, i).getUTCDay()]
            let day = this.formatDay(i)
            days.push({
                date: `${year}-${month}-${day}`,
                event: false,
                day,
                week,
                month,
                year
            })
        }
        return days
    },
    /**
     * 
     * 获取指定月第n天是周几		|
     * 9月第1天： 2017, 08, 1 |
     * 9月第31天：2017, 09, 0 
     * @param {any} year 
     * @param {any} month 
     * @param {number} [day=0] 0为最后一天，1为第一天
     * @returns number 周 1-7, 
     */
    getWeekOfDate(year, month, day = 0) {
        let dateOfMonth = new Date(year, month, 0).getUTCDay() + 1;
        dateOfMonth == 7 ? dateOfMonth = 0 : '';
        return dateOfMonth;
    },
    /**
     * 
     * 获取本月天数
     * @param {number} year 
     * @param {number} month 
     * @param {number} [day=0] 0为本月0最后一天的
     * @returns number 1-31
     */
    getNumOfDays(year, month, day = 0) {
        return new Date(year, month, day).getDate()
    },
    /**
     * 
     * 月份处理
     * @param {number} month 
     * @returns format month MM 1-12
     */
    formatMonth(month) {
        let monthStr = ''
        if (month > 12 || month < 1) {
            monthStr = Math.abs(month - 12) + ''
        } else {
            monthStr = month + ''
        }
        monthStr = `${monthStr.length > 1 ? '' : '0'}${monthStr}`
        return monthStr
    },
    formatDay(day) {
        return `${(day + '').length > 1 ? '' : '0'}${day}`
    },
    drawStart2: function(e) {
        var touch = e.touches[0];
        this.setData({
            touchData: touch,
            statusState: false
        })
    },
    drawMove2: function(e) {
        var touch = e.touches[0]
        var item = this.data.data[e.currentTarget.dataset.index]
        var disX = this.data.startX - touch.clientX
    },
    drawEnd2: function(e) {
        var touch = e.changedTouches[0];
        if (touch.clientY - this.data.touchData.clientY > 40) { //下滑
            // console.log('下滑')
            this.setData({
                caldenlarWeek: false,
                swiperHeight: (((this.data.calendar[this.data.swiperMap[this.data.swiperIndex]].length) / 7) * 50) - 5,
            })
            this.setData({
                swiperScheduleHeight: this.data.windowHeight - swiperHeight - 130
            })
        } else if (touch.clientY - this.data.touchData.clientY < -40) { //上滑
            // console.log('上滑');
            this.setData({
                caldenlarWeek: true,
                swiperHeight: 45,
                swiperScheduleHeight: this.data.windowHeight - 45 - 130
            })
            this.swiperWeekIndex();
        }
    },
    scheduleList: function(type, state) {
        var that = this;
        var date = that.data.selectDate;
        var sendData = ''
        var callBack = {
            success: function(e) {
                setTimeout(function() {
                    dd.hideLoading();
                }, 1000)
                if (JSON.stringify(e.data.res_data) == "{}") {
                    utils.showToast('没有更多日程了', 1000)
                }
                if (JSON.stringify(e.data.res_data) != "{}" && e.data.status == '0000') {
                    var data = e.data.res_data
                    var list = []
                    var height = 0
                    if (type == 1 && state == 2 && that.data.scheduleList.length > 0) {
                        list = that.data.scheduleList
                        height = that.data.scheduleList[that.data.scheduleList.length - 1].height
                    }
                    for (let key in data) {
                        for (var i = 0; i < data[key].length; i++) {
                            if (data[key][i].mroomAddress != null) {
                                height += 138
                            } else {
                                height += 115
                            }
                        }
                        var dataList = []
                        for (var i = 0; i < data[key].length; i++) {
                            dataList.push(data[key][i])
                        }
                        list.push({
                            height: height,
                            initdate: key,
                            date: key.replace(/-/g, ''),
                            list: dataList
                        })
                    }
                    if (type == 1 && state == 1 && that.data.scheduleList.length > 0) {
                        for (var i = 0; i < that.data.scheduleList.length; i++) {
                            height += that.data.scheduleList[i].height
                            that.data.scheduleList[i].height = height
                            list.push(that.data.scheduleList[i])
                        }
                    }
                    that.setData({
                        scheduleList: list
                    })
                } else if (e.data.status == '0000') {
                    if (type != 1) {
                        that.setData({
                            scheduleList: []
                        })
                    }
                } else {
                    utils.showToast(e.data.message, 1000)
                }
                if (type != 1) {
                    that.setData({
                        scrollDate: {
                            begin: that.data.selectDate,
                            end: that.haveSomeMinutesTime(that.data.selectDate, +43200)
                        }
                    })
                } else {
                    var begin = that.data.scrollDate.begin
                    var end = that.data.scrollDate.end
                    if (state == 1) {
                        begin = that.haveSomeMinutesTime(begin, -44640)
                    } else {
                        end = that.haveSomeMinutesTime(end, +43200)
                    }
                    that.setData({
                        scrollDate: {
                            begin: begin,
                            end: end
                        }
                    })
                }
                dd.stopPullDownRefresh() //停止下拉刷新
            },
            fail: function(e) {
                setTimeout(function() {
                    dd.hideLoading();
                }, 1000)
                utils.showToast(e.errMsg, 1000)
                dd.stopPullDownRefresh() //停止下拉刷新
            }
        }
        if (type != 1) {
            var url = '/conference/scheduleList/?serchDate=' + that.data.selectDate + '&status=' + that.data.status;
        } else {
            if (state == 1) {
                var url = '/conference/scheduleList/?serchDate=' + that.haveSomeMinutesTime(that.data.scrollDate.begin, -44640) + '&status=' + that.data.status;
            } else {
                var url = '/conference/scheduleList/?serchDate=' + that.haveSomeMinutesTime(that.data.scrollDate.end, +1440) + '&status=' + that.data.status;
            }
        }
        utils.ajax(utils.setURL(url), sendData, callBack, 'GET');
    },
    scheduleDetail: function(e) {
        this.setData({
            statusState: false
        })
        dd.navigateTo({
            url: 'scheduleDetail/scheduleDetail?tabType=0&id=' + e.currentTarget.dataset.id,
        })
    },
    selectDateList: function() {
        var that = this;
        var swiperIndex = that.data.swiperIndex;
        var swiperMap = that.data.swiperMap;
        var dateList = that.data.calendar[swiperMap[swiperIndex]];
        var weekList = that.data.calendar['weeklist'];
        var beginDate = dateList[0].date;
        var endDate = dateList[dateList.length - 1].date;
        var sendData = {}
        var callBack = {
            success: function(e) {
                var res_data = e.data.res_data;
                for (var j = 0; j < dateList.length; j++) {
                    dateList[j].state = false;
                }
                for (var j = 0; j < weekList.length; j++) {
                    for (var f = 0; f < weekList[j].length; f++) {
                        weekList[j][f].state = false;
                    }
                }
                for (var i = 0; i < res_data.length; i++) {
                    for (var j = 0; j < dateList.length; j++) {
                        if (dateList.date == res_data[i] || dateList[j].state) {
                            dateList[j].state = true;
                        } else {
                            dateList[j].state = false;
                        }
                    }
                    for (var j = 0; j < weekList.length; j++) {
                        for (var f = 0; f < weekList[j].length; f++) {
                            if (weekList[j][f].date == res_data[i] || weekList[j][f].state) {
                                weekList[j][f].state = true;
                            } else {
                                weekList[j][f].state = false;
                            }
                        }
                    }
                }
                that.data.calendar[swiperMap[swiperIndex]] = dateList;
                that.data.calendar['weeklist'] = weekList;
                that.setData({
                    calendar: that.data.calendar
                })
            },
            fail: function(e) {
                utils.showToast(e.errMsg, 1000);
            }
        }
        var url = '/conference/lable/' + beginDate + '/' + endDate + '/' + that.data.status;
        // var url = '/conference/lable/' + beginDate + '/' + endDate;
        utils.ajax(utils.setURL(url), sendData, callBack, 'GET');
    },
    alertClick: function() {
        this.setData({
            alertState: true
        })
    },
    serviceClick: function(e) {
        if (e.currentTarget.dataset.type == 1) {
            dd.setStorageSync({ key: 'orderDataList', data: '' })
            dd.setStorageSync({ key: 'stencilId', data: '' });
            dd.setStorageSync({ key: 'meetingAddressList', data: [] });
            dd.setStorageSync({ key: 'selectPeopleList', data: [] });
            dd.setStorageSync({ key: 'hostPeopleList', data: [] });
            dd.setStorageSync({ key: 'summaryPeopleList', data: [] });
            dd.setStorageSync({ key: 'addExternalUserInfoList', data: [] });
            dd.setStorageSync({ key: 'addMeetingAttachmentList', data: [] });
            dd.setStorageSync({ key: 'addMeetingProcessList', data: [] });
            var date = this.data.selectDate;
            dd.navigateTo({
                url: '../advance/confirmOrder/confirmOrder?webType=1&date=' + date,
            })
        } else {
            dd.navigateTo({
                url: 'serviceAdd/serviceAdd',
            })
        }
        this.setData({
            alertState: false
        })
    },
    calendarTransform: function(e) {
        this.setData({
            statusState: false
        })
        if (e.currentTarget.dataset.state) { //下滑
            // console.log('下滑')
            this.setData({
                caldenlarWeek: false,
                swiperHeight: (((this.data.calendar[this.data.swiperMap[this.data.swiperIndex]].length) / 7) * 50) - 5,
            })
            this.setData({
                swiperScheduleHeight: this.data.windowHeight - this.data.swiperHeight - 130
            })
        } else { //上滑
            this.setData({
                caldenlarWeek: true,
                swiperHeight: 45,
                swiperScheduleHeight: this.data.windowHeight - 45 - 130
            })
            // this.swiperWeekIndex();
        }
    },
    statusView: function() {
        this.setData({
            statusState: !this.data.statusState
        })
    },
    statusClick: function(e) {
        var that = this;
        that.setData({
            status: e.currentTarget.dataset.type,
            statusState: false
        })
        that.scheduleList();
        that.selectDateList();
        that.weeklist();
    },
    maskBgHidden: function() {
        this.setData({
            alertState: false
        })
    },
    scanCode: function(e) {
        var that = this;
        dd.scan({
            success(res) {
                var resultStr = res.result;
                if (resultStr != '' && resultStr != null) {
                    var qrCodeDict = JSON.parse(resultStr);
                    if (qrCodeDict.type == '0101') {
                        // console.log(qrCodeDict.data.id);
                        var idNumber = qrCodeDict.data.id;
                        if (idNumber != '' && idNumber != null) {
                            that.sign(idNumber, qrCodeDict.data.mroomId);
                        }
                    } else if (qrCodeDict.type == '0102') {
                        var idNumber = qrCodeDict.data.id;
                        if (idNumber != '' && idNumber != null) {
                            dd.navigateTo({
                                url: '../advance/searchResult/searchResult?webType=1&mroomName=' + '&date=' + that.data.selectDate + '&fromType=1' + '&type=1' + '&bookId=' + "&mroomId=" + idNumber,
                            })
                        }
                    } else if (qrCodeDict.type == '0103') {
                        that.waterCode(qrCodeDict.data.bookId, qrCodeDict.data.mroomId)
                    } else if (qrCodeDict.type == '0104') {
                        that.openDoor(qrCodeDict.data.gateWayAddress, qrCodeDict.data.lockAddress, qrCodeDict.data.doorId, qrCodeDict.data.lockType)
                    } else if (qrCodeDict.type == '0105') {
                        that.userUpload(qrCodeDict.data.mac, qrCodeDict.data.mroomId)
                    } else {
                        utils.showToast(resultStr, 1000)
                    }
                }
            }
        })
    },
    userUpload: function(mac, mroomId) {
        var that = this;
        var sendData = {
            mac: mac,
            mRoomId: mroomId.toString()
        }
        var callBack = {
            success: function(e) {
                if (e.data.status == '0000') {
                    utils.showToast('扫码成功', 2000);
                } else {
                    utils.showToast(e.data.message, 1000);
                }
            },
            fail: function(e) {
                utils.showToast(e.errMsg, 1000);
            }
        }
        var url = '/record/userAuth';
        utils.ajax(utils.setURL(url), sendData, callBack, 'POST');
    },
    waterCode: function(bookId, mroomId) {
        var that = this;
        that.setData({
            scanFresh: false
        })
        var sendData = {}
        var callBack = {
            success: function(e) {
                if (e.data.status == '0000') {
                    utils.showToast('会议开始成功', 1000);
                } else {
                    utils.showToast(e.data.message, 1000);
                }
            },
            fail: function(e) {
                utils.showToast(e.errMsg, 1000);
            }
        }
        var url = '/watery/qrcode/' + bookId + '/' + mroomId;
        utils.ajax(utils.setURL(url), sendData, callBack, 'GET');
    }, //签到
    sign: function(bookID, mroomId) {
        var that = this;
        var mroomId = mroomId;
        if (mroomId == undefined || mroomId == null || mroomId == '') {
            mroomId = ''
        }
        var sendData = {};
        var callBack = {
            success: function(e) {
                if (e.data.status == '0000') { //签到成功
                    dd.confirm({
                        title: '签到成功',
                        content: '签到成功，是否查看签到记录？',
                        showCancel: true,
                        cancelButtonText: '取消',
                        cancelColor: '#333333',
                        confirmButtonText: '确认',
                        confirmColor: '#1874EC',
                        success(res) {
                            if (res.confirm) {
                                dd.navigateTo({
                                    url: 'scanCode/scanCode?id=' + bookID,
                                })
                            }
                        }
                    })

                } else if (e.data.status == '5028') { //已签到
                    dd.confirm({
                        title: '已签到',
                        content: '您之前已签到过了，是否查看签到记录？',
                        showCancel: true,
                        cancelButtonText: '取消',
                        cancelColor: '#333333',
                        confirmButtonText: '确认',
                        confirmColor: '#1874EC',
                        success(res) {
                            if (res.confirm) {
                                dd.navigateTo({
                                    url: 'scanCode/scanCode?id=' + bookID,
                                })
                            }
                        }
                    })
                } else if (e.data.status == '5027') { //不是会议参与人
                    dd.confirm({
                        title: '签到失败',
                        content: '您不是此次会议的参与人员，请确认二维码是否正确',
                        showCancel: false,
                        confirmButtonText: '确认',
                        confirmColor: '#1874EC',
                    })
                } else {
                    utils.showToast(e.data.message, 1000);
                }
            },
            fail: function(e) {
                utils.showToast(e.errMsg, 1000);
            }
        }
        utils.ajax(utils.setURL('/signin/signins?bookId=' + bookID + '&mroomId=' + mroomId), sendData, callBack, 'PUT');
    },
    openDoor: function(gateWayAddress, lockAddress, lockType) {
        dd.showLoading({
            title: '正在开锁中',
        })
        var that = this;
        var sendData = {
            gateWayAddress: gateWayAddress,
            lockAddress: lockAddress
        }
        var callBack = {
            success: function(e) {
                dd.hideLoading();
                if (e.data.status == '0000') {
                    utils.showToast('开锁成功', 2000)
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
        var url = '/smrDoorLockPermissions/unlocking?gateWayAddress=' + gateWayAddress + '&lockAddress=' + lockAddress + '&doorId=' + doorId + '&doorLockModel=' + lockType;
        utils.ajax(utils.setURL(url), sendData, callBack, 'GET');
    },
    meetingConfig: function(e) {
        var that = this;
        var sendData = {}
        var callBack = {
            success: function(e) {
                if (e.data.status == '0000') {
                    app.globalData.meetingType = e.data.res_data.timeDimension
                }
            },
            fail: function(e) {
            }
        }
        utils.ajax(utils.setURL('/smr/configuration/findMeetingConfiguration'), sendData, callBack, "GET");
    },
    scheduleScroll: function(e) {
        var that = this;
        var value = e.detail.scrollTop;
        var array = that.data.MikeBox;
        array.push(value);
        var len = array.length;
        len > 5 ? array.splice(0, len - 4) : array;
        var selectDate = that.data.selectDate
        setTimeout(function() {
            // console.log(that.data.MikeBox)
            for (var i = 0; i < that.data.scheduleList.length; i++) {
                if (i > 0) {
                    if (that.data.MikeBox[that.data.MikeBox.length - 1] >= that.data.scheduleList[i - 1].height) {
                        selectDate = that.data.scheduleList[i].initdate
                    }
                }
                if (that.data.MikeBox[that.data.MikeBox.length - 1] <= 115) {
                    selectDate = that.data.scheduleList[0].initdate
                }
            }
            setTimeout(function() {
                if (selectDate != that.data.selectDate) {
                    var selectDateValue = selectDate.substring(0, 7).replace(/-/g, "")
                    var dateValue = that.data.year + '' + that.data.month
                    that.setData({
                        selectDate: selectDate
                    })
                    if (selectDateValue > dateValue) {
                        that.nextMonth(1, selectDate.substring(0, 4), selectDate.substring(5, 7))
                    }
                    if (dateValue > selectDateValue) {
                        that.prevMonth(1, selectDate.substring(0, 4), selectDate.substring(5, 7))
                    }
                    // console.log(that.data.selectDate)
                    that.swiperWeekIndex(1)
                }
            }, 100)
        }, 100)
    },
    bindscrollTop: function(e) {
        var that = this
        if (that.data.bindScrollState) {
            setTimeout(function() {
                dd.showLoading({
                    title: '加载中...',
                })
                that.scheduleList(1, 1)
                that.setData({
                    bindScrollState: true
                })
            }, 1500)
        }
    },
    bindscrollBottom: function(e) {
        var that = this
        that.setData({
            bindScrollState: true
        })
        setTimeout(function() {
            dd.showLoading({
                title: '加载中...',
            })
            that.scheduleList(1, 2)
        }, 1000)
    },
    haveSomeMinutesTime: function(date, n) {
        if (n == null) {
            n = 0;
        }
        // 时间
        var newDate = new Date(date)
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
        // console.log(time)
        return time;
    }
})