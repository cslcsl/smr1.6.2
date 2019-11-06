//logs.js
const app = getApp()
const utils = require('../../utils/util.js')
// pages/data/data.js
Page({

    /**
     * 页面的初始数据
     */
	data: {
		loginState: false,
		loginInfo: '',
		faceState: false,
		selectDate:''
	},

    /**
     * 生命周期函数--监听页面加载
     */
	onLoad: function (options) {
		this.selectDate = this.haveSomeMinutesTime()
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
		} else {
			this.setData({
				loginState: false
			})
		}
		this.face();
		dd.closeSocket()
		utils.getNewInboxNumber();
	},

    /**
     * 生命周期函数--监听页面隐藏
     */
	onHide: function () { },

    /**
     * 生命周期函数--监听页面卸载
     */
	onUnload: function () {

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
	onShareAppMessage: function () {
		return {
			imageUrl: '../../images/common/sharepic.png'
		}
	},
	loginOut: function () {
		dd.setStorageSync({key:'loginInfo', data:''});
		app.globalData.loginInfo = '';
		app.globalData.todoNumber = 0
		// dd.removeTabBarBadge({
		// 	index: 3,
		// })
		dd.closeSocket();
		dd.reLaunch({
			url: 'login/login',
		})
	},
	webBreak: function (e) {
		var that = this;
		// if (that.data.loginState) {
		dd.navigateTo({
			url: e.currentTarget.dataset.url,
		})
		// } else {
		//     dd.navigateTo({
		//         url: 'login/login',
		//     })
		// }
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
								url: '../advance/searchResult/searchResult?webType=1&mroomName=' + '&date=' + that.haveSomeMinutesTime() + '&fromType=1' + '&type=1' + '&bookId=' + "&mroomId=" + idNumber,
							})
						}
					} else if (qrCodeDict.type == '0103') {
						that.waterCode(qrCodeDict.data.bookId, qrCodeDict.data.mroomId)
					} else if (qrCodeDict.type == '0104') {
						that.openDoor(qrCodeDict.data.gateWayAddress, qrCodeDict.data.lockAddress, qrCodeDict.data.doorId, qrCodeDict.data.lockType)
					} else {
						utils.showToast(resultStr,1000)
					}
				}
			}
		})
	},
	//签到
	sign: function (bookID) {
		var that = this;
		var mroomId = mroomId;
		if (mroomId == undefined || mroomId == null || mroomId == '') {
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
	},
	openDoor: function (gateWayAddress, lockAddress, doorId, lockType) {
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
	},
	webBreak2: function (e) {
		dd.navigateTo({
			url: e.currentTarget.dataset.url,
		})
	},
	companyUntying: function (e) {
		var that = this;
		dd.navigateTo({
			url: 'companySelect/companySelect',
		})
	},
	wechatBind: function () {
		var that = this;
		if (app.globalData.loginInfo.openId == null) {
			var message = '确定绑定微信吗？'
		} else {
			var message = '确定解绑微信吗？'
		}
		dd.confirm({
			title: '提示',
			content: message,
			cancelButtonText: '取消',
			cancelColor: '#2B7AFB',
			confirmButtonText: '确认',
			confirmColor: '#2B7AFB',
			success(res) {
				if (res.confirm) {
					dd.login({
						success(rescode) {
							var callBack = {
								success: function (e) {
									if (e.data.status == '0000') {
										if (app.globalData.loginInfo.openId == null) {
											utils.showToast('绑定成功', 1000)
										} else {
											utils.showToast('解绑成功', 1000)
										}

										if (app.globalData.loginInfo.openId == null) {
											app.globalData.loginInfo.openId = e.data.res_data.openId;
											dd.setStorageSync({key:'loginInfo', data:app.globalData.loginInfo})
										} else {
											app.globalData.loginInfo.openId = null
											dd.setStorageSync({key:'loginInfo', data:app.globalData.loginInfo})
										}
										that.setData({
											loginInfo: app.globalData.loginInfo
										})
									}
								},
								fail: function (e) {
									utils.showToast(e.errMsg, 1000)
								}
							}
							if (app.globalData.loginInfo.openId == null) {
								var url = '/user/wxBind?code=' + rescode.code;
								var sendData = {
									code: rescode.code
								}
							} else {
								var url = '/user/wxBind';
								var sendData = {}

							}
							utils.ajax(utils.setURL(url), sendData, callBack, 'PUT');
						},
						fail(res) {
							utils.showToast('获取授权code失败',1000);
						}
					})
				} else if (res.cancel) {
					// console.log('用户点击取消')
				}
			}
		})
	},

	//修改密码
	changePassword: function () {
		dd.navigateTo({
			url: 'passwordEdit/passwordEdit',
		})
	},
	baiduCeshi: function () {
		dd.navigateTo({
			url: 'baiduCeshi/baiduCeshi',
		})
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
		// var time = year + '-' + month + '-' + day + '-' + h + '-' + m + '-' + s;
		var time = year + '-' + month + '-' + day;
		return time;
	},
	faceScan: function (e) {
		var url = e.currentTarget.dataset.url;
		dd.navigateTo({
			url: url,
		})
	},
	face: function () {
		var that = this;
		var sendData = {}
		var callBack = {
			success: function (e) {
				if (e.data.status == '0000') {
					that.setData({
						faceState: true
					})
				} else {
					that.setData({
						faceState: false
					})
				}
			},
			fail: function (e) {
				utils.showToast(e.errMsg, 1000);
			}
		}
		var url = '/face';
		utils.ajax(utils.setURL(url), sendData, callBack, 'GET');
	}
})