# Duolingo MitM Lab

MitM / response-body scripts for Stash, used to experiment with Duolingo API responses  
(e.g. unlimited hearts, experimental subscription flags).

> **For educational and research purposes only.**
>
> - This project is intended to help understand how HTTP/HTTPS, MitM, and app‑backend interactions work.
> - Do **not** use these scripts to gain any unfair advantage, bypass legitimate purchases, or violate Duolingo's Terms of Service.
> - The author and contributors are **not responsible** for any misuse or consequences arising from using this code.

---

使用 Stash 对 Duolingo 接口返回进行修改的 MitM / Response-Body 实验脚本（例如：无限红心、订阅状态标记等）。

> **仅用于学习与教育目的：**
>
> - 仅用于学习 HTTP/HTTPS、代理中间人技术以及客户端与服务端交互原理。
> - 请勿用于获取不正当利益、绕过正规付费渠道，或违反 Duolingo 的服务条款。
> - 代码使用风险自负，作者与贡献者不对任何滥用或由此产生的后果负责。

---

## 功能概览 (Features)

当前仓库包含一个主要脚本：

- `duolingo_unlimited_hearts_max.js`
  - 对 Duolingo 用户数据接口（`/YYYY-MM-DD/users/...`）进行响应体修改：
    - 无限红心：`health.unlimitedHeartsAvailable = true`
    - Max / Gold 订阅标记：
      - `hasPlus = true`
      - `trackingProperties.has_item_gold_subscription = true`
      - 向 `shopItems` 中合并 `gold_subscription` 条目（不删除原有条目）

该脚本设计用于 **Stash 的 `script-providers` + `response-body`** 模式。

---

## 目录结构 (Suggested Structure)

```text
.
├─ duolingo_unlimited_hearts_max.js   # 主脚本：无限红心 + Max
├─ config.yaml                        # MitM Config example 
├─ README.md                          # 使用说明（本文件）
└─ DISCLAIMER.md
```

---

## Additional Disclaimer 额外声明

This repository and its contents are provided **for educational and research purposes only**.

- Do not use any script here to circumvent payments, licensing, or technical protection measures.
- Do not use these scripts in violation of Duolingo's Terms of Service or any applicable laws.
- By using any part of this repository, you agree that **you are solely responsible** for your actions and any consequences.

本仓库仅面向对网络协议与客户端行为研究感兴趣的使用者。  
请在合法合规的前提下，自行决定是否使用本仓库的任何内容。
