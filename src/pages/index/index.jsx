import React from "react";
import { View, Button } from "@tarojs/components";
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
      <Button type="primary" onClick={handleTake}>
        拍照
      </Button>
      <Button type="warn" onClick={handleSelect}>
        从相册中选择
      </Button>
    </View>
  );
}
