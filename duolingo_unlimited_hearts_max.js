// duolingo_unlimited_hearts_max.js
// Duolingo Unlimited Hearts + Max - Stash MitM Response Body Script
// 适用：Stash http.script / type: response / require-body: true
// 目标：拦截 Duolingo /YYYY-MM-DD/users/... 接口，并修改用户数据

(function () {
  'use strict';

  // 1. 读取响应体
  const body = $response && $response.body;
  if (!body) {
    // 没有 body，直接放行
    $done({});
    return;
  }

  let data;
  try {
    data = JSON.parse(body);
  } catch (e) {
    // 不是 JSON，放行
    $done({});
    return;
  }

  // 2. 调试日志：修改前
  try {
    console.log(
      '[DL_MITM] before patch:',
      'hasPlus =', data && data.hasPlus,
      'unlimitedHearts =', data && data.health && data.health.unlimitedHeartsAvailable,
      'tracking.has_item_gold_subscription =',
      data && data.trackingProperties && data.trackingProperties.has_item_gold_subscription
    );
  } catch (e) {}

  // 3. 自定义 Max 订阅条目
  const CUSTOM_SHOP_ITEMS = {
    gold_subscription: {
      itemName: "gold_subscription",
      subscriptionInfo: {
        vendor: "STRIPE",
        renewing: true,
        isFamilyPlan: true,
        expectedExpiration: 9999999999000  // 很久以后
      }
    }
  };

  // 4. 实际修改逻辑
  if (data && typeof data === 'object') {

    // 4.1 无限红心
    if (!data.health || typeof data.health !== 'object') {
      data.health = {};
    }
    data.health.unlimitedHeartsAvailable = true;

    // 4.2 Max / Gold 订阅标记
    data.hasPlus = true;

    if (!data.trackingProperties || typeof data.trackingProperties !== 'object') {
      data.trackingProperties = {};
    }
    data.trackingProperties.has_item_gold_subscription = true;

    // 4.3 合并 shopItems（不删除原有）
    if (!data.shopItems || typeof data.shopItems !== 'object') {
      data.shopItems = {};
    }
    data.shopItems = Object.assign({}, data.shopItems, CUSTOM_SHOP_ITEMS);
  }

  // 5. 调试日志：修改后
  try {
    console.log(
      '[DL_MITM] after  patch:',
      'hasPlus =', data && data.hasPlus,
      'unlimitedHearts =', data && data.health && data.health.unlimitedHeartsAvailable,
      'tracking.has_item_gold_subscription =',
      data && data.trackingProperties && data.trackingProperties.has_item_gold_subscription
    );
  } catch (e) {}

  // 6. 写回响应
  const newBody = JSON.stringify(data);
  $done({ body: newBody });
})();

