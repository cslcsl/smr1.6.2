const app = getApp()
const utils = require('../../../utils/util.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        webType: '',
        list: [],
		selectList: [],
		selectTypeList: [],
		titleName: '日期时间相符订单',
        mutipleSelect: true,
		orderSelectTime: '',
		agendaState: false,
		selectType: 1,
		meetingAddressList: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
		this.setData({
			orderSelectTime: dd.getStorageSync({key:'orderSelectTime'}).data,
			webType: options.webType,
			bookId: options.bookId
		})
		if (dd.getStorageSync({key:'meetingAddressList'}).data != undefined && dd.getStorageSync({key:'meetingAddressList'}).data != '' || dd.getStorageSync({key:'meetingAddressList'}).data.length == 0) {
			this.data.meetingAddressList = dd.getStorageSync({key:'meetingAddressList'}).data;
		}
		this.dataList();
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

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    },
    dataList: function() {
        var that = this;
        var sendData = {
			rentStarTime: that.data.orderSelectTime.date + ' ' + that.data.orderSelectTime.begin+":00",
			rentEndTime: that.data.orderSelectTime.date + ' ' + that.data.orderSelectTime.end + ":00"
        }
        var callBack = {
            success: function(e) {
                if (e.data.status == '0000') {
					for (var i = 0;i< e.data.res_data.sameDay.length; i++) {
						for (var j = 0;j < that.data.meetingAddressList.length;j++) {
							if (that.data.meetingAddressList[j].type == 1 && e.data.res_data.sameDay[i].orderId == that.data.meetingAddressList[j].orderId ||e.data.res_data.sameDay[i].state) {
								e.data.res_data.sameDay[i].state = true
							} else {
								e.data.res_data.sameDay[i].state = false
							}
						}
					}
					for (var i = 0; i < e.data.res_data.sameTimes.length; i++) {
						for (var j = 0; j < that.data.meetingAddressList.length; j++) {
							if (that.data.meetingAddressList[j].type == 1 && e.data.res_data.sameTimes[i].orderId == that.data.meetingAddressList[j].orderId || e.data.res_data.sameTimes[i].state) {
								e.data.res_data.sameTimes[i].state = true
							} else {
								e.data.res_data.sameTimes[i].state = false
							}
						}
					}
					for (var i = 0; i < e.data.res_data.sameTimes.length; i++) {
						var state = true
						for (var j = 0; j < e.data.res_data.sameDay.length;j++) {
							if (e.data.res_data.sameDay[j].orderId == e.data.res_data.sameTimes[i].orderId) {
								state = false
							}
						}
						if (state) {
							e.data.res_data.sameDay.push(e.data.res_data.sameTimes[i])
						}
					}
                    that.setData({
						list: e.data.res_data
					})
					that.dataSelect()
                } else {
					utils.showToast(e.data.message,1000)
                }
            },
            fail: function(e) {
				utils.showToast(e.errMsg, 1000)
            }
        }
		var url = '/order/resertionDetails';
        utils.ajax(utils.setURL(url), sendData, callBack, 'POST');
	},
	userListClick: function (e) {
		var that = this;
		var state = e.currentTarget.dataset.state;
		var index = e.currentTarget.dataset.index;
		var selectList = that.data.selectList;
		if (!state || state == undefined) {
			selectList.push({
				orderId: that.data.selectTypeList[index].orderId,
				mroomName: that.data.selectTypeList[index].mroomName,
				mroomAddress: that.data.selectTypeList[index].mroomAddress,
				bookStartTime: that.data.orderSelectTime.date + ' ' + that.data.selectTypeList[index].rentStartTime+':00',
				bookEndTime: that.data.orderSelectTime.date + ' ' + that.data.selectTypeList[index].rentEndTime+':00',
				mroomId: that.data.selectTypeList[index].mroomId,
				type: 1
			})
		} else {
			var list = [];
			for (var i = 0; i < selectList.length; i++) {
				if (selectList[i].orderId != that.data.selectTypeList[index].orderId) {
					list.push(selectList[i]);
				}
			}
			selectList = list;
		}
		that.data.selectTypeList[index].state = !state;
		that.setData({
			selectTypeList: that.data.selectTypeList,
			selectList: selectList
		})
	},
	orderSelect: function(e){
		var that = this
		var type = e.currentTarget.dataset.type
		if (type == 1) {
			dd.navigateBack({
				delta:1
			})
		} else {
			if (that.data.webType!=3) {
				var meetingAddressList = that.data.meetingAddressList
				for (var i=0;i<that.data.selectList.length;i++) {
					meetingAddressList.push(that.data.selectList[i])
				}
				dd.setStorageSync({key:'meetingAddressList', data:meetingAddressList})
				dd.navigateBack({
					delta:2
				})
			} else {
				that.contact()
			}
		}
	},
	contact: function () {
		var that = this;
		var list = []
		for (var i=0;i<that.data.selectList.length;i++) {
			if (that.data.selectList[i].type == 1) {
				list.push(that.data.selectList[i].orderId)
			}
		}
		if (list.length==0) {
			utils.showToast('选择的订单信息不能为空',1000)
			return;
		}
		var sendData = {
			bookId: that.data.bookId,
			orderIds: list
		}
		var callBack = {
			success: function (e) {
				if (e.data.status == '0000') {
					dd.navigateBack({
						delta: 2
					})
				} else {
					utils.showToast(e.data.message, 1000);
				}
			},
			fail: function (e) {
				utils.showToast(e.errMsg, 1000);
			}
		}
		var url = '/order/relevancebooking';
		utils.ajax(utils.setURL(url), sendData, callBack, 'PUT');
	},
	alertBlock: function (){
		this.setData({
			agendaState: true
		})
	},
	meetingOperation: function (e) {
		var that = this
		var type = e.currentTarget.dataset.type
		if (type == 3) {
			that.setData({
				agendaState:false
			})
		} else {
			if (type == 1) {
				var titleName ='日期时间相符订单'
				for (var i = 0; i < that.data.list.sameTimes.length; i++) {
					for (var j = 0; j < that.data.selectList.length; j++) {
						if (that.data.list.sameTimes[i].orderId == that.data.selectList[j].orderId) {
							that.data.list.sameTimes[i].state = false
						}
					}
				}
			} else {
				var titleName = '相同日期订单'
				for (var i = 0; i < that.data.list.sameDay.length; i++) {
					for (var j = 0; j < that.data.selectList.length; j++) {
						if (that.data.list.sameDay[i].orderId == that.data.selectList[j].orderId) {
							that.data.list.sameDay[i].state = false
						}
					}
				}
			}
			that.setData({
				selectType: type,
				agendaState: false,
				titleName: titleName,
				list: that.data.list
			})
			that.dataSelect()
		}
	},
	dataSelect: function (){
		var list = []
		var selectList = []
		var that = this 
		if (that.data.selectType == 1) {
			list = that.data.list.sameTimes
		} else {
			list = that.data.list.sameDay
		}
		for (var i = 0; i<that.data.selectList.length;i++) {
			for (var j = 0; j<list.length;j++) {
				if (that.data.selectList[i].orderId == list[j].orderId) {
					selectList.push(that.data.selectList[i])
				}
			}
		}
		that.setData({
			selectTypeList: list,
			selectList: [],
		})
	}
})