const app = getApp()
const utils = require('../../utils/util.js')
var bmap = require('../../utils/bmap-dd.min.js');
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
		scrollId: '',
		timeList: [],
		advanceList: [{
			date: '2018-10-24',
			list: ['22:00-22:30', '22:30-23:00']
		}],
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
		day: '',
		year: '',
		month: '',
		selectDate: '',
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
		scanFresh: true
	},
    /**
     * 生命周期函数--监听页面加载
     */
	onLoad: function (options) {
	},
	location: function () {
		var that = this;
		var BMap = new bmap.BMapWX({
			ak: 'fcc5dhiKZKsrcrLoqpdz6luRvoA5jc7e'
		});

		var fail = function (data) {
			that.getlocation();
		};
		var success = function (data) {
			wxMarkerData = data.wxMarkerData;
			that.setData({
				longitude: data.originalData.result.location.lng,
				latitude: data.originalData.result.location.lat,
				cityName: data.originalData.result.addressComponent.city
			});
			that.getlocation();
		}
		BMap.regeocoding({
			fail: fail,
			success: success,
			iconPath: '../../img/marker_red.png',
			iconTapPath: '../../img/marker_red.png'
		});
	},
	getlocation: function () {
		var that = this;
		var sendData = {
			cityName: that.data.cityName,
			position: that.data.longitude + ',' + that.data.latitude
		}
		var callBack = {
			success: function (e) {
				if (e.data.code == 0) {
					app.globalData.projectDetail = {
						id: e.data.res_data.projectId,
						name: e.data.res_data.projectName
					}
					that.setData({
						projectDetail: app.globalData.projectDetail
					})
					that.roomRequest()
				} else {
					utils.showToast(e.data.res_message,1000);
				}
			},
			fail: function (e) {
				utils.showToast(e.errMsg,1000);
			}
		}
		utils.ajax(utils.setURL('/meet/getlocation'), sendData, callBack);
	},
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
	onReady: function () {

	},

    /**
     * 生命周期函数--监听页面显示
     */
	onShow: function () {
		if (app.globalData.loginInfo != null && app.globalData.loginInfo != '') {
			this.setData({
				loginState: true,
				loginInfo: app.globalData.loginInfo
			})
			utils.getNewInboxNumber();
		} else {
			this.setData({
				loginState: false
			})
		}
		const date = new Date(),
			month = this.formatMonth(date.getMonth() + 1),
			year = date.getFullYear(),
			day = this.formatDay(date.getDate()),
			today = `${year}-${month}-${day}`
		let calendar = this.generateThreeMonths(year, month)
		this.setData({
			calendar,
			month,
			year,
			day,
			today,
			selectDate: today,
			beSelectDate: today,
			date: `${year}-${month}`
		})
		var that = this;
		dd.getSystemInfo({
			success: function (res) {
				that.setData({
					windowHeight: res.windowHeight
				});
			}
		});
		if (this.data.caldenlarWeek) {
			this.swiperWeekIndex();
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
			dataListState: false,
			currentFormat: this.haveSomeMinutesTime(hourType),
			viewType: dd.getStorageSync({key:'meetingType'}).data
		});
		if (this.data.scanFresh) {
			dd.showLoading({
				title: '加载中...',
			})
			this.roomRequest();
		} else {
			this.setData({
				scanFresh: true
			})
		}
	},
    /**
     * 生命周期函数--监听页面隐藏
     */
	onHide: function () {
		dd.setStorageSync({key:'meetingType', data:'0'});
	},

    /**
     * 生命周期函数--监听页面卸载
     */
	onUnload: function () {
		dd.setStorageSync({key:'meetingType', data:'0'});
	},

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
	onPullDownRefresh: function () {
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
			currentFormat: this.haveSomeMinutesTime(hourType),
		});
		this.roomRequest();
	},

    /**
     * 页面上拉触底事件的处理函数
     */
	onReachBottom: function () {

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
	onShareAppMessage: function () {
		return {
			imageUrl: '../../images/common/sharepic.png'
		}
	},
	roomRequest: function () {
		var that = this;
		// 请求数据中的加载效果
		if (that.data.page == 1) {
			that.setData({
				dataList: [],
				dataListState: false
			})
		}
		var currentTime = that.data.selectDate;
		var sendData = {
			searchStatus: 0,
			page: that.data.page,
			pageSize: that.data.pageSize,
			searchTime: currentTime,
		}
		var callBack = {
			success: function (e) {
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
				} else {
					utils.showToast(e.data.message, 1000)
				}
			},
			fail: function (e) {
				dd.stopPullDownRefresh() //停止下拉刷新
				utils.showToast(e.errMsg, 1000)
			}
		}
		utils.ajax(utils.setURL('/meetingroom/resertionDetails'), sendData, callBack);
	},
	advanceList: function (timeType, datalist) {
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
				list.push(timeBegin + '-' + timeEnd);
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
	confirmBtn: function (e) { //时间段点击效果
		var that = this;
		var selectTimeList = that.data.selectTimeList;
		var type = e.currentTarget.dataset.type;
		var index = e.currentTarget.dataset.index;
		var hourTotal = selectTimeList.hour * 60 + selectTimeList.min;
		if (hourTotal > that.data.dataList[index].maxDurtionMinute && that.data.dataList[index].maxDurtionMinute > 0) {
			utils.showToast('最大预订时长不能超过' + that.data.dataList[index].maxDurtionMinute + '分钟', 1000)
			return;
		}
		if (type == 2) { //只定会议室
			that.confirmMeeting(e.currentTarget.dataset.id, '', index)
		} else if (type == 3) {
			dd.setStorageSync({key:'stencilId', data:''});
			dd.setStorageSync({key:'selectPeopleList', data:[]});
			dd.setStorageSync({key:'hostPeopleList', data:[]});
			dd.setStorageSync({key:'summaryPeopleList', data:[]});
			dd.setStorageSync({key:'addExternalUserInfoList', data:[]});
			dd.setStorageSync({key:'addMeetingAttachmentList', data:[]});
			dd.setStorageSync({key:'addMeetingProcessList', data:[]});
			dd.setStorageSync({key:'orderDataList', data:''})
			that.confirmMeeting(e.currentTarget.dataset.id, 2, index)
		}
	},
	scaleListClick: function (e) { // 日期段点击效果
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
			this.setData({
				dataList: that.data.dataList,
				roomIndex: indexf
			})
			this.selectTimeList();
		}
		// }
	},
	selectTimeList: function () {
		var indexMin = -1;
		var indexMax = '';
		var allNum = 0;
		var listVal = [];
		var timeList = this.data.dataList[this.data.roomIndex].timeList;
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
		this.setData({
			selectTimeList: list
		})
	},
	timeList: function (advanceList, permitTimeStart, permitTimeEnd, permitDate, maxDurtionDay) {
		// advanceList: 已被预订 permitTimeStart:开始时间 permitTimeEnd结束时间 permitDate:开放日期 maxDurtionDay:最大天数
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
						if (advanceEndVal <= stationBeginVal || advanceEndVal > stationEndVal && stationEndVal!='2359') {
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
	haveSomeMinutesTime: function (n) {
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
		var time = year + '-' + month + '-' + day + '-' + h + '-' + m + '-' + s;
		return time;
	},
	getDates: function (days, todate) { //todate默认参数是当前日期，可以传入对应时间
		var dateArry = [];
		for (var i = 0; i < days; i++) {
			var dateObj = this.dateLater(todate, i);
			dateArry.push(dateObj)
		}
		return dateArry;
	},
	dateLater: function (dates, later) {
		let dateObj = {};
		let show_day = new Array('周日', '周一', '周二', '周三', '周四', '周五', '周六');
		let date = new Date(dates);
		date.setDate(date.getDate() + later);
		let day = date.getDay();
		dateObj.year = date.getFullYear();
		dateObj.month = ((date.getMonth() + 1) < 10 ? ("0" + (date.getMonth() + 1)) : date.getMonth() + 1);
		dateObj.day = (date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate());
		dateObj.week = show_day[day];
		return dateObj;
	},
	getCurrentMonthFirst: function () {
		var date = new Date();
		var todate = date.getFullYear() + "-" + ((date.getMonth() + 1) < 10 ? ("0" + (date.getMonth() + 1)) : date.getMonth() + 1) + "-" + (date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate());
		return todate;
	},
	cityList: function () {
		var that = this;
		dd.navigateTo({
			url: 'cityList/cityList',
		})
	},
	// 日历开始

	showCaldenlar() {
		this.setData({
			showCaldenlar: !this.data.showCaldenlar
		})
	},
	// 左右滑动
	swiperChange(e) {
		if (this.data.caldenlarWeek == false) {
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
				swiperHeight: swiperHeight
			})
			this.weeklist();
			this.selectDateList();
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
			swiperHeight: swiperHeight
		})
		return calendar
	},
	// 判断周轮播是第几个index
	swiperWeekIndex: function () {
		var calendar = this.data.calendar.weeklist;
		var weekIndex;
		for (var i = 0; i < calendar.length; i++) {
			for (var j = 0; j < calendar[i].length; j++) {
				var value = this.data.year + '-' + this.data.month + '-' + this.data.day;
				if (value == calendar[i][j].date) {
					weekIndex = parseInt((i + 1) % 7) - 1
				}
			}
		}
		this.setData({
			swiperWeekIndex: weekIndex
		})
	},
	// 生成当前月的周数据
	weeklist: function () {
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
	},
	bindDayTap(e) {
		var that=this;
		var bindDayTapDate = e.currentTarget.dataset.date;
		var currentFormat = (this.data.currentFormat).substring(0, 10);
		var oDate1 = new Date(bindDayTapDate);
		var oDate2 = new Date(currentFormat);
		if (oDate2.getTime() > oDate1.getTime()) {
			utils.showToast('选择日期不能小于当前日期', 1000);
			return;
		} else {
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
						day,
					})
				}
			}
			let beSelectDate = e.currentTarget.dataset.date;
			var selectDateBefore = that.data.selectDate
			that.setData({
				beSelectDate,
				showCaldenlar: false,
				page: 1,
				selectDate: beSelectDate
			})
			if (beSelectDate != selectDateBefore) {
				
				dd.showLoading({
					title: '加载中...',
				})
				that.roomRequest();
			}	
		}
	},
	bindDateChange(e) {
		if (e.detail.value === this.data.date) {
			return
		}
		const month = e.detail.value.slice(-2),
			year = e.detail.value.slice(0, 4)

		this.changeDate(year, month)
	},
	prevMonth(e) {
		let {
			year,
			month
		} = this.data, time = this.countMonth(year, month)
		this.changeDate(time.lastMonth.year, time.lastMonth.month);

	},
	nextMonth(e) {
		let {
			year,
			month
		} = this.data, time = this.countMonth(year, month)
		this.changeDate(time.nextMonth.year, time.nextMonth.month)

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
	drawStart2: function (e) {
		var touch = e.touches[0];
		this.setData({
			touchData: touch
		})
	},
	drawMove2: function (e) {
		var touch = e.touches[0]
		var item = this.data.data[e.currentTarget.dataset.index]
		var disX = this.data.startX - touch.clientX
	},
	drawEnd2: function (e) {
		var touch = e.changedTouches[0];
		if (touch.clientY - this.data.touchData.clientY > 40) { //下滑
			console.log('下滑')
			this.setData({
				caldenlarWeek: false,
				swiperHeight: (((this.data.calendar[this.data.swiperMap[this.data.swiperIndex]].length) / 7) * 50) - 5,
			})
		} else if (touch.clientY - this.data.touchData.clientY < -40) { //上滑
			console.log('上滑');
			this.setData({
				caldenlarWeek: true,
				swiperHeight: 45,
			})
			this.swiperWeekIndex();
		}
	},
	nameInputConfirm: function (e) {
		dd.navigateTo({
			url: 'advanceSearch/advanceSearch?webType=1&mroomName=&type=1&bookId=&fromType=1&mroomId=&bookId=&date=' + this.data.selectDate,
		})
	},
	webBreak: function (e) {
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
			url: e.currentTarget.dataset.url,
		})
	},
	conditionFilter: function () {
		var that = this;
		dd.setStorageSync({key:'deviedList', data:''})
		dd.setStorageSync({key:'searchList', data:''}) //搜索数据
		dd.setStorageSync({key:'searchDataList',data: ''})
		dd.navigateTo({
			url: 'conditionFilter/conditionFilter?mroomId=&bookId=&type=1&fromType=1&date=' + that.data.selectDate,
		})
	},
	confirmMeeting: function (meetingId, postType, index) {
		var that = this;
		var date = that.data.selectDate;
		var begintime = that.data.selectTimeList.begin;
		var endtime = that.data.selectTimeList.end;
		var begintimeVal = date + ' ' + begintime + ':00';
		if (endtime.split(':')[0] == 24) {
			var endtimeVal = date + ' 23:59:00';
		} else {
			var endtimeVal = date + ' ' + endtime + ':00';
		}
		var sendData = {
			endTime: endtimeVal,
			meetingId: meetingId,
			startTime: begintimeVal
		}
		if (postType == 2) {
			var meetingAddressList = [];
			meetingAddressList.push({
				orderId: '',
				mroomName: that.data.dataList[index].mroomName,
				mroomAddress: that.data.dataList[index].mroomAddress,
				bookStartTime: begintimeVal,
				bookEndTime: endtimeVal,
				mroomId: meetingId,
				type: 1
			})
			dd.setStorageSync({key:'meetingAddressList',data: meetingAddressList});
			dd.navigateTo({
				url: 'confirmOrder/confirmOrder?webType=2&date=' + date + '&begin=' + begintime + '&end=' + endtime
			})
		} else {
			var callBack = {
				success: function (e) {
					if (e.data.status == '0000') {
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
							url: 'advanceResult/advanceResult?type=2&id=' + e.data.res_data.orderId + '&begin=' + begintime + '&end=' + endtime + '&date=' + date,
						})

					} else {
						utils.showToast(e.data.message, 1000)
					}
				},
				fail: function (e) {
					utils.showToast(e.errMsg, 1000)
				}
			}
			utils.ajax(utils.setURL('/conference/add/mroomequipmentsReserve'), sendData, callBack);
		}
	},
	calendarTransform: function (e) {
		if (e.currentTarget.dataset.state) { //下滑
			// console.log('下滑')
			this.setData({
				caldenlarWeek: false,
				swiperHeight: (((this.data.calendar[this.data.swiperMap[this.data.swiperIndex]].length) / 7) * 50) - 5,
			})
		} else { //上滑
			this.setData({
				caldenlarWeek: true,
				swiperHeight: 45,
			})
			this.swiperWeekIndex();
		}
	},
	haveSomeMinutesTime: function (n) {
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
		var time = year + '-' + month + '-' + day + '-' + h + '-' + m + '-' + s;
		return time;
	},
	weekSelect: function (date, openDateWeek) {
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
	maxDurtionDay: function (date, maxDurtionDay) {
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
	scanCode: function (e) {
		var that = this;
		dd.scanCode({
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
								url: 'searchResult/searchResult?webType=1&mroomName=' + '&date=' + that.data.selectDate + '&fromType=1' + '&type=1' + '&bookId=' + "&mroomId=" + idNumber,
							})
						}
					} else if (qrCodeDict.type == '0103') {
						that.waterCode(qrCodeDict.data.bookId, qrCodeDict.data.mroomId)
					} else if (qrCodeDict.type == '0104') {
						that.openDoor(qrCodeDict.data.gateWayAddress, qrCodeDict.data.lockAddress, qrCodeDict.data.doorId, qrCodeDict.data.lockType)
					} else {
						utils.showToast(resultStr, 1000)
					}
				}
			}
		})
	},
	waterCode: function (bookId, mroomId) {
		var that = this;
		that.setData({
			scanFresh: false
		})
		var sendData = {}
		var callBack = {
			success: function (e) {
				if (e.data.status == '0000') {
					utils.showToast('会议开始成功', 1000);
				} else {
					utils.showToast(e.data.message, 1000);
				}
			},
			fail: function (e) {
				utils.showToast(e.errMsg, 1000);
			}
		}
		var url = '/watery/qrcode/' + bookId + '/' + mroomId;
		utils.ajax(utils.setURL(url), sendData, callBack, 'GET');
	}, //签到
	sign: function (bookID, mroomId) {
		var that = this;
		var mroomId = mroomId;
		if (mroomId == undefined || mroomId == null || mroomId == ''){
			mroomId = ''
		}
		var sendData = {};
		var callBack = {
			success: function (e) {
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
									url: '../schedule/scanCode/scanCode?id=' + bookID,
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
									url: '../schedule/scanCode/scanCode?id=' + bookID,
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
					utils.showToast(e.data.message,1000);
				}
			},
			fail: function (e) {
				utils.showToast(e.errMsg,1000);
			}
		}
		utils.ajax(utils.setURL('/signin/signins?bookId=' + bookID + '&mroomId=' + mroomId), sendData, callBack, 'PUT');
	}, openDoor: function (gateWayAddress, lockAddress, doorId, lockType) {
		dd.showLoading({
			title: '正在开锁中',
		})
		var that = this;
		var sendData = {
			gateWayAddress: gateWayAddress,
			lockAddress: lockAddress
		}
		var callBack = {
			success: function (e) {
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
			fail: function (e) {
				utils.showToast(e.errMsg, 1000)
				dd.hideLoading();
				that.setData({
					alertState: false
				})
			}
		}
		var url = '/smrDoorLockPermissions/unlocking?gateWayAddress=' + gateWayAddress + '&lockAddress=' + lockAddress + '&doorId=' + doorId + '&doorLockModel=' + lockType;
		utils.ajax(utils.setURL(url), sendData, callBack, 'GET');
	}
})