import React from "react";
import { View, Button, Image } from "@tarojs/components";
import app1 from "../../assets/hi_measure.png";
import Taro from "@tarojs/taro";

import "./index.scss";

export default function Index(props) {
  const handleTake = () => {
    Taro.chooseImage({
      sizeType: "original",
      sourceType: ["camera"],
      count: 1,
      success({ tempFilePaths }) {
        Taro.navigateTo({
          url: `/pages/drawer/drawer?path=${tempFilePaths[0]}`,
        });
      },
    });
  };
  const handleSelect = () => {
    Taro.chooseImage({
      sizeType: "original",
      sourceType: ["album"],
      count: 1,
      success({ tempFilePaths }) {
        Taro.navigateTo({
          url: `/pages/drawer/drawer?path=${tempFilePaths[0]}`,
        });
      },
    });
  };

  return (
    <View className="index">
      <View className="index_bg"></View>
      <Button
        style={{ background: "brown" }}
        type="primary"
        onClick={handleTake}
      >
        拍照
      </Button>
      <Button type="warn" onClick={handleSelect}>
        从相册中选择
      </Button>
      <Image
        className="app"
        src={app1}
        onClick={() =>
          Taro.navigateToMiniProgram({
            appId: "wx6279152a939aa90d",
          })
        }
      />
    </View>
  );
}
