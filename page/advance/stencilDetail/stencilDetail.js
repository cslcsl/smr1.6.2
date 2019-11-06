//logs.js
const app = getApp()
const utils = require('../../../utils/util.js')
Page({
	data: {
		meetingTitle: '',
		pickerAlertIndex: 0,
		alertarray: ['15', '30'],
		meetingTypeIndex: 0,
		meetingTypearray: ['线下会议', '视频会议', '电话会议'],
		selectPeopleList: [],
		hostPeopleList: [],
		summaryPeopleList: [],
		meetingProcessList: [], //议程
		scanState: true,
		webType: 1,
		id: '',
		date: ''
	},

    /**
     * 生命周期函数--监听页面加载
     */
	onLoad: function (options) {
		//webType:1 新增 2：编辑
		this.setData({
			date: options.date,
			id: options.id,
			webType: options.webType
		})
		this.dataList();
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
		if (dd.getStorageSync({key:'selectPeopleList'}).data != undefined && dd.getStorageSync({key:'selectPeopleList'}).data != '' || dd.getStorageSync({key:'selectPeopleList'}).data.length == 0) { //参会人
			this.setData({
				selectPeopleList: dd.getStorageSync({key:'selectPeopleList'}).data
			})
		}
		if (dd.getStorageSync({key:'hostPeopleList'}).data != undefined && dd.getStorageSync({key:'hostPeopleList'}).data != '' || dd.getStorageSync({key:'hostPeopleList'}).data.length == 0) { //主持人
			this.setData({
				hostPeopleList: dd.getStorageSync({key:'hostPeopleList'}).data
			})
		}
		if (dd.getStorageSync({key:'summaryPeopleList'}).data != undefined && dd.getStorageSync({key:'summaryPeopleList'}).data != '' || dd.getStorageSync({key:'summaryPeopleList'}).data.length == 0) { //纪要人
			this.setData({
				summaryPeopleList: dd.getStorageSync({key:'summaryPeopleList'}).data
			})
		}
		if (dd.getStorageSync({key:'addMeetingProcessList'}).data != undefined && dd.getStorageSync({key:'addMeetingProcessList'}).data != '' || dd.getStorageSync({key:'addMeetingProcessList'}).data.length == 0) { //议程
			this.setData({
				meetingProcessList: dd.getStorageSync({key:'addMeetingProcessList'}).data
			})
		}
	},

    /**
     * 生命周期函数--监听页面隐藏
     */
	onHide: function () {

	},

    /**
     * 生命周期函数--监听页面卸载
     */
	onUnload: function () {
		dd.setStorageSync({key:'selectPeopleList', data:[]});
		dd.setStorageSync({key:'hostPeopleList', data:[]});
		dd.setStorageSync({key:'summaryPeopleList', data:[]});
		dd.setStorageSync({key:'meetingProcessList', data:[]});
	},

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
	onPullDownRefresh: function () {

	},

    /**
     * 页面上拉触底事件的处理函数
     */
	onReachBottom: function () {

	},
	btnClick: function () {
		var that = this;
		if (that.data.meetingTitle == '') {
			utils.showToast('会议主题不能为空', 1000);
		} else {
			var hostUserName = '';
			var hostUserId = '';
			if (that.data.hostPeopleList.length > 0) {
				hostUserName = that.data.hostPeopleList[0].name;
				hostUserId = that.data.hostPeopleList[0].userId;
			}
			var summaryUserName = '';
			var summaryUserId = '';
			if (that.data.summaryPeopleList.length > 0) {
				summaryUserName = that.data.summaryPeopleList[0].name;
				summaryUserId = that.data.summaryPeopleList[0].userId;
			}
			if (that.data.scanState) {
				var isMeetingSign = 1;
			} else {
				var isMeetingSign = 0;
			}
			var meetingStaffList = [];
			if (that.data.selectPeopleList.length > 0) {
				for (var i = 0; i < that.data.selectPeopleList.length; i++) {
					meetingStaffList.push({
						userName: that.data.selectPeopleList[i].name,
						userId: that.data.selectPeopleList[i].userId
					});
				}
			}
			var sendData = {
				hostUserName: hostUserName,
				hostUserId: hostUserId,
				isMeetingSign: isMeetingSign,
				meetingProcessList: that.data.meetingProcessList,
				meetingStaffList: meetingStaffList,
				meetingSubject: that.data.meetingTitle,
				meetingType: parseInt(that.data.meetingTypeIndex) + 1,
				remindType: parseInt(that.data.pickerAlertIndex) + 1,
				summaryUserName: summaryUserName,
				summaryUserId: summaryUserId,
				templateId: that.data.id,
			}
			var callBack = {
				success: function (e) {
					if (e.data.status == '0000') {
						dd.setStorageSync({key:'selectPeopleList', data:[]});
						dd.setStorageSync({key:'hostPeopleList', data:[]});
						dd.setStorageSync({key:'summaryPeopleList', data:[]});
						dd.setStorageSync({key:'meetingProcessList', data:[]});
						dd.navigateBack({
							delta: 1,
						})
						// this.dataList();
					} else {
						utils.showToast(e.data.message, 1000);
					}
				},
				fail: function (e) {
					utils.showToast(e.errMg, 1000);
				}
			}
			utils.ajax(utils.setURL('/template/templates'), sendData, callBack, 'PUT');
		}
	},
	dataList() {
		var that = this;
		var sendData = {}
		var callBack = {
			success: function (e) {
				if (e.data.status == '0000') {
					var content = e.data.res_data
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
					that.setData({
						meetingTypeIndex: parseInt(content.meetingType) - 1,
						meetingTitle: content.meetingSubject,
						selectPeopleList: meetingStaffList,
						hostPeopleList: hostPeopleList,
						summaryPeopleList: summaryPeopleList,
						meetingProcessList: content.meetingProcessList,
						pickerAlertIndex: parseInt(content.remindType) - 1,
						scanState: scanState
					})
					dd.setStorageSync({key:'selectPeopleList', data:meetingStaffList});
					dd.setStorageSync({key:'hostPeopleList', data:hostPeopleList});
					dd.setStorageSync({key:'summaryPeopleList', data:summaryPeopleList});
					dd.setStorageSync({key:'addMeetingProcessList', data:content.meetingProcessList});
				} else {
					utils.showToast(e.data.message, 1000);
				}
			},
			fail: function (e) {
				utils.showToast(e.errMg, 1000);
			}
		}
		var url = utils.setURL('/template/details/') + that.data.id;
		utils.ajax(url, sendData, callBack, 'GET');
	},
	deleteClick: function () {
		var that = this;
		dd.confirm({
			title: '提示',
			content: '是否确认删除模版？',
			cancelButtonText: '取消',
			cancelButtonColor: '#2B7AFB',
			confirmButtonText: '确认',
			confirmButtonColor: '#2B7AFB',
			success(res) {
				if (res.confirm) {
					var sendData = {}
					var callBack = {
						success: function (e) {
							if (e.data.status == '0000') {
								dd.navigateBack({
									detla: 1
								})
							} else {
								utils.showToast(e.data.message, 1000);
							}
						},
						fail: function (e) {
							utils.showToast(e.errMg, 1000);
						}
					}
					utils.ajax(utils.setURL('/template/' + that.data.id), sendData, callBack, "DELETE");
				} else if (res.cancel) {

				}
			}
		})
	},
	goMeeting: function () {
		var that = this;
		dd.setStorageSync({key:'stencilId', data:this.data.id});
		dd.setStorageSync({key:'addMeetingProcessList', data:[]});
		if (that.data.webType == 1) {
			dd.redirectTo({
				url: '../confirmOrder/confirmOrder?webType=1&date=' + this.data.date,
			})
		} else {
			dd.redirectTo({
				url: '../orderEdit/orderEdit?webType=1&date=' + this.data.date,
			})
		}
	},
	bindAlertChange: function (e) {
		this.setData({
			pickerAlertIndex: e.detail.value
		})
		//console.log(this.data.pickerAlertIndex)
	},
	bindMeetingTypeChange: function (e) {
		this.setData({
			meetingTypeIndex: e.detail.value
		})
	},
	titleInput: function (e) {
		this.setData({
			meetingTitle: e.detail.value
		})
	},
	personList: function (e) {
		dd.navigateTo({
			url: '../joinList/joinList?type=' + e.currentTarget.dataset.type,
		})
	},
	meetingAgenda: function () {
		dd.navigateTo({
			url: '../../schedule/scheduleDetailBefore/scheduleDetailBefore?tabType=4&id=null',
		})
	},
	switch2Change: function (e) {
		this.setData({
			scanState: e.detail.value
		})
	}
})