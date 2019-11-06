const app = getApp()
const utils = require('../../../utils/util.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        webType: '',
        searchTitle: '',
        peopleNum: 0,
        orgList: [],
        userList: [],
        orgId: 0,
        parentIdList: [],
        selectList: [],
		selectPeopleList:[],//参会人
		hostPeopleList:[],
		summaryPeopleList: [],
        mutipleSelect: true,
		bookId:'',
		initList:[]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        if (options.type == 1) { //参会人
            if (dd.getStorageSync({key:'selectPeopleList'}).data == undefined || dd.getStorageSync({key:'selectPeopleList'}).data == '') {
                var selectList = [];
            } else {
                var selectList = dd.getStorageSync({key:'selectPeopleList'}).data;
            }
			if (options.bookId != ''&&options.bookId != undefined) {
				this.setData({
					bookId: options.bookId,
					initList: dd.getStorageSync({key:'selectPeopleList'}).data
				})
				var list = []
				for (var i = 0; i < selectList.length;i++) {
					if (selectList[i].exter!=1) {
						selectList[i].state = true
						list.push(selectList[i]);
					}
				}
				selectList = list
			}
			if (dd.getStorageSync({key:'hostPeopleList'}).data == undefined || dd.getStorageSync({key:'hostPeopleList'}).data == '') {
				var hostPeopleList = [];
			} else {
				var hostPeopleList = dd.getStorageSync({key:'hostPeopleList'}).data;
			}
			if (dd.getStorageSync({key:'summaryPeopleList'}).data == undefined || dd.getStorageSync({key:'summaryPeopleList'}).data == '') {
				var summaryPeopleList = [];
			} else {
				var summaryPeopleList = dd.getStorageSync({key:'summaryPeopleList'}).data;
			}
        } else if (options.type == 2) { //主持人
            if (dd.getStorageSync({key:'hostPeopleList'}).data == undefined || dd.getStorageSync({key:'hostPeopleList'}).data == '') {
                var selectList = [];
            } else {
                var selectList = dd.getStorageSync({key:'hostPeopleList'}).data;
            }
            this.setData({
                mutipleSelect: false
            })

        } else if (options.type == 3) { //纪要人
            if (dd.getStorageSync({key:'summaryPeopleList'}).data == undefined || dd.getStorageSync({key:'summaryPeopleList'}).data == '') {
                var selectList = [];
            } else {
                var selectList = dd.getStorageSync({key:'summaryPeopleList'}).data;
            }
            this.setData({
                mutipleSelect: false
            })
        }
		if (dd.getStorageSync({key:'selectPeopleList'}).data == undefined || dd.getStorageSync({key:'selectPeopleList'}).data == '') {
			var selectPeopleList = [];
		} else {
			var selectPeopleList = dd.getStorageSync({key:'selectPeopleList'}).data;
		}
        this.setData({
            webType: options.type,
            parentIdList: [{
                orgId: '0',
                orgName: app.globalData.loginInfo.companyName,
            }],
            selectList: selectList,
			selectPeopleList: selectPeopleList,
			hostPeopleList: hostPeopleList,
			summaryPeopleList: hostPeopleList,
            peopleNum: selectList.length
        })
		console.log(selectList)
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
    searchInput: function(e) {
        var value = e.detail.value;
        this.setData({
            searchTitle: value
        })
        if (value != '') { //人名搜索
            this.dataNameList();
        } else { //全部
            this.dataList();
        }
    },
    searchInput2: function(e) {
        var value = e.detail.value;
        this.setData({
            searchTitle: value
        })
    },
    searchDelete: function() {
        dd.confirm({
            title: '提示',
            content: '确认删除全部历史记录？',
            cancelButtonText: '取消',
            cancelColor: '#2B7AFB',
            confirmButtonText: '确认',
            confirmColor: '#2B7AFB',
            success(res) {
                if (res.confirm) {
                    // console.log('用户点击确定')
                } else if (res.cancel) {
                    // console.log('用户点击取消')
                }
            }
        })
    },
    dataList: function() {
        var that = this;
        var sendData = {
            orgId: that.data.orgId
        }
        var callBack = {
            success: function(e) {
                // console.log(e.data.res_data);
                if (e.data.status == '0000') {
                    if (e.data.res_data.orgList != null) {
                        var orgList = e.data.res_data.orgList;
                        that.setData({
                            orgList: orgList
                        })
                        //console.log(that.data.orgList)
                    } else {
                        that.setData({
                            orgList: []
                        })
                    }
                    if (e.data.res_data.userList != null) {
                        for (var i = 0; i < e.data.res_data.userList.length; i++) {
                            e.data.res_data.userList[i].state = false;
                            e.data.res_data.userList[i].pictureUrl = e.data.res_data.userList[i].picUrl;
                            for (var j = 0; j < that.data.selectList.length; j++) {
                                if (e.data.res_data.userList[i].userId == that.data.selectList[j].userId) {
                                    e.data.res_data.userList[i].state = true;
                                }
                            }
                        }
                        that.setData({
                            userList: e.data.res_data.userList
                        })
                    } else {
                        that.setData({
                            userList: []
                        })
                    }
                } else {
                    utils.showToast(e.data.message,1000);
                }
            },
            fail: function(e) {
                utils.showToast(e.errMsg,1000);
            }
        }
        var url = '/companyOrg/applet/' + that.data.orgId;
        utils.ajax(utils.setURL(url), sendData, callBack, 'GET');
    },
    dataNameList: function() {
        var that = this;
        var sendData = {
            orgId: that.data.orgId
        }
        var callBack = {
            success: function(e) {
                // console.log(e.data.res_data);
                if (e.data.status == '0000') {
                    if (e.data.res_data.length > 0) {
                        for (var i = 0; i < e.data.res_data.length; i++) {
                            e.data.res_data[i].state = false;
                            e.data.res_data[i].name = e.data.res_data[i].userName;
                            e.data.res_data[i].pictureUrl = e.data.res_data[i].picUrl;
                            for (var j = 0; j < that.data.selectList.length; j++) {
                                if (e.data.res_data[i].userId == that.data.selectList[j].userId) {
                                    e.data.res_data[i].state = true;
                                }
                            }
                        }
                        that.setData({
                            userList: e.data.res_data,
                            orgList: []
                        })
                    }
                } else {
                    utils.showToast(e.data.message,1000);
                }
            },
            fail: function(e) {
                utils.showToast(e.errMsg,1000);
            }
        }
        var url = '/companyOrg/user/' + that.data.searchTitle;
        utils.ajax(utils.setURL(url), sendData, callBack, 'GET');
    },
    orgListClick: function(e) {
        var that = this;
        var index = e.currentTarget.dataset.index;
        (that.data.parentIdList).push(that.data.orgList[index]);
        that.setData({
            orgId: that.data.orgList[index].orgId,
            parentIdList: that.data.parentIdList
        })
        that.dataList();
    },
    selThis(e) {
        // console.log(e.detail);
    },
    parentClick: function(e) {
        var that = this;
        var index = e.currentTarget.dataset.index;
        var parentIdList = that.data.parentIdList;
        var list = [];
        for (var i = 0; i < index + 1; i++) {
            list.push(parentIdList[i])
        }
        that.setData({
            parentIdList: list,
            orgId: e.currentTarget.dataset.id
        })
        that.dataList();
    },
    userListClick: function(e) {
        var that = this;
        var state = e.currentTarget.dataset.state;
        var index = e.currentTarget.dataset.index;
        if (that.data.mutipleSelect) {
            var selectList = that.data.selectList;
        } else {
            var selectList = [];
			if (!state){
				var selectPeopleListState = false
				for (var i = 0; i < that.data.selectPeopleList.length; i++) {
					if (that.data.selectPeopleList[i].userId == that.data.userList[index].userId && selectPeopleListState==false){
						selectPeopleListState = true
					}
				}
				if (!selectPeopleListState) {
					utils.showToast('选择的人员不在参会人范围内，请重新选择', 1000)
					return
				}
			}
            for (var i = 0; i < that.data.userList.length; i++) {
                that.data.userList[i].state = false;
            }
        }
        if (!state) {
            selectList.push(that.data.userList[index]);
        } else {
            var list = [];
            for (var i = 0; i < selectList.length; i++) {
                if (selectList[i].userId != that.data.userList[index].userId) {
                    list.push(selectList[i]);
                }
            }
            selectList = list;
        }
        that.data.userList[index].state = !state;
        that.setData({
            userList: that.data.userList,
            selectList: selectList,
            peopleNum: selectList.length
        })
        // console.log(that.data.selectList)
    },
    peopleConfirm: function() {
        var that = this;
        var webType = that.data.webType;
        // console.log(that.data.selectList);
        if (webType == 1) { 
			if (that.data.bookId!=''){
				that.updatePerson()
				return;
			} else {
				dd.setStorageSync({key:'selectPeopleList', data:that.data.selectList})
				if (that.data.hostPeopleList.length>0){
					var hostPeopleList = that.data.hostPeopleList
					var hostPeopleListState = false
					for (var i = 0; i < that.data.selectList.length;i++){
						if (that.data.hostPeopleList[0].userId == that.data.selectList[i].userId && !hostPeopleListState){
							hostPeopleListState = true
						}
					}
					if (!hostPeopleListState) {
						hostPeopleList = []
						dd.setStorageSync({key:'hostPeopleList', data:hostPeopleList})
					}
				}
				if (that.data.summaryPeopleList.length > 0) {
					var summaryPeopleList = that.data.summaryPeopleList
					var summaryPeopleListState = false
					for (var i = 0; i < that.data.selectList.length; i++) {
						if (that.data.summaryPeopleList[0].userId == that.data.selectList[i].userId && !summaryPeopleListState) {
							summaryPeopleListState = true
						}
					}
					if (!summaryPeopleListState) {
						summaryPeopleList = []
						dd.setStorageSync({key:'summaryPeopleList', data:summaryPeopleList})
					}
				}
			}
        } else if (webType == 2) {
            dd.setStorageSync({key:'hostPeopleList', data:that.data.selectList})
        }
        if (webType == 3) {
            dd.setStorageSync({key:'summaryPeopleList', data:that.data.selectList})
        }
        dd.navigateBack({
            delta: 1,
        })
    },
	updatePerson: function () {
		var that = this;
		var meetingStaffList = []
		var externalUserInfoList = []
		for (var i = 0; i < that.data.selectList.length;i++){
			meetingStaffList.push(that.data.selectList[i].userId)
		}
		for (var i = 0; i < that.data.initList.length; i++) {
			if (that.data.initList[i].exter==1){
				externalUserInfoList.push(that.data.initList[i])
			}
		}
		var sendData = {
			bookId: that.data.bookId,
			externalUserInfoList: externalUserInfoList,
			meetingStaffList: meetingStaffList
		}
		var callBack = {
			success: function (e) {
				if (e.data.status=='0000'){
					utils.showToast('修改成功', 1000)
					let pages = getCurrentPages();
					for (var i = 0; i < pages.length; i++) {
						if (pages[i].route == "pages/schedule/scheduleDetail/scheduleDetail") {
							dd.navigateBack({
								delta: pages.length - i - 1,
							})
						}
					}
				} else {
					utils.showToast(e.data.message, 1000)
				}
			},
			fail: function (e) {
				utils.showToast(e.errMsg,1000)
			}
		}
		utils.ajax(utils.setURL('/conference/updateMeetingroomBookingInfoConferee'), sendData, callBack,'PUT');
	},
})