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
      showCtx: true,
      filePath: path,
    };
  }

  onReady() {
    Taro.showShareMenu({
      withShareTicket: true,
      success() {},
    });
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
              this.ctx.draw(true, () => {
                Taro.canvasToTempFilePath({
                  x: 0,
                  y: 0,
                  width,
                  height,
                  destWidth: width,
                  destHeight: height,
                  canvasId: "treasure_canvas",
                  success: ({ tempFilePath }) => {
                    this.setState({
                      filePath: tempFilePath,
                    });
                  },
                });
              });
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
      image: { width, height },
    } = this.state;

    this.setState(
      {
        isOpened: false,
        fonts: "",
        showCtx: true,
      },
      () => {
        this.ctx.setFontSize(12);
        this.ctx.setFillStyle("red");
        this.ctx.fillText(fonts, x, y, width);
        this.ctx.draw(true, () => {
          Taro.canvasToTempFilePath({
            x: 0,
            y: 0,
            width,
            height,
            destWidth: width,
            destHeight: height,
            canvasId: "treasure_canvas",
            success: (res) => {
              this.setState({
                filePath: res.tempFilePath,
              });
            },
          });
        });
      }
    );
  };

  handleOk2 = () => {
    const {
      point1,
      point2,
      length,
      image: { width, height },
    } = this.state;
    this.setState(
      {
        isOpened2: false,
        length: "",
        showCtx: true,
      },
      () => {
        this.drawArrow(point1.x, point1.y, point2.x, point2.y);
        this.ctx.setFontSize(12);
        this.ctx.setFillStyle("red");
        this.ctx.fillText(
          length,
          (point1.x + point2.x - this.ctx.measureText(length).width) / 2,
          (point1.y + point2.y) / 2 - 8
        );

        this.ctx.draw(true, () => {
          Taro.canvasToTempFilePath({
            x: 0,
            y: 0,
            width,
            height,
            destWidth: width,
            destHeight: height,
            canvasId: "treasure_canvas",
            success: (res) => {
              this.setState({
                filePath: res.tempFilePath,
              });
            },
          });
        });
      }
    );
    this.isMove = false;
  };

  drawArrow = (
    fromX,
    fromY,
    toX,
    toY,
    theta = 30,
    headlen = 10,
    width = 1,
    color = "red"
  ) => {
    var angle = (Math.atan2(fromY - toY, fromX - toX) * 180) / Math.PI,
      angle1 = ((angle + theta) * Math.PI) / 180,
      angle2 = ((angle - theta) * Math.PI) / 180,
      topX = headlen * Math.cos(angle1),
      topY = headlen * Math.sin(angle1),
      botX = headlen * Math.cos(angle2),
      botY = headlen * Math.sin(angle2);
    this.ctx.save();
    this.ctx.beginPath();
    var arrowX = fromX - topX,
      arrowY = fromY - topY;
    this.ctx.moveTo(arrowX, arrowY);
    this.ctx.lineTo(fromX, fromY);
    arrowX = fromX - botX;
    arrowY = fromY - botY;
    this.ctx.lineTo(arrowX, arrowY);
    this.ctx.moveTo(fromX, fromY);
    this.ctx.lineTo(toX, toY);
    // Reverse length on the other side
    arrowX = toX + topX;
    arrowY = toY + topY;
    this.ctx.moveTo(arrowX, arrowY);
    this.ctx.lineTo(toX, toY);
    arrowX = toX + botX;
    arrowY = toY + botY;
    this.ctx.lineTo(arrowX, arrowY);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.stroke();
    this.ctx.restore();
  };

  handleSave = () => {
    const { filePath } = this.state;
    Taro.getSetting({
      success: ({ authSetting }) => {
        if (authSetting["scope.writePhotosAlbum"]) {
          Taro.saveImageToPhotosAlbum({
            filePath,
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
                filePath,
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
  };

  render() {
    const {
      image,
      isOpened,
      fonts,
      isOpened2,
      length,
      showCtx,
      point1,
      filePath,
    } = this.state;
    return (
      <View className="drawer">
        <View className="content">
          {image && (
            <Canvas
              style={{ ...image, display: showCtx ? "block" : "none" }}
              canvasId="treasure_canvas"
              onTouchEnd={(e) => {
                if (this.isMove) {
                  this.setState({
                    isOpened2: true,
                    point2: e.changedTouches[0],
                    showCtx: false,
                  });
                } else {
                  this.setState({
                    isOpened: true,
                    point1: e.changedTouches[0],
                    showCtx: false,
                  });
                }
              }}
              onTouchMove={(e) => {
                this.isMove = true;
                this.ctx.drawImage(filePath, 0, 0, image.width, image.height);
                this.drawArrow(
                  point1.x,
                  point1.y,
                  e.changedTouches[0].x,
                  e.changedTouches[0].y
                );
                this.ctx.draw(true);
              }}
              onTouchStart={(e) => {
                this.setState({ point1: e.changedTouches[0] });
              }}
            ></Canvas>
          )}
        </View>
        <View className="footer">
          <Button
            type="warn"
            onClick={() => {
              this.ctx.drawImage(this.path, 0, 0, image.width, image.height);
              this.ctx.draw(true);
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
                  this.setState({ isOpened: false, fonts: "", showCtx: true });
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
                type="text"
                value={length}
                placeholder="请输入尺寸"
                onInput={(e) => this.setState({ length: e.detail.value })}
              />
            </AtModalContent>
            <AtModalAction>
              <Button
                onClick={() => {
                  this.setState({
                    isOpened2: false,
                    length: "",
                    showCtx: true,
                  });
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
