//logs.js
const app = getApp()
const utils = require('../../../utils/util.js')
Page({
    data: {
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
    uploadimage: function() {
        var that = this;
        dd.chooseImage({ //选择图片
            count: 1,
            sizeType: ['original', 'compressed'],
            success(res) {
                const tempFiles = res.tempFilePaths
                console.log(tempFiles[0])
                //把选择的图片 添加到集合里
                var upload_picture_list = [];
                for (var i in tempFiles) {
                    upload_picture_list.push(tempFiles[i])
                }
                //显示
                that.setData({
                    upload_picture_list: tempFiles[0],
                });
                dd.uploadFile({ //上传文件
                    url: utils.setURL('/upload/image'), // 仅为示例，非真实的接口地址
                    filePath: tempFiles[0],
                    name: 'file',
                    header: {
                        "Content-Type": "multipart/form-data;charset=UTF-8",
                        "platform": 'APPLET',
                    },
                    success(res) {
                        var json = JSON.parse(res.data);
                        if (json.status == '0000') {
                            that.setData({
                                uploadData: json.res_data
                            })
                            that.confirm();
                        } else {
                            utils.showToast(json.message,1000);
                        }
                    }
                })
            }
        })
    },
	uploadVideo:function(){
		dd.chooseVideo({
			sourceType: ['album', 'camera'],
			maxDuration: 60,
			camera: 'back',
			success(res) {
				console.log(res.tempFilePath)
			}
		})
	},
	uploadFile: function () {
		dd.chooseMessageFile({
			count: 10,
			// type: 'file',
			success(res) {
				// tempFilePath可以作为img标签的src属性显示图片
				const tempFilePaths = res.tempFilePaths
			},
			fail(res) {
				utils.showToast(res,1000)
			}
		})
	}
})