//logs.js
const app = getApp()
const utils = require('../../../utils/util.js')
var imgBase64 = '';
Page({
    data: {
        accessToken: '',
        upload_picture_list: '',
        scanImg: '',
        src: '',
        width: 250, //宽度
        height: 250, //高度
        max_width: 400,
        max_height: 400,
        disable_rotate: true, //是否禁用旋转
        disable_ratio: false, //锁定比例
        limit_move: true, //是否限制移动
        cropperWrap: false,
        imgBase64: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.cropper = this.selectComponent("#image-cropper");
        this.faceImg();
        // this.accessToken();
    },
	onGetCode: function (e) {
		this.setData({
			cropperWrap: e.detail.cropperWrap
		})
	},
    cropperload(e) {
        console.log('cropper加载完成');
    },
    loadimage(e) {
        dd.hideLoading();
        console.log('图片');
        this.cropper.imgReset();
    },
    clickcut(e) {
        console.log(e.detail);
        //图片预览
        dd.previewImage({
            current: e.detail.url, // 当前显示图片的http链接
            urls: [e.detail.url] // 需要预览的图片http链接列表
        })
    },
    upload() {
        let that = this;
        dd.chooseImage({
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            success(res) {
                dd.showLoading({
                    title: '加载中',
                })
                const tempFilePaths = res.tempFilePaths[0];
                //重置图片角度、缩放、位置
                that.cropper.imgReset();
                that.setData({
                    src: tempFilePaths
                });
			}, fail(res){
				that.setData({
					cropperWrap: false
				});
			}, complete(res){
				that.setData({
					cropperWrap: false
				});
			}
        })
    },
    setWidth(e) {
        this.setData({
            width: e.detail.value < 10 ? 10 : e.detail.value
        });
        this.setData({
            cut_left: this.cropper.data.cut_left
        });
    },
    setHeight(e) {
        this.setData({
            height: e.detail.value < 10 ? 10 : e.detail.value
        });
        this.setData({
            cut_top: this.cropper.data.cut_top
        });
    },
    switchChangeDisableRatio(e) {
        //设置宽度之后使剪裁框居中
        this.setData({
            disable_ratio: e.detail.value
        });
    },
    setCutTop(e) {
        this.setData({
            cut_top: e.detail.value
        });
        this.setData({
            cut_top: this.cropper.data.cut_top
        });
    },
    setCutLeft(e) {
        this.setData({
            cut_left: e.detail.value
        });
        this.setData({
            cut_left: this.cropper.data.cut_left
        });
    },
    switchChangeDisableRotate(e) {
        //开启旋转的同时不限制移动
        if (!e.detail.value) {
            this.setData({
                limit_move: false,
                disable_rotate: e.detail.value
            });
        } else {
            this.setData({
                disable_rotate: e.detail.value
            });
        }
    },
    switchChangeLimitMove(e) {
        //限制移动的同时锁定旋转
        if (e.detail.value) {
            this.setData({
                disable_rotate: true
            });
        }
        this.cropper.setLimitMove(e.detail.value);
    },
    switchChangeDisableWidth(e) {
        this.setData({
            disable_width: e.detail.value
        });
    },
    switchChangeDisableHeight(e) {
        this.setData({
            disable_height: e.detail.value
        });
    },
    submit() {
        var that = this;
        this.cropper.getImg((obj) => {
            app.globalData.imgSrc = obj.url;
            this.setData({
                cropperWrap: false,
                upload_picture_list: obj.url
            })
            console.log(obj.url);
            dd.getFileSystemManager().readFile({
                filePath: obj.url, //选择图片返回的相对路径
                encoding: 'base64', //编码格式
                success: res => { //成功的回调
                    // console.log('data:image/png;base64,' + res.data)
                    that.setData({
                        imgBase64: true
                    })
                    imgBase64 = res.data;
                    // that.faceverify(res.data)
                    // that.faceRegister()
                }
            })
        });
    },
    faceRegister: function() {
        dd.showLoading({
            title: '人脸采集中',
        })
        var that = this;
        var sendData = {
            image: imgBase64,
            phone: app.globalData.loginInfo.userPhone,
            userId: app.globalData.loginInfo.userId,
            userName: app.globalData.loginInfo.userName,
			groupId: app.globalData.faceType
        }
        var callBack = {
            success: function(e) {
                if (e.data.status == '0000') {
                    // utils.showToast('采集成功', 3000);
                    // setTimeout(function() {
                    //     dd.navigateBack({
                    //         delta: -1
                    //     })
                    // }, 3000)
                    dd.confirm({
                        title: '采集成功',
                        showCancel: false,
                        content: '您的人脸信息已经完成采集。之后就可以在支持的设备上刷脸开门啦。',
                        confirmButtonText: '确认',
                        confirmColor: '#2B7AFB',
                        success(res) {
                            if (res.confirm) {
                                dd.navigateBack({
                                    delta: -1
                                })
                            } else if (res.cancel) {

                            }
                        }
                    })
                } else {
                    // utils.showToast(e.data.message, 3000)
                    dd.confirm({
                        title: '采集失败',
                        showCancel: false,
                        content: '无法识别到人脸，请重新拍照或选择别的相片上传',
                        confirmButtonText: '确认',
                        confirmColor: '#2B7AFB',
                        success(res) {
                            if (res.confirm) {
                                //   dd.navigateBack({
                                // 	  delta: -1
                                //   })
                            } else if (res.cancel) {

                            }
                        }
                    })
                }
                dd.hideLoading()
            },
            fail: function(e) {
                utils.showToast(e.errMsg, 3000)
                dd.hideLoading()
            }
        }
        utils.ajax(utils.setURL('/face/register'), sendData, callBack);
    },
    faceImg: function() {
        var that = this;
        var sendData = {}
        var callBack = {
            success: function(e) {
                if (e.data.status == '0000') {
                    that.setData({
                        upload_picture_list: e.data.res_data.faceUrl
                    })
                }
            },
            fail: function(e) {}
        }
        utils.ajax(utils.setURL('/face/' + app.globalData.loginInfo.userId), sendData, callBack, 'GET');
    },
    rotate() {
        //在用户旋转的基础上旋转90°
        this.cropper.setAngle(this.cropper.data.angle += 90);
    },
    top() {
        this.data.top = setInterval(() => {
            this.cropper.setTransform({
                y: -3
            });
        }, 1000 / 60)
    },
    bottom() {
        this.data.bottom = setInterval(() => {
            this.cropper.setTransform({
                y: 3
            });
        }, 1000 / 60)
    },
    left() {
        this.data.left = setInterval(() => {
            this.cropper.setTransform({
                x: -3
            });
        }, 1000 / 60)
    },
    right() {
        this.data.right = setInterval(() => {
            this.cropper.setTransform({
                x: 3
            });
        }, 1000 / 60)
    },
    narrow() {
        this.data.narrow = setInterval(() => {
            this.cropper.setTransform({
                scale: -0.02
            });
        }, 1000 / 60)
    },
    enlarge() {
        this.data.enlarge = setInterval(() => {
            this.cropper.setTransform({
                scale: 0.02
            });
        }, 1000 / 60)
    },
    end(e) {
        clearInterval(this.data[e.currentTarget.dataset.type]);
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
    cancel: function() {
        var that = this;
        var sendData = {
            userId: app.globalData.loginInfo.userId
        }
        var callBack = {
            success: function(e) {
                if (e.data.status == '0000') {
                    dd.redirectTo({
                        url: '../companyId/companyId',
                    })
                } else {
                    utils.showToast(e.data.message,1000);
                }
            },
            fail: function(e) {
                utils.showToast(e.data.errMsg,1000);
            }
        }
        var url = '/companies/apply/' + app.globalData.loginInfo.userId;
        utils.ajax(utils.setURL(url), sendData, callBack, 'DELETE');
    },
    uploadimage: function() {
        var that = this;
        var accessToken = that.data.accessToken;
        // dd.chooseImage({ //选择图片
        //     count: 1,
        //     sizeType: ['original', 'compressed'],
        //     sourceType: ['camera'],
        //     camera: 'front',
        //     success(res) {
        //         dd.showLoading({
        //             title: '人像检测中',
        //         })
        //         const tempFiles = res.tempFilePaths
        //         // console.log(tempFiles[0])
        //         //把选择的图片 添加到集合里
        //         var upload_picture_list = [];
        //         for (var i in tempFiles) {
        //             upload_picture_list.push(tempFiles[i])
        //         }
        //         //显示
        //         that.setData({
        //             upload_picture_list: tempFiles[0],
        //         });
        // 		console.log(tempFiles[0]);
        //         dd.getFileSystemManager().readFile({
        //             filePath: res.tempFilePaths[0], //选择图片返回的相对路径
        //             encoding: 'base64', //编码格式
        //             success: res => { //成功的回调
        //                 // console.log('data:image/png;base64,' + res.data)
        //                 that.faceverify(res.data)
        //             }
        //         })
        //     }
        // })
        that.cropper.upload(); //上传图片
        that.setData({
            cropperWrap: true
        })
    },
    faceverify: function(imageUrl) {
        var that = this;
        var urlVal = 'https://aip.baidubce.com/rest/2.0/face/v3/faceverify?access_token=' + that.data.accessToken;
        var list = [{
            "image": imageUrl,
            "image_type": "BASE64",
            "face_field": "age,beauty,quality,occlusion"
        }];
        var sendData = {
            image: imageUrl,
            image_type: 'URL'
        };
        // list.push(sendData);
        dd.request({
            url: urlVal,
            method: 'POST',
            data: JSON.stringify(list),
            header: {
                "Content-Type": "application/json;charset=utf-8",
            },
            success: function(res) {
                dd.hideLoading()
                if (res.data.error_code == '0') {
                    var result = res.data.result.face_list;
                    if (res.data.result.face_liveness == 0) {
                        utils.showToast('未检测到活体，请重新选择', 2000);
                    } else if (result[0].face_probability <= 0.6) {
                        utils.showToast('检测到人脸的概率比较小,请重新选择', 2000);
                    } else if (result[0].quality.occlusion.left_eye >= 0.6) {
                        utils.showToast('检测左眼被遮挡，请重新选择', 2000);
                    } else if (result[0].quality.occlusion.right_eye >= 0.6) {
                        utils.showToast('检测右眼被遮挡，请重新选择', 2000);
                    } else if (result[0].quality.occlusion.nose >= 0.7) {
                        utils.showToast('检测鼻子被遮挡，请重新选择', 2000);
                    } else if (result[0].quality.occlusion.mouth >= 0.7) {
                        utils.showToast('检测嘴巴被遮挡，请重新选择', 2000);
                    } else if (result[0].quality.occlusion.left_check >= 0.8) {
                        utils.showToast('检测左脸颊被遮挡，请重新选择', 2000);
                    } else if (result[0].quality.occlusion.right_check >= 0.8) {
                        utils.showToast('检测右脸颊被遮挡，请重新选择', 2000);
                    } else if (result[0].quality.occlusion.chin_contour >= 0.6) {
                        utils.showToast('检测下巴被遮挡，请重新选择', 2000);
                    } else if (result[0].quality.blur >= 0.7) {
                        utils.showToast('检测图片不够清晰,请重新选择', 2000);
                    } else if (result[0].quality.illumination <= 40) {
                        utils.showToast('检测图片光线昏暗,请重新选择', 2000);
                    } else if (result[0].angle.yaw > 20 || result[0].angle.pitch > 20 || result[0].angle.roll > 20) {
                        utils.showToast('检测人像姿态角度不对,请重新选择', 2000);
                    } else if (result[0].quality.completeness == 0) {
                        utils.showToast('检测人像溢出边界,请重新选择', 2000);
                    } else if (result[0].location.width <= 100 || result[0].location.height <= 100) {
                        utils.showToast('检测人像小于100*100像素,请重新选择', 2000);
                    } else {
                        utils.showToast('人脸检测成功', 1000)
                        that.faceConfirm(imageUrl);
                    }
                } else {
                    utils.showToast('未检测到人脸，请重新选择', 1000)
                }
                console.log(res)
            },
            fail: function(res) {
                callback.fail(res);
            }
        })
    },
    faceConfirm: function(imageUrl) {
        var that = this;
        var sendData = {
            image: imageUrl,
            image_type: 'BASE64',
            group_id: 123,
            user_id: app.globalData.loginInfo.userId
        }
        var urlVal = 'https://aip.baidubce.com/rest/2.0/face/v3/faceset/user/add?access_token=' + that.data.accessToken;
        dd.request({
            url: urlVal,
            method: 'POST',
            data: JSON.stringify(sendData),
            header: {
                "Content-Type": "application/json;charset=utf-8",
            },
            success: function(res) {
                if (res.data.error_code == 0) {
                    utils.showToast('人脸采集成功', 2000)
                } else {
                    utils.showToast(res.data.error_msg, 2000)
                }
            },
            fail: function(res) {
                callback.fail(res);
            }
        })

    },
    accessToken: function() {
        var that = this;
        var urlVal = 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=MEmqUkNEy72qPLEK2YmizWba&client_secret=h8GYMIBrkqF5U6MT9jPDovoaCVu7cepl&';
        var sendData = {};
        dd.request({
            url: urlVal,
            method: 'GET',
            data: JSON.stringify(sendData),
            header: {
                "Content-Type": "application/json;charset=utf-8",
            },
            success: function(res) {
                var token = res.data.access_token;
                that.setData({
                    accessToken: token
                })
            },
            fail: function(res) {
                callback.fail(res);
            }
        })
    }
})