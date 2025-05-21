import React from "react";

// 自定义横纵相间点状背景组件
const GridBackground = ({
  size = 16,
  color = "#c0c0c0",
  bgColor = "#f0f0f0",
}) => {
  // 使用SVG来创建横纵相间的点阵
  const svgPattern = `
    <svg width="${size * 2}" height="${
    size * 2
  }" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size / 2}" cy="${size / 2}" r="1" fill="${color}" />
      <circle cx="${size + size / 2}" cy="${
    size + size / 2
  }" r="1" fill="${color}" />
    </svg>
  `;

  // 将SVG转换为Base64格式的DataURL
  const svgBase64 = btoa(svgPattern);
  const dataUrl = `url("data:image/svg+xml;base64,${svgBase64}")`;

  return (
    <div
      className="grid-background"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: -1,
        backgroundColor: bgColor,
        backgroundImage: dataUrl,
        backgroundRepeat: "repeat",
      }}
    />
  );
};

export default GridBackground;
