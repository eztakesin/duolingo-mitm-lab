// duolingo_unlimited_hearts_max.js
// 结合 Duolingo Web API 文档的通用补丁脚本

(function () {
  'use strict';

  const rawBody = $response && $response.body;
  if (!rawBody) {
    $done({});
    return;
  }

  let data;
  try {
    data = JSON.parse(rawBody);
  } catch (e) {
    $done({});
    return;
  }

  // ---- 打补丁的核心函数：传入一个“疑似用户对象” ----
  function patchUser(user) {
    if (!user || typeof user !== 'object') return;

    // 1) 无限红心（health）
    if (user.health && typeof user.health === 'object') {
      user.health.unlimitedHeartsAvailable = true;
    }

    // 2) Plus / Max 标记
    user.hasPlus = true;

    if (!user.trackingProperties || typeof user.trackingProperties !== 'object' || Array.isArray(user.trackingProperties)) {
      user.trackingProperties = {};
    }
    user.trackingProperties.has_item_gold_subscription = true;

    // 如果有类似 plusTier / plusLevel，可在这里补上（字段名需根据你抓到的 JSON 确认）
    // if (!user.trackingProperties.plus_tier) {
    //   user.trackingProperties.plus_tier = 'MAX';
    // }

    // 3) 订阅 / shopItems / subscriptionInfo
    const now = Date.now();
    const YEARS = 20;
    const FUTURE = now + YEARS * 365 * 24 * 60 * 60 * 1000; // 20 年后

    const CUSTOM_SHOP_ITEMS = {
      gold_subscription: {
        itemName: 'gold_subscription',
        subscriptionInfo: {
          vendor: 'STRIPE',
          renewing: true,
          isFamilyPlan: true,
          expectedExpiration: FUTURE
        }
      }
    };

    if (!user.shopItems || typeof user.shopItems !== 'object' || Array.isArray(user.shopItems)) {
      user.shopItems = {};
    }
    user.shopItems = Object.assign({}, user.shopItems, CUSTOM_SHOP_ITEMS);

    if (!user.subscriptionInfo || typeof user.subscriptionInfo !== 'object') {
      user.subscriptionInfo = {};
    }
    user.subscriptionInfo.active = true;
    user.subscriptionInfo.expiration = FUTURE;

    // 如果文档里有其它关键字段（比如 isPlusSubscriber、subscriptionStatus），也可在这里补
    // user.subscriptionStatus = 'ACTIVE';
  }

  // ---- 根据真实返回的多种结构，尽可能找到“用户对象”并打补丁 ----

  function process(obj) {
    if (!obj || typeof obj !== 'object') return;

    // 直接是用户对象的情况
    if (!Array.isArray(obj)) {
      patchUser(obj);
    }

    // 常见结构之一：{ user: {...} }
    if (obj.user && typeof obj.user === 'object') {
      patchUser(obj.user);
    }

    // 如果有 { users: [...] } 或 { data: {...} } 之类，可以扩展：
    if (Array.isArray(obj.users)) {
      obj.users.forEach(patchUser);
    }
    if (obj.data && typeof obj.data === 'object') {
      process(obj.data);
    }
  }

  if (Array.isArray(data)) {
    data.forEach(process);
  } else {
    process(data);
  }

  // ---- 调试标记，方便你在浏览器 Network 里确认脚本是否运行 ----
  try {
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      data._patchedByStash = 'YES';
    }
  } catch (_) {}

  let newBody;
  try {
    newBody = JSON.stringify(data);
  } catch (e) {
    $done({});
    return;
  }

  $done({ body: newBody });
})();
