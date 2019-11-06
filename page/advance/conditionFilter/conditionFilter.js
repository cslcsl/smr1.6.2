//logs.js
const app = getApp()
const utils = require('../../../utils/util.js')
var dateTimePicker = require('../../../utils/dateTimePicker.js');
Page({
    data: {
        dataListDetail: {
            projectList: [],
            //projectIndex: [0, 0, 0, 0],
            projectIndex: [],
            projectListArray: [],
            meetingDate: '2019-03-01',
            peopleNumList: [],
            peopleNumIndex: -1,
            beginTimeIndex: [],
            endTimeIndex: [],
            beginTime: '请选择开始时间',
            endTime: '请选择结束时间',
            deviedList: '',
            timeList: [],
            timeInputList: [
            ],
			timeSelectState:false,
            timeInputIndex: [],
            buildingList: [],
            buildingListIndex: 0,
            floorList: [],
            floorListIndex: 0,
            searchContent: true,
            floorNumber: '',
			timeInitIndex: ''
        },
        fromType: 1,
        type: 1,
        bookId: ''
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
		var that = this
        this.setData({
            fromType: options.fromType,
            type: options.type,
            bookId: options.bookId
        })
        this.projectList();
        this.peopleNumList();
        this.timeList();
		this.timeInputList();
		var date = new Date()
		var hour = date.getHours()
		var minute = date.getMinutes()
		var beginTimeIndex = []
		var endTimeIndex = []
		if (app.globalData.meetingType == 1) {
			if (hour < 23 && minute >= 45) {
				beginTimeIndex.push(date.getHours() + 1)
				beginTimeIndex.push('0')
				endTimeIndex.push(date.getHours() + 2)
				endTimeIndex.push('0')
				beginTimeIndex = beginTimeIndex[0] + ':00'
				endTimeIndex = endTimeIndex[0] + ':00'
			} else if (hour >= 23) {
				beginTimeIndex.push(date.getHours())
				beginTimeIndex.push(Math.ceil(date.getMinutes() / 15))
				beginTimeIndex = beginTimeIndex[0] + ':' + beginTimeIndex[1] * 15
				endTimeIndex = '24:00'
			} else {
				beginTimeIndex.push(date.getHours())
				beginTimeIndex.push(Math.ceil(date.getMinutes() / 15))
				endTimeIndex.push(date.getHours() + 1)
				endTimeIndex.push(Math.ceil(date.getMinutes() / 15))
				beginTimeIndex = beginTimeIndex[0] + ':' + beginTimeIndex[1] * 15
				endTimeIndex = endTimeIndex[0] + ':' + endTimeIndex[1] * 15
			}
		} else {
			if (hour < 23 && minute >= 30) {
				beginTimeIndex.push(date.getHours() + 1)
				beginTimeIndex.push('0')
				endTimeIndex.push(date.getHours() + 2)
				endTimeIndex.push('0')
				beginTimeIndex = beginTimeIndex[0] + ':00'
				endTimeIndex = endTimeIndex[0] + ':00'
			} else if (hour >= 23) {
				beginTimeIndex.push(date.getHours())
				beginTimeIndex.push(Math.ceil(date.getMinutes() / 30))
				endTimeIndex.push('24')
				endTimeIndex.push('0')
				beginTimeIndex = beginTimeIndex[0] + ':' + beginTimeIndex[1] * 30
				endTimeIndex = '24:00'
			} else {
				beginTimeIndex.push(date.getHours())
				beginTimeIndex.push(Math.ceil(date.getMinutes() / 30))
				endTimeIndex.push(date.getHours() + 1)
				endTimeIndex.push(Math.ceil(date.getMinutes() / 30))
				beginTimeIndex = beginTimeIndex[0] + ':' + beginTimeIndex[1] * 30
				endTimeIndex = endTimeIndex[0] + ':' + endTimeIndex[1] * 30
			}
		}
		var timeIndex = []
		console.log(beginTimeIndex)
		console.log(endTimeIndex)
		for (var i = 0; i < that.data.dataListDetail.timeInputList[0].length; i++) {
			if (that.data.dataListDetail.timeInputList[0][i] == beginTimeIndex) {
				timeIndex.push(i)
			}
		}
		for (var i = 0; i < that.data.dataListDetail.timeInputList[0].length; i++) {
			if (that.data.dataListDetail.timeInputList[0][i] == endTimeIndex) {
				timeIndex.push(i)
			}
		}
		console.log(timeIndex)
		that.data.dataListDetail.timeInputIndex = timeIndex
		that.data.dataListDetail.timeInitIndex = timeIndex
		this.setData({
			dataListDetail: that.data.dataListDetail
		})
        if (dd.getStorageSync({key:'searchDataList'}).data != '' && dd.getStorageSync({key:'searchDataList'}).data != undefined) {
            this.setData({
                dataListDetail: dd.getStorageSync({key:'searchDataList'}).data
            })
        } else {
            if (options.date != undefined && options.date != null && options.date != '') {
                this.data.dataListDetail.meetingDate = options.date;

            } else {
                this.data.dataListDetail.meetingDate = this.haveSomeMinutesTime();
            }
            this.setData({
                dataListDetail: this.data.dataListDetail
            })
        }
        
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },
    timeInputList: function() {
        var that = this;
        var list = ['00:00'];
        var listArray = [];
		if (app.globalData.meetingType == 1) {
			var hourType = 15
			var hourNumber = 4
		} else {
			var hourType = 30
			var hourNumber = 2
		}
        for (var i = 0; i < 24; i++) {
			for (var j = 0; j < hourNumber; j++) {
				if (app.globalData.meetingType == 1) {
					if (j == 3) {
						var valueBegin = (Array(2).join('0') + parseInt((i) + 1)).slice(-2) + ':' + '00';
					} else {
						var valueBegin = (Array(2).join('0') + i).slice(-2) + ':' + (Array(2).join('0') + parseInt((j) + 1) * hourType).slice(-2);
					}
				} else {
					if (j == 1) {
						var valueBegin = (Array(2).join('0') + parseInt((i) + 1)).slice(-2) + ':' + '00';
					} else {
						var valueBegin = (Array(2).join('0') + i).slice(-2) + ':' + (Array(2).join('0') + parseInt((j) + 1) * hourType).slice(-2);
					}
				}
				list.push(valueBegin)
            }
        }
        listArray.push(list);
        listArray.push(list);
        console.log(listArray)
        that.data.dataListDetail.timeInputList = listArray;
        that.setData({
            dataListDetail: that.data.dataListDetail
        })
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        var deviedList = dd.getStorageSync({key:'deviedList'}).data;
        if (deviedList != '' && deviedList != undefined || deviedList.length == 0) {
            this.data.dataListDetail.deviedList = deviedList;
            this.setData({
                dataListDetail: this.data.dataListDetail
            })
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
    peopleNumList: function() {
        var list = ['2', '4', '6', '8', '10', '20', '50', '100'];
        // for (var i = 0; i < 100; i++) {
        //     list.push(i + 1);
        // }
        this.data.dataListDetail.peopleNumList = list;
        this.setData({
            dataListDetail: this.data.dataListDetail
        })
    },
    timeList: function() {
        var list = [];
        for (var i = 0; i < 24; i++) {
            var valueEnd = (Array(2).join('0') + i).slice(-2);
            list.push(valueEnd);
        }
        this.data.dataListDetail.timeList.push(list);
        this.data.dataListDetail.timeList.push(['00', '30']);
        this.setData({
            dataListDetail: this.data.dataListDetail
        })
        //console.log(this.data.timeList)
    },
    bindDateChange: function(e) {
        this.data.dataListDetail.meetingDate = e.detail.value;
        this.setData({
            dataListDetail: this.data.dataListDetail
        })
    },
    bindPeopleNumChange: function(e) {
		if (this.data.dataListDetail.peopleNumIndex == e.currentTarget.dataset.index) {
			this.data.dataListDetail.peopleNumIndex = -1;
		} else {
			this.data.dataListDetail.peopleNumIndex = e.currentTarget.dataset.index;
		}
        this.setData({
            dataListDetail: this.data.dataListDetail
        })
    },
    deviedSelect: function(e) {
        dd.navigateTo({
            url: '../deviedSelect/deviedSelect',
        })
    },
    reset: function() {
        var that = this;
        var list = {
            projectList: [],
            projectIndex: [],
            projectListArray: [],
            meetingDate: this.haveSomeMinutesTime(),
            peopleNumList: [],
            peopleNumIndex: -1,
            timeList: [],
            beginTimeIndex: [],
            endTimeIndex: [],
            beginTime: '请选择开始时间',
            endTime: '请选择结束时间',
            deviedList: '',
            buildingList: [],
            buildingListIndex: 0,
            floorList: [],
            floorListIndex: 0,
            searchContent: true,
            floorNumber: '',
			timeInputList: that.data.dataListDetail.timeInputList,
			timeInputIndex: [],
        }
        this.setData({
            dataListDetail: list
        })
        this.projectList();
        this.peopleNumList();
        this.timeList();
        console.log(this.data.dataListDetail);
        dd.setStorageSync({key:'deviedList', data:[]});
        dd.setStorageSync({key:'searchList', data:[]}) //搜索数据
        dd.setStorageSync({key:'searchDataList', data:[]}) //渲染搜索数据
    },
    search: function() {
        var that = this;
        var projectIndex = that.data.dataListDetail.projectIndex;
        var projectListArray = that.data.dataListDetail.projectListArray;
        var buildingList = that.data.dataListDetail.buildingList;
        var floorList = that.data.dataListDetail.floorList;
        var buildingListIndex = that.data.dataListDetail.buildingListIndex;
        var floorListIndex = that.data.dataListDetail.floorListIndex;
        var deviceList = [];
        var deviceStr = [];
        var deviedList = that.data.dataListDetail.deviedList;
        if (projectIndex.length > 0) {
            for (var i = 0; i < deviedList.length; i++) {
                deviceList.push(deviedList[i].mroomEquipmentId);
                deviceStr.push(deviedList[i].equipmentName)
            }
        }
        var buildId = ''
        if (buildingList.length > 0 && projectIndex.length > 0) {
            buildId = projectListArray[projectIndex[0]].citys[projectIndex[1]].projectNames[projectIndex[2]].buildingVos[buildingListIndex].code
        }
		if (that.data.dataListDetail.timeInputIndex.length > 0 && that.data.dataListDetail.timeSelectState) {
            var endTime = that.data.dataListDetail.meetingDate + ' ' + that.data.dataListDetail.timeInputList[1][that.data.dataListDetail.timeInputIndex[1]] + ':00';
        } else {
            var endTime = '';
        }
        var searchTime = that.data.dataListDetail.meetingDate;
		if (that.data.dataListDetail.timeInputIndex.length > 0 && that.data.dataListDetail.timeSelectState) {
            var startTime = that.data.dataListDetail.meetingDate + ' ' + that.data.dataListDetail.timeInputList[0][that.data.dataListDetail.timeInputIndex[0]] + ':00';
			if (that.data.dataListDetail.timeInputIndex.length > 0) {
                var endtime_ms = Date.parse(new Date(endTime.replace(/-/g, "/")));
                var begintime_ms = Date.parse(new Date(startTime.replace(/-/g, "/")));
                var date1 = (new Date()).getTime(); //当前时间
                var date2 = (new Date(begintime_ms)).getTime(); //开始时间
                var date3 = (new Date(endtime_ms)).getTime(); //结束时间
                if ((date1 - date2) > 0) {
                    utils.showToast('开始时间不能小于当前时间', 1000);
                    return;
                }
                if ((date2 - date3) >= 0) {
                    utils.showToast('结束时间不能小于等于开始时间', 1000);
                    return;
                }
            } else {
                utils.showToast('结束时间不能为空', 1000);
                return;
            }
        } else {
            var startTime = '';

        }
        var floorId = '';
        if (floorList.length > 0 && projectIndex.length > 0) {
            var floorId = projectListArray[projectIndex[0]].citys[projectIndex[1]].projectNames[projectIndex[2]].buildingVos[buildingListIndex].floors[floorListIndex].code
        }
        if (that.data.dataListDetail.peopleNumIndex >= 0) {
            var meetingNumber = that.data.dataListDetail.peopleNumList[that.data.dataListDetail.peopleNumIndex];
        } else {
            var meetingNumber = ''
        }
        var mroomId = '';
        var mroomName = '';
        var projectId = ''
        if (projectIndex.length > 0) {
            projectId = projectListArray[projectIndex[0]].citys[projectIndex[1]].projectNames[projectIndex[2]].code;
        }
        var searchList = {
            buildId: buildId,
            deviceList: deviceList,
            //deviceStr: deviceStr,
            endTime: endTime,
            floorId: floorId, //楼层编号
            meetingNumber: meetingNumber,
            mroomId: mroomId,
            mroomName: null,
            projectId: projectId,
            propertyId: app.globalData.loginInfo.propertyId,
            searchStatus: 1,
            searchTime: searchTime,
            startTime: startTime,
        }
        dd.setStorageSync({key:'searchList', data:searchList});
        dd.setStorageSync({key:'searchDataList', data:that.data.dataListDetail})
        dd.redirectTo({
            url: '../searchResult/searchResult?webType=2&mroomId=&mroomName=&fromType=' + that.data.fromType + '&type=' + that.data.type + '&bookId=' + that.data.bookId + '&date=' + searchTime,
        })
    },
    projectList: function() {
        var that = this;
        var sendData = {
            propertyid: app.globalData.propertyId,
            platform: "APPLET"
        }
        var callBack = {
            success: function(e) {
                if (e.data.status == '0000') {
                    var listArray = [];
                    var list1 = [];
                    var list2 = [];
                    var list3 = [];
                    var list4 = [];
                    var list5 = [];
                    for (var i = 0; i < e.data.res_data.geoCountrysVos.length; i++) {
                        list1.push(e.data.res_data.geoCountrysVos[i].name);
                    }
                    listArray.push(list1)
                    for (var i = 0; i < e.data.res_data.geoCountrysVos[0].citys.length; i++) {
                        list2.push(e.data.res_data.geoCountrysVos[0].citys[i].name);
                    }
                    listArray.push(list2)
                    for (var i = 0; i < e.data.res_data.geoCountrysVos[0].citys[0].projectNames.length; i++) {
                        list3.push(e.data.res_data.geoCountrysVos[0].citys[0].projectNames[i].name);
                    }
                    listArray.push(list3)
                    //楼栋
                    for (var i = 0; i < e.data.res_data.geoCountrysVos[0].citys[0].projectNames[0].buildingVos.length; i++) {
                        list4.push(e.data.res_data.geoCountrysVos[0].citys[0].projectNames[0].buildingVos[i].name);
                    }
                    that.data.dataListDetail.buildingList = [];
                    that.data.dataListDetail.buildingList = list4;
                    //楼层
                    if (e.data.res_data.geoCountrysVos[0].citys[0].projectNames[0].buildingVos.length) {
                        for (var i = 0; i < e.data.res_data.geoCountrysVos[0].citys[0].projectNames[0].buildingVos[0].floors.length; i++) {
                            list5.push(e.data.res_data.geoCountrysVos[0].citys[0].projectNames[0].buildingVos[0].floors[i].name);
                        }
                    }
                    that.data.dataListDetail.floorList = [];
                    that.data.dataListDetail.floorList = list5;
                    that.data.dataListDetail.projectListArray = e.data.res_data.geoCountrysVos,
                        that.data.dataListDetail.projectList = listArray,
                        that.setData({
                            dataListDetail: that.data.dataListDetail
                        })
                    // console.log(that.data.dataListDetail)
                } else {
                    utils.showToast('数据请求失败',1000);
                }
            },
            fail: function(e) {
                utils.showToast('数据请求失败',1000);
            }
        }
        utils.ajax(utils.setURL('/web/busProjectInfo/projectGeo'), sendData, callBack, "GET");
    },
    changeDateTime1(e) {
        this.data.dataListDetail.dateTime1 = e.detail.value;
        this.setData({
            dataListDetail: this.data.dataListDetail
        });
    },
    changeDateTime2(e) {
        this.data.dataListDetail.dateTime2 = e.detail.value;
        this.setData({
            dataListDetail: this.data.dataListDetail
        });
    },
    beginTimeChange(e) {
        //console.log('picker发送选择改变，携带值为', e.detail.value)
        this.data.dataListDetail.beginTimeIndex = e.detail.value;
        this.setData({
            dataListDetail: this.data.dataListDetail
        })
    },
    beginTimeColumnChange(e) {
        // console.log('修改的列为', e.detail.column, '，值为', e.detail.value)
    },
    endTimeChange(e) {
        //console.log('picker发送选择改变，携带值为', e.detail.value)
        this.data.dataListDetail.endTimeIndex = e.detail.value;
        this.setData({
            dataListDetail: this.data.dataListDetail
        })
    },
    endTimeColumnChange(e) {
        //console.log('修改的列为', e.detail.column, '，值为', e.detail.value)
    },
    bindProjectPickerChange(e) {
        var that = this;
        this.data.dataListDetail.projectIndex = e.detail.value;
        this.data.dataListDetail.buildingListIndex = 0;
        this.data.dataListDetail.floorListIndex = 0;
        this.setData({
            dataListDetail: this.data.dataListDetail
        })
        var projectListArray = this.data.dataListDetail.projectListArray;
        var projectIndex = that.data.dataListDetail.projectIndex;
        //楼栋
        var list1 = [];
        var list2 = [];
        for (var i = 0; i < projectListArray[projectIndex[0]].citys[projectIndex[1]].projectNames[projectIndex[2]].buildingVos.length; i++) {
            list1.push(projectListArray[projectIndex[0]].citys[projectIndex[1]].projectNames[projectIndex[2]].buildingVos[i].name);
        }
        this.data.dataListDetail.buildingList = list1;
        //楼层
        if (projectListArray[projectIndex[0]].citys[projectIndex[1]].projectNames[projectIndex[2]].buildingVos.length > 0) {
            for (var i = 0; i < projectListArray[projectIndex[0]].citys[projectIndex[1]].projectNames[projectIndex[2]].buildingVos[0].floors.length; i++) {
                list2.push(projectListArray[projectIndex[0]].citys[projectIndex[1]].projectNames[projectIndex[2]].buildingVos[0].floors[i].name);
            }
        }
        this.data.dataListDetail.floorList = [];
        this.data.dataListDetail.floorList = list2;
        this.setData({
            dataListDetail: this.data.dataListDetail
        })
        console.log(this.data.dataListDetail)
    },
    bindProjectPickerColumnChange(e) {
        console.log('picker发送选择改变，携带值为', e.detail.value)
        var that = this;
        var value = e.detail.value;
        if (that.data.dataListDetail.projectIndex.length > 0) {
            var projectIndex = that.data.dataListDetail.projectIndex;
        } else {
            var projectIndex = [0, 0, 0, 0];
        }
        var projectListArray = that.data.dataListDetail.projectListArray;
        if (e.detail.column == 0) { //修改省
            var list1 = [];
            var list2 = [];
            for (var i = 0; i < projectListArray[value].citys.length; i++) {
                list1.push(projectListArray[value].citys[i].name);
            }
            that.data.dataListDetail.projectList[1] = [];
            that.data.dataListDetail.projectList[1] = list1;
            for (var i = 0; i < projectListArray[value].citys[0].projectNames.length; i++) {
                list2.push(projectListArray[value].citys[0].projectNames[i].name);
            }
            that.data.dataListDetail.projectList[2] = [];
            that.data.dataListDetail.projectList[2] = list2;
            that.setData({
                dataListDetail: that.data.dataListDetail
            })
        }
        if (e.detail.column == 1) { //修改市
            var list2 = [];
            for (var i = 0; i < projectListArray[projectIndex[0]].citys[value].projectNames.length; i++) {
                list2.push(projectListArray[projectIndex[0]].citys[value].projectNames[i].name);
            }
            that.data.dataListDetail.projectList[2] = [];
            that.data.dataListDetail.projectList[2] = list2;
            that.setData({
                dataListDetail: that.data.dataListDetail
            })

        }
        //console.log(that.data.dataListDetail)
    },
    bindBuildingChange: function(e) { //楼栋选择
        var value = parseInt(e.detail.value);
        var projectIndex = this.data.dataListDetail.projectIndex;
        var projectListArray = this.data.dataListDetail.projectListArray;
        var list2 = [];
        //楼层
        for (var i = 0; i < projectListArray[projectIndex[0]].citys[projectIndex[1]].projectNames[projectIndex[2]].buildingVos[value].floors.length; i++) {
            list2.push(projectListArray[projectIndex[0]].citys[projectIndex[1]].projectNames[projectIndex[2]].buildingVos[value].floors[i].name);
        }
        this.data.dataListDetail.floorList = [];
        this.data.dataListDetail.floorList = list2;

        this.setData({
            dataListDetail: this.data.dataListDetail
        })
    },
    bindFloorChange: function(e) { //楼栋选择
        var value = e.detail.value;
        this.data.dataListDetail.floorListIndex = e.detail.value;
        this.setData({
            dataListDetail: this.data.dataListDetail
        })
    },
    haveSomeMinutesTime: function(n) {
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
        //var time = year + '-' + month + '-' + day + '-' + h + '-' + m + '-' + s;
        var time = year + '-' + month + '-' + day;
        //console.log(time)
        return time;
    },
    floorInput: function(e) {
        this.data.dataListDetail.floorNumber = e.detail.value;
        this.setData({
            dataListDetail: dataListDetail
        })
    },
    bindTimeChange: function(e) {
        var that = this;
        that.data.dataListDetail.timeInputIndex = e.detail.value
		that.data.dataListDetail.timeSelectState = true
        that.setData({
            dataListDetail: that.data.dataListDetail
        })
    },
    bindTimeCancel: function() {
		var that=this;
		that.data.dataListDetail.timeInputIndex = that.data.dataListDetail.timeInitIndex
		that.data.dataListDetail.timeSelectState = false
        that.setData({
            dataListDetail: that.data.dataListDetail
        })
    },
    buildingClear: function(e) {
        var type = e.currentTarget.dataset.type
        if (type == 1) {
            utils.showToast('请先选择地点', 1000)
        } else {
            utils.showToast('请先选择地点或者楼栋', 1000)
        }
    }
})