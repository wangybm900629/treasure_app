import React, { Component } from "react";
import { View, Canvas, Button, Input } from "@tarojs/components";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { AtModal, AtModalHeader, AtModalContent, AtModalAction } from "taro-ui";

import "./drawer.scss";

export default class Drawer extends Component {
  constructor(props) {
    super(props);
    const $instance = getCurrentInstance();
    const { path } = $instance.router.params;
    this.path = path;
    this.ctx = null;
    this.query = null;
    this.state = {
      image: null,
      isOpened: false,
      isOpened2: false,
      fonts: "",
      point1: null,
      length: "",
      point2: null,
    };
  }

  onReady() {
    this.query = Taro.createSelectorQuery();
    this.ctx = Taro.createCanvasContext("treasure_canvas");
    this.query.select(".content").boundingClientRect((rect) => {
      let image = null;
      Taro.getImageInfo({
        src: this.path,
        success: (res) => {
          if (res.width / res.height > rect.width / rect.height) {
            image = {
              width: rect.width,
              height: (rect.width / res.width) * res.height,
            };
          } else {
            image = {
              width: (rect.height / res.height) * res.width,
              height: rect.height,
            };
          }
          const { width, height } = image;
          this.setState(
            {
              image,
            },
            () => {
              this.ctx.drawImage(res.path, 0, 0, width, height);
              this.ctx.draw();
            }
          );
        },
      });
    });
    this.query.exec();
  }

  handleOk1 = () => {
    const {
      fonts,
      point1: { x, y },
      image: { width },
    } = this.state;
    this.ctx.setFontSize(12);
    this.ctx.setFillStyle("red");
    this.ctx.fillText(fonts, x, y, width);
    this.ctx.draw(true);

    this.setState({
      isOpened: false,
      fonts: "",
    });
  };

  handleOk2 = () => {
    const { point1, point2, length } = this.state;
    this.drawLineArrow(point1.x, point1.y, point2.x, point2.y, "red");
    this.drawLineArrow(point2.x, point2.y, point1.x, point1.y, "red");
    this.ctx.setFontSize(12);
    this.ctx.setFillStyle("red");
    this.ctx.fillText(
      length,
      (point1.x + point2.x - this.ctx.measureText(length).width) / 2,
      (point1.y + point2.y) / 2 - 8
    );

    this.ctx.draw(true);
    this.setState({
      isOpened2: false,
      length: "",
    });
    this.isMove = false;
  };

  drawLineArrow = (fromX, fromY, toX, toY, color) => {
    var headlen = 10; //自定义箭头线的长度
    var theta = 45; //自定义箭头线与直线的夹角，个人觉得45°刚刚好
    var arrowX, arrowY; //箭头线终点坐标
    // 计算各角度和对应的箭头终点坐标
    var angle = (Math.atan2(fromY - toY, fromX - toX) * 180) / Math.PI;
    var angle1 = ((angle + theta) * Math.PI) / 180;
    var angle2 = ((angle - theta) * Math.PI) / 180;
    var topX = headlen * Math.cos(angle1);
    var topY = headlen * Math.sin(angle1);
    var botX = headlen * Math.cos(angle2);
    var botY = headlen * Math.sin(angle2);
    this.ctx.beginPath();
    //画直线
    this.ctx.moveTo(fromX, fromY);
    this.ctx.lineTo(toX, toY);

    arrowX = toX + topX;
    arrowY = toY + topY;
    //画上边箭头线
    this.ctx.moveTo(arrowX, arrowY);
    this.ctx.lineTo(toX, toY);

    arrowX = toX + botX;
    arrowY = toY + botY;
    //画下边箭头线
    this.ctx.lineTo(arrowX, arrowY);

    this.ctx.strokeStyle = color;
    this.ctx.stroke();
    this.ctx.draw(true);
  };

  handleSave = () => {
    const {
      image: { width, height },
    } = this.state;
    Taro.canvasToTempFilePath({
      x: 0,
      y: 0,
      width,
      height,
      destWidth: width,
      destHeight: height,
      canvasId: "treasure_canvas",
      success: function (res) {
        Taro.getSetting({
          success: ({ authSetting }) => {
            if (authSetting["scope.writePhotosAlbum"]) {
              Taro.saveImageToPhotosAlbum({
                filePath: res.tempFilePath,
                success() {
                  Taro.showToast({
                    title: "成功",
                    icon: "success",
                    duration: 2000,
                  });
                },
              });
            } else {
              Taro.authorize({
                scope: "scope.writePhotosAlbum",
                success() {
                  Taro.saveImageToPhotosAlbum({
                    filePath: res.tempFilePath,
                    success() {
                      Taro.showToast({
                        title: "成功",
                        icon: "success",
                        duration: 2000,
                      });
                    },
                  });
                },
                fail() {
                  Taro.showModal({
                    content: "您已拒绝，是否重新打开设置",
                    success() {
                      Taro.openSetting();
                    },
                  });
                },
              });
            }
          },
        });
      },
    });
  };

  render() {
    const { image, isOpened, fonts, isOpened2, length } = this.state;
    return (
      <View className="drawer">
        <View className="content">
          {image && (
            <Canvas
              style={{ ...image }}
              canvasId="treasure_canvas"
              onTouchEnd={(e) => {
                if (this.isMove) {
                  this.setState({
                    isOpened2: true,
                    point2: e.changedTouches[0],
                  });
                } else {
                  this.setState({
                    isOpened: true,
                    point1: e.changedTouches[0],
                  });
                }
              }}
              onTouchMove={() => {
                this.isMove = true;
              }}
              onTouchStart={(e) => {
                this.setState({ point1: e.changedTouches[0] });
              }}
              ref="myCanvas"
            ></Canvas>
          )}
        </View>
        <View className="footer">
          <Button
            type="warn"
            onClick={() => {
              this.ctx.drawImage(this.path, 0, 0, image.width, image.height);
              this.ctx.draw();
            }}
          >
            清除
          </Button>
          <Button type="warn" onClick={this.handleSave}>
            保存
          </Button>
        </View>
        {isOpened && (
          <AtModal isOpened>
            <AtModalHeader>输入文字</AtModalHeader>
            <AtModalContent>
              <Input
                type="text"
                value={fonts}
                placeholder="请输入文字"
                onInput={(e) => this.setState({ fonts: e.detail.value })}
              />
            </AtModalContent>
            <AtModalAction>
              <Button
                onClick={() => {
                  this.setState({ isOpened: false, fonts: "" });
                }}
              >
                取消
              </Button>
              <Button onClick={this.handleOk1}>确定</Button>
            </AtModalAction>
          </AtModal>
        )}
        {isOpened2 && (
          <AtModal isOpened className="my_modal">
            <AtModalHeader>输入尺寸</AtModalHeader>
            <AtModalContent>
              <Input
                type="number"
                value={length}
                placeholder="请输入尺寸"
                onInput={(e) => this.setState({ length: e.detail.value })}
              />
            </AtModalContent>
            <AtModalAction>
              <Button
                onClick={() => {
                  this.setState({ isOpened2: false, length: "" });
                  this.isMove = false;
                }}
              >
                取消
              </Button>
              <Button onClick={this.handleOk2}>确定</Button>
            </AtModalAction>
          </AtModal>
        )}
      </View>
    );
  }
}
