// Duolingo Unlimited Hearts + Max - Stash MitM Response Body Script
// 功能：
//   1. 无限红心：health.unlimitedHeartsAvailable = true
//   2. Max 订阅（Gold）：
//      - hasPlus = true
//      - trackingProperties.has_item_gold_subscription = true
//      - shopItems 中合并 gold_subscription

(function () {
  'use strict';

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

  const CUSTOM_SHOP_ITEMS = {
    gold_subscription: {
      itemName: "gold_subscription",
      subscriptionInfo: {
        vendor: "STRIPE",
        renewing: true,
        isFamilyPlan: true,
        expectedExpiration: 9999999999000
      }
    }
  };

  if (data && typeof data === 'object') {

    // 1) 无限红心
    if (data.health && typeof data.health === 'object') {
      data.health.unlimitedHeartsAvailable = true;
    }

    // 2) Max / Gold 订阅标记
    data.hasPlus = true;

    if (!data.trackingProperties || typeof data.trackingProperties !== 'object') {
      data.trackingProperties = {};
    }
    data.trackingProperties.has_item_gold_subscription = true;

    // 3) 合并 shopItems
    if (!data.shopItems || typeof data.shopItems !== 'object') {
      data.shopItems = {};
    }
    data.shopItems = Object.assign({}, data.shopItems, CUSTOM_SHOP_ITEMS);
  }

  const newBody = JSON.stringify(data);
  $done({ body: newBody });
})();

