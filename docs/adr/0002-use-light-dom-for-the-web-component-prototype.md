---
status: accepted
---

# Use Light DOM for the Web Component prototype

The first TrChat Web Component prototype will render into Light DOM and load an explicit `@opentiny/tiny-robot-chat/experimental.css` stylesheet. This keeps the validation focused on TrChat behavior because the existing component tree relies on extracted styles, CSS variables, popovers, and Teleport targets outside an individual component root.

Shadow DOM remains a separately reported follow-up. The prototype must measure global-style leakage and selector collisions rather than implying that Light DOM provides style encapsulation.
