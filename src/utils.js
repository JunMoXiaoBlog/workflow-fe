// 修改 utils.js 文件中的 generateUUID 函数，生成纯32位字符串而不带前缀后缀

// 工具函数文件

// 生成纯32位字符串形式的唯一ID（不带前缀和后缀）
export const generateUUID = () => {
  // 生成32位的随机字符串
  return Array.from({ length: 32 }, () => {
    const randomChar = Math.floor(Math.random() * 16).toString(16);
    return randomChar;
  }).join("");
};
