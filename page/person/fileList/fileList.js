const app = getApp()
const utils = require('../../../utils/util.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        fileList: [],
        delBtnWidth: 150,
        isScroll: true,
        windowHeight: 0,
        agendaState: false,
        index: '',
        src: '',
        progress: 0,
        currentTime: 0,
        duration: 0,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.fileList();
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {
        this.audioCtx = dd.createAudioContext('myAudio')
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {},

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
    onReachBottom: function() {},
    fileList: function(order) {
        var that = this;
        var sendData = {}
        var callBack = {
            success: function(e) {
                if (e.data.res_data != null && e.data.status == '0000') {
                    for (var i = 0; i < e.data.res_data.length; i++) {
                        e.data.res_data[i].right = 0;
                        var fileType = e.data.res_data[i].fileName.split('.').pop();
                        e.data.res_data[i].type = fileType
                    }
                    that.setData({
                        fileList: e.data.res_data
                    })
                } else {
                    that.setData({
                        fileList: []
                    })
                    utils.showToast(e.data.message, 2000)
                }
            },
            fail: function(e) {
                utils.showToast(e.errMsg,1000);
            }
        }
        var url = '/record/findRecordByUserId/' + app.globalData.loginInfo.userId;
        utils.ajax(utils.setURL(url), sendData, callBack, 'GET');
    },
    fileDelete: function(e) {
        var id = e.currentTarget.dataset.id;
        var that = this;
        dd.confirm({
            title: '提示',
            content: '确定删除文件?',
            showCancel: true,
            cancelButtonText: '取消',
            cancelColor: '#333333',
            confirmButtonText: '确定',
            confirmColor: '#1874EC',
            success(res) {
                if (res.confirm) {
                    var sendData = {}
                    var callBack = {
                        success: function(e) {
                            that.fileList();
                        },
                        fail: function(e) {
                            utils.showToast(e.errMsg, 1000)
                        }
                    }
                    var url = '/record/delRecordFile/' + id;
                    utils.ajax(utils.setURL(url), sendData, callBack, 'DELETE');
                } else if (res.cancel) {
                    // console.log('用户点击取消')
                }
            }
        })
    },
    drawStart: function(e) {
        var touch = e.touches[0]
        for (var index in this.data.fileList) {
            var item = this.data.fileList[index]
            item.right = 0
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
                disX = this.data.delBtnWidth
            }
            item.right = disX
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
            item.right = this.data.delBtnWidth
            this.setData({
                isScroll: true,
                fileList: this.data.fileList,
            })
        } else {
            item.right = 0
            this.setData({
                isScroll: true,
                fileList: this.data.fileList,
            })
        }
    },
    clickFile: function(e) {
        var index = e.currentTarget.dataset.index;
        var that = this;
        that.setData({
            index: index,
            src: that.data.fileList[index].fileUrl,
			progress: 0,
			currentTime: 0,
			duration: 0,
        })
		if (that.data.fileList[index].type == 'mp3' || that.data.fileList[index].type == 'wav') {
			that.setData({
				agendaState: true,
			})
			that.audioPlay();
		} else {
			that.openFile();
		}
    },
	openFile: function (e) {
		var that = this
		dd.showLoading({
			title: '文件正在加载中',
		})
		var url = that.data.fileList[that.data.index].fileUrl;
		var fileType = that.data.fileList[that.data.index].type;
		if (fileType == 'bmp' || fileType == 'jpg' || fileType == 'jpeg' || fileType == 'png' || fileType == 'gif') {
			var urls = [];
			urls.push(url);
			dd.previewImage({
				current: url, // 当前显示图片的http链接
				urls: urls // 需要预览的图片http链接列表
			})
		} else {
			dd.downloadFile({ //下载预览附件
				url: url,
				fileType: fileType,
				success: function (res) {
					var filePath = res.tempFilePath
					dd.openDocument({ //打开附件
						filePath: filePath,
						fileType: fileType,
						success: function (res) {
							//console.log(res)
							dd.hideLoading()
						},
						fail: function (res) {
							utils.showToast('暂不支持此文件预览', 1000);
						}
					})
				},
				fail: function (res) {
					utils.showToast('暂不支持此文件预览', 1000);
				}
			})
		}
	},
    audioPlay: function(e) {
        var that = this;
        this.audioCtx.play()
    },
    audioPause: function(e) {
        var that = this;
        that.setData({
            agendaState: false,
			progress: 0,
			currentTime: 0,
			duration: 0,
        })
        this.audioCtx.pause()
    },
    audioSeek: function(number) {
        this.audioCtx.seek(number)
		this.audioCtx.play()
    },
    musicStart: function(e) {
        var progress = parseInt((parseInt(e.detail.currentTime) / parseInt(e.detail.duration)) * 100)
        var that = this
        that.setData({
            currentTime: parseInt(e.detail.currentTime),
            duration: parseInt(e.detail.duration),
            progress: progress
        })
    },
    slider4change: function(e) {
		this.audioSeek(e.detail.value)
    },
	sliderChangeing: function (e) {
		this.audioCtx.pause()
	}
})