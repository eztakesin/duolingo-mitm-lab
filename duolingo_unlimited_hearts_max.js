// Duolingo Unlimited Hearts + Max/Gold Subscription
// 用于 Stash/Surge 等 http-response 脚本

(function () {
  'use strict';

  // ---- 接口范围校验：只处理特定 URL ----
  try {
    const url = $request && $request.url;
    if (!url) {
      $done({});
      return;
    }

    // 匹配形如 /2025-01-12/users/... 的用户数据接口
    const USER_DATA_REGEX = /\/\d{4}-\d{2}-\d{2}\/users\//;

    // 排除商店商品接口
    if (!USER_DATA_REGEX.test(url) || url.includes('/shop-items')) {
      $done({});
      return;
    }
  } catch (_) {
    // 取 URL 失败直接放行
    $done({});
    return;
  }

  // ---- 解析响应体 ----
  const body = $response && $response.body;
  if (!body) {
    $done({});
    return;
  }

  let data;
  try {
    data = JSON.parse(body);
  } catch (e) {
    // 不是 JSON，直接放行
    $done({});
    return;
  }

  // 仅处理“对象”类型（排除数组等）
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    $done({});
    return;
  }

  // ---- 构造更稳妥的未来过期时间（当前时间 + 20 年）----
  const now = Date.now();
  const YEARS = 20;
  const FUTURE_EXPIRATION = now + YEARS * 365 * 24 * 60 * 60 * 1000;

  const CUSTOM_SHOP_ITEMS = {
    gold_subscription: {
      itemName: 'gold_subscription',
      subscriptionInfo: {
        vendor: 'STRIPE',
        renewing: true,
        isFamilyPlan: true,
        expectedExpiration: FUTURE_EXPIRATION
      }
    }
  };

  // ---- 1) 无限红心 ----
  if (!data.health || typeof data.health !== 'object') {
    // 保守做法：如果没有 health，就不强行创建，减少异常字段
    // 如需“无论如何都加”，可改为：
    // data.health = data.health && typeof data.health === 'object' ? data.health : {};
    // 这里按更安全的方式：仅在服务端返回 health 时修改
  } else {
    data.health.unlimitedHeartsAvailable = true;
  }

  // ---- 2) Max / Gold 订阅标记 ----
  // 标记为有 Plus
  data.hasPlus = true;

  // trackingProperties 内的订阅标记
  if (!data.trackingProperties || typeof data.trackingProperties !== 'object' || Array.isArray(data.trackingProperties)) {
    data.trackingProperties = {};
  }
  data.trackingProperties.has_item_gold_subscription = true;

  // 如需进一步伪装为更高等级订阅，可以在这里加：
  // data.trackingProperties.plus_tier = 'MAX';  // 示例字段名，需根据真实返回调整

  // ---- 3) 合并 shopItems ----
  if (!data.shopItems || typeof data.shopItems !== 'object' || Array.isArray(data.shopItems)) {
    data.shopItems = {};
  }
  // 在不破坏原有字段的前提下注入 gold_subscription
  data.shopItems = Object.assign({}, data.shopItems, CUSTOM_SHOP_ITEMS);

  // ---- 回写响应体 ----
  let newBody;
  try {
    newBody = JSON.stringify(data);
  } catch (e) {
    // 序列化异常则放行原始响应
    $done({});
    return;
  }

  $done({ body: newBody });
})();
