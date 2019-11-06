const app = getApp()
const utils = require('../../../utils/util.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        fileList: [],
        delBtnWidth: 200,
        isScroll: true,
		loginInfo: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
		
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
		this.setData({
			loginInfo: app.globalData.loginInfo
		})
		this.company()
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
	companySelect: function (e) {
		var that = this
		var type = ''
		if (e != 1) {
			type = e.currentTarget.dataset.type
			var id = e.currentTarget.dataset.id
			var index = e.currentTarget.dataset.index
		}
		if (type == 1 && e !=1) {
			dd.confirm({
				title: '解绑企业',
				content: '确认解绑此企业吗？',
				cancelButtonText: '返回',
				cancelColor: '#333',
				confirmButtonText: '确认',
				confirmColor: '#2B7AFB',
				success(res) {
					if (res.confirm) {
						var sendData = {
							userId: that.data.loginInfo.userId
						}
						var callBack = {
							success: function (e) {
								if (e.data.status == '0000') {
									if (that.data.fileList.length == 1) {
										dd.setStorageSync({key:'loginInfo',data:''})
										// app.globalData.loginInfo = ''
										dd.reLaunch({
											url: '../companyId/companyId',
										})
									} else {
										that.company(1);
									}
								} else {
									utils.showToast(e.data.message, 1000)
								}
							},
							fail: function (e) {
								utils.showToast(e.errMsg, 1000)
							}
						}
						var url = '/companies/unbind';
						utils.ajax(utils.setURL(url), sendData, callBack, 'PUT');
					} else if (res.cancel) {
						dd.navigateBack({
							delta: 1
						})
					}
				}
			})
		} else {
			if (e == 1) {
				that.switchCompany(that.data.fileList[0].companyUuid)
			} else {
				dd.confirm({
					title: '切换企业',
					content: '确认切换企业？',
					cancelButtonText: '返回',
					cancelColor: '#333',
					confirmButtonText: '确认',
					confirmColor: '#2B7AFB',
					success(res) {
						if (res.confirm) {
							that.switchCompany(id)
						} else if (res.cancel) {
							// dd.navigateBack({
							// 	delta: 1
							// })
						}
					}
				})
			}
		}
	},
	switchCompany: function (id) {
		var that = this
		var sendData = {
			userId: that.data.loginInfo.userId
		}
		var callBack = {
			success: function (e) {
				if (e.data.status == '0000') {
					app.globalData.loginInfo = e.data.res_data
					dd.setStorageSync({key:'loginInfo', data:e.data.res_data});
					that.meetingConfig()
					dd.navigateBack({
						delta: 1
					})
				} else {
					utils.showToast(e.data.message, 1000)
				}
			},
			fail: function (e) {
				utils.showToast(e.errMsg, 1000)
			}
		}
		var url = '/companyOrg/switchCompany/' + id;
		utils.ajax(utils.setURL(url), sendData, callBack, 'PUT');
	},
	company: function (type) {
		var that = this;
		var sendData = {
		}
		var callBack = {
			success: function (e) {
				if (e.data.status == '0000') {
					for (var i = 0; i<e.data.res_data.length;i++) {
						if (e.data.res_data[i].companyUuid == that.data.loginInfo.companyId) {
							that.setData({
								index:i
							})
						}
					}
					that.setData({
						fileList: e.data.res_data
					})
					if (type ==1) {
						that.companySelect(1)
					}
				} else {
					utils.showToast(e.data.message, 1000)
				}
			},
			fail: function (e) {
				utils.showToast(e.errMsg, 1000)
				dd.hideLoading();
			}
		}
		var url = '/companyOrg/findUserCompany';
		utils.ajax(utils.setURL(url), sendData, callBack, 'GET');
	},
	meetingConfig: function (e) {
		var that = this;
		var sendData = {
		}
		var callBack = {
			success: function (e) {
				if (e.data.status == '0000') {
					app.globalData.meetingType = e.data.res_data.timeDimension
				}
			},
			fail: function (e) {
			}
		}
		utils.ajax(utils.setURL('/smr/configuration/findMeetingConfiguration'), sendData, callBack, "GET");
	}
})